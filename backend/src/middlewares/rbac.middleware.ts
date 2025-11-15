import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole, ErrorCode } from '../types';
import { logger } from '../utils/logger';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if authenticated user has required role(s)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: ErrorCode.UNAUTHORIZED,
            message: 'Authentication required',
          },
        });
        return;
      }

      // Admin has access to all resources
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `User ${req.user.userId} with role ${req.user.role} attempted to access resource requiring roles: ${allowedRoles.join(', ')}`
        );

        res.status(403).json({
          success: false,
          error: {
            code: ErrorCode.FORBIDDEN,
            message: 'You do not have permission to access this resource',
            details: {
              requiredRoles: allowedRoles,
              userRole: req.user.role,
            },
          },
        });
        return;
      }

      // User has required role, proceed
      next();
    } catch (error) {
      logger.error('Authorization middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Internal server error during authorization',
        },
      });
    }
  };
};

/**
 * Admin-only middleware
 * Shorthand for authorize(UserRole.ADMIN)
 */
export const adminOnly = authorize(UserRole.ADMIN);

/**
 * HOF or Admin middleware
 * Allow Head of Finance or Admin
 */
export const hofOrAdmin = authorize(UserRole.HOF, UserRole.ADMIN);

/**
 * Account Manager or higher middleware
 * Allow Account Manager, HOF, or Admin
 */
export const accountManagerOrHigher = authorize(
  UserRole.ACCOUNT_MANAGER,
  UserRole.HOF,
  UserRole.ADMIN
);

/**
 * Check if user is accessing their own resource
 */
export const checkResourceOwnership = (getUserIdFromParams: (req: AuthRequest) => string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: ErrorCode.UNAUTHORIZED,
            message: 'Authentication required',
          },
        });
        return;
      }

      const resourceUserId = getUserIdFromParams(req);

      // Admin can access any resource
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // Check if user is accessing their own resource
      if (req.user.userId !== resourceUserId) {
        res.status(403).json({
          success: false,
          error: {
            code: ErrorCode.FORBIDDEN,
            message: 'You can only access your own resources',
          },
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Resource ownership check error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Internal server error during authorization',
        },
      });
    }
  };
};

// Export wrapper function for backward compatibility with array syntax
// Accepts both string arrays and UserRole arrays
export const requireRole = (allowedRoles: (UserRole | string)[]) => {
  return authorize(...(allowedRoles as UserRole[]));
};
