import { Request, Response } from 'express';
import BankAccount from '../models/BankAccount';
import { AuthRequest } from '../types';

// Get all bank accounts
export const getAllBankAccounts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { isDeleted: false };

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.bankName) {
      filter.bankName = { $regex: req.query.bankName, $options: 'i' };
    }

    if (req.query.accountType) {
      filter.accountType = req.query.accountType;
    }

    const bankAccounts = await BankAccount.find(filter)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BankAccount.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bankAccounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Get all bank accounts error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BANK_ACCOUNTS_ERROR',
        message: 'Failed to fetch bank accounts',
        details: error.message,
      },
    });
  }
};

// Get single bank account by ID
export const getBankAccountById = async (req: Request, res: Response) => {
  try {
    const bankAccount = await BankAccount.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate('createdBy', 'username email');

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BANK_ACCOUNT_NOT_FOUND',
          message: 'Bank account not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: bankAccount,
    });
  } catch (error: unknown) {
    console.error('Get bank account by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BANK_ACCOUNT_ERROR',
        message: 'Failed to fetch bank account',
        details: error.message,
      },
    });
  }
};

// Create bank account
export const createBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const {
      bankName,
      branchName,
      accountNumber,
      accountName,
      accountType,
      openingBalance,
      notes,
    } = req.body;

    // Validate required fields
    if (!bankName || !accountNumber || !accountName || !accountType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Bank name, account number, account name, and account type are required',
        },
      });
    }

    // Check if account number already exists
    const existingAccount = await BankAccount.findOne({ accountNumber, isDeleted: false });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ACCOUNT_NUMBER_EXISTS',
          message: 'An account with this account number already exists',
        },
      });
    }

    // Create bank account
    const bankAccount = new BankAccount({
      bankName,
      branchName,
      accountNumber,
      accountName,
      accountType,
      openingBalance: openingBalance || 0,
      notes,
      createdBy: req.user!.userId,
    });

    await bankAccount.save();

    const populatedBankAccount = await BankAccount.findById(bankAccount._id).populate(
      'createdBy',
      'username email'
    );

    res.status(201).json({
      success: true,
      data: populatedBankAccount,
      message: 'Bank account created successfully',
    });
  } catch (error: unknown) {
    console.error('Create bank account error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_BANK_ACCOUNT_ERROR',
        message: 'Failed to create bank account',
        details: error.message,
      },
    });
  }
};

// Update bank account
export const updateBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const {
      bankName,
      branchName,
      accountName,
      accountType,
      isActive,
      notes,
    } = req.body;

    const bankAccount = await BankAccount.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BANK_ACCOUNT_NOT_FOUND',
          message: 'Bank account not found',
        },
      });
    }

    // Update fields (account number cannot be changed)
    if (bankName !== undefined) bankAccount.bankName = bankName;
    if (branchName !== undefined) bankAccount.branchName = branchName;
    if (accountName !== undefined) bankAccount.accountName = accountName;
    if (accountType !== undefined) bankAccount.accountType = accountType;
    if (isActive !== undefined) bankAccount.isActive = isActive;
    if (notes !== undefined) bankAccount.notes = notes;

    await bankAccount.save();

    const populatedBankAccount = await BankAccount.findById(bankAccount._id).populate(
      'createdBy',
      'username email'
    );

    res.status(200).json({
      success: true,
      data: populatedBankAccount,
      message: 'Bank account updated successfully',
    });
  } catch (error: unknown) {
    console.error('Update bank account error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_BANK_ACCOUNT_ERROR',
        message: 'Failed to update bank account',
        details: error.message,
      },
    });
  }
};

// Delete bank account (soft delete)
export const deleteBankAccount = async (req: Request, res: Response) => {
  try {
    const bankAccount = await BankAccount.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BANK_ACCOUNT_NOT_FOUND',
          message: 'Bank account not found',
        },
      });
    }

    // Soft delete
    bankAccount.isDeleted = true;
    bankAccount.isActive = false;
    await bankAccount.save();

    res.status(200).json({
      success: true,
      message: 'Bank account deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete bank account error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_BANK_ACCOUNT_ERROR',
        message: 'Failed to delete bank account',
        details: error.message,
      },
    });
  }
};

// Get bank account statistics
export const getBankAccountStats = async (req: Request, res: Response) => {
  try {
    const filter: any = { isDeleted: false };

    const stats = await BankAccount.aggregate([
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

    // Get balance by account type
    const balanceByType = await BankAccount.aggregate([
      { $match: { ...filter, isActive: true } },
      {
        $group: {
          _id: '$accountType',
          count: { $sum: 1 },
          totalBalance: { $sum: '$currentBalance' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...( stats.length > 0
          ? stats[0]
          : {
              totalAccounts: 0,
              activeAccounts: 0,
              totalBalance: 0,
            }),
        balanceByType,
      },
    });
  } catch (error: unknown) {
    console.error('Get bank account stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BANK_ACCOUNT_STATS_ERROR',
        message: 'Failed to fetch bank account statistics',
        details: error.message,
      },
    });
  }
};
