import express from 'express';
import * as smsController from '../controllers/smsController';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /sms/templates:
 *   get:
 *     summary: Get all SMS templates
 *     description: Get list of all SMS templates with pagination
 *     tags: [SMS]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: SMS templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       templateCode:
 *                         type: string
 *                       content:
 *                         type: string
 *                       variables:
 *                         type: array
 *                         items:
 *                           type: string
 *                       isActive:
 *                         type: boolean
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or Admin access required
 *   post:
 *     summary: Create SMS template
 *     description: Create a new SMS template (Admin only)
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - templateCode
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *                 example: Payment Reminder
 *               templateCode:
 *                 type: string
 *                 example: PAYMENT_REMINDER
 *               content:
 *                 type: string
 *                 example: Dear {{clientName}}, your payment of {{amount}} is due on {{dueDate}}.
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['clientName', 'amount', 'dueDate']
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: SMS template created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/templates', requireRole(['Admin', 'AccountManager']), smsController.getSMSTemplates);
router.post('/templates', requireRole(['Admin']), smsController.createSMSTemplate);

/**
 * @swagger
 * /sms/templates/{id}:
 *   get:
 *     summary: Get SMS template by ID
 *     description: Retrieve detailed information for a specific SMS template
 *     tags: [SMS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: SMS template retrieved successfully
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   put:
 *     summary: Update SMS template
 *     description: Update an existing SMS template (Admin only)
 *     tags: [SMS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               templateCode:
 *                 type: string
 *               content:
 *                 type: string
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: SMS template updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *   delete:
 *     summary: Delete SMS template
 *     description: Delete an SMS template (Admin only)
 *     tags: [SMS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SMS template deleted successfully
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/templates/:id', requireRole(['Admin', 'AccountManager']), smsController.getSMSTemplateById);
router.put('/templates/:id', requireRole(['Admin']), smsController.updateSMSTemplate);
router.delete('/templates/:id', requireRole(['Admin']), smsController.deleteSMSTemplate);

/**
 * @swagger
 * /sms/logs:
 *   get:
 *     summary: Get SMS logs
 *     description: Get list of all sent SMS with pagination and filters
 *     tags: [SMS]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [sent, failed, pending]
 *         description: Filter by SMS status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: SMS logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       recipient:
 *                         type: string
 *                       message:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [sent, failed, pending]
 *                       sentAt:
 *                         type: string
 *                         format: date-time
 *                       errorMessage:
 *                         type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/logs', requireRole(['Admin', 'AccountManager', 'HOF']), smsController.getSMSLogs);

/**
 * @swagger
 * /sms/stats:
 *   get:
 *     summary: Get SMS statistics
 *     description: Get aggregated statistics for SMS sending
 *     tags: [SMS]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: SMS statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSent:
 *                       type: number
 *                     totalFailed:
 *                       type: number
 *                     totalPending:
 *                       type: number
 *                     successRate:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', requireRole(['Admin', 'AccountManager', 'HOF']), smsController.getSMSStats);

/**
 * @swagger
 * /sms/send-test:
 *   post:
 *     summary: Send test SMS
 *     description: Send a test SMS to verify configuration
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - message
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: +8801712345678
 *               message:
 *                 type: string
 *                 example: This is a test SMS
 *     responses:
 *       200:
 *         description: Test SMS sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid phone number or message
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/send-test', requireRole(['Admin', 'AccountManager']), smsController.sendTestSMS);

/**
 * @swagger
 * /sms/send-bulk:
 *   post:
 *     summary: Send bulk SMS
 *     description: Send SMS to multiple recipients using a template
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - recipientType
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: SMS template ID
 *               recipientType:
 *                 type: string
 *                 enum: [all_clients, specific_clients, due_installments]
 *                 description: Type of recipients
 *               clientIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Required if recipientType is specific_clients
 *               filters:
 *                 type: object
 *                 description: Additional filters for recipients
 *     responses:
 *       200:
 *         description: Bulk SMS sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSent:
 *                       type: number
 *                     totalFailed:
 *                       type: number
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/send-bulk', requireRole(['Admin', 'AccountManager']), smsController.sendBulkSMS);

/**
 * @swagger
 * /sms/preview-recipients:
 *   post:
 *     summary: Preview bulk SMS recipients
 *     description: Preview the list of recipients before sending bulk SMS
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientType
 *             properties:
 *               recipientType:
 *                 type: string
 *                 enum: [all_clients, specific_clients, due_installments]
 *               clientIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               filters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Recipients preview generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRecipients:
 *                       type: number
 *                     recipients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           phone:
 *                             type: string
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/preview-recipients', requireRole(['Admin', 'AccountManager']), smsController.previewBulkSMSRecipients);

export default router;
