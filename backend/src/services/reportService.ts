import Ledger from '../models/Ledger';
import Receipt from '../models/Receipt';
import Expense from '../models/Expense';
import Sale from '../models/Sale';
import { Client } from '../models/Client';
import InstallmentSchedule from '../models/InstallmentSchedule';
import EmployeeCost from '../models/EmployeeCost';

class ReportService {
  /**
   * Generate Day Book (all transactions for a date range)
   */
  async generateDayBook(startDate: Date, endDate: Date): Promise<any> {
    const ledgerEntries = await Ledger.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('clientId', 'name')
      .sort({ date: 1, createdAt: 1 })
      .lean();

    let runningBalance = 0;
    const transactions = ledgerEntries.map((entry) => {
      const isReceipt = entry.debit > 0;
      const amount = isReceipt ? entry.debit : entry.credit;
      runningBalance += isReceipt ? amount : -amount;

      return {
        date: entry.date,
        particulars: entry.description || entry.account || 'Transaction',
        receiptNumber: isReceipt ? entry.referenceNumber : undefined,
        paymentNumber: !isReceipt ? entry.referenceNumber : undefined,
        type: isReceipt ? 'Receipt' : 'Payment',
        amount,
        balance: runningBalance,
        category: entry.category || undefined,
      };
    });

    const summary = {
      totalReceipts: ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0),
      totalPayments: ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0),
      balance: runningBalance,
    };

    return {
      transactions,
      summary,
      period: { startDate, endDate },
    };
  }

  /**
   * Generate Cash Book
   */
  async generateCashBook(startDate: Date, endDate: Date): Promise<any> {
    const cashTransactions = await Ledger.find({
      date: { $gte: startDate, $lte: endDate },
      account: /cash/i,
    })
      .populate('clientId', 'name')
      .sort({ date: 1 })
      .lean();

    // Get opening balance (all transactions before startDate)
    const priorTransactions = await Ledger.find({
      date: { $lt: startDate },
      account: /cash/i,
    }).lean();

    const openingBalance = priorTransactions.reduce(
      (sum, t) => sum + t.debit - t.credit,
      0
    );

    let runningBalance = openingBalance;
    const transactions = cashTransactions.map((entry) => {
      const isReceipt = entry.debit > 0;
      const amount = isReceipt ? entry.debit : entry.credit;
      runningBalance += isReceipt ? amount : -amount;

      return {
        date: entry.date,
        particulars: entry.description || entry.account || 'Cash Transaction',
        voucherNumber: entry.referenceNumber,
        type: isReceipt ? 'Receipt' : 'Payment',
        amount,
        balance: runningBalance,
      };
    });

    const totalReceipts = cashTransactions
      .filter((t) => t.debit > 0)
      .reduce((sum, t) => sum + t.debit, 0);

    const totalPayments = cashTransactions
      .filter((t) => t.credit > 0)
      .reduce((sum, t) => sum + t.credit, 0);

    const summary = {
      openingBalance,
      totalReceipts,
      totalPayments,
      closingBalance: openingBalance + totalReceipts - totalPayments,
    };

    return {
      transactions,
      summary,
      period: { startDate, endDate },
    };
  }

  /**
   * Generate Bank Book
   */
  async generateBankBook(startDate: Date, endDate: Date, bankAccountId?: string): Promise<any> {
    const query: any = {
      date: { $gte: startDate, $lte: endDate },
      account: /bank/i,
    };

    if (bankAccountId) {
      query.bankAccountId = bankAccountId;
    }

    const bankTransactions = await Ledger.find(query)
      .populate('clientId', 'name')
      .populate('bankAccountId', 'bankName accountNumber')
      .sort({ date: 1 })
      .lean();

    // Get opening balance (all transactions before startDate)
    const priorQuery: any = {
      date: { $lt: startDate },
      account: /bank/i,
    };

    if (bankAccountId) {
      priorQuery.bankAccountId = bankAccountId;
    }

    const priorTransactions = await Ledger.find(priorQuery).lean();

    const openingBalance = priorTransactions.reduce(
      (sum, t) => sum + t.debit - t.credit,
      0
    );

    let runningBalance = openingBalance;
    const transactions = bankTransactions.map((entry) => {
      const isReceipt = entry.debit > 0;
      const amount = isReceipt ? entry.debit : entry.credit;
      runningBalance += isReceipt ? amount : -amount;

      return {
        date: entry.date,
        particulars: entry.description || entry.account || 'Bank Transaction',
        voucherNumber: entry.referenceNumber,
        type: isReceipt ? 'Receipt' : 'Payment',
        amount,
        balance: runningBalance,
      };
    });

    const totalReceipts = bankTransactions
      .filter((t) => t.debit > 0)
      .reduce((sum, t) => sum + t.debit, 0);

    const totalPayments = bankTransactions
      .filter((t) => t.credit > 0)
      .reduce((sum, t) => sum + t.credit, 0);

    const summary = {
      openingBalance,
      totalReceipts,
      totalPayments,
      closingBalance: openingBalance + totalReceipts - totalPayments,
    };

    return {
      transactions,
      summary,
      period: { startDate, endDate },
    };
  }

  /**
   * Generate Receipts & Payment Register
   */
  async generateReceiptPaymentRegister(startDate: Date, endDate: Date): Promise<any> {
    const [receipts, expenses] = await Promise.all([
      Receipt.find({
        receiptDate: { $gte: startDate, $lte: endDate },
        approvalStatus: 'Approved',
      })
        .populate('clientId', 'name')
        .sort({ receiptDate: 1 })
        .lean(),
      Expense.find({
        date: { $gte: startDate, $lte: endDate },
        approvalStatus: 'Approved',
      })
        .populate('categoryId', 'name')
        .sort({ date: 1 })
        .lean(),
    ]);

    const summary = {
      totalReceipts: receipts.reduce((sum, r) => sum + r.amount, 0),
      totalPayments: expenses.reduce((sum, e) => sum + e.amount, 0),
      receiptCount: receipts.length,
      paymentCount: expenses.length,
    };

    return {
      receipts,
      payments: expenses,
      summary,
      period: { startDate, endDate },
    };
  }

  /**
   * Generate Customer Statement
   */
  async generateCustomerStatement(clientId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const client = await Client.findById(clientId).lean();
    if (!client) {
      throw new Error('Client not found');
    }

    const query: any = { clientId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const [ledgerEntries, sales, receipts] = await Promise.all([
      Ledger.find(query).sort({ date: 1 }).lean(),
      Sale.find({ clientId }).populate('plot').lean(),
      Receipt.find({ clientId, approvalStatus: 'Approved' }).sort({ receiptDate: 1 }).lean(),
    ]);

    let balance = 0;
    const transactions = ledgerEntries.map((entry) => {
      balance += entry.debit - entry.credit;
      return {
        ...entry,
        balance,
      };
    });

    const summary = {
      totalSales: sales.reduce((sum, s) => sum + s.totalPrice, 0),
      totalPaid: receipts.reduce((sum, r) => sum + r.amount, 0),
      totalDue: 0,
      currentBalance: balance,
    };

    summary.totalDue = summary.totalSales - summary.totalPaid;

    return {
      client,
      transactions,
      sales,
      receipts,
      summary,
      period: { startDate, endDate },
    };
  }

  /**
   * Generate Aging Report (Receivables aging)
   */
  async generateAgingReport(): Promise<any> {
    const sales = await Sale.find({ saleStatus: { $nin: ['Cancelled', 'Completed'] } })
      .populate('clientId', 'name phone')
      .populate('plotId', 'plotNumber project')
      .lean();

    const today = new Date();
    const aging = {
      current: [],
      days_1_30: [],
      days_31_60: [],
      days_61_90: [],
      days_90_plus: [],
    };

    for (const sale of sales) {
      const dueAmount = sale.totalPrice - sale.paidAmount;
      if (dueAmount <= 0) continue;

      // Find oldest unpaid installment
      const installments = await InstallmentSchedule.find({
        saleId: sale._id,
        status: { $in: ['pending', 'overdue'] },
      })
        .sort({ dueDate: 1 })
        .limit(1)
        .lean();

      if (installments.length === 0) continue;

      const oldestDue = installments[0];
      const daysPastDue = Math.floor(
        (today.getTime() - new Date(oldestDue.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      const agingEntry = {
        client: sale.clientId,
        sale,
        dueAmount,
        daysPastDue,
        oldestDueDate: oldestDue.dueDate,
      };

      if (daysPastDue < 0) {
        aging.current.push(agingEntry);
      } else if (daysPastDue <= 30) {
        aging.days_1_30.push(agingEntry);
      } else if (daysPastDue <= 60) {
        aging.days_31_60.push(agingEntry);
      } else if (daysPastDue <= 90) {
        aging.days_61_90.push(agingEntry);
      } else {
        aging.days_90_plus.push(agingEntry);
      }
    }

    const summary = {
      current: aging.current.reduce((sum, a) => sum + a.dueAmount, 0),
      days_1_30: aging.days_1_30.reduce((sum, a) => sum + a.dueAmount, 0),
      days_31_60: aging.days_31_60.reduce((sum, a) => sum + a.dueAmount, 0),
      days_61_90: aging.days_61_90.reduce((sum, a) => sum + a.dueAmount, 0),
      days_90_plus: aging.days_90_plus.reduce((sum, a) => sum + a.dueAmount, 0),
    };

    summary['total'] =
      summary.current +
      summary.days_1_30 +
      summary.days_31_60 +
      summary.days_61_90 +
      summary.days_90_plus;

    return {
      aging,
      summary,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate Stage-wise Collection Report
   */
  async generateStageWiseCollectionReport(startDate?: Date, endDate?: Date): Promise<any> {
    const query: any = { approvalStatus: 'Approved' };
    if (startDate || endDate) {
      query.receiptDate = {};
      if (startDate) query.receiptDate.$gte = startDate;
      if (endDate) query.receiptDate.$lte = endDate;
    }

    const receipts = await Receipt.find(query).populate('saleId').lean();

    const stageCollections: any = {
      booking: [],
      installment: [],
      registration: [],
      handover: [],
      other: [],
    };

    for (const receipt of receipts) {
      const sale = receipt.saleId as any;
      if (!sale) continue;

      const stage = sale.stages?.find((s: any) => s._id.toString() === receipt.stageId?.toString());
      const stageName = stage?.stageName?.toLowerCase() || 'other';

      const targetArray =
        stageCollections[stageName] || stageCollections.other;
      targetArray.push({
        receipt,
        stage: stage?.stageName || 'Other',
        amount: receipt.amount,
      });
    }

    const summary = {
      booking: stageCollections.booking.reduce((sum: number, r: any) => sum + r.amount, 0),
      installment: stageCollections.installment.reduce((sum: number, r: any) => sum + r.amount, 0),
      registration: stageCollections.registration.reduce((sum: number, r: any) => sum + r.amount, 0),
      handover: stageCollections.handover.reduce((sum: number, r: any) => sum + r.amount, 0),
      other: stageCollections.other.reduce((sum: number, r: any) => sum + r.amount, 0),
    };

    summary['total'] =
      summary.booking +
      summary.installment +
      summary.registration +
      summary.handover +
      summary.other;

    return {
      collections: stageCollections,
      summary,
      period: { startDate, endDate },
    };
  }

  /**
   * Generate Expense by Category Report
   */
  async generateExpenseByCategoryReport(startDate: Date, endDate: Date): Promise<any> {
    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate },
      approvalStatus: 'Approved',
    })
      .populate('categoryId', 'name')
      .sort({ date: 1 })
      .lean();

    const byCategory: any = {};

    for (const expense of expenses) {
      const category = (expense.categoryId as any)?.name || 'Uncategorized';
      if (!byCategory[category]) {
        byCategory[category] = {
          expenses: [],
          total: 0,
        };
      }
      byCategory[category].expenses.push(expense);
      byCategory[category].total += expense.amount;
    }

    const summary = {
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      categoriesCount: Object.keys(byCategory).length,
      expensesCount: expenses.length,
    };

    return {
      byCategory,
      summary,
      period: { startDate, endDate },
    };
  }

  /**
   * Generate Employee Cost Summary Report
   */
  async generateEmployeeCostSummaryReport(startDate: Date, endDate: Date): Promise<any> {
    const costs = await EmployeeCost.find({
      month: { $gte: startDate.getMonth() + 1, $lte: endDate.getMonth() + 1 },
      year: { $gte: startDate.getFullYear(), $lte: endDate.getFullYear() },
    })
      .populate('employeeId', 'name designation')
      .sort({ year: 1, month: 1 })
      .lean();

    const byEmployee: any = {};

    for (const cost of costs) {
      const employeeId = (cost.employeeId as any)?._id?.toString() || 'Unknown';
      const employeeName = (cost.employeeId as any)?.name || 'Unknown Employee';

      if (!byEmployee[employeeId]) {
        byEmployee[employeeId] = {
          employee: cost.employeeId,
          costs: [],
          totals: {
            salary: 0,
            commission: 0,
            fuel: 0,
            entertainment: 0,
            bonus: 0,
            overtime: 0,
            otherAllowances: 0,
            advances: 0,
            deductions: 0,
            netPay: 0,
          },
        };
      }

      byEmployee[employeeId].costs.push(cost);
      byEmployee[employeeId].totals.salary += cost.salary || 0;
      byEmployee[employeeId].totals.commission += cost.commission || 0;
      byEmployee[employeeId].totals.fuel += cost.fuel || 0;
      byEmployee[employeeId].totals.entertainment += cost.entertainment || 0;
      byEmployee[employeeId].totals.bonus += cost.bonus || 0;
      byEmployee[employeeId].totals.overtime += cost.overtime || 0;
      byEmployee[employeeId].totals.otherAllowances += cost.otherAllowances || 0;
      byEmployee[employeeId].totals.advances += cost.advances || 0;
      byEmployee[employeeId].totals.deductions += cost.deductions || 0;
      byEmployee[employeeId].totals.netPay += cost.netPay || 0;
    }

    const grandTotals = Object.values(byEmployee).reduce(
      (acc: any, emp: any) => {
        acc.salary += emp.totals.salary;
        acc.commission += emp.totals.commission;
        acc.fuel += emp.totals.fuel;
        acc.entertainment += emp.totals.entertainment;
        acc.bonus += emp.totals.bonus;
        acc.overtime += emp.totals.overtime;
        acc.otherAllowances += emp.totals.otherAllowances;
        acc.advances += emp.totals.advances;
        acc.deductions += emp.totals.deductions;
        acc.netPay += emp.totals.netPay;
        return acc;
      },
      {
        salary: 0,
        commission: 0,
        fuel: 0,
        entertainment: 0,
        bonus: 0,
        overtime: 0,
        otherAllowances: 0,
        advances: 0,
        deductions: 0,
        netPay: 0,
      }
    );

    return {
      byEmployee,
      summary: grandTotals,
      period: { startDate, endDate },
    };
  }
}

export default new ReportService();
