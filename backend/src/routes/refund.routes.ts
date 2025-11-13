import express from 'express';
import {
  getAllRefunds,
  getRefundById,
  createRefundSchedule,
  submitRefund,
  approveRefund,
  rejectRefund,
  getApprovalQueue,
  markRefundAsPaid,
  getRefundStats,
} from '../controllers/refundController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /refunds/approval-queue:
 *   get:
 *     summary: Get refunds approval queue
 *     description: Get list of refunds pending approval
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
 *     responses:
 *       200:
 *         description: Approval queue retrieved successfully
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
 *                     $ref: '#/components/schemas/Refund'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.get('/approval-queue', authorize('Admin', 'AccountManager', 'HOF'), getApprovalQueue);

/**
 * @swagger
 * /refunds/stats:
 *   get:
 *     summary: Get refund statistics
 *     description: Get aggregated statistics for refunds including total count, by status, and total amount
 *     tags: [Cancellations]
 *     responses:
 *       200:
 *         description: Refund statistics retrieved successfully
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
 *                     totalRefunds:
 *                       type: number
 *                       example: 20
 *                     pendingRefunds:
 *                       type: number
 *                       example: 5
 *                     approvedRefunds:
 *                       type: number
 *                       example: 12
 *                     paidRefunds:
 *                       type: number
 *                       example: 10
 *                     totalAmount:
 *                       type: number
 *                       example: 3500000
 *                     paidAmount:
 *                       type: number
 *                       example: 2000000
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getRefundStats);

/**
 * @swagger
 * /refunds:
 *   get:
 *     summary: Get all refunds
 *     description: Get paginated list of all refunds with optional filters
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
 *           enum: [Pending, Approved, Rejected, Paid, Partially Paid]
 *         description: Filter by refund status
 *       - in: query
 *         name: cancellationId
 *         schema:
 *           type: string
 *         description: Filter by cancellation ID
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *     responses:
 *       200:
 *         description: Refunds retrieved successfully
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
 *                     $ref: '#/components/schemas/Refund'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create refund schedule
 *     description: Create a refund schedule for an approved cancellation
 *     tags: [Cancellations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cancellationId
 *               - totalAmount
 *               - numberOfInstallments
 *             properties:
 *               cancellationId:
 *                 type: string
 *                 description: MongoDB ObjectId of the approved cancellation
 *                 example: 507f1f77bcf86cd799439011
 *               totalAmount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 500000
 *               numberOfInstallments:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *               frequency:
 *                 type: string
 *                 enum: [Monthly, Quarterly, One-time]
 *                 example: Monthly
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-02-01
 *     responses:
 *       201:
 *         description: Refund schedule created successfully
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
 *                     $ref: '#/components/schemas/Refund'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router
  .route('/')
  .get(getAllRefunds)
  .post(authorize('Admin', 'AccountManager'), createRefundSchedule);

/**
 * @swagger
 * /refunds/{id}:
 *   get:
 *     summary: Get refund by ID
 *     description: Retrieve detailed information for a specific refund
 *     tags: [Cancellations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Refund ID
 *     responses:
 *       200:
 *         description: Refund details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Refund'
 *       404:
 *         description: Refund not found
 *       401:
 *         description: Unauthorized
 */
router
  .route('/:id')
  .get(getRefundById);

/**
 * @swagger
 * /refunds/{id}/submit:
 *   post:
 *     summary: Submit refund for approval
 *     description: Submit a refund for approval workflow
 *     tags: [Cancellations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Refund ID
 *     responses:
 *       200:
 *         description: Refund submitted for approval successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Refund'
 *       404:
 *         description: Refund not found
 *       400:
 *         description: Refund cannot be submitted (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router.post('/:id/submit', authorize('Admin', 'AccountManager'), submitRefund);

/**
 * @swagger
 * /refunds/{id}/approve:
 *   post:
 *     summary: Approve refund
 *     description: Approve a refund that is pending approval
 *     tags: [Cancellations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Refund ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Approved - refund amount verified
 *     responses:
 *       200:
 *         description: Refund approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Refund'
 *       404:
 *         description: Refund not found
 *       400:
 *         description: Refund cannot be approved (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.post('/:id/approve', authorize('Admin', 'AccountManager', 'HOF'), approveRefund);

/**
 * @swagger
 * /refunds/{id}/reject:
 *   post:
 *     summary: Reject refund
 *     description: Reject a refund that is pending approval
 *     tags: [Cancellations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Refund ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Rejected - incorrect amount calculation
 *     responses:
 *       200:
 *         description: Refund rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Refund'
 *       404:
 *         description: Refund not found
 *       400:
 *         description: Refund cannot be rejected (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.post('/:id/reject', authorize('Admin', 'AccountManager', 'HOF'), rejectRefund);

/**
 * @swagger
 * /refunds/{id}/mark-paid:
 *   post:
 *     summary: Mark refund as paid
 *     description: Mark a refund installment as paid
 *     tags: [Cancellations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Refund ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paidAmount
 *             properties:
 *               paidAmount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 100000
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Bank Transfer, Cheque]
 *                 example: Bank Transfer
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-02-15
 *               referenceNumber:
 *                 type: string
 *                 example: REF-2024-001
 *               notes:
 *                 type: string
 *                 example: Payment processed via bank transfer
 *     responses:
 *       200:
 *         description: Refund marked as paid successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Refund'
 *       404:
 *         description: Refund not found
 *       400:
 *         description: Invalid payment amount or status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router.post('/:id/mark-paid', authorize('Admin', 'AccountManager'), markRefundAsPaid);

export default router;
