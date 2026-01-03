/**
 * Mortal Danger Service
 *
 * Handles death risk calculations and fate mark management for the permadeath system.
 * Determines when normal death becomes mortal danger (permadeath risk).
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';
import {
  DeathRiskFactors,
  DeathRiskResult,
  DangerLevel,
  DANGER_LEVEL_CONFIG,
  DEATH_RISK_CONFIG,
  FateMark,
  FateMarkSource,
  FATE_MARK_CONFIG,
  ActionDangerRating,
  MortalDangerResult,
  SurvivalType
} from '@desperados/shared';
import { DeathType } from '@desperados/shared';

/**
 * Fate mark stored in character
 */
export interface StoredFateMark {
  acquiredAt: Date;
  source: FateMarkSource;
  description?: string;
}

export class MortalDangerService {
  /**
   * Calculate death risk based on all contributing factors
   */
  static calculateDeathRisk(factors: DeathRiskFactors): DeathRiskResult {
    // Base survival from skill match (over-skilled gives bonus up to cap)
    const skillSurvival = Math.min(factors.skillRatio, DEATH_RISK_CONFIG.overSkilledCap);

    // Health vulnerability (wounded = more risk)
    const healthVulnerability = 1 + (1 - factors.healthRatio) * DEATH_RISK_CONFIG.healthVulnerabilityFactor;

    // Wanted level multiplier (bounty makes everything deadlier)
    const wantedMultiplier = 1 + (factors.wantedLevel * DEATH_RISK_CONFIG.wantedRiskPerLevel);

    // Equipment protection (0.7 - 1.0 based on gear tier)
    const equipmentRange = DEATH_RISK_CONFIG.equipmentProtection.max - DEATH_RISK_CONFIG.equipmentProtection.min;
    const equipmentProtection = DEATH_RISK_CONFIG.equipmentProtection.min +
      (factors.equipmentTier / 5) * equipmentRange;

    // Fate marks accumulation (each mark increases risk)
    const fateMultiplier = 1 + (factors.fateMarks * DEATH_RISK_CONFIG.fateMarkRiskPerMark);

    // Final death risk calculation
    // Base risk comes from action danger, reduced by skill competence
    const baseRisk = factors.actionDanger * (1 / Math.max(skillSurvival, 0.1));

    // Apply modifiers
    const modifiedRisk = baseRisk * healthVulnerability * wantedMultiplier * fateMultiplier / equipmentProtection;

    // Cap at maximum (always a sliver of hope)
    const finalRisk = Math.min(modifiedRisk, DEATH_RISK_CONFIG.maxRisk);

    // Determine danger level for UI
    const dangerLevel = this.getDangerLevel(finalRisk);

    return {
      risk: finalRisk,
      dangerLevel,
      factors: {
        skillSurvival,
        healthVulnerability,
        wantedMultiplier,
        equipmentProtection,
        fateMultiplier
      }
    };
  }

  /**
   * Get danger level from risk percentage
   */
  static getDangerLevel(risk: number): DangerLevel {
    for (const [level, config] of Object.entries(DANGER_LEVEL_CONFIG)) {
      if (risk >= config.minRisk && risk <= config.maxRisk) {
        return level as DangerLevel;
      }
    }
    return DangerLevel.SAFE;
  }

  /**
   * Roll to determine if a "death" event becomes mortal danger (permadeath risk)
   * Returns true if character SURVIVES the mortal danger check
   */
  static async rollMortalDanger(
    characterId: string,
    deathRisk: DeathRiskResult
  ): Promise<MortalDangerResult> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Roll against death risk
    const roll = SecureRNG.float(0, 1);
    const survived = roll >= deathRisk.risk;

    if (survived) {
      // Character beats the odds - normal death penalties apply
      logger.info(
        `Mortal danger check: ${character.name} SURVIVED (roll: ${roll.toFixed(3)} >= risk: ${deathRisk.risk.toFixed(3)})`
      );

      return {
        survived: true,
        survivalType: SurvivalType.LUCKY_ROLL,
        message: 'Fate smiles upon you... this time.',
        lastStandTriggered: false
      };
    }

    // Character failed the mortal danger check - Last Stand will be triggered
    logger.warn(
      `Mortal danger check: ${character.name} FAILED (roll: ${roll.toFixed(3)} < risk: ${deathRisk.risk.toFixed(3)}) - triggering Last Stand`
    );

    return {
      survived: false,
      message: 'Death reaches for you...',
      lastStandTriggered: true
    };
  }

  /**
   * Build death risk factors from character state
   */
  static async buildRiskFactors(
    character: ICharacter,
    actionDanger: number,
    opponentLevel?: number
  ): Promise<DeathRiskFactors> {
    // Calculate skill ratio using Combat Level
    const combatLevel = character.combatLevel || 1;
    const characterPower = combatLevel + this.getEquipmentBonus(character);
    const requiredPower = opponentLevel || Math.ceil(actionDanger * 50); // Scale action danger to "level"
    const skillRatio = characterPower / Math.max(requiredPower, 1);

    // Health ratio using Combat Level
    const maxHealth = 100 + (combatLevel * 10); // Base HP + combat level scaling
    const currentHealth = character.isKnockedOut ? 1 : maxHealth; // Assume full health unless knocked out
    const healthRatio = currentHealth / maxHealth;

    // Equipment tier (average of equipped gear quality)
    const equipmentTier = this.calculateEquipmentTier(character);

    // Get fate marks count
    const fateMarks = this.getFateMarksCount(character);

    return {
      skillRatio,
      healthRatio,
      wantedLevel: character.wantedLevel,
      actionDanger,
      equipmentTier,
      fateMarks
    };
  }

  /**
   * Calculate equipment tier (0-5) from character's gear
   */
  private static calculateEquipmentTier(character: ICharacter): number {
    const equipment = character.equipment;
    if (!equipment) return 0;

    let totalTier = 0;
    let itemCount = 0;

    // Count equipped items and estimate tier (simplified)
    const slots = ['weapon', 'head', 'body', 'feet', 'accessory'] as const;

    for (const slot of slots) {
      if (equipment[slot]) {
        itemCount++;
        // Simplified tier estimation based on character level
        // In a full implementation, this would look up item data
        totalTier += Math.min(5, Math.ceil(character.level / 10));
      }
    }

    return itemCount > 0 ? totalTier / itemCount : 0;
  }

  /**
   * Get bonus from equipment (simplified)
   */
  private static getEquipmentBonus(character: ICharacter): number {
    const tier = this.calculateEquipmentTier(character);
    return tier * 2; // Each tier adds 2 effective levels
  }

  /**
   * Get count of active fate marks on a character
   */
  static getFateMarksCount(character: ICharacter): number {
    const fateMarks = (character as any).fateMarks as StoredFateMark[] | undefined;
    if (!fateMarks || !Array.isArray(fateMarks)) {
      return 0;
    }

    // Filter out decayed marks
    const now = new Date();
    const activeMarks = fateMarks.filter(mark => {
      const hoursSinceAcquired = (now.getTime() - new Date(mark.acquiredAt).getTime()) / (1000 * 60 * 60);
      return hoursSinceAcquired < FATE_MARK_CONFIG.decayHours;
    });

    return Math.min(activeMarks.length, FATE_MARK_CONFIG.maxMarks);
  }

  /**
   * Add a fate mark to a character
   */
  static async addFateMark(
    characterId: string,
    source: FateMarkSource,
    description?: string,
    session?: mongoose.ClientSession
  ): Promise<number> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Initialize fate marks array if needed
    let fateMarks = (character as any).fateMarks as StoredFateMark[] | undefined;
    if (!fateMarks) {
      fateMarks = [];
      (character as any).fateMarks = fateMarks;
    }

    // Clean up decayed marks first
    const now = new Date();
    fateMarks = fateMarks.filter(mark => {
      const hoursSinceAcquired = (now.getTime() - new Date(mark.acquiredAt).getTime()) / (1000 * 60 * 60);
      return hoursSinceAcquired < FATE_MARK_CONFIG.decayHours;
    });

    // Check if at max marks
    if (fateMarks.length >= FATE_MARK_CONFIG.maxMarks) {
      logger.warn(`Character ${character.name} already at max fate marks (${FATE_MARK_CONFIG.maxMarks})`);
      return fateMarks.length;
    }

    // Add new mark
    const newMark: StoredFateMark = {
      acquiredAt: now,
      source,
      description
    };
    fateMarks.push(newMark);
    (character as any).fateMarks = fateMarks;

    await character.save(session ? { session } : undefined);

    logger.info(
      `Fate mark added to ${character.name}: ${source} (now has ${fateMarks.length} marks)`
    );

    return fateMarks.length;
  }

  /**
   * Remove/cleanse fate marks from a character
   */
  static async cleanseFateMarks(
    characterId: string,
    count: number,
    session?: mongoose.ClientSession
  ): Promise<number> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    let fateMarks = (character as any).fateMarks as StoredFateMark[] | undefined;
    if (!fateMarks || fateMarks.length === 0) {
      return 0;
    }

    // Remove oldest marks first
    const toRemove = Math.min(count, fateMarks.length);
    fateMarks = fateMarks.slice(toRemove);
    (character as any).fateMarks = fateMarks;

    await character.save(session ? { session } : undefined);

    logger.info(
      `Cleansed ${toRemove} fate marks from ${character.name} (${fateMarks.length} remaining)`
    );

    return toRemove;
  }

  /**
   * Clear all fate marks (used after divine salvation)
   */
  static async clearAllFateMarks(
    characterId: string,
    session?: mongoose.ClientSession
  ): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    (character as any).fateMarks = [];
    await character.save(session ? { session } : undefined);

    logger.info(`All fate marks cleared from ${character.name}`);
  }

  /**
   * Process fate mark decay (should be called periodically or on login)
   */
  static async processMarkDecay(characterId: string): Promise<number> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    let fateMarks = (character as any).fateMarks as StoredFateMark[] | undefined;
    if (!fateMarks || fateMarks.length === 0) {
      return 0;
    }

    const now = new Date();
    const originalCount = fateMarks.length;

    // Filter out decayed marks
    fateMarks = fateMarks.filter(mark => {
      const hoursSinceAcquired = (now.getTime() - new Date(mark.acquiredAt).getTime()) / (1000 * 60 * 60);
      return hoursSinceAcquired < FATE_MARK_CONFIG.decayHours;
    });

    const decayed = originalCount - fateMarks.length;

    if (decayed > 0) {
      (character as any).fateMarks = fateMarks;
      await character.save();
      logger.info(`${decayed} fate marks decayed for ${character.name}`);
    }

    return decayed;
  }

  /**
   * Check if a Destiny Deck hand is a critical failure (triggers fate mark)
   */
  static isDestinyDeckCriticalFailure(handScore: number, maxPossibleScore: number): boolean {
    const normalizedScore = handScore / maxPossibleScore;
    return normalizedScore <= FATE_MARK_CONFIG.destinyDeckCriticalThreshold;
  }

  /**
   * Get action danger rating by action type
   */
  static getActionDanger(actionType: string): number {
    const dangerRatings: Record<string, number> = {
      // Safe actions
      'rest': ActionDangerRating.SAFE,
      'socialize': ActionDangerRating.SAFE,
      'shop': ActionDangerRating.SAFE,
      'travel_safe': ActionDangerRating.SAFE,

      // Low danger
      'pickpocket': ActionDangerRating.LOW,
      'con': ActionDangerRating.LOW,
      'saloon_work': ActionDangerRating.LOW,
      'petty_theft': ActionDangerRating.LOW,

      // Medium danger
      'bar_fight': ActionDangerRating.MEDIUM,
      'cattle_rustling': ActionDangerRating.MEDIUM,
      'stagecoach_robbery': ActionDangerRating.MEDIUM,
      'gang_skirmish': ActionDangerRating.MEDIUM,
      'npc_combat': ActionDangerRating.MEDIUM,

      // High danger
      'bank_robbery': ActionDangerRating.HIGH,
      'train_heist': ActionDangerRating.HIGH,
      'bounty_hunting': ActionDangerRating.HIGH,
      'pvp_combat': ActionDangerRating.HIGH,
      'gang_war': ActionDangerRating.HIGH,

      // Extreme danger
      'legendary_outlaw': ActionDangerRating.EXTREME,
      'assassination': ActionDangerRating.EXTREME,
      'fort_assault': ActionDangerRating.EXTREME,
      'boss_fight': ActionDangerRating.EXTREME
    };

    return dangerRatings[actionType] ?? ActionDangerRating.MEDIUM;
  }

  /**
   * Check if permadeath is active for this character (no training wheels)
   */
  static isPermadeathActive(_character: ICharacter): boolean {
    // Per design: "Full Risk From Start" - no training wheels
    // Permadeath is active from Level 1
    return true;
  }

  /**
   * Get death risk preview for UI (without rolling)
   */
  static async getDeathRiskPreview(
    characterId: string,
    actionType: string,
    opponentLevel?: number
  ): Promise<{ risk: DeathRiskResult; fateMarks: number }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const actionDanger = this.getActionDanger(actionType);
    const factors = await this.buildRiskFactors(character, actionDanger, opponentLevel);
    const risk = this.calculateDeathRisk(factors);
    const fateMarks = this.getFateMarksCount(character);

    return { risk, fateMarks };
  }
}

export default MortalDangerService;
