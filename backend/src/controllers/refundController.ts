import { Request, Response } from 'express';
import Refund, { RefundStatus, RefundApprovalStatus } from '../models/Refund';
import Cancellation, { CancellationStatus } from '../models/Cancellation';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';

// Get all refunds
export const getAllRefunds = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { isActive: true };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.approvalStatus) {
      filter.approvalStatus = req.query.approvalStatus;
    }

    if (req.query.cancellationId) {
      filter.cancellationId = req.query.cancellationId;
    }

    if (req.query.fromDate || req.query.toDate) {
      filter.dueDate = {};
      if (req.query.fromDate) {
        filter.dueDate.$gte = new Date(req.query.fromDate as string);
      }
      if (req.query.toDate) {
        filter.dueDate.$lte = new Date(req.query.toDate as string);
      }
    }

    const refunds = await Refund.find(filter)
      .populate('cancellationId')
      .populate({
        path: 'cancellationId',
        populate: {
          path: 'saleId',
          populate: [
            { path: 'clientId', select: 'name phone' },
            { path: 'plotId', select: 'plotNumber' },
          ],
        },
      })
      .populate('createdBy', 'username email role')
      .populate('approvalHistory.approvedBy', 'username email role')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Refund.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: refunds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get all refunds error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_REFUNDS_ERROR',
        message: 'Failed to fetch refunds',
        details: error.message,
      },
    });
  }
};

// Get single refund by ID
export const getRefundById = async (req: Request, res: Response) => {
  try {
    const refund = await Refund.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate('cancellationId')
      .populate({
        path: 'cancellationId',
        populate: {
          path: 'saleId',
          populate: [
            { path: 'clientId' },
            { path: 'plotId' },
            { path: 'rsNumberId' },
          ],
        },
      })
      .populate('createdBy', 'username email role')
      .populate('approvalHistory.approvedBy', 'username email role');

    if (!refund) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REFUND_NOT_FOUND',
          message: 'Refund not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: refund,
    });
  } catch (error: any) {
    console.error('Get refund by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_REFUND_ERROR',
        message: 'Failed to fetch refund',
        details: error.message,
      },
    });
  }
};

// Create refund installments
export const createRefundSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { cancellationId, numberOfInstallments, startDate, notes } = req.body;

    // Validate required fields
    if (!cancellationId || !numberOfInstallments) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Cancellation ID and number of installments are required',
        },
      });
    }

    // Check if cancellation exists and is approved
    const cancellation = await Cancellation.findOne({
      _id: cancellationId,
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

    if (cancellation.status !== CancellationStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANCELLATION_NOT_APPROVED',
          message: 'Cancellation must be approved before creating refund schedule',
        },
      });
    }

    // Check if refunds already exist for this cancellation
    const existingRefunds = await Refund.countDocuments({
      cancellationId,
      isActive: true,
    });

    if (existingRefunds > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REFUND_SCHEDULE_EXISTS',
          message: 'Refund schedule already exists for this cancellation',
        },
      });
    }

    // Calculate installment amount
    const installmentAmount = Math.round(cancellation.refundableAmount / numberOfInstallments);
    const remainder = cancellation.refundableAmount - (installmentAmount * numberOfInstallments);

    // Create refund installments
    const refunds = [];
    const firstInstallmentDate = startDate ? new Date(startDate) : new Date();

    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueDate = new Date(firstInstallmentDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

      // Add remainder to last installment
      const amount = i === numberOfInstallments ? installmentAmount + remainder : installmentAmount;

      const refund = new Refund({
        cancellationId,
        installmentNumber: i,
        dueDate,
        amount,
        status: RefundStatus.PENDING,
        approvalStatus: RefundApprovalStatus.DRAFT,
        notes,
        createdBy: req.user!.userId,
      });

      await refund.save();
      refunds.push(refund);
    }

    res.status(201).json({
      success: true,
      data: refunds,
      message: `${numberOfInstallments} refund installments created successfully`,
    });
  } catch (error: any) {
    console.error('Create refund schedule error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_REFUND_SCHEDULE_ERROR',
        message: 'Failed to create refund schedule',
        details: error.message,
      },
    });
  }
};

// Submit refund for approval
export const submitRefund = async (req: AuthRequest, res: Response) => {
  try {
    const refund = await Refund.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!refund) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REFUND_NOT_FOUND',
          message: 'Refund not found',
        },
      });
    }

    if (refund.approvalStatus !== RefundApprovalStatus.DRAFT) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Refund is not in draft status',
        },
      });
    }

    // Submit for approval
    refund.approvalStatus = RefundApprovalStatus.PENDING_ACCOUNTS;
    await refund.save();

    const populatedRefund = await Refund.findById(refund._id)
      .populate('cancellationId')
      .populate('createdBy', 'username email role');

    res.status(200).json({
      success: true,
      data: populatedRefund,
      message: 'Refund submitted for approval',
    });
  } catch (error: any) {
    console.error('Submit refund error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMIT_REFUND_ERROR',
        message: 'Failed to submit refund',
        details: error.message,
      },
    });
  }
};

// Approve refund (two-step approval)
export const approveRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { remarks } = req.body;

    const refund = await Refund.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!refund) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REFUND_NOT_FOUND',
          message: 'Refund not found',
        },
      });
    }

    const userRole = req.user!.role;

    // Accounts Manager approval
    if (refund.approvalStatus === RefundApprovalStatus.PENDING_ACCOUNTS) {
      if (userRole !== UserRole.ACCOUNT_MANAGER && userRole !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Only Account Managers can approve at this stage',
          },
        });
      }

      refund.approvalStatus = RefundApprovalStatus.PENDING_HOF;
      refund.approvalHistory.push({
        approvedBy: req.user!.userId,
        approvedAt: new Date(),
        role: userRole,
        remarks,
      });
    }
    // HOF approval
    else if (refund.approvalStatus === RefundApprovalStatus.PENDING_HOF) {
      if (userRole !== UserRole.HOF && userRole !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Only HOF can approve at this stage',
          },
        });
      }

      refund.approvalStatus = RefundApprovalStatus.APPROVED;
      refund.approvalHistory.push({
        approvedBy: req.user!.userId,
        approvedAt: new Date(),
        role: userRole,
        remarks,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Refund is not in a pending approval status',
        },
      });
    }

    await refund.save();

    const populatedRefund = await Refund.findById(refund._id)
      .populate('cancellationId')
      .populate('createdBy', 'username email role')
      .populate('approvalHistory.approvedBy', 'username email role');

    res.status(200).json({
      success: true,
      data: populatedRefund,
      message: 'Refund approved successfully',
    });
  } catch (error: any) {
    console.error('Approve refund error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'APPROVE_REFUND_ERROR',
        message: 'Failed to approve refund',
        details: error.message,
      },
    });
  }
};

// Reject refund
export const rejectRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REMARKS_REQUIRED',
          message: 'Rejection remarks are required',
        },
      });
    }

    const refund = await Refund.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!refund) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REFUND_NOT_FOUND',
          message: 'Refund not found',
        },
      });
    }

    if (
      refund.approvalStatus !== RefundApprovalStatus.PENDING_ACCOUNTS &&
      refund.approvalStatus !== RefundApprovalStatus.PENDING_HOF
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Refund is not in a pending approval status',
        },
      });
    }

    // Reject refund
    refund.approvalStatus = RefundApprovalStatus.REJECTED;
    refund.rejectionReason = remarks;
    refund.approvalHistory.push({
      approvedBy: req.user!.userId,
      approvedAt: new Date(),
      role: req.user!.role,
      remarks,
    });

    await refund.save();

    const populatedRefund = await Refund.findById(refund._id)
      .populate('cancellationId')
      .populate('createdBy', 'username email role')
      .populate('approvalHistory.approvedBy', 'username email role');

    res.status(200).json({
      success: true,
      data: populatedRefund,
      message: 'Refund rejected',
    });
  } catch (error: any) {
    console.error('Reject refund error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REJECT_REFUND_ERROR',
        message: 'Failed to reject refund',
        details: error.message,
      },
    });
  }
};

// Get refund approval queue
export const getApprovalQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    let approvalStatus: RefundApprovalStatus | undefined;

    // Determine which approvals the user can see based on role
    if (userRole === UserRole.ACCOUNT_MANAGER) {
      approvalStatus = RefundApprovalStatus.PENDING_ACCOUNTS;
    } else if (userRole === UserRole.HOF) {
      approvalStatus = RefundApprovalStatus.PENDING_HOF;
    } else if (userRole === UserRole.ADMIN) {
      // Admin can see all pending approvals
      approvalStatus = undefined;
    } else {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to view the approval queue',
        },
      });
    }

    const filter: any = { isActive: true };
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    } else {
      filter.approvalStatus = {
        $in: [RefundApprovalStatus.PENDING_ACCOUNTS, RefundApprovalStatus.PENDING_HOF],
      };
    }

    const refunds = await Refund.find(filter)
      .populate('cancellationId')
      .populate({
        path: 'cancellationId',
        populate: {
          path: 'saleId',
          populate: [
            { path: 'clientId', select: 'name phone' },
            { path: 'plotId', select: 'plotNumber' },
          ],
        },
      })
      .populate('createdBy', 'username email role')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: refunds,
    });
  } catch (error: any) {
    console.error('Get approval queue error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_APPROVAL_QUEUE_ERROR',
        message: 'Failed to fetch approval queue',
        details: error.message,
      },
    });
  }
};

// Mark refund as paid
export const markRefundAsPaid = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentMethod, paidDate, instrumentDetails, notes } = req.body;

    const refund = await Refund.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!refund) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REFUND_NOT_FOUND',
          message: 'Refund not found',
        },
      });
    }

    if (refund.approvalStatus !== RefundApprovalStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_APPROVED',
          message: 'Refund must be approved before marking as paid',
        },
      });
    }

    if (refund.status === RefundStatus.PAID) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_PAID',
          message: 'Refund has already been marked as paid',
        },
      });
    }

    // Mark as paid
    refund.status = RefundStatus.PAID;
    refund.paidDate = paidDate ? new Date(paidDate) : new Date();
    refund.paymentMethod = paymentMethod;
    refund.instrumentDetails = instrumentDetails;
    if (notes) {
      refund.notes = notes;
    }

    await refund.save();

    const populatedRefund = await Refund.findById(refund._id)
      .populate('cancellationId')
      .populate('createdBy', 'username email role')
      .populate('approvalHistory.approvedBy', 'username email role');

    res.status(200).json({
      success: true,
      data: populatedRefund,
      message: 'Refund marked as paid successfully',
    });
  } catch (error: any) {
    console.error('Mark refund as paid error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MARK_REFUND_PAID_ERROR',
        message: 'Failed to mark refund as paid',
        details: error.message,
      },
    });
  }
};

// Get refund statistics
export const getRefundStats = async (req: Request, res: Response) => {
  try {
    const filter: any = { isActive: true };

    if (req.query.fromDate || req.query.toDate) {
      filter.dueDate = {};
      if (req.query.fromDate) {
        filter.dueDate.$gte = new Date(req.query.fromDate as string);
      }
      if (req.query.toDate) {
        filter.dueDate.$lte = new Date(req.query.toDate as string);
      }
    }

    const stats = await Refund.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: 1 },
          pendingRefunds: {
            $sum: { $cond: [{ $eq: ['$status', RefundStatus.PENDING] }, 1, 0] },
          },
          paidRefunds: {
            $sum: { $cond: [{ $eq: ['$status', RefundStatus.PAID] }, 1, 0] },
          },
          totalAmount: { $sum: '$amount' },
          paidAmount: {
            $sum: { $cond: [{ $eq: ['$status', RefundStatus.PAID] }, '$amount', 0] },
          },
          pendingApprovals: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$approvalStatus',
                    [RefundApprovalStatus.PENDING_ACCOUNTS, RefundApprovalStatus.PENDING_HOF],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats.length > 0 ? stats[0] : {
        totalRefunds: 0,
        pendingRefunds: 0,
        paidRefunds: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingApprovals: 0,
      },
    });
  } catch (error: any) {
    console.error('Get refund stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_REFUND_STATS_ERROR',
        message: 'Failed to fetch refund statistics',
        details: error.message,
      },
    });
  }
};
