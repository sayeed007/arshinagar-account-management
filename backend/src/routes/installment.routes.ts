import express from 'express';
import {
  createInstallmentSchedule,
  getAllInstallments,
  getInstallmentById,
  updateInstallment,
  deleteInstallment,
  getOverdueInstallments,
  getClientStatement,
  updateOverdueStatuses,
} from '../controllers/installmentController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../types';
import { validate } from '../middlewares/validation.middleware';
import { body, param } from 'express-validator';

const router = express.Router();

// Validation rules
const createScheduleValidation = [
  body('saleId').isMongoId().withMessage('Valid sale ID is required'),
  body('totalAmount').isFloat({ min: 0.01 }).withMessage('Total amount must be greater than 0'),
  body('numberOfInstallments')
    .isInt({ min: 1 })
    .withMessage('Number of installments must be at least 1'),
  body('frequency')
    .optional()
    .isIn(['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'Custom'])
    .withMessage('Invalid frequency'),
];

const updateInstallmentValidation = [
  body('paidAmount').optional().isFloat({ min: 0 }).withMessage('Paid amount must be non-negative'),
  body('paymentId').optional().isMongoId().withMessage('Valid payment ID required'),
];

// Routes
router.post(
  '/schedule',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER]),
  validate(createScheduleValidation),
  createInstallmentSchedule
);

router.get('/', authenticate, getAllInstallments);

router.get('/overdue', authenticate, getOverdueInstallments);

router.get('/client/:clientId/statement', authenticate, getClientStatement);

router.get('/:id', authenticate, getInstallmentById);

router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER]),
  validate(updateInstallmentValidation),
  updateInstallment
);

router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), deleteInstallment);

router.post(
  '/update-overdue',
  authenticate,
  authorize([UserRole.ADMIN]),
  updateOverdueStatuses
);

export default router;
