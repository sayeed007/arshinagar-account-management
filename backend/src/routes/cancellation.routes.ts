import express from 'express';
import {
  getAllCancellations,
  getCancellationById,
  createCancellation,
  updateCancellation,
  approveCancellation,
  rejectCancellation,
  deleteCancellation,
  getCancellationStats,
} from '../controllers/cancellationController';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/stats', getCancellationStats);

router
  .route('/')
  .get(getAllCancellations)
  .post(authorize('Admin', 'AccountManager'), createCancellation);

router
  .route('/:id')
  .get(getCancellationById)
  .put(authorize('Admin', 'AccountManager'), updateCancellation)
  .delete(authorize('Admin'), deleteCancellation);

router.post('/:id/approve', authorize('Admin', 'AccountManager', 'HOF'), approveCancellation);
router.post('/:id/reject', authorize('Admin', 'AccountManager', 'HOF'), rejectCancellation);

export default router;
