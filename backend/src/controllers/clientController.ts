import { Response } from 'express';
import { Client, IClient } from '../models/Client';
import { AuthRequest, ErrorCode, ApiResponse } from '../types';
import { ApiError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';

/**
 * Create New Client
 */
export const createClient = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const clientData: Partial<IClient> = req.body;

    // Check if phone already exists
    const existingClient = await Client.findOne({ phone: clientData.phone });
    if (existingClient) {
      throw new ApiError(
        409,
        ErrorCode.DUPLICATE_ENTRY,
        'A client with this phone number already exists'
      );
    }

    // Create client
    const client = await Client.create(clientData);

    logger.info(`Client created: ${client.name} by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      data: client,
      message: 'Client created successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get All Clients with Pagination, Search, and Filtering
 */
export const getAllClients = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Search across name, phone, and address
    if (search) {
      query.$text = { $search: search as string };
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Count total documents
    const total = await Client.countDocuments(query);

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Fetch clients
    const clients = await Client.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .lean();

    res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get Client by ID
 */
export const getClientById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);

    if (!client) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Client not found');
    }

    // TODO: In Phase 3, add purchase history and payment status
    const clientData = {
      ...client.toObject(),
      // purchaseHistory: [], // Will be implemented in Phase 3
      // paymentSummary: {}, // Will be implemented in Phase 3
    };

    res.status(200).json({
      success: true,
      data: clientData,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Update Client
 */
export const updateClient = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: Partial<IClient> = req.body;

    // If phone is being updated, check for duplicates
    if (updates.phone) {
      const existingClient = await Client.findOne({
        phone: updates.phone,
        _id: { $ne: id },
      });

      if (existingClient) {
        throw new ApiError(
          409,
          ErrorCode.DUPLICATE_ENTRY,
          'A client with this phone number already exists'
        );
      }
    }

    const client = await Client.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Client not found');
    }

    logger.info(`Client updated: ${client.name} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: client,
      message: 'Client updated successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete Client (Soft Delete)
 */
export const deleteClient = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // TODO: Check if client has any active sales/plots before deletion
    // This will be implemented in Phase 3

    const client = await Client.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!client) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Client not found');
    }

    logger.info(`Client deleted: ${client.name} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Restore Deleted Client
 */
export const restoreClient = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!client) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Client not found');
    }

    logger.info(`Client restored: ${client.name} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: client,
      message: 'Client restored successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Search Clients
 */
export const searchClients = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || (q as string).length < 2) {
      throw new ApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Search query must be at least 2 characters'
      );
    }

    const clients = await Client.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { nid: { $regex: q, $options: 'i' } },
      ],
      isActive: true,
    })
      .limit(10)
      .select('name phone email address')
      .lean();

    res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get Client Statistics
 */
export const getClientStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalClients = await Client.countDocuments({ isActive: true });
    const inactiveClients = await Client.countDocuments({ isActive: false });

    // Get clients added this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const clientsThisMonth = await Client.countDocuments({
      createdAt: { $gte: startOfMonth },
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        totalClients,
        activeClients: totalClients,
        inactiveClients,
        clientsThisMonth,
      },
    });
  } catch (error) {
    throw error;
  }
};
