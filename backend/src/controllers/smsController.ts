import { Request, Response } from 'express';
import SMSTemplate from '../models/SMSTemplate';
import smsService from '../services/smsService';
import Sale, { ISale } from '../models/Sale';
import { Client } from '../models/Client';

// Extend Request to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
    _id: string;
    role: string;
  };
}

/**
 * Get all SMS templates
 */
export const getSMSTemplates = async (req: Request, res: Response) => {
  try {
    const { category, isActive } = req.query;
    const query: any = {};

    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const templates = await SMSTemplate.find(query).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_TEMPLATES_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Get SMS template by ID
 */
export const getSMSTemplateById = async (req: Request, res: Response) => {
  try {
    const template = await SMSTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'SMS template not found',
        },
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_TEMPLATE_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Create SMS template
 */
export const createSMSTemplate = async (req: Request, res: Response) => {
  try {
    const template = new SMSTemplate(req.body);
    await template.save();

    res.status(201).json({
      success: true,
      data: template,
      message: 'SMS template created successfully',
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_TEMPLATE_CODE',
          message: 'Template code already exists',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_TEMPLATE_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Update SMS template
 */
export const updateSMSTemplate = async (req: Request, res: Response) => {
  try {
    const template = await SMSTemplate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'SMS template not found',
        },
      });
    }

    res.json({
      success: true,
      data: template,
      message: 'SMS template updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_TEMPLATE_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Delete SMS template
 */
export const deleteSMSTemplate = async (req: Request, res: Response) => {
  try {
    const template = await SMSTemplate.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'SMS template not found',
        },
      });
    }

    res.json({
      success: true,
      message: 'SMS template deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_TEMPLATE_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Get SMS logs
 */
export const getSMSLogs = async (req: Request, res: Response) => {
  try {
    const { phone, clientId, status, category, startDate, endDate, page, limit } = req.query;

    const filters: any = {};

    if (phone) filters.phone = phone as string;
    if (clientId) filters.clientId = clientId;
    if (status) filters.status = status as string;
    if (category) filters.category = category as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (page) filters.page = parseInt(page as string);
    if (limit) filters.limit = parseInt(limit as string);

    const result = await smsService.getSMSLogs(filters);

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_LOGS_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Get SMS statistics
 */
export const getSMSStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const stats = await smsService.getSMSStats(filters);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_STATS_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Send test SMS
 */
export const sendTestSMS = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Phone and message are required',
        },
      });
    }

    const result = await smsService.sendSMS({
      phone,
      message,
      category: 'manual',
      sentBy: req.user?.userId,
    });

    res.json({
      success: true,
      data: result,
      message: 'Test SMS sent successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SEND_SMS_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Send bulk SMS
 */
export const sendBulkSMS = async (req: AuthRequest, res: Response) => {
  try {
    const { phones, message, templateCode, filters } = req.body;

    let recipients: string[] = phones || [];

    // If filters are provided, fetch clients based on filters
    if (filters) {
      const query: any = {};

      // Filter by project
      if (filters.project) {
        const sales = await Sale.find({ 'plot.project': filters.project }).distinct('clientId');
        query._id = { $in: sales };
      }

      // Filter by due status
      if (filters.dueStatus) {
        // Logic to filter clients with due installments
        // This would require aggregating installment schedules
      }

      // Filter by custom client list
      if (filters.clientIds && filters.clientIds.length > 0) {
        query._id = { $in: filters.clientIds };
      }

      const clients = await Client.find(query).select('phone');
      recipients = clients.map((c) => c.phone).filter((p) => p);
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_RECIPIENTS',
          message: 'No recipients found',
        },
      });
    }

    const result = await smsService.sendBulkSMS({
      phones: recipients,
      message,
      templateCode,
      category: 'bulk',
      sentBy: req.user?.userId,
    });

    res.json({
      success: true,
      data: result,
      message: `Bulk SMS sent to ${result.sent} recipients`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SEND_BULK_SMS_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * Preview bulk SMS recipients
 */
export const previewBulkSMSRecipients = async (req: Request, res: Response) => {
  try {
    const { filters } = req.body;

    const query: any = {};

    // Filter by project
    if (filters?.project) {
      const sales = await Sale.find({ 'plot.project': filters.project }).distinct('clientId');
      query._id = { $in: sales };
    }

    // Filter by custom client list
    if (filters?.clientIds && filters.clientIds.length > 0) {
      query._id = { $in: filters.clientIds };
    }

    const clients = await Client.find(query).select('name phone').lean();

    res.json({
      success: true,
      data: {
        count: clients.length,
        recipients: clients,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'PREVIEW_ERROR',
        message: error.message,
      },
    });
  }
};
