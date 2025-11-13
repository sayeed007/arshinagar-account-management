import { Response } from 'express';
import mongoose from 'mongoose';
import { RSNumber, IRSNumber } from '../models/RSNumber';
import { Plot, IPlot, PlotStatus } from '../models/Plot';
import { AuthRequest, ErrorCode } from '../types';
import { ApiError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';

/**
 * ===========================
 * RS Number Controllers
 * ===========================
 */

/**
 * Create New RS Number
 */
export const createRSNumber = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const rsData: Partial<IRSNumber> = req.body;

    // Check if RS Number already exists
    const existing = await RSNumber.findOne({ rsNumber: rsData.rsNumber });
    if (existing) {
      throw new ApiError(
        409,
        ErrorCode.DUPLICATE_ENTRY,
        'RS Number already exists'
      );
    }

    // Set initial remaining area equal to total area
    rsData.remainingArea = rsData.totalArea;

    const rsNumber = await RSNumber.create(rsData);

    logger.info(`RS Number created: ${rsNumber.rsNumber} by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      data: rsNumber,
      message: 'RS Number created successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get All RS Numbers with Pagination and Filtering
 */
export const getAllRSNumbers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      projectName,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Search
    if (search) {
      query.$text = { $search: search as string };
    }

    // Filter by project
    if (projectName) {
      query.projectName = projectName;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const total = await RSNumber.countDocuments(query);

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const rsNumbers = await RSNumber.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .lean();

    res.status(200).json({
      success: true,
      data: rsNumbers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get RS Number by ID with Plots
 */
export const getRSNumberById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const rsNumber = await RSNumber.findById(id);

    if (!rsNumber) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'RS Number not found');
    }

    // Get all plots for this RS Number
    const plots = await Plot.find({ rsNumberId: id, isActive: true })
      .populate('clientId', 'name phone email')
      .sort({ plotNumber: 1 })
      .lean();

    // Calculate plot statistics
    const plotStats = {
      total: plots.length,
      available: plots.filter((p) => p.status === PlotStatus.AVAILABLE).length,
      reserved: plots.filter((p) => p.status === PlotStatus.RESERVED).length,
      sold: plots.filter((p) => p.status === PlotStatus.SOLD).length,
      blocked: plots.filter((p) => p.status === PlotStatus.BLOCKED).length,
    };

    res.status(200).json({
      success: true,
      data: {
        rsNumber,
        plots,
        plotStats,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Update RS Number
 */
export const updateRSNumber = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: Partial<IRSNumber> = req.body;

    // If RS Number is being changed, check for duplicates
    if (updates.rsNumber) {
      const existing = await RSNumber.findOne({
        rsNumber: updates.rsNumber,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ApiError(
          409,
          ErrorCode.DUPLICATE_ENTRY,
          'RS Number already exists'
        );
      }
    }

    // If total area is being updated, validate against sold/allocated area
    if (updates.totalArea !== undefined) {
      const current = await RSNumber.findById(id);
      if (!current) {
        throw new ApiError(404, ErrorCode.NOT_FOUND, 'RS Number not found');
      }

      const usedArea = current.soldArea + current.allocatedArea;
      if (updates.totalArea < usedArea) {
        throw new ApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          `Total area cannot be less than used area (${usedArea} ${current.unitType})`
        );
      }
    }

    const rsNumber = await RSNumber.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!rsNumber) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'RS Number not found');
    }

    logger.info(`RS Number updated: ${rsNumber.rsNumber} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: rsNumber,
      message: 'RS Number updated successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete RS Number (Soft Delete)
 */
export const deleteRSNumber = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if there are any plots
    const plotCount = await Plot.countDocuments({ rsNumberId: id, isActive: true });
    if (plotCount > 0) {
      throw new ApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        `Cannot delete RS Number with ${plotCount} active plots`
      );
    }

    const rsNumber = await RSNumber.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!rsNumber) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'RS Number not found');
    }

    logger.info(`RS Number deleted: ${rsNumber.rsNumber} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'RS Number deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * ===========================
 * Plot Controllers
 * ===========================
 */

/**
 * Create New Plot
 */
export const createPlot = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const plotData: Partial<IPlot> = req.body;

    // Validate RS Number exists
    const rsNumber = await RSNumber.findById(plotData.rsNumberId);
    if (!rsNumber) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'RS Number not found');
    }

    // Check if plot number already exists for this RS Number
    const existingPlot = await Plot.findOne({
      rsNumberId: plotData.rsNumberId,
      plotNumber: plotData.plotNumber,
    });

    if (existingPlot) {
      throw new ApiError(
        409,
        ErrorCode.DUPLICATE_ENTRY,
        'Plot number already exists for this RS Number'
      );
    }

    // Check if there's enough remaining area
    if (plotData.area && plotData.area > rsNumber.remainingArea) {
      throw new ApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        `Insufficient area. Available: ${rsNumber.remainingArea} ${rsNumber.unitType}`
      );
    }

    // Create plot
    const plot = await Plot.create(plotData);

    // Update RS Number allocated area
    rsNumber.allocatedArea += plotData.area || 0;
    rsNumber.calculateRemainingArea();
    await rsNumber.save();

    logger.info(
      `Plot created: ${plot.plotNumber} in ${rsNumber.rsNumber} by ${req.user?.email}`
    );

    res.status(201).json({
      success: true,
      data: plot,
      message: 'Plot created successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get All Plots for an RS Number
 */
export const getPlotsByRSNumber = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { rsNumberId } = req.params;
    const { status } = req.query;

    const query: any = { rsNumberId, isActive: true };

    if (status) {
      query.status = status;
    }

    const plots = await Plot.find(query)
      .populate('clientId', 'name phone email')
      .populate('rsNumberId', 'rsNumber projectName location')
      .sort({ plotNumber: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: plots,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get Plot by ID
 */
export const getPlotById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const plot = await Plot.findById(id)
      .populate('clientId', 'name phone email address')
      .populate('rsNumberId', 'rsNumber projectName location unitType')
      .lean();

    if (!plot) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Plot not found');
    }

    res.status(200).json({
      success: true,
      data: plot,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Update Plot
 */
export const updatePlot = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: Partial<IPlot> = req.body;

    const plot = await Plot.findById(id);
    if (!plot) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Plot not found');
    }

    const rsNumber = await RSNumber.findById(plot.rsNumberId);
    if (!rsNumber) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'RS Number not found');
    }

    // If area is being changed, update RS Number areas
    if (updates.area !== undefined && updates.area !== plot.area) {
      const areaDiff = updates.area - plot.area;

      // Check if there's enough remaining area
      if (areaDiff > rsNumber.remainingArea) {
        throw new ApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          `Insufficient area. Available: ${rsNumber.remainingArea} ${rsNumber.unitType}`
        );
      }

      // Update RS Number
      rsNumber.allocatedArea += areaDiff;
      rsNumber.calculateRemainingArea();
      await rsNumber.save();
    }

    // If status is changing to SOLD, update RS Number
    if (updates.status === PlotStatus.SOLD && plot.status !== PlotStatus.SOLD) {
      rsNumber.soldArea += plot.area;
      rsNumber.allocatedArea -= plot.area;
      rsNumber.calculateRemainingArea();
      await rsNumber.save();
    }

    // If status is changing from SOLD to something else
    if (plot.status === PlotStatus.SOLD && updates.status !== PlotStatus.SOLD) {
      rsNumber.soldArea -= plot.area;
      rsNumber.allocatedArea += plot.area;
      rsNumber.calculateRemainingArea();
      await rsNumber.save();
    }

    // Update plot
    Object.assign(plot, updates);
    await plot.save();

    logger.info(`Plot updated: ${plot.plotNumber} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: plot,
      message: 'Plot updated successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete Plot (Soft Delete)
 */
export const deletePlot = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const plot = await Plot.findById(id);
    if (!plot) {
      throw new ApiError(404, ErrorCode.NOT_FOUND, 'Plot not found');
    }

    // Cannot delete sold plots
    if (plot.status === PlotStatus.SOLD) {
      throw new ApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Cannot delete sold plots'
      );
    }

    // Update RS Number area
    const rsNumber = await RSNumber.findById(plot.rsNumberId);
    if (rsNumber) {
      rsNumber.allocatedArea -= plot.area;
      rsNumber.calculateRemainingArea();
      await rsNumber.save();
    }

    plot.isActive = false;
    await plot.save();

    logger.info(`Plot deleted: ${plot.plotNumber} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Plot deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get Land Statistics
 */
export const getLandStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalRSNumbers = await RSNumber.countDocuments({ isActive: true });
    const totalPlots = await Plot.countDocuments({ isActive: true });

    const availablePlots = await Plot.countDocuments({
      status: PlotStatus.AVAILABLE,
      isActive: true,
    });

    const soldPlots = await Plot.countDocuments({
      status: PlotStatus.SOLD,
      isActive: true,
    });

    // Calculate total land area
    const landAreas = await RSNumber.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalArea: { $sum: '$totalArea' },
          soldArea: { $sum: '$soldArea' },
          allocatedArea: { $sum: '$allocatedArea' },
          remainingArea: { $sum: '$remainingArea' },
        },
      },
    ]);

    const areaStats = landAreas[0] || {
      totalArea: 0,
      soldArea: 0,
      allocatedArea: 0,
      remainingArea: 0,
    };

    // Calculate available and sold land areas from plots
    const availableLandAreas = await Plot.aggregate([
      { $match: { status: PlotStatus.AVAILABLE, isActive: true } },
      {
        $group: {
          _id: null,
          totalArea: { $sum: '$area' },
          count: { $sum: 1 },
        },
      },
    ]);

    const soldLandAreas = await Plot.aggregate([
      { $match: { status: PlotStatus.SOLD, isActive: true } },
      {
        $group: {
          _id: null,
          totalArea: { $sum: '$area' },
          count: { $sum: 1 },
        },
      },
    ]);

    const availableLandStats = availableLandAreas[0] || {
      totalArea: 0,
      count: 0,
    };

    const soldLandStats = soldLandAreas[0] || {
      totalArea: 0,
      count: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        totalRSNumbers,
        totalPlots,
        availablePlots,
        soldPlots,
        areaStats,
        availableLandStats,
        soldLandStats,
      },
    });
  } catch (error) {
    throw error;
  }
};
