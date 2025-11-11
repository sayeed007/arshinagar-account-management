import express from 'express';
import * as smsController from '../controllers/smsController';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// SMS Templates (Admin only)
router.get('/templates', requireRole(['Admin', 'AccountManager']), smsController.getSMSTemplates);
router.get('/templates/:id', requireRole(['Admin', 'AccountManager']), smsController.getSMSTemplateById);
router.post('/templates', requireRole(['Admin']), smsController.createSMSTemplate);
router.put('/templates/:id', requireRole(['Admin']), smsController.updateSMSTemplate);
router.delete('/templates/:id', requireRole(['Admin']), smsController.deleteSMSTemplate);

// SMS Logs
router.get('/logs', requireRole(['Admin', 'AccountManager', 'HOF']), smsController.getSMSLogs);
router.get('/stats', requireRole(['Admin', 'AccountManager', 'HOF']), smsController.getSMSStats);

// Send SMS
router.post('/send-test', requireRole(['Admin', 'AccountManager']), smsController.sendTestSMS);
router.post('/send-bulk', requireRole(['Admin', 'AccountManager']), smsController.sendBulkSMS);
router.post('/preview-recipients', requireRole(['Admin', 'AccountManager']), smsController.previewBulkSMSRecipients);

export default router;
