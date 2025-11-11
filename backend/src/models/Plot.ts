import mongoose, { Schema, Document } from 'mongoose';
import { UnitType } from './RSNumber';

/**
 * Plot Status Enum
 */
export enum PlotStatus {
  AVAILABLE = 'Available',
  RESERVED = 'Reserved',
  SOLD = 'Sold',
  BLOCKED = 'Blocked',
}

/**
 * Plot Interface
 */
export interface IPlot extends Document {
  plotNumber: string;
  rsNumberId: mongoose.Types.ObjectId;
  area: number;
  unitType: UnitType;
  status: PlotStatus;
  clientId?: mongoose.Types.ObjectId;
  reservationDate?: Date;
  saleDate?: Date;
  price?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Plot Schema
 */
const plotSchema = new Schema<IPlot>(
  {
    plotNumber: {
      type: String,
      required: [true, 'Plot number is required'],
      trim: true,
      index: true,
    },
    rsNumberId: {
      type: Schema.Types.ObjectId,
      ref: 'RSNumber',
      required: [true, 'RS Number reference is required'],
      index: true,
    },
    area: {
      type: Number,
      required: [true, 'Plot area is required'],
      min: [0.01, 'Area must be greater than 0'],
    },
    unitType: {
      type: String,
      enum: Object.values(UnitType),
      required: [true, 'Unit type is required'],
      default: UnitType.KATHA,
    },
    status: {
      type: String,
      enum: Object.values(PlotStatus),
      default: PlotStatus.AVAILABLE,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
      sparse: true, // Allow null values
    },
    reservationDate: {
      type: Date,
    },
    saleDate: {
      type: Date,
      index: true,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
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

/**
 * Compound index to ensure unique plot number within an RS Number
 */
plotSchema.index({ rsNumberId: 1, plotNumber: 1 }, { unique: true });

/**
 * Indexes for common queries
 */
plotSchema.index({ status: 1, rsNumberId: 1 });
plotSchema.index({ clientId: 1, status: 1 });
plotSchema.index({ saleDate: -1 });
plotSchema.index({ isActive: 1, status: 1 });

/**
 * Pre-save validation
 */
plotSchema.pre('save', function (next) {
  // If status is SOLD, clientId and saleDate are required
  if (this.status === PlotStatus.SOLD) {
    if (!this.clientId) {
      return next(new Error('Client ID is required for sold plots'));
    }
    if (!this.saleDate) {
      this.saleDate = new Date();
    }
  }

  // If status is RESERVED, reservationDate is required
  if (this.status === PlotStatus.RESERVED) {
    if (!this.reservationDate) {
      this.reservationDate = new Date();
    }
  }

  // If status changes from SOLD to something else, clear clientId and saleDate
  if (this.isModified('status') && this.status !== PlotStatus.SOLD) {
    this.clientId = undefined;
    this.saleDate = undefined;
  }

  next();
});

/**
 * Virtual for status color (for UI)
 */
plotSchema.virtual('statusColor').get(function () {
  switch (this.status) {
    case PlotStatus.AVAILABLE:
      return 'green';
    case PlotStatus.RESERVED:
      return 'yellow';
    case PlotStatus.SOLD:
      return 'red';
    case PlotStatus.BLOCKED:
      return 'gray';
    default:
      return 'gray';
  }
});

/**
 * Plot Model
 */
export const Plot = mongoose.model<IPlot>('Plot', plotSchema);
