import express from 'express';
import * as reportController from '../controllers/reportController';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /reports/stats/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Get aggregated statistics for dashboard display including sales, receipts, expenses
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                     totalReceipts:
 *                       type: number
 *                     totalExpenses:
 *                       type: number
 *                     netBalance:
 *                       type: number
 *                     activePlots:
 *                       type: number
 *                     pendingApprovals:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/stats/dashboard', reportController.getDashboardStats);

/**
 * @swagger
 * /reports/financial/day-book:
 *   get:
 *     summary: Get day book report
 *     description: Get day-wise transaction report showing all receipts and payments
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *         example: 2024-01-01
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *         example: 2024-01-31
 *     responses:
 *       200:
 *         description: Day book report retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       particulars:
 *                         type: string
 *                       receipts:
 *                         type: number
 *                       payments:
 *                         type: number
 *                       balance:
 *                         type: number
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager, HOF, or Admin access required
 */
router.get(
  '/financial/day-book',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getDayBook
);

/**
 * @swagger
 * /reports/financial/cash-book:
 *   get:
 *     summary: Get cash book report
 *     description: Get cash transaction report showing all cash receipts and payments
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Filter by specific cash account
 *     responses:
 *       200:
 *         description: Cash book report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager, HOF, or Admin access required
 */
router.get(
  '/financial/cash-book',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getCashBook
);

/**
 * @swagger
 * /reports/financial/bank-book:
 *   get:
 *     summary: Get bank book report
 *     description: Get bank transaction report showing all bank receipts and payments
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Filter by specific bank account
 *     responses:
 *       200:
 *         description: Bank book report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager, HOF, or Admin access required
 */
router.get(
  '/financial/bank-book',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getBankBook
);

/**
 * @swagger
 * /reports/financial/receipt-payment:
 *   get:
 *     summary: Get receipt and payment register
 *     description: Get comprehensive receipt and payment register for financial reporting
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Receipt and payment register retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager, HOF, or Admin access required
 */
router.get(
  '/financial/receipt-payment',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getReceiptPaymentRegister
);

/**
 * @swagger
 * /reports/sales/customer-statement/{clientId}:
 *   get:
 *     summary: Get customer statement
 *     description: Get detailed statement for a specific customer showing all sales and payments
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Customer statement retrieved successfully
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
 *                     client:
 *                       type: object
 *                     sales:
 *                       type: array
 *                       items:
 *                         type: object
 *                     receipts:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalSales:
 *                       type: number
 *                     totalPaid:
 *                       type: number
 *                     balance:
 *                       type: number
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/sales/customer-statement/:clientId',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getCustomerStatement
);

/**
 * @swagger
 * /reports/sales/aging:
 *   get:
 *     summary: Get aging report
 *     description: Get receivables aging report showing outstanding amounts by age
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: asOfDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Report as of this date (defaults to today)
 *     responses:
 *       200:
 *         description: Aging report retrieved successfully
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
 *                     current:
 *                       type: number
 *                       description: Amount due within 30 days
 *                     days31to60:
 *                       type: number
 *                       description: Amount due 31-60 days
 *                     days61to90:
 *                       type: number
 *                       description: Amount due 61-90 days
 *                     over90:
 *                       type: number
 *                       description: Amount due over 90 days
 *                     total:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/sales/aging',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getAgingReport
);

/**
 * @swagger
 * /reports/sales/stage-wise-collection:
 *   get:
 *     summary: Get stage-wise collection report
 *     description: Get collection report grouped by sale stages (Booking, Installment, Registration, etc.)
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Stage-wise collection report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/sales/stage-wise-collection',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getStageWiseCollectionReport
);

/**
 * @swagger
 * /reports/expense/by-category:
 *   get:
 *     summary: Get expense by category report
 *     description: Get expense analysis grouped by expense categories
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Expense by category report retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       totalAmount:
 *                         type: number
 *                       count:
 *                         type: number
 *                       percentage:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/expense/by-category',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getExpenseByCategoryReport
);

/**
 * @swagger
 * /reports/employee/cost-summary:
 *   get:
 *     summary: Get employee cost summary
 *     description: Get payroll and employee cost summary report
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by specific employee
 *     responses:
 *       200:
 *         description: Employee cost summary retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       employee:
 *                         type: object
 *                       totalSalary:
 *                         type: number
 *                       totalAllowances:
 *                         type: number
 *                       totalDeductions:
 *                         type: number
 *                       netPayable:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - HOF or Admin access required
 */
router.get(
  '/employee/cost-summary',
  requireRole(['Admin', 'HOF']),
  reportController.getEmployeeCostSummaryReport
);

export default router;
