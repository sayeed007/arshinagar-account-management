import { Request } from 'express';
import { Document } from 'mongoose';

/**
 * User Roles
 */
export enum UserRole {
  ADMIN = 'Admin',
  ACCOUNT_MANAGER = 'AccountManager',
  HOF = 'HOF', // Head of Finance
}

/**
 * User Interface
 */
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Auth Request (extends Express Request with user)
 */
export interface AuthRequest extends Request {
  user?: JWTPayload;
  ipAddress?: string;
}

/**
 * API Response Structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Audit Log Action Types
 */
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  VOID = 'VOID',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

/**
 * Audit Log Interface
 */
export interface IAuditLog extends Document {
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Login Request Body
 */
export interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * Register Request Body
 */
export interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Refresh Token Request Body
 */
export interface RefreshTokenRequestBody {
  refreshToken: string;
}

/**
 * Token Response
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Error Codes
 */
export enum ErrorCode {
  // Auth errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  NOT_FOUND = 'NOT_FOUND',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Business logic errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
}
