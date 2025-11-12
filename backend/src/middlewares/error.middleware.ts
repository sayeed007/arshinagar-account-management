import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ErrorCode } from '../types';
import { logger } from '../utils/logger';
import { isMongoDBDuplicateError } from '../utils/typeGuards';

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: any;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose Validation Errors
 */
const handleValidationError = (error: MongooseError.ValidationError) => {
  const errors: Record<string, string> = {};

  Object.keys(error.errors).forEach((key) => {
    errors[key] = error.errors[key].message;
  });

  return new ApiError(
    400,
    ErrorCode.VALIDATION_ERROR,
    'Validation failed',
    errors
  );
};

/**
 * Handle Mongoose Duplicate Key Errors
 */
const handleDuplicateKeyError = (error: { code: number; keyValue: Record<string, unknown> }) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];

  return new ApiError(
    409,
    ErrorCode.DUPLICATE_ENTRY,
    `${field} '${value}' already exists`,
    { field, value }
  );
};

/**
 * Handle Mongoose Cast Errors
 */
const handleCastError = (error: MongooseError.CastError) => {
  return new ApiError(
    400,
    ErrorCode.VALIDATION_ERROR,
    `Invalid ${error.path}: ${error.value}`,
    { path: error.path, value: error.value }
  );
};

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let apiError: ApiError;

  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  // Handle different error types
  if (error instanceof ApiError) {
    apiError = error;
  } else if (error.name === 'ValidationError') {
    apiError = handleValidationError(error);
  } else if (isMongoDBDuplicateError(error)) {
    apiError = handleDuplicateKeyError(error);
  } else if (error.name === 'CastError') {
    apiError = handleCastError(error);
  } else if (error.name === 'JsonWebTokenError') {
    apiError = new ApiError(
      401,
      ErrorCode.INVALID_TOKEN,
      'Invalid authentication token'
    );
  } else if (error.name === 'TokenExpiredError') {
    apiError = new ApiError(
      401,
      ErrorCode.TOKEN_EXPIRED,
      'Authentication token has expired'
    );
  } else {
    // Generic error
    apiError = new ApiError(
      error.statusCode || 500,
      ErrorCode.INTERNAL_ERROR,
      error.message || 'Internal server error'
    );
  }

  // Send error response
  res.status(apiError.statusCode).json({
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details && { details: apiError.details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
      }),
    },
  });
};

/**
 * Handle 404 Not Found
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(
    404,
    ErrorCode.NOT_FOUND,
    `Route ${req.originalUrl} not found`
  );
  next(error);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
