import mongoose, { Schema, Document } from 'mongoose';

// Refund status enum
export enum RefundStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  CANCELLED = 'Cancelled',
}

// Refund approval status enum
export enum RefundApprovalStatus {
  DRAFT = 'Draft',
  PENDING_ACCOUNTS = 'Pending Accounts',
  PENDING_HOF = 'Pending HOF',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

// Payment method enum
export enum PaymentMethod {
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
  CHEQUE = 'Cheque',
  MOBILE_WALLET = 'Mobile Wallet',
}

// Instrument details subdocument interface
export interface IInstrumentDetails {
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: Date;
  accountNumber?: string;
  transactionId?: string;
}

// Instrument details subdocument schema
const instrumentDetailsSchema = new Schema<IInstrumentDetails>(
  {
    bankName: {
      type: String,
      maxlength: [100, 'Bank name cannot exceed 100 characters'],
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
    transactionId: {
      type: String,
      maxlength: [100, 'Transaction ID cannot exceed 100 characters'],
    },
  },
  { _id: false }
);

// Approval history subdocument interface
export interface IApprovalHistory {
  approvedBy: mongoose.Types.ObjectId;
  approvedAt: Date;
  role: string;
  remarks?: string;
}

// Approval history subdocument schema
const approvalHistorySchema = new Schema<IApprovalHistory>(
  {
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    role: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
  },
  { _id: true }
);

// Refund interface
export interface IRefund extends Document {
  _id: string;
  refundNumber: string;
  cancellationId: mongoose.Types.ObjectId;
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  paidDate?: Date;
  status: RefundStatus;
  approvalStatus: RefundApprovalStatus;
  paymentMethod?: PaymentMethod;
  instrumentDetails?: IInstrumentDetails;
  approvalHistory: IApprovalHistory[];
  rejectionReason?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Refund schema
const refundSchema = new Schema<IRefund>(
  {
    refundNumber: {
      type: String,
      required: [true, 'Refund number is required'],
      unique: true,
      uppercase: true,
      index: true,
    },
    cancellationId: {
      type: Schema.Types.ObjectId,
      ref: 'Cancellation',
      required: [true, 'Cancellation ID is required'],
      index: true,
    },
    installmentNumber: {
      type: Number,
      required: [true, 'Installment number is required'],
      min: [1, 'Installment number must be at least 1'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    paidDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(RefundStatus),
      default: RefundStatus.PENDING,
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(RefundApprovalStatus),
      default: RefundApprovalStatus.DRAFT,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
    instrumentDetails: {
      type: instrumentDetailsSchema,
    },
    approvalHistory: {
      type: [approvalHistorySchema],
      default: [],
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
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
refundSchema.index({ dueDate: 1 });
refundSchema.index({ cancellationId: 1, installmentNumber: 1 });
refundSchema.index({ status: 1, approvalStatus: 1, isActive: 1 });
refundSchema.index({ createdBy: 1 });

// Pre-save hook to generate refund number
refundSchema.pre('save', async function (next) {
  if (this.isNew && !this.refundNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Get count of refunds this month
    const count = await mongoose.model('Refund').countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1),
      },
    });

    // Generate refund number: RFD-YYYY-MM-XXXXX
    this.refundNumber = `RFD-${year}-${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Post-save hook to update cancellation refunded amount
refundSchema.post('save', async function (doc) {
  if (doc.status === RefundStatus.PAID) {
    const Cancellation = mongoose.model('Cancellation');
    const cancellation = await Cancellation.findById(doc.cancellationId);
    if (cancellation) {
      await cancellation.updateRefundedAmount();
      await cancellation.save();
    }
  }
});

const Refund = mongoose.model<IRefund>('Refund', refundSchema);

export default Refund;
