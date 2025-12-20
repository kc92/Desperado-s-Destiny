/**
 * Validation Utilities
 * Centralized input validation with type-safe results
 *
 * Phase 0 Foundation - Used by controllers for query/body validation
 */

/**
 * Result type for validation operations
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Create successful validation result
 */
export function validationOk<T>(data: T): ValidationResult<T> {
  return { success: true, data };
}

/**
 * Create failed validation result
 */
export function validationFail<T>(errors: string[]): ValidationResult<T> {
  return { success: false, errors };
}

/**
 * Pagination parameters structure
 */
export interface PaginationParams {
  limit: number;
  offset: number;
  page: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Validate pagination parameters with safe defaults
 *
 * Handles both offset-based and page-based pagination.
 * Automatically clamps values to safe ranges.
 *
 * @param input - Raw query parameters
 * @param options - Pagination constraints
 * @returns Validated pagination params or errors
 *
 * @example
 * const result = validatePagination(req.query, { maxLimit: 100 });
 * if (!result.success) return res.status(400).json({ errors: result.errors });
 * const { limit, offset } = result.data;
 */
export function validatePagination(
  input: {
    limit?: unknown;
    offset?: unknown;
    page?: unknown;
    sortBy?: unknown;
    sortOrder?: unknown;
  },
  options: {
    maxLimit?: number;
    defaultLimit?: number;
    allowedSortFields?: string[];
    defaultSortField?: string;
    defaultSortOrder?: 'asc' | 'desc';
  } = {}
): ValidationResult<PaginationParams> {
  const {
    maxLimit = 100,
    defaultLimit = 50,
    allowedSortFields,
    defaultSortField,
    defaultSortOrder = 'desc'
  } = options;
  const errors: string[] = [];

  // Parse limit
  let limit = defaultLimit;
  if (input.limit !== undefined && input.limit !== null && input.limit !== '') {
    const parsed = Number(input.limit);
    if (!Number.isFinite(parsed) || parsed < 1) {
      errors.push('limit must be a positive number');
    } else {
      limit = Math.min(Math.floor(parsed), maxLimit);
    }
  }

  // Parse page/offset
  let page = 1;
  let offset = 0;

  if (input.page !== undefined && input.page !== null && input.page !== '') {
    const parsed = Number(input.page);
    if (!Number.isFinite(parsed) || parsed < 1) {
      errors.push('page must be a positive number');
    } else {
      page = Math.floor(parsed);
      offset = (page - 1) * limit;
    }
  } else if (input.offset !== undefined && input.offset !== null && input.offset !== '') {
    const parsed = Number(input.offset);
    if (!Number.isFinite(parsed) || parsed < 0) {
      errors.push('offset must be a non-negative number');
    } else {
      offset = Math.floor(parsed);
      page = Math.floor(offset / limit) + 1;
    }
  }

  // Parse sortOrder
  let sortOrder: 'asc' | 'desc' = defaultSortOrder;
  if (input.sortOrder !== undefined && input.sortOrder !== null && input.sortOrder !== '') {
    if (input.sortOrder !== 'asc' && input.sortOrder !== 'desc') {
      errors.push('sortOrder must be "asc" or "desc"');
    } else {
      sortOrder = input.sortOrder;
    }
  }

  // Parse sortBy
  let sortBy: string | undefined = defaultSortField;
  if (input.sortBy !== undefined && input.sortBy !== null && input.sortBy !== '') {
    if (typeof input.sortBy !== 'string') {
      errors.push('sortBy must be a string');
    } else if (allowedSortFields && !allowedSortFields.includes(input.sortBy)) {
      errors.push(`sortBy must be one of: ${allowedSortFields.join(', ')}`);
    } else {
      sortBy = input.sortBy;
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: { limit, offset, page, sortBy, sortOrder }
  };
}

/**
 * Validate positive integer with min/max constraints
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param options - Min/max constraints
 * @returns Validated integer or errors
 */
export function validatePositiveInt(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; allowZero?: boolean } = {}
): ValidationResult<number> {
  const { min = 1, max = Number.MAX_SAFE_INTEGER, allowZero = false } = options;
  const minValue = allowZero ? 0 : min;

  if (value === undefined || value === null || value === '') {
    return { success: false, errors: [`${fieldName} is required`] };
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return { success: false, errors: [`${fieldName} must be a number`] };
  }

  if (!Number.isInteger(parsed)) {
    return { success: false, errors: [`${fieldName} must be an integer`] };
  }

  if (parsed < minValue) {
    return { success: false, errors: [`${fieldName} must be at least ${minValue}`] };
  }

  if (parsed > max) {
    return { success: false, errors: [`${fieldName} must be at most ${max}`] };
  }

  return { success: true, data: parsed };
}

/**
 * Validate optional positive integer
 * Returns undefined if value is not provided, validated number otherwise
 */
export function validateOptionalPositiveInt(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; default?: number } = {}
): ValidationResult<number | undefined> {
  const { min = 1, max = Number.MAX_SAFE_INTEGER } = options;

  if (value === undefined || value === null || value === '') {
    return { success: true, data: options.default };
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return { success: false, errors: [`${fieldName} must be a number`] };
  }

  if (!Number.isInteger(parsed) || parsed < min) {
    return { success: false, errors: [`${fieldName} must be a positive integer`] };
  }

  if (parsed > max) {
    return { success: false, errors: [`${fieldName} must be at most ${max}`] };
  }

  return { success: true, data: parsed };
}

/**
 * Validate MongoDB ObjectId format
 *
 * Does NOT check if the document exists - only validates format.
 *
 * @param value - Value to check
 * @returns true if valid 24-character hex string
 */
export function isValidObjectId(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(value);
}

/**
 * Validate ObjectId with error result
 */
export function validateObjectId(value: unknown, fieldName: string): ValidationResult<string> {
  if (!isValidObjectId(value)) {
    return { success: false, errors: [`${fieldName} must be a valid ID`] };
  }
  return { success: true, data: value };
}

/**
 * Validate enum value against allowed values
 *
 * @param value - Value to validate
 * @param allowedValues - Array of allowed values
 * @param fieldName - Field name for error messages
 * @returns Validated enum value or errors
 *
 * @example
 * const CATEGORIES = ['weapons', 'armor', 'consumables'] as const;
 * const result = validateEnum(req.query.category, CATEGORIES, 'category');
 */
export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string
): ValidationResult<T> {
  if (value === undefined || value === null || value === '') {
    return { success: false, errors: [`${fieldName} is required`] };
  }

  if (typeof value !== 'string') {
    return { success: false, errors: [`${fieldName} must be a string`] };
  }

  if (!allowedValues.includes(value as T)) {
    return {
      success: false,
      errors: [`${fieldName} must be one of: ${allowedValues.join(', ')}`]
    };
  }

  return { success: true, data: value as T };
}

/**
 * Validate optional enum value
 * Returns undefined if not provided, validated value otherwise
 */
export function validateOptionalEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string,
  defaultValue?: T
): ValidationResult<T | undefined> {
  if (value === undefined || value === null || value === '') {
    return { success: true, data: defaultValue };
  }

  if (typeof value !== 'string') {
    return { success: false, errors: [`${fieldName} must be a string`] };
  }

  if (!allowedValues.includes(value as T)) {
    return {
      success: false,
      errors: [`${fieldName} must be one of: ${allowedValues.join(', ')}`]
    };
  }

  return { success: true, data: value as T };
}

/**
 * Validate string with length constraints
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; pattern?: RegExp } = {}
): ValidationResult<string> {
  const { minLength = 0, maxLength = 10000, pattern } = options;

  if (value === undefined || value === null || value === '') {
    if (minLength > 0) {
      return { success: false, errors: [`${fieldName} is required`] };
    }
    return { success: true, data: '' };
  }

  if (typeof value !== 'string') {
    return { success: false, errors: [`${fieldName} must be a string`] };
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return { success: false, errors: [`${fieldName} must be at least ${minLength} characters`] };
  }

  if (trimmed.length > maxLength) {
    return { success: false, errors: [`${fieldName} must be at most ${maxLength} characters`] };
  }

  if (pattern && !pattern.test(trimmed)) {
    return { success: false, errors: [`${fieldName} has invalid format`] };
  }

  return { success: true, data: trimmed };
}

/**
 * Validate boolean value
 */
export function validateBoolean(value: unknown, fieldName: string): ValidationResult<boolean> {
  if (value === undefined || value === null || value === '') {
    return { success: false, errors: [`${fieldName} is required`] };
  }

  // Handle string representations
  if (value === 'true' || value === true || value === 1 || value === '1') {
    return { success: true, data: true };
  }

  if (value === 'false' || value === false || value === 0 || value === '0') {
    return { success: true, data: false };
  }

  return { success: false, errors: [`${fieldName} must be a boolean`] };
}

/**
 * Validate optional boolean
 */
export function validateOptionalBoolean(
  value: unknown,
  fieldName: string,
  defaultValue?: boolean
): ValidationResult<boolean | undefined> {
  if (value === undefined || value === null || value === '') {
    return { success: true, data: defaultValue };
  }

  return validateBoolean(value, fieldName);
}

/**
 * Combine multiple validation results
 * Fails if any validation failed, aggregating all errors
 */
export function combineValidations<T extends Record<string, unknown>>(
  validations: { [K in keyof T]: ValidationResult<T[K]> }
): ValidationResult<T> {
  const errors: string[] = [];
  const data = {} as T;

  for (const [key, result] of Object.entries(validations)) {
    if (!result.success) {
      errors.push(...(result.errors || []));
    } else {
      data[key as keyof T] = result.data as T[keyof T];
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data };
}

export default {
  validatePagination,
  validatePositiveInt,
  validateOptionalPositiveInt,
  isValidObjectId,
  validateObjectId,
  validateEnum,
  validateOptionalEnum,
  validateString,
  validateBoolean,
  validateOptionalBoolean,
  combineValidations,
  validationOk,
  validationFail
};
