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

// Get statistics
router.get('/stats', getCashAccountStats);

// CRUD operations
router.get('/', getAllCashAccounts);
router.get('/:id', getCashAccountById);
router.post('/', authorize('Admin', 'AccountManager', 'HOF'), createCashAccount);
router.put('/:id', authorize('Admin', 'AccountManager', 'HOF'), updateCashAccount);
router.delete('/:id', authorize('Admin'), deleteCashAccount);

export default router;
