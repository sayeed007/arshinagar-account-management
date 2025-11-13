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
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and receive JWT tokens (access + refresh)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@arshinagar.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                           enum: [Admin, AccountManager, HOF]
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token (expires in 1 hour)
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token (expires in 7 days)
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts
 */
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  auditLogin,
  asyncHandler(login)
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     description: Create a new user account (Admin only)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@arshinagar.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: SecurePass@123
 *               role:
 *                 type: string
 *                 enum: [Admin, AccountManager, HOF]
 *                 example: AccountManager
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
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
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate user tokens and log out
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/logout',
  authenticate,
  auditLogout,
  asyncHandler(logout)
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh',
  refreshTokenValidation,
  handleValidationErrors,
  asyncHandler(refreshToken)
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Get current authenticated user's profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
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
