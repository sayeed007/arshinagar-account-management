import mongoose, { Schema, Document } from 'mongoose';

export interface ISMSLog extends Document {
  phone: string;
  message: string;
  templateCode?: string;
  clientId?: mongoose.Types.ObjectId;
  saleId?: mongoose.Types.ObjectId;
  receiptId?: mongoose.Types.ObjectId;
  chequeId?: mongoose.Types.ObjectId;
  category: 'payment_confirmation' | 'installment_reminder' | 'missed_installment' | 'cheque_due' | 'bulk' | 'manual';
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';
  deliveryStatus?: string;
  gatewayResponse?: any;
  errorMessage?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  sentBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SMSLogSchema: Schema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    templateCode: {
      type: String,
      trim: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
    saleId: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
    },
    receiptId: {
      type: Schema.Types.ObjectId,
      ref: 'Receipt',
    },
    chequeId: {
      type: Schema.Types.ObjectId,
      ref: 'Cheque',
    },
    category: {
      type: String,
      enum: ['payment_confirmation', 'installment_reminder', 'missed_installment', 'cheque_due', 'bulk', 'manual'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'delivered', 'bounced'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
    errorMessage: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SMSLogSchema.index({ phone: 1, createdAt: -1 });
SMSLogSchema.index({ clientId: 1, createdAt: -1 });
SMSLogSchema.index({ status: 1, createdAt: -1 });
SMSLogSchema.index({ category: 1, status: 1 });
SMSLogSchema.index({ createdAt: -1 });

export default mongoose.model<ISMSLog>('SMSLog', SMSLogSchema);
