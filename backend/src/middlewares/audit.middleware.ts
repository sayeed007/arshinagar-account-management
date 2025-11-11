import { Response, NextFunction } from 'express';
import { AuthRequest, AuditAction } from '../types';
import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

/**
 * Create Audit Log Entry
 */
export const createAuditLog = async (
  userId: string,
  action: AuditAction,
  entity: string,
  entityId: string | undefined,
  changes: Record<string, any> | undefined,
  ipAddress: string,
  userAgent?: string
): Promise<void> => {
  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      changes,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    // Log error but don't fail the request
    logger.error('Failed to create audit log:', error);
  }
};

/**
 * Audit Middleware Factory
 * Creates middleware that logs actions to audit trail
 */
export const auditLog = (action: AuditAction, entity: string) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to intercept response
      res.json = function (body: any): Response {
        // Only log if request was successful and user is authenticated
        if (req.user && body.success) {
          const entityId = body.data?.id || body.data?._id || req.params.id;
          const ipAddress = req.ipAddress || 'unknown';
          const userAgent = req.headers['user-agent'];

          // Create audit log asynchronously (don't await)
          createAuditLog(
            req.user.userId,
            action,
            entity,
            entityId,
            body.data,
            ipAddress,
            userAgent
          ).catch((error) => {
            logger.error('Audit log creation failed:', error);
          });
        }

        // Call original json method
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Audit middleware error:', error);
      next(); // Continue even if audit fails
    }
  };
};

/**
 * Audit LOGIN action
 */
export const auditLogin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method
  res.json = function (body: any): Response {
    if (body.success && body.data?.user) {
      const userId = body.data.user.id;
      const ipAddress = req.ipAddress || 'unknown';
      const userAgent = req.headers['user-agent'];

      createAuditLog(
        userId,
        AuditAction.LOGIN,
        'User',
        userId,
        { email: body.data.user.email },
        ipAddress,
        userAgent
      ).catch((error) => {
        logger.error('Login audit log failed:', error);
      });
    }

    return originalJson(body);
  };

  next();
};

/**
 * Audit LOGOUT action
 */
export const auditLogout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user) {
    const ipAddress = req.ipAddress || 'unknown';
    const userAgent = req.headers['user-agent'];

    createAuditLog(
      req.user.userId,
      AuditAction.LOGOUT,
      'User',
      req.user.userId,
      undefined,
      ipAddress,
      userAgent
    ).catch((error) => {
      logger.error('Logout audit log failed:', error);
    });
  }

  next();
};

/**
 * Generic audit middleware for tracking changes
 * Compares request body with existing data to log changes
 */
export const auditChanges = (entity: string) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Store request body for comparison
      const requestBody = { ...req.body };

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method
      res.json = function (body: any): Response {
        if (req.user && body.success) {
          const action = req.method === 'POST' ? AuditAction.CREATE :
                        req.method === 'PUT' || req.method === 'PATCH' ? AuditAction.UPDATE :
                        req.method === 'DELETE' ? AuditAction.DELETE :
                        AuditAction.UPDATE;

          const entityId = body.data?.id || body.data?._id || req.params.id;
          const ipAddress = req.ipAddress || 'unknown';
          const userAgent = req.headers['user-agent'];

          // Log the changes
          const changes = req.method === 'POST' ? requestBody : {
            before: body.data?.before,
            after: requestBody,
          };

          createAuditLog(
            req.user.userId,
            action,
            entity,
            entityId,
            changes,
            ipAddress,
            userAgent
          ).catch((error) => {
            logger.error('Changes audit log failed:', error);
          });
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Audit changes middleware error:', error);
      next();
    }
  };
};
