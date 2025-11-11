import express from 'express';
import {
  getAllEmployeeCosts,
  getEmployeeCostById,
  createEmployeeCost,
  updateEmployeeCost,
  deleteEmployeeCost,
  getPayrollSummary,
  getEmployeeCostStats,
} from '../controllers/employeeCostController';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/payroll/summary', getPayrollSummary);
router.get('/stats', getEmployeeCostStats);

router
  .route('/')
  .get(getAllEmployeeCosts)
  .post(authorize('Admin', 'AccountManager'), createEmployeeCost);

router
  .route('/:id')
  .get(getEmployeeCostById)
  .put(authorize('Admin', 'AccountManager'), updateEmployeeCost)
  .delete(authorize('Admin'), deleteEmployeeCost);

export default router;
