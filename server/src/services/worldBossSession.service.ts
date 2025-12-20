/**
 * World Boss Session Service
 * Manages persistent world boss fight state
 * Integrates with world boss system for crash-safety
 */

import mongoose, { ClientSession } from 'mongoose';
import { WorldBossSession, IWorldBossSession, WorldBossType, ParticipantData } from '../models/WorldBossSession.model';
import logger from '../utils/logger';

// =============================================================================
// SERVICE
// =============================================================================

export class WorldBossSessionService {
  static readonly SESSION_DURATION_HOURS = 1; // Boss fights last max 1 hour

  /**
   * Create a new world boss session
   *
   * @param bossId - Boss type
   * @param maxHealth - Boss max HP
   * @param session - Optional MongoDB session for transactions
   * @returns Created boss session
   */
  static async createSession(
    bossId: WorldBossType,
    maxHealth: number,
    session?: ClientSession
  ): Promise<IWorldBossSession> {
    const now = new Date();
    const endsAt = new Date(now.getTime() + this.SESSION_DURATION_HOURS * 60 * 60 * 1000);
    const expiresAt = new Date(endsAt.getTime() + 60 * 60 * 1000); // +1 hour buffer for cleanup

    const bossSession = new WorldBossSession({
      bossId,
      currentHealth: maxHealth,
      maxHealth,
      currentPhase: 1,
      participants: [],
      startedAt: now,
      endsAt,
      expiresAt,
      status: 'active',
    });

    if (session) {
      await bossSession.save({ session });
    } else {
      await bossSession.save();
    }

    logger.info(`Created world boss session: ${bossId} with ${maxHealth} HP`);

    return bossSession;
  }

  /**
   * Load world boss session
   *
   * @param bossId - Boss type
   * @param session - Optional MongoDB session
   * @returns Boss session or null if not found
   */
  static async loadSession(
    bossId: WorldBossType,
    session?: ClientSession
  ): Promise<IWorldBossSession | null> {
    const query = WorldBossSession.findOne({ bossId, status: 'active' });

    if (session) {
      return query.session(session);
    }

    return query;
  }

  /**
   * Save world boss session state
   *
   * @param bossSession - Boss session to save
   * @param mongoSession - Optional MongoDB session for transactions
   */
  static async saveSession(
    bossSession: IWorldBossSession,
    mongoSession?: ClientSession
  ): Promise<void> {
    if (mongoSession) {
      await bossSession.save({ session: mongoSession });
    } else {
      await bossSession.save();
    }

    logger.debug(`Saved world boss session: ${bossSession.bossId}`);
  }

  /**
   * Add participant to boss fight
   *
   * @param bossSession - Boss session
   * @param characterId - Character ID
   * @param characterName - Character name
   * @param mongoSession - Optional MongoDB session
   */
  static async addParticipant(
    bossSession: IWorldBossSession,
    characterId: string,
    characterName: string,
    mongoSession?: ClientSession
  ): Promise<void> {
    // Check if already participating
    const existing = bossSession.participants.find((p) => p.characterId === characterId);

    if (existing) {
      existing.lastActionAt = new Date();
    } else {
      const participant: ParticipantData = {
        characterId,
        characterName,
        damageDealt: 0,
        healingDone: 0,
        damageTaken: 0,
        joinedAt: new Date(),
        lastActionAt: new Date(),
      };

      bossSession.participants.push(participant);
    }

    await this.saveSession(bossSession, mongoSession);

    logger.info(`${characterName} joined world boss fight: ${bossSession.bossId}`);
  }

  /**
   * Record damage dealt by participant
   *
   * @param bossSession - Boss session
   * @param characterId - Character ID
   * @param damage - Damage amount
   * @param mongoSession - Optional MongoDB session
   */
  static async recordDamage(
    bossSession: IWorldBossSession,
    characterId: string,
    damage: number,
    mongoSession?: ClientSession
  ): Promise<void> {
    const participant = bossSession.participants.find((p) => p.characterId === characterId);

    if (!participant) {
      throw new Error('Participant not found in boss fight');
    }

    participant.damageDealt += damage;
    participant.lastActionAt = new Date();

    // Apply damage to boss
    bossSession.currentHealth = Math.max(0, bossSession.currentHealth - damage);

    // Check if boss defeated
    if (bossSession.currentHealth <= 0) {
      bossSession.status = 'completed';
    }

    await this.saveSession(bossSession, mongoSession);

    logger.debug(`${characterId} dealt ${damage} damage to ${bossSession.bossId} (${bossSession.currentHealth}/${bossSession.maxHealth} HP remaining)`);
  }

  /**
   * Complete boss session (mark as completed)
   *
   * @param bossSession - Boss session
   * @param mongoSession - Optional MongoDB session
   */
  static async completeSession(
    bossSession: IWorldBossSession,
    mongoSession?: ClientSession
  ): Promise<void> {
    bossSession.status = 'completed';
    await this.saveSession(bossSession, mongoSession);

    logger.info(`World boss session completed: ${bossSession.bossId}`);
  }

  /**
   * Fail boss session (timeout or abandoned)
   *
   * @param bossSession - Boss session
   * @param mongoSession - Optional MongoDB session
   */
  static async failSession(
    bossSession: IWorldBossSession,
    mongoSession?: ClientSession
  ): Promise<void> {
    bossSession.status = 'failed';
    await this.saveSession(bossSession, mongoSession);

    logger.info(`World boss session failed: ${bossSession.bossId}`);
  }

  /**
   * Get top damage dealers for a boss fight
   *
   * @param bossSession - Boss session
   * @param limit - Number of top players to return
   * @returns Sorted array of participants by damage dealt
   */
  static getTopDamageDealers(
    bossSession: IWorldBossSession,
    limit: number = 10
  ): ParticipantData[] {
    return [...bossSession.participants]
      .sort((a, b) => b.damageDealt - a.damageDealt)
      .slice(0, limit);
  }

  /**
   * Get all active boss sessions
   *
   * @returns Array of active boss sessions
   */
  static async getActiveSessions(): Promise<IWorldBossSession[]> {
    return WorldBossSession.find({
      status: 'active',
      expiresAt: { $gt: new Date() },
    });
  }

  /**
   * Clean up expired or completed boss sessions
   *
   * @returns Number of sessions deleted
   */
  static async cleanupOldSessions(): Promise<number> {
    const result = await WorldBossSession.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { status: { $in: ['completed', 'failed'] }, startedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} old world boss sessions`);
    }

    return result.deletedCount;
  }

  /**
   * Restore active boss sessions on server startup
   *
   * @returns Array of active boss sessions
   */
  static async restoreActiveSessions(): Promise<IWorldBossSession[]> {
    const sessions = await this.getActiveSessions();

    logger.info(`Restored ${sessions.length} active world boss sessions after server restart`);

    return sessions;
  }
}
