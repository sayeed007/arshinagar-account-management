import mongoose, { Document, Schema } from 'mongoose';

export enum ExpenseStatus {
  DRAFT = 'Draft',
  PENDING_ACCOUNTS = 'Pending Accounts',
  PENDING_HOF = 'Pending HOF',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum PaymentMethod {
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
  CHEQUE = 'Cheque',
  MOBILE_WALLET = 'Mobile Wallet',
}

export interface IInstrumentDetails {
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: Date;
}

export interface IApprovalHistory {
  approvedBy: mongoose.Types.ObjectId;
  approvedAt: Date;
  remarks?: string;
  action: 'Approved' | 'Rejected';
}

export interface IExpense extends Document {
  _id: string;
  expenseNumber: string;
  categoryId: mongoose.Types.ObjectId;
  amount: number;
  expenseDate: Date;
  vendor?: string;
  description: string;
  paymentMethod: PaymentMethod;
  instrumentDetails?: IInstrumentDetails;
  status: ExpenseStatus;
  approvalHistory: IApprovalHistory[];
  receiptAttachment?: string;
  notes?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    expenseNumber: {
      type: String,
      unique: true,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpenseCategory',
      required: [true, 'Expense category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
    },
    vendor: {
      type: String,
      trim: true,
      maxlength: [200, 'Vendor name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: [true, 'Payment method is required'],
    },
    instrumentDetails: {
      bankName: {
        type: String,
        trim: true,
      },
      chequeNumber: {
        type: String,
        trim: true,
      },
      chequeDate: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: Object.values(ExpenseStatus),
      default: ExpenseStatus.DRAFT,
    },
    approvalHistory: [
      {
        approvedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        approvedAt: {
          type: Date,
          default: Date.now,
        },
        remarks: {
          type: String,
          trim: true,
        },
        action: {
          type: String,
          enum: ['Approved', 'Rejected'],
          required: true,
        },
      },
    ],
    receiptAttachment: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ExpenseSchema.index({ expenseNumber: 1 });
ExpenseSchema.index({ categoryId: 1 });
ExpenseSchema.index({ status: 1 });
ExpenseSchema.index({ expenseDate: 1 });
ExpenseSchema.index({ isActive: 1 });
ExpenseSchema.index({ createdAt: -1 });

// Auto-generate expense number before saving
ExpenseSchema.pre('save', async function (next) {
  if (!this.expenseNumber) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Find the last expense number for this month
    const lastExpense = await mongoose.model('Expense').findOne({
      expenseNumber: new RegExp(`^EXP-${year}-${month}-`),
    }).sort({ expenseNumber: -1 });

    let sequence = 1;
    if (lastExpense && lastExpense.expenseNumber) {
      const lastSequence = parseInt(lastExpense.expenseNumber.split('-')[3]);
      sequence = lastSequence + 1;
    }

    this.expenseNumber = `EXP-${year}-${month}-${String(sequence).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
