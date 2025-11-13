import { Router } from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  restoreClient,
  searchClients,
  getClientStats,
} from '../controllers/clientController';
import { authenticate } from '../middlewares/auth.middleware';
import { accountManagerOrHigher, hofOrAdmin } from '../middlewares/rbac.middleware';
import {
  createClientValidation,
  updateClientValidation,
  handleValidationErrors,
} from '../middlewares/validation.middleware';
import { auditLog, auditChanges } from '../middlewares/audit.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { AuditAction } from '../types';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create new client
 *     description: Create a new client record
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - fatherName
 *               - phone
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ahmed Rahman
 *               fatherName:
 *                 type: string
 *                 example: Abdul Rahman
 *               phone:
 *                 type: string
 *                 example: +8801712345678
 *               alternatePhone:
 *                 type: string
 *                 example: +8801812345678
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmed@example.com
 *               nid:
 *                 type: string
 *                 example: 1234567890123
 *               address:
 *                 type: string
 *                 example: Dhaka, Bangladesh
 *               notes:
 *                 type: string
 *                 example: VIP client
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all clients
 *     description: Get paginated list of clients with optional filters
 *     tags: [Clients]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, phone, or client number
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
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
 *                     $ref: '#/components/schemas/Client'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.post(
  '/',
  accountManagerOrHigher,
  createClientValidation,
  handleValidationErrors,
  auditLog(AuditAction.CREATE, 'Client'),
  asyncHandler(createClient)
);

router.get('/', accountManagerOrHigher, asyncHandler(getAllClients));

/**
 * @swagger
 * /clients/search:
 *   get:
 *     summary: Search clients
 *     description: Quick search for clients by name, phone, or client number
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', accountManagerOrHigher, asyncHandler(searchClients));

/**
 * @swagger
 * /clients/stats:
 *   get:
 *     summary: Get client statistics
 *     description: Get client statistics
 * @access  AccountManager or higher
 */
router.get('/stats', accountManagerOrHigher, asyncHandler(getClientStats));

/**
 * @route   GET /api/clients/:id
 * @desc    Get client by ID
 * @access  AccountManager or higher
 */
router.get('/:id', accountManagerOrHigher, asyncHandler(getClientById));

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client
 * @access  AccountManager or higher
 */
router.put(
  '/:id',
  accountManagerOrHigher,
  updateClientValidation,
  handleValidationErrors,
  auditLog(AuditAction.UPDATE, 'Client'),
  asyncHandler(updateClient)
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete client (soft delete)
 * @access  HOF or Admin
 */
router.delete(
  '/:id',
  hofOrAdmin,
  auditLog(AuditAction.DELETE, 'Client'),
  asyncHandler(deleteClient)
);

/**
 * @route   POST /api/clients/:id/restore
 * @desc    Restore deleted client
 * @access  Admin only
 */
router.post('/:id/restore', hofOrAdmin, asyncHandler(restoreClient));

export default router;
