import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethod } from './Sale';

// Payment status enum
export enum PaymentStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

// Instrument details for cheques and PDC
export interface IInstrumentDetails {
  bankName?: string;
  branchName?: string;
  chequeNumber?: string;
  chequeDate?: Date;
  accountNumber?: string;
}

// Payment interface
export interface IPayment extends Document {
  paymentNumber: string;
  saleId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  stageId?: mongoose.Types.ObjectId;
  installmentId?: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  paymentDate: Date;
  instrumentDetails?: IInstrumentDetails;
  receiptNumber?: string;
  status: PaymentStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
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

// Payment schema
const paymentSchema = new Schema<IPayment>(
  {
    paymentNumber: {
      type: String,
      required: [true, 'Payment number is required'],
      unique: true,
      uppercase: true,
      index: true,
    },
    saleId: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      required: [true, 'Sale ID is required'],
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
      index: true,
    },
    stageId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    installmentId: {
      type: Schema.Types.ObjectId,
      ref: 'InstallmentSchedule',
      index: true,
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
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    instrumentDetails: {
      type: instrumentDetailsSchema,
    },
    receiptNumber: {
      type: String,
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
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
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1, isActive: 1 });
paymentSchema.index({ saleId: 1, isActive: 1 });

// Validation: require instrument details for cheque and PDC
paymentSchema.pre('validate', function (next) {
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

// Generate unique payment number (format: PAY-YYYY-MM-XXXXX)
paymentSchema.statics.generatePaymentNumber = async function (): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `PAY-${year}-${month}-`;

  // Find the latest payment number for this month
  const latestPayment = await this.findOne({
    paymentNumber: new RegExp(`^${prefix}`),
  })
    .sort({ paymentNumber: -1 })
    .limit(1);

  let sequence = 1;
  if (latestPayment && latestPayment.paymentNumber) {
    const lastSequence = parseInt(latestPayment.paymentNumber.split('-').pop() || '0');
    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(5, '0')}`;
};

export default mongoose.model<IPayment>('Payment', paymentSchema);
