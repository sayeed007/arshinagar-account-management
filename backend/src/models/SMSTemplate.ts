import mongoose, { Schema, Document } from 'mongoose';

export interface ISMSTemplate extends Document {
  templateCode: string;
  name: string;
  messageBN: string;
  messageEN: string;
  variables: string[];
  category: 'payment_confirmation' | 'installment_reminder' | 'missed_installment' | 'cheque_due' | 'custom';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SMSTemplateSchema: Schema = new Schema(
  {
    templateCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    messageBN: {
      type: String,
      required: true,
    },
    messageEN: {
      type: String,
      required: true,
    },
    variables: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      enum: ['payment_confirmation', 'installment_reminder', 'missed_installment', 'cheque_due', 'custom'],
      required: true,
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
SMSTemplateSchema.index({ templateCode: 1 });
SMSTemplateSchema.index({ category: 1, isActive: 1 });

export default mongoose.model<ISMSTemplate>('SMSTemplate', SMSTemplateSchema);
