import mongoose, { Schema, Document } from 'mongoose';

// Cancellation status enum
export enum CancellationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  REFUNDED = 'Refunded',
  PARTIAL_REFUND = 'Partial Refund',
}

// Cancellation interface
export interface ICancellation extends Document {
  _id: string;
  saleId: mongoose.Types.ObjectId;
  cancellationDate: Date;
  reason: string;
  totalPaid: number;
  officeChargePercent: number;
  officeChargeAmount: number;
  otherDeductions: number;
  refundableAmount: number;
  refundedAmount: number;
  remainingRefund: number;
  status: CancellationStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  calculateRefundableAmount(): void;
  updateRefundedAmount(): Promise<void>;
}

// Cancellation schema
const cancellationSchema = new Schema<ICancellation>(
  {
    saleId: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      required: [true, 'Sale ID is required'],
      index: true,
      unique: true, // One cancellation per sale
    },
    cancellationDate: {
      type: Date,
      required: [true, 'Cancellation date is required'],
      default: Date.now,
    },
    reason: {
      type: String,
      required: [true, 'Cancellation reason is required'],
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    totalPaid: {
      type: Number,
      required: [true, 'Total paid amount is required'],
      min: [0, 'Total paid must be non-negative'],
    },
    officeChargePercent: {
      type: Number,
      required: [true, 'Office charge percent is required'],
      min: [0, 'Office charge percent must be non-negative'],
      max: [100, 'Office charge percent cannot exceed 100'],
      default: 10,
    },
    officeChargeAmount: {
      type: Number,
      required: [true, 'Office charge amount is required'],
      min: [0, 'Office charge must be non-negative'],
    },
    otherDeductions: {
      type: Number,
      default: 0,
      min: [0, 'Other deductions must be non-negative'],
    },
    refundableAmount: {
      type: Number,
      required: [true, 'Refundable amount is required'],
      min: [0, 'Refundable amount must be non-negative'],
    },
    refundedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refunded amount must be non-negative'],
    },
    remainingRefund: {
      type: Number,
      default: 0,
      min: [0, 'Remaining refund must be non-negative'],
    },
    status: {
      type: String,
      enum: Object.values(CancellationStatus),
      default: CancellationStatus.PENDING,
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
cancellationSchema.index({ cancellationDate: -1 });
cancellationSchema.index({ status: 1, isActive: 1 });
cancellationSchema.index({ createdBy: 1 });

// Method to calculate refundable amount
cancellationSchema.methods.calculateRefundableAmount = function () {
  this.officeChargeAmount = (this.totalPaid * this.officeChargePercent) / 100;
  this.refundableAmount = this.totalPaid - this.officeChargeAmount - this.otherDeductions;
  this.remainingRefund = this.refundableAmount - this.refundedAmount;
};

// Method to update refunded amount from completed refunds
cancellationSchema.methods.updateRefundedAmount = async function () {
  const Refund = mongoose.model('Refund');
  const result = await Refund.aggregate([
    {
      $match: {
        cancellationId: this._id,
        status: 'Paid',
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        totalRefunded: { $sum: '$amount' },
      },
    },
  ]);

  this.refundedAmount = result.length > 0 ? result[0].totalRefunded : 0;
  this.remainingRefund = this.refundableAmount - this.refundedAmount;

  // Update cancellation status based on refunded amount
  if (this.refundedAmount >= this.refundableAmount) {
    this.status = CancellationStatus.REFUNDED;
  } else if (this.refundedAmount > 0) {
    this.status = CancellationStatus.PARTIAL_REFUND;
  }
};

// Pre-save hook to calculate refundable amount
cancellationSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('totalPaid') || this.isModified('officeChargePercent') || this.isModified('otherDeductions')) {
    this.calculateRefundableAmount();
  }
  next();
});

const Cancellation = mongoose.model<ICancellation>('Cancellation', cancellationSchema);

export default Cancellation;
