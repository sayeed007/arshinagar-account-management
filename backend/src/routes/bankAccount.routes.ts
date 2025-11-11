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

// Get statistics
router.get('/stats', getBankAccountStats);

// CRUD operations
router.get('/', getAllBankAccounts);
router.get('/:id', getBankAccountById);
router.post('/', authorize('Admin', 'AccountManager', 'HOF'), createBankAccount);
router.put('/:id', authorize('Admin', 'AccountManager', 'HOF'), updateBankAccount);
router.delete('/:id', authorize('Admin'), deleteBankAccount);

export default router;
