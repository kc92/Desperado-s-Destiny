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
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
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
      type: String,
      unique: true,
      sparse: true // Allows multiple null values
    },
    verificationTokenExpiry: {
      type: Date
    },
    resetPasswordToken: {
      type: String,
      unique: true,
      sparse: true // Allows multiple null values
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
    createdAt: this.createdAt,
    lastLogin: this.lastLogin || this.createdAt
  };
};

/**
 * Export User model
 */
export const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default User;
