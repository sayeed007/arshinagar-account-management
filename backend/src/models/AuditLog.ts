import mongoose, { Schema } from 'mongoose';
import { IAuditLog, AuditAction } from '../types';

/**
 * Audit Log Schema
 * Tracks all important actions in the system for accountability and compliance
 */
const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true,
    },
    entity: {
      type: String,
      required: true,
      index: true,
      description: 'Entity type (e.g., User, Client, Receipt, Expense)',
    },
    entityId: {
      type: String,
      index: true,
      description: 'ID of the entity being acted upon',
    },
    changes: {
      type: Schema.Types.Mixed,
      description: 'JSON object containing the changes made',
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      description: 'Browser/client user agent string',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We're using our own timestamp field
  }
);

/**
 * Indexes for better query performance
 */
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // For recent logs

/**
 * Compound index for common queries
 */
auditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });

/**
 * Make audit logs immutable (cannot be updated or deleted)
 */
auditLogSchema.pre('save', function (next) {
  // Ensure timestamp is set
  if (!this.timestamp) {
    this.timestamp = new Date();
  }
  next();
});

// Prevent updates and deletes
auditLogSchema.pre('findOneAndUpdate', function (next) {
  next(new Error('Audit logs cannot be modified'));
});

auditLogSchema.pre('findOneAndDelete', function (next) {
  next(new Error('Audit logs cannot be deleted'));
});

auditLogSchema.pre('deleteOne', function (next) {
  next(new Error('Audit logs cannot be deleted'));
});

auditLogSchema.pre('deleteMany', function (next) {
  next(new Error('Audit logs cannot be deleted'));
});

/**
 * Audit Log Model
 */
export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
