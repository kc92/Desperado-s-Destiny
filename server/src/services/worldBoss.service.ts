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

/**
 * Active world boss session
 */
interface WorldBossSession {
  bossId: WorldBossType;
  boss: WorldBoss;
  currentHealth: number;
  maxHealth: number;
  currentPhase: number;
  participants: Map<string, ParticipantData>;
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
  private static activeSessions: Map<WorldBossType, WorldBossSession> = new Map();

  /**
   * Check if boss is currently spawned
   */
  static isBossActive(bossId: WorldBossType): boolean {
    const session = this.activeSessions.get(bossId);
    return session !== undefined && session.status === 'active';
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
    if (this.isBossActive(bossId)) {
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
      participants: new Map(),
      startedAt: now,
      endsAt,
      status: 'active',
    };

    this.activeSessions.set(bossId, session);

    console.log(`World Boss spawned: ${boss.name} in ${boss.zone}`);

    return session;
  }

  /**
   * Get active boss session
   */
  static getActiveSession(bossId: WorldBossType): WorldBossSession | undefined {
    return this.activeSessions.get(bossId);
  }

  /**
   * Join world boss fight
   */
  static async joinWorldBoss(
    characterId: string,
    characterName: string,
    request: JoinWorldBossRequest
  ): Promise<JoinWorldBossResponse> {
    const session = this.activeSessions.get(request.bossId);

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
    if (
      session.boss.maxParticipants &&
      session.participants.size >= session.boss.maxParticipants
    ) {
      return {
        success: false,
        message: 'Boss encounter is full',
      };
    }

    // Add participant
    if (!session.participants.has(characterId)) {
      session.participants.set(characterId, {
        characterId,
        characterName,
        damageDealt: 0,
        healingDone: 0,
        damageTaken: 0,
        joinedAt: new Date(),
      });
    }

    return {
      success: true,
      bossSession: {
        bossId: session.bossId,
        boss: session.boss,
        currentHealth: session.currentHealth,
        maxHealth: session.maxHealth,
        participants: session.participants.size,
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
    const session = this.activeSessions.get(bossId);

    if (!session || session.status !== 'active') {
      return {
        success: false,
        damageDealt: 0,
        bossHealth: 0,
        message: 'Boss is not active',
      };
    }

    const participant = session.participants.get(characterId);
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
      console.log(
        `${session.boss.name} entered phase ${nextPhase.phase}: ${nextPhase.name}`
      );
    }

    // Check for defeat
    if (session.currentHealth <= 0) {
      session.status = 'completed';
      await this.completeBossFight(bossId, true);

      return {
        success: true,
        damageDealt: actualDamage,
        bossHealth: 0,
        defeated: true,
        message: `${session.boss.name} has been defeated!`,
      };
    }

    return {
      success: true,
      damageDealt: actualDamage,
      bossHealth: session.currentHealth,
      phaseChange,
      message: phaseChange
        ? `Phase ${phaseChange}: ${nextPhase?.name}`
        : 'Attack successful',
    };
  }

  /**
   * Complete boss fight (victory or failure)
   */
  private static async completeBossFight(
    bossId: WorldBossType,
    victory: boolean
  ): Promise<void> {
    const session = this.activeSessions.get(bossId);
    if (!session) return;

    session.status = victory ? 'completed' : 'failed';

    if (victory) {
      // Distribute rewards to participants
      await this.distributeRewards(session);
    }

    // Clean up after 5 minutes
    setTimeout(() => {
      this.activeSessions.delete(bossId);
    }, 5 * 60 * 1000);
  }

  /**
   * Distribute rewards to participants
   */
  private static async distributeRewards(session: WorldBossSession): Promise<void> {
    const { boss, participants } = session;

    // Sort participants by contribution
    const sortedParticipants = Array.from(participants.values()).sort(
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
      console.log(
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
          console.log(
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
    const session = this.activeSessions.get(bossId);
    if (!session || session.status !== 'active') return;

    const now = new Date();
    if (now >= session.endsAt) {
      console.log(`${session.boss.name} enraged! Encounter failed.`);
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
  static getAllScheduledSpawns(): Array<{
    bossId: WorldBossType;
    bossName: string;
    nextSpawn: Date | null;
    isActive: boolean;
  }> {
    return Object.values(WorldBossType).map(bossId => {
      const boss = getWorldBoss(bossId);
      return {
        bossId,
        bossName: boss?.name || 'Unknown',
        nextSpawn: this.getNextSpawnTime(bossId),
        isActive: this.isBossActive(bossId),
      };
    });
  }

  /**
   * Get session participant data
   */
  static getParticipantData(
    bossId: WorldBossType,
    characterId: string
  ): ParticipantData | undefined {
    const session = this.activeSessions.get(bossId);
    return session?.participants.get(characterId);
  }

  /**
   * Get session leaderboard
   */
  static getSessionLeaderboard(bossId: WorldBossType): ParticipantData[] {
    const session = this.activeSessions.get(bossId);
    if (!session) return [];

    return Array.from(session.participants.values()).sort(
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
  static getBossStatus(bossId: WorldBossType): {
    isActive: boolean;
    session?: WorldBossSession;
    nextSpawn?: Date | null;
  } {
    const session = this.activeSessions.get(bossId);
    return {
      isActive: this.isBossActive(bossId),
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
