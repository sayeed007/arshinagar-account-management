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
 */
router.get('/search', accountManagerOrHigher, asyncHandler(searchClients));

/**
 * @swagger
 * /clients/stats:
 *   get:
 *     summary: Get client statistics
 *     description: Get client statistics including total count, active clients, etc.
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: Client statistics retrieved successfully
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
 *                     totalClients:
 *                       type: number
 *                     activeClients:
 *                       type: number
 *                     inactiveClients:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', accountManagerOrHigher, asyncHandler(getClientStats));

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     description: Retrieve detailed information for a specific client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update client
 *     description: Update client information
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fatherName:
 *                 type: string
 *               phone:
 *                 type: string
 *               alternatePhone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               nid:
 *                 type: string
 *               address:
 *                 type: string
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Client updated successfully
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
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete client
 *     description: Soft delete a client (marks as inactive)
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
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
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - HOF or Admin access required
 */
router.get('/:id', accountManagerOrHigher, asyncHandler(getClientById));

router.put(
  '/:id',
  accountManagerOrHigher,
  updateClientValidation,
  handleValidationErrors,
  auditLog(AuditAction.UPDATE, 'Client'),
  asyncHandler(updateClient)
);

router.delete(
  '/:id',
  hofOrAdmin,
  auditLog(AuditAction.DELETE, 'Client'),
  asyncHandler(deleteClient)
);

/**
 * @swagger
 * /clients/{id}/restore:
 *   post:
 *     summary: Restore deleted client
 *     description: Restore a soft-deleted client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/:id/restore', hofOrAdmin, asyncHandler(restoreClient));

export default router;
