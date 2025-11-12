import { Request, Response } from 'express';
import Cancellation, { CancellationStatus } from '../models/Cancellation';
import Sale, { SaleStatus } from '../models/Sale';
import Refund from '../models/Refund';
import { AuthRequest } from '../types';

// Get all cancellations
export const getAllCancellations = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { isActive: true };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.saleId) {
      filter.saleId = req.query.saleId;
    }

    if (req.query.fromDate || req.query.toDate) {
      filter.cancellationDate = {};
      if (req.query.fromDate) {
        filter.cancellationDate.$gte = new Date(req.query.fromDate as string);
      }
      if (req.query.toDate) {
        filter.cancellationDate.$lte = new Date(req.query.toDate as string);
      }
    }

    const cancellations = await Cancellation.find(filter)
      .populate('saleId', 'saleNumber clientId plotId totalPrice')
      .populate({
        path: 'saleId',
        populate: [
          { path: 'clientId', select: 'name phone' },
          { path: 'plotId', select: 'plotNumber area' },
        ],
      })
      .populate('createdBy', 'username email role')
      .populate('approvedBy', 'username email role')
      .sort({ cancellationDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Cancellation.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: cancellations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Get all cancellations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CANCELLATIONS_ERROR',
        message: 'Failed to fetch cancellations',
        details: error.message,
      },
    });
  }
};

// Get single cancellation by ID
export const getCancellationById = async (req: Request, res: Response) => {
  try {
    const cancellation = await Cancellation.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate('saleId')
      .populate({
        path: 'saleId',
        populate: [
          { path: 'clientId', select: 'name phone email address' },
          { path: 'plotId', select: 'plotNumber area' },
          { path: 'rsNumberId', select: 'rsNumber projectName' },
        ],
      })
      .populate('createdBy', 'username email role')
      .populate('approvedBy', 'username email role');

    if (!cancellation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CANCELLATION_NOT_FOUND',
          message: 'Cancellation not found',
        },
      });
    }

    // Get associated refunds
    const refunds = await Refund.find({
      cancellationId: cancellation._id,
      isActive: true,
    }).sort({ installmentNumber: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...cancellation.toObject(),
        refunds,
      },
    });
  } catch (error: unknown) {
    console.error('Get cancellation by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CANCELLATION_ERROR',
        message: 'Failed to fetch cancellation',
        details: error.message,
      },
    });
  }
};

// Create cancellation
export const createCancellation = async (req: AuthRequest, res: Response) => {
  try {
    const {
      saleId,
      reason,
      officeChargePercent,
      otherDeductions,
      notes,
    } = req.body;

    // Validate required fields
    if (!saleId || !reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Sale ID and reason are required',
        },
      });
    }

    // Check if sale exists and is active
    const sale = await Sale.findOne({ _id: saleId, isActive: true });
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SALE_NOT_FOUND',
          message: 'Sale not found',
        },
      });
    }

    // Check if sale is already cancelled
    if (sale.status === SaleStatus.CANCELLED) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SALE_ALREADY_CANCELLED',
          message: 'This sale has already been cancelled',
        },
      });
    }

    // Check if cancellation already exists for this sale
    const existingCancellation = await Cancellation.findOne({
      saleId,
      isActive: true,
    });
    if (existingCancellation) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANCELLATION_EXISTS',
          message: 'A cancellation already exists for this sale',
        },
      });
    }

    // Create cancellation
    const cancellation = new Cancellation({
      saleId,
      cancellationDate: new Date(),
      reason,
      totalPaid: sale.paidAmount,
      officeChargePercent: officeChargePercent !== undefined ? officeChargePercent : 10,
      otherDeductions: otherDeductions || 0,
      officeChargeAmount: 0, // Will be calculated by pre-save hook
      refundableAmount: 0, // Will be calculated by pre-save hook
      remainingRefund: 0, // Will be calculated by pre-save hook
      status: CancellationStatus.PENDING,
      notes,
      createdBy: req.user!.userId,
    });

    await cancellation.save();

    // Update sale status to cancelled
    sale.status = SaleStatus.CANCELLED;
    await sale.save();

    // Populate cancellation data
    const populatedCancellation = await Cancellation.findById(cancellation._id)
      .populate('saleId')
      .populate({
        path: 'saleId',
        populate: [
          { path: 'clientId', select: 'name phone' },
          { path: 'plotId', select: 'plotNumber area' },
        ],
      })
      .populate('createdBy', 'username email role');

    res.status(201).json({
      success: true,
      data: populatedCancellation,
      message: 'Cancellation created successfully',
    });
  } catch (error: unknown) {
    console.error('Create cancellation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_CANCELLATION_ERROR',
        message: 'Failed to create cancellation',
        details: error.message,
      },
    });
  }
};

// Update cancellation
export const updateCancellation = async (req: AuthRequest, res: Response) => {
  try {
    const { reason, officeChargePercent, otherDeductions, notes } = req.body;

    const cancellation = await Cancellation.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!cancellation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CANCELLATION_NOT_FOUND',
          message: 'Cancellation not found',
        },
      });
    }

    // Can only update if still in pending or approved status
    if (cancellation.status !== CancellationStatus.PENDING && cancellation.status !== CancellationStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_UPDATE_CANCELLATION',
          message: 'Cannot update cancellation in current status',
        },
      });
    }

    // Update fields
    if (reason !== undefined) cancellation.reason = reason;
    if (officeChargePercent !== undefined) cancellation.officeChargePercent = officeChargePercent;
    if (otherDeductions !== undefined) cancellation.otherDeductions = otherDeductions;
    if (notes !== undefined) cancellation.notes = notes;

    await cancellation.save();

    const populatedCancellation = await Cancellation.findById(cancellation._id)
      .populate('saleId')
      .populate({
        path: 'saleId',
        populate: [
          { path: 'clientId', select: 'name phone' },
          { path: 'plotId', select: 'plotNumber area' },
        ],
      })
      .populate('createdBy', 'username email role')
      .populate('approvedBy', 'username email role');

    res.status(200).json({
      success: true,
      data: populatedCancellation,
      message: 'Cancellation updated successfully',
    });
  } catch (error: unknown) {
    console.error('Update cancellation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_CANCELLATION_ERROR',
        message: 'Failed to update cancellation',
        details: error.message,
      },
    });
  }
};

// Approve cancellation
export const approveCancellation = async (req: AuthRequest, res: Response) => {
  try {
    const { notes } = req.body;

    const cancellation = await Cancellation.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!cancellation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CANCELLATION_NOT_FOUND',
          message: 'Cancellation not found',
        },
      });
    }

    if (cancellation.status !== CancellationStatus.PENDING) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Cancellation is not in pending status',
        },
      });
    }

    // Approve cancellation
    cancellation.status = CancellationStatus.APPROVED;
    cancellation.approvedBy = req.user!.userId;
    cancellation.approvedAt = new Date();
    if (notes) {
      cancellation.notes = notes;
    }

    await cancellation.save();

    const populatedCancellation = await Cancellation.findById(cancellation._id)
      .populate('saleId')
      .populate({
        path: 'saleId',
        populate: [
          { path: 'clientId', select: 'name phone' },
          { path: 'plotId', select: 'plotNumber area' },
        ],
      })
      .populate('createdBy', 'username email role')
      .populate('approvedBy', 'username email role');

    res.status(200).json({
      success: true,
      data: populatedCancellation,
      message: 'Cancellation approved successfully',
    });
  } catch (error: unknown) {
    console.error('Approve cancellation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'APPROVE_CANCELLATION_ERROR',
        message: 'Failed to approve cancellation',
        details: error.message,
      },
    });
  }
};

// Reject cancellation
export const rejectCancellation = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REJECTION_REASON_REQUIRED',
          message: 'Rejection reason is required',
        },
      });
    }

    const cancellation = await Cancellation.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!cancellation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CANCELLATION_NOT_FOUND',
          message: 'Cancellation not found',
        },
      });
    }

    if (cancellation.status !== CancellationStatus.PENDING) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Cancellation is not in pending status',
        },
      });
    }

    // Reject cancellation
    cancellation.status = CancellationStatus.REJECTED;
    cancellation.rejectionReason = reason;
    cancellation.approvedBy = req.user!.userId;
    cancellation.approvedAt = new Date();

    await cancellation.save();

    // Restore sale status to active
    const sale = await Sale.findById(cancellation.saleId);
    if (sale) {
      sale.status = SaleStatus.ACTIVE;
      await sale.save();
    }

    const populatedCancellation = await Cancellation.findById(cancellation._id)
      .populate('saleId')
      .populate({
        path: 'saleId',
        populate: [
          { path: 'clientId', select: 'name phone' },
          { path: 'plotId', select: 'plotNumber area' },
        ],
      })
      .populate('createdBy', 'username email role')
      .populate('approvedBy', 'username email role');

    res.status(200).json({
      success: true,
      data: populatedCancellation,
      message: 'Cancellation rejected successfully',
    });
  } catch (error: unknown) {
    console.error('Reject cancellation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REJECT_CANCELLATION_ERROR',
        message: 'Failed to reject cancellation',
        details: error.message,
      },
    });
  }
};

// Delete cancellation (soft delete)
export const deleteCancellation = async (req: Request, res: Response) => {
  try {
    const cancellation = await Cancellation.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!cancellation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CANCELLATION_NOT_FOUND',
          message: 'Cancellation not found',
        },
      });
    }

    // Can only delete if still in pending status
    if (cancellation.status !== CancellationStatus.PENDING) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_CANCELLATION',
          message: 'Cannot delete cancellation in current status',
        },
      });
    }

    // Soft delete
    cancellation.isActive = false;
    await cancellation.save();

    // Restore sale status to active
    const sale = await Sale.findById(cancellation.saleId);
    if (sale) {
      sale.status = SaleStatus.ACTIVE;
      await sale.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cancellation deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete cancellation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_CANCELLATION_ERROR',
        message: 'Failed to delete cancellation',
        details: error.message,
      },
    });
  }
};

// Get cancellation statistics
export const getCancellationStats = async (req: Request, res: Response) => {
  try {
    const filter: any = { isActive: true };

    if (req.query.fromDate || req.query.toDate) {
      filter.cancellationDate = {};
      if (req.query.fromDate) {
        filter.cancellationDate.$gte = new Date(req.query.fromDate as string);
      }
      if (req.query.toDate) {
        filter.cancellationDate.$lte = new Date(req.query.toDate as string);
      }
    }

    const stats = await Cancellation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCancellations: { $sum: 1 },
          pendingCancellations: {
            $sum: { $cond: [{ $eq: ['$status', CancellationStatus.PENDING] }, 1, 0] },
          },
          approvedCancellations: {
            $sum: { $cond: [{ $eq: ['$status', CancellationStatus.APPROVED] }, 1, 0] },
          },
          totalRefundable: { $sum: '$refundableAmount' },
          totalRefunded: { $sum: '$refundedAmount' },
          totalOfficeCharge: { $sum: '$officeChargeAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats.length > 0 ? stats[0] : {
        totalCancellations: 0,
        pendingCancellations: 0,
        approvedCancellations: 0,
        totalRefundable: 0,
        totalRefunded: 0,
        totalOfficeCharge: 0,
      },
    });
  } catch (error: unknown) {
    console.error('Get cancellation stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CANCELLATION_STATS_ERROR',
        message: 'Failed to fetch cancellation statistics',
        details: error.message,
      },
    });
  }
};
