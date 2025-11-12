import { Response } from 'express';
import { User } from '../models/User';
import {
  AuthRequest,
  LoginRequestBody,
  RegisterRequestBody,
  RefreshTokenRequestBody,
  TokenResponse,
  ErrorCode,
  UserRole,
} from '../types';
import { generateTokens, verifyRefreshToken, getTokenExpiryTime } from '../config/jwt';
import { ApiError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';
import { isTokenExpiredError } from '../utils/typeGuards';

/**
 * Login Controller
 * Authenticates user and returns JWT tokens
 */
export const login = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password }: LoginRequestBody = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new ApiError(
        401,
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password'
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ApiError(
        403,
        ErrorCode.ACCOUNT_INACTIVE,
        'Your account has been deactivated. Please contact an administrator.'
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError(
        401,
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password'
      );
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Prepare response
    const response: TokenResponse = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: getTokenExpiryTime(),
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      data: response,
      message: 'Login successful',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Register Controller
 * Creates a new user (Admin only)
 */
export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password, role }: RegisterRequestBody = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApiError(
          409,
          ErrorCode.DUPLICATE_ENTRY,
          'Email already registered'
        );
      }
      throw new ApiError(
        409,
        ErrorCode.DUPLICATE_ENTRY,
        'Username already taken'
      );
    }

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password,
      role: role || UserRole.ACCOUNT_MANAGER,
      isActive: true,
    });

    logger.info(`New user registered: ${newUser.email} with role ${newUser.role}`);

    res.status(201).json({
      success: true,
      data: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Logout Controller
 * Invalidates refresh token (client-side should discard tokens)
 */
export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // In a production system with token blacklisting:
    // - Add access token to blacklist with expiry time
    // - Add refresh token to blacklist
    // For now, we'll rely on client-side token removal

    logger.info(`User logged out: ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh Token Controller
 * Issues new access token using refresh token
 */
export const refreshToken = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken }: RefreshTokenRequestBody = req.body;

    if (!refreshToken) {
      throw new ApiError(
        401,
        ErrorCode.UNAUTHORIZED,
        'Refresh token is required'
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error: unknown) {
      if (isTokenExpiredError(error)) {
        throw new ApiError(
          401,
          ErrorCode.TOKEN_EXPIRED,
          'Refresh token has expired. Please login again.'
        );
      }
      throw new ApiError(
        401,
        ErrorCode.INVALID_TOKEN,
        'Invalid refresh token'
      );
    }

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(
        401,
        ErrorCode.UNAUTHORIZED,
        'User not found'
      );
    }

    if (!user.isActive) {
      throw new ApiError(
        403,
        ErrorCode.ACCOUNT_INACTIVE,
        'Your account has been deactivated'
      );
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: getTokenExpiryTime(),
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get Current User Profile
 * Returns authenticated user's information
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        401,
        ErrorCode.UNAUTHORIZED,
        'Authentication required'
      );
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new ApiError(
        404,
        ErrorCode.NOT_FOUND,
        'User not found'
      );
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get All Users (Admin only)
 */
export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Update User (Admin only)
 */
export const updateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new ApiError(
        404,
        ErrorCode.NOT_FOUND,
        'User not found'
      );
    }

    logger.info(`User updated: ${user.email} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete User (Admin only)
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Don't allow deleting self
    if (req.user?.userId === id) {
      throw new ApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'You cannot delete your own account'
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw new ApiError(
        404,
        ErrorCode.NOT_FOUND,
        'User not found'
      );
    }

    logger.info(`User deleted: ${user.email} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
