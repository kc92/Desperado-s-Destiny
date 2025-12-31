/**
 * Location Service
 *
 * Handles location-based gameplay including travel, contextual actions,
 * jobs, shops, and NPCs.
 */

import mongoose from 'mongoose';
import { Location, ILocation } from '../models/Location.model';
import { Character, ICharacter } from '../models/Character.model';
import { Action, ActionType } from '../models/Action.model';
import { NPC, INPC } from '../models/NPC.model';
import { NPCType } from '@desperados/shared';
import { GoldService } from './gold.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { QuestService } from './quest.service';
import { WorldEventService } from './worldEvent.service';
import { WeatherService } from './weather.service';
import { EncounterService } from './encounter.service';
import { PlayerEventService } from './playerEvent.service';
import { WorldEvent } from '../models/WorldEvent.model';
import { calculateDangerChance, rollForEncounter } from '../middleware/accessRestriction.middleware';
import { ZONE_INFO, WorldZoneType, getAdjacentZones, LocationJob, SkillCategory } from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import { ActionDeckSession } from '../models/ActionDeckSession.model';
import { initGame, getGameTypeForJobCategory, GameState, Suit } from './deckGames';
import {
  GLOBAL_ACTIONS,
  CRIME_LOCATION_MAP,
  COMBAT_LOCATION_MAP,
  CRAFT_LOCATION_MAP,
  SOCIAL_LOCATION_MAP,
  getLocationTypeFromSlug,
  LocationType,
} from '../constants/globalActions';

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

/**
 * Job game start result interface
 */
export interface JobGameStartResult {
  success: boolean;
  gameState?: GameState;
  jobInfo?: {
    id: string;
    name: string;
    description: string;
    jobCategory: string;
    energyCost: number;
    rewards: {
      goldMin: number;
      goldMax: number;
      xp: number;
      items?: string[];
    };
  };
  message?: string;
}

/**
 * Map job categories to relevant suits for skill bonuses
 */
const JOB_CATEGORY_SUITS: Record<string, Suit> = {
  labor: 'clubs',      // Physical work - Clubs (combat/strength)
  skilled: 'diamonds', // Precision crafting - Diamonds (craft)
  dangerous: 'spades', // Risk/crime - Spades (crime)
  social: 'hearts'     // Social interactions - Hearts (social)
};

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
   * Get actions available at a location filtered by location TYPE
   * Uses the globalActions constants to determine what's available
   * Also filters crimes by character CUNNING skill level
   *
   * Phase 7: Location-Specific Actions System
   */
  static async getActionsForLocationByType(
    locationId: string,
    character: ICharacter
  ): Promise<{
    crimes: any[];
    combat: any[];
    craft: any[];
    social: any[];
    global: any[];
  }> {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        return { crimes: [], combat: [], craft: [], social: [], global: [] };
      }

      // Determine location type from the location's type field or infer from name
      const locationSlug = location.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      const locationType: LocationType = (location.type as LocationType) || getLocationTypeFromSlug(locationSlug) || 'frontier';

      logger.debug(`Getting actions for location ${location.name} (type: ${locationType})`);

      // Get action names that should be available at this location type
      const availableCrimeNames: string[] = [];
      const availableCombatNames: string[] = [];
      const availableCraftNames: string[] = [];
      const availableSocialNames: string[] = [];

      // Check each map for actions available at this location type
      for (const [actionName, locationTypes] of Object.entries(CRIME_LOCATION_MAP)) {
        if (locationTypes.includes(locationType)) {
          availableCrimeNames.push(actionName);
        }
      }

      for (const [actionName, locationTypes] of Object.entries(COMBAT_LOCATION_MAP)) {
        if (locationTypes.includes(locationType)) {
          availableCombatNames.push(actionName);
        }
      }

      for (const [actionName, locationTypes] of Object.entries(CRAFT_LOCATION_MAP)) {
        if (locationTypes.includes(locationType)) {
          availableCraftNames.push(actionName);
        }
      }

      for (const [actionName, locationTypes] of Object.entries(SOCIAL_LOCATION_MAP)) {
        if (locationTypes.includes(locationType)) {
          availableSocialNames.push(actionName);
        }
      }

      // Fetch all actions by name
      const allActionNames = [
        ...availableCrimeNames,
        ...availableCombatNames,
        ...availableCraftNames,
        ...availableSocialNames,
        ...GLOBAL_ACTIONS,
      ];

      const actions = await Action.find({
        name: { $in: allActionNames },
        isActive: true,
      });

      // Get character's CUNNING skill level for crime filtering
      const cunningLevel = character.getSkillLevel('CUNNING') || character.getSkillLevel('cunning') || 0;

      // Categorize and filter actions
      const crimes: any[] = [];
      const combat: any[] = [];
      const craft: any[] = [];
      const social: any[] = [];
      const global: any[] = [];

      for (const action of actions) {
        const safeAction = action.toSafeObject();

        // Filter crimes by CUNNING skill level (hide crimes player can't attempt)
        if (action.type === ActionType.CRIME) {
          // Check if player has required CUNNING level
          const requiredLevel = action.requiredSkillLevel || 1;
          if (cunningLevel >= requiredLevel && availableCrimeNames.includes(action.name)) {
            crimes.push(safeAction);
          }
        } else if (action.type === ActionType.COMBAT) {
          // Combat filtered by character level
          const requiredLevel = action.requiredSkillLevel || 1;
          if (character.level >= requiredLevel && availableCombatNames.includes(action.name)) {
            combat.push(safeAction);
          }
        } else if (action.type === ActionType.CRAFT) {
          // Craft actions - check level requirement
          const requiredLevel = action.requiredSkillLevel || 1;
          if (character.level >= requiredLevel && availableCraftNames.includes(action.name)) {
            craft.push(safeAction);
          }
        } else if (action.type === ActionType.SOCIAL) {
          // Social actions
          if (GLOBAL_ACTIONS.includes(action.name)) {
            global.push(safeAction);
          } else if (availableSocialNames.includes(action.name)) {
            social.push(safeAction);
          }
        }
      }

      // Sort each category by difficulty
      crimes.sort((a, b) => a.difficulty - b.difficulty);
      combat.sort((a, b) => a.difficulty - b.difficulty);
      craft.sort((a, b) => a.difficulty - b.difficulty);
      social.sort((a, b) => a.difficulty - b.difficulty);
      global.sort((a, b) => a.difficulty - b.difficulty);

      logger.debug(`Actions at ${location.name}: ${crimes.length} crimes, ${combat.length} combat, ${craft.length} craft, ${social.length} social, ${global.length} global`);

      return { crimes, combat, craft, social, global };
    } catch (error) {
      logger.error('Error getting actions by location type:', error);
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
   *
   * NOTE: Refactored to use single atomic transaction (Initiative 12)
   * - Rolls for encounter BEFORE deducting energy
   * - Single save operation instead of two
   * - Crash-safe with MongoDB session
   */
  static async travelToLocation(
    characterId: string,
    targetLocationId: string
  ): Promise<TravelResult> {
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Character not found');
      }

      // Check if jailed
      if (character.isCurrentlyJailed()) {
        await session.abortTransaction();
        session.endSession();
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
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          newLocation: null as any,
          energySpent: 0,
          message: 'You must resolve your current encounter before traveling',
          encounter: activeEncounter,
        };
      }

      // Get current and target locations
      const currentLocation = await Location.findById(character.currentLocation).session(session);
      const targetLocation = await Location.findById(targetLocationId).session(session);

      if (!targetLocation) {
        await session.abortTransaction();
        session.endSession();
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
            await session.abortTransaction();
            session.endSession();
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

      // Check energy availability (BEFORE deducting)
      await character.regenerateEnergy();
      if (character.energy < energyCost) {
        await session.abortTransaction();
        session.endSession();
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
          await session.abortTransaction();
          session.endSession();
          return {
            success: false,
            newLocation: null as any,
            energySpent: 0,
            message: `Requires level ${req.minLevel}`,
          };
        }

        if (req.gangMember && !character.gangId) {
          await session.abortTransaction();
          session.endSession();
          return {
            success: false,
            newLocation: null as any,
            energySpent: 0,
            message: 'Must be in a gang to access this location',
          };
        }
      }

      // Roll for random encounter FIRST (before deducting energy)
      const worldState = await WorldEventService.getWorldState();
      const currentHour = worldState.gameHour;
      const dangerLevel = targetLocation.dangerLevel || 0;
      const encounterChance = calculateDangerChance(dangerLevel, currentHour, character.wantedLevel);

      let encounter = null;
      if (rollForEncounter(encounterChance)) {
        // Trigger random encounter!
        encounter = await EncounterService.rollForRandomEncounter(
          characterId,
          targetLocationId.toString(),
          dangerLevel.toString()
        );

        logger.info(
          `Random encounter triggered for character ${characterId} while traveling to ${targetLocation.name} (${encounterChance}% chance)`
        );
      }

      // Check for player-triggered events (bounty hunter, night bandit, etc.)
      // Only check if no base encounter was triggered
      if (!encounter) {
        const playerEvent = await PlayerEventService.checkForPlayerEvent(
          characterId,
          targetLocationId.toString()
        );

        if (playerEvent.triggered && playerEvent.encounterId) {
          // Player event created an encounter
          encounter = await EncounterService.getActiveEncounter(characterId);
          logger.info(
            `Player event triggered: ${playerEvent.eventType} for character ${characterId}`
          );
        }
      }

      // NOW deduct energy and update location/lastActive atomically
      character.energy -= energyCost;
      character.lastActive = new Date();

      // If no encounter, complete travel by updating location
      if (!encounter) {
        character.currentLocation = targetLocationId;
      }

      // SINGLE SAVE with transaction
      await character.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Update quest progress for location visit (fire-and-forget, outside transaction)
      // This is safe because quest progress is not critical to travel completion
      if (!encounter) {
        // Trigger with ObjectId for direct matches
        QuestService.onLocationVisited(characterId, targetLocationId).catch(err =>
          logger.error('Quest update failed after travel:', err)
        );
        // Also trigger with slug format for quest matching
        const locationSlug = targetLocation.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        QuestService.onLocationVisited(characterId, `location:${locationSlug}`).catch(err =>
          logger.error('Quest slug update failed after travel:', err)
        );
      }

      // Return appropriate result
      if (encounter) {
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

      // No encounter - travel completed successfully
      logger.info(`Character ${characterId} traveled to ${targetLocation.name}, spent ${energyCost} energy`);

      return {
        success: true,
        newLocation: targetLocation,
        energySpent: energyCost,
        message: `You arrive at ${targetLocation.name}`,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
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
    try {
      const character = await Character.findById(characterId);
      if (!character) {
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
        return {
          success: false,
          goldEarned: 0,
          xpEarned: 0,
          items: [],
          message: 'You must be at this location to perform this job',
        };
      }

      const location = await Location.findById(locationId);
      if (!location) {
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
          return {
            success: false,
            goldEarned: 0,
            xpEarned: 0,
            items: [],
            message: `Requires level ${job.requirements.minLevel}`,
          };
        }
      }

      // Check cooldown
      const cooldowns = character.jobCooldowns as Map<string, Date>;
      const lastJobTime = cooldowns.get(jobId);
      if (lastJobTime) {
        const cooldownMinutes = job.cooldownMinutes;
        const cooldownMs = cooldownMinutes * 60 * 1000;
        const timeSinceLastJob = Date.now() - lastJobTime.getTime();

        if (timeSinceLastJob < cooldownMs) {
          const remainingMs = cooldownMs - timeSinceLastJob;
          const remainingMinutes = Math.ceil(remainingMs / 60000);
          return {
            success: false,
            goldEarned: 0,
            xpEarned: 0,
            items: [],
            message: `Job on cooldown. Try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`,
          };
        }
      }

      // Spend energy
      character.energy -= job.energyCost;

      // Set cooldown for this job
      cooldowns.set(jobId, new Date());
      character.jobCooldowns = cooldowns;

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
      const baseGold = SecureRNG.range(job.rewards.goldMin, job.rewards.goldMax);
      const goldEarned = Math.floor(baseGold * jobSuccessModifier);
      const xpEarned = Math.floor(job.rewards.xp * jobSuccessModifier);
      const items = job.rewards.items || [];

      // Add rewards (without session)
      await GoldService.addGold(
        character._id as any,
        goldEarned,
        TransactionSource.JOB_INCOME,
        {
          jobId: job.id,
          jobName: job.name,
          locationId,
          description: `Earned ${goldEarned} gold from ${job.name}`,
        }
      );

      await character.addExperience(xpEarned);
      character.lastActive = new Date();
      await character.save();

      logger.info(`Character ${characterId} completed job ${job.name}: ${goldEarned} gold, ${xpEarned} XP`);

      return {
        success: true,
        goldEarned,
        xpEarned,
        items,
        message: `You completed ${job.name} and earned $${goldEarned} and ${xpEarned} XP`,
      };
    } catch (error) {
      logger.error('Error performing job:', error);
      throw error;
    }
  }

  /**
   * Start a job with deck game
   * Initiates a deck game session for the job - rewards based on performance
   */
  static async startJobWithDeck(
    characterId: string,
    locationId: string,
    jobId: string
  ): Promise<JobGameStartResult> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return {
          success: false,
          message: 'Character not found',
        };
      }

      // Check if character is at the location
      if (character.currentLocation !== locationId) {
        return {
          success: false,
          message: 'You must be at this location to perform this job',
        };
      }

      const location = await Location.findById(locationId);
      if (!location) {
        return {
          success: false,
          message: 'Location not found',
        };
      }

      // Find the job
      const job = location.jobs.find(j => j.id === jobId);
      if (!job) {
        return {
          success: false,
          message: 'Job not found at this location',
        };
      }

      // Check energy (but don't spend yet - spent on completion)
      character.regenerateEnergy();
      if (character.energy < job.energyCost) {
        return {
          success: false,
          message: `Not enough energy. Need ${job.energyCost}, have ${Math.floor(character.energy)}`,
        };
      }

      // Check requirements
      if (job.requirements) {
        if (job.requirements.minLevel && character.level < job.requirements.minLevel) {
          return {
            success: false,
            message: `Requires level ${job.requirements.minLevel}`,
          };
        }
      }

      // Check cooldown
      const cooldowns = character.jobCooldowns as Map<string, Date>;
      const lastJobTime = cooldowns.get(jobId);
      if (lastJobTime) {
        const cooldownMinutes = job.cooldownMinutes;
        const cooldownMs = cooldownMinutes * 60 * 1000;
        const timeSinceLastJob = Date.now() - lastJobTime.getTime();

        if (timeSinceLastJob < cooldownMs) {
          const remainingMs = cooldownMs - timeSinceLastJob;
          const remainingMinutes = Math.ceil(remainingMs / 60000);
          return {
            success: false,
            message: `Job on cooldown. Try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`,
          };
        }
      }

      // Determine game type based on job category
      const jobCategory = (job as any).jobCategory || 'labor';
      const gameType = getGameTypeForJobCategory(jobCategory);

      // Determine relevant suit for skill bonus
      const relevantSuit = JOB_CATEGORY_SUITS[jobCategory] || 'clubs';

      // Get character's skill bonus for this suit
      const characterSuitBonus = character.getSkillBonusForSuit(relevantSuit);

      logger.info(`[startJobWithDeck] Starting job ${job.name} (${jobCategory}) for character ${characterId}`);
      logger.info(`[startJobWithDeck] Game type: ${gameType}, Suit: ${relevantSuit}, Skill bonus: ${characterSuitBonus}`);

      // Initialize deck game with character skills
      const gameState = initGame({
        gameType,
        playerId: characterId,
        difficulty: Math.ceil((job.rewards.goldMax - job.rewards.goldMin) / 10), // Derive difficulty from reward range
        relevantSuit,
        timeLimit: 90, // 90 seconds for jobs
        characterSuitBonus,
        baseReward: job.rewards.goldMin
      });

      // Store session in database with job metadata
      await ActionDeckSession.create({
        sessionId: gameState.gameId,
        characterId,
        actionId: jobId, // Using actionId field for jobId
        action: {
          ...job,
          jobCategory,
          locationId,
          isJob: true // Flag to identify this is a job, not an action
        },
        character: character.toObject(),
        gameState,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      });

      logger.info(`[startJobWithDeck] Created session ${gameState.gameId} for job ${job.name}`);

      return {
        success: true,
        gameState,
        jobInfo: {
          id: job.id,
          name: job.name,
          description: job.description,
          jobCategory,
          energyCost: job.energyCost,
          rewards: job.rewards
        }
      };
    } catch (error) {
      logger.error('Error starting job with deck:', error);
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
      if (!character.hasDollars(item.price)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          itemId: '',
          goldSpent: 0,
          message: `Not enough dollars. Need $${item.price}, have $${character.dollars}`,
        };
      }

      // End session - we'll use atomic operations instead of transactions
      // MongoDB doesn't allow multiple writes to same doc in a transaction
      await session.abortTransaction();
      session.endSession();

      // Check if item already exists in inventory
      const existingItem = character.inventory.find(i => i.itemId === item.itemId);

      // Perform atomic update: deduct gold AND update inventory in one operation
      // This avoids the WriteConflict that occurs with separate transaction writes
      let updateResult;
      if (existingItem) {
        // Item exists - increment quantity and deduct gold atomically
        updateResult = await Character.findOneAndUpdate(
          {
            _id: characterId,
            dollars: { $gte: item.price },
            'inventory.itemId': item.itemId
          },
          {
            $inc: {
              dollars: -item.price,
              gold: -item.price,
              'inventory.$.quantity': 1
            },
            $set: { lastActive: new Date() }
          },
          { new: true }
        );
      } else {
        // New item - push to inventory and deduct gold atomically
        updateResult = await Character.findOneAndUpdate(
          {
            _id: characterId,
            dollars: { $gte: item.price }
          },
          {
            $inc: {
              dollars: -item.price,
              gold: -item.price
            },
            $push: {
              inventory: {
                itemId: item.itemId,
                quantity: 1,
                acquiredAt: new Date()
              }
            },
            $set: { lastActive: new Date() }
          },
          { new: true }
        );
      }

      if (!updateResult) {
        return {
          success: false,
          itemId: '',
          goldSpent: 0,
          message: `Purchase failed - insufficient funds or concurrent request`,
        };
      }

      logger.info(`Character ${characterId} purchased ${item.name} for ${item.price} gold`);

      return {
        success: true,
        itemId: item.itemId,
        goldSpent: item.price,
        message: `You purchased ${item.name} for $${item.price}`,
      };
    } catch (error) {
      // Session cleanup handled above when we abort it
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
        .select('name shortDescription type region zone isZoneHub icon dangerLevel factionInfluence connections isUnlocked')
        .lean();

      return locations;
    } catch (error) {
      logger.error('Error getting locations for map:', error);
      throw error;
    }
  }

  /**
   * Get all locations in a specific zone
   */
  static async getLocationsByZone(zone: WorldZoneType): Promise<ILocation[]> {
    try {
      const locations = await Location.find({
        zone,
        isHidden: false
      }).lean() as unknown as ILocation[];

      return locations;
    } catch (error) {
      logger.error(`Error getting locations for zone ${zone}:`, error);
      throw error;
    }
  }

  /**
   * Get zone hubs (main entry points for each zone)
   */
  static async getZoneHubs(): Promise<ILocation[]> {
    try {
      const hubs = await Location.find({
        isZoneHub: true,
        isHidden: false,
      }).lean() as unknown as ILocation[];

      return hubs;
    } catch (error) {
      logger.error('Error getting zone hubs:', error);
      throw error;
    }
  }

  /**
   * Get zone information for a location
   */
  static async getLocationZoneInfo(locationId: string): Promise<{
    currentZone: WorldZoneType | null;
    zoneInfo: typeof ZONE_INFO[WorldZoneType] | null;
    adjacentZones: WorldZoneType[];
    zoneExits: ILocation[];
  }> {
    try {
      const location = await Location.findById(locationId);
      if (!location || !location.zone) {
        return {
          currentZone: null,
          zoneInfo: null,
          adjacentZones: [],
          zoneExits: [],
        };
      }

      const currentZone = location.zone as WorldZoneType;
      const zoneInfo = ZONE_INFO[currentZone];
      const adjacentZones = getAdjacentZones(currentZone);

      // Get zone hub locations for adjacent zones
      const zoneExits = await Location.find({
        zone: { $in: adjacentZones },
        isZoneHub: true,
        isHidden: false,
      }).lean() as unknown as ILocation[];

      return {
        currentZone,
        zoneInfo,
        adjacentZones,
        zoneExits,
      };
    } catch (error) {
      logger.error('Error getting location zone info:', error);
      throw error;
    }
  }

  /**
   * Get connected locations with zone categorization
   * Returns local connections (same zone) and zone exits (to other zones)
   */
  static async getConnectedLocationsWithZones(locationId: string): Promise<{
    localConnections: ILocation[];
    zoneExits: { zone: WorldZoneType; hub: ILocation; energyCost: number }[];
    currentZone: WorldZoneType | null;
    zoneInfo: typeof ZONE_INFO[WorldZoneType] | null;
  }> {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        return {
          localConnections: [],
          zoneExits: [],
          currentZone: null,
          zoneInfo: null,
        };
      }

      const currentZone = location.zone as WorldZoneType | undefined;
      const zoneInfo = currentZone ? ZONE_INFO[currentZone] : null;

      // Get direct connections
      const connectedIds = location.connections.map(c => c.targetLocationId);
      const connectedLocations = await Location.find({
        _id: { $in: connectedIds },
        isHidden: false,
      }).lean() as unknown as ILocation[];

      // Separate local connections (same zone) from zone exits
      const localConnections: ILocation[] = [];
      const directZoneExits: { zone: WorldZoneType; hub: ILocation; energyCost: number }[] = [];

      for (const connected of connectedLocations) {
        if (!currentZone || connected.zone === currentZone) {
          localConnections.push(connected);
        } else if (connected.isZoneHub && connected.zone) {
          // This is a direct connection to another zone's hub
          const connection = location.connections.find(c => c.targetLocationId === connected._id.toString());
          directZoneExits.push({
            zone: connected.zone as WorldZoneType,
            hub: connected,
            energyCost: connection?.energyCost || 15,
          });
        } else {
          // Different zone but not a hub - still show as local for now
          localConnections.push(connected);
        }
      }

      // If we're at a zone hub, also show connections to adjacent zones
      if (currentZone && location.isZoneHub) {
        const adjacentZones = getAdjacentZones(currentZone);

        // Get hubs for adjacent zones that aren't already in directZoneExits
        const existingZoneExitIds = new Set(directZoneExits.map(e => e.zone));
        const missingAdjacentZones = adjacentZones.filter(z => !existingZoneExitIds.has(z));

        if (missingAdjacentZones.length > 0) {
          const additionalHubs = await Location.find({
            zone: { $in: missingAdjacentZones },
            isZoneHub: true,
            isHidden: false,
          }).lean() as unknown as ILocation[];

          for (const hub of additionalHubs) {
            if (hub.zone) {
              directZoneExits.push({
                zone: hub.zone as WorldZoneType,
                hub,
                energyCost: 15, // Default inter-zone travel cost
              });
            }
          }
        }
      }

      return {
        localConnections,
        zoneExits: directZoneExits,
        currentZone: currentZone || null,
        zoneInfo,
      };
    } catch (error) {
      logger.error('Error getting connected locations with zones:', error);
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

  /**
   * Get hostile NPCs at a location that can be fought
   * Filters by location name/type and excludes friendly NPC types
   */
  static async getHostileNPCsAtLocation(
    locationId: string,
    character: ICharacter
  ): Promise<INPC[]> {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        return [];
      }

      // Determine location identifiers to match against NPC location field
      const locationName = location.name;
      const locationType = location.type || 'frontier';
      const locationZone = location.zone || '';

      // Hostile NPC types that can be fought
      const hostileTypes = [
        NPCType.OUTLAW,
        NPCType.BANDIT,
        NPCType.WILDLIFE,
        NPCType.MONSTER,
        NPCType.BOUNTY_TARGET,
      ];

      // Find NPCs that:
      // 1. Match this location (by name, type, or zone)
      // 2. Are hostile types
      // 3. Are active
      // 4. Are within reasonable level range for the character
      const npcs = await NPC.find({
        $or: [
          { location: locationName },
          { location: locationType },
          { location: locationZone },
          { location: { $regex: new RegExp(locationName.replace(/[^a-zA-Z0-9]/g, '.*'), 'i') } },
        ],
        type: { $in: hostileTypes },
        isActive: true,
        level: { $lte: character.level + 10 }, // Don't show NPCs more than 10 levels above player
      })
        .sort({ level: 1, difficulty: 1 })
        .limit(20)
        .lean() as unknown as INPC[];

      // Transform NPCs to include computed fields for the client
      const transformedNPCs = npcs.map(npc => ({
        ...npc,
        _id: (npc._id as any).toString(),
        icon: this.getNPCIcon(npc.type),
        title: this.getNPCTitle(npc),
        baseStats: {
          health: npc.maxHP,
          attack: Math.floor(npc.level * 1.5 + npc.difficulty * 2),
          defense: Math.floor(npc.level + npc.difficulty),
        },
        rewards: {
          gold: Math.floor((npc.lootTable.goldMin + npc.lootTable.goldMax) / 2),
          xp: npc.lootTable.xpReward,
        },
      }));

      logger.debug(`Found ${transformedNPCs.length} hostile NPCs at ${locationName}`);

      return transformedNPCs as any;
    } catch (error) {
      logger.error('Error getting hostile NPCs at location:', error);
      return [];
    }
  }

  /**
   * Get icon for NPC type
   */
  private static getNPCIcon(type: NPCType): string {
    switch (type) {
      case NPCType.OUTLAW:
        return '🤠';
      case NPCType.BANDIT:
        return '🦹';
      case NPCType.WILDLIFE:
        return '🐺';
      case NPCType.MONSTER:
        return '👹';
      case NPCType.BOUNTY_TARGET:
        return '💀';
      default:
        return '⚔️';
    }
  }

  /**
   * Get title for NPC based on level and type
   */
  private static getNPCTitle(npc: INPC): string {
    if (npc.isBoss) {
      return 'Boss';
    }
    if (npc.level >= 30) {
      return 'Legendary';
    }
    if (npc.level >= 20) {
      return 'Elite';
    }
    if (npc.level >= 10) {
      return 'Veteran';
    }
    return 'Common';
  }
}
