/**
 * Character Validation Utilities
 *
 * Validation functions for character creation and updates
 */

import { Faction, CHARACTER_VALIDATION, VALIDATION_MESSAGES } from '@desperados/shared';
import { CharacterAppearance } from '../models/Character.model';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Character creation data interface (extended with appearance)
 */
export interface CharacterCreationData {
  name: string;
  faction: Faction;
  appearance: CharacterAppearance;
}

/**
 * Validate character name
 */
export function validateCharacterName(name: string): ValidationResult {
  const errors: string[] = [];

  // Check if name is provided
  if (!name || typeof name !== 'string') {
    errors.push(VALIDATION_MESSAGES.CHARACTER_NAME_REQUIRED);
    return { valid: false, errors };
  }

  // Trim the name
  const trimmedName = name.trim();

  // Check minimum length
  if (trimmedName.length < CHARACTER_VALIDATION.NAME_MIN_LENGTH) {
    errors.push(VALIDATION_MESSAGES.CHARACTER_NAME_TOO_SHORT);
  }

  // Check maximum length
  if (trimmedName.length > CHARACTER_VALIDATION.NAME_MAX_LENGTH) {
    errors.push(VALIDATION_MESSAGES.CHARACTER_NAME_TOO_LONG);
  }

  // Check pattern (alphanumeric, spaces, hyphens, apostrophes)
  if (!CHARACTER_VALIDATION.NAME_PATTERN.test(trimmedName)) {
    errors.push(VALIDATION_MESSAGES.CHARACTER_NAME_INVALID);
  }

  // Check forbidden names (case-insensitive)
  const lowerName = trimmedName.toLowerCase();
  if (CHARACTER_VALIDATION.FORBIDDEN_NAMES.some(forbidden => forbidden.toLowerCase() === lowerName)) {
    errors.push(VALIDATION_MESSAGES.CHARACTER_NAME_FORBIDDEN);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate faction
 */
export function validateFaction(faction: any): ValidationResult {
  const errors: string[] = [];

  if (!faction) {
    errors.push(VALIDATION_MESSAGES.FACTION_REQUIRED);
  } else if (!Object.values(Faction).includes(faction)) {
    errors.push(VALIDATION_MESSAGES.FACTION_INVALID);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate character appearance
 */
export function validateAppearance(appearance: any): ValidationResult {
  const errors: string[] = [];

  if (!appearance || typeof appearance !== 'object') {
    errors.push('Appearance is required');
    return { valid: false, errors };
  }

  // Validate bodyType
  if (!appearance.bodyType || !['male', 'female', 'non-binary'].includes(appearance.bodyType)) {
    errors.push('Invalid body type. Must be: male, female, or non-binary');
  }

  // Validate skinTone (0-10)
  if (
    typeof appearance.skinTone !== 'number' ||
    appearance.skinTone < 0 ||
    appearance.skinTone > 10
  ) {
    errors.push('Skin tone must be a number between 0 and 10');
  }

  // Validate facePreset (0-9)
  if (
    typeof appearance.facePreset !== 'number' ||
    appearance.facePreset < 0 ||
    appearance.facePreset > 9
  ) {
    errors.push('Face preset must be a number between 0 and 9');
  }

  // Validate hairStyle (0-14)
  if (
    typeof appearance.hairStyle !== 'number' ||
    appearance.hairStyle < 0 ||
    appearance.hairStyle > 14
  ) {
    errors.push('Hair style must be a number between 0 and 14');
  }

  // Validate hairColor (0-7)
  if (
    typeof appearance.hairColor !== 'number' ||
    appearance.hairColor < 0 ||
    appearance.hairColor > 7
  ) {
    errors.push('Hair color must be a number between 0 and 7');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate complete character creation data
 */
export function validateCharacterCreation(data: CharacterCreationData): ValidationResult {
  const allErrors: string[] = [];

  // Validate name
  const nameValidation = validateCharacterName(data.name);
  allErrors.push(...nameValidation.errors);

  // Validate faction
  const factionValidation = validateFaction(data.faction);
  allErrors.push(...factionValidation.errors);

  // Validate appearance
  const appearanceValidation = validateAppearance(data.appearance);
  allErrors.push(...appearanceValidation.errors);

  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
}

/**
 * Sanitize character name (trim and normalize)
 */
export function sanitizeCharacterName(name: string): string {
  return name.trim().replace(/\s+/g, ' '); // Normalize multiple spaces to single space
}
