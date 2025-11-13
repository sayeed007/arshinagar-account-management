import { Router } from 'express';
import {
  createRSNumber,
  getAllRSNumbers,
  getRSNumberById,
  updateRSNumber,
  deleteRSNumber,
  createPlot,
  getPlotsByRSNumber,
  getPlotById,
  updatePlot,
  deletePlot,
  getLandStats,
} from '../controllers/landController';
import { authenticate } from '../middlewares/auth.middleware';
import { accountManagerOrHigher, hofOrAdmin } from '../middlewares/rbac.middleware';
import {
  createRSNumberValidation,
  updateRSNumberValidation,
  createPlotValidation,
  updatePlotValidation,
  handleValidationErrors,
} from '../middlewares/validation.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { AuditAction } from '../types';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * ===========================
 * RS Number Routes
 * ===========================
 */

/**
 * @swagger
 * /land/rs-numbers:
 *   post:
 *     summary: Create new RS Number
 *     description: Create a new RS Number (Record of Rights) for land parcels
 *     tags: [Land]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rsNumber
 *               - mouza
 *               - jlNumber
 *             properties:
 *               rsNumber:
 *                 type: string
 *                 example: RS-12345
 *               mouza:
 *                 type: string
 *                 example: Dhanmondi
 *               jlNumber:
 *                 type: string
 *                 example: JL-001
 *               khatianNumber:
 *                 type: string
 *                 example: KH-456
 *               totalArea:
 *                 type: number
 *                 example: 5000
 *               location:
 *                 type: string
 *                 example: Dhaka
 *               notes:
 *                 type: string
 *                 example: Prime location near main road
 *     responses:
 *       201:
 *         description: RS Number created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RSNumber'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or higher access required
 */
router.post(
  '/rs-numbers',
  accountManagerOrHigher,
  createRSNumberValidation,
  handleValidationErrors,
  auditLog(AuditAction.CREATE, 'RSNumber'),
  asyncHandler(createRSNumber)
);

/**
 * @swagger
 * /land/rs-numbers:
 *   get:
 *     summary: Get all RS Numbers
 *     description: Get paginated list of RS Numbers with optional filters
 *     tags: [Land]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by RS number, mouza, or location
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: RS Numbers retrieved successfully
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
 *                     $ref: '#/components/schemas/RSNumber'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or higher access required
 */
router.get('/rs-numbers', accountManagerOrHigher, asyncHandler(getAllRSNumbers));

/**
 * @swagger
 * /land/rs-numbers/{id}:
 *   get:
 *     summary: Get RS Number by ID
 *     description: Retrieve detailed information for a specific RS Number including associated plots
 *     tags: [Land]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RS Number ID
 *     responses:
 *       200:
 *         description: RS Number details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RSNumber'
 *       404:
 *         description: RS Number not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or higher access required
 */
router.get('/rs-numbers/:id', accountManagerOrHigher, asyncHandler(getRSNumberById));

/**
 * @swagger
 * /land/rs-numbers/{id}:
 *   put:
 *     summary: Update RS Number
 *     description: Update RS Number information
 *     tags: [Land]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RS Number ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rsNumber:
 *                 type: string
 *               mouza:
 *                 type: string
 *               jlNumber:
 *                 type: string
 *               khatianNumber:
 *                 type: string
 *               totalArea:
 *                 type: number
 *               location:
 *                 type: string
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: RS Number updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RSNumber'
 *       400:
 *         description: Validation error
 *       404:
 *         description: RS Number not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or higher access required
 *   delete:
 *     summary: Delete RS Number
 *     description: Soft delete an RS Number (marks as inactive)
 *     tags: [Land]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RS Number ID
 *     responses:
 *       200:
 *         description: RS Number deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: RS Number not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - HOF or Admin access required
 */
router.put(
  '/rs-numbers/:id',
  accountManagerOrHigher,
  updateRSNumberValidation,
  handleValidationErrors,
  auditLog(AuditAction.UPDATE, 'RSNumber'),
  asyncHandler(updateRSNumber)
);

router.delete(
  '/rs-numbers/:id',
  hofOrAdmin,
  auditLog(AuditAction.DELETE, 'RSNumber'),
  asyncHandler(deleteRSNumber)
);

/**
 * ===========================
 * Plot Routes
 * ===========================
 */

/**
 * @swagger
 * /land/plots:
 *   post:
 *     summary: Create new plot
 *     description: Create a new plot within an RS Number
 *     tags: [Land]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rsNumberId
 *               - plotNumber
 *               - area
 *               - pricePerSqFt
 *             properties:
 *               rsNumberId:
 *                 type: string
 *                 description: MongoDB ObjectId of the RS Number
 *                 example: 507f1f77bcf86cd799439011
 *               plotNumber:
 *                 type: string
 *                 example: P-001
 *               area:
 *                 type: number
 *                 example: 2500
 *               pricePerSqFt:
 *                 type: number
 *                 example: 5000
 *               status:
 *                 type: string
 *                 enum: [Available, Reserved, Sold, Blocked]
 *                 example: Available
 *               facing:
 *                 type: string
 *                 example: North
 *               roadWidth:
 *                 type: number
 *                 example: 30
 *               notes:
 *                 type: string
 *                 example: Corner plot with excellent visibility
 *     responses:
 *       201:
 *         description: Plot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Plot'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or higher access required
 */
router.post(
  '/plots',
  accountManagerOrHigher,
  createPlotValidation,
  handleValidationErrors,
  auditLog(AuditAction.CREATE, 'Plot'),
  asyncHandler(createPlot)
);

/**
 * @swagger
 * /land/plots/rs-number/{rsNumberId}:
 *   get:
 *     summary: Get plots by RS Number
 *     description: Get all plots associated with a specific RS Number
 *     tags: [Land]
 *     parameters:
 *       - in: path
 *         name: rsNumberId
 *         required: true
 *         schema:
 *           type: string
 *         description: RS Number ID
 *     responses:
 *       200:
 *         description: Plots retrieved successfully
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
 *                     $ref: '#/components/schemas/Plot'
 *       404:
 *         description: RS Number not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or higher access required
 */
router.get(
  '/plots/rs-number/:rsNumberId',
  accountManagerOrHigher,
  asyncHandler(getPlotsByRSNumber)
);

/**
 * @swagger
 * /land/plots/{id}:
 *   get:
 *     summary: Get plot by ID
 *     description: Retrieve detailed information for a specific plot
 *     tags: [Land]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plot ID
 *     responses:
 *       200:
 *         description: Plot details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Plot'
 *       404:
 *         description: Plot not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or higher access required
 */
router.get('/plots/:id', accountManagerOrHigher, asyncHandler(getPlotById));

/**
 * @swagger
 * /land/plots/{id}:
 *   put:
 *     summary: Update plot
 *     description: Update plot information
 *     tags: [Land]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plotNumber:
 *                 type: string
 *               area:
 *                 type: number
 *               pricePerSqFt:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Available, Reserved, Sold, Blocked]
 *               facing:
 *                 type: string
 *               roadWidth:
 *                 type: number
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plot updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Plot'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Plot not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or higher access required
 *   delete:
 *     summary: Delete plot
 *     description: Soft delete a plot (marks as inactive)
 *     tags: [Land]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plot ID
 *     responses:
 *       200:
 *         description: Plot deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Plot not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - HOF or Admin access required
 */
router.put(
  '/plots/:id',
  accountManagerOrHigher,
  updatePlotValidation,
  handleValidationErrors,
  auditLog(AuditAction.UPDATE, 'Plot'),
  asyncHandler(updatePlot)
);

router.delete(
  '/plots/:id',
  hofOrAdmin,
  auditLog(AuditAction.DELETE, 'Plot'),
  asyncHandler(deletePlot)
);

/**
 * ===========================
 * Statistics Routes
 * ===========================
 */

/**
 * @swagger
 * /land/stats:
 *   get:
 *     summary: Get land statistics
 *     description: Get aggregated statistics for land including RS Numbers, plots, and availability
 *     tags: [Land]
 *     responses:
 *       200:
 *         description: Land statistics retrieved successfully
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
 *                     totalRSNumbers:
 *                       type: number
 *                       example: 25
 *                     activeRSNumbers:
 *                       type: number
 *                       example: 23
 *                     totalPlots:
 *                       type: number
 *                       example: 450
 *                     availablePlots:
 *                       type: number
 *                       example: 120
 *                     soldPlots:
 *                       type: number
 *                       example: 300
 *                     reservedPlots:
 *                       type: number
 *                       example: 20
 *                     blockedPlots:
 *                       type: number
 *                       example: 10
 *                     totalArea:
 *                       type: number
 *                       example: 1000000
 *                     totalValue:
 *                       type: number
 *                       example: 5000000000
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Account Manager or higher access required
 */
router.get('/stats', accountManagerOrHigher, asyncHandler(getLandStats));

export default router;
