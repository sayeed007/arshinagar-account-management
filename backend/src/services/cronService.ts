import cron from 'node-cron';
import InstallmentSchedule from '../models/InstallmentSchedule';
import Cheque from '../models/Cheque';
import Sale from '../models/Sale';
import { Client } from '../models/Client';
import smsService from './smsService';

class CronService {
  /**
   * Initialize all cron jobs
   */
  init() {
    if (process.env.ENABLE_CRON_JOBS !== 'true') {
      console.log('[CRON] Cron jobs disabled');
      return;
    }

    console.log('[CRON] Initializing cron jobs...');

    // Run installment reminders daily at 9 AM
    cron.schedule('0 9 * * *', () => {
      this.sendInstallmentReminders();
    });

    // Run missed installment alerts daily at 10 AM
    cron.schedule('0 10 * * *', () => {
      this.sendMissedInstallmentAlerts();
    });

    // Run cheque due reminders daily at 9 AM
    cron.schedule('0 9 * * *', () => {
      this.sendChequeDueReminders();
    });

    // Update cheque statuses daily at midnight
    cron.schedule('0 0 * * *', () => {
      this.updateChequeStatuses();
    });

    console.log('[CRON] Cron jobs initialized successfully');
  }

  /**
   * Send installment reminders (N days before due date)
   */
  async sendInstallmentReminders() {
    try {
      console.log('[CRON] Running installment reminders...');

      const reminderDays = parseInt(process.env.INSTALLMENT_REMINDER_DAYS || '3');
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + reminderDays);

      // Set to start of day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      // Set to end of day
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find installments due in N days that are still pending
      const installments = await InstallmentSchedule.find({
        dueDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: 'pending',
      })
        .populate({
          path: 'saleId',
          populate: {
            path: 'clientId',
            select: 'name phone',
          },
        })
        .lean();

      console.log(`[CRON] Found ${installments.length} installments due in ${reminderDays} days`);

      for (const installment of installments) {
        try {
          const sale = installment.saleId as any;
          const client = sale?.clientId;

          if (!client || !client.phone) {
            console.log(`[CRON] Skipping installment ${installment._id} - no client phone`);
            continue;
          }

          const plotInfo = sale.plot?.plotNumber || 'N/A';

          await smsService.sendInstallmentReminder(
            client.phone,
            client.name,
            installment.amount,
            installment.dueDate,
            plotInfo,
            {
              clientId: client._id,
              saleId: sale._id,
            }
          );

          console.log(`[CRON] Sent installment reminder to ${client.name} (${client.phone})`);
        } catch (error: any) {
          console.error(`[CRON] Failed to send installment reminder:`, error.message);
        }
      }

      console.log('[CRON] Installment reminders completed');
    } catch (error: any) {
      console.error('[CRON] Error in installment reminders:', error.message);
    }
  }

  /**
   * Send missed installment alerts
   */
  async sendMissedInstallmentAlerts() {
    try {
      console.log('[CRON] Running missed installment alerts...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find overdue installments
      const missedInstallments = await InstallmentSchedule.find({
        dueDate: { $lt: today },
        status: { $in: ['pending', 'overdue'] },
      })
        .populate({
          path: 'saleId',
          populate: {
            path: 'clientId',
            select: 'name phone',
          },
        })
        .lean();

      console.log(`[CRON] Found ${missedInstallments.length} missed installments`);

      // Group by client
      const clientInstallments = new Map();

      for (const installment of missedInstallments) {
        const sale = installment.saleId as any;
        const client = sale?.clientId;

        if (!client) continue;

        if (!clientInstallments.has(client._id.toString())) {
          clientInstallments.set(client._id.toString(), {
            client,
            installments: [],
          });
        }

        clientInstallments.get(client._id.toString()).installments.push(installment);
      }

      // Send alerts
      for (const [clientId, data] of clientInstallments) {
        try {
          const { client, installments } = data;

          if (!client.phone) {
            console.log(`[CRON] Skipping client ${client.name} - no phone`);
            continue;
          }

          // Calculate months overdue (assume oldest installment)
          const oldestInstallment = installments.sort((a: any, b: any) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          )[0];

          const monthsOverdue = Math.floor(
            (today.getTime() - new Date(oldestInstallment.dueDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
          );

          const totalAmount = installments.reduce((sum: number, inst: any) => sum + inst.amount, 0);

          await smsService.sendMissedInstallmentAlert(
            client.phone,
            client.name,
            totalAmount,
            oldestInstallment.dueDate,
            Math.max(1, monthsOverdue),
            {
              clientId: client._id,
            }
          );

          console.log(`[CRON] Sent missed installment alert to ${client.name} (${client.phone})`);

          // Update installment statuses to overdue
          await InstallmentSchedule.updateMany(
            { _id: { $in: installments.map((i: any) => i._id) } },
            { $set: { status: 'overdue' } }
          );
        } catch (error: any) {
          console.error(`[CRON] Failed to send missed installment alert:`, error.message);
        }
      }

      console.log('[CRON] Missed installment alerts completed');
    } catch (error: any) {
      console.error('[CRON] Error in missed installment alerts:', error.message);
    }
  }

  /**
   * Send cheque due reminders
   */
  async sendChequeDueReminders() {
    try {
      console.log('[CRON] Running cheque due reminders...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find cheques due today or tomorrow
      const dueChecques = await Cheque.find({
        dueDate: {
          $gte: today,
          $lt: tomorrow,
        },
        status: { $in: ['Pending', 'Due Today'] },
      })
        .populate('clientId', 'name phone')
        .lean();

      console.log(`[CRON] Found ${dueChecques.length} cheques due today`);

      for (const cheque of dueChecques) {
        try {
          const client = cheque.clientId as any;

          if (!client || !client.phone) {
            console.log(`[CRON] Skipping cheque ${cheque.chequeNumber} - no client phone`);
            continue;
          }

          await smsService.sendChequeDueReminder(
            client.phone,
            client.name,
            cheque.amount,
            cheque.chequeNumber,
            cheque.dueDate,
            {
              clientId: client._id,
              chequeId: cheque._id,
            }
          );

          console.log(`[CRON] Sent cheque due reminder to ${client.name} (${client.phone})`);

          // Update cheque status to "Due Today"
          await Cheque.findByIdAndUpdate(cheque._id, { status: 'Due Today' });
        } catch (error: any) {
          console.error(`[CRON] Failed to send cheque due reminder:`, error.message);
        }
      }

      console.log('[CRON] Cheque due reminders completed');
    } catch (error: any) {
      console.error('[CRON] Error in cheque due reminders:', error.message);
    }
  }

  /**
   * Update cheque statuses based on due dates
   */
  async updateChequeStatuses() {
    try {
      console.log('[CRON] Updating cheque statuses...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Mark overdue cheques
      const overdueResult = await Cheque.updateMany(
        {
          dueDate: { $lt: today },
          status: { $in: ['Pending', 'Due Today'] },
        },
        { $set: { status: 'Overdue' } }
      );

      console.log(`[CRON] Marked ${overdueResult.modifiedCount} cheques as overdue`);

      console.log('[CRON] Cheque status update completed');
    } catch (error: any) {
      console.error('[CRON] Error updating cheque statuses:', error.message);
    }
  }
}

export default new CronService();
