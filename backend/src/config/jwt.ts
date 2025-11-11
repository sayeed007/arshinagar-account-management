import jwt from 'jsonwebtoken';
import { JWTPayload, TokenResponse } from '../types';

/**
 * JWT Configuration
 */
export const JWT_CONFIG = {
  accessSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret',
  accessExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.accessSecret, {
    expiresIn: JWT_CONFIG.accessExpiresIn,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.refreshSecret, {
    expiresIn: JWT_CONFIG.refreshExpiresIn,
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_CONFIG.accessSecret) as JWTPayload;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_CONFIG.refreshSecret) as JWTPayload;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (payload: JWTPayload): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Get token expiry time in seconds
 */
export const getTokenExpiryTime = (): number => {
  const expiresIn = JWT_CONFIG.accessExpiresIn;

  // Parse string like "7d", "24h", "60m"
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    return 7 * 24 * 60 * 60; // Default 7 days in seconds
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60;
    case 'h':
      return value * 60 * 60;
    case 'm':
      return value * 60;
    case 's':
      return value;
    default:
      return 7 * 24 * 60 * 60;
  }
};
