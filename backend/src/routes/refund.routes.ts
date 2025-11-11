import express from 'express';
import {
  getAllRefunds,
  getRefundById,
  createRefundSchedule,
  submitRefund,
  approveRefund,
  rejectRefund,
  getApprovalQueue,
  markRefundAsPaid,
  getRefundStats,
} from '../controllers/refundController';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/approval-queue', authorize('Admin', 'AccountManager', 'HOF'), getApprovalQueue);
router.get('/stats', getRefundStats);

router
  .route('/')
  .get(getAllRefunds)
  .post(authorize('Admin', 'AccountManager'), createRefundSchedule);

router
  .route('/:id')
  .get(getRefundById);

router.post('/:id/submit', authorize('Admin', 'AccountManager'), submitRefund);
router.post('/:id/approve', authorize('Admin', 'AccountManager', 'HOF'), approveRefund);
router.post('/:id/reject', authorize('Admin', 'AccountManager', 'HOF'), rejectRefund);
router.post('/:id/mark-paid', authorize('Admin', 'AccountManager'), markRefundAsPaid);

export default router;
