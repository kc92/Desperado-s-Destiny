/**
 * Refresh Token Model
 * Stores long-lived refresh tokens for JWT authentication
 * Enables token revocation and session management
 * Auto-deletes expired tokens via TTL index
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
  ipAddress: string;
  userAgent: string;
  isRevoked: boolean;
  // Virtuals
  isExpired: boolean;
  isValid: boolean;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // Note: Indexed via compound index below (userId, isRevoked, expiresAt)
    comment: 'User who owns this refresh token',
  },
  token: {
    type: String,
    required: true,
    unique: true, // unique constraint already creates an index
    comment: 'Cryptographically secure random token',
  },
  expiresAt: {
    type: Date,
    required: true,
    // Note: TTL index defined below
    comment: 'Token expires after 30 days',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
    required: true,
    comment: 'Updated each time token is used to refresh access token',
  },
  ipAddress: {
    type: String,
    required: false,
    comment: 'IP address where token was issued (for security monitoring)',
  },
  userAgent: {
    type: String,
    required: false,
    comment: 'User agent where token was issued (for device tracking)',
  },
  isRevoked: {
    type: Boolean,
    default: false,
    required: true,
    // Note: Indexed via compound indexes below
    comment: 'Revoked tokens cannot be used',
  },
});

// TTL index - MongoDB will automatically delete documents after expiry
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient token validation queries
RefreshTokenSchema.index({ token: 1, isRevoked: 1, expiresAt: 1 });

// Compound index for user session queries
RefreshTokenSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });

// Virtual for time remaining
RefreshTokenSchema.virtual('timeRemainingMs').get(function () {
  return Math.max(0, this.expiresAt.getTime() - Date.now());
});

// Virtual for isExpired
RefreshTokenSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date();
});

// Virtual for isValid (not revoked and not expired)
RefreshTokenSchema.virtual('isValid').get(function () {
  return !this.isRevoked && !this.isExpired;
});

// Ensure virtuals are included in JSON output
RefreshTokenSchema.set('toJSON', { virtuals: true });
RefreshTokenSchema.set('toObject', { virtuals: true });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
