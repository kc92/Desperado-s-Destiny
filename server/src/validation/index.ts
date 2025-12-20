/**
 * Validation Index
 *
 * Central export point for all validation utilities.
 *
 * @example
 * ```typescript
 * import {
 *   validate,
 *   validateObjectId,
 *   CharacterSchemas,
 *   GangSchemas
 * } from '../validation';
 *
 * router.post('/characters',
 *   validate(CharacterSchemas.create),
 *   createCharacterController
 * );
 * ```
 */

// Type exports from validators (required for isolatedModules)
export type {
  ValidationResult,
  ValidationError,
  ValidatorFn
} from './validators';

// Value exports from validators
export {
  // Primitive validators
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
  // String format validators
  objectId,
  email,
  url,
  alphanumeric,
  sanitized,
  // Domain-specific validators
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
} from './validators';

// Type exports from middleware (required for isolatedModules)
export type {
  ValidationSchema,
  FieldValidator,
  ValidationOptions
} from './middleware';

// Value exports from middleware
export {
  validate,
  validateObjectId,
  validateBody,
  CommonSchemas
} from './middleware';

// Pre-defined schemas (all values)
export {
  AuthSchemas,
  CharacterSchemas,
  GangSchemas,
  MarketplaceSchemas,
  DuelSchemas,
  GamblingSchemas,
  CombatSchemas,
  QuestSchemas,
  GoldSchemas,
  ChatSchemas,
  PropertySchemas,
  HuntingSchemas,
  AdminSchemas,
  SkillSchemas
} from './schemas';
