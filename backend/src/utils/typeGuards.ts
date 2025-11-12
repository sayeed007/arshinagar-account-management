/**
 * Type guards for error handling
 */

/**
 * Check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Check if error is a MongoDB duplicate key error
 */
export function isMongoDBDuplicateError(error: unknown): error is { code: number; keyValue: Record<string, unknown> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  );
}

/**
 * Check if error is a JWT token error
 */
export function isJWTError(error: unknown): error is Error & { name: 'TokenExpiredError' | 'JsonWebTokenError' } {
  return (
    isError(error) &&
    (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError')
  );
}

/**
 * Check if error is a TokenExpiredError
 */
export function isTokenExpiredError(error: unknown): error is Error & { name: 'TokenExpiredError' } {
  return isError(error) && error.name === 'TokenExpiredError';
}

/**
 * Check if error has a status code
 */
export function hasStatusCode(error: unknown): error is { statusCode: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as { statusCode: unknown }).statusCode === 'number'
  );
}
