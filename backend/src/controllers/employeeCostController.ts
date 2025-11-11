import { Request, Response } from 'express';
import EmployeeCost from '../models/EmployeeCost';
import Employee from '../models/Employee';
import { logger } from '../utils/logger';

// @desc    Get all employee costs
// @route   GET /api/employee-costs
// @access  Private
export const getAllEmployeeCosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, employeeId, year, month, isActive } = req.query;

    const query: any = {};

    if (employeeId) query.employeeId = employeeId;
    if (year) query.year = parseInt(year as string);
    if (month) query.month = parseInt(month as string);
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [costs, total] = await Promise.all([
      EmployeeCost.find(query)
        .populate('employeeId', 'name designation phone')
        .populate('createdBy', 'name email')
        .sort({ year: -1, month: -1 })
        .skip(skip)
        .limit(limitNum),
      EmployeeCost.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: costs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    logger.error('Error in getAllEmployeeCosts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_COSTS_ERROR',
        message: 'Failed to fetch employee costs',
      },
    });
  }
};

// @desc    Get employee cost by ID
// @route   GET /api/employee-costs/:id
// @access  Private
export const getEmployeeCostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const cost = await EmployeeCost.findById(req.params.id)
      .populate('employeeId')
      .populate('createdBy', 'name email');

    if (!cost) {
      res.status(404).json({
        success: false,
        error: {
          code: 'COST_NOT_FOUND',
          message: 'Employee cost record not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: cost,
    });
  } catch (error: any) {
    logger.error('Error in getEmployeeCostById:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_COST_ERROR',
        message: 'Failed to fetch employee cost',
      },
    });
  }
};

// @desc    Create employee cost entry
// @route   POST /api/employee-costs
// @access  Private (Admin, AccountManager)
export const createEmployeeCost = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      employeeId,
      month,
      year,
      salary,
      commission,
      fuel,
      entertainment,
      advances,
      deductions,
      bonus,
      overtime,
      otherAllowances,
      paymentDate,
      paymentMethod,
      notes,
    } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found',
        },
      });
      return;
    }

    // Check if cost entry already exists for this employee and month/year
    const existingCost = await EmployeeCost.findOne({
      employeeId,
      month,
      year,
    });

    if (existingCost) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_COST_ENTRY',
          message: 'Cost entry for this employee and period already exists',
        },
      });
      return;
    }

    const cost = await EmployeeCost.create({
      employeeId,
      month,
      year,
      salary: salary || employee.baseSalary || 0,
      commission: commission || 0,
      fuel: fuel || 0,
      entertainment: entertainment || 0,
      advances: advances || 0,
      deductions: deductions || 0,
      bonus: bonus || 0,
      overtime: overtime || 0,
      otherAllowances: otherAllowances || 0,
      paymentDate,
      paymentMethod,
      notes,
      createdBy: req.user._id,
    });

    await cost.populate([
      { path: 'employeeId', select: 'name designation phone' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      data: cost,
      message: 'Employee cost entry created successfully',
    });
  } catch (error: any) {
    logger.error('Error in createEmployeeCost:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_COST_ERROR',
        message: error.message || 'Failed to create employee cost entry',
      },
    });
  }
};

// @desc    Update employee cost
// @route   PUT /api/employee-costs/:id
// @access  Private (Admin, AccountManager)
export const updateEmployeeCost = async (req: Request, res: Response): Promise<void> => {
  try {
    const cost = await EmployeeCost.findById(req.params.id);

    if (!cost) {
      res.status(404).json({
        success: false,
        error: {
          code: 'COST_NOT_FOUND',
          message: 'Employee cost record not found',
        },
      });
      return;
    }

    const {
      salary,
      commission,
      fuel,
      entertainment,
      advances,
      deductions,
      bonus,
      overtime,
      otherAllowances,
      paymentDate,
      paymentMethod,
      notes,
    } = req.body;

    // Update fields
    if (salary !== undefined) cost.salary = salary;
    if (commission !== undefined) cost.commission = commission;
    if (fuel !== undefined) cost.fuel = fuel;
    if (entertainment !== undefined) cost.entertainment = entertainment;
    if (advances !== undefined) cost.advances = advances;
    if (deductions !== undefined) cost.deductions = deductions;
    if (bonus !== undefined) cost.bonus = bonus;
    if (overtime !== undefined) cost.overtime = overtime;
    if (otherAllowances !== undefined) cost.otherAllowances = otherAllowances;
    if (paymentDate) cost.paymentDate = paymentDate;
    if (paymentMethod) cost.paymentMethod = paymentMethod;
    if (notes !== undefined) cost.notes = notes;

    await cost.save();

    await cost.populate([
      { path: 'employeeId', select: 'name designation phone' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      data: cost,
      message: 'Employee cost updated successfully',
    });
  } catch (error: any) {
    logger.error('Error in updateEmployeeCost:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_COST_ERROR',
        message: error.message || 'Failed to update employee cost',
      },
    });
  }
};

// @desc    Delete employee cost (soft delete)
// @route   DELETE /api/employee-costs/:id
// @access  Private (Admin)
export const deleteEmployeeCost = async (req: Request, res: Response): Promise<void> => {
  try {
    const cost = await EmployeeCost.findById(req.params.id);

    if (!cost) {
      res.status(404).json({
        success: false,
        error: {
          code: 'COST_NOT_FOUND',
          message: 'Employee cost record not found',
        },
      });
      return;
    }

    cost.isActive = false;
    await cost.save();

    res.status(200).json({
      success: true,
      message: 'Employee cost deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error in deleteEmployeeCost:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_COST_ERROR',
        message: 'Failed to delete employee cost',
      },
    });
  }
};

// @desc    Get monthly payroll summary
// @route   GET /api/employee-costs/payroll/summary
// @access  Private
export const getPayrollSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'Year and month are required',
        },
      });
      return;
    }

    const summary = await EmployeeCost.aggregate([
      {
        $match: {
          year: parseInt(year as string),
          month: parseInt(month as string),
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          totalSalary: { $sum: '$salary' },
          totalCommission: { $sum: '$commission' },
          totalFuel: { $sum: '$fuel' },
          totalEntertainment: { $sum: '$entertainment' },
          totalBonus: { $sum: '$bonus' },
          totalOvertime: { $sum: '$overtime' },
          totalOtherAllowances: { $sum: '$otherAllowances' },
          totalAdvances: { $sum: '$advances' },
          totalDeductions: { $sum: '$deductions' },
          totalNetPay: { $sum: '$netPay' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: summary.length > 0 ? summary[0] : {
        totalEmployees: 0,
        totalSalary: 0,
        totalCommission: 0,
        totalFuel: 0,
        totalEntertainment: 0,
        totalBonus: 0,
        totalOvertime: 0,
        totalOtherAllowances: 0,
        totalAdvances: 0,
        totalDeductions: 0,
        totalNetPay: 0,
      },
    });
  } catch (error: any) {
    logger.error('Error in getPayrollSummary:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SUMMARY_ERROR',
        message: 'Failed to fetch payroll summary',
      },
    });
  }
};

// @desc    Get employee cost statistics
// @route   GET /api/employee-costs/stats
// @access  Private
export const getEmployeeCostStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Get current month stats
    const currentMonthStats = await EmployeeCost.aggregate([
      {
        $match: {
          year: currentYear,
          month: currentMonth,
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          employeeCount: { $sum: 1 },
          totalPayroll: { $sum: '$netPay' },
        },
      },
    ]);

    // Get year-to-date stats
    const ytdStats = await EmployeeCost.aggregate([
      {
        $match: {
          year: currentYear,
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalPayroll: { $sum: '$netPay' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        currentMonth: {
          employeeCount: currentMonthStats.length > 0 ? currentMonthStats[0].employeeCount : 0,
          totalPayroll: currentMonthStats.length > 0 ? currentMonthStats[0].totalPayroll : 0,
        },
        yearToDate: {
          totalPayroll: ytdStats.length > 0 ? ytdStats[0].totalPayroll : 0,
        },
      },
    });
  } catch (error: any) {
    logger.error('Error in getEmployeeCostStats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_STATS_ERROR',
        message: 'Failed to fetch employee cost statistics',
      },
    });
  }
};
