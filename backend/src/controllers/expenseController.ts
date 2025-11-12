import { Request, Response } from 'express';
import Expense, { ExpenseStatus } from '../models/Expense';
import Ledger from '../models/Ledger';
import { logger } from '../utils/logger';

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
export const getAllExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, categoryId, startDate, endDate, isActive } = req.query;

    const query: any = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) {
        query.expenseDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.expenseDate.$lte = new Date(endDate as string);
      }
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('categoryId', 'name')
        .populate('createdBy', 'name email')
        .populate('approvalHistory.approvedBy', 'name email')
        .sort({ expenseDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Expense.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: unknown) {
    logger.error('Error in getAllExpenses:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_EXPENSES_ERROR',
        message: 'Failed to fetch expenses',
      },
    });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('categoryId')
      .populate('createdBy', 'name email role')
      .populate('approvalHistory.approvedBy', 'name email role');

    if (!expense) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EXPENSE_NOT_FOUND',
          message: 'Expense not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error: unknown) {
    logger.error('Error in getExpenseById:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_EXPENSE_ERROR',
        message: 'Failed to fetch expense',
      },
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private (Admin, AccountManager)
export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      categoryId,
      amount,
      expenseDate,
      vendor,
      description,
      paymentMethod,
      instrumentDetails,
      notes,
    } = req.body;

    // Validate instrument details for cheque payments
    if (paymentMethod === 'Cheque') {
      if (!instrumentDetails?.bankName || !instrumentDetails?.chequeNumber) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYMENT_DETAILS',
            message: 'Bank name and cheque number are required for cheque payments',
          },
        });
        return;
      }
    }

    const expense = await Expense.create({
      categoryId,
      amount,
      expenseDate: expenseDate || new Date(),
      vendor,
      description,
      paymentMethod,
      instrumentDetails,
      notes,
      status: ExpenseStatus.DRAFT,
      createdBy: req.user._id,
    });

    await expense.populate([
      { path: 'categoryId', select: 'name' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully',
    });
  } catch (error: unknown) {
    logger.error('Error in createExpense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_EXPENSE_ERROR',
        message: error.message || 'Failed to create expense',
      },
    });
  }
};

// @desc    Update expense (only draft)
// @route   PUT /api/expenses/:id
// @access  Private (Admin, AccountManager)
export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EXPENSE_NOT_FOUND',
          message: 'Expense not found',
        },
      });
      return;
    }

    // Only allow editing of draft expenses
    if (expense.status !== ExpenseStatus.DRAFT) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_EDIT_EXPENSE',
          message: 'Only draft expenses can be edited',
        },
      });
      return;
    }

    const {
      categoryId,
      amount,
      expenseDate,
      vendor,
      description,
      paymentMethod,
      instrumentDetails,
      notes,
    } = req.body;

    // Update fields
    if (categoryId) expense.categoryId = categoryId;
    if (amount) expense.amount = amount;
    if (expenseDate) expense.expenseDate = expenseDate;
    if (vendor !== undefined) expense.vendor = vendor;
    if (description) expense.description = description;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (instrumentDetails) expense.instrumentDetails = instrumentDetails;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    await expense.populate([
      { path: 'categoryId', select: 'name' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense updated successfully',
    });
  } catch (error: unknown) {
    logger.error('Error in updateExpense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_EXPENSE_ERROR',
        message: error.message || 'Failed to update expense',
      },
    });
  }
};

// @desc    Submit expense for approval
// @route   POST /api/expenses/:id/submit
// @access  Private (Creator only)
export const submitExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EXPENSE_NOT_FOUND',
          message: 'Expense not found',
        },
      });
      return;
    }

    if (expense.status !== ExpenseStatus.DRAFT) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only draft expenses can be submitted',
        },
      });
      return;
    }

    expense.status = ExpenseStatus.PENDING_ACCOUNTS;
    await expense.save();

    await expense.populate([
      { path: 'categoryId', select: 'name' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense submitted for approval',
    });
  } catch (error: unknown) {
    logger.error('Error in submitExpense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMIT_EXPENSE_ERROR',
        message: 'Failed to submit expense',
      },
    });
  }
};

// @desc    Approve expense
// @route   POST /api/expenses/:id/approve
// @access  Private (AccountManager, HOF)
export const approveExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { remarks } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EXPENSE_NOT_FOUND',
          message: 'Expense not found',
        },
      });
      return;
    }

    const userRole = req.user.role;

    // Approval logic based on user role
    if (
      expense.status === ExpenseStatus.PENDING_ACCOUNTS &&
      userRole === 'AccountManager'
    ) {
      // Account Manager approves -> moves to HOF
      expense.status = ExpenseStatus.PENDING_HOF;
      expense.approvalHistory.push({
        approvedBy: req.user._id,
        approvedAt: new Date(),
        remarks,
        action: 'Approved',
      });
    } else if (expense.status === ExpenseStatus.PENDING_HOF && userRole === 'HOF') {
      // HOF final approval -> post to ledger
      expense.status = ExpenseStatus.APPROVED;
      expense.approvalHistory.push({
        approvedBy: req.user._id,
        approvedAt: new Date(),
        remarks,
        action: 'Approved',
      });

      // Post to ledger (double-entry: debit Expense, credit Cash/Bank)
      await Ledger.create({
        account: 'Expense',
        debit: expense.amount,
        credit: 0,
        transactionType: 'Expense',
        referenceModel: 'Expense',
        referenceId: expense._id,
        description: `Expense: ${expense.description}`,
        transactionDate: expense.expenseDate,
        createdBy: req.user._id,
      });

      await Ledger.create({
        account: expense.paymentMethod === 'Cash' ? 'Cash' : 'Bank',
        debit: 0,
        credit: expense.amount,
        transactionType: 'Expense',
        referenceModel: 'Expense',
        referenceId: expense._id,
        description: `Payment: ${expense.description}`,
        transactionDate: expense.expenseDate,
        createdBy: req.user._id,
      });
    } else {
      res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to approve this expense at this stage',
        },
      });
      return;
    }

    await expense.save();

    await expense.populate([
      { path: 'categoryId', select: 'name' },
      { path: 'createdBy', select: 'name email' },
      { path: 'approvalHistory.approvedBy', select: 'name email role' },
    ]);

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense approved successfully',
    });
  } catch (error: unknown) {
    logger.error('Error in approveExpense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'APPROVE_EXPENSE_ERROR',
        message: 'Failed to approve expense',
      },
    });
  }
};

// @desc    Reject expense
// @route   POST /api/expenses/:id/reject
// @access  Private (AccountManager, HOF)
export const rejectExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { remarks } = req.body;

    if (!remarks || remarks.trim() === '') {
      res.status(400).json({
        success: false,
        error: {
          code: 'REMARKS_REQUIRED',
          message: 'Rejection remarks are required',
        },
      });
      return;
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EXPENSE_NOT_FOUND',
          message: 'Expense not found',
        },
      });
      return;
    }

    expense.status = ExpenseStatus.REJECTED;
    expense.approvalHistory.push({
      approvedBy: req.user._id,
      approvedAt: new Date(),
      remarks,
      action: 'Rejected',
    });

    await expense.save();

    await expense.populate([
      { path: 'categoryId', select: 'name' },
      { path: 'createdBy', select: 'name email' },
      { path: 'approvalHistory.approvedBy', select: 'name email role' },
    ]);

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense rejected',
    });
  } catch (error: unknown) {
    logger.error('Error in rejectExpense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REJECT_EXPENSE_ERROR',
        message: 'Failed to reject expense',
      },
    });
  }
};

// @desc    Get approval queue
// @route   GET /api/expenses/approval-queue
// @access  Private (AccountManager, HOF)
export const getApprovalQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user.role;

    let query: any = { isActive: true };

    if (userRole === 'AccountManager') {
      query.status = ExpenseStatus.PENDING_ACCOUNTS;
    } else if (userRole === 'HOF') {
      query.status = ExpenseStatus.PENDING_HOF;
    } else {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    const expenses = await Expense.find(query)
      .populate('categoryId', 'name')
      .populate('createdBy', 'name email')
      .sort({ expenseDate: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error: unknown) {
    logger.error('Error in getApprovalQueue:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_QUEUE_ERROR',
        message: 'Failed to fetch approval queue',
      },
    });
  }
};

// @desc    Delete expense (soft delete, only draft)
// @route   DELETE /api/expenses/:id
// @access  Private (Admin, Creator)
export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EXPENSE_NOT_FOUND',
          message: 'Expense not found',
        },
      });
      return;
    }

    // Only allow deleting draft expenses
    if (expense.status !== ExpenseStatus.DRAFT) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_EXPENSE',
          message: 'Only draft expenses can be deleted',
        },
      });
      return;
    }

    expense.isActive = false;
    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error: unknown) {
    logger.error('Error in deleteExpense:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_EXPENSE_ERROR',
        message: 'Failed to delete expense',
      },
    });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
export const getExpenseStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const dateQuery: any = {};
    if (startDate) dateQuery.$gte = new Date(startDate as string);
    if (endDate) dateQuery.$lte = new Date(endDate as string);

    const matchQuery: any = { isActive: true, status: ExpenseStatus.APPROVED };
    if (Object.keys(dateQuery).length > 0) {
      matchQuery.expenseDate = dateQuery;
    }

    const stats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Get expenses by category
    const categoryStats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $lookup: {
          from: 'expensecategories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name',
          count: 1,
          totalAmount: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Get pending approvals count
    const pendingCount = await Expense.countDocuments({
      isActive: true,
      status: { $in: [ExpenseStatus.PENDING_ACCOUNTS, ExpenseStatus.PENDING_HOF] },
    });

    res.status(200).json({
      success: true,
      data: {
        totalExpenses: stats.length > 0 ? stats[0].totalExpenses : 0,
        totalAmount: stats.length > 0 ? stats[0].totalAmount : 0,
        pendingApprovals: pendingCount,
        categoryBreakdown: categoryStats,
      },
    });
  } catch (error: unknown) {
    logger.error('Error in getExpenseStats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_STATS_ERROR',
        message: 'Failed to fetch expense statistics',
      },
    });
  }
};
