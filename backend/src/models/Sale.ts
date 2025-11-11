import mongoose, { Schema, Document } from 'mongoose';

// Sale stage status enum
export enum SaleStageStatus {
  PENDING = 'Pending',
  PARTIAL = 'Partial',
  COMPLETED = 'Completed',
  OVERDUE = 'Overdue',
}

// Sale status enum
export enum SaleStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  ON_HOLD = 'On Hold',
}

// Payment method enum
export enum PaymentMethod {
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
  CHEQUE = 'Cheque',
  PDC = 'PDC',
  MOBILE_WALLET = 'Mobile Wallet',
}

// Sale stage subdocument interface
export interface ISaleStage {
  stageName: string;
  plannedAmount: number;
  receivedAmount: number;
  dueAmount: number;
  status: SaleStageStatus;
  expectedDate?: Date;
  completedDate?: Date;
  notes?: string;
}

// Sale stage subdocument schema
const saleStageSchema = new Schema<ISaleStage>(
  {
    stageName: {
      type: String,
      required: [true, 'Stage name is required'],
      enum: ['Booking', 'Installments', 'Registration', 'Handover', 'Other'],
    },
    plannedAmount: {
      type: Number,
      required: [true, 'Planned amount is required'],
      min: [0, 'Planned amount must be non-negative'],
    },
    receivedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Received amount must be non-negative'],
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: [0, 'Due amount must be non-negative'],
    },
    status: {
      type: String,
      enum: Object.values(SaleStageStatus),
      default: SaleStageStatus.PENDING,
    },
    expectedDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { _id: true }
);

// Sale interface
export interface ISale extends Document {
  saleNumber: string;
  clientId: mongoose.Types.ObjectId;
  plotId: mongoose.Types.ObjectId;
  rsNumberId: mongoose.Types.ObjectId;
  totalPrice: number;
  paidAmount: number;
  dueAmount: number;
  saleDate: Date;
  status: SaleStatus;
  stages: ISaleStage[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  calculateDueAmount(): void;
  updateStageStatus(): void;
}

// Sale schema
const saleSchema = new Schema<ISale>(
  {
    saleNumber: {
      type: String,
      required: [true, 'Sale number is required'],
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
    plotId: {
      type: Schema.Types.ObjectId,
      ref: 'Plot',
      required: [true, 'Plot ID is required'],
      index: true,
    },
    rsNumberId: {
      type: Schema.Types.ObjectId,
      ref: 'RSNumber',
      required: [true, 'RS Number ID is required'],
      index: true,
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price must be positive'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount must be non-negative'],
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: [0, 'Due amount must be non-negative'],
    },
    saleDate: {
      type: Date,
      required: [true, 'Sale date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(SaleStatus),
      default: SaleStatus.ACTIVE,
    },
    stages: {
      type: [saleStageSchema],
      default: [],
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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
saleSchema.index({ saleDate: -1 });
saleSchema.index({ status: 1, isActive: 1 });
saleSchema.index({ clientId: 1, isActive: 1 });

// Method to calculate due amount
saleSchema.methods.calculateDueAmount = function () {
  this.dueAmount = this.totalPrice - this.paidAmount;
};

// Method to update stage status
saleSchema.methods.updateStageStatus = function () {
  this.stages.forEach((stage: ISaleStage) => {
    stage.dueAmount = stage.plannedAmount - stage.receivedAmount;

    if (stage.receivedAmount >= stage.plannedAmount) {
      stage.status = SaleStageStatus.COMPLETED;
      if (!stage.completedDate) {
        stage.completedDate = new Date();
      }
    } else if (stage.receivedAmount > 0) {
      stage.status = SaleStageStatus.PARTIAL;
    } else if (stage.expectedDate && new Date() > stage.expectedDate) {
      stage.status = SaleStageStatus.OVERDUE;
    } else {
      stage.status = SaleStageStatus.PENDING;
    }
  });
};

// Pre-save hook to calculate amounts and update statuses
saleSchema.pre('save', function (next) {
  // Calculate total paid amount from stages
  this.paidAmount = this.stages.reduce((sum, stage) => sum + stage.receivedAmount, 0);

  // Calculate due amount
  this.calculateDueAmount();

  // Update stage statuses
  this.updateStageStatus();

  // Update overall sale status
  if (this.paidAmount >= this.totalPrice) {
    this.status = SaleStatus.COMPLETED;
  } else if (this.paidAmount > 0) {
    if (this.status === SaleStatus.PENDING) {
      this.status = SaleStatus.ACTIVE;
    }
  }

  next();
});

// Generate unique sale number (format: SAL-YYYY-MM-XXXXX)
saleSchema.statics.generateSaleNumber = async function (): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `SAL-${year}-${month}-`;

  // Find the latest sale number for this month
  const latestSale = await this.findOne({
    saleNumber: new RegExp(`^${prefix}`),
  })
    .sort({ saleNumber: -1 })
    .limit(1);

  let sequence = 1;
  if (latestSale && latestSale.saleNumber) {
    const lastSequence = parseInt(latestSale.saleNumber.split('-').pop() || '0');
    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(5, '0')}`;
};

export default mongoose.model<ISale>('Sale', saleSchema);
