/**
 * Hunting Service - Phase 10, Wave 10.1
 *
 * Core hunting logic and mechanics
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { HuntingTrip, IHuntingTrip } from '../models/HuntingTrip.model';
import { HUNTABLE_ANIMALS, getAnimalDefinition } from '../data/huntableAnimals';
import { HUNTING_GROUNDS, getHuntingGround } from '../data/huntingGrounds';
import {
  AnimalSpecies,
  HuntingWeapon,
  ShotPlacement,
  KillQuality,
  HUNTING_CONSTANTS,
  HuntAvailability,
  HuntResponse,
  AnimalDefinition,
  HuntingGround,
  HarvestResourceType
} from '@desperados/shared';
import logger from '../utils/logger';

export class HuntingService {
  /**
   * Check if character can hunt and get available grounds
   */
  static async checkHuntAvailability(characterId: string): Promise<HuntAvailability> {
    const character = await Character.findById(characterId);
    if (!character) {
      return {
        canHunt: false,
        reason: 'Character not found',
        availableGrounds: [],
        equipment: {
          weapon: HuntingWeapon.PISTOL,
          hasBinoculars: false,
          hasCamouflage: false,
          hasAnimalCalls: false,
          hasScentBlocker: false,
          hasHuntingKnife: false
        }
      };
    }

    // Check if character is jailed
    if (character.isCurrentlyJailed()) {
      return {
        canHunt: false,
        reason: 'Cannot hunt while jailed',
        availableGrounds: [],
        equipment: {
          weapon: HuntingWeapon.PISTOL,
          hasBinoculars: false,
          hasCamouflage: false,
          hasAnimalCalls: false,
          hasScentBlocker: false,
          hasHuntingKnife: false
        }
      };
    }

    // Check if character has an active hunting trip
    const activeTrip = await HuntingTrip.findOne({
      characterId: character._id,
      status: { $nin: ['complete', 'failed'] }
    });

    if (activeTrip) {
      return {
        canHunt: false,
        reason: 'Already on a hunting trip',
        availableGrounds: [],
        equipment: {
          weapon: HuntingWeapon.PISTOL,
          hasBinoculars: false,
          hasCamouflage: false,
          hasAnimalCalls: false,
          hasScentBlocker: false,
          hasHuntingKnife: false
        }
      };
    }

    // Get available hunting grounds based on level
    const availableGrounds = Object.values(HUNTING_GROUNDS).filter(
      ground => ground.minLevel <= character.level
    );

    // Check equipment (simplified for now - can be expanded later)
    const hasHuntingRifle = character.inventory.some(item => item.itemId === 'hunting_rifle');
    const hasVarmintRifle = character.inventory.some(item => item.itemId === 'varmint_rifle');
    const hasBow = character.inventory.some(item => item.itemId === 'bow');
    const hasShotgun = character.inventory.some(item => item.itemId === 'shotgun');

    let weapon = HuntingWeapon.PISTOL;
    if (hasHuntingRifle) weapon = HuntingWeapon.HUNTING_RIFLE;
    else if (hasVarmintRifle) weapon = HuntingWeapon.VARMINT_RIFLE;
    else if (hasBow) weapon = HuntingWeapon.BOW;
    else if (hasShotgun) weapon = HuntingWeapon.SHOTGUN;

    const equipment = {
      weapon,
      hasBinoculars: character.inventory.some(item => item.itemId === 'binoculars'),
      hasCamouflage: character.inventory.some(item => item.itemId === 'camouflage'),
      hasAnimalCalls: character.inventory.some(item => item.itemId === 'animal_calls'),
      hasScentBlocker: character.inventory.some(item => item.itemId === 'scent_blocker'),
      hasHuntingKnife: character.inventory.some(item => item.itemId === 'hunting_knife')
    };

    return {
      canHunt: true,
      availableGrounds,
      equipment
    };
  }

  /**
   * Start a new hunting trip
   */
  static async startHunt(
    characterId: string,
    huntingGroundId: string,
    weapon: HuntingWeapon
  ): Promise<{ success: boolean; error?: string; trip?: IHuntingTrip }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character not found' };
      }

      const huntingGround = getHuntingGround(huntingGroundId);
      if (!huntingGround) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Invalid hunting ground' };
      }

      // Check level requirement
      if (character.level < huntingGround.minLevel) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: `Requires level ${huntingGround.minLevel}` };
      }

      // Check energy
      if (!character.canAffordAction(huntingGround.energyCost)) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Insufficient energy' };
      }

      // Spend energy
      character.spendEnergy(huntingGround.energyCost);
      await character.save({ session });

      // Create hunting trip
      const trip = new HuntingTrip({
        characterId: character._id,
        huntingGroundId,
        weaponUsed: weapon,
        energySpent: huntingGround.energyCost,
        status: 'tracking'
      });

      await trip.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} started hunting at ${huntingGroundId}`);

      return { success: true, trip };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error starting hunt:', error);
      throw error;
    }
  }

  /**
   * Get current hunting trip for character
   */
  static async getCurrentTrip(characterId: string): Promise<IHuntingTrip | null> {
    return await HuntingTrip.findOne({
      characterId,
      status: { $nin: ['complete', 'failed'] }
    });
  }

  /**
   * Get hunting statistics for character
   */
  static async getHuntingStatistics(characterId: string) {
    const trips = await HuntingTrip.find({ characterId, status: 'complete' });

    const stats = {
      totalHunts: trips.length,
      successfulHunts: trips.filter(t => t.harvestResult?.success).length,
      killsBySpecies: {} as Record<AnimalSpecies, number>,
      perfectKills: trips.filter(t => t.harvestResult?.quality === KillQuality.PERFECT).length,
      totalGoldEarned: trips.reduce((sum, t) => sum + (t.goldEarned || 0), 0),
      totalXpEarned: trips.reduce((sum, t) => sum + (t.xpEarned || 0), 0),
      favoriteHuntingGround: undefined as string | undefined,
      largestKill: undefined as any
    };

    // Count kills by species
    trips.forEach(trip => {
      if (trip.targetAnimal) {
        stats.killsBySpecies[trip.targetAnimal] =
          (stats.killsBySpecies[trip.targetAnimal] || 0) + 1;
      }
    });

    // Find favorite hunting ground
    const groundCounts: Record<string, number> = {};
    trips.forEach(trip => {
      groundCounts[trip.huntingGroundId] = (groundCounts[trip.huntingGroundId] || 0) + 1;
    });
    const maxGround = Object.entries(groundCounts).sort((a, b) => b[1] - a[1])[0];
    if (maxGround) {
      stats.favoriteHuntingGround = maxGround[0];
    }

    // Find largest kill
    const largestTrip = trips
      .filter(t => t.harvestResult?.totalValue)
      .sort((a, b) => (b.harvestResult?.totalValue || 0) - (a.harvestResult?.totalValue || 0))[0];

    if (largestTrip && largestTrip.targetAnimal && largestTrip.harvestResult) {
      stats.largestKill = {
        species: largestTrip.targetAnimal,
        quality: largestTrip.harvestResult.quality,
        value: largestTrip.harvestResult.totalValue,
        date: largestTrip.completedAt || largestTrip.createdAt
      };
    }

    return stats;
  }

  /**
   * Abandon current hunting trip
   */
  static async abandonHunt(characterId: string): Promise<{ success: boolean; error?: string }> {
    const trip = await HuntingTrip.findOne({
      characterId,
      status: { $nin: ['complete', 'failed'] }
    });

    if (!trip) {
      return { success: false, error: 'No active hunting trip' };
    }

    trip.status = 'failed';
    trip.completedAt = new Date();
    await trip.save();

    logger.info(`Character ${characterId} abandoned hunting trip ${trip._id}`);

    return { success: true };
  }

  /**
   * Helper: Get random animal from hunting ground
   */
  static selectRandomAnimal(ground: HuntingGround): AnimalSpecies | null {
    const availableAnimals = ground.availableAnimals.filter(
      species => ground.spawnRates[species] > 0
    );

    if (availableAnimals.length === 0) return null;

    // Weighted random selection based on spawn rates
    const totalWeight = availableAnimals.reduce(
      (sum, species) => sum + ground.spawnRates[species],
      0
    );

    let random = Math.random() * totalWeight;
    for (const species of availableAnimals) {
      random -= ground.spawnRates[species];
      if (random <= 0) {
        return species;
      }
    }

    return availableAnimals[0];
  }

  /**
   * Helper: Calculate skill bonus for tracking
   */
  static getTrackingBonus(character: ICharacter): number {
    const trackingSkill = character.getSkillLevel('tracking');
    return trackingSkill * 5; // +5% per skill level
  }

  /**
   * Helper: Calculate skill bonus for marksmanship
   */
  static getMarksmanshipBonus(character: ICharacter): number {
    const marksmanshipSkill = character.getSkillLevel('marksmanship');
    return marksmanshipSkill * 5; // +5% per skill level
  }

  /**
   * Helper: Calculate skill bonus for skinning
   */
  static getSkinningBonus(character: ICharacter): number {
    const skinningSkill = character.getSkillLevel('skinning');
    return skinningSkill * 5; // +5% per skill level
  }

  /**
   * Helper: Calculate stealth bonus
   */
  static getStealthBonus(character: ICharacter): number {
    const stealthSkill = character.getSkillLevel('stealth');
    return stealthSkill * 5; // +5% per skill level
  }

  /**
   * Helper: Determine kill quality based on shot and skinning
   */
  static determineKillQuality(
    shotPlacement: ShotPlacement,
    skinningBonus: number
  ): KillQuality {
    let qualityScore = 50; // Base score

    // Shot placement bonus
    switch (shotPlacement) {
      case ShotPlacement.HEAD:
        qualityScore += 50;
        break;
      case ShotPlacement.HEART:
        qualityScore += 35;
        break;
      case ShotPlacement.LUNGS:
        qualityScore += 20;
        break;
      case ShotPlacement.BODY:
        qualityScore -= 10;
        break;
      default:
        qualityScore -= 30;
    }

    // Skinning skill bonus
    qualityScore += skinningBonus;

    // Add some randomness
    qualityScore += Math.random() * 20 - 10;

    // Determine quality tier
    if (qualityScore >= 95) return KillQuality.PERFECT;
    if (qualityScore >= 80) return KillQuality.EXCELLENT;
    if (qualityScore >= 60) return KillQuality.GOOD;
    if (qualityScore >= 40) return KillQuality.COMMON;
    return KillQuality.POOR;
  }

  /**
   * Helper: Roll for success based on difficulty and bonus
   */
  static rollSuccess(difficulty: number, bonus: number): boolean {
    const roll = Math.random() * 100 + bonus;
    const target = difficulty * 10;
    return roll >= target;
  }
}
