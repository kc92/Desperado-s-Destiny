/**
 * Validation Utilities - Input Validation Helpers
 *
 * Common validation functions for user input
 */

import { USER_VALIDATION, CHARACTER_VALIDATION, VALIDATION_MESSAGES } from '../constants/validation.constants';
import { Faction } from '../types/character.types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || email.trim().length === 0) {
    errors.push(VALIDATION_MESSAGES.EMAIL_REQUIRED);
    return { valid: false, errors };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length < USER_VALIDATION.EMAIL_MIN_LENGTH) {
    errors.push(VALIDATION_MESSAGES.EMAIL_TOO_SHORT);
  }

  if (trimmedEmail.length > USER_VALIDATION.EMAIL_MAX_LENGTH) {
    errors.push(VALIDATION_MESSAGES.EMAIL_TOO_LONG);
  }

  if (!USER_VALIDATION.EMAIL_PATTERN.test(trimmedEmail)) {
    errors.push(VALIDATION_MESSAGES.EMAIL_INVALID);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a password
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_REQUIRED);
    return { valid: false, errors };
  }

  if (password.length < USER_VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_TOO_SHORT);
  }

  if (password.length > USER_VALIDATION.PASSWORD_MAX_LENGTH) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_TOO_LONG);
  }

  if (USER_VALIDATION.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_MISSING_UPPERCASE);
  }

  if (USER_VALIDATION.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_MISSING_LOWERCASE);
  }

  if (USER_VALIDATION.PASSWORD_REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_MISSING_NUMBER);
  }

  if (USER_VALIDATION.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_MISSING_SPECIAL);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a character name
 */
export function validateCharacterName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push(VALIDATION_MESSAGES.CHARACTER_NAME_REQUIRED);
    return { valid: false, errors };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < CHARACTER_VALIDATION.NAME_MIN_LENGTH) {
    errors.push(VALIDATION_MESSAGES.CHARACTER_NAME_TOO_SHORT);
  }

  if (trimmedName.length > CHARACTER_VALIDATION.NAME_MAX_LENGTH) {
    errors.push(VALIDATION_MESSAGES.CHARACTER_NAME_TOO_LONG);
  }

  if (!CHARACTER_VALIDATION.NAME_PATTERN.test(trimmedName)) {
    errors.push(VALIDATION_MESSAGES.CHARACTER_NAME_INVALID);
  }

  // Check forbidden names (case-insensitive)
  if (CHARACTER_VALIDATION.FORBIDDEN_NAMES.some(
    forbidden => forbidden.toLowerCase() === trimmedName.toLowerCase()
  )) {
    errors.push(VALIDATION_MESSAGES.CHARACTER_NAME_FORBIDDEN);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a faction selection
 */
export function validateFaction(faction: string): ValidationResult {
  const errors: string[] = [];

  if (!faction) {
    errors.push(VALIDATION_MESSAGES.FACTION_REQUIRED);
    return { valid: false, errors };
  }

  const validFactions = Object.values(Faction);
  if (!validFactions.includes(faction as Faction)) {
    errors.push(VALIDATION_MESSAGES.FACTION_INVALID);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a string is not empty
 */
export function validateRequired(value: string, fieldName?: string): ValidationResult {
  const errors: string[] = [];

  if (!value || value.trim().length === 0) {
    errors.push(fieldName ? `${fieldName} is required` : VALIDATION_MESSAGES.FIELD_REQUIRED);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName?: string
): ValidationResult {
  const errors: string[] = [];
  const trimmedValue = value.trim();

  if (trimmedValue.length < min) {
    errors.push(`${fieldName || 'Value'} must be at least ${min} characters`);
  }

  if (trimmedValue.length > max) {
    errors.push(`${fieldName || 'Value'} must not exceed ${max} characters`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a string matches a pattern
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  errorMessage?: string
): ValidationResult {
  const errors: string[] = [];

  if (!pattern.test(value)) {
    errors.push(errorMessage || VALIDATION_MESSAGES.INVALID_FORMAT);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a number is within a range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName?: string
): ValidationResult {
  const errors: string[] = [];

  if (value < min) {
    errors.push(`${fieldName || 'Value'} must be at least ${min}`);
  }

  if (value > max) {
    errors.push(`${fieldName || 'Value'} must not exceed ${max}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Combines multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(r => r.errors);
  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
}
