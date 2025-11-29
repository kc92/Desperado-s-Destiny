/**
 * Location Service
 *
 * Handles location-based gameplay including travel, contextual actions,
 * jobs, shops, and NPCs.
 */

import mongoose from 'mongoose';
import { Location, ILocation } from '../models/Location.model';
import { Character, ICharacter } from '../models/Character.model';
import { Action } from '../models/Action.model';
import { GoldService } from './gold.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { QuestService } from './quest.service';
import { WorldEventService } from './worldEvent.service';
import { WeatherService } from './weather.service';
import { EncounterService } from './encounter.service';
import { WorldEvent } from '../models/WorldEvent.model';
import { calculateDangerChance, rollForEncounter } from '../middleware/accessRestriction.middleware';
import logger from '../utils/logger';

/**
 * Travel result interface
 */
export interface TravelResult {
  success: boolean;
  newLocation: ILocation;
  energySpent: number;
  message: string;
  encounter?: any; // If random encounter triggered during travel
}

/**
 * Job result interface
 */
export interface JobResult {
  success: boolean;
  goldEarned: number;
  xpEarned: number;
  items: string[];
  message: string;
}

/**
 * Purchase result interface
 */
export interface PurchaseResult {
  success: boolean;
  itemId: string;
  goldSpent: number;
  message: string;
}

export class LocationService {
  /**
   * Get full location details with populated data
   */
  static async getLocationDetails(locationId: string): Promise<ILocation | null> {
    try {
      const location = await Location.findById(locationId).lean() as unknown as ILocation | null;
      return location;
    } catch (error) {
      logger.error('Error getting location details:', error);
      throw error;
    }
  }

  /**
   * Get available actions at a location for a character
   * Filters based on character level and skills
   */
  static async getAvailableActions(locationId: string, character: ICharacter): Promise<any[]> {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        return [];
      }

      // Get all actions for this location
      const actionIds = [...location.availableActions, ...location.availableCrimes];

      if (actionIds.length === 0) {
        return [];
      }

      const actions = await Action.find({
        _id: { $in: actionIds },
        isActive: true,
      });

      // Filter by character requirements
      const availableActions = actions.filter(action => {
        // Check level requirement
        if (action.requiredSkillLevel && character.level < action.requiredSkillLevel) {
          return false;
        }
        return true;
      });

      return availableActions.map(a => a.toSafeObject());
    } catch (error) {
      logger.error('Error getting available actions:', error);
      throw error;
    }
  }

  /**
   * Get available jobs at a location for a character
   */
  static async getAvailableJobs(locationId: string, character: ICharacter): Promise<any[]> {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        return [];
      }

      // Filter jobs by requirements
      const availableJobs = location.jobs.filter(job => {
        if (job.requirements) {
          if (job.requirements.minLevel && character.level < job.requirements.minLevel) {
            return false;
          }
          if (job.requirements.requiredSkill && job.requirements.skillLevel) {
            const skillLevel = character.getSkillLevel(job.requirements.requiredSkill);
            if (skillLevel < job.requirements.skillLevel) {
              return false;
            }
          }
        }
        return true;
      });

      return availableJobs;
    } catch (error) {
      logger.error('Error getting available jobs:', error);
      throw error;
    }
  }

  /**
   * Travel to a new location
   */
  static async travelToLocation(
    characterId: string,
    targetLocationId: string
  ): Promise<TravelResult> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      // Check if jailed
      if (character.isCurrentlyJailed()) {
        return {
          success: false,
          newLocation: null as any,
          energySpent: 0,
          message: 'Cannot travel while in jail',
        };
      }

      // Check if character has an unresolved encounter
      const activeEncounter = await EncounterService.getActiveEncounter(characterId);
      if (activeEncounter) {
        return {
          success: false,
          newLocation: null as any,
          energySpent: 0,
          message: 'You must resolve your current encounter before traveling',
          encounter: activeEncounter,
        };
      }

      // Get current and target locations
      const currentLocation = await Location.findById(character.currentLocation);
      const targetLocation = await Location.findById(targetLocationId);

      if (!targetLocation) {
        return {
          success: false,
          newLocation: null as any,
          energySpent: 0,
          message: 'Target location not found',
        };
      }

      // Determine travel cost
      let energyCost = 10; // Default base cost

      if (currentLocation) {
        const connection = currentLocation.connections.find(
          c => c.targetLocationId === targetLocationId
        );

        if (connection) {
          energyCost = connection.energyCost;
        } else {
          // Check if in same region (free travel within region)
          if (currentLocation.region === targetLocation.region) {
            energyCost = 5;
          } else {
            // Calculate distance-based cost
            energyCost = 15;
          }
        }
      }

      // Apply weather effects to travel energy cost
      try {
        const weather = await WeatherService.getLocationWeather(targetLocationId);
        if (weather) {
          const weatherMultiplier = weather.effects.energyCostModifier;
          energyCost = Math.ceil(energyCost * weatherMultiplier);

          if (weatherMultiplier !== 1.0) {
            logger.info(
              `Weather "${weather.weather}" (intensity: ${weather.intensity}) modified travel energy cost by ${weatherMultiplier}x`
            );
          }

          // Check if weather prevents travel
          if (!WeatherService.isWeatherTravelable(weather.weather, weather.intensity)) {
            return {
              success: false,
              newLocation: null as any,
              energySpent: 0,
              message: `Cannot travel in this weather: ${WeatherService.getWeatherDescription(weather.weather, weather.intensity)}`,
            };
          }
        }
      } catch (weatherError) {
        // Don't fail travel if weather check fails
        logger.error('Failed to check weather for travel modifiers:', weatherError);
      }

      // Apply world event modifiers to travel energy cost
      try {
        const activeEvents = await WorldEvent.find({
          status: 'ACTIVE',
          $or: [
            { region: targetLocation.region },
            { isGlobal: true }
          ]
        });

        for (const event of activeEvents) {
          for (const effect of event.worldEffects) {
            // DUST_STORM or other weather events: increase energy cost
            if (effect.type === 'energy_cost' && (effect.target === 'all' || effect.target === targetLocation.region)) {
              energyCost = Math.ceil(energyCost * effect.value);
              logger.info(`World event "${event.name}" modified travel energy cost by ${effect.value}x (${effect.description})`);
            }
          }
        }
      } catch (eventError) {
        // Don't fail travel if event check fails
        logger.error('Failed to check world events for travel modifiers:', eventError);
      }

      // Check and spend energy
      character.regenerateEnergy();
      if (character.energy < energyCost) {
        return {
          success: false,
          newLocation: null as any,
          energySpent: 0,
          message: `Not enough energy. Need ${energyCost}, have ${Math.floor(character.energy)}`,
        };
      }

      // Check location requirements
      if (targetLocation.requirements) {
        const req = targetLocation.requirements;

        if (req.minLevel && character.level < req.minLevel) {
          return {
            success: false,
            newLocation: null as any,
            energySpent: 0,
            message: `Requires level ${req.minLevel}`,
          };
        }

        if (req.gangMember && !character.gangId) {
          return {
            success: false,
            newLocation: null as any,
            energySpent: 0,
            message: 'Must be in a gang to access this location',
          };
        }
      }

      // Deduct energy (but don't complete travel yet - might trigger encounter)
      character.energy -= energyCost;
      character.lastActive = new Date();
      await character.save();

      // Roll for random encounter based on target location danger
      const worldState = await WorldEventService.getWorldState();
      const currentHour = worldState.gameHour;
      const dangerLevel = targetLocation.dangerLevel || 0;
      const encounterChance = calculateDangerChance(dangerLevel, currentHour, character.wantedLevel);

      if (rollForEncounter(encounterChance)) {
        // Trigger random encounter!
        const encounter = await EncounterService.rollForRandomEncounter(
          characterId,
          targetLocationId.toString(),
          dangerLevel.toString()
        );

        logger.info(
          `Random encounter triggered for character ${characterId} while traveling to ${targetLocation.name} (${encounterChance}% chance)`
        );

        // Return encounter without completing travel
        // Travel will complete after encounter is resolved
        return {
          success: true,
          newLocation: null as any, // Don't provide location yet
          energySpent: energyCost,
          message: 'An encounter blocks your path!',
          encounter,
        };
      }

      // No encounter - complete travel normally
      character.currentLocation = targetLocationId;
      await character.save();

      // Update quest progress for location visit
      await QuestService.onLocationVisited(characterId, targetLocationId);

      logger.info(`Character ${characterId} traveled to ${targetLocation.name}, spent ${energyCost} energy`);

      return {
        success: true,
        newLocation: targetLocation,
        energySpent: energyCost,
        message: `You arrive at ${targetLocation.name}`,
      };
    } catch (error) {
      logger.error('Error traveling to location:', error);
      throw error;
    }
  }

  /**
   * Perform a job at a location
   */
  static async performJob(
    characterId: string,
    locationId: string,
    jobId: string
  ): Promise<JobResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          goldEarned: 0,
          xpEarned: 0,
          items: [],
          message: 'Character not found',
        };
      }

      // Check if character is at the location
      if (character.currentLocation !== locationId) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          goldEarned: 0,
          xpEarned: 0,
          items: [],
          message: 'You must be at this location to perform this job',
        };
      }

      const location = await Location.findById(locationId).session(session);
      if (!location) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          goldEarned: 0,
          xpEarned: 0,
          items: [],
          message: 'Location not found',
        };
      }

      // Find the job
      const job = location.jobs.find(j => j.id === jobId);
      if (!job) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          goldEarned: 0,
          xpEarned: 0,
          items: [],
          message: 'Job not found at this location',
        };
      }

      // Check energy
      character.regenerateEnergy();
      if (character.energy < job.energyCost) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          goldEarned: 0,
          xpEarned: 0,
          items: [],
          message: `Not enough energy. Need ${job.energyCost}, have ${Math.floor(character.energy)}`,
        };
      }

      // Check requirements
      if (job.requirements) {
        if (job.requirements.minLevel && character.level < job.requirements.minLevel) {
          await session.abortTransaction();
          session.endSession();
          return {
            success: false,
            goldEarned: 0,
            xpEarned: 0,
            items: [],
            message: `Requires level ${job.requirements.minLevel}`,
          };
        }
      }

      // Spend energy
      character.energy -= job.energyCost;

      // Apply weather effects to job success
      let jobSuccessModifier = 1.0;
      try {
        const weather = await WeatherService.getLocationWeather(locationId);
        if (weather) {
          jobSuccessModifier = weather.effects.jobSuccessModifier;
          if (jobSuccessModifier !== 1.0) {
            logger.info(
              `Weather "${weather.weather}" (intensity: ${weather.intensity}) modified job success by ${jobSuccessModifier}x`
            );
          }
        }
      } catch (weatherError) {
        logger.error('Failed to check weather for job modifiers:', weatherError);
      }

      // Calculate rewards with weather modifier
      const baseGold = Math.floor(
        Math.random() * (job.rewards.goldMax - job.rewards.goldMin + 1) + job.rewards.goldMin
      );
      const goldEarned = Math.floor(baseGold * jobSuccessModifier);
      const xpEarned = Math.floor(job.rewards.xp * jobSuccessModifier);
      const items = job.rewards.items || [];

      // Add rewards
      await GoldService.addGold(
        character._id as any,
        goldEarned,
        TransactionSource.JOB_INCOME,
        {
          jobId: job.id,
          jobName: job.name,
          locationId,
          description: `Earned ${goldEarned} gold from ${job.name}`,
        },
        session
      );

      await character.addExperience(xpEarned);
      character.lastActive = new Date();
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} completed job ${job.name}: ${goldEarned} gold, ${xpEarned} XP`);

      return {
        success: true,
        goldEarned,
        xpEarned,
        items,
        message: `You completed ${job.name} and earned ${goldEarned} gold and ${xpEarned} XP`,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error performing job:', error);
      throw error;
    }
  }

  /**
   * Purchase an item from a shop
   */
  static async purchaseItem(
    characterId: string,
    locationId: string,
    shopId: string,
    itemId: string
  ): Promise<PurchaseResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          itemId: '',
          goldSpent: 0,
          message: 'Character not found',
        };
      }

      // Check if character is at the location
      if (character.currentLocation !== locationId) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          itemId: '',
          goldSpent: 0,
          message: 'You must be at this location to purchase items',
        };
      }

      const location = await Location.findById(locationId).session(session);
      if (!location) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          itemId: '',
          goldSpent: 0,
          message: 'Location not found',
        };
      }

      // Find the shop
      const shop = location.shops.find(s => s.id === shopId);
      if (!shop) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          itemId: '',
          goldSpent: 0,
          message: 'Shop not found at this location',
        };
      }

      // Find the item
      const item = shop.items.find(i => i.itemId === itemId);
      if (!item) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          itemId: '',
          goldSpent: 0,
          message: 'Item not found in this shop',
        };
      }

      // Check level requirement
      if (item.requiredLevel && character.level < item.requiredLevel) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          itemId: '',
          goldSpent: 0,
          message: `Requires level ${item.requiredLevel}`,
        };
      }

      // Check gold
      if (!character.hasGold(item.price)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          itemId: '',
          goldSpent: 0,
          message: `Not enough gold. Need ${item.price}, have ${character.gold}`,
        };
      }

      // Deduct gold
      await GoldService.deductGold(
        character._id as any,
        item.price,
        TransactionSource.SHOP_PURCHASE,
        {
          shopId,
          shopName: shop.name,
          itemId: item.itemId,
          itemName: item.name,
          description: `Purchased ${item.name} for ${item.price} gold`,
        },
        session
      );

      // Add item to inventory
      const existingItem = character.inventory.find(i => i.itemId === item.itemId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        character.inventory.push({
          itemId: item.itemId,
          quantity: 1,
          acquiredAt: new Date(),
        });
      }

      character.lastActive = new Date();
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} purchased ${item.name} for ${item.price} gold`);

      return {
        success: true,
        itemId: item.itemId,
        goldSpent: item.price,
        message: `You purchased ${item.name} for ${item.price} gold`,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error purchasing item:', error);
      throw error;
    }
  }

  /**
   * Get all locations for the territory map
   */
  static async getAllLocationsForMap(): Promise<any[]> {
    try {
      const locations = await Location.find({ isHidden: false })
        .select('name shortDescription type region icon dangerLevel factionInfluence connections isUnlocked')
        .lean();

      return locations;
    } catch (error) {
      logger.error('Error getting locations for map:', error);
      throw error;
    }
  }

  /**
   * Get connected locations from a given location
   */
  static async getConnectedLocations(locationId: string): Promise<ILocation[]> {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        return [];
      }

      const connectedIds = location.connections.map(c => c.targetLocationId);
      const connectedLocations = await Location.find({
        _id: { $in: connectedIds },
        isHidden: false,
      }).lean() as unknown as ILocation[];

      return connectedLocations;
    } catch (error) {
      logger.error('Error getting connected locations:', error);
      throw error;
    }
  }
}
