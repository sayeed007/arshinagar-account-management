import mongoose, { Schema, Document } from 'mongoose';

// Account type enum
export enum AccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense',
}

// Transaction type enum
export enum TransactionType {
  RECEIPT = 'Receipt',
  PAYMENT = 'Payment',
  SALE = 'Sale',
  REFUND = 'Refund',
  ADJUSTMENT = 'Adjustment',
  OPENING_BALANCE = 'Opening Balance',
}

// Ledger entry interface
export interface ILedger extends Document {
  transactionDate: Date;
  account: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  transactionType: TransactionType;
  referenceId?: mongoose.Types.ObjectId;
  referenceModel?: string;
  referenceNumber?: string;
  clientId?: mongoose.Types.ObjectId;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Ledger schema
const ledgerSchema = new Schema<ILedger>(
  {
    transactionDate: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
      index: true,
    },
    account: {
      type: String,
      required: [true, 'Account is required'],
      maxlength: [100, 'Account name cannot exceed 100 characters'],
      index: true,
    },
    accountType: {
      type: String,
      required: [true, 'Account type is required'],
      enum: Object.values(AccountType),
      index: true,
    },
    debit: {
      type: Number,
      default: 0,
      min: [0, 'Debit must be non-negative'],
    },
    credit: {
      type: Number,
      default: 0,
      min: [0, 'Credit must be non-negative'],
    },
    transactionType: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: Object.values(TransactionType),
      index: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    referenceModel: {
      type: String,
      enum: ['Receipt', 'Payment', 'Sale', 'Expense'],
    },
    referenceNumber: {
      type: String,
      uppercase: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ledgerSchema.index({ transactionDate: -1 });
ledgerSchema.index({ account: 1, transactionDate: -1 });
ledgerSchema.index({ clientId: 1, transactionDate: -1 });

// Validation: either debit or credit must be > 0, but not both
ledgerSchema.pre('validate', function (next) {
  if (this.debit > 0 && this.credit > 0) {
    return next(new Error('A ledger entry cannot have both debit and credit amounts'));
  }
  if (this.debit === 0 && this.credit === 0) {
    return next(new Error('Either debit or credit amount must be greater than 0'));
  }
  next();
});

// Static method to create double-entry for receipt
ledgerSchema.statics.createReceiptEntry = async function (
  receiptData: {
    receiptId: mongoose.Types.ObjectId;
    receiptNumber: string;
    clientId: mongoose.Types.ObjectId;
    amount: number;
    paymentMethod: string;
    receiptDate: Date;
    description: string;
    createdBy: mongoose.Types.ObjectId;
  }
): Promise<ILedger[]> {
  const cashAccount = receiptData.paymentMethod === 'Cash' ? 'Cash' : 'Bank';

  // Debit: Cash/Bank (increase asset)
  // Credit: Client Account (decrease receivable)
  const entries = await this.insertMany([
    {
      transactionDate: receiptData.receiptDate,
      account: cashAccount,
      accountType: AccountType.ASSET,
      debit: receiptData.amount,
      credit: 0,
      transactionType: TransactionType.RECEIPT,
      referenceId: receiptData.receiptId,
      referenceModel: 'Receipt',
      referenceNumber: receiptData.receiptNumber,
      clientId: receiptData.clientId,
      description: receiptData.description,
      createdBy: receiptData.createdBy,
    },
    {
      transactionDate: receiptData.receiptDate,
      account: 'Accounts Receivable - Clients',
      accountType: AccountType.ASSET,
      debit: 0,
      credit: receiptData.amount,
      transactionType: TransactionType.RECEIPT,
      referenceId: receiptData.receiptId,
      referenceModel: 'Receipt',
      referenceNumber: receiptData.receiptNumber,
      clientId: receiptData.clientId,
      description: receiptData.description,
      createdBy: receiptData.createdBy,
    },
  ]);

  return entries;
};

// Static method to create double-entry for sale
ledgerSchema.statics.createSaleEntry = async function (
  saleData: {
    saleId: mongoose.Types.ObjectId;
    saleNumber: string;
    clientId: mongoose.Types.ObjectId;
    amount: number;
    saleDate: Date;
    description: string;
    createdBy: mongoose.Types.ObjectId;
  }
): Promise<ILedger[]> {
  // Debit: Accounts Receivable (increase asset)
  // Credit: Sales Revenue (increase revenue)
  const entries = await this.insertMany([
    {
      transactionDate: saleData.saleDate,
      account: 'Accounts Receivable - Clients',
      accountType: AccountType.ASSET,
      debit: saleData.amount,
      credit: 0,
      transactionType: TransactionType.SALE,
      referenceId: saleData.saleId,
      referenceModel: 'Sale',
      referenceNumber: saleData.saleNumber,
      clientId: saleData.clientId,
      description: saleData.description,
      createdBy: saleData.createdBy,
    },
    {
      transactionDate: saleData.saleDate,
      account: 'Sales Revenue',
      accountType: AccountType.REVENUE,
      debit: 0,
      credit: saleData.amount,
      transactionType: TransactionType.SALE,
      referenceId: saleData.saleId,
      referenceModel: 'Sale',
      referenceNumber: saleData.saleNumber,
      clientId: saleData.clientId,
      description: saleData.description,
      createdBy: saleData.createdBy,
    },
  ]);

  return entries;
};

export default mongoose.model<ILedger>('Ledger', ledgerSchema);
