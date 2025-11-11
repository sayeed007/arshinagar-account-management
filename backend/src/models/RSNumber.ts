import mongoose, { Schema, Document } from 'mongoose';

/**
 * Unit Type Enum for Land Measurement
 */
export enum UnitType {
  ACRE = 'Acre',
  KATHA = 'Katha',
  SQFT = 'Sq Ft',
  DECIMAL = 'Decimal',
  BIGHA = 'Bigha',
}

/**
 * RSNumber Interface
 */
export interface IRSNumber extends Document {
  rsNumber: string;
  projectName: string;
  location: string;
  totalArea: number;
  unitType: UnitType;
  soldArea: number;
  allocatedArea: number;
  remainingArea: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  calculateRemainingArea(): void;
}

/**
 * RSNumber Schema
 */
const rsNumberSchema = new Schema<IRSNumber>(
  {
    rsNumber: {
      type: String,
      required: [true, 'RS Number (Dag Number) is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    totalArea: {
      type: Number,
      required: [true, 'Total area is required'],
      min: [0.01, 'Total area must be greater than 0'],
    },
    unitType: {
      type: String,
      enum: Object.values(UnitType),
      required: [true, 'Unit type is required'],
      default: UnitType.KATHA,
    },
    soldArea: {
      type: Number,
      default: 0,
      min: [0, 'Sold area cannot be negative'],
    },
    allocatedArea: {
      type: Number,
      default: 0,
      min: [0, 'Allocated area cannot be negative'],
    },
    remainingArea: {
      type: Number,
      default: 0,
      min: [0, 'Remaining area cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
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
 * Calculate remaining area before save
 */
rsNumberSchema.pre('save', function (next) {
  this.remainingArea = this.totalArea - this.soldArea - this.allocatedArea;

  // Validation: prevent overselling
  if (this.remainingArea < 0) {
    next(new Error('Total sold and allocated area cannot exceed total area'));
  } else {
    next();
  }
});

/**
 * Method to recalculate remaining area
 */
rsNumberSchema.methods.calculateRemainingArea = function (): void {
  this.remainingArea = this.totalArea - this.soldArea - this.allocatedArea;
};

/**
 * Indexes for better query performance
 */
rsNumberSchema.index({ rsNumber: 1 });
rsNumberSchema.index({ projectName: 1, location: 1 });
rsNumberSchema.index({ isActive: 1, createdAt: -1 });
rsNumberSchema.index({ projectName: 'text', location: 'text', rsNumber: 'text' });

/**
 * Virtual for utilization percentage
 */
rsNumberSchema.virtual('utilizationPercentage').get(function () {
  if (this.totalArea === 0) return 0;
  return ((this.soldArea + this.allocatedArea) / this.totalArea) * 100;
});

/**
 * Virtual for availability status
 */
rsNumberSchema.virtual('availabilityStatus').get(function () {
  const utilization = ((this.soldArea + this.allocatedArea) / this.totalArea) * 100;

  if (utilization >= 100) return 'Fully Utilized';
  if (utilization >= 75) return 'Almost Full';
  if (utilization >= 50) return 'Partially Available';
  return 'Available';
});

/**
 * RSNumber Model
 */
export const RSNumber = mongoose.model<IRSNumber>('RSNumber', rsNumberSchema);
