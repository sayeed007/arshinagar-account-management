import express from 'express';
import {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  submitForApproval,
  approveReceipt,
  rejectReceipt,
  deleteReceipt,
  getApprovalQueue,
} from '../controllers/receiptController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../types';
import { validate } from '../middlewares/validation.middleware';
import { body } from 'express-validator';

const router = express.Router();

// Validation rules
const createReceiptValidation = [
  body('clientId').isMongoId().withMessage('Valid client ID is required'),
  body('saleId').isMongoId().withMessage('Valid sale ID is required'),
  body('receiptType')
    .isIn(['Booking', 'Installment', 'Registration', 'Handover', 'Other'])
    .withMessage('Invalid receipt type'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('method')
    .isIn(['Cash', 'Bank Transfer', 'Cheque', 'PDC', 'Mobile Wallet'])
    .withMessage('Invalid payment method'),
];

const approvalValidation = [
  body('remarks').optional().isString().withMessage('Remarks must be a string'),
];

/**
 * @swagger
 * /receipts:
 *   post:
 *     summary: Create new receipt
 *     description: Create a new payment receipt for a sale
 *     tags: [Receipts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - saleId
 *               - receiptType
 *               - amount
 *               - method
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: MongoDB ObjectId of the client
 *                 example: 507f1f77bcf86cd799439011
 *               saleId:
 *                 type: string
 *                 description: MongoDB ObjectId of the sale
 *                 example: 507f1f77bcf86cd799439012
 *               receiptType:
 *                 type: string
 *                 enum: [Booking, Installment, Registration, Handover, Other]
 *                 example: Booking
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 500000
 *               method:
 *                 type: string
 *                 enum: [Cash, Bank Transfer, Cheque, PDC, Mobile Wallet]
 *                 example: Bank Transfer
 *               bankAccountId:
 *                 type: string
 *                 description: MongoDB ObjectId of the bank account (if method is Bank Transfer)
 *                 example: 507f1f77bcf86cd799439013
 *               chequeId:
 *                 type: string
 *                 description: MongoDB ObjectId of the cheque (if method is Cheque or PDC)
 *                 example: 507f1f77bcf86cd799439014
 *               notes:
 *                 type: string
 *                 example: Initial booking payment
 *     responses:
 *       201:
 *         description: Receipt created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Receipt'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 *   get:
 *     summary: Get all receipts
 *     description: Get paginated list of all receipts with optional filters
 *     tags: [Receipts]
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
 *           enum: [Draft, Pending Approval, Approved, Rejected]
 *         description: Filter by receipt status
 *       - in: query
 *         name: receiptType
 *         schema:
 *           type: string
 *           enum: [Booking, Installment, Registration, Handover, Other]
 *         description: Filter by receipt type
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *       - in: query
 *         name: saleId
 *         schema:
 *           type: string
 *         description: Filter by sale ID
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [Cash, Bank Transfer, Cheque, PDC, Mobile Wallet]
 *         description: Filter by payment method
 *     responses:
 *       200:
 *         description: Receipts retrieved successfully
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
 *                     $ref: '#/components/schemas/Receipt'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER]),
  validate(createReceiptValidation),
  createReceipt
);

router.get('/', authenticate, getAllReceipts);

/**
 * @swagger
 * /receipts/approval-queue:
 *   get:
 *     summary: Get receipts approval queue
 *     description: Get list of receipts pending approval
 *     tags: [Receipts]
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
 *                     $ref: '#/components/schemas/Receipt'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/approval-queue', authenticate, getApprovalQueue);

/**
 * @swagger
 * /receipts/{id}:
 *   get:
 *     summary: Get receipt by ID
 *     description: Retrieve detailed information for a specific receipt
 *     tags: [Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Receipt ID
 *     responses:
 *       200:
 *         description: Receipt details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Receipt'
 *       404:
 *         description: Receipt not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete receipt
 *     description: Delete a receipt record (Admin only)
 *     tags: [Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Receipt ID
 *     responses:
 *       200:
 *         description: Receipt deleted successfully
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
 *         description: Receipt not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:id', authenticate, getReceiptById);

/**
 * @swagger
 * /receipts/{id}/submit:
 *   post:
 *     summary: Submit receipt for approval
 *     description: Submit a receipt for approval workflow
 *     tags: [Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Receipt ID
 *     responses:
 *       200:
 *         description: Receipt submitted for approval successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Receipt'
 *       404:
 *         description: Receipt not found
 *       400:
 *         description: Receipt cannot be submitted (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router.post(
  '/:id/submit',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER]),
  submitForApproval
);

/**
 * @swagger
 * /receipts/{id}/approve:
 *   post:
 *     summary: Approve receipt
 *     description: Approve a receipt that is pending approval
 *     tags: [Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Receipt ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Approved - payment verified
 *     responses:
 *       200:
 *         description: Receipt approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Receipt'
 *       404:
 *         description: Receipt not found
 *       400:
 *         description: Receipt cannot be approved (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.post(
  '/:id/approve',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER, UserRole.HOF]),
  validate(approvalValidation),
  approveReceipt
);

/**
 * @swagger
 * /receipts/{id}/reject:
 *   post:
 *     summary: Reject receipt
 *     description: Reject a receipt that is pending approval
 *     tags: [Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Receipt ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Rejected - incorrect amount
 *     responses:
 *       200:
 *         description: Receipt rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Receipt'
 *       404:
 *         description: Receipt not found
 *       400:
 *         description: Receipt cannot be rejected (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.post(
  '/:id/reject',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER, UserRole.HOF]),
  validate(approvalValidation),
  rejectReceipt
);

router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), deleteReceipt);

export default router;
