/**
 * AuditLogger - Comprehensive audit logging service
 *
 * Provides structured logging for:
 * - Security events (ownership violations, suspicious activity)
 * - Economy events (gold transfers, purchases, trades)
 * - Game events (combat, duels, quest completion)
 * - Admin actions (already handled by middleware, this provides service-level access)
 *
 * All audit logs are persisted to MongoDB with automatic TTL cleanup.
 */

import mongoose from 'mongoose';
import { AuditLog } from '../../models/AuditLog.model';
import logger from '../../utils/logger';
import { escapeRegex } from '../../utils/stringUtils';

/**
 * Audit event categories
 */
export enum AuditCategory {
  SECURITY = 'SECURITY',
  ECONOMY = 'ECONOMY',
  COMBAT = 'COMBAT',
  SOCIAL = 'SOCIAL',
  PROGRESSION = 'PROGRESSION',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM'
}

/**
 * Security-related audit events
 */
export enum SecurityEvent {
  OWNERSHIP_VIOLATION = 'OWNERSHIP_VIOLATION',
  IDOR_ATTEMPT = 'IDOR_ATTEMPT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  FAILED_LOGIN = 'FAILED_LOGIN',
  ACCOUNT_LOCKOUT = 'ACCOUNT_LOCKOUT',
  TOKEN_INVALIDATED = 'TOKEN_INVALIDATED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  EXPLOIT_ATTEMPT = 'EXPLOIT_ATTEMPT',
  ADMIN_ACTION = 'ADMIN_ACTION'
}

/**
 * Economy-related audit events
 */
export enum EconomyEvent {
  GOLD_TRANSFER = 'GOLD_TRANSFER',
  GOLD_GRANT = 'GOLD_GRANT',
  GOLD_DEDUCT = 'GOLD_DEDUCT',
  ITEM_PURCHASE = 'ITEM_PURCHASE',
  ITEM_SALE = 'ITEM_SALE',
  MARKETPLACE_LISTING = 'MARKETPLACE_LISTING',
  MARKETPLACE_BID = 'MARKETPLACE_BID',
  MARKETPLACE_SALE = 'MARKETPLACE_SALE',
  GANG_DEPOSIT = 'GANG_DEPOSIT',
  GANG_WITHDRAW = 'GANG_WITHDRAW',
  PROPERTY_PURCHASE = 'PROPERTY_PURCHASE',
  TAX_COLLECTED = 'TAX_COLLECTED',
  GAMBLING_BET = 'GAMBLING_BET',
  GAMBLING_PAYOUT = 'GAMBLING_PAYOUT',
  DUEL_WAGER = 'DUEL_WAGER'
}

/**
 * Combat-related audit events
 */
export enum CombatEvent {
  PVE_START = 'PVE_START',
  PVE_END = 'PVE_END',
  PVP_START = 'PVP_START',
  PVP_END = 'PVP_END',
  DUEL_START = 'DUEL_START',
  DUEL_END = 'DUEL_END',
  GANG_WAR_START = 'GANG_WAR_START',
  GANG_WAR_END = 'GANG_WAR_END',
  RAID_START = 'RAID_START',
  RAID_END = 'RAID_END',
  WORLD_BOSS_JOIN = 'WORLD_BOSS_JOIN',
  WORLD_BOSS_END = 'WORLD_BOSS_END'
}

/**
 * Social-related audit events
 */
export enum SocialEvent {
  GANG_CREATE = 'GANG_CREATE',
  GANG_JOIN = 'GANG_JOIN',
  GANG_LEAVE = 'GANG_LEAVE',
  GANG_KICK = 'GANG_KICK',
  GANG_PROMOTE = 'GANG_PROMOTE',
  GANG_DEMOTE = 'GANG_DEMOTE',
  FRIEND_ADD = 'FRIEND_ADD',
  FRIEND_REMOVE = 'FRIEND_REMOVE',
  MAIL_SEND = 'MAIL_SEND',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  REPUTATION_CHANGE = 'REPUTATION_CHANGE'
}

/**
 * Progression-related audit events
 */
export enum ProgressionEvent {
  LEVEL_UP = 'LEVEL_UP',
  SKILL_UP = 'SKILL_UP',
  QUEST_COMPLETE = 'QUEST_COMPLETE',
  ACHIEVEMENT_UNLOCK = 'ACHIEVEMENT_UNLOCK',
  RECIPE_LEARN = 'RECIPE_LEARN',
  ITEM_CRAFT = 'ITEM_CRAFT'
}

/**
 * System-related audit events
 */
export enum SystemEvent {
  JOB_START = 'JOB_START',
  JOB_COMPLETE = 'JOB_COMPLETE',
  JOB_FAIL = 'JOB_FAIL',
  SERVER_START = 'SERVER_START',
  SERVER_STOP = 'SERVER_STOP',
  DATABASE_ERROR = 'DATABASE_ERROR',
  REDIS_ERROR = 'REDIS_ERROR'
}

/**
 * Base parameters for all audit events
 */
export interface AuditEventParams {
  /** User who performed the action */
  userId?: string | mongoose.Types.ObjectId;
  /** Character who performed the action */
  characterId?: string | mongoose.Types.ObjectId;
  /** Target user (if applicable) */
  targetUserId?: string | mongoose.Types.ObjectId;
  /** Target character (if applicable) */
  targetCharacterId?: string | mongoose.Types.ObjectId;
  /** IP address */
  ip?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for security events
 */
export interface SecurityEventParams extends AuditEventParams {
  event: SecurityEvent;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  attemptedResource?: string;
  blockedAction?: string;
}

/**
 * Parameters for economy events
 */
export interface EconomyEventParams extends AuditEventParams {
  event: EconomyEvent;
  amount?: number;
  itemId?: string;
  itemName?: string;
  listingId?: string;
  gangId?: string;
  propertyId?: string;
  beforeBalance?: number;
  afterBalance?: number;
}

/**
 * Parameters for combat events
 */
export interface CombatEventParams extends AuditEventParams {
  event: CombatEvent;
  encounterId?: string;
  opponentId?: string;
  opponentName?: string;
  result?: 'WIN' | 'LOSS' | 'DRAW' | 'FLED';
  damageDealt?: number;
  damageTaken?: number;
  rewards?: Record<string, unknown>;
}

/**
 * Log a security event (high priority, always persisted)
 */
export async function logSecurityEvent(params: SecurityEventParams): Promise<void> {
  const { event, severity = 'MEDIUM', userId, characterId, ip, ...rest } = params;

  // Always log to winston for immediate visibility
  logger.warn(`[SECURITY:${severity}] ${event}`, {
    category: AuditCategory.SECURITY,
    event,
    severity,
    userId: userId?.toString(),
    characterId: characterId?.toString(),
    ip,
    ...rest
  });

  // Persist to database asynchronously (only if userId is available - required for audit logs)
  if (userId) {
    setImmediate(async () => {
      try {
        await AuditLog.create({
          userId: new mongoose.Types.ObjectId(userId.toString()),
          characterId: characterId ? new mongoose.Types.ObjectId(characterId.toString()) : undefined,
          action: `${AuditCategory.SECURITY}:${event}`,
          endpoint: 'INTERNAL',
          method: 'POST',
          ip: ip || 'internal',
          metadata: {
            category: AuditCategory.SECURITY,
            event,
            severity,
            ...rest.metadata,
            attemptedResource: rest.attemptedResource,
            blockedAction: rest.blockedAction
          }
        });
      } catch (error) {
        logger.error('Failed to persist security audit log', { error, event });
      }
    });
  }
}

/**
 * Log an economy event
 */
export async function logEconomyEvent(params: EconomyEventParams): Promise<void> {
  const {
    event,
    userId,
    characterId,
    amount,
    beforeBalance,
    afterBalance,
    ...rest
  } = params;

  // Log to winston
  logger.info(`[ECONOMY] ${event}`, {
    category: AuditCategory.ECONOMY,
    event,
    userId: userId?.toString(),
    characterId: characterId?.toString(),
    amount,
    beforeBalance,
    afterBalance,
    ...rest
  });

  // Persist to database asynchronously (only if userId is available - required for audit logs)
  if (userId) {
    setImmediate(async () => {
      try {
        await AuditLog.create({
          userId: new mongoose.Types.ObjectId(userId.toString()),
          characterId: characterId ? new mongoose.Types.ObjectId(characterId.toString()) : undefined,
          action: `${AuditCategory.ECONOMY}:${event}`,
          endpoint: 'INTERNAL',
          method: 'POST',
          ip: rest.ip || 'internal',
          metadata: {
            category: AuditCategory.ECONOMY,
            event,
            amount,
            beforeBalance,
            afterBalance,
            ...rest.metadata,
          itemId: rest.itemId,
          itemName: rest.itemName,
          listingId: rest.listingId,
          gangId: rest.gangId,
          propertyId: rest.propertyId
        }
      });
    } catch (error) {
      logger.error('Failed to persist economy audit log', { error, event });
    }
    });
  }
}

/**
 * Log a combat event
 */
export async function logCombatEvent(params: CombatEventParams): Promise<void> {
  const { event, userId, characterId, result, ...rest } = params;

  // Log to winston
  logger.info(`[COMBAT] ${event}`, {
    category: AuditCategory.COMBAT,
    event,
    userId: userId?.toString(),
    characterId: characterId?.toString(),
    result,
    ...rest
  });

  // Persist to database asynchronously (combat logs may have shorter retention)
  setImmediate(async () => {
    try {
      await AuditLog.create({
        userId: userId ? new mongoose.Types.ObjectId(userId.toString()) : undefined,
        characterId: characterId ? new mongoose.Types.ObjectId(characterId.toString()) : undefined,
        action: `${AuditCategory.COMBAT}:${event}`,
        endpoint: 'INTERNAL',
        method: 'POST',
        ip: rest.ip || 'internal',
        metadata: {
          category: AuditCategory.COMBAT,
          event,
          result,
          encounterId: rest.encounterId,
          opponentId: rest.opponentId,
          opponentName: rest.opponentName,
          damageDealt: rest.damageDealt,
          damageTaken: rest.damageTaken,
          rewards: rest.rewards,
          ...rest.metadata
        }
      });
    } catch (error) {
      logger.error('Failed to persist combat audit log', { error, event });
    }
  });
}

/**
 * Log a social event
 */
export async function logSocialEvent(
  event: SocialEvent,
  params: AuditEventParams & { gangId?: string; gangName?: string }
): Promise<void> {
  const { userId, characterId, ...rest } = params;

  // Log to winston
  logger.info(`[SOCIAL] ${event}`, {
    category: AuditCategory.SOCIAL,
    event,
    userId: userId?.toString(),
    characterId: characterId?.toString(),
    ...rest
  });

  // Persist to database asynchronously
  setImmediate(async () => {
    try {
      await AuditLog.create({
        userId: userId ? new mongoose.Types.ObjectId(userId.toString()) : undefined,
        characterId: characterId ? new mongoose.Types.ObjectId(characterId.toString()) : undefined,
        action: `${AuditCategory.SOCIAL}:${event}`,
        endpoint: 'INTERNAL',
        method: 'POST',
        ip: rest.ip || 'internal',
        metadata: {
          category: AuditCategory.SOCIAL,
          event,
          gangId: rest.gangId,
          gangName: rest.gangName,
          targetUserId: rest.targetUserId?.toString(),
          targetCharacterId: rest.targetCharacterId?.toString(),
          ...rest.metadata
        }
      });
    } catch (error) {
      logger.error('Failed to persist social audit log', { error, event });
    }
  });
}

/**
 * Log a progression event
 */
export async function logProgressionEvent(
  event: ProgressionEvent,
  params: AuditEventParams & {
    previousLevel?: number;
    newLevel?: number;
    skillId?: string;
    questId?: string;
    achievementId?: string;
    recipeId?: string;
  }
): Promise<void> {
  const { userId, characterId, ...rest } = params;

  // Log to winston
  logger.info(`[PROGRESSION] ${event}`, {
    category: AuditCategory.PROGRESSION,
    event,
    userId: userId?.toString(),
    characterId: characterId?.toString(),
    ...rest
  });

  // Persist to database asynchronously
  setImmediate(async () => {
    try {
      await AuditLog.create({
        userId: userId ? new mongoose.Types.ObjectId(userId.toString()) : undefined,
        characterId: characterId ? new mongoose.Types.ObjectId(characterId.toString()) : undefined,
        action: `${AuditCategory.PROGRESSION}:${event}`,
        endpoint: 'INTERNAL',
        method: 'POST',
        ip: rest.ip || 'internal',
        metadata: {
          category: AuditCategory.PROGRESSION,
          event,
          previousLevel: rest.previousLevel,
          newLevel: rest.newLevel,
          skillId: rest.skillId,
          questId: rest.questId,
          achievementId: rest.achievementId,
          recipeId: rest.recipeId,
          ...rest.metadata
        }
      });
    } catch (error) {
      logger.error('Failed to persist progression audit log', { error, event });
    }
  });
}

/**
 * Log a system event
 */
export async function logSystemEvent(
  event: SystemEvent,
  params: {
    jobName?: string;
    jobId?: string;
    duration?: number;
    error?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const level = event.includes('FAIL') || event.includes('ERROR') ? 'error' : 'info';

  // Log to winston
  logger[level](`[SYSTEM] ${event}`, {
    category: AuditCategory.SYSTEM,
    event,
    ...params
  });

  // System events don't need to be persisted to MongoDB
  // They're already captured by Winston log files
}

/**
 * Query audit logs with filters
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  characterId?: string;
  category?: AuditCategory;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<unknown[]> {
  const query: Record<string, unknown> = {};

  if (filters.userId) {
    query.userId = new mongoose.Types.ObjectId(filters.userId);
  }
  if (filters.characterId) {
    query.characterId = new mongoose.Types.ObjectId(filters.characterId);
  }
  if (filters.category) {
    // SECURITY: Use escapeRegex to prevent NoSQL injection via regex patterns
    query.action = { $regex: `^${escapeRegex(filters.category)}:` };
  }
  if (filters.action) {
    query.action = filters.action;
  }
  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) {
      (query.timestamp as Record<string, Date>).$gte = filters.startDate;
    }
    if (filters.endDate) {
      (query.timestamp as Record<string, Date>).$lte = filters.endDate;
    }
  }

  return AuditLog.find(query)
    .sort({ timestamp: -1 })
    .limit(filters.limit || 100)
    .lean();
}

/**
 * AuditLogger class for use in services
 * Provides a service-specific logger instance
 */
export class AuditLogger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  async security(event: SecurityEvent, params: Omit<SecurityEventParams, 'event'>): Promise<void> {
    return logSecurityEvent({
      ...params,
      event,
      metadata: { ...params.metadata, service: this.serviceName }
    });
  }

  async economy(event: EconomyEvent, params: Omit<EconomyEventParams, 'event'>): Promise<void> {
    return logEconomyEvent({
      ...params,
      event,
      metadata: { ...params.metadata, service: this.serviceName }
    });
  }

  async combat(event: CombatEvent, params: Omit<CombatEventParams, 'event'>): Promise<void> {
    return logCombatEvent({
      ...params,
      event,
      metadata: { ...params.metadata, service: this.serviceName }
    });
  }

  async social(event: SocialEvent, params: AuditEventParams & { gangId?: string; gangName?: string }): Promise<void> {
    return logSocialEvent(event, {
      ...params,
      metadata: { ...params.metadata, service: this.serviceName }
    });
  }

  async progression(
    event: ProgressionEvent,
    params: AuditEventParams & {
      previousLevel?: number;
      newLevel?: number;
      skillId?: string;
      questId?: string;
      achievementId?: string;
      recipeId?: string;
    }
  ): Promise<void> {
    return logProgressionEvent(event, {
      ...params,
      metadata: { ...params.metadata, service: this.serviceName }
    });
  }
}

export default {
  logSecurityEvent,
  logEconomyEvent,
  logCombatEvent,
  logSocialEvent,
  logProgressionEvent,
  logSystemEvent,
  queryAuditLogs,
  AuditLogger,
  // Re-export enums
  AuditCategory,
  SecurityEvent,
  EconomyEvent,
  CombatEvent,
  SocialEvent,
  ProgressionEvent,
  SystemEvent
};
