/**
 * Type Guards and Assertions
 * Helper functions for TypeScript type safety
 */

import { Types } from 'mongoose';

/**
 * Assert that a value is defined (not null or undefined)
 * @throws Error if value is null or undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string = 'Value is required'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Check if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Convert unknown to string safely
 */
export function toStringOrThrow(value: unknown, fieldName: string = 'Field'): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} is required`);
  }
  if (typeof value === 'object' && 'toString' in value) {
    return value.toString();
  }
  return String(value);
}

/**
 * Convert unknown to ObjectId safely
 */
export function toObjectId(value: unknown): Types.ObjectId {
  if (value instanceof Types.ObjectId) {
    return value;
  }
  if (typeof value === 'string') {
    return new Types.ObjectId(value);
  }
  if (value && typeof value === 'object' && '_id' in value) {
    return toObjectId((value as any)._id);
  }
  throw new Error('Invalid ObjectId');
}

/**
 * Safe string conversion (returns empty string if undefined)
 */
export function toStringSafe(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

/**
 * Assert string is not empty
 */
export function assertNonEmptyString(
  value: string | undefined,
  fieldName: string = 'Field'
): asserts value is string {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

export default {
  assertDefined,
  isDefined,
  toStringOrThrow,
  toObjectId,
  toStringSafe,
  assertNonEmptyString,
};
