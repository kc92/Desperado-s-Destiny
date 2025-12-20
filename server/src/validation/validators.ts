/**
 * Validators - Core validation functions
 *
 * Provides type-safe validation for all input data.
 * Uses the existing `validator` package for string validation.
 */

import validator from 'validator';
import { Types } from 'mongoose';
import {
  CHARACTER_LIMITS,
  GANG_CONSTANTS,
  MARKETPLACE_CONSTANTS,
  DUEL_CONSTANTS,
  GAMBLING_CONSTANTS,
  PROGRESSION,
  Faction
} from '@desperados/shared';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Individual validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Validator function type
 */
export type ValidatorFn<T> = (value: T, fieldName: string) => ValidationError | null;

/**
 * Create a validation result
 */
function result(errors: ValidationError[]): ValidationResult {
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create an error
 */
function error(field: string, message: string, value?: unknown): ValidationError {
  return { field, message, value };
}

// ============================================
// PRIMITIVE VALIDATORS
// ============================================

/**
 * Validate that value exists and is not empty
 */
export function required<T>(value: T | undefined | null, field: string): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return error(field, `${field} is required`);
  }
  return null;
}

/**
 * Validate string is not empty after trimming
 */
export function notEmpty(value: string | undefined | null, field: string): ValidationError | null {
  if (!value || value.trim().length === 0) {
    return error(field, `${field} cannot be empty`, value);
  }
  return null;
}

/**
 * Validate string minimum length
 */
export function minLength(min: number): ValidatorFn<string> {
  return (value: string, field: string) => {
    if (value.length < min) {
      return error(field, `${field} must be at least ${min} characters`, value);
    }
    return null;
  };
}

/**
 * Validate string maximum length
 */
export function maxLength(max: number): ValidatorFn<string> {
  return (value: string, field: string) => {
    if (value.length > max) {
      return error(field, `${field} must be at most ${max} characters`, value);
    }
    return null;
  };
}

/**
 * Validate string matches regex pattern
 */
export function pattern(regex: RegExp, message?: string): ValidatorFn<string> {
  return (value: string, field: string) => {
    if (!regex.test(value)) {
      return error(field, message || `${field} has invalid format`, value);
    }
    return null;
  };
}

/**
 * Validate number is at least min
 */
export function min(minimum: number): ValidatorFn<number> {
  return (value: number, field: string) => {
    if (value < minimum) {
      return error(field, `${field} must be at least ${minimum}`, value);
    }
    return null;
  };
}

/**
 * Validate number is at most max
 */
export function max(maximum: number): ValidatorFn<number> {
  return (value: number, field: string) => {
    if (value > maximum) {
      return error(field, `${field} must be at most ${maximum}`, value);
    }
    return null;
  };
}

/**
 * Validate number is between min and max (inclusive)
 */
export function range(minimum: number, maximum: number): ValidatorFn<number> {
  return (value: number, field: string) => {
    if (value < minimum || value > maximum) {
      return error(field, `${field} must be between ${minimum} and ${maximum}`, value);
    }
    return null;
  };
}

/**
 * Validate number is an integer
 */
export function integer(value: number, field: string): ValidationError | null {
  if (!Number.isInteger(value)) {
    return error(field, `${field} must be a whole number`, value);
  }
  return null;
}

/**
 * Validate number is positive
 */
export function positive(value: number, field: string): ValidationError | null {
  if (value <= 0) {
    return error(field, `${field} must be positive`, value);
  }
  return null;
}

/**
 * Validate value is one of allowed values
 */
export function oneOf<T>(allowed: readonly T[]): ValidatorFn<T> {
  return (value: T, field: string) => {
    if (!allowed.includes(value)) {
      return error(field, `${field} must be one of: ${allowed.join(', ')}`, value);
    }
    return null;
  };
}

// ============================================
// STRING FORMAT VALIDATORS
// ============================================

/**
 * Validate MongoDB ObjectId
 */
export function objectId(value: string, field: string): ValidationError | null {
  if (!Types.ObjectId.isValid(value)) {
    return error(field, `${field} must be a valid ID`, value);
  }
  return null;
}

/**
 * Validate email format
 */
export function email(value: string, field: string): ValidationError | null {
  if (!validator.isEmail(value)) {
    return error(field, `${field} must be a valid email address`, value);
  }
  return null;
}

/**
 * Validate URL format
 */
export function url(value: string, field: string): ValidationError | null {
  if (!validator.isURL(value)) {
    return error(field, `${field} must be a valid URL`, value);
  }
  return null;
}

/**
 * Validate alphanumeric string
 */
export function alphanumeric(value: string, field: string): ValidationError | null {
  if (!validator.isAlphanumeric(value)) {
    return error(field, `${field} must contain only letters and numbers`, value);
  }
  return null;
}

/**
 * Validate string is safe (no XSS/injection characters)
 */
export function sanitized(value: string, field: string): ValidationError | null {
  // Check for common injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i, // onclick=, onerror=, etc.
    /data:/i,
    /vbscript:/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(value)) {
      return error(field, `${field} contains potentially unsafe content`, '[REDACTED]');
    }
  }
  return null;
}

// ============================================
// DOMAIN-SPECIFIC VALIDATORS
// ============================================

/**
 * Validate character name
 */
export function characterName(value: string, field: string = 'name'): ValidationResult {
  const errors: ValidationError[] = [];

  const reqErr = required(value, field);
  if (reqErr) return result([reqErr]);

  const minErr = minLength(CHARACTER_LIMITS.MIN_NAME_LENGTH)(value, field);
  if (minErr) errors.push(minErr);

  const maxErr = maxLength(CHARACTER_LIMITS.MAX_NAME_LENGTH)(value, field);
  if (maxErr) errors.push(maxErr);

  const patternErr = pattern(
    CHARACTER_LIMITS.NAME_PATTERN,
    'Name can only contain letters, numbers, underscores, and hyphens'
  )(value, field);
  if (patternErr) errors.push(patternErr);

  return result(errors);
}

/**
 * Validate gang name
 */
export function gangName(value: string, field: string = 'name'): ValidationResult {
  const errors: ValidationError[] = [];

  const reqErr = required(value, field);
  if (reqErr) return result([reqErr]);

  const minErr = minLength(GANG_CONSTANTS.MIN_NAME_LENGTH)(value, field);
  if (minErr) errors.push(minErr);

  const maxErr = maxLength(GANG_CONSTANTS.MAX_NAME_LENGTH)(value, field);
  if (maxErr) errors.push(maxErr);

  return result(errors);
}

/**
 * Validate gang tag
 */
export function gangTag(value: string, field: string = 'tag'): ValidationResult {
  const errors: ValidationError[] = [];

  const reqErr = required(value, field);
  if (reqErr) return result([reqErr]);

  const minErr = minLength(GANG_CONSTANTS.MIN_TAG_LENGTH)(value, field);
  if (minErr) errors.push(minErr);

  const maxErr = maxLength(GANG_CONSTANTS.MAX_TAG_LENGTH)(value, field);
  if (maxErr) errors.push(maxErr);

  const patternErr = pattern(
    /^[A-Z0-9]+$/,
    'Tag must be uppercase letters and numbers only'
  )(value, field);
  if (patternErr) errors.push(patternErr);

  return result(errors);
}

/**
 * Validate gold amount
 */
export function goldAmount(value: number, field: string = 'amount'): ValidationResult {
  const errors: ValidationError[] = [];

  const reqErr = required(value, field);
  if (reqErr) return result([reqErr]);

  const intErr = integer(value, field);
  if (intErr) errors.push(intErr);

  const posErr = positive(value, field);
  if (posErr) errors.push(posErr);

  const maxErr = max(CHARACTER_LIMITS.MAX_GOLD)(value, field);
  if (maxErr) errors.push(maxErr);

  return result(errors);
}

/**
 * Validate duel wager
 */
export function duelWager(value: number, field: string = 'wager'): ValidationResult {
  const errors: ValidationError[] = [];

  const intErr = integer(value, field);
  if (intErr) errors.push(intErr);

  const rangeErr = range(DUEL_CONSTANTS.MIN_WAGER, DUEL_CONSTANTS.MAX_WAGER)(value, field);
  if (rangeErr) errors.push(rangeErr);

  return result(errors);
}

/**
 * Validate gambling bet
 */
export function gamblingBet(value: number, field: string = 'bet'): ValidationResult {
  const errors: ValidationError[] = [];

  const intErr = integer(value, field);
  if (intErr) errors.push(intErr);

  const rangeErr = range(GAMBLING_CONSTANTS.MIN_BET, GAMBLING_CONSTANTS.MAX_BET)(value, field);
  if (rangeErr) errors.push(rangeErr);

  return result(errors);
}

/**
 * Validate listing duration (hours)
 */
export function listingDuration(value: number, field: string = 'duration'): ValidationResult {
  const errors: ValidationError[] = [];

  const intErr = integer(value, field);
  if (intErr) errors.push(intErr);

  const rangeErr = range(
    MARKETPLACE_CONSTANTS.MIN_LISTING_HOURS,
    MARKETPLACE_CONSTANTS.MAX_LISTING_HOURS
  )(value, field);
  if (rangeErr) errors.push(rangeErr);

  return result(errors);
}

/**
 * Validate pagination parameters
 */
export function pagination(page: number, limit: number): ValidationResult {
  const errors: ValidationError[] = [];

  if (page !== undefined) {
    const pageInt = integer(page, 'page');
    if (pageInt) errors.push(pageInt);

    const pageMin = min(1)(page, 'page');
    if (pageMin) errors.push(pageMin);
  }

  if (limit !== undefined) {
    const limitInt = integer(limit, 'limit');
    if (limitInt) errors.push(limitInt);

    const limitRange = range(1, 100)(limit, 'limit');
    if (limitRange) errors.push(limitRange);
  }

  return result(errors);
}

/**
 * Validate faction
 */
export function faction(value: string, field: string = 'faction'): ValidationResult {
  const validFactions = Object.values(Faction) as string[];
  const errors: ValidationError[] = [];

  const reqErr = required(value, field);
  if (reqErr) return result([reqErr]);

  const oneOfErr = oneOf(validFactions)(value, field);
  if (oneOfErr) errors.push(oneOfErr);

  return result(errors);
}

// ============================================
// SCHEMA VALIDATION
// ============================================

/**
 * Validate an object against a schema of validators
 */
export function validateObject<T extends Record<string, unknown>>(
  obj: T,
  schema: Record<keyof T, (value: unknown, field: string) => ValidationResult>
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    const value = obj[field as keyof T];
    const fieldResult = validator(value, field);
    errors.push(...fieldResult.errors);
  }

  return result(errors);
}

/**
 * Combine multiple validators for a single field
 */
export function compose<T>(...validators: ValidatorFn<T>[]): (value: T, field: string) => ValidationResult {
  return (value: T, field: string) => {
    const errors: ValidationError[] = [];
    for (const validator of validators) {
      const err = validator(value, field);
      if (err) errors.push(err);
    }
    return result(errors);
  };
}

export default {
  // Primitives
  required,
  notEmpty,
  minLength,
  maxLength,
  pattern,
  min,
  max,
  range,
  integer,
  positive,
  oneOf,
  // String formats
  objectId,
  email,
  url,
  alphanumeric,
  sanitized,
  // Domain-specific
  characterName,
  gangName,
  gangTag,
  goldAmount,
  duelWager,
  gamblingBet,
  listingDuration,
  pagination,
  faction,
  // Utilities
  validateObject,
  compose
};
