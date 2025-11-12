import { Request, Response } from 'express';
import Employee from '../models/Employee';
import EmployeeCost from '../models/EmployeeCost';
import { logger } from '../utils/logger';

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const query: any = {};

    // Filter by search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('createdBy', 'name email')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: unknown) {
    logger.error('Error in getAllEmployees:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_EMPLOYEES_ERROR',
        message: 'Failed to fetch employees',
      },
    });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id).populate('createdBy', 'name email');

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

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error: unknown) {
    logger.error('Error in getEmployeeById:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_EMPLOYEE_ERROR',
        message: 'Failed to fetch employee',
      },
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin, AccountManager)
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      designation,
      phone,
      email,
      nid,
      address,
      bankAccount,
      joinDate,
      baseSalary,
    } = req.body;

    // Check if employee with same phone exists
    const existingEmployee = await Employee.findOne({ phone });
    if (existingEmployee) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_PHONE',
          message: 'Employee with this phone number already exists',
        },
      });
      return;
    }

    const employee = await Employee.create({
      name,
      designation,
      phone,
      email,
      nid,
      address,
      bankAccount,
      joinDate,
      baseSalary,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created successfully',
    });
  } catch (error: unknown) {
    logger.error('Error in createEmployee:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_EMPLOYEE_ERROR',
        message: error.message || 'Failed to create employee',
      },
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, AccountManager)
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id);

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

    const {
      name,
      designation,
      phone,
      email,
      nid,
      address,
      bankAccount,
      joinDate,
      resignDate,
      baseSalary,
      isActive,
    } = req.body;

    // Check if new phone conflicts with existing employee
    if (phone && phone !== employee.phone) {
      const existingEmployee = await Employee.findOne({ phone });
      if (existingEmployee) {
        res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_PHONE',
            message: 'Employee with this phone number already exists',
          },
        });
        return;
      }
    }

    // Update fields
    if (name) employee.name = name;
    if (designation) employee.designation = designation;
    if (phone) employee.phone = phone;
    if (email !== undefined) employee.email = email;
    if (nid !== undefined) employee.nid = nid;
    if (address !== undefined) employee.address = address;
    if (bankAccount) employee.bankAccount = bankAccount;
    if (joinDate) employee.joinDate = joinDate;
    if (resignDate !== undefined) employee.resignDate = resignDate;
    if (baseSalary !== undefined) employee.baseSalary = baseSalary;
    if (isActive !== undefined) employee.isActive = isActive;

    await employee.save();

    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee updated successfully',
    });
  } catch (error: unknown) {
    logger.error('Error in updateEmployee:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_EMPLOYEE_ERROR',
        message: error.message || 'Failed to update employee',
      },
    });
  }
};

// @desc    Delete employee (soft delete)
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id);

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

    employee.isActive = false;
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error: unknown) {
    logger.error('Error in deleteEmployee:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_EMPLOYEE_ERROR',
        message: 'Failed to delete employee',
      },
    });
  }
};

// @desc    Get employee cost history
// @route   GET /api/employees/:id/costs
// @access  Private
export const getEmployeeCosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;

    const query: any = {
      employeeId: req.params.id,
      isActive: true,
    };

    if (year) query.year = parseInt(year as string);
    if (month) query.month = parseInt(month as string);

    const costs = await EmployeeCost.find(query)
      .populate('createdBy', 'name email')
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      data: costs,
    });
  } catch (error: unknown) {
    logger.error('Error in getEmployeeCosts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_COSTS_ERROR',
        message: 'Failed to fetch employee costs',
      },
    });
  }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Private
export const getEmployeeStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const activeEmployees = await Employee.countDocuments({
      isActive: true,
      resignDate: { $exists: false },
    });

    // Get current month's total payroll
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const currentMonthPayroll = await EmployeeCost.aggregate([
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
          totalPayroll: { $sum: '$netPay' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        currentMonthPayroll:
          currentMonthPayroll.length > 0 ? currentMonthPayroll[0].totalPayroll : 0,
      },
    });
  } catch (error: unknown) {
    logger.error('Error in getEmployeeStats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_STATS_ERROR',
        message: 'Failed to fetch employee statistics',
      },
    });
  }
};
