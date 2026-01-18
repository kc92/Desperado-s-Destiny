/**
 * Validation Middleware
 *
 * Express middleware for validating request data.
 * Integrates with the validation system to provide automatic request validation.
 */

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { ValidationResult, ValidationError } from './validators';
import { ValidationError as AppValidationError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Schema definition for request validation
 */
export interface ValidationSchema {
  body?: Record<string, FieldValidator>;
  params?: Record<string, FieldValidator>;
  query?: Record<string, FieldValidator>;
}

/**
 * Field validator definition
 */
export interface FieldValidator {
  /** Is field required? */
  required?: boolean;
  /** Field type */
  type?: 'string' | 'number' | 'boolean' | 'objectId' | 'array' | 'object';
  /** Custom validator function */
  validate?: (value: unknown, field: string) => ValidationResult;
  /** Transform before validation */
  transform?: (value: unknown) => unknown;
  /** Default value if not provided */
  default?: unknown;
  /** Minimum value/length */
  min?: number;
  /** Maximum value/length */
  max?: number;
  /** Pattern for strings */
  pattern?: RegExp;
  /** Allowed values */
  enum?: readonly unknown[];
  /** Custom error message */
  message?: string;
}

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Strip unknown fields from body */
  stripUnknown?: boolean;
  /** Allow extra fields in body */
  allowUnknown?: boolean;
  /** Log validation errors */
  logErrors?: boolean;
}

/**
 * Create validation middleware from schema
 *
 * @param schema - Validation schema
 * @param options - Validation options
 * @returns Express middleware
 *
 * @example
 * ```typescript
 * router.post('/characters',
 *   validate({
 *     body: {
 *       name: { required: true, type: 'string', min: 3, max: 20 },
 *       faction: { required: true, type: 'string', enum: ['settler', 'nahi', 'frontera'] }
 *     }
 *   }),
 *   createCharacterController
 * );
 * ```
 */
export function validate(schema: ValidationSchema, options: ValidationOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  const { stripUnknown = false, allowUnknown = true, logErrors = true } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];

    // Validate body
    if (schema.body && req.body) {
      const bodyErrors = validateFields(req.body, schema.body, 'body');
      errors.push(...bodyErrors);

      if (stripUnknown) {
        req.body = stripUnknownFields(req.body, schema.body);
      }
    }

    // Validate params
    if (schema.params && req.params) {
      const paramErrors = validateFields(req.params, schema.params, 'params');
      errors.push(...paramErrors);
    }

    // Validate query
    if (schema.query && req.query) {
      // Coerce query string values to proper types
      const coercedQuery = coerceQueryTypes(req.query as Record<string, string>, schema.query);
      const queryErrors = validateFields(coercedQuery, schema.query, 'query');
      errors.push(...queryErrors);

      // Update req.query with coerced values
      Object.assign(req.query, coercedQuery);
    }

    if (errors.length > 0) {
      if (logErrors) {
        logger.debug('[Validation] Request validation failed', {
          path: req.path,
          method: req.method,
          errors: errors.map(e => ({ field: e.field, message: e.message }))
        });
      }

      const fieldErrors: Record<string, string[]> = {};
      for (const err of errors) {
        if (!fieldErrors[err.field]) {
          fieldErrors[err.field] = [];
        }
        fieldErrors[err.field].push(err.message);
      }

      throw new AppValidationError('Validation failed', fieldErrors);
    }

    next();
  };
}

/**
 * Validate fields against schema
 */
function validateFields(
  data: Record<string, unknown>,
  schema: Record<string, FieldValidator>,
  source: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    let value = data[field];
    const fieldPath = `${source}.${field}`;

    // Apply transform if provided
    if (validator.transform && value !== undefined) {
      value = validator.transform(value);
      data[field] = value;
    }

    // Apply default if value is undefined
    if (value === undefined && validator.default !== undefined) {
      value = validator.default;
      data[field] = value;
    }

    // Check required
    if (validator.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: fieldPath,
        message: validator.message || `${field} is required`
      });
      continue;
    }

    // Skip validation if not required and not provided
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    if (validator.type) {
      const typeError = validateType(value, validator.type, fieldPath, validator.message);
      if (typeError) {
        errors.push(typeError);
        continue;
      }
    }

    // ObjectId validation
    if (validator.type === 'objectId') {
      if (!Types.ObjectId.isValid(value as string)) {
        errors.push({
          field: fieldPath,
          message: validator.message || `${field} must be a valid ID`
        });
        continue;
      }
    }

    // Min/max validation
    if (validator.type === 'number' && typeof value === 'number') {
      if (validator.min !== undefined && value < validator.min) {
        errors.push({
          field: fieldPath,
          message: validator.message || `${field} must be at least ${validator.min}`
        });
      }
      if (validator.max !== undefined && value > validator.max) {
        errors.push({
          field: fieldPath,
          message: validator.message || `${field} must be at most ${validator.max}`
        });
      }
    }

    // String length validation
    if (validator.type === 'string' && typeof value === 'string') {
      if (validator.min !== undefined && value.length < validator.min) {
        errors.push({
          field: fieldPath,
          message: validator.message || `${field} must be at least ${validator.min} characters`
        });
      }
      if (validator.max !== undefined && value.length > validator.max) {
        errors.push({
          field: fieldPath,
          message: validator.message || `${field} must be at most ${validator.max} characters`
        });
      }
    }

    // Pattern validation
    if (validator.pattern && typeof value === 'string') {
      if (!validator.pattern.test(value)) {
        errors.push({
          field: fieldPath,
          message: validator.message || `${field} has invalid format`
        });
      }
    }

    // Enum validation
    if (validator.enum) {
      if (!validator.enum.includes(value)) {
        errors.push({
          field: fieldPath,
          message: validator.message || `${field} must be one of: ${validator.enum.join(', ')}`
        });
      }
    }

    // Custom validator
    if (validator.validate) {
      const result = validator.validate(value, field);
      if (!result.valid) {
        errors.push(...result.errors.map(e => ({ ...e, field: fieldPath })));
      }
    }
  }

  return errors;
}

/**
 * Validate value type
 */
function validateType(
  value: unknown,
  type: string,
  field: string,
  customMessage?: string
): ValidationError | null {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return { field, message: customMessage || `${field} must be a string` };
      }
      break;
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return { field, message: customMessage || `${field} must be a number` };
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        return { field, message: customMessage || `${field} must be a boolean` };
      }
      break;
    case 'objectId':
      if (typeof value !== 'string') {
        return { field, message: customMessage || `${field} must be a string` };
      }
      break;
    case 'array':
      if (!Array.isArray(value)) {
        return { field, message: customMessage || `${field} must be an array` };
      }
      break;
    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { field, message: customMessage || `${field} must be an object` };
      }
      break;
  }
  return null;
}

/**
 * Coerce query string values to proper types
 */
function coerceQueryTypes(
  query: Record<string, string>,
  schema: Record<string, FieldValidator>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...query };

  for (const [field, validator] of Object.entries(schema)) {
    const value = query[field];
    if (value === undefined) continue;

    switch (validator.type) {
      case 'number':
        const num = Number(value);
        if (!isNaN(num)) {
          result[field] = num;
        }
        break;
      case 'boolean':
        result[field] = value === 'true' || value === '1';
        break;
      case 'array':
        // Handle comma-separated values
        if (typeof value === 'string') {
          result[field] = value.split(',').map(v => v.trim());
        }
        break;
    }
  }

  return result;
}

/**
 * Strip unknown fields from object
 */
function stripUnknownFields(
  data: Record<string, unknown>,
  schema: Record<string, FieldValidator>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(schema)) {
    if (data[key] !== undefined) {
      result[key] = data[key];
    }
  }
  return result;
}

// ============================================
// PRE-BUILT VALIDATION SCHEMAS
// ============================================

/**
 * Common validation schemas for reuse
 */
export const CommonSchemas = {
  /** ObjectId in params */
  objectIdParam: (paramName: string = 'id'): ValidationSchema => ({
    params: {
      [paramName]: { required: true, type: 'objectId' }
    }
  }),

  /** Pagination query params */
  pagination: (): ValidationSchema => ({
    query: {
      page: { type: 'number', min: 1, default: 1 },
      limit: { type: 'number', min: 1, max: 100, default: 20 }
    }
  }),

  /** Character ID in params */
  characterIdParam: (): ValidationSchema => ({
    params: {
      characterId: { required: true, type: 'objectId' }
    }
  }),

  /** Gold amount in body */
  goldAmount: (fieldName: string = 'amount'): ValidationSchema => ({
    body: {
      [fieldName]: {
        required: true,
        type: 'number',
        min: 1,
        max: 2_147_483_647,
        message: 'Amount must be a positive integer'
      }
    }
  })
};

/**
 * Validate ObjectId middleware
 * Simple middleware to validate a single ObjectId param
 */
export function validateObjectId(paramName: string = 'id'): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];

    if (!value) {
      throw new AppValidationError(`${paramName} is required`);
    }

    if (!Types.ObjectId.isValid(value)) {
      throw new AppValidationError(`Invalid ${paramName} format`);
    }

    next();
  };
}

/**
 * Validate request body has expected fields
 */
export function validateBody(...requiredFields: string[]): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      const fieldErrors: Record<string, string[]> = {};
      for (const field of missing) {
        fieldErrors[field] = [`${field} is required`];
      }
      throw new AppValidationError('Missing required fields', fieldErrors);
    }

    next();
  };
}

export default {
  validate,
  validateObjectId,
  validateBody,
  CommonSchemas
};
