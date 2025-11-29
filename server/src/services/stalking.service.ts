/**
 * Stalking & Shooting Service - Phase 10, Wave 10.1
 *
 * Handles the stalking and shooting phases of hunting
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { HuntingTrip } from '../models/HuntingTrip.model';
import { getAnimalDefinition } from '../data/huntableAnimals';
import { HuntingService } from './hunting.service';
import {
  StalkingResult,
  ShotResult,
  ShotPlacement,
  HUNTING_CONSTANTS,
  HuntingWeapon
} from '@desperados/shared';
import logger from '../utils/logger';

export class StalkingAndShootingService {
  /**
   * Attempt to stalk an animal
   */
  static async attemptStalking(
    characterId: string,
    tripId: string
  ): Promise<StalkingResult> {
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

      if (trip.status !== 'stalking') {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Not in stalking phase'
        };
      }

      if (!trip.targetAnimal) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'No target animal'
        };
      }

      // Check energy
      if (!character.canAffordAction(HUNTING_CONSTANTS.STALKING_ENERGY)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Insufficient energy'
        };
      }

      // Get animal definition
      const animalDef = getAnimalDefinition(trip.targetAnimal);
      if (!animalDef) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Invalid animal'
        };
      }

      // Calculate stealth bonus
      const stealthBonus = HuntingService.getStealthBonus(character);

      // Check for camouflage equipment
      const hasCamouflage = character.inventory.some(item => item.itemId === 'camouflage');
      const hasScentBlocker = character.inventory.some(item => item.itemId === 'scent_blocker');

      // Calculate base stealth
      let stealth = HUNTING_CONSTANTS.BASE_STEALTH + stealthBonus;
      if (hasCamouflage) stealth += HUNTING_CONSTANTS.CAMOUFLAGE_BONUS;
      if (hasScentBlocker) stealth += HUNTING_CONSTANTS.SCENT_BLOCKER_BONUS;

      // Wind direction (random)
      const windFavorable = Math.random() < HUNTING_CONSTANTS.WIND_FAVORABLE_CHANCE;
      if (!windFavorable) {
        stealth -= 20; // Wind carrying your scent
      }

      // Calculate noise level (random)
      const noiseLevel = Math.random() * 50;
      stealth -= noiseLevel;

      // Calculate detection chance based on animal alertness
      const detectionChance = animalDef.alertness * 10 - stealth;
      const detected = Math.random() * 100 < detectionChance;

      // Spend energy
      character.spendEnergy(HUNTING_CONSTANTS.STALKING_ENERGY);
      trip.energySpent += HUNTING_CONSTANTS.STALKING_ENERGY;

      if (detected) {
        // Animal spooked and fled
        trip.status = 'failed';
        trip.completedAt = new Date();

        const result: StalkingResult = {
          success: false,
          message: `The ${animalDef.name} detects your presence and flees! ${
            !windFavorable ? 'The wind gave away your scent.' : 'You made too much noise.'
          }`,
          animalInRange: false,
          windFavorable,
          noiseLevel,
          detectionChance,
          stealthBonus,
          spooked: true,
          canShoot: false
        };

        trip.stalkingResult = {
          success: false,
          message: result.message,
          animalInRange: false,
          windFavorable,
          noiseLevel,
          detectionChance,
          stealthBonus,
          spooked: true,
          canShoot: false
        };

        await character.save({ session });
        await trip.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`Character ${characterId} spooked ${trip.targetAnimal} while stalking`);

        return result;
      }

      // Successful stalk - determine shot distance based on track distance
      const trackDistance = trip.trackingResult?.distance || 'MEDIUM';
      let shotDistance = 100; // yards
      switch (trackDistance) {
        case 'NEAR':
          shotDistance = 50;
          break;
        case 'MEDIUM':
          shotDistance = 100;
          break;
        case 'FAR':
          shotDistance = 200;
          break;
      }

      const result: StalkingResult = {
        success: true,
        message: `You successfully stalk the ${animalDef.name}. ${
          windFavorable ? 'The wind is in your favor.' : 'The wind is not ideal, but you managed.'
        } You're in position for a shot.`,
        animalInRange: true,
        windFavorable,
        noiseLevel,
        detectionChance,
        stealthBonus,
        spooked: false,
        canShoot: true,
        shotDistance
      };

      trip.stalkingResult = {
        success: true,
        message: result.message,
        animalInRange: true,
        windFavorable,
        noiseLevel,
        detectionChance,
        stealthBonus,
        spooked: false,
        canShoot: true,
        shotDistance
      };
      trip.status = 'shooting';

      await character.save({ session });
      await trip.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} successfully stalked ${trip.targetAnimal}`);

      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error in stalking:', error);
      throw error;
    }
  }

  /**
   * Take a shot at the animal
   */
  static async takeShot(
    characterId: string,
    tripId: string,
    targetPlacement: ShotPlacement
  ): Promise<ShotResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Character not found',
          hit: false
        };
      }

      const trip = await HuntingTrip.findById(tripId).session(session);
      if (!trip) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Hunting trip not found',
          hit: false
        };
      }

      if (trip.status !== 'shooting') {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Not in shooting phase',
          hit: false
        };
      }

      if (!trip.targetAnimal) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'No target animal',
          hit: false
        };
      }

      // Check energy
      if (!character.canAffordAction(HUNTING_CONSTANTS.SHOOTING_ENERGY)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Insufficient energy',
          hit: false
        };
      }

      // Get animal definition
      const animalDef = getAnimalDefinition(trip.targetAnimal);
      if (!animalDef) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Invalid animal',
          hit: false
        };
      }

      // Get marksmanship bonus
      const marksmanshipBonus = HuntingService.getMarksmanshipBonus(character);

      // Get weapon used
      const weapon = trip.weaponUsed || HuntingWeapon.PISTOL;
      const weaponDamage = HUNTING_CONSTANTS.WEAPON_DAMAGE[weapon];

      // Calculate shot difficulty based on distance
      const shotDistance = trip.stalkingResult?.shotDistance || 100;
      let distanceMultiplier = HUNTING_CONSTANTS.SHOT_DIFFICULTY.MEDIUM;
      if (shotDistance < 75) distanceMultiplier = HUNTING_CONSTANTS.SHOT_DIFFICULTY.NEAR;
      else if (shotDistance > 150) distanceMultiplier = HUNTING_CONSTANTS.SHOT_DIFFICULTY.FAR;

      // Calculate base hit chance
      let hitChance = 60 + marksmanshipBonus - (animalDef.killDifficulty * 5);
      hitChance /= distanceMultiplier;

      // Placement difficulty modifiers
      const placementDifficulty: Record<ShotPlacement, number> = {
        [ShotPlacement.HEAD]: 0.6,
        [ShotPlacement.HEART]: 0.8,
        [ShotPlacement.LUNGS]: 0.9,
        [ShotPlacement.BODY]: 1.0,
        [ShotPlacement.MISS]: 0
      };

      hitChance *= placementDifficulty[targetPlacement];

      // Spend energy
      character.spendEnergy(HUNTING_CONSTANTS.SHOOTING_ENERGY);
      trip.energySpent += HUNTING_CONSTANTS.SHOOTING_ENERGY;

      // Roll for hit
      const hitRoll = Math.random() * 100;
      const hit = hitRoll < hitChance;

      if (!hit) {
        // Complete miss
        trip.status = 'failed';
        trip.completedAt = new Date();

        const result: ShotResult = {
          success: false,
          message: `You miss the ${animalDef.name}! It flees into the wilderness.`,
          hit: false,
          placement: ShotPlacement.MISS,
          damage: 0,
          killed: false,
          wounded: false,
          marksmanshipBonus,
          weaponBonus: weaponDamage,
          fled: true,
          attacking: false
        };

        trip.shotResult = {
          success: false,
          message: result.message,
          hit: false,
          placement: ShotPlacement.MISS,
          damage: 0,
          killed: false,
          wounded: false,
          marksmanshipBonus,
          weaponBonus: weaponDamage,
          fled: true,
          attacking: false
        };

        await character.save({ session });
        await trip.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`Character ${characterId} missed shot at ${trip.targetAnimal}`);

        return result;
      }

      // Hit! Calculate actual placement (can be less accurate)
      let actualPlacement = targetPlacement;
      const placementRoll = Math.random();
      if (placementRoll > 0.7) {
        // Shot landed lower than intended
        const placements = [ShotPlacement.HEAD, ShotPlacement.HEART, ShotPlacement.LUNGS, ShotPlacement.BODY];
        const idx = placements.indexOf(targetPlacement);
        if (idx < placements.length - 1) {
          actualPlacement = placements[idx + 1];
        }
      }

      // Calculate damage
      const placementMultiplier = HUNTING_CONSTANTS.PLACEMENT_MULTIPLIERS[actualPlacement];
      const damage = Math.floor(weaponDamage * placementMultiplier);

      // Check if killed
      const killed = damage >= animalDef.health;

      if (killed) {
        // Clean kill - proceed to harvesting
        const result: ShotResult = {
          success: true,
          message: this.generateKillMessage(animalDef.name, actualPlacement),
          hit: true,
          placement: actualPlacement,
          damage,
          killed: true,
          wounded: false,
          marksmanshipBonus,
          weaponBonus: weaponDamage,
          fled: false,
          attacking: false
        };

        trip.shotResult = {
          success: true,
          message: result.message,
          hit: true,
          placement: actualPlacement,
          damage,
          killed: true,
          wounded: false,
          marksmanshipBonus,
          weaponBonus: weaponDamage,
          fled: false,
          attacking: false
        };
        trip.status = 'harvesting';

        await character.save({ session });
        await trip.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(
          `Character ${characterId} killed ${trip.targetAnimal} with ${actualPlacement} shot`
        );

        return result;
      }

      // Wounded animal - may attack or flee
      const willAttack = animalDef.canAttack && animalDef.aggression > 5;

      if (willAttack) {
        // Animal attacks!
        const attackDamage = animalDef.attackDamage || 0;
        const characterHealth = 100; // Simplified - would integrate with combat system

        trip.status = 'failed';
        trip.completedAt = new Date();

        const result: ShotResult = {
          success: false,
          message: `You wound the ${animalDef.name}, but it's not a clean kill! The enraged animal charges and attacks you, dealing ${attackDamage} damage. You barely escape with your life.`,
          hit: true,
          placement: actualPlacement,
          damage,
          killed: false,
          wounded: true,
          marksmanshipBonus,
          weaponBonus: weaponDamage,
          fled: false,
          attacking: true
        };

        trip.shotResult = {
          success: false,
          message: result.message,
          hit: true,
          placement: actualPlacement,
          damage,
          killed: false,
          wounded: true,
          marksmanshipBonus,
          weaponBonus: weaponDamage,
          fled: false,
          attacking: true
        };

        await character.save({ session });
        await trip.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`Character ${characterId} wounded ${trip.targetAnimal} - animal attacked`);

        return result;
      }

      // Animal flees wounded
      trip.status = 'failed';
      trip.completedAt = new Date();

      const result: ShotResult = {
        success: false,
        message: `You wound the ${animalDef.name}, but it's not enough to bring it down. The injured animal flees into the wilderness.`,
        hit: true,
        placement: actualPlacement,
        damage,
        killed: false,
        wounded: true,
        marksmanshipBonus,
        weaponBonus: weaponDamage,
        fled: true,
        attacking: false
      };

      trip.shotResult = {
        success: false,
        message: result.message,
        hit: true,
        placement: actualPlacement,
        damage,
        killed: false,
        wounded: true,
        marksmanshipBonus,
        weaponBonus: weaponDamage,
        fled: true,
        attacking: false
      };

      await character.save({ session });
      await trip.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} wounded ${trip.targetAnimal} - animal fled`);

      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error taking shot:', error);
      throw error;
    }
  }

  /**
   * Generate kill message based on placement
   */
  private static generateKillMessage(animalName: string, placement: ShotPlacement): string {
    const messages: Record<ShotPlacement, string> = {
      [ShotPlacement.HEAD]: `Perfect headshot! The ${animalName} drops instantly. A clean, humane kill.`,
      [ShotPlacement.HEART]: `Your shot pierces the ${animalName}'s heart. It stumbles and falls quickly. Excellent marksmanship.`,
      [ShotPlacement.LUNGS]: `You hit the ${animalName} in the vitals. It runs a short distance before collapsing. A good shot.`,
      [ShotPlacement.BODY]: `Your shot hits the ${animalName} in the body. After a brief struggle, it goes down. Not the cleanest kill, but effective.`,
      [ShotPlacement.MISS]: '' // Should never happen in kill message
    };

    return messages[placement];
  }
}
