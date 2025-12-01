/**
 * Audit Log Model
 * Security Audit - Phase 2
 *
 * Tracks all admin actions for security monitoring and compliance
 * TTL index automatically deletes logs after 90 days
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  characterId?: mongoose.Types.ObjectId;
  action: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  ip: string;
  userAgent?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
      description: 'Description of the admin action performed',
    },
    endpoint: {
      type: String,
      required: true,
      index: true,
      description: 'API endpoint that was accessed',
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    ip: {
      type: String,
      required: true,
      description: 'IP address of the requester',
    },
    userAgent: {
      type: String,
      description: 'User agent string from the request',
    },
    statusCode: {
      type: Number,
      description: 'HTTP status code of the response',
    },
    metadata: {
      type: Schema.Types.Mixed,
      description: 'Additional context about the action (request body, params, etc.)',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  {
    timestamps: false, // We handle timestamp manually
    collection: 'auditlogs',
  }
);

/**
 * TTL Index - Automatically delete logs after 90 days
 * This helps with GDPR compliance and database size management
 */
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

/**
 * Compound indexes for common query patterns
 */
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ endpoint: 1, timestamp: -1 });

/**
 * Static method to create an audit log entry
 */
auditLogSchema.statics.log = async function (logData: Partial<IAuditLog>): Promise<IAuditLog> {
  return this.create({
    ...logData,
    timestamp: new Date(),
  });
};

/**
 * Static method to query audit logs with filters
 */
auditLogSchema.statics.query = async function (filters: {
  userId?: mongoose.Types.ObjectId;
  action?: string;
  endpoint?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const query: any = {};

  if (filters.userId) query.userId = filters.userId;
  if (filters.action) query.action = filters.action;
  if (filters.endpoint) query.endpoint = filters.endpoint;
  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) query.timestamp.$gte = filters.startDate;
    if (filters.endDate) query.timestamp.$lte = filters.endDate;
  }

  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(filters.limit || 100)
    .populate('userId', 'username email')
    .populate('characterId', 'name')
    .lean();
};

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
