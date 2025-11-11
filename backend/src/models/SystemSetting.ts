import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'date';
  category: 'general' | 'sms' | 'email' | 'payment' | 'finance' | 'branding' | 'approval' | 'other';
  description?: string;
  isEditable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'date'],
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'sms', 'email', 'payment', 'finance', 'branding', 'approval', 'other'],
      default: 'other',
    },
    description: {
      type: String,
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SystemSettingSchema.index({ key: 1 });
SystemSettingSchema.index({ category: 1, isActive: 1 });

export default mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
