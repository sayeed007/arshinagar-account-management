import { Request, Response, NextFunction } from 'express';
import Receipt, { ReceiptApprovalStatus } from '../models/Receipt';
import Sale from '../models/Sale';
import { Client } from '../models/Client';
import Ledger from '../models/Ledger';
import { ApiError, ErrorCode } from '../middlewares/error.middleware';
import { UserRole } from '../types';
import smsService from '../services/smsService';

// Create receipt
export const createReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      clientId,
      saleId,
      stageId,
      installmentId,
      receiptType,
      amount,
      method,
      receiptDate,
      instrumentDetails,
      notes,
    } = req.body;

    // Verify client and sale exist
    const client = await Client.findById(clientId);
    if (!client) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Client not found');
    }

    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Sale not found');
    }

    // Generate receipt number
    const receiptNumber = await (Receipt as any).generateReceiptNumber();

    // Create receipt
    const receipt = new Receipt({
      receiptNumber,
      clientId,
      saleId,
      stageId,
      installmentId,
      receiptType,
      amount,
      method,
      receiptDate: receiptDate || new Date(),
      instrumentDetails,
      notes,
      createdBy: req.user!._id,
      approvalStatus: ReceiptApprovalStatus.DRAFT,
    });

    await receipt.save();

    res.status(201).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

// Get all receipts with filters
export const getAllReceipts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      approvalStatus,
      clientId,
      saleId,
      search,
      isActive = true,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { isActive };

    if (approvalStatus) {
      query.approvalStatus = approvalStatus;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    if (saleId) {
      query.saleId = saleId;
    }

    if (search) {
      query.receiptNumber = new RegExp(search as string, 'i');
    }

    // Get total count
    const total = await Receipt.countDocuments(query);

    // Get receipts with populated fields
    const receipts = await Receipt.find(query)
      .populate('clientId', 'name phone email')
      .populate('saleId', 'saleNumber totalPrice')
      .populate('createdBy', 'username')
      .sort({ receiptDate: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: receipts,
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

// Get receipt by ID
export const getReceiptById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findById(id)
      .populate('clientId', 'name phone email address')
      .populate('saleId', 'saleNumber totalPrice paidAmount')
      .populate('createdBy', 'username email')
      .populate('approvalHistory.approvedBy', 'username');

    if (!receipt) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Receipt not found');
    }

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

// Submit receipt for approval
export const submitForApproval = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Receipt not found');
    }

    if (receipt.approvalStatus !== ReceiptApprovalStatus.DRAFT) {
      throw new ApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Receipt is not in draft status'
      );
    }

    receipt.approvalStatus = ReceiptApprovalStatus.PENDING_ACCOUNTS;
    await receipt.save();

    res.json({
      success: true,
      data: receipt,
      message: 'Receipt submitted for approval',
    });
  } catch (error) {
    next(error);
  }
};

// Approve receipt (Accounts Manager or HOF)
export const approveReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Receipt not found');
    }

    const userRole = req.user!.role;

    // Check approval workflow
    if (
      receipt.approvalStatus === ReceiptApprovalStatus.PENDING_ACCOUNTS &&
      userRole === UserRole.ACCOUNT_MANAGER
    ) {
      // Accounts Manager approval
      receipt.approvalHistory.push({
        approvedBy: req.user!._id,
        approvalLevel: 'Accounts Manager',
        approvedAt: new Date(),
        action: 'Approved',
        remarks,
      } as any);
      receipt.approvalStatus = ReceiptApprovalStatus.PENDING_HOF;
    } else if (
      receipt.approvalStatus === ReceiptApprovalStatus.PENDING_HOF &&
      (userRole === UserRole.ADMIN || userRole === UserRole.HOF)
    ) {
      // HOF approval (Admin can also approve as HOF)
      receipt.approvalHistory.push({
        approvedBy: req.user!._id,
        approvalLevel: 'HOF',
        approvedAt: new Date(),
        action: 'Approved',
        remarks,
      } as any);
      receipt.approvalStatus = ReceiptApprovalStatus.APPROVED;

      // Post to ledger
      await postReceiptToLedger(receipt);

      // Send payment confirmation SMS
      try {
        const client = await Client.findById(receipt.clientId);
        if (client && client.phone) {
          await smsService.sendPaymentConfirmation(
            client.phone,
            client.name,
            receipt.amount,
            receipt.receiptNumber,
            {
              clientId: client._id,
              saleId: receipt.saleId,
              receiptId: receipt._id,
              sentBy: req.user!._id,
            }
          );
        }
      } catch (smsError: unknown) {
        // Log error but don't fail the approval
        console.error('Failed to send payment confirmation SMS:', smsError.message);
      }
    } else {
      throw new ApiError(
        403,
        ErrorCode.FORBIDDEN,
        'You are not authorized to approve at this stage'
      );
    }

    await receipt.save();

    res.json({
      success: true,
      data: receipt,
      message: 'Receipt approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Reject receipt
export const rejectReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Receipt not found');
    }

    const userRole = req.user!.role;
    const approvalLevel =
      userRole === UserRole.ACCOUNT_MANAGER ? 'Accounts Manager' : 'HOF';

    receipt.approvalHistory.push({
      approvedBy: req.user!._id,
      approvalLevel,
      approvedAt: new Date(),
      action: 'Rejected',
      remarks,
    } as any);

    receipt.approvalStatus = ReceiptApprovalStatus.REJECTED;
    await receipt.save();

    res.json({
      success: true,
      data: receipt,
      message: 'Receipt rejected',
    });
  } catch (error) {
    next(error);
  }
};

// Post receipt to ledger (internal function)
async function postReceiptToLedger(receipt: any) {
  if (receipt.postedToLedger) {
    return; // Already posted
  }

  const client = await Client.findById(receipt.clientId);
  const sale = await Sale.findById(receipt.saleId);

  if (!client || !sale) {
    return;
  }

  // Create ledger entries
  await (Ledger as any).createReceiptEntry({
    receiptId: receipt._id,
    receiptNumber: receipt.receiptNumber,
    clientId: receipt.clientId,
    amount: receipt.amount,
    paymentMethod: receipt.method,
    receiptDate: receipt.receiptDate,
    description: `Receipt ${receipt.receiptNumber} from ${client.name} for Sale ${sale.saleNumber}`,
    createdBy: receipt.createdBy,
  });

  // Update sale with payment
  if (receipt.stageId) {
    const stage = sale.stages.id(receipt.stageId);
    if (stage) {
      stage.receivedAmount += receipt.amount;
      await sale.save();
    }
  }

  receipt.postedToLedger = true;
  receipt.ledgerPostingDate = new Date();
}

// Delete receipt
export const deleteReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Receipt not found');
    }

    // Only allow deletion of draft receipts
    if (receipt.approvalStatus !== ReceiptApprovalStatus.DRAFT) {
      throw new ApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Only draft receipts can be deleted'
      );
    }

    receipt.isActive = false;
    await receipt.save();

    res.json({
      success: true,
      message: 'Receipt deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get approval queue
export const getApprovalQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = req.user!.role;

    let query: any = { isActive: true };

    if (userRole === UserRole.ACCOUNT_MANAGER) {
      query.approvalStatus = ReceiptApprovalStatus.PENDING_ACCOUNTS;
    } else if (userRole === UserRole.ADMIN || userRole === UserRole.HOF) {
      query.approvalStatus = ReceiptApprovalStatus.PENDING_HOF;
    }

    const receipts = await Receipt.find(query)
      .populate('clientId', 'name phone')
      .populate('saleId', 'saleNumber')
      .populate('createdBy', 'username')
      .sort({ receiptDate: -1 });

    res.json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    next(error);
  }
};
