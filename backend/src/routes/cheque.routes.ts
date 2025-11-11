import express from 'express';
import {
  getAllCheques,
  getChequeById,
  createCheque,
  updateCheque,
  markChequeAsCleared,
  markChequeAsBounced,
  cancelCheque,
  deleteCheque,
  getDueCheques,
  getUpcomingCheques,
  getChequeStats,
} from '../controllers/chequeController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get statistics and special views
router.get('/stats', getChequeStats);
router.get('/due', getDueCheques);
router.get('/upcoming', getUpcomingCheques);

// Status management
router.post('/:id/clear', authorize('Admin', 'AccountManager', 'HOF'), markChequeAsCleared);
router.post('/:id/bounce', authorize('Admin', 'AccountManager', 'HOF'), markChequeAsBounced);
router.post('/:id/cancel', authorize('Admin', 'AccountManager', 'HOF'), cancelCheque);

// CRUD operations
router.get('/', getAllCheques);
router.get('/:id', getChequeById);
router.post('/', authorize('Admin', 'AccountManager', 'HOF'), createCheque);
router.put('/:id', authorize('Admin', 'AccountManager', 'HOF'), updateCheque);
router.delete('/:id', authorize('Admin'), deleteCheque);

export default router;
