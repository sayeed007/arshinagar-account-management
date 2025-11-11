import { Request, Response, NextFunction } from 'express';
import InstallmentSchedule, { InstallmentStatus, InstallmentFrequency } from '../models/InstallmentSchedule';
import Sale from '../models/Sale';
import { ApiError, ErrorCode } from '../middlewares/error.middleware';

// Create installment schedule
export const createInstallmentSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      saleId,
      totalAmount,
      numberOfInstallments,
      frequency,
      startDate,
    } = req.body;

    // Verify sale exists
    const sale = await Sale.findById(saleId).populate('clientId');
    if (!sale) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Sale not found');
    }

    // Generate installment schedule
    const installments = await (InstallmentSchedule as any).generateSchedule(
      saleId,
      sale.clientId,
      totalAmount,
      numberOfInstallments,
      frequency || InstallmentFrequency.MONTHLY,
      startDate ? new Date(startDate) : new Date()
    );

    res.status(201).json({
      success: true,
      data: installments,
    });
  } catch (error) {
    next(error);
  }
};

// Get all installments with filters
export const getAllInstallments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      saleId,
      clientId,
      rsNumberId,
      isActive = true,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { isActive };

    if (status) {
      query.status = status;
    }

    if (saleId) {
      query.saleId = saleId;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    // Get total count
    const total = await InstallmentSchedule.countDocuments(query);

    // Get installments with populated fields
    const installments = await InstallmentSchedule.find(query)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber totalPrice')
      .populate('paymentId', 'paymentNumber amount paymentDate')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: installments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get installment by ID
export const getInstallmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const installment = await InstallmentSchedule.findById(id)
      .populate('clientId', 'name phone email address')
      .populate('saleId', 'saleNumber totalPrice paidAmount dueAmount')
      .populate('paymentId', 'paymentNumber amount paymentDate method');

    if (!installment) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Installment not found');
    }

    res.json({
      success: true,
      data: installment,
    });
  } catch (error) {
    next(error);
  }
};

// Update installment (mark as paid)
export const updateInstallment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { paidAmount, paidDate, paymentMethod, paymentId, notes } = req.body;

    const installment = await InstallmentSchedule.findById(id);
    if (!installment) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Installment not found');
    }

    // Update installment
    if (paidAmount !== undefined) {
      installment.paidAmount += paidAmount;
    }

    if (paidDate) {
      installment.paidDate = new Date(paidDate);
    }

    if (paymentMethod) {
      installment.paymentMethod = paymentMethod;
    }

    if (paymentId) {
      installment.paymentId = paymentId;
    }

    if (notes) {
      installment.notes = notes;
    }

    await installment.save();

    // Update sale's installment stage
    const sale = await Sale.findById(installment.saleId);
    if (sale) {
      const installmentStage = sale.stages.find((s) => s.stageName === 'Installments');
      if (installmentStage && paidAmount) {
        installmentStage.receivedAmount += paidAmount;
      }
      await sale.save();
    }

    res.json({
      success: true,
      data: installment,
    });
  } catch (error) {
    next(error);
  }
};

// Delete installment
export const deleteInstallment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const installment = await InstallmentSchedule.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!installment) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Installment not found');
    }

    res.json({
      success: true,
      message: 'Installment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get overdue installments
export const getOverdueInstallments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { clientId } = req.query;

    const query: any = {
      isActive: true,
      status: { $in: [InstallmentStatus.OVERDUE, InstallmentStatus.MISSED] },
    };

    if (clientId) {
      query.clientId = clientId;
    }

    const overdueInstallments = await InstallmentSchedule.find(query)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber totalPrice')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: overdueInstallments,
    });
  } catch (error) {
    next(error);
  }
};

// Get client statement
export const getClientStatement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { clientId } = req.params;

    // Get all installments for client
    const installments = await InstallmentSchedule.find({
      clientId,
      isActive: true,
    })
      .populate('saleId', 'saleNumber totalPrice')
      .sort({ dueDate: 1 });

    // Calculate totals
    const totalDue = installments.reduce((sum, inst) => sum + inst.amount, 0);
    const totalPaid = installments.reduce((sum, inst) => sum + inst.paidAmount, 0);
    const totalOutstanding = totalDue - totalPaid;

    const paidCount = installments.filter(
      (inst) => inst.status === InstallmentStatus.PAID
    ).length;
    const overdueCount = installments.filter(
      (inst) =>
        inst.status === InstallmentStatus.OVERDUE || inst.status === InstallmentStatus.MISSED
    ).length;

    res.json({
      success: true,
      data: {
        installments,
        summary: {
          totalInstallments: installments.length,
          paidCount,
          overdueCount,
          totalDue,
          totalPaid,
          totalOutstanding,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update overdue statuses (cron job endpoint)
export const updateOverdueStatuses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();

    // Find all pending installments past due date
    const pendingInstallments = await InstallmentSchedule.find({
      isActive: true,
      status: { $in: [InstallmentStatus.PENDING, InstallmentStatus.PARTIAL] },
      dueDate: { $lt: now },
    });

    let updatedCount = 0;

    for (const installment of pendingInstallments) {
      installment.updateStatus();
      await installment.save();
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Updated ${updatedCount} installment statuses`,
      data: { updatedCount },
    });
  } catch (error) {
    next(error);
  }
};
