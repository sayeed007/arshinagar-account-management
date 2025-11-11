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
import { Role } from '../models/User';
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

// Routes
router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.ACCOUNT_MANAGER]),
  validate(createReceiptValidation),
  createReceipt
);

router.get('/', authenticate, getAllReceipts);

router.get('/approval-queue', authenticate, getApprovalQueue);

router.get('/:id', authenticate, getReceiptById);

router.post(
  '/:id/submit',
  authenticate,
  authorize([Role.ADMIN, Role.ACCOUNT_MANAGER]),
  submitForApproval
);

router.post(
  '/:id/approve',
  authenticate,
  authorize([Role.ADMIN, Role.ACCOUNT_MANAGER, Role.HOF]),
  validate(approvalValidation),
  approveReceipt
);

router.post(
  '/:id/reject',
  authenticate,
  authorize([Role.ADMIN, Role.ACCOUNT_MANAGER, Role.HOF]),
  validate(approvalValidation),
  rejectReceipt
);

router.delete('/:id', authenticate, authorize([Role.ADMIN]), deleteReceipt);

export default router;
