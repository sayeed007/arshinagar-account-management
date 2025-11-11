import { Request, Response } from 'express';
import ExpenseCategory from '../models/ExpenseCategory';
import { logger } from '../utils/logger';

// @desc    Get all expense categories
// @route   GET /api/expense-categories
// @access  Private
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const query: any = {};

    // Filter by search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [categories, total] = await Promise.all([
      ExpenseCategory.find(query)
        .populate('createdBy', 'name email')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum),
      ExpenseCategory.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    logger.error('Error in getAllCategories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CATEGORIES_ERROR',
        message: 'Failed to fetch expense categories',
      },
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/expense-categories/:id
// @access  Private
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await ExpenseCategory.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!category) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Expense category not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    logger.error('Error in getCategoryById:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CATEGORY_ERROR',
        message: 'Failed to fetch expense category',
      },
    });
  }
};

// @desc    Create new expense category
// @route   POST /api/expense-categories
// @access  Private (Admin, AccountManager)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    // Check if category with same name exists
    const existingCategory = await ExpenseCategory.findOne({ name });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_CATEGORY',
          message: 'Expense category with this name already exists',
        },
      });
      return;
    }

    const category = await ExpenseCategory.create({
      name,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Expense category created successfully',
    });
  } catch (error: any) {
    logger.error('Error in createCategory:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_CATEGORY_ERROR',
        message: error.message || 'Failed to create expense category',
      },
    });
  }
};

// @desc    Update expense category
// @route   PUT /api/expense-categories/:id
// @access  Private (Admin, AccountManager)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, isActive } = req.body;

    const category = await ExpenseCategory.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Expense category not found',
        },
      });
      return;
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await ExpenseCategory.findOne({ name });
      if (existingCategory) {
        res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_CATEGORY',
            message: 'Expense category with this name already exists',
          },
        });
        return;
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      data: category,
      message: 'Expense category updated successfully',
    });
  } catch (error: any) {
    logger.error('Error in updateCategory:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_CATEGORY_ERROR',
        message: error.message || 'Failed to update expense category',
      },
    });
  }
};

// @desc    Delete expense category (soft delete)
// @route   DELETE /api/expense-categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await ExpenseCategory.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Expense category not found',
        },
      });
      return;
    }

    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Expense category deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error in deleteCategory:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_CATEGORY_ERROR',
        message: 'Failed to delete expense category',
      },
    });
  }
};
