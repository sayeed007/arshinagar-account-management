import mongoose, { Document, Schema } from 'mongoose';

export enum ChequeStatus {
  PENDING = 'Pending',
  DUE_TODAY = 'Due Today',
  CLEARED = 'Cleared',
  OVERDUE = 'Overdue',
  BOUNCED = 'Bounced',
  CANCELLED = 'Cancelled',
}

export enum ChequeType {
  PDC = 'PDC', // Post-Dated Cheque
  CURRENT = 'Current', // Current Cheque
}

export interface ICheque extends Document {
  chequeNumber: string;
  bankName: string;
  branchName?: string;
  chequeType: ChequeType;
  issueDate: Date;
  dueDate: Date;
  amount: number;
  clientId: mongoose.Types.ObjectId;
  saleId?: mongoose.Types.ObjectId;
  receiptId?: mongoose.Types.ObjectId;
  refundId?: mongoose.Types.ObjectId;
  status: ChequeStatus;
  clearedDate?: Date;
  clearedBy?: mongoose.Types.ObjectId;
  bounceDate?: Date;
  bounceReason?: string;
  bouncedBy?: mongoose.Types.ObjectId;
  cancelledDate?: Date;
  cancelledReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  isOverdue: boolean;
  isDueToday: boolean;
  daysUntilDue: number;
}

const chequeSchema = new Schema<ICheque>(
  {
    chequeNumber: {
      type: String,
      required: [true, 'Cheque number is required'],
      trim: true,
      index: true,
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    chequeType: {
      type: String,
      enum: Object.values(ChequeType),
      required: [true, 'Cheque type is required'],
      default: ChequeType.CURRENT,
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
      index: true,
    },
    saleId: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      index: true,
    },
    receiptId: {
      type: Schema.Types.ObjectId,
      ref: 'Receipt',
    },
    refundId: {
      type: Schema.Types.ObjectId,
      ref: 'Refund',
    },
    status: {
      type: String,
      enum: Object.values(ChequeStatus),
      default: ChequeStatus.PENDING,
      index: true,
    },
    clearedDate: {
      type: Date,
    },
    clearedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    bounceDate: {
      type: Date,
    },
    bounceReason: {
      type: String,
      trim: true,
    },
    bouncedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledDate: {
      type: Date,
    },
    cancelledReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes
chequeSchema.index({ status: 1, dueDate: 1 });
chequeSchema.index({ clientId: 1, status: 1 });
chequeSchema.index({ saleId: 1, status: 1 });
chequeSchema.index({ isDeleted: 1, status: 1, dueDate: 1 });

// Virtual: Check if cheque is overdue
chequeSchema.virtual('isOverdue').get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(this.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  return (
    dueDate < today &&
    this.status !== ChequeStatus.CLEARED &&
    this.status !== ChequeStatus.CANCELLED &&
    this.status !== ChequeStatus.BOUNCED
  );
});

// Virtual: Check if cheque is due today
chequeSchema.virtual('isDueToday').get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(this.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  return (
    dueDate.getTime() === today.getTime() &&
    this.status !== ChequeStatus.CLEARED &&
    this.status !== ChequeStatus.CANCELLED &&
    this.status !== ChequeStatus.BOUNCED
  );
});

// Virtual: Days until due
chequeSchema.virtual('daysUntilDue').get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(this.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save hook to automatically update status based on due date
chequeSchema.pre('save', function (next) {
  if (this.status === ChequeStatus.PENDING) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) {
      this.status = ChequeStatus.DUE_TODAY;
    } else if (dueDate < today) {
      this.status = ChequeStatus.OVERDUE;
    }
  }
  next();
});

// Method to mark as cleared
chequeSchema.methods.markAsCleared = function (userId: mongoose.Types.ObjectId, date?: Date) {
  this.status = ChequeStatus.CLEARED;
  this.clearedDate = date || new Date();
  this.clearedBy = userId;
  return this.save();
};

// Method to mark as bounced
chequeSchema.methods.markAsBounced = function (
  userId: mongoose.Types.ObjectId,
  reason: string,
  date?: Date
) {
  this.status = ChequeStatus.BOUNCED;
  this.bounceDate = date || new Date();
  this.bounceReason = reason;
  this.bouncedBy = userId;
  return this.save();
};

// Method to cancel
chequeSchema.methods.cancel = function (
  userId: mongoose.Types.ObjectId,
  reason: string,
  date?: Date
) {
  this.status = ChequeStatus.CANCELLED;
  this.cancelledDate = date || new Date();
  this.cancelledReason = reason;
  this.cancelledBy = userId;
  return this.save();
};

const Cheque = mongoose.model<ICheque>('Cheque', chequeSchema);

export default Cheque;
