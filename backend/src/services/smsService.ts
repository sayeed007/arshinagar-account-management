import axios from 'axios';
import SMSLog from '../models/SMSLog';
import SMSTemplate from '../models/SMSTemplate';
import { ISMSTemplate } from '../models/SMSTemplate';
import mongoose from 'mongoose';

interface SMSOptions {
  phone: string;
  message: string;
  templateCode?: string;
  clientId?: mongoose.Types.ObjectId;
  saleId?: mongoose.Types.ObjectId;
  receiptId?: mongoose.Types.ObjectId;
  chequeId?: mongoose.Types.ObjectId;
  category: 'payment_confirmation' | 'installment_reminder' | 'missed_installment' | 'cheque_due' | 'bulk' | 'manual';
  sentBy?: mongoose.Types.ObjectId;
}

interface BulkSMSOptions {
  phones: string[];
  message: string;
  templateCode?: string;
  category: 'payment_confirmation' | 'installment_reminder' | 'missed_installment' | 'cheque_due' | 'bulk' | 'manual';
  sentBy?: mongoose.Types.ObjectId;
}

class SMSService {
  private gatewayUrl: string;
  private apiKey: string;
  private senderId: string;
  private enabled: boolean;

  constructor() {
    this.gatewayUrl = process.env.SMS_GATEWAY_URL || '';
    this.apiKey = process.env.SMS_API_KEY || '';
    this.senderId = process.env.SMS_SENDER_ID || 'Arshinagar';
    this.enabled = process.env.SMS_ENABLED === 'true';
  }

  /**
   * Replace template variables with actual values
   */
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let message = template;
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      message = message.replace(regex, variables[key] || '');
    });
    return message;
  }

  /**
   * Send a single SMS
   */
  async sendSMS(options: SMSOptions): Promise<any> {
    // Create SMS log entry
    const smsLog = new SMSLog({
      phone: options.phone,
      message: options.message,
      templateCode: options.templateCode,
      clientId: options.clientId,
      saleId: options.saleId,
      receiptId: options.receiptId,
      chequeId: options.chequeId,
      category: options.category,
      status: 'pending',
      sentBy: options.sentBy,
    });

    try {
      // Check if SMS is enabled
      if (!this.enabled) {
        console.log('[SMS] SMS sending is disabled. Message:', options.message);
        smsLog.status = 'sent';
        smsLog.sentAt = new Date();
        smsLog.deliveryStatus = 'Simulated (SMS disabled)';
        await smsLog.save();
        return { success: true, message: 'SMS simulated (disabled in config)', log: smsLog };
      }

      // Validate configuration
      if (!this.gatewayUrl || !this.apiKey) {
        throw new Error('SMS gateway not configured');
      }

      // Send SMS via gateway
      const response = await axios.post(
        this.gatewayUrl,
        {
          api_key: this.apiKey,
          sender_id: this.senderId,
          phone: options.phone,
          message: options.message,
        },
        {
          timeout: 10000, // 10 seconds timeout
        }
      );

      // Update log with success
      smsLog.status = 'sent';
      smsLog.sentAt = new Date();
      smsLog.gatewayResponse = response.data;
      smsLog.deliveryStatus = response.data?.status || 'sent';

      await smsLog.save();

      return { success: true, data: response.data, log: smsLog };
    } catch (error: unknown) {
      // Update log with failure
      smsLog.status = 'failed';
      smsLog.errorMessage = error.message;
      smsLog.gatewayResponse = error.response?.data;
      await smsLog.save();

      console.error('[SMS] Failed to send SMS:', error.message);
      throw error;
    }
  }

  /**
   * Send SMS using a template
   */
  async sendTemplatedSMS(
    templateCode: string,
    phone: string,
    variables: Record<string, any>,
    options: {
      clientId?: mongoose.Types.ObjectId;
      saleId?: mongoose.Types.ObjectId;
      receiptId?: mongoose.Types.ObjectId;
      chequeId?: mongoose.Types.ObjectId;
      sentBy?: mongoose.Types.ObjectId;
      language?: 'bn' | 'en';
    } = {}
  ): Promise<any> {
    // Get template
    const template = await SMSTemplate.findOne({ templateCode, isActive: true });
    if (!template) {
      throw new Error(`SMS template '${templateCode}' not found or inactive`);
    }

    // Choose language (default to Bangla)
    const language = options.language || 'bn';
    const messageTemplate = language === 'bn' ? template.messageBN : template.messageEN;

    // Replace variables
    const message = this.replaceVariables(messageTemplate, variables);

    // Send SMS
    return this.sendSMS({
      phone,
      message,
      templateCode,
      clientId: options.clientId,
      saleId: options.saleId,
      receiptId: options.receiptId,
      chequeId: options.chequeId,
      category: template.category,
      sentBy: options.sentBy,
    });
  }

  /**
   * Send bulk SMS (multiple recipients)
   */
  async sendBulkSMS(options: BulkSMSOptions): Promise<any> {
    const results = [];
    const errors = [];

    for (const phone of options.phones) {
      try {
        const result = await this.sendSMS({
          phone,
          message: options.message,
          templateCode: options.templateCode,
          category: options.category,
          sentBy: options.sentBy,
        });
        results.push({ phone, success: true, result });
      } catch (error: unknown) {
        errors.push({ phone, success: false, error: error.message });
      }
    }

    return {
      total: options.phones.length,
      sent: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmation(
    phone: string,
    clientName: string,
    amount: number,
    receiptNumber: string,
    options: {
      clientId?: mongoose.Types.ObjectId;
      saleId?: mongoose.Types.ObjectId;
      receiptId?: mongoose.Types.ObjectId;
      sentBy?: mongoose.Types.ObjectId;
    } = {}
  ): Promise<any> {
    const variables = {
      name: clientName,
      amount: amount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' }),
      receiptNumber,
      date: new Date().toLocaleDateString('bn-BD'),
    };

    return this.sendTemplatedSMS('PAYMENT_CONFIRM', phone, variables, {
      ...options,
      language: 'bn',
    });
  }

  /**
   * Send installment reminder SMS
   */
  async sendInstallmentReminder(
    phone: string,
    clientName: string,
    amount: number,
    dueDate: Date,
    plotInfo: string,
    options: {
      clientId?: mongoose.Types.ObjectId;
      saleId?: mongoose.Types.ObjectId;
      sentBy?: mongoose.Types.ObjectId;
    } = {}
  ): Promise<any> {
    const variables = {
      name: clientName,
      amount: amount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' }),
      dueDate: dueDate.toLocaleDateString('bn-BD'),
      plot: plotInfo,
    };

    return this.sendTemplatedSMS('INSTALLMENT_REMINDER', phone, variables, {
      ...options,
      language: 'bn',
    });
  }

  /**
   * Send missed installment SMS
   */
  async sendMissedInstallmentAlert(
    phone: string,
    clientName: string,
    amount: number,
    dueDate: Date,
    monthsOverdue: number,
    options: {
      clientId?: mongoose.Types.ObjectId;
      saleId?: mongoose.Types.ObjectId;
      sentBy?: mongoose.Types.ObjectId;
    } = {}
  ): Promise<any> {
    const variables = {
      name: clientName,
      amount: amount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' }),
      dueDate: dueDate.toLocaleDateString('bn-BD'),
      monthsDue: monthsOverdue.toString(),
    };

    return this.sendTemplatedSMS('MISSED_INSTALLMENT', phone, variables, {
      ...options,
      language: 'bn',
    });
  }

  /**
   * Send cheque due reminder SMS
   */
  async sendChequeDueReminder(
    phone: string,
    clientName: string,
    amount: number,
    chequeNumber: string,
    dueDate: Date,
    options: {
      clientId?: mongoose.Types.ObjectId;
      chequeId?: mongoose.Types.ObjectId;
      sentBy?: mongoose.Types.ObjectId;
    } = {}
  ): Promise<any> {
    const variables = {
      name: clientName,
      amount: amount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' }),
      chequeNumber,
      dueDate: dueDate.toLocaleDateString('bn-BD'),
    };

    return this.sendTemplatedSMS('CHEQUE_DUE', phone, variables, {
      ...options,
      language: 'bn',
    });
  }

  /**
   * Get SMS logs with filters
   */
  async getSMSLogs(filters: {
    phone?: string;
    clientId?: mongoose.Types.ObjectId;
    status?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const query: any = {};

    if (filters.phone) {
      query.phone = { $regex: filters.phone, $options: 'i' };
    }
    if (filters.clientId) {
      query.clientId = filters.clientId;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      SMSLog.find(query)
        .populate('clientId', 'name phone')
        .populate('sentBy', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SMSLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get SMS statistics
   */
  async getSMSStats(filters: {
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<any> {
    const query: any = {};

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const [total, sent, failed, byCategory, byStatus] = await Promise.all([
      SMSLog.countDocuments(query),
      SMSLog.countDocuments({ ...query, status: 'sent' }),
      SMSLog.countDocuments({ ...query, status: 'failed' }),
      SMSLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),
      SMSLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      total,
      sent,
      failed,
      byCategory: byCategory.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byStatus: byStatus.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }
}

export default new SMSService();
