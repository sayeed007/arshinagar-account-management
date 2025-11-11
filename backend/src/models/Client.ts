import mongoose, { Schema, Document } from 'mongoose';

/**
 * Client Interface
 */
export interface IClient extends Document {
  name: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address: string;
  nid?: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Client Schema
 */
const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^(\+8801|01)[3-9]\d{8}$/,
        'Please provide a valid Bangladeshi phone number',
      ],
      index: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
      match: [
        /^(\+8801|01)[3-9]\d{8}$/,
        'Please provide a valid Bangladeshi phone number',
      ],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      sparse: true, // Allow multiple null values but unique if provided
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters long'],
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    nid: {
      type: String,
      trim: true,
      match: [/^\d{10,17}$/, 'NID must be 10-17 digits'],
      sparse: true, // Allow multiple null values but unique if provided
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for better query performance
 */
clientSchema.index({ name: 'text', phone: 'text', address: 'text' });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ isActive: 1, createdAt: -1 });

/**
 * Virtual for client's full contact info
 */
clientSchema.virtual('fullContactInfo').get(function () {
  return {
    name: this.name,
    phone: this.phone,
    alternatePhone: this.alternatePhone,
    email: this.email,
    address: this.address,
  };
});

/**
 * Client Model
 */
export const Client = mongoose.model<IClient>('Client', clientSchema);
