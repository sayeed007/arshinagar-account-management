import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { ErrorCode } from '../types';

/**
 * Validation Result Handler
 * Checks for validation errors and returns them in a consistent format
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors: Record<string, string> = {};

    errors.array().forEach((error: any) => {
      if (error.path) {
        formattedErrors[error.path] = error.msg;
      }
    });

    res.status(400).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: formattedErrors,
      },
    });
    return;
  }

  next();
};

/**
 * Validation Helper
 * Combines validation chains with error handling
 */
export const validate = (validations: ValidationChain[]) => {
  return [...validations, handleValidationErrors];
};

/**
 * Login Validation Rules
 */
export const loginValidation: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

/**
 * Register Validation Rules
 */
export const registerValidation: ValidationChain[] = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['Admin', 'AccountManager', 'HOF'])
    .withMessage('Invalid role. Must be Admin, AccountManager, or HOF'),
];

/**
 * Refresh Token Validation Rules
 */
export const refreshTokenValidation: ValidationChain[] = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string'),
];

/**
 * Update User Validation Rules
 */
export const updateUserValidation: ValidationChain[] = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['Admin', 'AccountManager', 'HOF'])
    .withMessage('Invalid role. Must be Admin, AccountManager, or HOF'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Change Password Validation Rules
 */
export const changePasswordValidation: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

/**
 * MongoDB ObjectId Validation
 */
export const mongoIdValidation = (fieldName: string = 'id'): ValidationChain => {
  return body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage(`Invalid ${fieldName} format`);
};

/**
 * Sanitize Input Middleware
 * Removes potentially harmful characters
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove any HTML tags from string inputs
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove HTML tags
      return value.replace(/<[^>]*>/g, '');
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

/**
 * ========================================
 * Client Validation Rules
 * ========================================
 */

/**
 * Create Client Validation
 */
export const createClientValidation: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Client name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+8801|01)[3-9]\d{8}$/)
    .withMessage('Please provide a valid Bangladeshi phone number'),
  body('alternatePhone')
    .optional()
    .trim()
    .matches(/^(\+8801|01)[3-9]\d{8}$/)
    .withMessage('Please provide a valid Bangladeshi phone number'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5 and 500 characters'),
  body('nid')
    .optional()
    .trim()
    .matches(/^\d{10,17}$/)
    .withMessage('NID must be 10-17 digits'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * Update Client Validation
 */
export const updateClientValidation: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+8801|01)[3-9]\d{8}$/)
    .withMessage('Please provide a valid Bangladeshi phone number'),
  body('alternatePhone')
    .optional()
    .trim()
    .matches(/^(\+8801|01)[3-9]\d{8}$/)
    .withMessage('Please provide a valid Bangladeshi phone number'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5 and 500 characters'),
  body('nid')
    .optional()
    .trim()
    .matches(/^\d{10,17}$/)
    .withMessage('NID must be 10-17 digits'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * ========================================
 * RS Number Validation Rules
 * ========================================
 */

/**
 * Create RS Number Validation
 */
export const createRSNumberValidation: ValidationChain[] = [
  body('rsNumber')
    .trim()
    .notEmpty()
    .withMessage('RS Number is required')
    .toUpperCase(),
  body('projectName')
    .trim()
    .notEmpty()
    .withMessage('Project name is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('totalArea')
    .isFloat({ min: 0.01 })
    .withMessage('Total area must be greater than 0'),
  body('unitType')
    .isIn(['Acre', 'Katha', 'Sq Ft', 'Decimal', 'Bigha'])
    .withMessage('Invalid unit type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
];

/**
 * Update RS Number Validation
 */
export const updateRSNumberValidation: ValidationChain[] = [
  body('rsNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('RS Number cannot be empty')
    .toUpperCase(),
  body('projectName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty'),
  body('totalArea')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Total area must be greater than 0'),
  body('unitType')
    .optional()
    .isIn(['Acre', 'Katha', 'Sq Ft', 'Decimal', 'Bigha'])
    .withMessage('Invalid unit type'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
];

/**
 * ========================================
 * Plot Validation Rules
 * ========================================
 */

/**
 * Create Plot Validation
 */
export const createPlotValidation: ValidationChain[] = [
  body('plotNumber')
    .trim()
    .notEmpty()
    .withMessage('Plot number is required'),
  body('rsNumberId')
    .notEmpty()
    .withMessage('RS Number ID is required')
    .isMongoId()
    .withMessage('Invalid RS Number ID'),
  body('area')
    .isFloat({ min: 0.01 })
    .withMessage('Area must be greater than 0'),
  body('unitType')
    .isIn(['Acre', 'Katha', 'Sq Ft', 'Decimal', 'Bigha'])
    .withMessage('Invalid unit type'),
  body('status')
    .optional()
    .isIn(['Available', 'Reserved', 'Sold', 'Blocked'])
    .withMessage('Invalid plot status'),
  body('clientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid client ID'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

/**
 * Update Plot Validation
 */
export const updatePlotValidation: ValidationChain[] = [
  body('plotNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Plot number cannot be empty'),
  body('area')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Area must be greater than 0'),
  body('unitType')
    .optional()
    .isIn(['Acre', 'Katha', 'Sq Ft', 'Decimal', 'Bigha'])
    .withMessage('Invalid unit type'),
  body('status')
    .optional()
    .isIn(['Available', 'Reserved', 'Sold', 'Blocked'])
    .withMessage('Invalid plot status'),
  body('clientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid client ID'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];
