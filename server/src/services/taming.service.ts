/**
 * Taming Service - Phase 9, Wave 9.2
 *
 * Handles wild animal taming mechanics
 */

import mongoose from 'mongoose';
import { AnimalCompanion } from '../models/AnimalCompanion.model';
import { Character, ICharacter } from '../models/Character.model';
import { TamingAttempt, ITamingAttempt } from '../models/TamingAttempt.model';
import { EnergyService } from './energy.service';
import {
  CompanionSpecies,
  AcquisitionMethod,
  TamingResult,
  WildEncounter,
  COMPANION_CONSTANTS
} from '@desperados/shared';
import { getSpeciesDefinition, getTameableSpecies } from '../data/companionSpecies';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import { SkillService } from './skill.service';

export class TamingService {
  /**
   * Maximum taming attempts before animal flees
   */
  static readonly MAX_ATTEMPTS = 5;

  /**
   * Get available wild encounters for a location
   */
  static async getWildEncounters(
    characterId: string,
    location: string
  ): Promise<WildEncounter[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const tameableSpecies = getTameableSpecies();
    const encounters: WildEncounter[] = [];

    // Filter species by location and level
    for (const speciesDef of tameableSpecies) {
      // Check if character meets level requirement
      if (character.level < speciesDef.levelRequired) {
        continue;
      }

      // Check reputation requirement
      if (speciesDef.reputationRequired) {
        const repFaction = speciesDef.reputationRequired.faction;
        const requiredRep = speciesDef.reputationRequired.amount;

        let currentRep = 0;
        if (repFaction === 'settlerAlliance') {
          currentRep = character.factionReputation.settlerAlliance;
        } else if (repFaction === 'nahiCoalition') {
          currentRep = character.factionReputation.nahiCoalition;
        } else if (repFaction === 'frontera') {
          currentRep = character.factionReputation.frontera;
        } else if (repFaction === 'criminalReputation') {
          currentRep = character.criminalReputation;
        }

        if (currentRep < requiredRep) {
          continue;
        }
      }

      // Calculate hostility (higher difficulty = more hostile)
      const hostility = Math.min(100, (speciesDef.tamingDifficulty || 5) * 10);

      // Add random chance to encounter (rarer species less likely)
      const rarityChance: Record<string, number> = {
        common: 0.8,
        uncommon: 0.5,
        rare: 0.3,
        epic: 0.15,
        legendary: 0.05
      };

      if (!SecureRNG.chance(rarityChance[speciesDef.rarity])) {
        continue;
      }

      encounters.push({
        species: speciesDef.species,
        location,
        tameable: true,
        hostility,
        difficulty: speciesDef.tamingDifficulty || 5,
        description: speciesDef.description
      });
    }

    return encounters;
  }

  /**
   * Attempt to tame a wild animal
   */
  static async attemptTaming(
    characterId: string,
    species: CompanionSpecies,
    location: string
  ): Promise<TamingResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Get species definition
      const speciesDef = getSpeciesDefinition(species);
      if (!speciesDef) {
        throw new AppError('Invalid species', 400);
      }

      // Check if tameable
      if (!speciesDef.acquisitionMethods.includes(AcquisitionMethod.TAMED)) {
        throw new AppError('This species cannot be tamed', 400);
      }

      if (!speciesDef.tamingDifficulty) {
        throw new AppError('This species has no taming difficulty', 400);
      }

      // Check level requirement
      if (character.level < speciesDef.levelRequired) {
        throw new AppError(
          `Requires level ${speciesDef.levelRequired}. Current: ${character.level}`,
          400
        );
      }

      // Check reputation requirement
      if (speciesDef.reputationRequired) {
        const repFaction = speciesDef.reputationRequired.faction;
        const requiredRep = speciesDef.reputationRequired.amount;

        let currentRep = 0;
        if (repFaction === 'settlerAlliance') {
          currentRep = character.factionReputation.settlerAlliance;
        } else if (repFaction === 'nahiCoalition') {
          currentRep = character.factionReputation.nahiCoalition;
        } else if (repFaction === 'frontera') {
          currentRep = character.factionReputation.frontera;
        } else if (repFaction === 'criminalReputation') {
          currentRep = character.criminalReputation;
        }

        if (currentRep < requiredRep) {
          throw new AppError(
            `Requires ${requiredRep} reputation with ${repFaction}. Current: ${currentRep}`,
            400
          );
        }
      }

      // Check energy
      const hasEnergy = await EnergyService.spendEnergy(
        characterId,
        COMPANION_CONSTANTS.TAMING_ENERGY_COST
      );

      if (!hasEnergy) {
        throw new AppError('Insufficient energy', 400);
      }

      // Check capacity
      const existingCompanions = await AnimalCompanion.findByOwner(characterId);
      if (existingCompanions.length >= COMPANION_CONSTANTS.BASE_KENNEL_CAPACITY) {
        throw new AppError('Kennel is full', 400);
      }

      // Get or create taming attempt
      let attempt = await TamingAttempt.findOne({
        characterId: character._id,
        species,
        status: 'in_progress',
        expiresAt: { $gt: new Date() }
      }).session(session);

      if (!attempt) {
        attempt = new TamingAttempt({
          characterId: character._id,
          species,
          location,
          progress: 0,
          attempts: 0,
          maxAttempts: this.MAX_ATTEMPTS,
          startedAt: new Date(),
          lastAttemptAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          status: 'in_progress'
        });
      }

      attempt.attempts += 1;
      attempt.lastAttemptAt = new Date();

      // Check if too many attempts (animal fled)
      if (attempt.attempts > this.MAX_ATTEMPTS) {
        attempt.status = 'failed';
        await attempt.save({ session });
        await session.abortTransaction();
        session.endSession();

        return {
          success: false,
          message: 'The animal has fled after too many failed attempts.',
          canRetry: false,
          energyCost: COMPANION_CONSTANTS.TAMING_ENERGY_COST
        };
      }

      // Calculate success chance
      const baseChance = 100 - (speciesDef.tamingDifficulty * 10);

      // Bonuses
      const effectiveSpirit = SkillService.getEffectiveStat(character, 'spirit');
      const spiritBonus = Math.floor(effectiveSpirit * 0.5); // Spirit helps taming
      const animalHandlingSkill = character.getSkillLevel('animal_handling'); // If such skill exists
      const skillBonus = animalHandlingSkill * 3;

      // Previous progress helps
      const progressBonus = attempt.progress * 0.2;

      const totalChance = Math.min(95, baseChance + spiritBonus + skillBonus + progressBonus);

      // Roll for success
      const roll = SecureRNG.d100();
      const success = roll < totalChance;

      if (success) {
        // Successfully tamed!
        attempt.status = 'success';
        attempt.progress = 100;
        await attempt.save({ session });

        // Create companion with low initial bond
        const companion = new AnimalCompanion({
          ownerId: character._id,
          name: `Wild ${speciesDef.name}`, // Default name, player can rename
          species,
          gender: SecureRNG.chance(0.5) ? 'male' : 'female',
          age: SecureRNG.range(12, 35), // 1-3 years old
          loyalty: speciesDef.baseStats.loyalty,
          intelligence: speciesDef.baseStats.intelligence,
          aggression: speciesDef.baseStats.aggression,
          health: speciesDef.baseStats.health,
          abilities: [], // Start with no abilities
          maxAbilities: speciesDef.maxAbilities,
          bondLevel: 10, // Low initial bond for tamed animals
          attackPower: speciesDef.combatStats.attackPower,
          defensePower: speciesDef.combatStats.defensePower,
          combatRole: speciesDef.combatStats.combatRole,
          trackingBonus: speciesDef.utilityStats.trackingBonus,
          huntingBonus: speciesDef.utilityStats.huntingBonus,
          guardBonus: speciesDef.utilityStats.guardBonus,
          socialBonus: speciesDef.utilityStats.socialBonus,
          currentHealth: speciesDef.baseStats.health,
          maxHealth: speciesDef.baseStats.health,
          hunger: 60, // Starts somewhat hungry
          happiness: 50, // Starts neutral
          isActive: false,
          location: 'kennel',
          acquiredMethod: AcquisitionMethod.TAMED
        });

        await companion.save({ session });

        // Award XP for taming
        const xpReward = speciesDef.tamingDifficulty * 50;
        await character.addExperience(xpReward);
        await character.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(
          `Character ${character.name} successfully tamed ${species} after ${attempt.attempts} attempts`
        );

        return {
          success: true,
          message: `Successfully tamed a ${speciesDef.name}! You can rename it in your kennel.`,
          companion: companion.toSafeObject(),
          energyCost: COMPANION_CONSTANTS.TAMING_ENERGY_COST
        };
      } else {
        // Failed attempt, but can retry
        attempt.progress += (100 - speciesDef.tamingDifficulty * 10) / this.MAX_ATTEMPTS;
        // Extend expiry on activity (24 hours from last attempt)
        attempt.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await attempt.save({ session });

        await session.commitTransaction();
        session.endSession();

        const remainingAttempts = this.MAX_ATTEMPTS - attempt.attempts;

        return {
          success: false,
          message: `Taming failed. The animal remains wary. ${remainingAttempts} attempts remaining.`,
          progress: attempt.progress,
          canRetry: remainingAttempts > 0,
          energyCost: COMPANION_CONSTANTS.TAMING_ENERGY_COST
        };
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Abandon current taming attempt
   */
  static async abandonTaming(characterId: string, species: CompanionSpecies): Promise<void> {
    await TamingAttempt.updateOne(
      {
        characterId: new mongoose.Types.ObjectId(characterId),
        species,
        status: 'in_progress'
      },
      {
        $set: { status: 'failed' }
      }
    );
  }

  /**
   * Get current taming progress
   */
  static async getTamingProgress(
    characterId: string,
    species: CompanionSpecies
  ): Promise<{ progress: number; attempts: number } | null> {
    const attempt = await TamingAttempt.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      species,
      status: 'in_progress',
      expiresAt: { $gt: new Date() }
    });

    if (!attempt) {
      return null;
    }

    return {
      progress: attempt.progress,
      attempts: attempt.attempts
    };
  }

  /**
   * Clean up expired taming attempts
   * Note: MongoDB TTL index handles automatic deletion, this is for manual cleanup
   */
  static async cleanupExpiredAttempts(): Promise<number> {
    const count = await TamingAttempt.cleanupExpired();
    if (count > 0) {
      logger.info(`Cleaned up ${count} expired taming attempts`);
    }
    return count;
  }
}

// Run cleanup every hour
// Note: MongoDB TTL index also handles automatic deletion
let tamingCleanupInterval: NodeJS.Timeout | null = null;

function startTamingCleanup(): void {
  if (!tamingCleanupInterval) {
    tamingCleanupInterval = setInterval(() => {
      TamingService.cleanupExpiredAttempts().catch((error) => {
        logger.error('Error cleaning up taming attempts:', error);
      });
    }, 60 * 60 * 1000);
  }
}

function stopTamingCleanup(): void {
  if (tamingCleanupInterval) {
    clearInterval(tamingCleanupInterval);
    tamingCleanupInterval = null;
  }
}

// Auto-start on module load
startTamingCleanup();

export { startTamingCleanup, stopTamingCleanup };
