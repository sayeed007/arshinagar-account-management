import { Request, Response, NextFunction } from 'express';
import Sale, { ISale, SaleStatus } from '../models/Sale';
import Plot, { PlotStatus } from '../models/Plot';
import RSNumber from '../models/RSNumber';
import Client from '../models/Client';
import Ledger from '../models/Ledger';
import { ApiError, ErrorCode } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

// Create a new sale
export const createSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId, plotId, totalPrice, saleDate, stages, notes } = req.body;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Client not found');
    }

    // Verify plot exists and is available
    const plot = await Plot.findById(plotId);
    if (!plot) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Plot not found');
    }

    if (plot.status === PlotStatus.SOLD) {
      throw new ApiError(400, ErrorCode.VALIDATION_ERROR, 'Plot is already sold');
    }

    // Get RS Number
    const rsNumber = await RSNumber.findById(plot.rsNumberId);
    if (!rsNumber) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'RS Number not found');
    }

    // Generate sale number
    const saleNumber = await (Sale as any).generateSaleNumber();

    // Create sale
    const sale: ISale = new Sale({
      saleNumber,
      clientId,
      plotId,
      rsNumberId: plot.rsNumberId,
      totalPrice,
      saleDate: saleDate || new Date(),
      stages: stages || [],
      notes,
    });

    await sale.save();

    // Update plot status to Sold
    plot.status = PlotStatus.SOLD;
    plot.clientId = clientId;
    plot.saleDate = sale.saleDate;
    await plot.save();

    // Update RS Number: move area from allocated to sold
    rsNumber.allocatedArea -= plot.area;
    rsNumber.soldArea += plot.area;
    await rsNumber.save();

    // Create ledger entry for sale
    await (Ledger as any).createSaleEntry({
      saleId: sale._id,
      saleNumber: sale.saleNumber,
      clientId: sale.clientId,
      amount: sale.totalPrice,
      saleDate: sale.saleDate,
      description: `Sale ${sale.saleNumber} to ${client.name} - Plot ${plot.plotNumber}`,
      createdBy: req.user!._id,
    });

    res.status(201).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// Get all sales with filters
export const getAllSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, status, clientId, search, isActive = true } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { isActive };

    if (status) {
      query.status = status;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    if (search) {
      query.saleNumber = new RegExp(search as string, 'i');
    }

    // Get total count
    const total = await Sale.countDocuments(query);

    // Get sales with populated fields
    const sales = await Sale.find(query)
      .populate('clientId', 'name phone email')
      .populate('plotId', 'plotNumber area')
      .populate('rsNumberId', 'rsNumber projectName location')
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: sales,
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

// Get sale by ID
export const getSaleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findById(id)
      .populate('clientId', 'name phone email address nid')
      .populate('plotId', 'plotNumber area status')
      .populate('rsNumberId', 'rsNumber projectName location totalArea unitType');

    if (!sale) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Sale not found');
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// Update sale
export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating certain fields
    delete updates.saleNumber;
    delete updates.clientId;
    delete updates.plotId;
    delete updates.rsNumberId;
    delete updates.createdAt;

    const sale = await Sale.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!sale) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Sale not found');
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// Update sale stage
export const updateSaleStage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, stageId } = req.params;
    const { receivedAmount, notes } = req.body;

    const sale = await Sale.findById(id);
    if (!sale) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Sale not found');
    }

    // Find stage
    const stage = sale.stages.id(stageId);
    if (!stage) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Stage not found');
    }

    // Update stage
    if (receivedAmount !== undefined) {
      stage.receivedAmount += receivedAmount;
    }

    if (notes) {
      stage.notes = notes;
    }

    await sale.save();

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// Delete sale (soft delete)
export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findByIdAndUpdate(
      id,
      { isActive: false, status: SaleStatus.CANCELLED },
      { new: true }
    );

    if (!sale) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Sale not found');
    }

    // Revert plot status
    const plot = await Plot.findById(sale.plotId);
    if (plot) {
      plot.status = PlotStatus.AVAILABLE;
      plot.clientId = undefined;
      plot.saleDate = undefined;
      await plot.save();

      // Revert RS Number areas
      const rsNumber = await RSNumber.findById(plot.rsNumberId);
      if (rsNumber) {
        rsNumber.soldArea -= plot.area;
        rsNumber.allocatedArea += plot.area;
        await rsNumber.save();
      }
    }

    res.json({
      success: true,
      message: 'Sale cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get sale statistics
export const getSaleStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalSales = await Sale.countDocuments({ isActive: true });
    const activeSales = await Sale.countDocuments({
      isActive: true,
      status: SaleStatus.ACTIVE,
    });
    const completedSales = await Sale.countDocuments({
      isActive: true,
      status: SaleStatus.COMPLETED,
    });

    // Total sales amount
    const salesAmountAgg = await Sale.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalPrice' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
        },
      },
    ]);

    const salesAmount = salesAmountAgg[0] || {
      totalAmount: 0,
      totalPaid: 0,
      totalDue: 0,
    };

    // This month sales
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const salesThisMonth = await Sale.countDocuments({
      isActive: true,
      saleDate: { $gte: startOfMonth },
    });

    res.json({
      success: true,
      data: {
        totalSales,
        activeSales,
        completedSales,
        salesThisMonth,
        totalAmount: salesAmount.totalAmount,
        totalPaid: salesAmount.totalPaid,
        totalDue: salesAmount.totalDue,
      },
    });
  } catch (error) {
    next(error);
  }
};
