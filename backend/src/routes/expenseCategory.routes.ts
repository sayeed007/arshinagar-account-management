import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/expenseCategoryController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router
  .route('/')
  .get(getAllCategories)
  .post(authorize('Admin', 'AccountManager'), createCategory);

router
  .route('/:id')
  .get(getCategoryById)
  .put(authorize('Admin', 'AccountManager'), updateCategory)
  .delete(authorize('Admin'), deleteCategory);

export default router;
