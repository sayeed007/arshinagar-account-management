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
 * @route   POST /api/land/rs-numbers
 * @desc    Create new RS Number
 * @access  AccountManager or higher
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
 * @route   GET /api/land/rs-numbers
 * @desc    Get all RS Numbers with pagination and filters
 * @access  AccountManager or higher
 */
router.get('/rs-numbers', accountManagerOrHigher, asyncHandler(getAllRSNumbers));

/**
 * @route   GET /api/land/rs-numbers/:id
 * @desc    Get RS Number by ID with plots
 * @access  AccountManager or higher
 */
router.get('/rs-numbers/:id', accountManagerOrHigher, asyncHandler(getRSNumberById));

/**
 * @route   PUT /api/land/rs-numbers/:id
 * @desc    Update RS Number
 * @access  AccountManager or higher
 */
router.put(
  '/rs-numbers/:id',
  accountManagerOrHigher,
  updateRSNumberValidation,
  handleValidationErrors,
  auditLog(AuditAction.UPDATE, 'RSNumber'),
  asyncHandler(updateRSNumber)
);

/**
 * @route   DELETE /api/land/rs-numbers/:id
 * @desc    Delete RS Number (soft delete)
 * @access  HOF or Admin
 */
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
 * @route   POST /api/land/plots
 * @desc    Create new plot
 * @access  AccountManager or higher
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
 * @route   GET /api/land/plots/rs-number/:rsNumberId
 * @desc    Get all plots for a specific RS Number
 * @access  AccountManager or higher
 */
router.get(
  '/plots/rs-number/:rsNumberId',
  accountManagerOrHigher,
  asyncHandler(getPlotsByRSNumber)
);

/**
 * @route   GET /api/land/plots/:id
 * @desc    Get plot by ID
 * @access  AccountManager or higher
 */
router.get('/plots/:id', accountManagerOrHigher, asyncHandler(getPlotById));

/**
 * @route   PUT /api/land/plots/:id
 * @desc    Update plot
 * @access  AccountManager or higher
 */
router.put(
  '/plots/:id',
  accountManagerOrHigher,
  updatePlotValidation,
  handleValidationErrors,
  auditLog(AuditAction.UPDATE, 'Plot'),
  asyncHandler(updatePlot)
);

/**
 * @route   DELETE /api/land/plots/:id
 * @desc    Delete plot (soft delete)
 * @access  HOF or Admin
 */
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
 * @route   GET /api/land/stats
 * @desc    Get land statistics
 * @access  AccountManager or higher
 */
router.get('/stats', accountManagerOrHigher, asyncHandler(getLandStats));

export default router;
