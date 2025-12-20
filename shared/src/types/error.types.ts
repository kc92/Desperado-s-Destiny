/**
 * Error Types - Application Error Codes and Handling
 *
 * Standard error codes and types for Desperados Destiny
 */

/**
 * Application error codes
 */
export enum ErrorCode {
  // ============ HTTP Errors ============
  /** Validation error (400) */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Bad request (400) */
  BAD_REQUEST = 'BAD_REQUEST',
  /** Authentication error (401) */
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  /** Authorization error (403) */
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  /** Resource not found (404) */
  NOT_FOUND = 'NOT_FOUND',
  /** Duplicate resource (409) */
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  /** Rate limit exceeded (429) */
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  /** Internal server error (500) */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  /** Service unavailable (503) */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // ============ Authentication ============
  /** Invalid credentials provided */
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  /** Token has expired */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  /** Token is invalid */
  TOKEN_INVALID = 'TOKEN_INVALID',
  /** Account is locked */
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',

  // ============ Authorization ============
  /** User does not own this resource (IDOR protection) */
  OWNERSHIP_VIOLATION = 'OWNERSHIP_VIOLATION',
  /** Insufficient permissions for action */
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  /** Action forbidden */
  FORBIDDEN = 'FORBIDDEN',

  // ============ Game Resources ============
  /** Insufficient gold for action */
  INSUFFICIENT_GOLD = 'INSUFFICIENT_GOLD',
  /** Insufficient energy for action */
  INSUFFICIENT_ENERGY = 'INSUFFICIENT_ENERGY',
  /** Inventory is full */
  INVENTORY_FULL = 'INVENTORY_FULL',
  /** Item not found in inventory */
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',

  // ============ Game Logic ============
  /** Action is on cooldown */
  COOLDOWN_ACTIVE = 'COOLDOWN_ACTIVE',
  /** Level requirement not met */
  LEVEL_REQUIREMENT = 'LEVEL_REQUIREMENT',
  /** Skill requirement not met */
  SKILL_REQUIREMENT = 'SKILL_REQUIREMENT',
  /** Quest requirement not met */
  QUEST_REQUIREMENT = 'QUEST_REQUIREMENT',
  /** Invalid game state for this action */
  INVALID_STATE = 'INVALID_STATE',
  /** Already in progress */
  ALREADY_IN_PROGRESS = 'ALREADY_IN_PROGRESS',

  // ============ Combat ============
  /** Not in combat */
  NOT_IN_COMBAT = 'NOT_IN_COMBAT',
  /** Combat already ended */
  COMBAT_ENDED = 'COMBAT_ENDED',
  /** Not your turn */
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',

  // ============ Duel ============
  /** Duel challenge expired */
  DUEL_EXPIRED = 'DUEL_EXPIRED',
  /** Duel already in progress */
  DUEL_IN_PROGRESS = 'DUEL_IN_PROGRESS',
  /** Cannot duel yourself */
  CANNOT_DUEL_SELF = 'CANNOT_DUEL_SELF',

  // ============ Gang ============
  /** Not a gang member */
  NOT_GANG_MEMBER = 'NOT_GANG_MEMBER',
  /** Insufficient gang rank */
  INSUFFICIENT_RANK = 'INSUFFICIENT_RANK',
  /** Gang is full */
  GANG_FULL = 'GANG_FULL',
  /** Already in a gang */
  ALREADY_IN_GANG = 'ALREADY_IN_GANG',

  // ============ Marketplace ============
  /** Listing not found */
  LISTING_NOT_FOUND = 'LISTING_NOT_FOUND',
  /** Listing has expired */
  LISTING_EXPIRED = 'LISTING_EXPIRED',
  /** Bid too low */
  BID_TOO_LOW = 'BID_TOO_LOW',
  /** Cannot bid on own listing */
  CANNOT_BID_OWN = 'CANNOT_BID_OWN',

  // ============ System ============
  /** Race condition detected */
  RACE_CONDITION = 'RACE_CONDITION',
  /** Lock could not be acquired */
  LOCK_FAILED = 'LOCK_FAILED',
  /** Operation timed out */
  TIMEOUT = 'TIMEOUT',
  /** Database error */
  DATABASE_ERROR = 'DATABASE_ERROR',
  /** External service error */
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

/**
 * Standard API error structure
 */
export interface ApiError {
  /** Error code */
  code: ErrorCode;
  /** Human-readable error message */
  message: string;
  /** Additional error details (optional) */
  details?: any;
  /** Field-specific validation errors (optional) */
  fieldErrors?: Record<string, string[]>;
}

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  /** Field name */
  field: string;
  /** Error message */
  message: string;
  /** Invalid value (optional) */
  value?: any;
}

/**
 * Maps error codes to HTTP status codes
 */
export const ErrorCodeToHttpStatus: Record<ErrorCode, number> = {
  // HTTP Errors
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.AUTHENTICATION_ERROR]: 401,
  [ErrorCode.AUTHORIZATION_ERROR]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.DUPLICATE_ERROR]: 409,
  [ErrorCode.RATE_LIMIT_ERROR]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,

  // Authentication
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.TOKEN_INVALID]: 401,
  [ErrorCode.ACCOUNT_LOCKED]: 403,

  // Authorization
  [ErrorCode.OWNERSHIP_VIOLATION]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.FORBIDDEN]: 403,

  // Game Resources
  [ErrorCode.INSUFFICIENT_GOLD]: 400,
  [ErrorCode.INSUFFICIENT_ENERGY]: 400,
  [ErrorCode.INVENTORY_FULL]: 400,
  [ErrorCode.ITEM_NOT_FOUND]: 404,

  // Game Logic
  [ErrorCode.COOLDOWN_ACTIVE]: 429,
  [ErrorCode.LEVEL_REQUIREMENT]: 400,
  [ErrorCode.SKILL_REQUIREMENT]: 400,
  [ErrorCode.QUEST_REQUIREMENT]: 400,
  [ErrorCode.INVALID_STATE]: 400,
  [ErrorCode.ALREADY_IN_PROGRESS]: 409,

  // Combat
  [ErrorCode.NOT_IN_COMBAT]: 400,
  [ErrorCode.COMBAT_ENDED]: 400,
  [ErrorCode.NOT_YOUR_TURN]: 400,

  // Duel
  [ErrorCode.DUEL_EXPIRED]: 410,
  [ErrorCode.DUEL_IN_PROGRESS]: 409,
  [ErrorCode.CANNOT_DUEL_SELF]: 400,

  // Gang
  [ErrorCode.NOT_GANG_MEMBER]: 403,
  [ErrorCode.INSUFFICIENT_RANK]: 403,
  [ErrorCode.GANG_FULL]: 400,
  [ErrorCode.ALREADY_IN_GANG]: 409,

  // Marketplace
  [ErrorCode.LISTING_NOT_FOUND]: 404,
  [ErrorCode.LISTING_EXPIRED]: 410,
  [ErrorCode.BID_TOO_LOW]: 400,
  [ErrorCode.CANNOT_BID_OWN]: 400,

  // System
  [ErrorCode.RACE_CONDITION]: 409,
  [ErrorCode.LOCK_FAILED]: 503,
  [ErrorCode.TIMEOUT]: 504,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502
};
