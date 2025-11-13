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

/**
 * @swagger
 * /installments/schedule:
 *   post:
 *     summary: Create installment schedule
 *     description: Create an installment schedule for a sale
 *     tags: [Installments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - saleId
 *               - totalAmount
 *               - numberOfInstallments
 *             properties:
 *               saleId:
 *                 type: string
 *                 description: MongoDB ObjectId of the sale
 *                 example: 507f1f77bcf86cd799439011
 *               totalAmount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 1000000
 *               numberOfInstallments:
 *                 type: integer
 *                 minimum: 1
 *                 example: 12
 *               frequency:
 *                 type: string
 *                 enum: [Monthly, Quarterly, Half-Yearly, Yearly, Custom]
 *                 default: Monthly
 *                 example: Monthly
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-02-01
 *     responses:
 *       201:
 *         description: Installment schedule created successfully
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
 *                     $ref: '#/components/schemas/Installment'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router.post(
  '/schedule',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER]),
  validate(createScheduleValidation),
  createInstallmentSchedule
);

/**
 * @swagger
 * /installments:
 *   get:
 *     summary: Get all installments
 *     description: Get paginated list of all installments with optional filters
 *     tags: [Installments]
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
 *           enum: [Pending, Partially Paid, Paid, Overdue]
 *         description: Filter by installment status
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
 *         description: Installments retrieved successfully
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
 *                     $ref: '#/components/schemas/Installment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getAllInstallments);

/**
 * @swagger
 * /installments/overdue:
 *   get:
 *     summary: Get overdue installments
 *     description: Get list of all overdue installments
 *     tags: [Installments]
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
 *         description: Overdue installments retrieved successfully
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
 *                     $ref: '#/components/schemas/Installment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/overdue', authenticate, getOverdueInstallments);

/**
 * @swagger
 * /installments/client/{clientId}/statement:
 *   get:
 *     summary: Get client installment statement
 *     description: Get detailed installment statement for a specific client
 *     tags: [Installments]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client statement retrieved successfully
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
 *                     clientInfo:
 *                       $ref: '#/components/schemas/Client'
 *                     installments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Installment'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalAmount:
 *                           type: number
 *                         paidAmount:
 *                           type: number
 *                         dueAmount:
 *                           type: number
 *                         overdueAmount:
 *                           type: number
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 */
router.get('/client/:clientId/statement', authenticate, getClientStatement);

/**
 * @swagger
 * /installments/{id}:
 *   get:
 *     summary: Get installment by ID
 *     description: Retrieve detailed information for a specific installment
 *     tags: [Installments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Installment ID
 *     responses:
 *       200:
 *         description: Installment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Installment'
 *       404:
 *         description: Installment not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update installment
 *     description: Update installment information including payment details
 *     tags: [Installments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Installment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paidAmount:
 *                 type: number
 *                 minimum: 0
 *                 example: 50000
 *               paymentId:
 *                 type: string
 *                 description: MongoDB ObjectId of the payment/receipt
 *                 example: 507f1f77bcf86cd799439011
 *               status:
 *                 type: string
 *                 enum: [Pending, Partially Paid, Paid, Overdue]
 *     responses:
 *       200:
 *         description: Installment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Installment'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Installment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 *   delete:
 *     summary: Delete installment
 *     description: Delete an installment record (Admin only)
 *     tags: [Installments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Installment ID
 *     responses:
 *       200:
 *         description: Installment deleted successfully
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
 *         description: Installment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:id', authenticate, getInstallmentById);

router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER]),
  validate(updateInstallmentValidation),
  updateInstallment
);

router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), deleteInstallment);

/**
 * @swagger
 * /installments/update-overdue:
 *   post:
 *     summary: Update overdue installment statuses
 *     description: Batch update all installments to mark overdue ones based on due date (Admin only)
 *     tags: [Installments]
 *     responses:
 *       200:
 *         description: Overdue statuses updated successfully
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
 *                     updatedCount:
 *                       type: number
 *                       example: 15
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/update-overdue',
  authenticate,
  authorize([UserRole.ADMIN]),
  updateOverdueStatuses
);

export default router;
