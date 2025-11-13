import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/expenseCategoryController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /expense-categories:
 *   get:
 *     summary: Get all expense categories
 *     description: Get list of all expense categories
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Expense categories retrieved successfully
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
 *                     $ref: '#/components/schemas/ExpenseCategory'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new expense category
 *     description: Create a new expense category
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Office Supplies
 *               description:
 *                 type: string
 *                 example: General office supplies and stationery
 *               code:
 *                 type: string
 *                 example: OFF-SUP
 *     responses:
 *       201:
 *         description: Expense category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ExpenseCategory'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router
  .route('/')
  .get(getAllCategories)
  .post(authorize('Admin', 'AccountManager'), createCategory);

/**
 * @swagger
 * /expense-categories/{id}:
 *   get:
 *     summary: Get expense category by ID
 *     description: Retrieve detailed information for a specific expense category
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense category ID
 *     responses:
 *       200:
 *         description: Expense category details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ExpenseCategory'
 *       404:
 *         description: Expense category not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update expense category
 *     description: Update expense category information
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Expense category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ExpenseCategory'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Expense category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 *   delete:
 *     summary: Delete expense category
 *     description: Delete an expense category (Admin only)
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense category ID
 *     responses:
 *       200:
 *         description: Expense category deleted successfully
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
 *         description: Expense category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route('/:id')
  .get(getCategoryById)
  .put(authorize('Admin', 'AccountManager'), updateCategory)
  .delete(authorize('Admin'), deleteCategory);

export default router;
