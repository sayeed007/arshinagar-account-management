import mongoose, { Schema, Document } from 'mongoose';

// Installment status enum
export enum InstallmentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  PARTIAL = 'Partial',
  MISSED = 'Missed',
}

// Installment frequency enum
export enum InstallmentFrequency {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  HALF_YEARLY = 'Half-Yearly',
  YEARLY = 'Yearly',
  CUSTOM = 'Custom',
}

// Installment schedule interface
export interface IInstallmentSchedule extends Document {
  saleId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  paidDate?: Date;
  status: InstallmentStatus;
  paymentMethod?: string;
  paymentId?: mongoose.Types.ObjectId;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  updateStatus(): void;
}

// Installment schedule schema
const installmentScheduleSchema = new Schema<IInstallmentSchedule>(
  {
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
    installmentNumber: {
      type: Number,
      required: [true, 'Installment number is required'],
      min: [1, 'Installment number must be at least 1'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount must be non-negative'],
    },
    paidDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(InstallmentStatus),
      default: InstallmentStatus.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
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

// Compound index for unique installment per sale
installmentScheduleSchema.index({ saleId: 1, installmentNumber: 1 }, { unique: true });

// Indexes
installmentScheduleSchema.index({ status: 1, isActive: 1 });
installmentScheduleSchema.index({ dueDate: 1, status: 1 });

// Method to update status based on payment and due date
installmentScheduleSchema.methods.updateStatus = function () {
  const now = new Date();
  const isPastDue = this.dueDate < now;

  if (this.paidAmount >= this.amount) {
    this.status = InstallmentStatus.PAID;
  } else if (this.paidAmount > 0 && this.paidAmount < this.amount) {
    this.status = InstallmentStatus.PARTIAL;
    if (isPastDue) {
      this.status = InstallmentStatus.OVERDUE;
    }
  } else if (isPastDue) {
    // Check if more than 30 days overdue
    const daysPastDue = Math.floor(
      (now.getTime() - this.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysPastDue > 30) {
      this.status = InstallmentStatus.MISSED;
    } else {
      this.status = InstallmentStatus.OVERDUE;
    }
  } else {
    this.status = InstallmentStatus.PENDING;
  }
};

// Pre-save hook to update status
installmentScheduleSchema.pre('save', function (next) {
  this.updateStatus();
  next();
});

// Static method to generate installment schedule
installmentScheduleSchema.statics.generateSchedule = async function (
  saleId: mongoose.Types.ObjectId,
  clientId: mongoose.Types.ObjectId,
  totalAmount: number,
  numberOfInstallments: number,
  frequency: InstallmentFrequency,
  startDate: Date
): Promise<IInstallmentSchedule[]> {
  const installmentAmount = totalAmount / numberOfInstallments;
  const installments: Partial<IInstallmentSchedule>[] = [];

  // Calculate interval in months
  let intervalMonths = 1;
  switch (frequency) {
    case InstallmentFrequency.MONTHLY:
      intervalMonths = 1;
      break;
    case InstallmentFrequency.QUARTERLY:
      intervalMonths = 3;
      break;
    case InstallmentFrequency.HALF_YEARLY:
      intervalMonths = 6;
      break;
    case InstallmentFrequency.YEARLY:
      intervalMonths = 12;
      break;
    default:
      intervalMonths = 1;
  }

  // Generate installment schedule
  for (let i = 0; i < numberOfInstallments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i * intervalMonths);

    installments.push({
      saleId,
      clientId,
      installmentNumber: i + 1,
      dueDate,
      amount: installmentAmount,
      paidAmount: 0,
      status: InstallmentStatus.PENDING,
    });
  }

  // Create installments
  return await this.insertMany(installments);
};

export default mongoose.model<IInstallmentSchedule>(
  'InstallmentSchedule',
  installmentScheduleSchema
);
