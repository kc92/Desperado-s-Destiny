/**
 * Encounter Service
 *
 * Handles random travel encounters between locations
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { Location, ILocation } from '../models/Location.model';
import { WorldState } from '../models/WorldState.model';
import { WorldEvent } from '../models/WorldEvent.model';
import {
  EncounterDefinition,
  ActiveEncounter,
  IEncounterDefinition,
  IActiveEncounter,
  EncounterType,
  TimeRestriction,
  EncounterEffect,
  EncounterOutcome
} from '../models/Encounter.model';
import { calculateDangerChance, rollForEncounter } from '../middleware/accessRestriction.middleware';
import { GoldService } from './gold.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { RegionType } from '@desperados/shared';
import logger from '../utils/logger';

export class EncounterService {
  /**
   * Roll for random encounter during travel
   * Returns encounter if one occurs, null otherwise
   */
  static async rollForRandomEncounter(
    characterId: string,
    fromLocationId: string,
    toLocationId: string
  ): Promise<IActiveEncounter | null> {
    try {
      // Get character for wanted level
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      // Check if character already has an unresolved encounter
      const existingEncounter = await ActiveEncounter.findUnresolvedByCharacter(characterId);
      if (existingEncounter) {
        return existingEncounter; // Return existing encounter instead of creating new
      }

      // Get destination location for danger level and region
      const toLocation = await Location.findById(toLocationId);
      if (!toLocation) {
        throw new Error('Destination location not found');
      }

      // Get world state for current hour
      const worldState = await WorldState.findOne().sort({ updatedAt: -1 });
      const currentHour = worldState?.gameHour ?? new Date().getHours();

      // Calculate base encounter chance
      let encounterChance = calculateDangerChance(
        toLocation.dangerLevel,
        currentHour,
        character.wantedLevel
      );

      // Apply world event modifiers to encounter chance
      let encounterModifier = 1.0;
      try {
        const activeEvents = await WorldEvent.find({
          status: 'ACTIVE',
          $or: [
            { region: toLocation.region },
            { isGlobal: true }
          ]
        });

        for (const event of activeEvents) {
          for (const effect of event.worldEffects) {
            // BANDIT_ACTIVITY: increase encounter chance
            // LAWMAN_PATROL: decrease encounter chance
            if (effect.type === 'danger_modifier' && (effect.target === 'all' || effect.target === toLocation.region)) {
              encounterModifier *= effect.value;
              logger.info(`World event "${event.name}" modified encounter chance by ${effect.value}x (${effect.description})`);
            }
          }
        }

        // Apply modifier to encounter chance
        encounterChance = Math.min(100, encounterChance * encounterModifier);
      } catch (eventError) {
        // Don't fail encounter roll if event check fails
        logger.error('Failed to check world events for danger modifiers:', eventError);
      }

      // Roll for encounter
      const encounterOccurs = rollForEncounter(encounterChance);

      if (!encounterOccurs) {
        logger.info(
          `No encounter for ${character.name} traveling to ${toLocation.name} (${encounterChance}% chance)`
        );
        return null;
      }

      // Get encounter pool
      const timeOfDay = this.getTimeOfDay(currentHour);
      const encounterPool = await this.getEncounterPool(
        toLocation.region,
        toLocation.dangerLevel,
        timeOfDay,
        character.level
      );

      if (encounterPool.length === 0) {
        logger.warn(
          `No encounters available for region ${toLocation.region}, danger ${toLocation.dangerLevel}`
        );
        return null;
      }

      // Select random encounter
      const selectedEncounter = this.selectRandomEncounter(encounterPool);

      // Create active encounter
      const activeEncounter = new ActiveEncounter({
        characterId: character._id,
        encounterId: selectedEncounter._id,
        encounterName: selectedEncounter.name,
        encounterDescription: selectedEncounter.description,
        encounterType: selectedEncounter.type,
        fromLocationId,
        toLocationId,
        region: toLocation.region,
        isResolved: false
      });

      await activeEncounter.save();

      logger.info(
        `Encounter created: ${selectedEncounter.name} for ${character.name} (${encounterChance}% chance)`
      );

      return activeEncounter;
    } catch (error) {
      logger.error('Error rolling for random encounter:', error);
      throw error;
    }
  }

  /**
   * Get pool of valid encounters for given conditions
   */
  static async getEncounterPool(
    region: RegionType,
    dangerLevel: number,
    timeOfDay: TimeRestriction,
    characterLevel: number
  ): Promise<IEncounterDefinition[]> {
    // Build query
    const query: any = {
      isActive: true,
      regions: region,
      minDangerLevel: { $lte: dangerLevel },
      maxDangerLevel: { $gte: dangerLevel }
    };

    // Add time restriction
    if (timeOfDay !== TimeRestriction.ANY) {
      query.timeRestriction = { $in: [timeOfDay, TimeRestriction.ANY] };
    }

    // Add level restrictions
    query.$or = [
      { minLevel: { $exists: false } },
      { minLevel: { $lte: characterLevel } }
    ];

    const encounters = await EncounterDefinition.find(query);

    // Filter by max level
    return encounters.filter(enc => {
      if (enc.maxLevel) {
        return characterLevel <= enc.maxLevel;
      }
      return true;
    });
  }

  /**
   * Select random encounter from pool based on weights
   */
  static selectRandomEncounter(pool: IEncounterDefinition[]): IEncounterDefinition {
    if (pool.length === 0) {
      throw new Error('Cannot select from empty encounter pool');
    }

    // Calculate total weight
    const totalWeight = pool.reduce((sum, enc) => sum + enc.weight, 0);

    // Roll random number
    let roll = Math.random() * totalWeight;

    // Select encounter based on weight
    for (const encounter of pool) {
      roll -= encounter.weight;
      if (roll <= 0) {
        return encounter;
      }
    }

    // Fallback to last encounter (shouldn't happen)
    return pool[pool.length - 1];
  }

  /**
   * Resolve an encounter with player's choice
   */
  static async resolveEncounter(
    characterId: string,
    activeEncounterId: string,
    choiceId: string
  ): Promise<{
    encounter: IActiveEncounter;
    effects: EncounterEffect;
    success: boolean;
    message: string;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get active encounter
      const activeEncounter = await ActiveEncounter.findById(activeEncounterId)
        .session(session);

      if (!activeEncounter) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Encounter not found');
      }

      // Verify ownership
      if (activeEncounter.characterId.toString() !== characterId) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Not your encounter');
      }

      // Verify not already resolved
      if (activeEncounter.isResolved) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Encounter already resolved');
      }

      // Get encounter definition
      const encounterDef = await EncounterDefinition.findById(activeEncounter.encounterId)
        .session(session);

      if (!encounterDef) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Encounter definition not found');
      }

      // Find the chosen outcome
      const outcome = encounterDef.outcomes.find(o => o.id === choiceId);
      if (!outcome) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Invalid choice');
      }

      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Character not found');
      }

      // Check requirements
      const meetsRequirements = this.checkRequirements(character, outcome);
      if (!meetsRequirements.success) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(meetsRequirements.reason || 'Requirements not met');
      }

      // Determine success/failure
      let success = true;
      let effectsToApply: EncounterEffect;

      if (outcome.successChance !== undefined) {
        const roll = Math.random() * 100;
        success = roll < outcome.successChance;
        effectsToApply = success ? outcome.effects : (outcome.failureEffects || outcome.effects);
      } else {
        effectsToApply = outcome.effects;
      }

      // Apply effects
      await this.applyEffects(character, effectsToApply, session);

      // Mark encounter as resolved
      activeEncounter.isResolved = true;
      activeEncounter.selectedOutcomeId = choiceId;
      activeEncounter.outcomeEffects = effectsToApply;
      activeEncounter.resolvedAt = new Date();
      await activeEncounter.save({ session });

      await session.commitTransaction();
      session.endSession();

      const message = success
        ? outcome.description
        : `Failed: ${outcome.description}`;

      logger.info(
        `Encounter resolved: ${encounterDef.name} for ${character.name} - Choice: ${choiceId}, Success: ${success}`
      );

      return {
        encounter: activeEncounter,
        effects: effectsToApply,
        success,
        message
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Attempt to flee from a combat encounter
   */
  static async attemptFlee(
    characterId: string,
    activeEncounterId: string
  ): Promise<{ success: boolean; escaped: boolean; message: string; damage?: number }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const activeEncounter = await ActiveEncounter.findById(activeEncounterId).session(session);
      if (!activeEncounter || activeEncounter.characterId.toString() !== characterId) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, escaped: false, message: 'Invalid encounter' };
      }

      if (activeEncounter.encounterType !== EncounterType.COMBAT) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, escaped: false, message: 'Can only flee from combat encounters' };
      }

      if (activeEncounter.isResolved) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, escaped: false, message: 'Encounter already resolved' };
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, escaped: false, message: 'Character not found' };
      }

      // Get danger level from destination location
      const destination = await Location.findById(activeEncounter.toLocationId);
      const dangerLevel = destination?.dangerLevel || 5;

      // Flee chance: 50% + (level * 2) - (danger * 5), clamped 20-85%
      const fleeChance = Math.max(20, Math.min(85, 50 + (character.level * 2) - (dangerLevel * 5)));
      const escaped = Math.random() * 100 < fleeChance;

      let damage = 0;
      if (!escaped) {
        // Failed flee: take damage based on danger level
        damage = Math.floor(dangerLevel * 5 * (0.1 + Math.random() * 0.2));
        // Deduct energy as a damage proxy
        character.energy = Math.max(0, character.energy - Math.floor(damage / 2));
      }

      // Mark encounter as resolved
      activeEncounter.isResolved = true;
      activeEncounter.selectedOutcomeId = escaped ? 'flee_success' : 'flee_failed';
      activeEncounter.resolvedAt = new Date();

      await activeEncounter.save({ session });
      await character.save({ session });
      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Character ${character.name} ${escaped ? 'successfully fled' : 'failed to flee'} from encounter (${fleeChance}% chance)`
      );

      return {
        success: true,
        escaped,
        message: escaped ? 'You escaped successfully!' : `Failed to escape! Took ${damage} damage trying to flee.`,
        damage: escaped ? 0 : damage
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get active unresolved encounter for a character
   */
  static async getActiveEncounter(characterId: string): Promise<IActiveEncounter | null> {
    return ActiveEncounter.findUnresolvedByCharacter(characterId);
  }

  /**
   * Get encounter with full definition details
   */
  static async getEncounterWithDetails(activeEncounterId: string): Promise<{
    active: IActiveEncounter;
    definition: IEncounterDefinition;
  } | null> {
    const activeEncounter = await ActiveEncounter.findById(activeEncounterId);
    if (!activeEncounter) {
      return null;
    }

    const definition = await EncounterDefinition.findById(activeEncounter.encounterId);
    if (!definition) {
      return null;
    }

    return {
      active: activeEncounter,
      definition
    };
  }

  /**
   * Check if character meets requirements for an outcome
   */
  private static checkRequirements(
    character: ICharacter,
    outcome: EncounterOutcome
  ): { success: boolean; reason?: string } {
    if (!outcome.requirements) {
      return { success: true };
    }

    const req = outcome.requirements;

    // Check level
    if (req.minLevel && character.level < req.minLevel) {
      return {
        success: false,
        reason: `Requires level ${req.minLevel}`
      };
    }

    // Check skill
    if (req.skill) {
      const skillLevel = character.getSkillLevel(req.skill.skillId);
      if (skillLevel < req.skill.level) {
        return {
          success: false,
          reason: `Requires ${req.skill.skillId} level ${req.skill.level}`
        };
      }
    }

    // Check item
    if (req.item) {
      const hasItem = character.inventory.some(
        inv => inv.itemId === req.item && inv.quantity > 0
      );
      if (!hasItem) {
        return {
          success: false,
          reason: `Requires ${req.item}`
        };
      }
    }

    // Check gold
    if (req.gold && !character.hasGold(req.gold)) {
      return {
        success: false,
        reason: `Requires ${req.gold} gold`
      };
    }

    return { success: true };
  }

  /**
   * Apply encounter effects to character
   */
  private static async applyEffects(
    character: ICharacter,
    effects: EncounterEffect,
    session: mongoose.ClientSession
  ): Promise<void> {
    // Apply world event modifiers to encounter loot
    let lootModifier = 1.0;
    try {
      const location = await Location.findById(character.currentLocation);
      if (location) {
        const activeEvents = await WorldEvent.find({
          status: 'ACTIVE',
          $or: [
            { region: location.region },
            { isGlobal: true }
          ]
        });

        for (const event of activeEvents) {
          for (const effect of event.worldEffects) {
            // BANDIT_ACTIVITY: better loot from encounters
            if (effect.type === 'spawn_rate' && effect.target === 'loot') {
              lootModifier *= effect.value;
              logger.info(`World event "${event.name}" modified encounter loot by ${effect.value}x (${effect.description})`);
            }
          }
        }
      }
    } catch (eventError) {
      // Don't fail if event check fails
      logger.error('Failed to check world events for loot modifiers:', eventError);
    }

    // Apply gold change (with loot modifier if positive)
    if (effects.gold) {
      if (effects.gold > 0) {
        const modifiedGold = Math.floor(effects.gold * lootModifier);
        await GoldService.addGold(
          character._id as any,
          modifiedGold,
          TransactionSource.ENCOUNTER,
          { description: 'Random encounter reward' },
          session
        );
      } else {
        const goldLost = Math.abs(effects.gold);
        const actualLoss = Math.min(goldLost, character.gold);
        if (actualLoss > 0) {
          await GoldService.deductGold(
            character._id as any,
            actualLoss,
            TransactionSource.ENCOUNTER,
            { description: 'Random encounter cost' },
            session
          );
        }
      }
    }

    // Apply XP (with loot modifier)
    if (effects.xp && effects.xp > 0) {
      const modifiedXp = Math.floor(effects.xp * lootModifier);
      await character.addExperience(modifiedXp);
    }

    // Apply damage (not implemented yet - would require HP system)
    if (effects.damage && effects.damage > 0) {
      logger.info(`Character ${character.name} took ${effects.damage} damage from encounter`);
      // TODO: Implement HP damage when HP system is added
    }

    // Add items
    if (effects.items && effects.items.length > 0) {
      for (const itemId of effects.items) {
        const existingItem = character.inventory.find(i => i.itemId === itemId);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          character.inventory.push({
            itemId,
            quantity: 1,
            acquiredAt: new Date()
          });
        }
      }
    }

    // Remove items
    if (effects.itemsLost && effects.itemsLost.length > 0) {
      for (const itemId of effects.itemsLost) {
        const item = character.inventory.find(i => i.itemId === itemId);
        if (item) {
          item.quantity = Math.max(0, item.quantity - 1);
        }
      }
      // Clean up zero-quantity items
      character.inventory = character.inventory.filter(i => i.quantity > 0);
    }

    // Apply wanted level change
    if (effects.wantedLevel) {
      if (effects.wantedLevel > 0) {
        character.increaseWantedLevel(effects.wantedLevel);
      } else {
        character.decreaseWantedLevel(Math.abs(effects.wantedLevel));
      }
    }

    // Apply reputation change
    if (effects.reputation) {
      const { faction, amount } = effects.reputation;
      const currentRep = character.factionReputation[`${faction}Alliance` as keyof typeof character.factionReputation]
        || character.factionReputation[faction as keyof typeof character.factionReputation]
        || 0;
      const newRep = Math.max(-100, Math.min(100, currentRep + amount));

      if (faction === 'settler') {
        character.factionReputation.settlerAlliance = newRep;
      } else if (faction === 'nahi') {
        character.factionReputation.nahiCoalition = newRep;
      } else if (faction === 'frontera') {
        character.factionReputation.frontera = newRep;
      }
    }

    // Apply energy cost (already spent for travel, but could add extra)
    if (effects.energyCost && effects.energyCost > 0) {
      character.energy = Math.max(0, character.energy - effects.energyCost);
    }

    await character.save({ session });
  }

  /**
   * Convert current hour to time of day restriction
   */
  private static getTimeOfDay(hour: number): TimeRestriction {
    // Night: 10pm - 6am (22-23, 0-5)
    if (hour >= 22 || hour < 6) {
      return TimeRestriction.NIGHT;
    }
    // Day: 6am - 10pm (6-21)
    return TimeRestriction.DAY;
  }

  /**
   * Get encounter history for a character
   */
  static async getEncounterHistory(
    characterId: string,
    limit: number = 20
  ): Promise<IActiveEncounter[]> {
    return ActiveEncounter.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      isResolved: true
    })
      .sort({ resolvedAt: -1 })
      .limit(limit);
  }

  /**
   * Get encounter statistics for a character
   */
  static async getEncounterStats(characterId: string): Promise<{
    total: number;
    byType: Record<EncounterType, number>;
    totalGoldEarned: number;
    totalGoldLost: number;
    totalXpEarned: number;
  }> {
    const encounters = await ActiveEncounter.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      isResolved: true
    });

    const stats = {
      total: encounters.length,
      byType: {
        [EncounterType.COMBAT]: 0,
        [EncounterType.EVENT]: 0,
        [EncounterType.DISCOVERY]: 0,
        [EncounterType.STORY]: 0
      },
      totalGoldEarned: 0,
      totalGoldLost: 0,
      totalXpEarned: 0
    };

    for (const encounter of encounters) {
      stats.byType[encounter.encounterType] += 1;

      if (encounter.outcomeEffects) {
        const effects = encounter.outcomeEffects;
        if (effects.gold) {
          if (effects.gold > 0) {
            stats.totalGoldEarned += effects.gold;
          } else {
            stats.totalGoldLost += Math.abs(effects.gold);
          }
        }
        if (effects.xp && effects.xp > 0) {
          stats.totalXpEarned += effects.xp;
        }
      }
    }

    return stats;
  }
}
