import { Router } from 'express';
import {
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/authController';
import { authenticate } from '../middlewares/auth.middleware';
import { adminOnly, authorize } from '../middlewares/rbac.middleware';
import {
  loginValidation,
  registerValidation,
  refreshTokenValidation,
  updateUserValidation,
  handleValidationErrors,
} from '../middlewares/validation.middleware';
import { auditLogin, auditLogout, auditLog } from '../middlewares/audit.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { AuditAction, UserRole } from '../types';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get tokens
 * @access  Public
 */
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  auditLogin,
  asyncHandler(login)
);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (Admin only)
 * @access  Private/Admin
 */
router.post(
  '/register',
  authenticate,
  adminOnly,
  registerValidation,
  handleValidationErrors,
  auditLog(AuditAction.CREATE, 'User'),
  asyncHandler(register)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate tokens)
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  auditLogout,
  asyncHandler(logout)
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
  '/refresh',
  refreshTokenValidation,
  handleValidationErrors,
  asyncHandler(refreshToken)
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(getProfile)
);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get(
  '/users',
  authenticate,
  adminOnly,
  asyncHandler(getAllUsers)
);

/**
 * @route   PUT /api/auth/users/:id
 * @desc    Update user (Admin only)
 * @access  Private/Admin
 */
router.put(
  '/users/:id',
  authenticate,
  adminOnly,
  updateUserValidation,
  handleValidationErrors,
  auditLog(AuditAction.UPDATE, 'User'),
  asyncHandler(updateUser)
);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
router.delete(
  '/users/:id',
  authenticate,
  adminOnly,
  auditLog(AuditAction.DELETE, 'User'),
  asyncHandler(deleteUser)
);

export default router;
