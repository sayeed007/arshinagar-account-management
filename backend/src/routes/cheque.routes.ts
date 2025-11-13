import express from 'express';
import {
  getAllCheques,
  getChequeById,
  createCheque,
  updateCheque,
  markChequeAsCleared,
  markChequeAsBounced,
  cancelCheque,
  deleteCheque,
  getDueCheques,
  getUpcomingCheques,
  getChequeStats,
} from '../controllers/chequeController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /cheques/stats:
 *   get:
 *     summary: Get cheque statistics
 *     description: Get aggregated statistics for cheques including total count, by status, and amounts
 *     tags: [Cheques]
 *     responses:
 *       200:
 *         description: Cheque statistics retrieved successfully
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
 *                     totalCheques:
 *                       type: number
 *                       example: 50
 *                     pendingCheques:
 *                       type: number
 *                       example: 20
 *                     clearedCheques:
 *                       type: number
 *                       example: 25
 *                     bouncedCheques:
 *                       type: number
 *                       example: 3
 *                     cancelledCheques:
 *                       type: number
 *                       example: 2
 *                     totalAmount:
 *                       type: number
 *                       example: 5000000
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getChequeStats);

/**
 * @swagger
 * /cheques/due:
 *   get:
 *     summary: Get due cheques
 *     description: Get list of cheques that are due for clearing
 *     tags: [Cheques]
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
 *     responses:
 *       200:
 *         description: Due cheques retrieved successfully
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
 *                     $ref: '#/components/schemas/Cheque'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/due', getDueCheques);

/**
 * @swagger
 * /cheques/upcoming:
 *   get:
 *     summary: Get upcoming cheques
 *     description: Get list of cheques that will be due soon
 *     tags: [Cheques]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look ahead
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
 *     responses:
 *       200:
 *         description: Upcoming cheques retrieved successfully
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
 *                     $ref: '#/components/schemas/Cheque'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/upcoming', getUpcomingCheques);

/**
 * @swagger
 * /cheques/{id}/clear:
 *   post:
 *     summary: Mark cheque as cleared
 *     description: Update cheque status to cleared after successful bank clearance
 *     tags: [Cheques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cheque ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clearanceDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-02-15
 *               remarks:
 *                 type: string
 *                 example: Cleared successfully
 *     responses:
 *       200:
 *         description: Cheque marked as cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cheque'
 *       404:
 *         description: Cheque not found
 *       400:
 *         description: Cheque cannot be cleared (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.post('/:id/clear', authorize('Admin', 'AccountManager', 'HOF'), markChequeAsCleared);

/**
 * @swagger
 * /cheques/{id}/bounce:
 *   post:
 *     summary: Mark cheque as bounced
 *     description: Update cheque status to bounced due to insufficient funds or other issues
 *     tags: [Cheques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cheque ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bounceDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-02-15
 *               bounceReason:
 *                 type: string
 *                 example: Insufficient funds
 *               remarks:
 *                 type: string
 *                 example: Returned by bank
 *     responses:
 *       200:
 *         description: Cheque marked as bounced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cheque'
 *       404:
 *         description: Cheque not found
 *       400:
 *         description: Cheque cannot be bounced (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.post('/:id/bounce', authorize('Admin', 'AccountManager', 'HOF'), markChequeAsBounced);

/**
 * @swagger
 * /cheques/{id}/cancel:
 *   post:
 *     summary: Cancel cheque
 *     description: Cancel a cheque before clearance
 *     tags: [Cheques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cheque ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellationReason:
 *                 type: string
 *                 example: Client requested cancellation
 *               remarks:
 *                 type: string
 *                 example: Stop payment issued
 *     responses:
 *       200:
 *         description: Cheque cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cheque'
 *       404:
 *         description: Cheque not found
 *       400:
 *         description: Cheque cannot be cancelled (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.post('/:id/cancel', authorize('Admin', 'AccountManager', 'HOF'), cancelCheque);

/**
 * @swagger
 * /cheques:
 *   get:
 *     summary: Get all cheques
 *     description: Get paginated list of all cheques with optional filters
 *     tags: [Cheques]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Cleared, Bounced, Cancelled]
 *         description: Filter by cheque status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Received, Issued, PDC]
 *         description: Filter by cheque type
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *     responses:
 *       200:
 *         description: Cheques retrieved successfully
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
 *                     $ref: '#/components/schemas/Cheque'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new cheque
 *     description: Create a new cheque record
 *     tags: [Cheques]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chequeNumber
 *               - amount
 *               - chequeDate
 *               - bankName
 *             properties:
 *               chequeNumber:
 *                 type: string
 *                 example: CHQ-123456
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 500000
 *               chequeDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-02-15
 *               bankName:
 *                 type: string
 *                 example: Standard Chartered Bank
 *               branchName:
 *                 type: string
 *                 example: Gulshan Branch
 *               type:
 *                 type: string
 *                 enum: [Received, Issued, PDC]
 *                 example: Received
 *               clientId:
 *                 type: string
 *                 description: MongoDB ObjectId of the client
 *                 example: 507f1f77bcf86cd799439011
 *               receiptId:
 *                 type: string
 *                 description: MongoDB ObjectId of the associated receipt
 *                 example: 507f1f77bcf86cd799439012
 *               notes:
 *                 type: string
 *                 example: Post-dated cheque for installment
 *     responses:
 *       201:
 *         description: Cheque created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cheque'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.get('/', getAllCheques);
router.post('/', authorize('Admin', 'AccountManager', 'HOF'), createCheque);

/**
 * @swagger
 * /cheques/{id}:
 *   get:
 *     summary: Get cheque by ID
 *     description: Retrieve detailed information for a specific cheque
 *     tags: [Cheques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cheque ID
 *     responses:
 *       200:
 *         description: Cheque details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cheque'
 *       404:
 *         description: Cheque not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update cheque
 *     description: Update cheque information
 *     tags: [Cheques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cheque ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chequeNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               chequeDate:
 *                 type: string
 *                 format: date
 *               bankName:
 *                 type: string
 *               branchName:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cheque updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cheque'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Cheque not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 *   delete:
 *     summary: Delete cheque
 *     description: Delete a cheque record (Admin only)
 *     tags: [Cheques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cheque ID
 *     responses:
 *       200:
 *         description: Cheque deleted successfully
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
 *         description: Cheque not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:id', getChequeById);
router.put('/:id', authorize('Admin', 'AccountManager', 'HOF'), updateCheque);
router.delete('/:id', authorize('Admin'), deleteCheque);

export default router;
