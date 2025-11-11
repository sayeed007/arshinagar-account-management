import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployeeCost extends Document {
  _id: string;
  employeeId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  salary: number;
  commission: number;
  fuel: number;
  entertainment: number;
  advances: number;
  deductions: number;
  bonus: number;
  overtime: number;
  otherAllowances: number;
  netPay: number;
  paymentDate?: Date;
  paymentMethod?: string;
  notes?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeCostSchema = new Schema<IEmployeeCost>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be valid'],
      max: [2100, 'Year must be valid'],
    },
    salary: {
      type: Number,
      default: 0,
      min: [0, 'Salary cannot be negative'],
    },
    commission: {
      type: Number,
      default: 0,
      min: [0, 'Commission cannot be negative'],
    },
    fuel: {
      type: Number,
      default: 0,
      min: [0, 'Fuel allowance cannot be negative'],
    },
    entertainment: {
      type: Number,
      default: 0,
      min: [0, 'Entertainment allowance cannot be negative'],
    },
    advances: {
      type: Number,
      default: 0,
      min: [0, 'Advances cannot be negative'],
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, 'Deductions cannot be negative'],
    },
    bonus: {
      type: Number,
      default: 0,
      min: [0, 'Bonus cannot be negative'],
    },
    overtime: {
      type: Number,
      default: 0,
      min: [0, 'Overtime cannot be negative'],
    },
    otherAllowances: {
      type: Number,
      default: 0,
      min: [0, 'Other allowances cannot be negative'],
    },
    netPay: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Wallet'],
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
EmployeeCostSchema.index({ employeeId: 1, year: 1, month: 1 }, { unique: true });
EmployeeCostSchema.index({ year: 1, month: 1 });
EmployeeCostSchema.index({ isActive: 1 });

// Calculate net pay before saving
EmployeeCostSchema.pre('save', function (next) {
  const grossPay =
    this.salary +
    this.commission +
    this.fuel +
    this.entertainment +
    this.bonus +
    this.overtime +
    this.otherAllowances;

  this.netPay = grossPay - this.deductions - this.advances;
  next();
});

// Virtual for total earnings
EmployeeCostSchema.virtual('totalEarnings').get(function () {
  return (
    this.salary +
    this.commission +
    this.fuel +
    this.entertainment +
    this.bonus +
    this.overtime +
    this.otherAllowances
  );
});

// Virtual for total deductions
EmployeeCostSchema.virtual('totalDeductions').get(function () {
  return this.deductions + this.advances;
});

export default mongoose.model<IEmployeeCost>('EmployeeCost', EmployeeCostSchema);
