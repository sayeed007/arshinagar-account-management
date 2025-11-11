import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { AuthRequest, ErrorCode } from '../types';
import { logger } from '../utils/logger';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'No authentication token provided',
        },
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Invalid authentication token',
        },
      });
      return;
    }

    // Verify token
    try {
      const decoded = verifyAccessToken(token);

      // Attach user info to request
      req.user = decoded;

      // Extract IP address
      req.ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown';

      next();
    } catch (error: any) {
      // Token verification failed
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          error: {
            code: ErrorCode.TOKEN_EXPIRED,
            message: 'Authentication token has expired',
          },
        });
        return;
      }

      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          error: {
            code: ErrorCode.INVALID_TOKEN,
            message: 'Invalid authentication token',
          },
        });
        return;
      }

      // Other errors
      logger.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authentication failed',
        },
      });
      return;
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error during authentication',
      },
    });
  }
};

/**
 * Optional Authentication Middleware
 * Verifies token if provided but doesn't fail if not present
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;

      req.ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown';
    } catch (error) {
      // Invalid token, but continue anyway
      logger.warn('Optional authentication failed:', error);
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    next(); // Continue even if error occurs
  }
};
