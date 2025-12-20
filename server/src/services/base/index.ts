/**
 * Base Services Index
 *
 * Exports all shared infrastructure components for services.
 * All game services should import from here.
 *
 * @example
 * ```typescript
 * import {
 *   BaseService,
 *   SecureRNG,
 *   StateManager,
 *   withLock,
 *   LockKeys,
 *   AuditLogger
 * } from '../base';
 * ```
 */

// Base service class - types
export type { TransactionOptions, TransactionResult } from './BaseService';
// Base service class - values
export { BaseService } from './BaseService';

// Cryptographically secure random number generation
export { SecureRNG } from './SecureRNG';

// Redis-backed state management - types
export type {
  StateOptions,
  BatchStateOptions,
  BatchResult
} from './StateManager';
// Redis-backed state management - values
export {
  StateManager,
  // Pre-configured state managers
  duelStateManager,
  raidStateManager,
  huntingStateManager,
  gamblingStateManager,
  showdownStateManager,
  cosmicStateManager,
  distortionStateManager,
  racingStateManager,
  worldBossStateManager,
  deckStateManager
} from './StateManager';

// Distributed locking - types
export type {
  LockOptions,
  LockResult,
  ReleaseResult
} from './DistributedLock';
// Distributed locking - values
export {
  withLock,
  tryWithLock,
  acquireLock,
  releaseLock,
  isLocked,
  extendLock,
  LockKeys
} from './DistributedLock';

// Audit logging - types
export type {
  SecurityEventParams,
  EconomyEventParams,
  CombatEventParams,
  AuditEventParams
} from './AuditLogger';
// Audit logging - values
export {
  AuditLogger,
  AuditCategory,
  SecurityEvent,
  EconomyEvent,
  CombatEvent,
  SocialEvent,
  ProgressionEvent,
  SystemEvent,
  logSecurityEvent,
  logEconomyEvent,
  logCombatEvent,
  logSocialEvent,
  logProgressionEvent,
  logSystemEvent,
  queryAuditLogs
} from './AuditLogger';
