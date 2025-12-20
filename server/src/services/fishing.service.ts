/**
 * Fishing Service
 *
 * Core fishing logic including casting, waiting, biting, and catching
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { FishingTrip, IFishingTrip } from '../models/FishingTrip.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  FishingActionResult,
  FishingSetup,
  FishingSession,
  CaughtFish,
  SpotType,
  FishingTimeOfDay,
  FishingWeather,
  FishSize,
  FightPhase,
  FishRarity,
  FISHING_CONSTANTS
} from '@desperados/shared';
import { getFishSpecies, getFishByLocation } from '../data/fishSpecies';
import { getFishingLocation } from '../data/fishingLocations';
import { getRod, getReel, getLine, getBait, getLure, calculateBaitEffectiveness, calculateLureEffectiveness } from '../data/fishingGear';
import { EnergyService } from './energy.service';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import { withLock } from '../utils/distributedLock';

export class FishingService {
  /**
   * Start a new fishing session
   */
  static async startFishing(
    characterId: string,
    locationId: string,
    spotType: SpotType,
    setup: FishingSetup
  ): Promise<FishingActionResult> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return {
          success: false,
          message: 'Character not found'
        };
      }

      // Check if already fishing
      const existingTrip = await FishingTrip.findActiveTrip(characterId);
      if (existingTrip) {
        return {
          success: false,
          message: 'Already fishing. End current session first.'
        };
      }

      // Validate location
      const location = getFishingLocation(locationId);
      if (!location) {
        return {
          success: false,
          message: 'Invalid fishing location'
        };
      }

      // Validate gear (check character owns it - simplified for now)
      const rod = getRod(setup.rodId);
      const reel = getReel(setup.reelId);
      const line = getLine(setup.lineId);

      if (!rod || !reel || !line) {
        return {
          success: false,
          message: 'Invalid fishing gear'
        };
      }

      // Check and deduct energy
      const hasEnergy = await EnergyService.spendEnergy(
        characterId,
        FISHING_CONSTANTS.CAST_ENERGY,
        'cast_line'
      );

      if (!hasEnergy) {
        return {
          success: false,
          message: `Need ${FISHING_CONSTANTS.CAST_ENERGY} energy to cast`
        };
      }

      // Determine time of day and weather (simplified - would use game time service)
      const timeOfDay = this.getCurrentTimeOfDay();
      const weather = this.getCurrentWeather();

      // Create fishing trip
      const trip = new FishingTrip({
        characterId: character._id,
        locationId,
        spotType,
        setup,
        timeOfDay,
        weather,
        isActive: true,
        isWaiting: true,
        hasBite: false,
        lastBiteCheck: new Date()
      });

      await trip.save();

      return {
        success: true,
        message: `Cast your line into ${location.name}. Waiting for a bite...`,
        session: trip.toSafeObject(),
        energyUsed: FISHING_CONSTANTS.CAST_ENERGY
      };
    } catch (error) {
      logger.error('Error starting fishing:', error);
      return {
        success: false,
        message: 'Failed to start fishing session'
      };
    }
  }

  /**
   * Check for bite (called periodically or on demand)
   */
  static async checkForBite(characterId: string): Promise<FishingActionResult> {
    try {
      const trip = await FishingTrip.findActiveTrip(characterId);
      if (!trip) {
        return {
          success: false,
          message: 'No active fishing session'
        };
      }

      // Use distributed lock to prevent race conditions when checking for bites
      const lockKey = `lock:fishing:${trip._id}`;

      return withLock(lockKey, async () => {
        // Re-fetch trip inside lock to get latest state
        const lockedTrip = await FishingTrip.findById(trip._id);
        if (!lockedTrip) {
          return {
            success: false,
            message: 'No active fishing session'
          };
        }

        if (!lockedTrip.isWaiting) {
          return {
            success: false,
            message: 'Not waiting for bite'
          };
        }

        if (lockedTrip.hasBite) {
          return {
            success: true,
            message: 'You already have a bite! Set the hook quickly!',
            hasBite: true,
            biteTimeWindow: lockedTrip.biteExpiresAt ?
              Math.max(0, lockedTrip.biteExpiresAt.getTime() - Date.now()) : 0
          };
        }

        // Check if enough time has passed
        const timeSinceLastCheck = Date.now() - lockedTrip.lastBiteCheck.getTime();
        if (timeSinceLastCheck < FISHING_CONSTANTS.BITE_CHECK_INTERVAL * 1000) {
          return {
            success: true,
            message: 'Still waiting... be patient.',
            session: lockedTrip.toSafeObject()
          };
        }

        // Roll for bite
        const biteRoll = await this.rollForBite(lockedTrip);

        lockedTrip.lastBiteCheck = new Date();

        if (biteRoll.success) {
          // Got a bite!
          lockedTrip.hasBite = true;
          const biteWindow = biteRoll.fish!.biteSpeed;
          lockedTrip.biteExpiresAt = new Date(Date.now() + biteWindow);

          await lockedTrip.save();

          return {
            success: true,
            message: 'You feel a bite! Set the hook now!',
            hasBite: true,
            biteTimeWindow: biteWindow,
            session: lockedTrip.toSafeObject()
          };
        } else {
          // No bite yet
          await lockedTrip.save();

          return {
            success: true,
            message: 'Nothing yet. Keep waiting...',
            session: lockedTrip.toSafeObject()
          };
        }
      }, { ttl: 30, retries: 3 });
    } catch (error) {
      logger.error('Error checking for bite:', error);
      return {
        success: false,
        message: 'Failed to check for bite'
      };
    }
  }

  /**
   * Set the hook (when player gets a bite)
   */
  static async setHook(characterId: string): Promise<FishingActionResult> {
    try {
      const trip = await FishingTrip.findActiveTrip(characterId);
      if (!trip) {
        return {
          success: false,
          message: 'No active fishing session'
        };
      }

      if (!trip.hasBite) {
        return {
          success: false,
          message: 'No bite to set hook on'
        };
      }

      // Check if bite expired
      if (trip.biteExpiresAt && Date.now() > trip.biteExpiresAt.getTime()) {
        trip.hasBite = false;
        trip.biteExpiresAt = undefined;
        await trip.save();

        return {
          success: false,
          message: 'Too slow! The fish got away.'
        };
      }

      // Get the fish that bit (stored when bite occurred)
      const lastRoll = await this.rollForBite(trip);
      if (!lastRoll.success || !lastRoll.fish) {
        return {
          success: false,
          message: 'Failed to hook fish'
        };
      }

      const fish = lastRoll.fish;

      // Hook difficulty check
      const hookSuccess = SecureRNG.d100() < (100 - fish.hookDifficulty);

      if (!hookSuccess) {
        trip.hasBite = false;
        trip.biteExpiresAt = undefined;
        await trip.save();

        return {
          success: false,
          message: `The ${fish.name} threw the hook! Try again.`
        };
      }

      // Successfully hooked!
      const weight = this.generateFishWeight(fish);
      const size = this.determineFishSize(fish, weight);

      // Initialize fight state
      const character = await Character.findById(characterId);
      const rod = getRod(trip.setup.rodId);
      const reel = getReel(trip.setup.reelId);

      const fightState = {
        phase: FightPhase.HOOKING,
        fishStamina: fish.stamina,
        lineTension: 30, // Start with moderate tension
        playerStamina: 100,
        roundsElapsed: 0,
        lastAction: 'WAIT' as const,
        tensionHistory: [30],
        hookStrength: 100
      };

      trip.hasBite = false;
      trip.biteExpiresAt = undefined;
      trip.isWaiting = false;
      trip.currentFish = {
        speciesId: fish.id,
        weight,
        size,
        fightState
      };

      await trip.save();

      return {
        success: true,
        message: `Hooked a ${fish.name}! Fight it carefully!`,
        session: trip.toSafeObject(),
        fightUpdate: {
          fishStamina: fightState.fishStamina,
          lineTension: fightState.lineTension,
          message: `${fish.name} (${size}) - ${weight.toFixed(1)} lbs`,
          canContinue: true
        }
      };
    } catch (error) {
      logger.error('Error setting hook:', error);
      return {
        success: false,
        message: 'Failed to set hook'
      };
    }
  }

  /**
   * End fishing session
   */
  static async endFishing(characterId: string): Promise<FishingActionResult> {
    try {
      const trip = await FishingTrip.findActiveTrip(characterId);
      if (!trip) {
        return {
          success: false,
          message: 'No active fishing session'
        };
      }

      // End the trip
      trip.endSession();
      await trip.save();

      return {
        success: true,
        message: `Fishing session ended. Caught ${trip.catchCount} fish for ${trip.totalValue} dollars.`,
        dollarsGained: trip.totalValue,
        experienceGained: trip.totalExperience
      };
    } catch (error) {
      logger.error('Error ending fishing:', error);
      return {
        success: false,
        message: 'Failed to end fishing session'
      };
    }
  }

  /**
   * Get current fishing session
   */
  static async getCurrentSession(characterId: string): Promise<FishingSession | null> {
    const trip = await FishingTrip.findActiveTrip(characterId);
    if (!trip) {
      return null;
    }
    return trip.toSafeObject();
  }

  /**
   * Roll for bite (determines if fish bites and which species)
   */
  private static async rollForBite(trip: IFishingTrip): Promise<{
    success: boolean;
    fish?: any;
  }> {
    const location = getFishingLocation(trip.locationId);
    if (!location) {
      return { success: false };
    }

    // Get available fish at this location
    const availableFish = getFishByLocation(trip.locationId);
    if (availableFish.length === 0) {
      return { success: false };
    }

    // Build weighted pool based on fish rarity and conditions
    const rod = getRod(trip.setup.rodId);
    const bait = trip.setup.baitId ? getBait(trip.setup.baitId) : null;
    const lure = trip.setup.lureId ? getLure(trip.setup.lureId) : null;

    const weightedPool: { fish: any; weight: number }[] = [];

    for (const fish of availableFish) {
      // Check if fish is active at this time/weather
      if (!fish.activeTimeOfDay.includes(trip.timeOfDay)) {
        continue; // Skip
      }

      // Base chance
      let chance = fish.baseChance;

      // Weather modifier
      if (fish.preferredWeather.includes(trip.weather)) {
        chance *= 1.2;
      }

      // Depth/spot modifier
      if (fish.depthPreference.includes(trip.spotType)) {
        chance *= 1.3;
      }

      // Bait effectiveness
      if (bait) {
        const baitEff = calculateBaitEffectiveness(bait, fish);
        chance *= (baitEff / 100);
      }

      // Lure effectiveness
      if (lure) {
        const lureEff = calculateLureEffectiveness(lure, fish, trip.spotType);
        chance *= (lureEff / 100);
      }

      // Rod quality bonus
      if (rod && rod.bonuses?.catchChance) {
        chance *= (1 + rod.bonuses.catchChance / 100);
      }

      weightedPool.push({ fish, weight: chance });
    }

    if (weightedPool.length === 0) {
      return { success: false };
    }

    // Calculate total weight
    const totalWeight = weightedPool.reduce((sum, entry) => sum + entry.weight, 0);

    // Roll for bite
    const biteRoll = SecureRNG.d100();
    if (biteRoll > totalWeight) {
      return { success: false }; // No bite this check
    }

    // Select which fish bit using weighted selection
    const weightedItems = weightedPool.map(entry => ({ item: entry.fish, weight: entry.weight }));
    const selectedFish = SecureRNG.weightedSelect(weightedItems);
    return { success: true, fish: selectedFish };
  }

  /**
   * Generate fish weight within species range
   */
  private static generateFishWeight(fish: any): number {
    // Use bell curve distribution favoring average weight
    const range = fish.maxWeight - fish.minWeight;
    const offset = fish.averageWeight - fish.minWeight;
    const normalized = offset / range;

    // Generate using Box-Muller transform for normal distribution
    let weight = -1;
    while (weight < fish.minWeight || weight > fish.maxWeight) {
      const u1 = SecureRNG.float(0, 1);
      const u2 = SecureRNG.float(0, 1);
      const randNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      weight = fish.averageWeight + (randNormal * range * 0.2);
    }

    return Math.max(fish.minWeight, Math.min(fish.maxWeight, weight));
  }

  /**
   * Determine fish size category based on weight
   */
  private static determineFishSize(fish: any, weight: number): FishSize {
    const range = fish.maxWeight - fish.minWeight;
    const percentile = (weight - fish.minWeight) / range;

    if (weight >= fish.recordWeight * 0.95) {
      return FishSize.LEGENDARY;
    } else if (percentile >= 0.85) {
      return FishSize.TROPHY;
    } else if (percentile >= 0.65) {
      return FishSize.LARGE;
    } else if (percentile >= 0.35) {
      return FishSize.AVERAGE;
    } else if (percentile >= 0.15) {
      return FishSize.SMALL;
    } else {
      return FishSize.TINY;
    }
  }

  /**
   * Get current time of day (simplified - would use game time service)
   */
  private static getCurrentTimeOfDay(): FishingTimeOfDay {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 7) return FishingTimeOfDay.DAWN;
    if (hour >= 7 && hour < 11) return FishingTimeOfDay.MORNING;
    if (hour >= 11 && hour < 15) return FishingTimeOfDay.MIDDAY;
    if (hour >= 15 && hour < 18) return FishingTimeOfDay.AFTERNOON;
    if (hour >= 18 && hour < 20) return FishingTimeOfDay.DUSK;
    return FishingTimeOfDay.NIGHT;
  }

  /**
   * Get current weather (simplified - would use weather service)
   */
  private static getCurrentWeather(): FishingWeather {
    // For now, random
    const roll = SecureRNG.float(0, 1);
    if (roll < 0.5) return FishingWeather.CLEAR;
    if (roll < 0.75) return FishingWeather.CLOUDY;
    if (roll < 0.9) return FishingWeather.RAIN;
    if (roll < 0.95) return FishingWeather.FOG;
    return FishingWeather.STORM;
  }

  /**
   * Calculate catch rewards
   */
  static calculateCatchRewards(
    fish: any,
    weight: number,
    size: FishSize,
    quality: number
  ): {
    dollarsValue: number;
    experience: number;
  } {
    const sizeMultiplier = FISHING_CONSTANTS.SIZE_MULTIPLIER[size];

    let dollarsValue = Math.floor(fish.baseValue * sizeMultiplier);
    let experience = Math.floor(fish.experience * sizeMultiplier);

    // Quality bonus (perfect fight)
    if (quality >= 90) {
      dollarsValue = Math.floor(dollarsValue * (1 + FISHING_CONSTANTS.PERFECT_FIGHT_BONUS));
      experience = Math.floor(experience * (1 + FISHING_CONSTANTS.PERFECT_FIGHT_BONUS));
    }

    // Legendary bonus
    if (fish.isLegendary) {
      experience += FISHING_CONSTANTS.LEGENDARY_CATCH_BONUS;
    } else if (fish.rarity === FishRarity.RARE) {
      experience += FISHING_CONSTANTS.RARE_CATCH_BONUS;
    }

    return { dollarsValue, experience };
  }

  /**
   * Process fish drops
   */
  static processFishDrops(fish: any): { itemId: string; quantity: number }[] {
    if (!fish.drops) {
      return [];
    }

    const drops: { itemId: string; quantity: number }[] = [];

    for (const dropDef of fish.drops) {
      if (SecureRNG.chance(dropDef.chance)) {
        const quantity = SecureRNG.range(dropDef.quantity[0], dropDef.quantity[1]);

        drops.push({
          itemId: dropDef.itemId,
          quantity
        });
      }
    }

    return drops;
  }
}
