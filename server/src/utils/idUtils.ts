/**
 * ObjectId Utility Functions
 * Provides type-safe utilities for working with MongoDB ObjectIds
 * Eliminates the need for "as any" casts when comparing or converting IDs
 */

import { Types } from 'mongoose';

/**
 * Type representing an ID that can be either a string or ObjectId
 */
export type IdLike = string | Types.ObjectId;

/**
 * Convert a string or ObjectId to ObjectId
 * @param id - String or ObjectId to convert
 * @returns ObjectId instance
 */
export function toObjectId(id: IdLike): Types.ObjectId {
  if (typeof id === 'string') {
    return new Types.ObjectId(id);
  }
  return id;
}

/**
 * Convert a string or ObjectId to string
 * @param id - String or ObjectId to convert
 * @returns String representation of the ID
 */
export function idToString(id: IdLike): string {
  if (typeof id === 'string') {
    return id;
  }
  return id.toString();
}

/**
 * Check if two IDs are equal (handles string/ObjectId comparison)
 * @param a - First ID
 * @param b - Second ID
 * @returns True if IDs are equal
 */
export function idEquals(a: IdLike | null | undefined, b: IdLike | null | undefined): boolean {
  if (a === null || a === undefined || b === null || b === undefined) {
    return a === b;
  }
  return idToString(a) === idToString(b);
}

/**
 * Check if an ID is valid ObjectId format
 * @param id - ID to validate
 * @returns True if valid ObjectId format
 */
export function isValidObjectId(id: unknown): id is IdLike {
  if (typeof id === 'string') {
    return Types.ObjectId.isValid(id);
  }
  if (id instanceof Types.ObjectId) {
    return true;
  }
  return false;
}

/**
 * Safely get string ID from an object that might have _id or id property
 * Common pattern when dealing with Mongoose documents vs plain objects
 * @param obj - Object that might have _id or id
 * @returns String ID or null
 */
export function getIdString(obj: { _id?: IdLike; id?: IdLike } | null | undefined): string | null {
  if (!obj) return null;
  const id = obj._id ?? obj.id;
  if (!id) return null;
  return idToString(id);
}

/**
 * Compare array of IDs for inclusion
 * @param arr - Array of IDs to search
 * @param id - ID to find
 * @returns True if ID is in array
 */
export function idArrayIncludes(arr: IdLike[], id: IdLike): boolean {
  const idStr = idToString(id);
  return arr.some(item => idToString(item) === idStr);
}

/**
 * Filter array to remove duplicates by ID
 * @param arr - Array of objects with IDs
 * @param getId - Function to extract ID from object
 * @returns Array with unique IDs
 */
export function uniqueById<T>(arr: T[], getId: (item: T) => IdLike): T[] {
  const seen = new Set<string>();
  return arr.filter(item => {
    const id = idToString(getId(item));
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
