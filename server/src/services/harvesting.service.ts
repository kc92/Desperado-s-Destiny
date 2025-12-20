/**
 * Harvesting Service - Phase 10, Wave 10.1
 *
 * Handles harvesting resources from killed animals
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { HuntingTrip } from '../models/HuntingTrip.model';
import { getAnimalDefinition } from '../data/huntableAnimals';
import { HuntingService } from './hunting.service';
import {
  HarvestResult,
  HarvestedResource,
  KillQuality,
  ShotPlacement,
  HUNTING_CONSTANTS,
  HarvestResource
} from '@desperados/shared';
import { EnergyService } from './energy.service';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

export class HarvestingService {
  /**
   * Attempt to harvest resources from killed animal
   */
  static async attemptHarvest(
    characterId: string,
    tripId: string
  ): Promise<HarvestResult> {
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
          quality: KillQuality.POOR,
          qualityMultiplier: 0.5,
          resources: [],
          totalValue: 0,
          xpGained: 0
        };
      }

      const trip = await HuntingTrip.findById(tripId).session(session);
      if (!trip) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Hunting trip not found',
          quality: KillQuality.POOR,
          qualityMultiplier: 0.5,
          resources: [],
          totalValue: 0,
          xpGained: 0
        };
      }

      if (trip.status !== 'harvesting') {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Not in harvesting phase',
          quality: KillQuality.POOR,
          qualityMultiplier: 0.5,
          resources: [],
          totalValue: 0,
          xpGained: 0
        };
      }

      if (!trip.targetAnimal || !trip.shotResult?.killed) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'No animal to harvest',
          quality: KillQuality.POOR,
          qualityMultiplier: 0.5,
          resources: [],
          totalValue: 0,
          xpGained: 0
        };
      }

      // Check energy
      if (!character.canAffordAction(HUNTING_CONSTANTS.HARVESTING_ENERGY)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Insufficient energy',
          quality: KillQuality.POOR,
          qualityMultiplier: 0.5,
          resources: [],
          totalValue: 0,
          xpGained: 0
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
          quality: KillQuality.POOR,
          qualityMultiplier: 0.5,
          resources: [],
          totalValue: 0,
          xpGained: 0
        };
      }

      // Get skinning bonus
      const skinningBonus = HuntingService.getSkinningBonus(character);

      // Determine kill quality based on shot placement and skinning
      const shotPlacement = trip.shotResult.placement || ShotPlacement.BODY;
      const quality = HuntingService.determineKillQuality(shotPlacement, skinningBonus);
      const qualityMultiplier = HUNTING_CONSTANTS.QUALITY_MULTIPLIERS[quality];

      // Harvest resources
      const harvestedResources: HarvestedResource[] = [];
      let totalValue = 0;

      for (const resource of animalDef.harvestResources) {
        // Check skinning skill requirement
        if (resource.skillRequirement && character.getSkillLevel('skinning') < resource.skillRequirement) {
          continue; // Skip this resource
        }

        // Roll for success
        const successRoll = SecureRNG.float(0, 1);
        const adjustedChance = resource.successChance + (skinningBonus / 100);

        if (successRoll <= adjustedChance) {
          // Calculate quantity with variation
          const baseQty = resource.baseQuantity;
          const variation = SecureRNG.range(-resource.quantityVariation, resource.quantityVariation);
          const quantity = Math.max(1, baseQty + variation);

          // Calculate value with quality multiplier
          const value = Math.floor(resource.baseValue * quantity * qualityMultiplier);

          harvestedResources.push({
            type: resource.type,
            itemId: resource.itemId,
            name: resource.name,
            quantity,
            quality,
            value
          });

          totalValue += value;

          // Add to character inventory
          const existingItem = character.inventory.find(item => item.itemId === resource.itemId);
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            character.inventory.push({
              itemId: resource.itemId,
              quantity,
              acquiredAt: new Date()
            });
          }
        }
      }

      // Spend energy
      await EnergyService.spendEnergy(character._id.toString(), HUNTING_CONSTANTS.HARVESTING_ENERGY, 'harvest_animal', session);
      trip.energySpent += HUNTING_CONSTANTS.HARVESTING_ENERGY;

      // Award dollars and XP
      const xpGained = Math.floor(animalDef.xpReward * qualityMultiplier);
      await character.addDollars(totalValue, 'HUNTING' as any, { animalSpecies: trip.targetAnimal, quality });
      await character.addExperience(xpGained);

      trip.goldEarned = totalValue;
      trip.xpEarned = xpGained;

      // Create result
      const result: HarvestResult = {
        success: true,
        message: this.generateHarvestMessage(animalDef.name, quality, harvestedResources.length),
        quality,
        qualityMultiplier,
        resources: harvestedResources,
        totalValue,
        skinningBonus,
        xpGained
      };

      // Update trip
      trip.harvestResult = {
        success: true,
        message: result.message,
        quality,
        qualityMultiplier,
        resources: harvestedResources.map(r => ({
          type: r.type,
          itemId: r.itemId,
          name: r.name,
          quantity: r.quantity,
          quality: r.quality,
          value: r.value
        })),
        totalValue,
        skinningBonus,
        xpGained
      };
      trip.status = 'complete';
      trip.completedAt = new Date();

      await character.save({ session });
      await trip.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Character ${characterId} harvested ${trip.targetAnimal} with ${quality} quality, ` +
        `earning ${totalValue} dollars and ${xpGained} XP`
      );

      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error in harvesting:', error);
      throw error;
    }
  }

  /**
   * Generate harvest message
   */
  private static generateHarvestMessage(
    animalName: string,
    quality: KillQuality,
    resourceCount: number
  ): string {
    const qualityMessages = {
      [KillQuality.PERFECT]: `You expertly skin the ${animalName}, achieving a perfect pelt. A masterful harvest!`,
      [KillQuality.EXCELLENT]: `You carefully harvest the ${animalName}, producing excellent quality resources.`,
      [KillQuality.GOOD]: `You successfully skin the ${animalName}, obtaining good quality materials.`,
      [KillQuality.COMMON]: `You harvest the ${animalName}, gathering standard quality resources.`,
      [KillQuality.POOR]: `Your skinning is rough, resulting in poor quality materials from the ${animalName}.`
    };

    const message = qualityMessages[quality];
    return `${message} You obtained ${resourceCount} different resources.`;
  }

  /**
   * Calculate potential harvest value (for preview)
   */
  static calculatePotentialValue(
    animalSpecies: string,
    quality: KillQuality
  ): number {
    const animalDef = getAnimalDefinition(animalSpecies as any);
    if (!animalDef) return 0;

    const multiplier = HUNTING_CONSTANTS.QUALITY_MULTIPLIERS[quality];
    const totalBaseValue = animalDef.harvestResources.reduce(
      (sum, resource) => sum + (resource.baseValue * resource.baseQuantity),
      0
    );

    return Math.floor(totalBaseValue * multiplier);
  }
}
