import { Request, Response } from 'express';
import reportService from '../services/reportService';
import Sale from '../models/Sale';
import { Client } from '../models/Client';
import Receipt from '../models/Receipt';
import Expense from '../models/Expense';

/**
 * Generate Day Book report
 */
export const getDayBook = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATES',
          message: 'Start date and end date are required',
        },
      });
    }

    const report = await reportService.generateDayBook(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Generate Cash Book report
 */
export const getCashBook = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATES',
          message: 'Start date and end date are required',
        },
      });
    }

    const report = await reportService.generateCashBook(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Generate Bank Book report
 */
export const getBankBook = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, bankAccountId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATES',
          message: 'Start date and end date are required',
        },
      });
    }

    const report = await reportService.generateBankBook(
      new Date(startDate as string),
      new Date(endDate as string),
      bankAccountId as string | undefined
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Generate Receipt & Payment Register
 */
export const getReceiptPaymentRegister = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATES',
          message: 'Start date and end date are required',
        },
      });
    }

    const report = await reportService.generateReceiptPaymentRegister(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Generate Customer Statement
 */
export const getCustomerStatement = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate } = req.query;

    const report = await reportService.generateCustomerStatement(
      clientId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Generate Aging Report
 */
export const getAgingReport = async (req: Request, res: Response) => {
  try {
    const report = await reportService.generateAgingReport();

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Generate Stage-wise Collection Report
 */
export const getStageWiseCollectionReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const report = await reportService.generateStageWiseCollectionReport(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Generate Expense by Category Report
 */
export const getExpenseByCategoryReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATES',
          message: 'Start date and end date are required',
        },
      });
    }

    const report = await reportService.generateExpenseByCategoryReport(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Generate Employee Cost Summary Report
 */
export const getEmployeeCostSummaryReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATES',
          message: 'Start date and end date are required',
        },
      });
    }

    const report = await reportService.generateEmployeeCostSummaryReport(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalClients,
      activeSales,
      totalSalesValue,
      totalAmountDue,
      totalReceipts,
      totalExpenses,
    ] = await Promise.all([
      Client.countDocuments({ isActive: true }),
      Sale.countDocuments({ saleStatus: { $nin: ['Cancelled', 'Completed'] } }),
      Sale.aggregate([
        { $match: { saleStatus: { $nin: ['Cancelled'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Sale.aggregate([
        { $match: { saleStatus: { $nin: ['Cancelled', 'Completed'] } } },
        {
          $project: {
            due: { $subtract: ['$totalPrice', '$paidAmount'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$due' } } },
      ]),
      Receipt.countDocuments({ approvalStatus: 'Approved' }),
      Expense.countDocuments({ approvalStatus: 'Approved' }),
    ]);

    res.json({
      success: true,
      data: {
        totalClients,
        activeSales,
        totalSalesValue: totalSalesValue[0]?.total || 0,
        totalAmountDue: totalAmountDue[0]?.total || 0,
        totalReceipts,
        totalExpenses,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: error.message,
      },
    });
  }
};
