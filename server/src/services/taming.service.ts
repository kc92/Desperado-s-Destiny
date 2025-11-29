/**
 * Taming Service - Phase 9, Wave 9.2
 *
 * Handles wild animal taming mechanics
 */

import mongoose from 'mongoose';
import { AnimalCompanion } from '../models/AnimalCompanion.model';
import { Character, ICharacter } from '../models/Character.model';
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

/**
 * Taming attempt storage (in-memory for now, could be moved to Redis)
 */
const tamingAttempts = new Map<string, {
  characterId: string;
  species: CompanionSpecies;
  progress: number;
  attempts: number;
  startedAt: Date;
}>();

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

      if (Math.random() > rarityChance[speciesDef.rarity]) {
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
      const attemptKey = `${characterId}-${species}`;
      let attempt = tamingAttempts.get(attemptKey);

      if (!attempt) {
        attempt = {
          characterId,
          species,
          progress: 0,
          attempts: 0,
          startedAt: new Date()
        };
        tamingAttempts.set(attemptKey, attempt);
      }

      attempt.attempts += 1;

      // Check if too many attempts (animal fled)
      if (attempt.attempts > this.MAX_ATTEMPTS) {
        tamingAttempts.delete(attemptKey);
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
      const spiritBonus = Math.floor(character.stats.spirit * 0.5); // Spirit helps taming
      const animalHandlingSkill = character.getSkillLevel('animal_handling'); // If such skill exists
      const skillBonus = animalHandlingSkill * 3;

      // Previous progress helps
      const progressBonus = attempt.progress * 0.2;

      const totalChance = Math.min(95, baseChance + spiritBonus + skillBonus + progressBonus);

      // Roll for success
      const roll = Math.random() * 100;
      const success = roll < totalChance;

      if (success) {
        // Successfully tamed!
        tamingAttempts.delete(attemptKey);

        // Create companion with low initial bond
        const companion = new AnimalCompanion({
          ownerId: character._id,
          name: `Wild ${speciesDef.name}`, // Default name, player can rename
          species,
          gender: Math.random() > 0.5 ? 'male' : 'female',
          age: Math.floor(Math.random() * 24) + 12, // 1-3 years old
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
  static abandonTaming(characterId: string, species: CompanionSpecies): void {
    const attemptKey = `${characterId}-${species}`;
    tamingAttempts.delete(attemptKey);
  }

  /**
   * Get current taming progress
   */
  static getTamingProgress(
    characterId: string,
    species: CompanionSpecies
  ): { progress: number; attempts: number } | null {
    const attemptKey = `${characterId}-${species}`;
    const attempt = tamingAttempts.get(attemptKey);

    if (!attempt) {
      return null;
    }

    return {
      progress: attempt.progress,
      attempts: attempt.attempts
    };
  }

  /**
   * Clean up old taming attempts (24 hour timeout)
   */
  static cleanupOldAttempts(): void {
    const now = Date.now();
    const timeout = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, attempt] of tamingAttempts.entries()) {
      if (now - attempt.startedAt.getTime() > timeout) {
        tamingAttempts.delete(key);
        logger.info(`Cleaned up old taming attempt: ${key}`);
      }
    }
  }
}

// Run cleanup every hour
setInterval(() => {
  TamingService.cleanupOldAttempts();
}, 60 * 60 * 1000);
