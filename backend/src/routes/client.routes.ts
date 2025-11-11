import { Router } from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  restoreClient,
  searchClients,
  getClientStats,
} from '../controllers/clientController';
import { authenticate } from '../middlewares/auth.middleware';
import { accountManagerOrHigher, hofOrAdmin } from '../middlewares/rbac.middleware';
import {
  createClientValidation,
  updateClientValidation,
  handleValidationErrors,
} from '../middlewares/validation.middleware';
import { auditLog, auditChanges } from '../middlewares/audit.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { AuditAction } from '../types';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * @route   POST /api/clients
 * @desc    Create new client
 * @access  AccountManager or higher
 */
router.post(
  '/',
  accountManagerOrHigher,
  createClientValidation,
  handleValidationErrors,
  auditLog(AuditAction.CREATE, 'Client'),
  asyncHandler(createClient)
);

/**
 * @route   GET /api/clients
 * @desc    Get all clients with pagination and filters
 * @access  AccountManager or higher
 */
router.get('/', accountManagerOrHigher, asyncHandler(getAllClients));

/**
 * @route   GET /api/clients/search
 * @desc    Search clients (quick search)
 * @access  AccountManager or higher
 */
router.get('/search', accountManagerOrHigher, asyncHandler(searchClients));

/**
 * @route   GET /api/clients/stats
 * @desc    Get client statistics
 * @access  AccountManager or higher
 */
router.get('/stats', accountManagerOrHigher, asyncHandler(getClientStats));

/**
 * @route   GET /api/clients/:id
 * @desc    Get client by ID
 * @access  AccountManager or higher
 */
router.get('/:id', accountManagerOrHigher, asyncHandler(getClientById));

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client
 * @access  AccountManager or higher
 */
router.put(
  '/:id',
  accountManagerOrHigher,
  updateClientValidation,
  handleValidationErrors,
  auditLog(AuditAction.UPDATE, 'Client'),
  asyncHandler(updateClient)
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete client (soft delete)
 * @access  HOF or Admin
 */
router.delete(
  '/:id',
  hofOrAdmin,
  auditLog(AuditAction.DELETE, 'Client'),
  asyncHandler(deleteClient)
);

/**
 * @route   POST /api/clients/:id/restore
 * @desc    Restore deleted client
 * @access  Admin only
 */
router.post('/:id/restore', hofOrAdmin, asyncHandler(restoreClient));

export default router;
