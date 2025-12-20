/**
 * Companion Service - Phase 9, Wave 9.2
 *
 * Handles animal companion management, care, and activities
 */

import mongoose from 'mongoose';
import { AnimalCompanion, IAnimalCompanion } from '../models/AnimalCompanion.model';
import { Character, ICharacter } from '../models/Character.model';
import { DollarService } from './dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import {
  CompanionSpecies,
  CompanionAbilityId,
  AcquisitionMethod,
  CompanionListResponse,
  CompanionShopListing,
  FeedResult,
  TrainingResult,
  CompanionActivityResult,
  CompanionStatsSummary,
  CompanionCareTask,
  COMPANION_CONSTANTS
} from '@desperados/shared';
import { getSpeciesDefinition, getPurchasableSpecies } from '../data/companionSpecies';
import { getAbilityById } from '../data/companionAbilities';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class CompanionService {
  /**
   * Get all companions for a character
   */
  static async getCharacterCompanions(characterId: string): Promise<CompanionListResponse> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Get all companions
      const companions = await AnimalCompanion.findByOwner(characterId);

      // Update hunger and happiness for all companions
      for (const companion of companions) {
        companion.updateHungerAndHappiness();
        await companion.save({ session });
      }

      // Find active companion
      const activeCompanion = companions.find(c => c.isActive);

      // Calculate daily upkeep
      let dailyUpkeep = 0;
      for (const companion of companions) {
        const speciesDef = getSpeciesDefinition(companion.species);
        if (speciesDef) {
          dailyUpkeep += speciesDef.careRequirements.dailyFoodCost;
        }
      }

      // Get stats
      const stats = await AnimalCompanion.getOwnerStats(characterId);

      await session.commitTransaction();
      session.endSession();

      return {
        companions: companions.map(c => c.toSafeObject()),
        activeCompanion: activeCompanion ? activeCompanion.toSafeObject() : undefined,
        capacity: COMPANION_CONSTANTS.BASE_KENNEL_CAPACITY, // TODO: Expand with upgrades
        dailyUpkeep,
        stats
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Purchase a companion
   */
  static async purchaseCompanion(
    characterId: string,
    species: CompanionSpecies,
    name: string,
    gender: 'male' | 'female'
  ): Promise<IAnimalCompanion> {
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

      // Check if purchasable
      if (!speciesDef.acquisitionMethods.includes(AcquisitionMethod.PURCHASE)) {
        throw new AppError('This species cannot be purchased', 400);
      }

      if (!speciesDef.purchasePrice) {
        throw new AppError('This species has no purchase price', 400);
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

      // Check capacity
      const existingCompanions = await AnimalCompanion.findByOwner(characterId);
      if (existingCompanions.length >= COMPANION_CONSTANTS.BASE_KENNEL_CAPACITY) {
        throw new AppError('Kennel is full', 400);
      }

      // Check dollars
      if (!character.hasDollars(speciesDef.purchasePrice)) {
        throw new AppError(
          `Insufficient dollars. Need ${speciesDef.purchasePrice}, have ${character.dollars}`,
          400
        );
      }

      // Deduct dollars
      await character.deductDollars(
        speciesDef.purchasePrice,
        TransactionSource.COMPANION_PURCHASE,
        { species, name }
      );

      // Create companion
      const companion = new AnimalCompanion({
        ownerId: character._id,
        name,
        species,
        gender,
        age: 12, // 1 year old
        loyalty: speciesDef.baseStats.loyalty,
        intelligence: speciesDef.baseStats.intelligence,
        aggression: speciesDef.baseStats.aggression,
        health: speciesDef.baseStats.health,
        abilities: [], // Start with no abilities
        maxAbilities: speciesDef.maxAbilities,
        bondLevel: 30, // Purchased companions start with some bond
        attackPower: speciesDef.combatStats.attackPower,
        defensePower: speciesDef.combatStats.defensePower,
        combatRole: speciesDef.combatStats.combatRole,
        trackingBonus: speciesDef.utilityStats.trackingBonus,
        huntingBonus: speciesDef.utilityStats.huntingBonus,
        guardBonus: speciesDef.utilityStats.guardBonus,
        socialBonus: speciesDef.utilityStats.socialBonus,
        currentHealth: speciesDef.baseStats.health,
        maxHealth: speciesDef.baseStats.health,
        hunger: 80,
        happiness: 70,
        isActive: false,
        location: 'kennel',
        acquiredMethod: AcquisitionMethod.PURCHASE
      });

      await companion.save({ session });
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Character ${character.name} purchased ${species} companion "${name}" for ${speciesDef.purchasePrice} dollars`
      );

      return companion;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Set active companion
   */
  static async setActiveCompanion(
    characterId: string,
    companionId: string
  ): Promise<IAnimalCompanion> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Deactivate current active companion
      const currentActive = await AnimalCompanion.findActiveByOwner(characterId);
      if (currentActive) {
        currentActive.isActive = false;
        currentActive.location = 'kennel';
        await currentActive.save({ session });
      }

      // Activate new companion
      const companion = await AnimalCompanion.findById(companionId).session(session);
      if (!companion) {
        throw new AppError('Companion not found', 404);
      }

      if (companion.ownerId.toString() !== characterId) {
        throw new AppError('You do not own this companion', 403);
      }

      companion.isActive = true;
      companion.location = character.currentLocation;
      companion.lastActive = new Date();
      await companion.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Character ${character.name} activated companion ${companion.name} (${companion.species})`
      );

      return companion;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Feed a companion
   */
  static async feedCompanion(
    characterId: string,
    companionId: string
  ): Promise<FeedResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const companion = await AnimalCompanion.findById(companionId).session(session);
      if (!companion) {
        throw new AppError('Companion not found', 404);
      }

      if (companion.ownerId.toString() !== characterId) {
        throw new AppError('You do not own this companion', 403);
      }

      // Get species definition for food cost
      const speciesDef = getSpeciesDefinition(companion.species);
      if (!speciesDef) {
        throw new AppError('Invalid species', 400);
      }

      const foodCost = speciesDef.careRequirements.dailyFoodCost;

      // Check dollars
      if (!character.hasDollars(foodCost)) {
        throw new AppError(`Insufficient dollars. Need ${foodCost}, have ${character.dollars}`, 400);
      }

      // Deduct dollars
      await character.deductDollars(
        foodCost,
        TransactionSource.COMPANION_CARE,
        { companionId: companion._id, companionName: companion.name, action: 'feed' }
      );

      // Feed companion
      const hungerBefore = companion.hunger;
      const result = companion.feed(foodCost);

      await companion.save({ session });
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: `Fed ${companion.name}. Hunger restored, bond increased.`,
        hungerBefore,
        hungerAfter: companion.hunger,
        happinessChange: result.happinessGain,
        bondChange: result.bondGain,
        costGold: foodCost
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Heal a companion
   */
  static async healCompanion(
    characterId: string,
    companionId: string
  ): Promise<{ success: boolean; message: string; healthRestored: number; costGold: number }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const companion = await AnimalCompanion.findById(companionId).session(session);
      if (!companion) {
        throw new AppError('Companion not found', 404);
      }

      if (companion.ownerId.toString() !== characterId) {
        throw new AppError('You do not own this companion', 403);
      }

      // Calculate healing needed
      const healthDeficit = companion.maxHealth - companion.currentHealth;

      if (healthDeficit === 0) {
        throw new AppError('Companion is already at full health', 400);
      }

      // Calculate cost
      const healCost = Math.ceil(healthDeficit * COMPANION_CONSTANTS.HEAL_COST_PER_HP);

      // Check dollars
      if (!character.hasDollars(healCost)) {
        throw new AppError(`Insufficient dollars. Need ${healCost}, have ${character.dollars}`, 400);
      }

      // Deduct dollars
      await character.deductDollars(
        healCost,
        TransactionSource.COMPANION_CARE,
        { companionId: companion._id, companionName: companion.name, action: 'heal' }
      );

      // Heal companion
      companion.heal(healthDeficit);

      await companion.save({ session });
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: `${companion.name} has been fully healed.`,
        healthRestored: healthDeficit,
        costGold: healCost
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Start training an ability
   */
  static async startTraining(
    characterId: string,
    companionId: string,
    abilityId: CompanionAbilityId
  ): Promise<TrainingResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const companion = await AnimalCompanion.findById(companionId).session(session);
      if (!companion) {
        throw new AppError('Companion not found', 404);
      }

      if (companion.ownerId.toString() !== characterId) {
        throw new AppError('You do not own this companion', 403);
      }

      // Check if already training
      if (companion.trainingProgress) {
        throw new AppError('Companion is already training an ability', 400);
      }

      // Check if can learn ability
      if (!companion.canLearnAbility(abilityId)) {
        throw new AppError('Companion cannot learn this ability', 400);
      }

      // Training cost based on ability power
      const ability = getAbilityById(abilityId);
      if (!ability) {
        throw new AppError('Invalid ability', 400);
      }

      const trainingCost = Math.ceil(ability.power * 10);

      // Check dollars
      if (!character.hasDollars(trainingCost)) {
        throw new AppError(`Insufficient dollars. Need ${trainingCost}, have ${character.dollars}`, 400);
      }

      // Deduct dollars
      await character.deductDollars(
        trainingCost,
        TransactionSource.COMPANION_CARE,
        { companionId: companion._id, companionName: companion.name, action: 'train', abilityId }
      );

      // Start training
      companion.startTraining(abilityId);

      await companion.save({ session });
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: `${companion.name} is now training ${ability.name}. Will complete in ${COMPANION_CONSTANTS.TRAINING_TIME_HOURS} hours.`,
        ability: abilityId,
        progress: 0,
        completesAt: companion.trainingProgress?.completesAt,
        costGold: trainingCost
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Complete training
   */
  static async completeTraining(
    characterId: string,
    companionId: string
  ): Promise<{ success: boolean; message: string; abilityLearned: CompanionAbilityId }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const companion = await AnimalCompanion.findById(companionId).session(session);
      if (!companion) {
        throw new AppError('Companion not found', 404);
      }

      if (companion.ownerId.toString() !== characterId) {
        throw new AppError('You do not own this companion', 403);
      }

      // Try to complete training
      const learnedAbility = companion.completeTraining();

      if (!learnedAbility) {
        throw new AppError('Training is not yet complete', 400);
      }

      await companion.save({ session });

      await session.commitTransaction();
      session.endSession();

      const ability = getAbilityById(learnedAbility);
      const abilityName = ability ? ability.name : learnedAbility;

      return {
        success: true,
        message: `${companion.name} has learned ${abilityName}!`,
        abilityLearned: learnedAbility
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get companion care tasks
   */
  static async getCareTasks(characterId: string): Promise<CompanionCareTask[]> {
    const companions = await AnimalCompanion.findByOwner(characterId);
    const tasks: CompanionCareTask[] = [];

    for (const companion of companions) {
      companion.updateHungerAndHappiness();

      // Critical health
      if (companion.currentHealth < companion.maxHealth * 0.3) {
        tasks.push({
          companionId: companion._id.toString(),
          taskType: 'heal',
          description: `${companion.name} is critically injured and needs veterinary care`,
          urgency: 'critical',
          costGold: Math.ceil((companion.maxHealth - companion.currentHealth) * COMPANION_CONSTANTS.HEAL_COST_PER_HP)
        });
      }

      // Very hungry
      if (companion.hunger < 20) {
        const speciesDef = getSpeciesDefinition(companion.species);
        tasks.push({
          companionId: companion._id.toString(),
          taskType: 'feed',
          description: `${companion.name} is starving and needs food immediately`,
          urgency: 'critical',
          costGold: speciesDef?.careRequirements.dailyFoodCost || 5
        });
      } else if (companion.hunger < 40) {
        const speciesDef = getSpeciesDefinition(companion.species);
        tasks.push({
          companionId: companion._id.toString(),
          taskType: 'feed',
          description: `${companion.name} is very hungry`,
          urgency: 'high',
          costGold: speciesDef?.careRequirements.dailyFoodCost || 5
        });
      }

      // Low happiness
      if (companion.happiness < 30) {
        tasks.push({
          companionId: companion._id.toString(),
          taskType: 'play',
          description: `${companion.name} is unhappy and needs attention`,
          urgency: 'medium',
          timeRequired: 30
        });
      }

      // Training complete
      if (companion.trainingProgress && new Date() >= companion.trainingProgress.completesAt) {
        const ability = getAbilityById(companion.trainingProgress.abilityId);
        tasks.push({
          companionId: companion._id.toString(),
          taskType: 'train',
          description: `${companion.name} has finished learning ${ability?.name || 'an ability'}`,
          urgency: 'low'
        });
      }
    }

    // Sort by urgency
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return tasks;
  }

  /**
   * Get available companions for purchase
   */
  static async getShop(characterId: string): Promise<CompanionShopListing[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const purchasableSpecies = getPurchasableSpecies();
    const listings: CompanionShopListing[] = [];

    for (const speciesDef of purchasableSpecies) {
      let available = true;
      let reason: string | undefined;

      // Check level
      if (character.level < speciesDef.levelRequired) {
        available = false;
        reason = `Requires level ${speciesDef.levelRequired}`;
      }

      // Check reputation
      if (speciesDef.reputationRequired && available) {
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
          available = false;
          reason = `Requires ${requiredRep} ${repFaction} reputation`;
        }
      }

      listings.push({
        species: speciesDef.species,
        definition: speciesDef,
        available,
        reason,
        price: speciesDef.purchasePrice || 0
      });
    }

    return listings;
  }

  /**
   * Rename a companion
   */
  static async renameCompanion(
    characterId: string,
    companionId: string,
    newName: string
  ): Promise<IAnimalCompanion> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const companion = await AnimalCompanion.findById(companionId).session(session);
      if (!companion) {
        throw new AppError('Companion not found', 404);
      }

      if (companion.ownerId.toString() !== characterId) {
        throw new AppError('You do not own this companion', 403);
      }

      // Validate name
      if (newName.length < 2 || newName.length > 20) {
        throw new AppError('Name must be 2-20 characters', 400);
      }

      companion.name = newName.trim();
      await companion.save({ session });

      await session.commitTransaction();
      session.endSession();

      return companion;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Release a companion (remove from ownership)
   */
  static async releaseCompanion(
    characterId: string,
    companionId: string
  ): Promise<{ success: boolean; message: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const companion = await AnimalCompanion.findById(companionId).session(session);
      if (!companion) {
        throw new AppError('Companion not found', 404);
      }

      if (companion.ownerId.toString() !== characterId) {
        throw new AppError('You do not own this companion', 403);
      }

      const companionName = companion.name;

      await companion.deleteOne({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: `${companionName} has been released and returned to the wild.`
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
