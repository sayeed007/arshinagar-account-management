import express from 'express';
import * as settingsController from '../controllers/settingsController';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication and Admin role
router.use(authenticateToken);
router.use(requireRole(['Admin']));

// Settings CRUD
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);
router.post('/', settingsController.upsertSetting);
router.put('/:key', settingsController.updateSettingValue);
router.delete('/:key', settingsController.deleteSetting);

// Lock date
router.get('/finance/lock-date', settingsController.getLockDate);
router.post('/finance/lock-date', settingsController.setLockDate);

export default router;
