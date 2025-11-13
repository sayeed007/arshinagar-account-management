import express from 'express';
import * as settingsController from '../controllers/settingsController';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication and Admin role
router.use(authenticateToken);
router.use(requireRole(['Admin']));

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get all settings
 *     description: Get list of all system settings (Admin only)
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
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
 *                       key:
 *                         type: string
 *                         example: company_name
 *                       value:
 *                         type: string
 *                         example: Arshinagar Real Estate
 *                       description:
 *                         type: string
 *                         example: Company name for reports and invoices
 *                       category:
 *                         type: string
 *                         example: general
 *                       dataType:
 *                         type: string
 *                         enum: [string, number, boolean, json]
 *                       isEncrypted:
 *                         type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *   post:
 *     summary: Create or update setting
 *     description: Create a new setting or update existing one (upsert)
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *                 example: sms_api_key
 *               value:
 *                 type: string
 *                 example: your_api_key_here
 *               description:
 *                 type: string
 *                 example: SMS gateway API key
 *               category:
 *                 type: string
 *                 example: integrations
 *               dataType:
 *                 type: string
 *                 enum: [string, number, boolean, json]
 *                 default: string
 *               isEncrypted:
 *                 type: boolean
 *                 default: false
 *                 description: Encrypt sensitive values like API keys
 *     responses:
 *       200:
 *         description: Setting created/updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', settingsController.getAllSettings);
router.post('/', settingsController.upsertSetting);

/**
 * @swagger
 * /settings/{key}:
 *   get:
 *     summary: Get setting by key
 *     description: Retrieve a specific setting by its key
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *         example: company_name
 *     responses:
 *       200:
 *         description: Setting retrieved successfully
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
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *                     description:
 *                       type: string
 *       404:
 *         description: Setting not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *   put:
 *     summary: Update setting value
 *     description: Update the value of an existing setting
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 description: New value for the setting
 *     responses:
 *       200:
 *         description: Setting updated successfully
 *       404:
 *         description: Setting not found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *   delete:
 *     summary: Delete setting
 *     description: Delete a system setting
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *     responses:
 *       200:
 *         description: Setting deleted successfully
 *       404:
 *         description: Setting not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:key', settingsController.getSettingByKey);
router.put('/:key', settingsController.updateSettingValue);
router.delete('/:key', settingsController.deleteSetting);

/**
 * @swagger
 * /settings/finance/lock-date:
 *   get:
 *     summary: Get financial lock date
 *     description: Get the current financial lock date (transactions before this date cannot be modified)
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Lock date retrieved successfully
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
 *                     lockDate:
 *                       type: string
 *                       format: date
 *                       example: 2024-01-31
 *                     description:
 *                       type: string
 *                       example: Financial records before this date are locked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *   post:
 *     summary: Set financial lock date
 *     description: Set or update the financial lock date
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lockDate
 *             properties:
 *               lockDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-31
 *                 description: Date before which transactions will be locked
 *     responses:
 *       200:
 *         description: Lock date set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     lockDate:
 *                       type: string
 *                       format: date
 *       400:
 *         description: Invalid date format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/finance/lock-date', settingsController.getLockDate);
router.post('/finance/lock-date', settingsController.setLockDate);

export default router;
