import express from 'express';
import {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getBankAccountStats,
} from '../controllers/bankAccountController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /bank-accounts/stats:
 *   get:
 *     summary: Get bank account statistics
 *     description: Get aggregated statistics for bank accounts including total balance and transaction summary
 *     tags: [Bank Accounts]
 *     responses:
 *       200:
 *         description: Bank account statistics retrieved successfully
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
 *                       example: 5
 *                     totalBalance:
 *                       type: number
 *                       example: 10000000
 *                     totalDeposits:
 *                       type: number
 *                       example: 25000000
 *                     totalWithdrawals:
 *                       type: number
 *                       example: 15000000
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getBankAccountStats);

/**
 * @swagger
 * /bank-accounts:
 *   get:
 *     summary: Get all bank accounts
 *     description: Get list of all bank accounts
 *     tags: [Bank Accounts]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Bank accounts retrieved successfully
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
 *                     $ref: '#/components/schemas/BankAccount'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new bank account
 *     description: Create a new bank account record
 *     tags: [Bank Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bankName
 *               - accountNumber
 *               - accountTitle
 *             properties:
 *               bankName:
 *                 type: string
 *                 example: Standard Chartered Bank
 *               branchName:
 *                 type: string
 *                 example: Gulshan Branch
 *               accountNumber:
 *                 type: string
 *                 example: 01-1234567-01
 *               accountTitle:
 *                 type: string
 *                 example: Arshinagar Realty Ltd
 *               accountType:
 *                 type: string
 *                 enum: [Savings, Current, Fixed Deposit]
 *                 example: Current
 *               balance:
 *                 type: number
 *                 example: 1000000
 *               swiftCode:
 *                 type: string
 *                 example: SCBLBDDH
 *               notes:
 *                 type: string
 *                 example: Primary business account
 *     responses:
 *       201:
 *         description: Bank account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BankAccount'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 */
router.get('/', getAllBankAccounts);
router.post('/', authorize('Admin', 'AccountManager', 'HOF'), createBankAccount);

/**
 * @swagger
 * /bank-accounts/{id}:
 *   get:
 *     summary: Get bank account by ID
 *     description: Retrieve detailed information for a specific bank account
 *     tags: [Bank Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Bank account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BankAccount'
 *       404:
 *         description: Bank account not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update bank account
 *     description: Update bank account information
 *     tags: [Bank Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *               branchName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               accountTitle:
 *                 type: string
 *               accountType:
 *                 type: string
 *                 enum: [Savings, Current, Fixed Deposit]
 *               balance:
 *                 type: number
 *               swiftCode:
 *                 type: string
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bank account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BankAccount'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Bank account not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin, Account Manager, or HOF access required
 *   delete:
 *     summary: Delete bank account
 *     description: Delete a bank account record (Admin only)
 *     tags: [Bank Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Bank account deleted successfully
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
 *         description: Bank account not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:id', getBankAccountById);
router.put('/:id', authorize('Admin', 'AccountManager', 'HOF'), updateBankAccount);
router.delete('/:id', authorize('Admin'), deleteBankAccount);

export default router;
