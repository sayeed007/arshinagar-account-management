import express from 'express';
import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  updateSaleStage,
  deleteSale,
  getSaleStats,
} from '../controllers/saleController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { Role } from '../models/User';
import { validate } from '../middlewares/validation.middleware';
import { body, param } from 'express-validator';

const router = express.Router();

// Validation rules
const createSaleValidation = [
  body('clientId').isMongoId().withMessage('Valid client ID is required'),
  body('plotId').isMongoId().withMessage('Valid plot ID is required'),
  body('totalPrice').isFloat({ min: 0.01 }).withMessage('Total price must be greater than 0'),
  body('saleDate').optional().isISO8601().withMessage('Valid sale date is required'),
  body('stages').optional().isArray().withMessage('Stages must be an array'),
];

const updateSaleValidation = [
  body('totalPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Total price must be greater than 0'),
  body('status')
    .optional()
    .isIn(['Active', 'Completed', 'Cancelled', 'On Hold'])
    .withMessage('Invalid status'),
];

const updateStageValidation = [
  param('id').isMongoId().withMessage('Valid sale ID is required'),
  param('stageId').isMongoId().withMessage('Valid stage ID is required'),
  body('receivedAmount')
    .isFloat({ min: 0 })
    .withMessage('Received amount must be non-negative'),
];

// Routes
router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.ACCOUNT_MANAGER]),
  validate(createSaleValidation),
  createSale
);

router.get('/', authenticate, getAllSales);

router.get('/stats', authenticate, getSaleStats);

router.get('/:id', authenticate, getSaleById);

router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.ACCOUNT_MANAGER]),
  validate(updateSaleValidation),
  updateSale
);

router.put(
  '/:id/stages/:stageId',
  authenticate,
  authorize([Role.ADMIN, Role.ACCOUNT_MANAGER]),
  validate(updateStageValidation),
  updateSaleStage
);

router.delete('/:id', authenticate, authorize([Role.ADMIN]), deleteSale);

export default router;
