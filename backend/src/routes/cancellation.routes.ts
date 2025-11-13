import express from 'express';
import {
  getAllCancellations,
  getCancellationById,
  createCancellation,
  updateCancellation,
  approveCancellation,
  rejectCancellation,
  deleteCancellation,
  getCancellationStats,
} from '../controllers/cancellationController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /cancellations/stats:
 *   get:
 *     summary: Get cancellation statistics
 *     description: Get aggregated statistics for cancellations including total count, by status, and total refund amount
 *     tags: [Cancellations]
 *     responses:
 *       200:
 *         description: Cancellation statistics retrieved successfully
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
 *                     totalCancellations:
 *                       type: number
 *                       example: 15
 *                     pendingCancellations:
 *                       type: number
 *                       example: 3
 *                     approvedCancellations:
 *                       type: number
 *                       example: 10
 *                     rejectedCancellations:
 *                       type: number
 *                       example: 2
 *                     totalRefundAmount:
 *                       type: number
 *                       example: 2500000
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getCancellationStats);

/**
 * @swagger
 * /cancellations:
 *   get:
 *     summary: Get all cancellations
 *     description: Get paginated list of all sale cancellations with optional filters
 *     tags: [Cancellations]
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
 *           enum: [Pending, Approved, Rejected]
 *         description: Filter by cancellation status
 *       - in: query
 *         name: saleId
 *         schema:
 *           type: string
 *         description: Filter by sale ID
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *     responses:
 *       200:
 *         description: Cancellations retrieved successfully
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
 *                     $ref: '#/components/schemas/Cancellation'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new cancellation
 *     description: Create a new sale cancellation request
 *     tags: [Cancellations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - saleId
 *               - reason
 *               - refundAmount
 *             properties:
 *               saleId:
 *                 type: string
 *                 description: MongoDB ObjectId of the sale to cancel
 *                 example: 507f1f77bcf86cd799439011
 *               reason:
 *                 type: string
 *                 example: Client requested cancellation due to financial constraints
 *               refundAmount:
 *                 type: number
 *                 minimum: 0
 *                 example: 500000
 *               deductionAmount:
 *                 type: number
 *                 minimum: 0
 *                 example: 50000
 *               cancellationDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               notes:
 *                 type: string
 *                 example: Approved by management
 *     responses:
 *       201:
 *         description: Cancellation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cancellation'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router
  .route('/')
  .get(getAllCancellations)
  .post(authorize('Admin', 'AccountManager'), createCancellation);

/**
 * @swagger
 * /cancellations/{id}:
 *   get:
 *     summary: Get cancellation by ID
 *     description: Retrieve detailed information for a specific cancellation
 *     tags: [Cancellations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cancellation ID
 *     responses:
 *       200:
 *         description: Cancellation details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cancellation'
 *       404:
 *         description: Cancellation not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update cancellation
 *     description: Update cancellation information
 *     tags: [Cancellations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cancellation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               refundAmount:
 *                 type: number
 *                 minimum: 0
 *               deductionAmount:
 *                 type: number
 *                 minimum: 0
 *               cancellationDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cancellation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cancellation'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Cancellation not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 *   delete:
 *     summary: Delete cancellation
 *     description: Delete a cancellation record (Admin only)
 *     tags: [Cancellations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cancellation ID
 *     responses:
 *       200:
 *         description: Cancellation deleted successfully
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
 *         description: Cancellation not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route('/:id')
  .get(getCancellationById)
  .put(authorize('Admin', 'AccountManager'), updateCancellation)
  .delete(authorize('Admin'), deleteCancellation);

/**
 * @swagger
 * /cancellations/{id}/approve:
 *   post:
 *     summary: Approve cancellation
 *     description: Approve a pending cancellation request
 *     tags: [Cancellations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cancellation ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Approved - client request verified
 *     responses:
 *       200:
 *         description: Cancellation approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cancellation'
 *       404:
 *         description: Cancellation not found
 *       400:
 *         description: Cancellation cannot be approved (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.post('/:id/approve', authorize('Admin', 'AccountManager', 'HOF'), approveCancellation);

/**
 * @swagger
 * /cancellations/{id}/reject:
 *   post:
 *     summary: Reject cancellation
 *     description: Reject a pending cancellation request
 *     tags: [Cancellations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cancellation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Rejected - does not meet cancellation policy
 *     responses:
 *       200:
 *         description: Cancellation rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cancellation'
 *       404:
 *         description: Cancellation not found
 *       400:
 *         description: Cancellation cannot be rejected (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.post('/:id/reject', authorize('Admin', 'AccountManager', 'HOF'), rejectCancellation);

export default router;
