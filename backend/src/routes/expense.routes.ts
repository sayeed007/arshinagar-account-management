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

router.get('/approval-queue', authorize('AccountManager', 'HOF'), getApprovalQueue);
router.get('/stats', getExpenseStats);

router
  .route('/')
  .get(getAllExpenses)
  .post(authorize('Admin', 'AccountManager'), createExpense);

router
  .route('/:id')
  .get(getExpenseById)
  .put(authorize('Admin', 'AccountManager'), updateExpense)
  .delete(authorize('Admin'), deleteExpense);

router.post('/:id/submit', authorize('Admin', 'AccountManager'), submitExpense);
router.post('/:id/approve', authorize('AccountManager', 'HOF'), approveExpense);
router.post('/:id/reject', authorize('AccountManager', 'HOF'), rejectExpense);

export default router;
