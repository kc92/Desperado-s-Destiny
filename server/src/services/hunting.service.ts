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
import { EnergyService } from './energy.service';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import { DollarService } from './dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';

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

    // Get available hunting grounds based on Combat Level
    const combatLevel = character.combatLevel || 1;
    const availableGrounds = Object.values(HUNTING_GROUNDS).filter(
      ground => ground.minLevel <= combatLevel
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

      // Check Combat Level requirement
      const combatLevelCheck = character.combatLevel || 1;
      if (combatLevelCheck < huntingGround.minLevel) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: `Requires Combat Level ${huntingGround.minLevel}` };
      }

      // Check energy
      if (!character.canAffordAction(huntingGround.energyCost)) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Insufficient energy' };
      }

      // Spend energy
      await EnergyService.spendEnergy(character._id.toString(), huntingGround.energyCost, 'start_hunt', session);
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
    const trips = await HuntingTrip.find({ characterId, status: 'complete' }).lean();

    const stats = {
      totalHunts: trips.length,
      successfulHunts: trips.filter(t => t.harvestResult?.success).length,
      killsBySpecies: {} as Record<AnimalSpecies, number>,
      perfectKills: trips.filter(t => t.harvestResult?.quality === KillQuality.PERFECT).length,
      totalDollarsEarned: trips.reduce((sum, t) => sum + (t.goldEarned || 0), 0),
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
    const weightedItems = availableAnimals.map(species => ({
      item: species,
      weight: ground.spawnRates[species]
    }));
    return SecureRNG.weightedSelect(weightedItems);
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
    qualityScore += SecureRNG.range(-10, 10);

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
    const roll = SecureRNG.d100() + bonus;
    const target = difficulty * 10;
    return roll >= target;
  }

  // ============================================
  // CRITICAL FIX: Missing hunt progression methods
  // These methods were missing, causing hunts to be stuck in 'tracking' forever
  // ============================================

  /**
   * Track animal - Advance hunt from 'tracking' to 'aiming' phase
   * This is called when the player attempts to find and track an animal
   */
  static async trackAnimal(characterId: string, direction?: string): Promise<{
    success: boolean;
    error?: string;
    animalFound?: boolean;
    animal?: AnimalSpecies;
    distance?: number;
    trackingProgress?: number;
  }> {
    const trip = await HuntingTrip.findOne({
      characterId,
      status: 'tracking'
    });

    if (!trip) {
      return { success: false, error: 'No active tracking session' };
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    const ground = getHuntingGround(trip.huntingGroundId);
    if (!ground) {
      return { success: false, error: 'Hunting ground not found' };
    }

    // Calculate tracking success
    const trackingBonus = this.getTrackingBonus(character);
    const stealthBonus = this.getStealthBonus(character);

    // Increment tracking progress
    const progressGain = 20 + SecureRNG.range(0, 19) + Math.floor(trackingBonus / 2);
    const currentProgress = (trip.trackingProgress || 0) + progressGain;

    // Update trip
    trip.trackingProgress = currentProgress;

    // Check if animal is found (100% progress = animal found)
    if (currentProgress >= 100) {
      // Select random animal from this hunting ground
      const animal = this.selectRandomAnimal(ground);
      if (!animal) {
        trip.status = 'failed';
        trip.completedAt = new Date();
        await trip.save();
        return { success: false, error: 'No animals found in this area' };
      }

      trip.targetAnimal = animal;
      trip.status = 'aiming';
      trip.trackingProgress = 100;
      await trip.save();

      logger.info(`Character ${characterId} found a ${animal} to hunt`);

      return {
        success: true,
        animalFound: true,
        animal,
        distance: SecureRNG.range(30, 99), // Random distance 30-100 yards
        trackingProgress: 100
      };
    }

    await trip.save();

    return {
      success: true,
      animalFound: false,
      trackingProgress: currentProgress
    };
  }

  /**
   * Take a shot at the animal - Core hunting action
   * Called when player is in 'aiming' phase and fires at the animal
   */
  static async takeShot(
    characterId: string,
    shotPlacement: ShotPlacement
  ): Promise<{
    success: boolean;
    error?: string;
    hit?: boolean;
    quality?: KillQuality;
    harvestResult?: {
      success: boolean;
      quality: KillQuality;
      resources: Array<{ type: HarvestResourceType; quantity: number; value: number }>;
      totalValue: number;
    };
    xpEarned?: number;
    goldEarned?: number;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const trip = await HuntingTrip.findOne({
        characterId,
        status: 'aiming'
      }).session(session);

      if (!trip) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Not aiming at any animal' };
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character not found' };
      }

      const animal = trip.targetAnimal;
      if (!animal) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'No target animal' };
      }

      const animalDef = getAnimalDefinition(animal);
      if (!animalDef) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Unknown animal' };
      }

      // Calculate hit chance based on marksmanship and shot placement
      const marksmanshipBonus = this.getMarksmanshipBonus(character);
      let baseHitChance = 50;

      // Difficulty modifiers based on shot placement
      switch (shotPlacement) {
        case ShotPlacement.HEAD:
          baseHitChance -= 20; // Hard shot
          break;
        case ShotPlacement.HEART:
          baseHitChance -= 10; // Medium shot
          break;
        case ShotPlacement.LUNGS:
          baseHitChance += 0; // Normal shot
          break;
        case ShotPlacement.BODY:
          baseHitChance += 20; // Easy shot but lower quality
          break;
      }

      // Use killDifficulty as the difficulty modifier
      const hitChance = baseHitChance + marksmanshipBonus + (animalDef.killDifficulty || 5) * -3;
      const hitRoll = SecureRNG.d100();
      const isHit = hitRoll < hitChance;

      trip.shotPlacement = shotPlacement;

      if (!isHit) {
        // Missed - animal escapes
        trip.status = 'failed';
        trip.completedAt = new Date();
        await trip.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`Character ${characterId} missed shot at ${animal}`);

        return {
          success: true,
          hit: false,
          error: 'Shot missed - animal escaped'
        };
      }

      // Hit! Calculate quality and harvest
      const skinningBonus = this.getSkinningBonus(character);
      const quality = this.determineKillQuality(shotPlacement, skinningBonus);

      // Calculate harvest resources
      const harvestResult = this.calculateHarvest(animalDef, quality);

      // Calculate XP and gold earned
      const baseXp = animalDef.xpReward || 25;
      const baseGold = harvestResult.totalValue;

      const qualityMultiplier = {
        [KillQuality.PERFECT]: 2.0,
        [KillQuality.EXCELLENT]: 1.5,
        [KillQuality.GOOD]: 1.0,
        [KillQuality.COMMON]: 0.75,
        [KillQuality.POOR]: 0.5
      }[quality];

      const xpEarned = Math.floor(baseXp * qualityMultiplier);
      const dollarsEarned = Math.floor(baseGold * qualityMultiplier);

      // Update trip
      trip.status = 'complete';
      trip.completedAt = new Date();
      trip.harvestResult = {
        success: harvestResult.success,
        message: `Successfully harvested ${animalDef.name}`,
        quality: harvestResult.quality,
        qualityMultiplier,
        resources: harvestResult.resources.map(r => ({
          type: r.type,
          itemId: `${r.type.toLowerCase()}_${animalDef.species}`,
          name: `${animalDef.name} ${r.type}`,
          quantity: r.quantity,
          quality: harvestResult.quality,
          value: r.value
        })),
        totalValue: harvestResult.totalValue,
        skinningBonus,
        xpGained: xpEarned
      };
      trip.xpEarned = xpEarned;
      trip.goldEarned = dollarsEarned;
      await trip.save({ session });

      // Award XP to character
      character.experience += xpEarned;
      await character.save({ session });

      // Award dollars through DollarService
      await DollarService.addDollars(
        character._id.toString(),
        dollarsEarned,
        TransactionSource.HUNTING,
        {
          animal,
          quality,
          harvestValue: harvestResult.totalValue,
          shotPlacement,
          currencyType: CurrencyType.DOLLAR
        },
        session
      );

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} successfully hunted a ${animal} (${quality} quality)`);

      return {
        success: true,
        hit: true,
        quality,
        harvestResult,
        xpEarned,
        goldEarned: dollarsEarned
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error in takeShot:', error);
      throw error;
    }
  }

  /**
   * Calculate harvest resources based on animal and kill quality
   */
  static calculateHarvest(
    animal: AnimalDefinition,
    quality: KillQuality
  ): {
    success: boolean;
    quality: KillQuality;
    resources: Array<{ type: HarvestResourceType; quantity: number; value: number }>;
    totalValue: number;
  } {
    const resources: Array<{ type: HarvestResourceType; quantity: number; value: number }> = [];

    // Quality affects yield
    const yieldMultiplier = {
      [KillQuality.PERFECT]: 1.0,
      [KillQuality.EXCELLENT]: 0.9,
      [KillQuality.GOOD]: 0.7,
      [KillQuality.COMMON]: 0.5,
      [KillQuality.POOR]: 0.3
    }[quality];

    // Base resources from animal
    const baseResources = animal.harvestResources || [];
    let totalValue = 0;

    for (const resource of baseResources) {
      // Calculate max yield from baseQuantity and quantityVariation
      const maxYield = resource.baseQuantity + resource.quantityVariation;
      const quantity = Math.max(1, Math.floor(maxYield * yieldMultiplier));
      const value = resource.baseValue * quantity;

      resources.push({
        type: resource.type,
        quantity,
        value
      });

      totalValue += value;
    }

    return {
      success: true,
      quality,
      resources,
      totalValue
    };
  }

  /**
   * Get active hunt status for a character
   * Returns current hunt state for the player
   */
  static async getHuntStatus(characterId: string): Promise<{
    hasActiveHunt: boolean;
    trip?: IHuntingTrip;
    phase?: string;
    animal?: AnimalSpecies;
    trackingProgress?: number;
    timeRemaining?: number;
  }> {
    const trip = await HuntingTrip.findOne({
      characterId,
      status: { $nin: ['complete', 'failed'] }
    });

    if (!trip) {
      return { hasActiveHunt: false };
    }

    return {
      hasActiveHunt: true,
      trip,
      phase: trip.status,
      animal: trip.targetAnimal,
      trackingProgress: trip.trackingProgress || 0
    };
  }
}
