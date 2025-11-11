import mongoose, { Document, Schema } from 'mongoose';

export interface IExpenseCategory extends Document {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseCategorySchema = new Schema<IExpenseCategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
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
// Note: name already has unique index from schema definition
ExpenseCategorySchema.index({ isActive: 1 });

export default mongoose.model<IExpenseCategory>('ExpenseCategory', ExpenseCategorySchema);
