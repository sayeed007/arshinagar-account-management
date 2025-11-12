/**
 * Common utility types for the application
 */

/**
 * Query parameters for list pages
 */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

/**
 * Error type for try-catch blocks
 */
export interface AppError extends Error {
  response?: {
    data?: {
      error?: {
        message?: string;
        code?: string;
        details?: Record<string, string>;
      };
    };
  };
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error;
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.response?.data?.error?.message || error.message || 'An error occurred';
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Form data types
 */
export type FormData<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K] extends object ? Record<string, unknown> : T[K];
};

/**
 * Partial form data (for updates)
 */
export type PartialFormData<T> = Partial<FormData<T>>;
