import express from 'express';
import {
  getAllCashAccounts,
  getCashAccountById,
  createCashAccount,
  updateCashAccount,
  deleteCashAccount,
  getCashAccountStats,
} from '../controllers/cashAccountController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /cash-accounts/stats:
 *   get:
 *     summary: Get cash account statistics
 *     description: Get aggregated statistics for cash accounts including total balance and transaction summary
 *     tags: [Bank Accounts]
 *     responses:
 *       200:
 *         description: Cash account statistics retrieved successfully
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
 *                     totalAccounts:
 *                       type: number
 *                       example: 3
 *                     totalBalance:
 *                       type: number
 *                       example: 500000
 *                     totalReceipts:
 *                       type: number
 *                       example: 2000000
 *                     totalPayments:
 *                       type: number
 *                       example: 1500000
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getCashAccountStats);

/**
 * @swagger
 * /cash-accounts:
 *   get:
 *     summary: Get all cash accounts
 *     description: Get list of all cash accounts
 *     tags: [Bank Accounts]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Cash accounts retrieved successfully
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
 *                     $ref: '#/components/schemas/CashAccount'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new cash account
 *     description: Create a new cash account record
 *     tags: [Bank Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountName
 *             properties:
 *               accountName:
 *                 type: string
 *                 example: Main Office Cash
 *               location:
 *                 type: string
 *                 example: Head Office
 *               balance:
 *                 type: number
 *                 example: 100000
 *               custodian:
 *                 type: string
 *                 example: Mohammad Karim
 *               notes:
 *                 type: string
 *                 example: Petty cash for daily expenses
 *     responses:
 *       201:
 *         description: Cash account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CashAccount'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.get('/', getAllCashAccounts);
router.post('/', authorize('Admin', 'AccountManager', 'HOF'), createCashAccount);

/**
 * @swagger
 * /cash-accounts/{id}:
 *   get:
 *     summary: Get cash account by ID
 *     description: Retrieve detailed information for a specific cash account
 *     tags: [Bank Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cash account ID
 *     responses:
 *       200:
 *         description: Cash account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CashAccount'
 *       404:
 *         description: Cash account not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update cash account
 *     description: Update cash account information
 *     tags: [Bank Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cash account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountName:
 *                 type: string
 *               location:
 *                 type: string
 *               balance:
 *                 type: number
 *               custodian:
 *                 type: string
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cash account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CashAccount'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Cash account not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 *   delete:
 *     summary: Delete cash account
 *     description: Delete a cash account record (Admin only)
 *     tags: [Bank Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cash account ID
 *     responses:
 *       200:
 *         description: Cash account deleted successfully
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
 *         description: Cash account not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:id', getCashAccountById);
router.put('/:id', authorize('Admin', 'AccountManager', 'HOF'), updateCashAccount);
router.delete('/:id', authorize('Admin'), deleteCashAccount);

export default router;
