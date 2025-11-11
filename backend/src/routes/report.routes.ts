import express from 'express';
import * as reportController from '../controllers/reportController';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Dashboard stats (all authenticated users)
router.get('/stats/dashboard', reportController.getDashboardStats);

// Financial reports (AccountManager, HOF, Admin)
router.get(
  '/financial/day-book',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getDayBook
);
router.get(
  '/financial/cash-book',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getCashBook
);
router.get(
  '/financial/bank-book',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getBankBook
);
router.get(
  '/financial/receipt-payment',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getReceiptPaymentRegister
);

// Sales reports
router.get(
  '/sales/customer-statement/:clientId',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getCustomerStatement
);
router.get(
  '/sales/aging',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getAgingReport
);
router.get(
  '/sales/stage-wise-collection',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getStageWiseCollectionReport
);

// Expense reports
router.get(
  '/expense/by-category',
  requireRole(['Admin', 'AccountManager', 'HOF']),
  reportController.getExpenseByCategoryReport
);

// Employee reports
router.get(
  '/employee/cost-summary',
  requireRole(['Admin', 'HOF']),
  reportController.getEmployeeCostSummaryReport
);

export default router;
