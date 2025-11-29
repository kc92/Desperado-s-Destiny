/**
 * Bounty Hunter Service
 *
 * Handles bounty hunter encounters, spawning, hiring, and tracking
 */

import mongoose from 'mongoose';
import {
  BountyHunter,
  HunterEncounter,
  ActiveHunter,
  HunterSpawnCheck,
  HireableBy,
  WantedRank,
  BountyFaction,
} from '@desperados/shared';
import {
  BOUNTY_HUNTERS,
  getHunterById,
  getHuntersByTerritory,
  getHuntersForBounty,
  getHireableHunters,
} from '../data/bountyHunters';
import { BountyService } from './bounty.service';
import { Character } from '../models/Character.model';
import { GoldService } from './gold.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import logger from '../utils/logger';

/**
 * Mongoose model for hunter encounters
 */
const HunterEncounterSchema = new mongoose.Schema({
  hunterId: { type: String, required: true },
  hunterName: { type: String, required: true },
  hunterLevel: { type: Number, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
  targetName: { type: String, required: true },
  targetBounty: { type: Number, required: true },
  encounterType: {
    type: String,
    enum: ['random', 'hired', 'story', 'patrol'],
    required: true,
  },
  location: { type: String, required: true },
  canPayOff: { type: Boolean, default: false },
  payOffAmount: { type: Number, default: 0 },
  canNegotiate: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'escaped', 'captured', 'hunter_defeated', 'paid_off'],
    default: 'active',
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  hiredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
});

HunterEncounterSchema.index({ targetId: 1, status: 1 });
HunterEncounterSchema.index({ hunterId: 1, status: 1 });
HunterEncounterSchema.index({ createdAt: -1 });

const HunterEncounterModel = mongoose.model('HunterEncounter', HunterEncounterSchema);

/**
 * Mongoose model for active hunters
 */
const ActiveHunterSchema = new mongoose.Schema({
  hunterId: { type: String, required: true, unique: true },
  currentLocation: { type: String, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
  hoursUntilEncounter: { type: Number, default: 0 },
  lastUpdate: { type: Date, default: Date.now },
  hiredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
  hireExpiresAt: { type: Date },
});

ActiveHunterSchema.index({ hunterId: 1 });
ActiveHunterSchema.index({ targetId: 1 });
ActiveHunterSchema.index({ hiredBy: 1 });

const ActiveHunterModel = mongoose.model('ActiveHunter', ActiveHunterSchema);

export class BountyHunterService {
  /**
   * Check if a bounty hunter should spawn for a character
   */
  static async checkHunterSpawn(
    characterId: string,
    location: string
  ): Promise<HunterSpawnCheck> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { shouldSpawn: false };
      }

      // Get wanted level
      const wantedLevel = await BountyService.getWantedLevel(characterId);

      // No bounty = no hunters
      if (wantedLevel.totalBounty === 0) {
        return { shouldSpawn: false };
      }

      // Get potential hunters for this bounty amount
      const potentialHunters = getHuntersForBounty(wantedLevel.totalBounty);

      // Filter by territory
      const localHunters = potentialHunters.filter((hunter) =>
        this.isHunterInTerritory(hunter, location)
      );

      if (localHunters.length === 0) {
        return { shouldSpawn: false };
      }

      // Check spawn rates based on wanted rank
      const spawnChance = this.getSpawnChance(wantedLevel.wantedRank);
      const roll = Math.random();

      if (roll > spawnChance) {
        return { shouldSpawn: false };
      }

      // Select random hunter from available pool
      const hunter = localHunters[Math.floor(Math.random() * localHunters.length)];

      // Check if hunter is already tracking this character
      const existingEncounter = await HunterEncounterModel.findOne({
        targetId: characterId,
        hunterId: hunter.id,
        status: 'active',
      });

      if (existingEncounter) {
        return { shouldSpawn: false };
      }

      logger.info(
        `Bounty hunter ${hunter.name} spawned to hunt ${character.name} (${wantedLevel.totalBounty} gold bounty)`
      );

      return {
        shouldSpawn: true,
        hunterId: hunter.id,
        hunterName: hunter.name,
        hunterLevel: hunter.level,
        estimatedArrival: hunter.huntingBehavior.escalationRate,
        reason: `${wantedLevel.totalBounty} gold bounty (${wantedLevel.wantedRank})`,
      };
    } catch (error) {
      logger.error('Error checking hunter spawn:', error);
      return { shouldSpawn: false };
    }
  }

  /**
   * Create a hunter encounter
   */
  static async createEncounter(
    hunterId: string,
    targetId: string,
    location: string,
    encounterType: 'random' | 'hired' | 'story' | 'patrol' = 'random',
    hiredBy?: string
  ): Promise<HunterEncounter> {
    try {
      const hunter = getHunterById(hunterId);
      if (!hunter) {
        throw new Error('Hunter not found');
      }

      const target = await Character.findById(targetId);
      if (!target) {
        throw new Error('Target character not found');
      }

      const wantedLevel = await BountyService.getWantedLevel(targetId);

      // Determine if hunter can be paid off
      const canPayOff = hunter.dialogue.payoffLines && hunter.dialogue.payoffLines.length > 0;
      const payOffAmount = canPayOff ? Math.floor(wantedLevel.totalBounty * 1.5) : 0;

      const encounter = new HunterEncounterModel({
        hunterId: hunter.id,
        hunterName: hunter.name,
        hunterLevel: hunter.level,
        targetId: target._id,
        targetName: target.name,
        targetBounty: wantedLevel.totalBounty,
        encounterType,
        location,
        canPayOff,
        payOffAmount,
        canNegotiate: hunter.dialogue.negotiationLines.length > 0,
        status: 'active',
        hiredBy: hiredBy ? new mongoose.Types.ObjectId(hiredBy) : undefined,
      });

      await encounter.save();

      logger.info(
        `Hunter encounter created: ${hunter.name} vs ${target.name} at ${location}`
      );

      return encounter.toObject() as unknown as HunterEncounter;
    } catch (error) {
      logger.error('Error creating hunter encounter:', error);
      throw error;
    }
  }

  /**
   * Pay off a hunter to avoid capture
   */
  static async payOffHunter(
    encounterId: string,
    characterId: string
  ): Promise<{ success: boolean; message: string; accepted: boolean }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const encounter = await HunterEncounterModel.findById(encounterId).session(session);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      if (encounter.status !== 'active') {
        throw new Error('Encounter is not active');
      }

      if (!encounter.canPayOff) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'This hunter cannot be paid off',
          accepted: false,
        };
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (!character.hasGold(encounter.payOffAmount)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `Insufficient gold. Need ${encounter.payOffAmount}, have ${character.gold}`,
          accepted: false,
        };
      }

      // Deduct gold
      await GoldService.deductGold(
        character._id as any,
        encounter.payOffAmount,
        TransactionSource.BOUNTY_PAYOFF,
        {
          encounterId: encounter._id,
          hunterName: encounter.hunterName,
          description: `Paid off ${encounter.hunterName} to avoid capture`,
        },
        session
      );

      // Mark encounter as paid off
      encounter.status = 'paid_off';
      encounter.resolvedAt = new Date();
      await encounter.save({ session });

      await session.commitTransaction();
      session.endSession();

      const hunter = getHunterById(encounter.hunterId);
      const message = hunter?.dialogue.payoffLines
        ? hunter.dialogue.payoffLines[
            Math.floor(Math.random() * hunter.dialogue.payoffLines.length)
          ]
        : 'The hunter takes your gold and walks away.';

      logger.info(
        `${character.name} paid off ${encounter.hunterName} for ${encounter.payOffAmount} gold`
      );

      return {
        success: true,
        message,
        accepted: true,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error paying off hunter:', error);
      throw error;
    }
  }

  /**
   * Hire a bounty hunter to track someone
   */
  static async hireHunter(
    hunterId: string,
    targetId: string,
    employerId: string
  ): Promise<{ success: boolean; message: string; cost: number }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const hunter = getHunterById(hunterId);
      if (!hunter || !hunter.hireConfig) {
        throw new Error('Hunter not found or not hireable');
      }

      const employer = await Character.findById(employerId).session(session);
      const target = await Character.findById(targetId).session(session);

      if (!employer || !target) {
        throw new Error('Character not found');
      }

      // Check if hunter can be hired by this character
      const canHire = this.canCharacterHireHunter(hunter, employer);
      if (!canHire.allowed) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: canHire.reason || 'You cannot hire this hunter',
          cost: 0,
        };
      }

      // Check if hunter is on cooldown
      const activeHunter = await ActiveHunterModel.findOne({ hunterId: hunter.id });
      if (activeHunter && activeHunter.hireExpiresAt && activeHunter.hireExpiresAt > new Date()) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `${hunter.name} is currently on another contract`,
          cost: 0,
        };
      }

      // Calculate cost
      const wantedLevel = await BountyService.getWantedLevel(targetId);
      const cost =
        hunter.hireConfig.baseCost +
        Math.floor(wantedLevel.totalBounty * hunter.hireConfig.costMultiplier);

      // Check if employer has enough gold
      if (!employer.hasGold(cost)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `Insufficient gold. Need ${cost}, have ${employer.gold}`,
          cost,
        };
      }

      // Deduct gold
      await GoldService.deductGold(
        employer._id as any,
        cost,
        TransactionSource.HIRE_HUNTER,
        {
          hunterId: hunter.id,
          hunterName: hunter.name,
          targetId: target._id,
          targetName: target.name,
          description: `Hired ${hunter.name} to hunt ${target.name}`,
        },
        session
      );

      // Create active hunter entry
      const expiresAt = new Date(
        Date.now() + hunter.hireConfig.hireCooldown * 60 * 60 * 1000
      );

      if (activeHunter) {
        activeHunter.targetId = target._id as any;
        activeHunter.hiredBy = employer._id as any;
        activeHunter.hireExpiresAt = expiresAt;
        activeHunter.hoursUntilEncounter = hunter.huntingBehavior.escalationRate;
        activeHunter.lastUpdate = new Date();
        await activeHunter.save({ session });
      } else {
        await ActiveHunterModel.create(
          [
            {
              hunterId: hunter.id,
              currentLocation: target.currentLocation,
              targetId: target._id,
              hiredBy: employer._id,
              hireExpiresAt: expiresAt,
              hoursUntilEncounter: hunter.huntingBehavior.escalationRate,
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      const message = hunter.dialogue.hireLines
        ? hunter.dialogue.hireLines[
            Math.floor(Math.random() * hunter.dialogue.hireLines.length)
          ]
        : `${hunter.name} has been hired to track ${target.name}`;

      logger.info(
        `${employer.name} hired ${hunter.name} to hunt ${target.name} for ${cost} gold`
      );

      return {
        success: true,
        message,
        cost,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error hiring hunter:', error);
      throw error;
    }
  }

  /**
   * Get available hunters for hire
   */
  static async getAvailableHunters(characterId: string): Promise<
    Array<{
      id: string;
      name: string;
      title: string;
      level: number;
      specialty: string;
      hireableBy: HireableBy;
      baseCost: number;
      successRate: number;
      currentlyHired: boolean;
    }>
  > {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return [];
      }

      const hireableHunters = getHireableHunters();
      const activeHunters = await ActiveHunterModel.find();

      const result = [];

      for (const hunter of hireableHunters) {
        if (!hunter.hireConfig) continue;

        const activeEntry = activeHunters.find((ah) => ah.hunterId === hunter.id);
        const currentlyHired =
          !!activeEntry && activeEntry.hireExpiresAt && activeEntry.hireExpiresAt > new Date();

        result.push({
          id: hunter.id,
          name: hunter.name,
          title: hunter.title,
          level: hunter.level,
          specialty: hunter.specialty,
          hireableBy: hunter.hireConfig.hireableBy,
          baseCost: hunter.hireConfig.baseCost,
          successRate: hunter.hireConfig.successRate,
          currentlyHired,
        });
      }

      return result;
    } catch (error) {
      logger.error('Error getting available hunters:', error);
      return [];
    }
  }

  /**
   * Get active encounters for a character
   */
  static async getActiveEncounters(characterId: string): Promise<HunterEncounter[]> {
    try {
      const encounters = await HunterEncounterModel.find({
        targetId: characterId,
        status: 'active',
      }).sort({ createdAt: -1 });

      return encounters.map((e) => e.toObject() as unknown as HunterEncounter);
    } catch (error) {
      logger.error('Error getting active encounters:', error);
      return [];
    }
  }

  /**
   * Resolve an encounter (combat result)
   */
  static async resolveEncounter(
    encounterId: string,
    result: 'escaped' | 'captured' | 'hunter_defeated'
  ): Promise<void> {
    try {
      const encounter = await HunterEncounterModel.findById(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      encounter.status = result;
      encounter.resolvedAt = new Date();
      await encounter.save();

      logger.info(
        `Hunter encounter resolved: ${encounter.hunterName} vs ${encounter.targetName} - ${result}`
      );
    } catch (error) {
      logger.error('Error resolving encounter:', error);
      throw error;
    }
  }

  /**
   * Update active hunter positions (called by cron job)
   */
  static async updateHunterPositions(): Promise<void> {
    try {
      const activeHunters = await ActiveHunterModel.find({
        targetId: { $exists: true },
      });

      for (const activeHunter of activeHunters) {
        // Decrease time until encounter
        if (activeHunter.hoursUntilEncounter && activeHunter.hoursUntilEncounter > 0) {
          activeHunter.hoursUntilEncounter -= 1;

          // If hunter has reached target, create encounter
          if (activeHunter.hoursUntilEncounter <= 0) {
            const target = await Character.findById(activeHunter.targetId);
            if (target) {
              const encounterType = activeHunter.hiredBy ? 'hired' : 'patrol';

              await this.createEncounter(
                activeHunter.hunterId,
                activeHunter.targetId.toString(),
                target.currentLocation,
                encounterType,
                activeHunter.hiredBy?.toString()
              );

              logger.info(
                `Hunter ${activeHunter.hunterId} has found target ${target.name}`
              );
            }

            // Reset hunter
            activeHunter.targetId = undefined;
            activeHunter.hoursUntilEncounter = undefined;
          }

          activeHunter.lastUpdate = new Date();
          await activeHunter.save();
        }

        // Remove expired hires
        if (activeHunter.hireExpiresAt && activeHunter.hireExpiresAt < new Date()) {
          activeHunter.hiredBy = undefined;
          activeHunter.hireExpiresAt = undefined;
          activeHunter.targetId = undefined;
          await activeHunter.save();
        }
      }

      logger.info(`Updated ${activeHunters.length} active hunter positions`);
    } catch (error) {
      logger.error('Error updating hunter positions:', error);
    }
  }

  /**
   * Helper: Check if hunter is in territory
   */
  private static isHunterInTerritory(hunter: BountyHunter, location: string): boolean {
    if (hunter.territory.includes('all') || hunter.territory.includes('everywhere')) {
      return true;
    }

    // Check if location matches any territory
    return hunter.territory.some((territory) =>
      location.toLowerCase().includes(territory.toLowerCase())
    );
  }

  /**
   * Helper: Get spawn chance based on wanted rank
   */
  private static getSpawnChance(rank: WantedRank): number {
    const spawnRates = {
      [WantedRank.UNKNOWN]: 0,
      [WantedRank.PETTY_CRIMINAL]: 0,
      [WantedRank.OUTLAW]: 0.05,
      [WantedRank.NOTORIOUS]: 0.15,
      [WantedRank.MOST_WANTED]: 0.30,
    };

    return spawnRates[rank] || 0;
  }

  /**
   * Helper: Check if character can hire hunter
   */
  private static canCharacterHireHunter(
    hunter: BountyHunter,
    character: any
  ): { allowed: boolean; reason?: string } {
    if (!hunter.hireConfig) {
      return { allowed: false, reason: 'Hunter is not available for hire' };
    }

    const { hireableBy, requiredFaction, minTrustRequired } = hunter.hireConfig;

    // Check hireable restrictions
    switch (hireableBy) {
      case HireableBy.NOT_HIREABLE:
        return { allowed: false, reason: 'This hunter cannot be hired' };

      case HireableBy.LAWFUL:
        // Check if character has any active bounties
        if (character.bounty && character.bounty > 0) {
          return { allowed: false, reason: 'Only lawful citizens can hire this hunter' };
        }
        break;

      case HireableBy.CRIMINAL:
        // Check if character has bounties
        if (!character.bounty || character.bounty === 0) {
          return { allowed: false, reason: 'Only criminals can hire this hunter' };
        }
        break;

      case HireableBy.FACTION_ONLY:
        if (requiredFaction && character.faction !== requiredFaction) {
          return {
            allowed: false,
            reason: `Only ${requiredFaction} members can hire this hunter`,
          };
        }
        break;

      case HireableBy.ANYONE:
        // No restrictions
        break;
    }

    // Check trust requirements
    if (minTrustRequired && minTrustRequired > 0) {
      // TODO: Check NPC trust level when that system is implemented
      // For now, assume trust is met
    }

    return { allowed: true };
  }
}
