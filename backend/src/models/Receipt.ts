import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethod } from './Sale';

// Receipt approval status enum
export enum ReceiptApprovalStatus {
  DRAFT = 'Draft',
  PENDING_ACCOUNTS = 'Pending Accounts',
  PENDING_HOF = 'Pending HOF',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

// Receipt type enum
export enum ReceiptType {
  BOOKING = 'Booking',
  INSTALLMENT = 'Installment',
  REGISTRATION = 'Registration',
  HANDOVER = 'Handover',
  OTHER = 'Other',
}

// Instrument details interface (for cheques)
export interface IInstrumentDetails {
  bankName?: string;
  branchName?: string;
  chequeNumber?: string;
  chequeDate?: Date;
  accountNumber?: string;
}

// Approval history subdocument
export interface IApprovalHistory {
  approvedBy: mongoose.Types.ObjectId;
  approvalLevel: string;
  approvedAt: Date;
  action: 'Approved' | 'Rejected';
  remarks?: string;
}

// Receipt interface
export interface IReceipt extends Document {
  receiptNumber: string;
  clientId: mongoose.Types.ObjectId;
  saleId: mongoose.Types.ObjectId;
  stageId?: mongoose.Types.ObjectId;
  installmentId?: mongoose.Types.ObjectId;
  receiptType: ReceiptType;
  amount: number;
  method: PaymentMethod;
  receiptDate: Date;
  instrumentDetails?: IInstrumentDetails;
  approvalStatus: ReceiptApprovalStatus;
  approvalHistory: IApprovalHistory[];
  postedToLedger: boolean;
  ledgerPostingDate?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Instrument details schema
const instrumentDetailsSchema = new Schema<IInstrumentDetails>(
  {
    bankName: {
      type: String,
      maxlength: [100, 'Bank name cannot exceed 100 characters'],
    },
    branchName: {
      type: String,
      maxlength: [100, 'Branch name cannot exceed 100 characters'],
    },
    chequeNumber: {
      type: String,
      maxlength: [50, 'Cheque number cannot exceed 50 characters'],
    },
    chequeDate: {
      type: Date,
    },
    accountNumber: {
      type: String,
      maxlength: [50, 'Account number cannot exceed 50 characters'],
    },
  },
  { _id: false }
);

// Approval history schema
const approvalHistorySchema = new Schema<IApprovalHistory>(
  {
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvalLevel: {
      type: String,
      required: true,
      enum: ['Accounts Manager', 'HOF'],
    },
    approvedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    action: {
      type: String,
      required: true,
      enum: ['Approved', 'Rejected'],
    },
    remarks: {
      type: String,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
  },
  { _id: true }
);

// Receipt schema
const receiptSchema = new Schema<IReceipt>(
  {
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      uppercase: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
      index: true,
    },
    saleId: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      required: [true, 'Sale ID is required'],
      index: true,
    },
    stageId: {
      type: Schema.Types.ObjectId,
    },
    installmentId: {
      type: Schema.Types.ObjectId,
      ref: 'InstallmentSchedule',
    },
    receiptType: {
      type: String,
      required: [true, 'Receipt type is required'],
      enum: Object.values(ReceiptType),
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    method: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: Object.values(PaymentMethod),
    },
    receiptDate: {
      type: Date,
      required: [true, 'Receipt date is required'],
      default: Date.now,
    },
    instrumentDetails: {
      type: instrumentDetailsSchema,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(ReceiptApprovalStatus),
      default: ReceiptApprovalStatus.DRAFT,
      index: true,
    },
    approvalHistory: {
      type: [approvalHistorySchema],
      default: [],
    },
    postedToLedger: {
      type: Boolean,
      default: false,
      index: true,
    },
    ledgerPostingDate: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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
receiptSchema.index({ receiptDate: -1 });
receiptSchema.index({ approvalStatus: 1, isActive: 1 });
receiptSchema.index({ clientId: 1, isActive: 1 });

// Validation: require instrument details for cheque and PDC
receiptSchema.pre('validate', function (next) {
  if (
    (this.method === PaymentMethod.CHEQUE || this.method === PaymentMethod.PDC) &&
    (!this.instrumentDetails ||
      !this.instrumentDetails.bankName ||
      !this.instrumentDetails.chequeNumber)
  ) {
    return next(
      new Error(
        'Bank name and cheque number are required for Cheque and PDC payment methods'
      )
    );
  }
  next();
});

// Generate unique receipt number (format: RCP-YYYY-MM-XXXXX)
receiptSchema.statics.generateReceiptNumber = async function (): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `RCP-${year}-${month}-`;

  // Find the latest receipt number for this month
  const latestReceipt = await this.findOne({
    receiptNumber: new RegExp(`^${prefix}`),
  })
    .sort({ receiptNumber: -1 })
    .limit(1);

  let sequence = 1;
  if (latestReceipt && latestReceipt.receiptNumber) {
    const lastSequence = parseInt(latestReceipt.receiptNumber.split('-').pop() || '0');
    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(5, '0')}`;
};

export default mongoose.model<IReceipt>('Receipt', receiptSchema);
