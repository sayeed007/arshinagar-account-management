import mongoose, { Document, Schema } from 'mongoose';

export enum AccountType {
  SAVINGS = 'Savings',
  CURRENT = 'Current',
  FDR = 'FDR',
  DPS = 'DPS',
  OTHER = 'Other',
}

export interface IBankAccount extends Document {
  bankName: string;
  branchName?: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bankAccountSchema = new Schema<IBankAccount>(
  {
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
      unique: true,
    },
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    accountType: {
      type: String,
      enum: Object.values(AccountType),
      required: [true, 'Account type is required'],
      default: AccountType.CURRENT,
    },
    openingBalance: {
      type: Number,
      required: [true, 'Opening balance is required'],
      default: 0,
    },
    currentBalance: {
      type: Number,
      required: [true, 'Current balance is required'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bankAccountSchema.index({ bankName: 1, accountNumber: 1 });
bankAccountSchema.index({ isActive: 1, isDeleted: 1 });

// Pre-save hook to set opening balance as current balance for new accounts
bankAccountSchema.pre('save', function (next) {
  if (this.isNew) {
    this.currentBalance = this.openingBalance;
  }
  next();
});

const BankAccount = mongoose.model<IBankAccount>('BankAccount', bankAccountSchema);

export default BankAccount;
