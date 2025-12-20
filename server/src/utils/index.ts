/**
 * Utils Barrel Export
 *
 * Centralized exports for all utility modules.
 * Import from here instead of individual files for cleaner imports.
 *
 * @example
 * import { escapeRegex, validatePagination, wrapSocketHandler } from '../utils';
 */

// String utilities - Phase 0 Foundation
export {
  escapeRegex,
  createExactMatchRegex,
  createContainsRegex,
  truncate,
  sanitizeDisplayString,
  normalizeWhitespace,
  isBlank
} from './stringUtils';

// Validation utilities - Phase 0 Foundation
export type { ValidationResult, PaginationParams } from './validation';
export {
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
} from './validation';

// Socket handler utilities - Phase 0 Foundation
export {
  wrapSocketHandler,
  IdempotencyTracker,
  duelIdempotency,
  goldIdempotency,
  createRequiredFieldsValidator
} from './socketHandlerWrapper';

// Transaction utilities
export type { TransactionOptions } from './transaction.helper';
export {
  areTransactionsDisabled,
  startSession,
  withTransaction,
  withSession,
  withTransactionBatch,
  withGoldTransaction,
  withLockAndTransaction
} from './transaction.helper';

// Distributed lock utilities
export {
  acquireLock,
  acquireLockWithRetry,
  releaseLock,
  withLock,
  goldLockKey,
  duelChallengeLockKey
} from './distributedLock';

// Error utilities
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DuplicateError,
  RateLimitError,
  InsufficientEnergyError,
  ServiceUnavailableError,
  sanitizeErrorMessage
} from './errors';

// Logger
export { default as logger } from './logger';

// Type guards
export * from './typeGuards';
