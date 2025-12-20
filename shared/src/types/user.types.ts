/**
 * User Types - Authentication and User Management
 *
 * Core user types for Desperados Destiny MMORPG
 */

/**
 * Complete user entity stored in database
 */
export interface User {
  /** MongoDB ObjectId as string */
  _id: string;
  /** User's email address (unique) */
  email: string;
  /** Whether email has been verified */
  emailVerified: boolean;
  /** Timestamp when user account was created */
  createdAt: Date;
  /** Timestamp of most recent login */
  lastLogin: Date;
}

/**
 * Data required to register a new user
 */
export interface UserRegistration {
  /** User's email address */
  email: string;
  /** User's password (will be hashed) */
  password: string;
}

/**
 * Data required for user login
 */
export interface UserLogin {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Safe user data (excludes sensitive fields like password hash)
 */
export interface SafeUser {
  /** MongoDB ObjectId as string */
  _id: string;
  /** User's email address */
  email: string;
  /** Whether email has been verified */
  emailVerified: boolean;
  /** User's role for authorization */
  role: 'user' | 'admin';
  /** Whether user has admin privileges (convenience alias for role === 'admin') */
  isAdmin?: boolean;
  /** Timestamp when user account was created */
  createdAt: Date;
  /** Timestamp of most recent login */
  lastLogin: Date;
  /** Active character ID (set when user selects a character) */
  characterId?: string;
  /** Active character ID - alias for characterId for backwards compatibility */
  activeCharacterId?: string;
}

/**
 * JWT token payload
 */
export interface TokenPayload {
  /** User's MongoDB ObjectId */
  userId: string;
  /** User's email address */
  email: string;
  /** Token issued at timestamp */
  iat?: number;
  /** Token expiration timestamp */
  exp?: number;
  /** Optional purpose for special tokens (e.g., '2fa-pending') */
  purpose?: string;
  /** JWT key version for rotation tracking */
  kv?: number;
}
