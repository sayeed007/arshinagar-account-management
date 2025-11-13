import express from 'express';
import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  submitExpense,
  approveExpense,
  rejectExpense,
  getApprovalQueue,
  deleteExpense,
  getExpenseStats,
} from '../controllers/expenseController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /expenses/approval-queue:
 *   get:
 *     summary: Get expenses approval queue
 *     description: Get list of expenses pending approval
 *     tags: [Expenses]
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
 *                     $ref: '#/components/schemas/Expense'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or HOF access required
 */
router.get('/approval-queue', authorize('AccountManager', 'HOF'), getApprovalQueue);

/**
 * @swagger
 * /expenses/stats:
 *   get:
 *     summary: Get expense statistics
 *     description: Get aggregated statistics for expenses including total amount, by category, and by status
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses until this date
 *     responses:
 *       200:
 *         description: Expense statistics retrieved successfully
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
 *                     totalExpenses:
 *                       type: number
 *                       example: 5000000
 *                     approvedExpenses:
 *                       type: number
 *                       example: 4500000
 *                     pendingExpenses:
 *                       type: number
 *                       example: 500000
 *                     expensesByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           total:
 *                             type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getExpenseStats);

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get all expenses
 *     description: Get paginated list of all expenses with optional filters
 *     tags: [Expenses]
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
 *         description: Filter by expense status
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by expense category ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses until this date
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
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
 *                     $ref: '#/components/schemas/Expense'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new expense
 *     description: Create a new expense record
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - amount
 *               - description
 *               - expenseDate
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: MongoDB ObjectId of the expense category
 *                 example: 507f1f77bcf86cd799439011
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 50000
 *               description:
 *                 type: string
 *                 example: Office supplies purchase
 *               expenseDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Bank Transfer, Cheque]
 *                 example: Bank Transfer
 *               bankAccountId:
 *                 type: string
 *                 description: MongoDB ObjectId of the bank account
 *                 example: 507f1f77bcf86cd799439012
 *               referenceNumber:
 *                 type: string
 *                 example: INV-2024-001
 *               notes:
 *                 type: string
 *                 example: Quarterly supplies order
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router
  .route('/')
  .get(getAllExpenses)
  .post(authorize('Admin', 'AccountManager'), createExpense);

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     description: Retrieve detailed information for a specific expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update expense
 *     description: Update expense information
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               description:
 *                 type: string
 *               expenseDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Bank Transfer, Cheque]
 *               bankAccountId:
 *                 type: string
 *               referenceNumber:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Expense not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 *   delete:
 *     summary: Delete expense
 *     description: Delete an expense record (Admin only)
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
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
 *         description: Expense not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route('/:id')
  .get(getExpenseById)
  .put(authorize('Admin', 'AccountManager'), updateExpense)
  .delete(authorize('Admin'), deleteExpense);

/**
 * @swagger
 * /expenses/{id}/submit:
 *   post:
 *     summary: Submit expense for approval
 *     description: Submit an expense for approval workflow
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense submitted for approval successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense not found
 *       400:
 *         description: Expense cannot be submitted (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router.post('/:id/submit', authorize('Admin', 'AccountManager'), submitExpense);

/**
 * @swagger
 * /expenses/{id}/approve:
 *   post:
 *     summary: Approve expense
 *     description: Approve an expense that is pending approval
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Approved - expense verified
 *     responses:
 *       200:
 *         description: Expense approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense not found
 *       400:
 *         description: Expense cannot be approved (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or HOF access required
 */
router.post('/:id/approve', authorize('AccountManager', 'HOF'), approveExpense);

/**
 * @swagger
 * /expenses/{id}/reject:
 *   post:
 *     summary: Reject expense
 *     description: Reject an expense that is pending approval
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Rejected - insufficient documentation
 *     responses:
 *       200:
 *         description: Expense rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense not found
 *       400:
 *         description: Expense cannot be rejected (invalid status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or HOF access required
 */
router.post('/:id/reject', authorize('AccountManager', 'HOF'), rejectExpense);

export default router;
