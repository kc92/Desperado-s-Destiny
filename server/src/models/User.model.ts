/**
 * User Model - Mongoose Schema and Methods
 *
 * User entity with authentication capabilities
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { SafeUser } from '@desperados/shared';

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  mailReceived: boolean;
  friendRequest: boolean;
  gangInvite: boolean;
  combatChallenge: boolean;
  warUpdates: boolean;
}

/**
 * User privacy preferences
 */
export interface PrivacyPreferences {
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  allowGangInvites: boolean;
  allowChallenges: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

/**
 * User document interface extending Mongoose Document
 */
export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  role: 'user' | 'admin';
  preferences: UserPreferences;

  // Subscription fields
  subscriptionPlan?: string;
  subscriptionExpiresAt?: Date;
  subscriptionCancelled?: boolean;

  // Account Security (lockout after failed login attempts)
  failedLoginAttempts: number;
  lastFailedLogin?: Date;
  accountLockedUntil?: Date;

  // Two-Factor Authentication
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  twoFactorPendingSetup: boolean;

  // Legacy/Progression Tracking (aggregated from all characters)
  legacyTier: number;           // Highest legacy tier achieved
  totalGoldEarned: number;      // Cumulative gold earned across all characters
  totalCrimesCommitted: number; // Total crimes committed
  totalDuelsWon: number;        // Total duels won
  totalTimePlayed: number;      // Total time played in minutes

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationToken(): string;
  generateResetToken(): string;
  toSafeObject(): SafeUser;
}

/**
 * User model interface
 */
export interface IUserModel extends Model<IUserDocument> {
  // Static methods can be added here if needed
}

/**
 * User schema definition
 */
const UserSchema = new Schema<IUserDocument, IUserModel>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      // Note: unique index defined below
      lowercase: true,
      trim: true,
      validate: {
        validator: function(email: string) {
          // Basic email validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please provide a valid email address'
      }
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false // Don't include by default in queries
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String
      // Note: unique sparse index defined below (allows multiple null values)
    },
    verificationTokenExpiry: {
      type: Date
    },
    resetPasswordToken: {
      type: String
      // Note: unique sparse index defined below (allows multiple null values)
    },
    resetPasswordExpiry: {
      type: Date
    },
    lastLogin: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        mailReceived: { type: Boolean, default: true },
        friendRequest: { type: Boolean, default: true },
        gangInvite: { type: Boolean, default: true },
        combatChallenge: { type: Boolean, default: true },
        warUpdates: { type: Boolean, default: true }
      },
      privacy: {
        showOnlineStatus: { type: Boolean, default: true },
        allowFriendRequests: { type: Boolean, default: true },
        allowGangInvites: { type: Boolean, default: true },
        allowChallenges: { type: Boolean, default: true }
      }
    },
    subscriptionPlan: {
      type: String,
      default: 'free'
    },
    subscriptionExpiresAt: {
      type: Date
    },
    subscriptionCancelled: {
      type: Boolean,
      default: false
    },

    // Account Security (lockout after failed login attempts)
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Number of failed login attempts since last successful login'
    },
    lastFailedLogin: {
      type: Date,
      default: null,
      comment: 'Timestamp of most recent failed login attempt'
    },
    accountLockedUntil: {
      type: Date,
      default: null,
      index: true,
      comment: 'Account locked until this time after too many failed attempts'
    },

    // Two-Factor Authentication
    twoFactorEnabled: {
      type: Boolean,
      default: false,
      comment: 'Whether 2FA is enabled for this account'
    },
    twoFactorSecret: {
      type: String,
      select: false, // Never return in queries by default (sensitive)
      comment: 'TOTP secret for authenticator apps'
    },
    twoFactorBackupCodes: {
      type: [String],
      select: false, // Never return in queries by default (sensitive)
      comment: 'Hashed backup codes for 2FA recovery'
    },
    twoFactorPendingSetup: {
      type: Boolean,
      default: false,
      comment: 'Whether 2FA setup is in progress but not yet verified'
    },

    // Legacy/Progression Tracking (aggregated from all characters)
    legacyTier: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Highest legacy tier achieved by any character'
    },
    totalGoldEarned: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Cumulative gold earned across all characters'
    },
    totalCrimesCommitted: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Total crimes committed across all characters'
    },
    totalDuelsWon: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Total duels won across all characters'
    },
    totalTimePlayed: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Total time played in minutes across all sessions'
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'users'
  }
);

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ verificationToken: 1 }, { unique: true, sparse: true });
UserSchema.index({ resetPasswordToken: 1 }, { unique: true, sparse: true });
UserSchema.index({ isActive: 1 });

/**
 * Instance method: Compare password with hash
 */
UserSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  try {
    // Use bcrypt's compare which is constant-time to prevent timing attacks
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    return false;
  }
};

/**
 * Instance method: Generate email verification token
 */
UserSchema.methods.generateVerificationToken = function(): string {
  // Generate 32 bytes random hex string
  const token = crypto.randomBytes(32).toString('hex');

  this.verificationToken = token;
  // Token expires in 24 hours
  this.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return token;
};

/**
 * Instance method: Generate password reset token
 */
UserSchema.methods.generateResetToken = function(): string {
  // Generate 32 bytes random hex string
  const token = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = token;
  // Token expires in 1 hour
  this.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);

  return token;
};

/**
 * Instance method: Convert to safe user object (without sensitive fields)
 */
UserSchema.methods.toSafeObject = function(): SafeUser {
  return {
    _id: this._id.toString(),
    email: this.email,
    emailVerified: this.emailVerified,
    role: this.role,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin || this.createdAt
  };
};

/**
 * Export User model
 */
export const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default User;
