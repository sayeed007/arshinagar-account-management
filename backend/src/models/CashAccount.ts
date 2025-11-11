import mongoose, { Document, Schema } from 'mongoose';

export interface ICashAccount extends Document {
  name: string;
  description?: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cashAccountSchema = new Schema<ICashAccount>(
  {
    name: {
      type: String,
      required: [true, 'Cash account name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
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
cashAccountSchema.index({ isActive: 1, isDeleted: 1 });

// Pre-save hook to set opening balance as current balance for new accounts
cashAccountSchema.pre('save', function (next) {
  if (this.isNew) {
    this.currentBalance = this.openingBalance;
  }
  next();
});

const CashAccount = mongoose.model<ICashAccount>('CashAccount', cashAccountSchema);

export default CashAccount;
