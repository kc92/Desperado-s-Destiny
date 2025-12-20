/**
 * World Boss Service
 *
 * Manages world boss encounters, spawning, and group coordination
 */

import { ScarProgressModel } from '../models/ScarProgress.model';
import { WORLD_BOSSES, getWorldBoss, getNextBossSpawn } from '../data/worldBosses';
import {
  WorldBoss,
  WorldBossType,
  BossPhase,
  JoinWorldBossRequest,
  JoinWorldBossResponse,
  SCAR_CONSTANTS,
} from '@desperados/shared';
import { worldBossStateManager } from './base/StateManager';
import logger from '../utils/logger';
import { withLock } from '../utils/distributedLock';

/**
 * Active world boss session
 */
interface WorldBossSession {
  bossId: WorldBossType;
  boss: WorldBoss;
  currentHealth: number;
  maxHealth: number;
  currentPhase: number;
  participants: Record<string, ParticipantData>;
  startedAt: Date;
  endsAt: Date;
  status: 'active' | 'completed' | 'failed';
}

/**
 * Participant data
 */
interface ParticipantData {
  characterId: string;
  characterName: string;
  damageDealt: number;
  healingDone: number;
  damageTaken: number;
  joinedAt: Date;
}

/**
 * World Boss Service
 */
export class WorldBossService {
  /**
   * Check if boss is currently spawned
   */
  static async isBossActive(bossId: WorldBossType): Promise<boolean> {
    const session = await worldBossStateManager.get<WorldBossSession>(bossId);
    return session !== null && session.status === 'active';
  }

  /**
   * Spawn a world boss
   */
  static async spawnWorldBoss(bossId: WorldBossType): Promise<WorldBossSession> {
    const boss = getWorldBoss(bossId);
    if (!boss) {
      throw new Error('Boss not found');
    }

    // Check if already active
    if (await this.isBossActive(bossId)) {
      throw new Error('Boss already active');
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + (boss.enrageTimer || 30) * 60 * 1000);

    const session: WorldBossSession = {
      bossId,
      boss,
      currentHealth: boss.health,
      maxHealth: boss.health,
      currentPhase: 1,
      participants: {},
      startedAt: now,
      endsAt,
      status: 'active',
    };

    await worldBossStateManager.set(bossId, session, { ttl: 7200 });

    logger.info(`World Boss spawned: ${boss.name} in ${boss.zone}`);

    return session;
  }

  /**
   * Get active boss session
   */
  static async getActiveSession(bossId: WorldBossType): Promise<WorldBossSession | null> {
    return await worldBossStateManager.get<WorldBossSession>(bossId);
  }

  /**
   * Join world boss fight
   */
  static async joinWorldBoss(
    characterId: string,
    characterName: string,
    request: JoinWorldBossRequest
  ): Promise<JoinWorldBossResponse> {
    const session = await worldBossStateManager.get<WorldBossSession>(request.bossId);

    if (!session) {
      return {
        success: false,
        message: 'Boss is not currently active',
      };
    }

    if (session.status !== 'active') {
      return {
        success: false,
        message: 'Boss encounter has ended',
      };
    }

    // Check max participants
    const participantCount = Object.keys(session.participants).length;
    if (
      session.boss.maxParticipants &&
      participantCount >= session.boss.maxParticipants
    ) {
      return {
        success: false,
        message: 'Boss encounter is full',
      };
    }

    // Add participant
    if (!session.participants[characterId]) {
      session.participants[characterId] = {
        characterId,
        characterName,
        damageDealt: 0,
        healingDone: 0,
        damageTaken: 0,
        joinedAt: new Date(),
      };

      // Update session in Redis
      await worldBossStateManager.set(request.bossId, session, { ttl: 7200 });
    }

    return {
      success: true,
      bossSession: {
        bossId: session.bossId,
        boss: session.boss,
        currentHealth: session.currentHealth,
        maxHealth: session.maxHealth,
        participants: Object.keys(session.participants).length,
        startedAt: session.startedAt,
      },
      message: `Joined fight against ${session.boss.name}`,
    };
  }

  /**
   * Attack world boss
   */
  static async attackWorldBoss(
    characterId: string,
    bossId: WorldBossType,
    damage: number
  ): Promise<{
    success: boolean;
    damageDealt: number;
    bossHealth: number;
    phaseChange?: number;
    defeated?: boolean;
    message: string;
  }> {
    // PHASE 3 FIX: Add distributed lock to prevent race conditions on concurrent attacks
    return withLock(`lock:worldboss:${bossId}`, async () => {
      const session = await worldBossStateManager.get<WorldBossSession>(bossId);

      if (!session || session.status !== 'active') {
        return {
          success: false,
          damageDealt: 0,
          bossHealth: 0,
          message: 'Boss is not active',
        };
      }

      const participant = session.participants[characterId];
      if (!participant) {
        return {
          success: false,
          damageDealt: 0,
          bossHealth: session.currentHealth,
          message: 'Not participating in this fight',
        };
      }

      // Apply damage
      const actualDamage = Math.min(damage, session.currentHealth);
      session.currentHealth -= actualDamage;
      participant.damageDealt += actualDamage;

      // Check for phase change
      const healthPercent = (session.currentHealth / session.maxHealth) * 100;
      const currentPhaseData = session.boss.phases.find(p => p.phase === session.currentPhase);
      const nextPhase = session.boss.phases.find(
        p => p.phase === session.currentPhase + 1 && healthPercent <= p.healthThreshold
      );

      let phaseChange: number | undefined;
      if (nextPhase) {
        session.currentPhase = nextPhase.phase;
        phaseChange = nextPhase.phase;
        logger.info(
          `${session.boss.name} entered phase ${nextPhase.phase}: ${nextPhase.name}`
        );
      }

      // Check for defeat
      if (session.currentHealth <= 0) {
        session.status = 'completed';
        await worldBossStateManager.set(bossId, session, { ttl: 7200 });
        await this.completeBossFight(bossId, true);

        return {
          success: true,
          damageDealt: actualDamage,
          bossHealth: 0,
          defeated: true,
          message: `${session.boss.name} has been defeated!`,
        };
      }

      // Update session in Redis
      await worldBossStateManager.set(bossId, session, { ttl: 7200 });

      return {
        success: true,
        damageDealt: actualDamage,
        bossHealth: session.currentHealth,
        phaseChange,
        message: phaseChange
          ? `Phase ${phaseChange}: ${nextPhase?.name}`
          : 'Attack successful',
      };
    }, { ttl: 30, retries: 10 });
  }

  /**
   * Complete boss fight (victory or failure)
   */
  private static async completeBossFight(
    bossId: WorldBossType,
    victory: boolean
  ): Promise<void> {
    const session = await worldBossStateManager.get<WorldBossSession>(bossId);
    if (!session) return;

    session.status = victory ? 'completed' : 'failed';
    await worldBossStateManager.set(bossId, session, { ttl: 7200 });

    if (victory) {
      // Distribute rewards to participants
      await this.distributeRewards(session);
    }

    // Clean up after 5 minutes
    setTimeout(async () => {
      await worldBossStateManager.delete(bossId);
    }, 5 * 60 * 1000);
  }

  /**
   * Distribute rewards to participants
   */
  private static async distributeRewards(session: WorldBossSession): Promise<void> {
    const { boss, participants } = session;

    // Sort participants by contribution
    const sortedParticipants = Object.values(participants).sort(
      (a, b) => b.damageDealt - a.damageDealt
    );

    for (const participant of sortedParticipants) {
      const contributionPercent =
        (participant.damageDealt / session.maxHealth) * 100;

      // Check minimum contribution
      if (contributionPercent < boss.damageContributionRequired) {
        continue;
      }

      const progress = await ScarProgressModel.findOrCreate(participant.characterId);

      // Award reputation
      await progress.addReputation(SCAR_CONSTANTS.WORLD_BOSS_REPUTATION_BONUS);

      // Record boss defeat
      await progress.recordWorldBossDefeat(session.bossId, participant.damageDealt);

      // Award loot (simplified - would integrate with inventory system)
      logger.info(
        `Awarded rewards to ${participant.characterName} for defeating ${boss.name}`
      );
    }

    // Award first kill bonus if applicable
    if (boss.firstKillBonus) {
      const topParticipant = sortedParticipants[0];
      if (topParticipant) {
        const progress = await ScarProgressModel.findOrCreate(topParticipant.characterId);
        // Access as object (Mongoose stores Maps as objects)
        const bossesMap = progress.worldBossesDefeated as any;
        const bossRecord = bossesMap instanceof Map
          ? bossesMap.get(session.bossId)
          : bossesMap[session.bossId];

        if (bossRecord && bossRecord.count === 1) {
          // First kill
          if (boss.firstKillBonus.title) {
            progress.titles.push(boss.firstKillBonus.title);
            await progress.save();
          }
          logger.info(
            `First kill bonus awarded to ${topParticipant.characterName}!`
          );
        }
      }
    }
  }

  /**
   * Check for enrage timer
   */
  static async checkEnrageTimer(bossId: WorldBossType): Promise<void> {
    const session = await worldBossStateManager.get<WorldBossSession>(bossId);
    if (!session || session.status !== 'active') return;

    const now = new Date();
    if (now >= session.endsAt) {
      logger.info(`${session.boss.name} enraged! Encounter failed.`);
      await this.completeBossFight(bossId, false);
    }
  }

  /**
   * Get next boss spawn time
   */
  static getNextSpawnTime(bossId: WorldBossType): Date | null {
    return getNextBossSpawn(bossId);
  }

  /**
   * Get all scheduled boss spawns
   */
  static async getAllScheduledSpawns(): Promise<Array<{
    bossId: WorldBossType;
    bossName: string;
    nextSpawn: Date | null;
    isActive: boolean;
  }>> {
    const spawns = await Promise.all(
      Object.values(WorldBossType).map(async bossId => {
        const boss = getWorldBoss(bossId);
        return {
          bossId,
          bossName: boss?.name || 'Unknown',
          nextSpawn: this.getNextSpawnTime(bossId),
          isActive: await this.isBossActive(bossId),
        };
      })
    );
    return spawns;
  }

  /**
   * Get session participant data
   */
  static async getParticipantData(
    bossId: WorldBossType,
    characterId: string
  ): Promise<ParticipantData | undefined> {
    const session = await worldBossStateManager.get<WorldBossSession>(bossId);
    return session?.participants[characterId];
  }

  /**
   * Get session leaderboard
   */
  static async getSessionLeaderboard(bossId: WorldBossType): Promise<ParticipantData[]> {
    const session = await worldBossStateManager.get<WorldBossSession>(bossId);
    if (!session) return [];

    return Object.values(session.participants).sort(
      (a, b) => b.damageDealt - a.damageDealt
    );
  }

  /**
   * Manually end boss session (admin function)
   */
  static async endBossSession(bossId: WorldBossType, victory: boolean): Promise<void> {
    await this.completeBossFight(bossId, victory);
  }

  /**
   * Get boss status
   */
  static async getBossStatus(bossId: WorldBossType): Promise<{
    isActive: boolean;
    session?: WorldBossSession;
    nextSpawn?: Date | null;
  }> {
    const session = await worldBossStateManager.get<WorldBossSession>(bossId);
    return {
      isActive: await this.isBossActive(bossId),
      session: session?.status === 'active' ? session : undefined,
      nextSpawn: !session ? this.getNextSpawnTime(bossId) : undefined,
    };
  }
}

/**
 * Background job to check enrage timers
 */
setInterval(() => {
  for (const bossId of Object.values(WorldBossType)) {
    WorldBossService.checkEnrageTimer(bossId);
  }
}, 60 * 1000); // Check every minute
