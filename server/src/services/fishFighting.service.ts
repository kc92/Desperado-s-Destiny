/**
 * Fish Fighting Service
 *
 * Handles the mechanics of fighting a fish once hooked
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { FishingTrip, IFishingTrip } from '../models/FishingTrip.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  FishingActionResult,
  FightPhase,
  FishSize,
  FISHING_CONSTANTS
} from '@desperados/shared';
import { getFishSpecies } from '../data/fishSpecies';
import { getRod, getReel, getLine } from '../data/fishingGear';
import { FishingService } from './fishing.service';
import logger from '../utils/logger';

type FightAction = 'REEL' | 'LET_RUN';

export class FishFightingService {
  /**
   * Perform a fight action (reel or let run)
   */
  static async performFightAction(
    characterId: string,
    action: FightAction
  ): Promise<FishingActionResult> {
    try {
      const trip = await FishingTrip.findActiveTrip(characterId);
      if (!trip) {
        return {
          success: false,
          message: 'No active fishing session'
        };
      }

      if (!trip.currentFish) {
        return {
          success: false,
          message: 'No fish on the line'
        };
      }

      const character = await Character.findById(characterId);
      if (!character) {
        return {
          success: false,
          message: 'Character not found'
        };
      }

      const fish = getFishSpecies(trip.currentFish.speciesId);
      if (!fish) {
        return {
          success: false,
          message: 'Invalid fish species'
        };
      }

      const fightState = trip.currentFish.fightState;
      const rod = getRod(trip.setup.rodId);
      const reel = getReel(trip.setup.reelId);
      const line = getLine(trip.setup.lineId);

      if (!rod || !reel || !line) {
        return {
          success: false,
          message: 'Invalid gear'
        };
      }

      // Process the action
      let message = '';
      let tensionChange = 0;
      let staminaDrain = 0;

      if (action === 'REEL') {
        // Reeling increases tension, drains fish stamina faster
        const reelPower = reel.retrieveSpeed / 100;
        tensionChange = FISHING_CONSTANTS.BASE_TENSION_INCREASE * (1 + reelPower);
        staminaDrain = 5 + Math.floor(fish.aggression / 10);

        // Fish might fight back
        if (Math.random() < fish.aggression / 100) {
          tensionChange += 10;
          message = 'The fish fights hard!';
        } else {
          message = 'Reeling in steadily...';
        }

        // Rod flexibility reduces tension
        const flexBonus = rod.flexibility / 100;
        tensionChange *= (1 - flexBonus * 0.3);

      } else if (action === 'LET_RUN') {
        // Letting run decreases tension, fish recovers some stamina
        tensionChange = -FISHING_CONSTANTS.BASE_TENSION_DECREASE;
        staminaDrain = 2;

        // Drag strength affects how much line we give
        const dragBonus = reel.dragStrength / 100;
        staminaDrain += Math.floor(dragBonus * 3);

        message = 'Giving line... tension easing.';
      }

      // Apply tension change
      fightState.lineTension = Math.max(0, Math.min(100, fightState.lineTension + tensionChange));

      // Apply stamina drain
      fightState.fishStamina = Math.max(0, fightState.fishStamina - staminaDrain);

      // Update fight state
      fightState.roundsElapsed++;
      fightState.lastAction = action;
      fightState.tensionHistory.push(fightState.lineTension);
      if (fightState.tensionHistory.length > 5) {
        fightState.tensionHistory.shift();
      }

      // Check for line snap
      if (fightState.lineTension >= FISHING_CONSTANTS.SNAP_THRESHOLD) {
        // Line snapped!
        trip.currentFish = undefined;
        trip.isWaiting = true;
        await trip.save();

        return {
          success: false,
          message: `The line snapped! The ${fish.name} got away!`,
          session: trip.toSafeObject()
        };
      }

      // Check if tension too high for line strength
      const lineStressRoll = fightState.lineTension - line.strength;
      if (lineStressRoll > 0 && Math.random() * 100 < lineStressRoll) {
        // Line broke under stress
        trip.currentFish = undefined;
        trip.isWaiting = true;
        await trip.save();

        return {
          success: false,
          message: `Your ${line.name} couldn't handle the strain! Line broke!`,
          session: trip.toSafeObject()
        };
      }

      // Check if fish escaped (hook strength degradation)
      if (Math.random() < 0.05) { // 5% chance per round
        fightState.hookStrength -= 10;
        if (fightState.hookStrength <= 0) {
          trip.currentFish = undefined;
          trip.isWaiting = true;
          await trip.save();

          return {
            success: false,
            message: `The hook pulled free! The ${fish.name} escaped!`,
            session: trip.toSafeObject()
          };
        }
      }

      // Check if fish is exhausted (caught!)
      if (fightState.fishStamina <= 0) {
        return await this.landFish(character, trip, fish);
      }

      // Update phase based on stamina
      if (fightState.fishStamina > fish.stamina * 0.7) {
        fightState.phase = FightPhase.HOOKING;
      } else if (fightState.fishStamina > fish.stamina * 0.3) {
        fightState.phase = FightPhase.FIGHTING;
      } else {
        fightState.phase = FightPhase.LANDING;
      }

      // Save updated state
      trip.currentFish.fightState = fightState;
      await trip.save();

      // Calculate fight quality for messaging
      const avgTension = fightState.tensionHistory.reduce((a, b) => a + b, 0) / fightState.tensionHistory.length;
      let fightMessage = message;

      if (fightState.phase === FightPhase.LANDING) {
        fightMessage += ' Almost there!';
      } else if (fightState.lineTension > 80) {
        fightMessage += ' Line is screaming!';
      } else if (fightState.lineTension < 20) {
        fightMessage += ' Tension is low.';
      }

      return {
        success: true,
        message: fightMessage,
        session: trip.toSafeObject(),
        fightUpdate: {
          fishStamina: fightState.fishStamina,
          lineTension: fightState.lineTension,
          message: `${fish.name} - Stamina: ${fightState.fishStamina}/${fish.stamina}`,
          canContinue: true
        }
      };
    } catch (error) {
      logger.error('Error performing fight action:', error);
      return {
        success: false,
        message: 'Failed to perform action'
      };
    }
  }

  /**
   * Land the fish (when stamina reaches 0)
   */
  private static async landFish(
    character: ICharacter,
    trip: IFishingTrip,
    fish: any
  ): Promise<FishingActionResult> {
    try {
      const currentFish = trip.currentFish!;
      const fightState = currentFish.fightState;

      // Calculate fight quality (0-100)
      const quality = this.calculateFightQuality(fightState, fish);

      // Calculate rewards
      const { goldValue, experience } = FishingService.calculateCatchRewards(
        fish,
        currentFish.weight,
        currentFish.size,
        quality
      );

      // Process drops
      const drops = FishingService.processFishDrops(fish);

      // Award gold
      await character.addGold(goldValue, TransactionSource.FISHING, {
        fishId: fish.id,
        weight: currentFish.weight,
        size: currentFish.size
      });

      // Award XP
      await character.addExperience(experience);

      // Check for records
      const isNewRecord = await this.checkForRecord(character._id.toString(), fish.id, currentFish.weight);
      const isFirstCatch = await this.checkFirstCatch(character._id.toString(), fish.id);

      // Create caught fish record
      const caughtFish = {
        speciesId: fish.id,
        speciesName: fish.name,
        weight: currentFish.weight,
        size: currentFish.size,
        quality,
        goldValue,
        experience,
        drops,
        isNewRecord,
        isFirstCatch,
        caughtAt: new Date(),
        location: trip.locationId
      };

      // Add to trip
      trip.catches.push(caughtFish as any);
      trip.catchCount++;
      trip.totalValue += goldValue;
      trip.totalExperience += experience;

      // Clear current fish and reset to waiting
      trip.currentFish = undefined;
      trip.isWaiting = true;

      // Check session limits
      if (trip.catchCount >= FISHING_CONSTANTS.MAX_CATCHES_PER_SESSION) {
        trip.endSession();
        await trip.save();

        return {
          success: true,
          message: `Caught a ${currentFish.size} ${fish.name} (${currentFish.weight.toFixed(1)} lbs)! Session limit reached.`,
          catch: caughtFish as any,
          goldGained: goldValue,
          experienceGained: experience,
          itemsGained: drops
        };
      }

      await trip.save();

      let catchMessage = `SUCCESS! Caught a ${currentFish.size} ${fish.name} (${currentFish.weight.toFixed(1)} lbs)!`;

      if (isNewRecord) {
        catchMessage += ' NEW RECORD!';
      }
      if (isFirstCatch) {
        catchMessage += ' First catch of this species!';
      }
      if (fish.isLegendary) {
        catchMessage += ' LEGENDARY CATCH!';
      }
      if (quality >= 90) {
        catchMessage += ' Perfect fight!';
      }

      catchMessage += ` +${goldValue} gold, +${experience} XP`;

      return {
        success: true,
        message: catchMessage,
        catch: caughtFish as any,
        goldGained: goldValue,
        experienceGained: experience,
        itemsGained: drops,
        session: trip.toSafeObject()
      };
    } catch (error) {
      logger.error('Error landing fish:', error);
      return {
        success: false,
        message: 'Failed to land fish'
      };
    }
  }

  /**
   * Calculate fight quality (0-100) based on performance
   */
  private static calculateFightQuality(fightState: any, fish: any): number {
    let quality = 50; // Start at average

    // Fast fights are better
    const targetRounds = fish.baseFightTime / 5; // Expected rounds
    if (fightState.roundsElapsed < targetRounds) {
      quality += 20;
    } else if (fightState.roundsElapsed > targetRounds * 2) {
      quality -= 20;
    }

    // Maintaining optimal tension (40-60%)
    const avgTension = fightState.tensionHistory.reduce((a: number, b: number) => a + b, 0) / fightState.tensionHistory.length;
    const optimalTension = 50;
    const tensionDeviation = Math.abs(avgTension - optimalTension);
    quality -= tensionDeviation / 2;

    // Bonus for consistent tension
    const tensionVariance = this.calculateVariance(fightState.tensionHistory);
    if (tensionVariance < 10) {
      quality += 15; // Very smooth fight
    } else if (tensionVariance > 30) {
      quality -= 10; // Erratic fight
    }

    // Hook strength bonus
    if (fightState.hookStrength > 80) {
      quality += 10;
    }

    // Never lost line
    const neverHighTension = fightState.tensionHistory.every((t: number) => t < 80);
    if (neverHighTension) {
      quality += 15;
    }

    return Math.max(0, Math.min(100, Math.floor(quality)));
  }

  /**
   * Calculate variance of array
   */
  private static calculateVariance(arr: number[]): number {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const squareDiffs = arr.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length);
  }

  /**
   * Check if this is a new record for the species
   */
  private static async checkForRecord(
    characterId: string,
    fishId: string,
    weight: number
  ): Promise<boolean> {
    const allTrips = await FishingTrip.find({
      characterId: new mongoose.Types.ObjectId(characterId)
    });

    let currentRecord = 0;

    for (const trip of allTrips) {
      for (const caught of trip.catches) {
        if (caught.speciesId === fishId && caught.weight > currentRecord) {
          currentRecord = caught.weight;
        }
      }
    }

    return weight > currentRecord;
  }

  /**
   * Check if this is the first catch of this species
   */
  private static async checkFirstCatch(
    characterId: string,
    fishId: string
  ): Promise<boolean> {
    const existingCatch = await FishingTrip.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      'catches.speciesId': fishId
    });

    return !existingCatch;
  }

  /**
   * Abandon fight (release or escape)
   */
  static async abandonFight(
    characterId: string,
    release: boolean = false
  ): Promise<FishingActionResult> {
    try {
      const trip = await FishingTrip.findActiveTrip(characterId);
      if (!trip) {
        return {
          success: false,
          message: 'No active fishing session'
        };
      }

      if (!trip.currentFish) {
        return {
          success: false,
          message: 'No fish on the line'
        };
      }

      const fish = getFishSpecies(trip.currentFish.speciesId);
      const message = release
        ? `Released the ${fish?.name || 'fish'} back into the water.`
        : `Cut the line. The ${fish?.name || 'fish'} escaped.`;

      trip.currentFish = undefined;
      trip.isWaiting = true;
      await trip.save();

      return {
        success: true,
        message,
        session: trip.toSafeObject()
      };
    } catch (error) {
      logger.error('Error abandoning fight:', error);
      return {
        success: false,
        message: 'Failed to abandon fight'
      };
    }
  }

  /**
   * Get fight status
   */
  static async getFightStatus(characterId: string): Promise<FishingActionResult> {
    try {
      const trip = await FishingTrip.findActiveTrip(characterId);
      if (!trip) {
        return {
          success: false,
          message: 'No active fishing session'
        };
      }

      if (!trip.currentFish) {
        return {
          success: false,
          message: 'No fish on the line'
        };
      }

      const fish = getFishSpecies(trip.currentFish.speciesId);
      const fightState = trip.currentFish.fightState;

      return {
        success: true,
        message: `Fighting ${fish?.name || 'Unknown Fish'}`,
        session: trip.toSafeObject(),
        fightUpdate: {
          fishStamina: fightState.fishStamina,
          lineTension: fightState.lineTension,
          message: `Round ${fightState.roundsElapsed} - ${fightState.phase}`,
          canContinue: true
        }
      };
    } catch (error) {
      logger.error('Error getting fight status:', error);
      return {
        success: false,
        message: 'Failed to get fight status'
      };
    }
  }
}
