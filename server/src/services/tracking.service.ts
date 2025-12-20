/**
 * Tracking Service - Phase 10, Wave 10.1
 *
 * Handles the tracking phase of hunting
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { HuntingTrip } from '../models/HuntingTrip.model';
import { getAnimalDefinition } from '../data/huntableAnimals';
import { getHuntingGround } from '../data/huntingGrounds';
import { HuntingService } from './hunting.service';
import { EnergyService } from './energy.service';
import {
  TrackingResult,
  TrackFreshness,
  TrackDirection,
  TrackDistance,
  HUNTING_CONSTANTS,
  AnimalSpecies
} from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

export class TrackingService {
  /**
   * Attempt to track an animal
   */
  static async attemptTracking(
    characterId: string,
    tripId: string
  ): Promise<TrackingResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Character not found'
        };
      }

      const trip = await HuntingTrip.findById(tripId).session(session);
      if (!trip) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Hunting trip not found'
        };
      }

      if (trip.status !== 'tracking') {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Not in tracking phase'
        };
      }

      // Check energy
      if (!character.canAffordAction(HUNTING_CONSTANTS.TRACKING_ENERGY)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Insufficient energy'
        };
      }

      // Get hunting ground
      const ground = getHuntingGround(trip.huntingGroundId);
      if (!ground) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Invalid hunting ground'
        };
      }

      // Select random animal from ground
      const animalSpecies = HuntingService.selectRandomAnimal(ground);
      if (!animalSpecies) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'No animals found in this area'
        };
      }

      const animalDef = getAnimalDefinition(animalSpecies);
      if (!animalDef) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Invalid animal'
        };
      }

      // Check level requirements
      if (character.level < animalDef.levelRequired) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `Requires level ${animalDef.levelRequired} to track ${animalDef.name}`
        };
      }

      // Get tracking bonus from skills
      const trackingBonus = HuntingService.getTrackingBonus(character);

      // TODO: Get companion bonus if active
      const companionBonus = 0;

      // Calculate total bonus
      const totalBonus = trackingBonus + companionBonus;

      // Roll for tracking success
      const success = HuntingService.rollSuccess(animalDef.trackingDifficulty, totalBonus);

      // Spend energy
      await EnergyService.spendEnergy(character._id.toString(), HUNTING_CONSTANTS.TRACKING_ENERGY, 'track_animal');
      trip.energySpent += HUNTING_CONSTANTS.TRACKING_ENERGY;

      if (!success) {
        // Failed tracking - lost the trail
        trip.status = 'failed';
        trip.completedAt = new Date();

        await character.save({ session });
        await trip.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`Character ${characterId} failed tracking at ${trip.huntingGroundId}`);

        return {
          success: false,
          message: `You search for tracks but find nothing. The ${animalDef.name} has eluded you.`,
          difficulty: animalDef.trackingDifficulty,
          trackingBonus,
          companionBonus
        };
      }

      // Successful tracking
      const freshness = this.determineFreshness();
      const direction = this.determineDirection();
      const distance = this.determineDistance(freshness);

      const result: TrackingResult = {
        success: true,
        message: this.generateTrackingMessage(animalDef.name, freshness, direction, distance),
        animalType: animalSpecies,
        freshness,
        direction,
        distance,
        difficulty: animalDef.trackingDifficulty,
        trackingBonus,
        companionBonus,
        canStalk: true
      };

      // Update trip
      trip.targetAnimal = animalSpecies;
      trip.trackingResult = {
        success: true,
        message: result.message,
        animalType: animalSpecies,
        freshness,
        direction,
        distance,
        difficulty: animalDef.trackingDifficulty,
        trackingBonus,
        companionBonus
      };
      trip.status = 'stalking';

      await character.save({ session });
      await trip.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Character ${characterId} successfully tracked ${animalSpecies} at ${trip.huntingGroundId}`
      );

      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error in tracking:', error);
      throw error;
    }
  }

  /**
   * Determine track freshness
   */
  private static determineFreshness(): TrackFreshness {
    const roll = SecureRNG.float(0, 1);
    if (roll < 0.3) return TrackFreshness.FRESH;
    if (roll < 0.6) return TrackFreshness.RECENT;
    if (roll < 0.85) return TrackFreshness.OLD;
    return TrackFreshness.COLD;
  }

  /**
   * Determine track direction
   */
  private static determineDirection(): TrackDirection {
    const directions = [
      TrackDirection.NORTH,
      TrackDirection.NORTHEAST,
      TrackDirection.EAST,
      TrackDirection.SOUTHEAST,
      TrackDirection.SOUTH,
      TrackDirection.SOUTHWEST,
      TrackDirection.WEST,
      TrackDirection.NORTHWEST
    ];
    return SecureRNG.select(directions);
  }

  /**
   * Determine track distance
   */
  private static determineDistance(freshness: TrackFreshness): TrackDistance {
    switch (freshness) {
      case TrackFreshness.FRESH:
        return SecureRNG.chance(0.7) ? TrackDistance.NEAR : TrackDistance.MEDIUM;
      case TrackFreshness.RECENT:
        return SecureRNG.chance(0.6) ? TrackDistance.MEDIUM : TrackDistance.FAR;
      case TrackFreshness.OLD:
        return SecureRNG.chance(0.3) ? TrackDistance.MEDIUM : TrackDistance.FAR;
      case TrackFreshness.COLD:
        return TrackDistance.FAR;
    }
  }

  /**
   * Generate tracking message
   */
  private static generateTrackingMessage(
    animalName: string,
    freshness: TrackFreshness,
    direction: TrackDirection,
    distance: TrackDistance
  ): string {
    const freshnessDesc = {
      [TrackFreshness.FRESH]: 'fresh tracks - very recent',
      [TrackFreshness.RECENT]: 'recent tracks',
      [TrackFreshness.OLD]: 'old tracks',
      [TrackFreshness.COLD]: 'cold tracks - quite old'
    };

    const distanceDesc = {
      [TrackDistance.NEAR]: 'nearby',
      [TrackDistance.MEDIUM]: 'some distance away',
      [TrackDistance.FAR]: 'far off'
    };

    return (
      `You find ${freshnessDesc[freshness]} of a ${animalName}. ` +
      `The trail leads ${direction.toLowerCase()} and the animal appears to be ${distanceDesc[distance]}.`
    );
  }
}
