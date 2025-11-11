import { Request, Response } from 'express';
import CashAccount from '../models/CashAccount';
import { AuthRequest } from '../middlewares/auth.middleware';

// Get all cash accounts
export const getAllCashAccounts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { isDeleted: false };

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }

    const cashAccounts = await CashAccount.find(filter)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CashAccount.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: cashAccounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get all cash accounts error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CASH_ACCOUNTS_ERROR',
        message: 'Failed to fetch cash accounts',
        details: error.message,
      },
    });
  }
};

// Get single cash account by ID
export const getCashAccountById = async (req: Request, res: Response) => {
  try {
    const cashAccount = await CashAccount.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate('createdBy', 'username email');

    if (!cashAccount) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CASH_ACCOUNT_NOT_FOUND',
          message: 'Cash account not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: cashAccount,
    });
  } catch (error: any) {
    console.error('Get cash account by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CASH_ACCOUNT_ERROR',
        message: 'Failed to fetch cash account',
        details: error.message,
      },
    });
  }
};

// Create cash account
export const createCashAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, openingBalance, notes } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Cash account name is required',
        },
      });
    }

    // Check if cash account name already exists
    const existingAccount = await CashAccount.findOne({ name, isDeleted: false });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ACCOUNT_NAME_EXISTS',
          message: 'A cash account with this name already exists',
        },
      });
    }

    // Create cash account
    const cashAccount = new CashAccount({
      name,
      description,
      openingBalance: openingBalance || 0,
      notes,
      createdBy: req.user!.userId,
    });

    await cashAccount.save();

    const populatedCashAccount = await CashAccount.findById(cashAccount._id).populate(
      'createdBy',
      'username email'
    );

    res.status(201).json({
      success: true,
      data: populatedCashAccount,
      message: 'Cash account created successfully',
    });
  } catch (error: any) {
    console.error('Create cash account error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_CASH_ACCOUNT_ERROR',
        message: 'Failed to create cash account',
        details: error.message,
      },
    });
  }
};

// Update cash account
export const updateCashAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, isActive, notes } = req.body;

    const cashAccount = await CashAccount.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!cashAccount) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CASH_ACCOUNT_NOT_FOUND',
          message: 'Cash account not found',
        },
      });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== cashAccount.name) {
      const existingAccount = await CashAccount.findOne({ name, isDeleted: false });
      if (existingAccount) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ACCOUNT_NAME_EXISTS',
            message: 'A cash account with this name already exists',
          },
        });
      }
    }

    // Update fields
    if (name !== undefined) cashAccount.name = name;
    if (description !== undefined) cashAccount.description = description;
    if (isActive !== undefined) cashAccount.isActive = isActive;
    if (notes !== undefined) cashAccount.notes = notes;

    await cashAccount.save();

    const populatedCashAccount = await CashAccount.findById(cashAccount._id).populate(
      'createdBy',
      'username email'
    );

    res.status(200).json({
      success: true,
      data: populatedCashAccount,
      message: 'Cash account updated successfully',
    });
  } catch (error: any) {
    console.error('Update cash account error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_CASH_ACCOUNT_ERROR',
        message: 'Failed to update cash account',
        details: error.message,
      },
    });
  }
};

// Delete cash account (soft delete)
export const deleteCashAccount = async (req: Request, res: Response) => {
  try {
    const cashAccount = await CashAccount.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!cashAccount) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CASH_ACCOUNT_NOT_FOUND',
          message: 'Cash account not found',
        },
      });
    }

    // Soft delete
    cashAccount.isDeleted = true;
    cashAccount.isActive = false;
    await cashAccount.save();

    res.status(200).json({
      success: true,
      message: 'Cash account deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete cash account error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_CASH_ACCOUNT_ERROR',
        message: 'Failed to delete cash account',
        details: error.message,
      },
    });
  }
};

// Get cash account statistics
export const getCashAccountStats = async (req: Request, res: Response) => {
  try {
    const filter: any = { isDeleted: false };

    const stats = await CashAccount.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAccounts: { $sum: 1 },
          activeAccounts: {
            $sum: { $cond: ['$isActive', 1, 0] },
          },
          totalBalance: { $sum: '$currentBalance' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data:
        stats.length > 0
          ? stats[0]
          : {
              totalAccounts: 0,
              activeAccounts: 0,
              totalBalance: 0,
            },
    });
  } catch (error: any) {
    console.error('Get cash account stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CASH_ACCOUNT_STATS_ERROR',
        message: 'Failed to fetch cash account statistics',
        details: error.message,
      },
    });
  }
};
