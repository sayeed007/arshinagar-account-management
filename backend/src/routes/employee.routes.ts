import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeCosts,
  getEmployeeStats,
} from '../controllers/employeeController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', getEmployeeStats);

router
  .route('/')
  .get(getAllEmployees)
  .post(authorize('Admin', 'AccountManager'), createEmployee);

router
  .route('/:id')
  .get(getEmployeeById)
  .put(authorize('Admin', 'AccountManager'), updateEmployee)
  .delete(authorize('Admin'), deleteEmployee);

router.get('/:id/costs', getEmployeeCosts);

export default router;
