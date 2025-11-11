import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  _id: string;
  name: string;
  designation: string;
  phone: string;
  email?: string;
  nid?: string;
  address?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
  joinDate: Date;
  resignDate?: Date;
  baseSalary: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function (v: string) {
          return /^01[3-9]\d{8}$/.test(v);
        },
        message: 'Phone number must be a valid Bangladesh mobile number (01XXXXXXXXX)',
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    nid: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^\d{10}$|^\d{13}$|^\d{17}$/.test(v);
        },
        message: 'NID must be 10, 13, or 17 digits',
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    bankAccount: {
      bankName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      accountHolderName: {
        type: String,
        trim: true,
      },
    },
    joinDate: {
      type: Date,
      required: [true, 'Join date is required'],
    },
    resignDate: {
      type: Date,
    },
    baseSalary: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: [0, 'Base salary cannot be negative'],
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
EmployeeSchema.index({ name: 1 });
EmployeeSchema.index({ phone: 1 });
EmployeeSchema.index({ isActive: 1 });
EmployeeSchema.index({ joinDate: 1 });

// Virtual for full employment duration
EmployeeSchema.virtual('employmentDuration').get(function () {
  const endDate = this.resignDate || new Date();
  const duration = endDate.getTime() - this.joinDate.getTime();
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  return days;
});

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
