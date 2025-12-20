/**
 * Validation Constants - Input Validation Rules
 *
 * Validation rules and constraints for Desperados Destiny
 */

/**
 * User validation rules
 */
export const USER_VALIDATION = {
  /** Minimum email length */
  EMAIL_MIN_LENGTH: 5,
  /** Maximum email length */
  EMAIL_MAX_LENGTH: 254,
  /** Email regex pattern */
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /** Minimum password length */
  PASSWORD_MIN_LENGTH: 8,
  /** Maximum password length */
  PASSWORD_MAX_LENGTH: 128,
  /** Require uppercase in password */
  PASSWORD_REQUIRE_UPPERCASE: true,
  /** Require lowercase in password */
  PASSWORD_REQUIRE_LOWERCASE: true,
  /** Require number in password */
  PASSWORD_REQUIRE_NUMBER: true,
  /** Require special character in password */
  PASSWORD_REQUIRE_SPECIAL: false
} as const;

/**
 * Character validation rules
 */
export const CHARACTER_VALIDATION = {
  /** Minimum character name length */
  NAME_MIN_LENGTH: 3,
  /** Maximum character name length */
  NAME_MAX_LENGTH: 20,
  /** Character name pattern (alphanumeric, spaces, hyphens, apostrophes) */
  NAME_PATTERN: /^[a-zA-Z0-9\s'-]+$/,
  /** Forbidden character names */
  FORBIDDEN_NAMES: [
    'admin',
    'moderator',
    'system',
    'bot',
    'null',
    'undefined',
    'test'
  ],
  /** Maximum characters per user */
  MAX_CHARACTERS_PER_USER: 3
} as const;

/**
 * Pagination validation rules
 */
export const PAGINATION_VALIDATION = {
  /** Default page size */
  DEFAULT_PAGE_SIZE: 20,
  /** Minimum page size */
  MIN_PAGE_SIZE: 1,
  /** Maximum page size */
  MAX_PAGE_SIZE: 100,
  /** Default page number */
  DEFAULT_PAGE: 1
} as const;

// Note: RATE_LIMITS is exported from game.constants.ts

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  // Email
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Email address is not valid',
  EMAIL_TOO_SHORT: `Email must be at least ${USER_VALIDATION.EMAIL_MIN_LENGTH} characters`,
  EMAIL_TOO_LONG: `Email must not exceed ${USER_VALIDATION.EMAIL_MAX_LENGTH} characters`,

  // Password
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: `Password must be at least ${USER_VALIDATION.PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_TOO_LONG: `Password must not exceed ${USER_VALIDATION.PASSWORD_MAX_LENGTH} characters`,
  PASSWORD_MISSING_UPPERCASE: 'Password must contain at least one uppercase letter',
  PASSWORD_MISSING_LOWERCASE: 'Password must contain at least one lowercase letter',
  PASSWORD_MISSING_NUMBER: 'Password must contain at least one number',
  PASSWORD_MISSING_SPECIAL: 'Password must contain at least one special character',

  // Character name
  CHARACTER_NAME_REQUIRED: 'Character name is required',
  CHARACTER_NAME_TOO_SHORT: `Character name must be at least ${CHARACTER_VALIDATION.NAME_MIN_LENGTH} characters`,
  CHARACTER_NAME_TOO_LONG: `Character name must not exceed ${CHARACTER_VALIDATION.NAME_MAX_LENGTH} characters`,
  CHARACTER_NAME_INVALID: 'Character name contains invalid characters',
  CHARACTER_NAME_FORBIDDEN: 'This character name is not allowed',
  CHARACTER_LIMIT_REACHED: `Maximum of ${CHARACTER_VALIDATION.MAX_CHARACTERS_PER_USER} characters per account`,

  // Faction
  FACTION_REQUIRED: 'Faction is required',
  FACTION_INVALID: 'Invalid faction selected',

  // General
  FIELD_REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.'
} as const;
