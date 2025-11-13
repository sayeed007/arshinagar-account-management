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
import { UserRole } from '../types';
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

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create new sale
 *     description: Create a new property sale record with stages
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - plotId
 *               - totalPrice
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: MongoDB ObjectId of the client
 *                 example: 507f1f77bcf86cd799439011
 *               plotId:
 *                 type: string
 *                 description: MongoDB ObjectId of the plot
 *                 example: 507f1f77bcf86cd799439012
 *               totalPrice:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 5000000
 *               saleDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               stages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     stageName:
 *                       type: string
 *                       enum: [Booking, Installments, Registration, Handover, Other]
 *                       example: Booking
 *                     plannedAmount:
 *                       type: number
 *                       example: 500000
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 *   get:
 *     summary: Get all sales
 *     description: Get paginated list of all sales with optional filters
 *     tags: [Sales]
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
 *           enum: [Active, Completed, Cancelled, On Hold]
 *         description: Filter by sale status
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by sale number
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
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
 *                     $ref: '#/components/schemas/Sale'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER]),
  validate(createSaleValidation),
  createSale
);

router.get('/', authenticate, getAllSales);

/**
 * @swagger
 * /sales/stats:
 *   get:
 *     summary: Get sale statistics
 *     description: Get aggregated statistics for sales including total, active, completed sales
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: Sale statistics retrieved successfully
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
 *                     totalSales:
 *                       type: number
 *                       example: 150
 *                     activeSales:
 *                       type: number
 *                       example: 100
 *                     completedSales:
 *                       type: number
 *                       example: 40
 *                     cancelledSales:
 *                       type: number
 *                       example: 10
 *                     totalRevenue:
 *                       type: number
 *                       example: 500000000
 *                     totalPaid:
 *                       type: number
 *                       example: 300000000
 *                     totalDue:
 *                       type: number
 *                       example: 200000000
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticate, getSaleStats);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     description: Retrieve detailed information for a specific sale including stages and payments
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update sale
 *     description: Update sale information and status
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalPrice:
 *                 type: number
 *                 minimum: 0.01
 *               status:
 *                 type: string
 *                 enum: [Active, Completed, Cancelled, On Hold]
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 *   delete:
 *     summary: Delete sale
 *     description: Delete a sale record (Admin only)
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
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
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:id', authenticate, getSaleById);

router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER]),
  validate(updateSaleValidation),
  updateSale
);

router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), deleteSale);

/**
 * @swagger
 * /sales/{id}/stages/{stageId}:
 *   put:
 *     summary: Update sale stage
 *     description: Update received amount and status for a specific sale stage
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stage ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receivedAmount
 *             properties:
 *               receivedAmount:
 *                 type: number
 *                 minimum: 0
 *                 example: 500000
 *               status:
 *                 type: string
 *                 enum: [Pending, InProgress, Completed, Cancelled]
 *                 example: Completed
 *     responses:
 *       200:
 *         description: Sale stage updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sale or stage not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router.put(
  '/:id/stages/:stageId',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.ACCOUNT_MANAGER]),
  validate(updateStageValidation),
  updateSaleStage
);

export default router;
