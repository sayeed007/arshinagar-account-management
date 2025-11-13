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
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all users
 *     description: Get list of all users (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Admin, AccountManager, HOF]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get(
  '/users',
  authenticate,
  adminOnly,
  asyncHandler(getAllUsers)
);

/**
 * @swagger
 * /auth/users/{id}:
 *   put:
 *     summary: Update user
 *     description: Update user information (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [Admin, AccountManager, HOF]
 *               isActive:
 *                 type: boolean
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Optional - only include if changing password
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *   delete:
 *     summary: Delete user
 *     description: Delete user account (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
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

router.delete(
  '/users/:id',
  authenticate,
  adminOnly,
  auditLog(AuditAction.DELETE, 'User'),
  asyncHandler(deleteUser)
);

export default router;
