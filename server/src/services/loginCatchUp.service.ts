/**
 * Login Catch-Up Service
 * Processes offline progress when a player logs back in
 *
 * Checks for and processes:
 * 1. Completed training sessions
 * 2. Completed expeditions
 * 3. Passive income from properties
 * 4. Gang activity results
 * 5. Energy regeneration
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { Expedition } from '../models/Expedition.model';
import { Property, IProperty } from '../models/Property.model';
import { GangWar, IGangWar } from '../models/GangWar.model';
import { GangHeist, IGangHeist } from '../models/GangHeist.model';
import { Raid, IRaid } from '../models/Raid.model';
import { ExpeditionService } from './expedition.service';
import { SkillService } from './skill.service';
import { GangWarStatus, HeistStatus, RaidStatus, PropertyStatus, WarOutcome, HeistOutcome, RaidOutcome, ExpeditionOutcome } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Training completion result
 */
interface TrainingCompletion {
  skillId: string;
  skillName: string;
  xpGained: number;
  leveledUp: boolean;
  newLevel?: number;
}

/**
 * Expedition completion result for display
 */
interface ExpeditionCompletion {
  type: string;
  typeName: string;
  outcome: 'success' | 'partial_success' | 'failure';
  goldEarned: number;
  xpEarned: number;
  itemsFound: { itemId: string; itemName: string; quantity: number }[];
  events: string[];
}

/**
 * Property income result
 */
interface PropertyIncome {
  propertyId: string;
  propertyName: string;
  goldEarned: number;
}

/**
 * Gang activity result
 */
interface GangActivityResult {
  type: 'war' | 'heist' | 'raid' | 'oc';
  name: string;
  outcome: 'victory' | 'defeat' | 'draw';
  rewardsEarned?: number;
  message?: string;
}

/**
 * Complete offline progress summary
 */
export interface OfflineProgressSummary {
  completedTraining: TrainingCompletion[];
  completedExpeditions: ExpeditionCompletion[];
  propertyIncome: PropertyIncome[];
  gangResults: GangActivityResult[];
  energyRestored: number;
  currentEnergy: number;
  maxEnergy: number;
  timeOfflineMs: number;
  lastLogin: string;
}

/**
 * SKILL_NAMES map for display purposes
 */
const SKILL_NAMES: Record<string, string> = {
  shooting: 'Shooting',
  fighting: 'Fighting',
  persuasion: 'Persuasion',
  deception: 'Deception',
  tracking: 'Tracking',
  riding: 'Riding',
  gambling: 'Gambling',
  medicine: 'Medicine',
  engineering: 'Engineering',
  survival: 'Survival',
  lockpicking: 'Lockpicking',
  stealth: 'Stealth',
};

/**
 * EXPEDITION_TYPE_NAMES for display
 */
const EXPEDITION_TYPE_NAMES: Record<string, string> = {
  HUNTING: 'Hunting Trip',
  PROSPECTING: 'Prospecting Run',
  TRADE_CARAVAN: 'Trade Caravan',
  SCOUTING: 'Scouting Mission',
};

/**
 * Map ExpeditionOutcome enum to simplified outcome string
 */
const mapExpeditionOutcome = (outcome: ExpeditionOutcome): 'success' | 'partial_success' | 'failure' => {
  switch (outcome) {
    case ExpeditionOutcome.CRITICAL_SUCCESS:
    case ExpeditionOutcome.SUCCESS:
      return 'success';
    case ExpeditionOutcome.PARTIAL_SUCCESS:
      return 'partial_success';
    case ExpeditionOutcome.FAILURE:
    case ExpeditionOutcome.CRITICAL_FAILURE:
    default:
      return 'failure';
  }
};

/**
 * Login Catch-Up Service
 */
export class LoginCatchUpService {
  /**
   * Process all offline progress for a character
   */
  static async processLoginCatchUp(characterId: string): Promise<OfflineProgressSummary> {
    const now = new Date();

    logger.info(`[LoginCatchUp] Processing offline progress for character ${characterId}`);

    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const lastLogin = character.lastActive || now;
    const timeOfflineMs = now.getTime() - new Date(lastLogin).getTime();

    // Initialize results
    const results: OfflineProgressSummary = {
      completedTraining: [],
      completedExpeditions: [],
      propertyIncome: [],
      gangResults: [],
      energyRestored: 0,
      currentEnergy: character.energy || 100,
      maxEnergy: character.maxEnergy || 100,
      timeOfflineMs,
      lastLogin: lastLogin.toISOString(),
    };

    // Process each type of offline progress
    try {
      results.completedTraining = await this.processCompletedTraining(characterId);
    } catch (error) {
      logger.error('[LoginCatchUp] Error processing training:', error);
    }

    try {
      results.completedExpeditions = await this.processCompletedExpeditions(characterId);
    } catch (error) {
      logger.error('[LoginCatchUp] Error processing expeditions:', error);
    }

    try {
      results.propertyIncome = await this.calculatePropertyIncome(characterId, timeOfflineMs);
    } catch (error) {
      logger.error('[LoginCatchUp] Error calculating property income:', error);
    }

    try {
      results.gangResults = await this.checkGangActivityResults(characterId);
    } catch (error) {
      logger.error('[LoginCatchUp] Error checking gang results:', error);
    }

    try {
      const energyResult = await this.calculateEnergyRegen(characterId, timeOfflineMs);
      results.energyRestored = energyResult.restored;
      results.currentEnergy = energyResult.current;
      results.maxEnergy = energyResult.max;
    } catch (error) {
      logger.error('[LoginCatchUp] Error calculating energy regen:', error);
    }

    // Update last active time
    character.lastActive = now;
    await character.save();

    logger.info(`[LoginCatchUp] Completed processing for ${characterId}:`, {
      training: results.completedTraining.length,
      expeditions: results.completedExpeditions.length,
      properties: results.propertyIncome.length,
      gangResults: results.gangResults.length,
      energyRestored: results.energyRestored,
    });

    return results;
  }

  /**
   * Process completed training sessions
   */
  private static async processCompletedTraining(characterId: string): Promise<TrainingCompletion[]> {
    const completions: TrainingCompletion[] = [];
    const character = await Character.findById(characterId);

    if (!character?.skills) return completions;

    const now = new Date();

    for (const skill of character.skills) {
      // Check if training is complete
      if (skill.trainingCompletes && new Date(skill.trainingCompletes) <= now) {
        // Calculate XP based on training duration
        const startTime = skill.trainingStarted?.getTime() || 0;
        const endTime = skill.trainingCompletes.getTime();
        const durationMinutes = Math.floor((endTime - startTime) / (60 * 1000));
        const xpAmount = Math.max(1, durationMinutes);

        // Award XP
        const xpResult = await SkillService.awardSkillXP(characterId, skill.skillId, xpAmount);

        // Clear training state
        skill.trainingStarted = undefined;
        skill.trainingCompletes = undefined;

        completions.push({
          skillId: skill.skillId,
          skillName: SKILL_NAMES[skill.skillId] || skill.skillId,
          xpGained: xpAmount,
          leveledUp: xpResult.result?.leveledUp || false,
          newLevel: xpResult.result?.newLevel,
        });
      }
    }

    if (completions.length > 0) {
      await character.save();
    }

    return completions;
  }

  /**
   * Process completed expeditions
   */
  private static async processCompletedExpeditions(characterId: string): Promise<ExpeditionCompletion[]> {
    const completions: ExpeditionCompletion[] = [];

    // Find all completed but unprocessed expeditions
    const expeditions = await Expedition.find({
      characterId,
      status: 'in_progress',
      completesAt: { $lte: new Date() },
    });

    for (const expedition of expeditions) {
      try {
        const result = await ExpeditionService.completeExpedition(expedition._id.toString());

        completions.push({
          type: expedition.type,
          typeName: EXPEDITION_TYPE_NAMES[expedition.type] || expedition.type,
          outcome: mapExpeditionOutcome(result.outcome),
          goldEarned: result.totalGold,
          xpEarned: result.totalXp,
          itemsFound: result.resources.map((r) => ({
            itemId: r.itemId,
            itemName: r.itemId, // Would need to lookup actual item name
            quantity: r.quantity,
          })),
          events: result.events.map((e) => e.description),
        });
      } catch (error) {
        logger.error(`[LoginCatchUp] Error completing expedition ${expedition._id}:`, error);
      }
    }

    return completions;
  }

  /**
   * Calculate property income accumulated while offline
   */
  private static async calculatePropertyIncome(
    characterId: string,
    timeOfflineMs: number
  ): Promise<PropertyIncome[]> {
    const incomes: PropertyIncome[] = [];

    // Find all active properties owned by the character
    const properties = await Property.find({
      ownerId: new mongoose.Types.ObjectId(characterId),
      status: PropertyStatus.ACTIVE,
    });

    if (properties.length === 0) {
      return incomes;
    }

    // Calculate hours offline (cap at 24 hours for income calculation)
    const hoursOffline = Math.min(timeOfflineMs / (1000 * 60 * 60), 24);

    // Get character to award gold
    const character = await Character.findById(characterId);
    if (!character) {
      return incomes;
    }

    let totalIncome = 0;

    for (const property of properties) {
      // Calculate weekly income for this property
      const weeklyIncome = property.calculateWeeklyIncome();

      // Convert to hourly income (weekly / 168 hours)
      const hourlyIncome = weeklyIncome / 168;

      // Calculate income for offline period
      const income = Math.floor(hourlyIncome * hoursOffline);

      if (income > 0) {
        incomes.push({
          propertyId: property._id.toString(),
          propertyName: property.name,
          goldEarned: income,
        });
        totalIncome += income;

        // Update last income collection time
        property.lastIncomeCollection = new Date();
        await property.save();
      }
    }

    // Award total income to character
    if (totalIncome > 0) {
      character.gold = (character.gold || 0) + totalIncome;
      await character.save();

      logger.info(`[LoginCatchUp] Awarded ${totalIncome}g property income to ${characterId}`);
    }

    return incomes;
  }

  /**
   * Check for gang activity results that occurred while offline
   */
  private static async checkGangActivityResults(characterId: string): Promise<GangActivityResult[]> {
    const results: GangActivityResult[] = [];

    const character = await Character.findById(characterId);
    if (!character?.gangId) {
      return results;
    }

    const gangId = character.gangId;
    const lastLogin = character.lastActive || new Date(0);

    // Check for completed wars
    try {
      const wars = await GangWar.find({
        $or: [
          { attackerGangId: gangId },
          { defenderGangId: gangId },
        ],
        status: GangWarStatus.RESOLVED,
        endsAt: { $gte: lastLogin },
      }).sort({ endsAt: -1 }).limit(10);

      for (const war of wars) {
        const isAttacker = war.attackerGangId.toString() === gangId.toString();
        const enemyName = isAttacker ? war.defenderGangName : war.attackerGangName;

        let outcome: 'victory' | 'defeat' | 'draw' = 'draw';
        if (war.outcome === WarOutcome.ATTACKER_VICTORY) {
          outcome = isAttacker ? 'victory' : 'defeat';
        } else if (war.outcome === WarOutcome.DEFENDER_VICTORY) {
          outcome = isAttacker ? 'defeat' : 'victory';
        }

        results.push({
          type: 'war',
          name: `War against ${enemyName}`,
          outcome,
          message: war.territoryId ? `Territory: ${war.territoryId}` : undefined,
        });
      }
    } catch (error) {
      logger.error('[LoginCatchUp] Error checking war results:', error);
    }

    // Check for completed heists
    try {
      const heists = await GangHeist.find({
        gangId,
        status: HeistStatus.COMPLETED,
        completedDate: { $gte: lastLogin },
        'roles.characterId': characterId,
      }).sort({ completedDate: -1 }).limit(10);

      for (const heist of heists) {
        let outcome: 'victory' | 'defeat' | 'draw';
        if (heist.outcome === HeistOutcome.SUCCESS) {
          outcome = 'victory';
        } else if (heist.outcome === HeistOutcome.PARTIAL_SUCCESS) {
          outcome = 'draw';
        } else {
          outcome = 'defeat';
        }

        // Calculate share of payout for participant
        const participantCount = heist.roles.length;
        const playerShare = heist.actualPayout && participantCount > 0
          ? Math.floor(heist.actualPayout / participantCount)
          : 0;

        results.push({
          type: 'heist',
          name: `${heist.targetName} Heist`,
          outcome,
          rewardsEarned: playerShare,
          message: heist.outcome === HeistOutcome.SUCCESS ? 'Successful heist!' : undefined,
        });
      }
    } catch (error) {
      logger.error('[LoginCatchUp] Error checking heist results:', error);
    }

    // Check for completed raids
    try {
      const raids = await Raid.find({
        $or: [
          { attackingGangId: gangId },
          { defendingGangId: gangId },
        ],
        status: { $in: [RaidStatus.COMPLETED, RaidStatus.DEFENDED] },
        completedAt: { $gte: lastLogin },
        'participants.characterId': characterId,
      }).sort({ completedAt: -1 }).limit(10);

      for (const raid of raids) {
        const isAttacker = raid.attackingGangId.toString() === gangId.toString();

        let outcome: 'victory' | 'defeat' | 'draw';
        if (raid.result?.outcome === RaidOutcome.SUCCESS) {
          outcome = isAttacker ? 'victory' : 'defeat';
        } else if (raid.status === RaidStatus.DEFENDED) {
          outcome = isAttacker ? 'defeat' : 'victory';
        } else {
          outcome = 'draw';
        }

        // Calculate participant's share
        const participantCount = raid.participants.length;
        const goldAwarded = raid.result?.goldAwarded || 0;
        const playerShare = participantCount > 0 ? Math.floor(goldAwarded / participantCount) : 0;

        results.push({
          type: 'raid',
          name: `Raid on ${raid.targetName}`,
          outcome,
          rewardsEarned: isAttacker && outcome === 'victory' ? playerShare : undefined,
          message: isAttacker ? 'Attacking raid' : 'Defense',
        });
      }
    } catch (error) {
      logger.error('[LoginCatchUp] Error checking raid results:', error);
    }

    return results;
  }

  /**
   * Calculate energy regeneration while offline
   */
  private static async calculateEnergyRegen(
    characterId: string,
    timeOfflineMs: number
  ): Promise<{ restored: number; current: number; max: number }> {
    const character = await Character.findById(characterId);
    if (!character) {
      return { restored: 0, current: 100, max: 100 };
    }

    const currentEnergy = character.energy || 0;
    const maxEnergy = character.maxEnergy || 100;

    // Energy regeneration: 1 energy per 6 minutes (10 per hour)
    const ENERGY_REGEN_RATE = 10; // per hour
    const hoursOffline = Math.min(timeOfflineMs / (1000 * 60 * 60), 24); // Cap at 24 hours

    const regenAmount = Math.floor(hoursOffline * ENERGY_REGEN_RATE);
    const newEnergy = Math.min(currentEnergy + regenAmount, maxEnergy);
    const actualRestored = newEnergy - currentEnergy;

    if (actualRestored > 0) {
      character.energy = newEnergy;
      await character.save();
    }

    return {
      restored: actualRestored,
      current: newEnergy,
      max: maxEnergy,
    };
  }

  /**
   * Check if character has any pending offline progress
   */
  static async hasOfflineProgress(characterId: string): Promise<boolean> {
    const character = await Character.findById(characterId);
    if (!character) return false;

    const now = new Date();
    const lastLogin = character.lastActive || new Date(0);

    // Check for completed training
    const hasCompletedTraining = character.skills?.some(
      (s) => s.trainingCompletes && new Date(s.trainingCompletes) <= now
    );

    if (hasCompletedTraining) return true;

    // Check for completed expeditions
    const pendingExpeditions = await Expedition.countDocuments({
      characterId,
      status: 'in_progress',
      completesAt: { $lte: now },
    });

    if (pendingExpeditions > 0) return true;

    // Check for properties with pending income
    const propertiesWithIncome = await Property.countDocuments({
      ownerId: new mongoose.Types.ObjectId(characterId),
      status: PropertyStatus.ACTIVE,
    });

    if (propertiesWithIncome > 0) return true;

    // Check for gang activity results
    if (character.gangId) {
      // Check for resolved wars since last login
      const recentWars = await GangWar.countDocuments({
        $or: [
          { attackerGangId: character.gangId },
          { defenderGangId: character.gangId },
        ],
        status: GangWarStatus.RESOLVED,
        endsAt: { $gte: lastLogin },
      });

      if (recentWars > 0) return true;

      // Check for completed heists
      const recentHeists = await GangHeist.countDocuments({
        gangId: character.gangId,
        status: HeistStatus.COMPLETED,
        completedDate: { $gte: lastLogin },
        'roles.characterId': characterId,
      });

      if (recentHeists > 0) return true;

      // Check for completed raids
      const recentRaids = await Raid.countDocuments({
        $or: [
          { attackingGangId: character.gangId },
          { defendingGangId: character.gangId },
        ],
        status: { $in: [RaidStatus.COMPLETED, RaidStatus.DEFENDED] },
        completedAt: { $gte: lastLogin },
        'participants.characterId': characterId,
      });

      if (recentRaids > 0) return true;
    }

    // Check if energy needs regeneration
    const currentEnergy = character.energy || 0;
    const maxEnergy = character.maxEnergy || 100;
    if (currentEnergy < maxEnergy) return true;

    return false;
  }
}

export default LoginCatchUpService;
