import { Request, Response } from 'express';
import Cheque, { ChequeStatus } from '../models/Cheque';
import { AuthRequest } from '../types';

// Get all cheques
export const getAllCheques = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { isDeleted: false };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.chequeType) {
      filter.chequeType = req.query.chequeType;
    }

    if (req.query.clientId) {
      filter.clientId = req.query.clientId;
    }

    if (req.query.saleId) {
      filter.saleId = req.query.saleId;
    }

    if (req.query.bankName) {
      filter.bankName = { $regex: req.query.bankName, $options: 'i' };
    }

    // Date range filters
    if (req.query.dueDateFrom || req.query.dueDateTo) {
      filter.dueDate = {};
      if (req.query.dueDateFrom) {
        filter.dueDate.$gte = new Date(req.query.dueDateFrom as string);
      }
      if (req.query.dueDateTo) {
        filter.dueDate.$lte = new Date(req.query.dueDateTo as string);
      }
    }

    const cheques = await Cheque.find(filter)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber')
      .populate('receiptId', 'receiptNumber')
      .populate('refundId', 'refundNumber')
      .populate('createdBy', 'username email')
      .populate('clearedBy', 'username')
      .populate('bouncedBy', 'username')
      .populate('cancelledBy', 'username')
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Cheque.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: cheques,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Get all cheques error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CHEQUES_ERROR',
        message: 'Failed to fetch cheques',
        details: error.message,
      },
    });
  }
};

// Get single cheque by ID
export const getChequeById = async (req: Request, res: Response) => {
  try {
    const cheque = await Cheque.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate('clientId', 'name phone email nid')
      .populate('saleId', 'saleNumber totalPrice')
      .populate('receiptId', 'receiptNumber amount')
      .populate('refundId', 'refundNumber amount')
      .populate('createdBy', 'username email')
      .populate('clearedBy', 'username email')
      .populate('bouncedBy', 'username email')
      .populate('cancelledBy', 'username email');

    if (!cheque) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHEQUE_NOT_FOUND',
          message: 'Cheque not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: cheque,
    });
  } catch (error: unknown) {
    console.error('Get cheque by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CHEQUE_ERROR',
        message: 'Failed to fetch cheque',
        details: error.message,
      },
    });
  }
};

// Create cheque
export const createCheque = async (req: AuthRequest, res: Response) => {
  try {
    const {
      chequeNumber,
      bankName,
      branchName,
      chequeType,
      issueDate,
      dueDate,
      amount,
      clientId,
      saleId,
      receiptId,
      refundId,
      notes,
    } = req.body;

    // Validate required fields
    if (!chequeNumber || !bankName || !issueDate || !dueDate || !amount || !clientId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Cheque number, bank name, issue date, due date, amount, and client are required',
        },
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Amount must be greater than zero',
        },
      });
    }

    // Create cheque
    const cheque = new Cheque({
      chequeNumber,
      bankName,
      branchName,
      chequeType,
      issueDate,
      dueDate,
      amount,
      clientId,
      saleId,
      receiptId,
      refundId,
      notes,
      createdBy: req.user!.userId,
    });

    await cheque.save();

    const populatedCheque = await Cheque.findById(cheque._id)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber')
      .populate('receiptId', 'receiptNumber')
      .populate('refundId', 'refundNumber')
      .populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      data: populatedCheque,
      message: 'Cheque created successfully',
    });
  } catch (error: unknown) {
    console.error('Create cheque error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_CHEQUE_ERROR',
        message: 'Failed to create cheque',
        details: error.message,
      },
    });
  }
};

// Update cheque
export const updateCheque = async (req: AuthRequest, res: Response) => {
  try {
    const {
      chequeNumber,
      bankName,
      branchName,
      chequeType,
      issueDate,
      dueDate,
      amount,
      notes,
    } = req.body;

    const cheque = await Cheque.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!cheque) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHEQUE_NOT_FOUND',
          message: 'Cheque not found',
        },
      });
    }

    // Don't allow editing cleared, bounced, or cancelled cheques
    if ([ChequeStatus.CLEARED, ChequeStatus.BOUNCED, ChequeStatus.CANCELLED].includes(cheque.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHEQUE_FINALIZED',
          message: `Cannot update ${cheque.status.toLowerCase()} cheque`,
        },
      });
    }

    // Update fields
    if (chequeNumber !== undefined) cheque.chequeNumber = chequeNumber;
    if (bankName !== undefined) cheque.bankName = bankName;
    if (branchName !== undefined) cheque.branchName = branchName;
    if (chequeType !== undefined) cheque.chequeType = chequeType;
    if (issueDate !== undefined) cheque.issueDate = issueDate;
    if (dueDate !== undefined) cheque.dueDate = dueDate;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Amount must be greater than zero',
          },
        });
      }
      cheque.amount = amount;
    }
    if (notes !== undefined) cheque.notes = notes;

    await cheque.save();

    const populatedCheque = await Cheque.findById(cheque._id)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber')
      .populate('receiptId', 'receiptNumber')
      .populate('refundId', 'refundNumber')
      .populate('createdBy', 'username email');

    res.status(200).json({
      success: true,
      data: populatedCheque,
      message: 'Cheque updated successfully',
    });
  } catch (error: unknown) {
    console.error('Update cheque error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_CHEQUE_ERROR',
        message: 'Failed to update cheque',
        details: error.message,
      },
    });
  }
};

// Mark cheque as cleared
export const markChequeAsCleared = async (req: AuthRequest, res: Response) => {
  try {
    const { clearedDate } = req.body;

    const cheque = await Cheque.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!cheque) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHEQUE_NOT_FOUND',
          message: 'Cheque not found',
        },
      });
    }

    // Check if cheque can be cleared
    if (cheque.status === ChequeStatus.CLEARED) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHEQUE_ALREADY_CLEARED',
          message: 'Cheque is already cleared',
        },
      });
    }

    if ([ChequeStatus.BOUNCED, ChequeStatus.CANCELLED].includes(cheque.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHEQUE_FINALIZED',
          message: `Cannot clear ${cheque.status.toLowerCase()} cheque`,
        },
      });
    }

    // Mark as cleared
    await cheque.markAsCleared(req.user!.userId, clearedDate ? new Date(clearedDate) : undefined);

    const populatedCheque = await Cheque.findById(cheque._id)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber')
      .populate('clearedBy', 'username email');

    res.status(200).json({
      success: true,
      data: populatedCheque,
      message: 'Cheque marked as cleared successfully',
    });
  } catch (error: unknown) {
    console.error('Mark cheque as cleared error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MARK_CHEQUE_CLEARED_ERROR',
        message: 'Failed to mark cheque as cleared',
        details: error.message,
      },
    });
  }
};

// Mark cheque as bounced
export const markChequeAsBounced = async (req: AuthRequest, res: Response) => {
  try {
    const { bounceReason, bounceDate } = req.body;

    if (!bounceReason || !bounceReason.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BOUNCE_REASON_REQUIRED',
          message: 'Bounce reason is required',
        },
      });
    }

    const cheque = await Cheque.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!cheque) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHEQUE_NOT_FOUND',
          message: 'Cheque not found',
        },
      });
    }

    // Check if cheque can be bounced
    if (cheque.status === ChequeStatus.BOUNCED) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHEQUE_ALREADY_BOUNCED',
          message: 'Cheque is already bounced',
        },
      });
    }

    if ([ChequeStatus.CLEARED, ChequeStatus.CANCELLED].includes(cheque.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHEQUE_FINALIZED',
          message: `Cannot bounce ${cheque.status.toLowerCase()} cheque`,
        },
      });
    }

    // Mark as bounced
    await cheque.markAsBounced(
      req.user!.userId,
      bounceReason,
      bounceDate ? new Date(bounceDate) : undefined
    );

    const populatedCheque = await Cheque.findById(cheque._id)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber')
      .populate('bouncedBy', 'username email');

    res.status(200).json({
      success: true,
      data: populatedCheque,
      message: 'Cheque marked as bounced successfully',
    });
  } catch (error: unknown) {
    console.error('Mark cheque as bounced error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MARK_CHEQUE_BOUNCED_ERROR',
        message: 'Failed to mark cheque as bounced',
        details: error.message,
      },
    });
  }
};

// Cancel cheque
export const cancelCheque = async (req: AuthRequest, res: Response) => {
  try {
    const { cancelReason, cancelDate } = req.body;

    if (!cancelReason || !cancelReason.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANCEL_REASON_REQUIRED',
          message: 'Cancellation reason is required',
        },
      });
    }

    const cheque = await Cheque.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!cheque) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHEQUE_NOT_FOUND',
          message: 'Cheque not found',
        },
      });
    }

    // Check if cheque can be cancelled
    if (cheque.status === ChequeStatus.CANCELLED) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHEQUE_ALREADY_CANCELLED',
          message: 'Cheque is already cancelled',
        },
      });
    }

    if ([ChequeStatus.CLEARED, ChequeStatus.BOUNCED].includes(cheque.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHEQUE_FINALIZED',
          message: `Cannot cancel ${cheque.status.toLowerCase()} cheque`,
        },
      });
    }

    // Cancel cheque
    await cheque.cancel(req.user!.userId, cancelReason, cancelDate ? new Date(cancelDate) : undefined);

    const populatedCheque = await Cheque.findById(cheque._id)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber')
      .populate('cancelledBy', 'username email');

    res.status(200).json({
      success: true,
      data: populatedCheque,
      message: 'Cheque cancelled successfully',
    });
  } catch (error: unknown) {
    console.error('Cancel cheque error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CANCEL_CHEQUE_ERROR',
        message: 'Failed to cancel cheque',
        details: error.message,
      },
    });
  }
};

// Delete cheque (soft delete)
export const deleteCheque = async (req: Request, res: Response) => {
  try {
    const cheque = await Cheque.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!cheque) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHEQUE_NOT_FOUND',
          message: 'Cheque not found',
        },
      });
    }

    // Don't allow deleting cleared cheques
    if (cheque.status === ChequeStatus.CLEARED) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_CLEARED_CHEQUE',
          message: 'Cannot delete cleared cheque',
        },
      });
    }

    // Soft delete
    cheque.isDeleted = true;
    await cheque.save();

    res.status(200).json({
      success: true,
      message: 'Cheque deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete cheque error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_CHEQUE_ERROR',
        message: 'Failed to delete cheque',
        details: error.message,
      },
    });
  }
};

// Get due cheques (due today or overdue)
export const getDueCheques = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter: any = {
      isDeleted: false,
      status: { $in: [ChequeStatus.PENDING, ChequeStatus.DUE_TODAY, ChequeStatus.OVERDUE] },
      dueDate: { $lte: today },
    };

    const cheques = await Cheque.find(filter)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber')
      .populate('createdBy', 'username')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: cheques,
    });
  } catch (error: unknown) {
    console.error('Get due cheques error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DUE_CHEQUES_ERROR',
        message: 'Failed to fetch due cheques',
        details: error.message,
      },
    });
  }
};

// Get upcoming cheques (next N days)
export const getUpcomingCheques = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const filter: any = {
      isDeleted: false,
      status: { $in: [ChequeStatus.PENDING, ChequeStatus.DUE_TODAY] },
      dueDate: { $gte: today, $lte: futureDate },
    };

    const cheques = await Cheque.find(filter)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber')
      .populate('createdBy', 'username')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: cheques,
    });
  } catch (error: unknown) {
    console.error('Get upcoming cheques error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_UPCOMING_CHEQUES_ERROR',
        message: 'Failed to fetch upcoming cheques',
        details: error.message,
      },
    });
  }
};

// Get cheque statistics
export const getChequeStats = async (req: Request, res: Response) => {
  try {
    const filter: any = { isDeleted: false };

    const stats = await Cheque.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCheques: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          pendingCheques: {
            $sum: { $cond: [{ $eq: ['$status', ChequeStatus.PENDING] }, 1, 0] },
          },
          dueTodayCheques: {
            $sum: { $cond: [{ $eq: ['$status', ChequeStatus.DUE_TODAY] }, 1, 0] },
          },
          overdueCheques: {
            $sum: { $cond: [{ $eq: ['$status', ChequeStatus.OVERDUE] }, 1, 0] },
          },
          clearedCheques: {
            $sum: { $cond: [{ $eq: ['$status', ChequeStatus.CLEARED] }, 1, 0] },
          },
          bouncedCheques: {
            $sum: { $cond: [{ $eq: ['$status', ChequeStatus.BOUNCED] }, 1, 0] },
          },
          clearedAmount: {
            $sum: { $cond: [{ $eq: ['$status', ChequeStatus.CLEARED] }, '$amount', 0] },
          },
          pendingAmount: {
            $sum: {
              $cond: [
                { $in: ['$status', [ChequeStatus.PENDING, ChequeStatus.DUE_TODAY, ChequeStatus.OVERDUE]] },
                '$amount',
                0,
              ],
            },
          },
        },
      },
    ]);

    // Get stats by status
    const statsByStatus = await Cheque.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...(stats.length > 0
          ? stats[0]
          : {
              totalCheques: 0,
              totalAmount: 0,
              pendingCheques: 0,
              dueTodayCheques: 0,
              overdueCheques: 0,
              clearedCheques: 0,
              bouncedCheques: 0,
              clearedAmount: 0,
              pendingAmount: 0,
            }),
        statsByStatus,
      },
    });
  } catch (error: unknown) {
    console.error('Get cheque stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CHEQUE_STATS_ERROR',
        message: 'Failed to fetch cheque statistics',
        details: error.message,
      },
    });
  }
};
