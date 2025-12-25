/**
 * Deep Mining Shaft Service
 *
 * Phase 13: Deep Mining System
 *
 * Handles underground shaft progression, hazard resolution,
 * resource discovery, and equipment management.
 */

import mongoose from 'mongoose';
import logger from '../utils/logger';
import { MiningShaft, IMiningShaftDoc } from '../models/MiningShaft.model';
import { IllegalClaim } from '../models/IllegalClaim.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';
import { InventoryService } from './inventory.service';
import { AppError } from '../utils/errors';
import {
  ShaftLevel,
  HazardType,
  HazardSeverity,
  MiningEquipmentType,
  DeepResourceType,
  DeepResourceTier,
  IDeepMiningStatusResponse,
} from '@desperados/shared';
import {
  SHAFT_LEVEL_CONFIG,
  MINING_EQUIPMENT,
  DEEP_RESOURCES,
  HAZARD_DAMAGE,
} from '@desperados/shared';

/**
 * Result of attempting to descend
 */
interface DescendResult {
  success: boolean;
  newLevel?: ShaftLevel;
  hazardsEncountered?: HazardType[];
  error?: string;
}

/**
 * Result of mining at current level
 */
interface MiningResult {
  success: boolean;
  resourcesFound: Array<{
    resourceType: DeepResourceType;
    quantity: number;
    tier: DeepResourceTier;
  }>;
  hazardTriggered?: {
    type: HazardType;
    severity: HazardSeverity;
    outcome: string;
    damage?: number;
  };
  progressGained: number;
  error?: string;
}

/**
 * Result of installing equipment
 */
interface InstallEquipmentResult {
  success: boolean;
  newMitigation?: number;
  error?: string;
}

export class DeepMiningShaftService {
  /**
   * Create a new mining shaft for an illegal claim
   */
  static async createShaft(
    claimId: string,
    characterId: string
  ): Promise<IMiningShaftDoc | null> {
    try {
      // Verify claim exists and belongs to character
      const claim = await IllegalClaim.findById(claimId);
      if (!claim || claim.characterId.toString() !== characterId) {
        return null;
      }

      // Check if shaft already exists
      const existingShaft = await MiningShaft.getShaftForClaim(claimId);
      if (existingShaft) {
        return existingShaft;
      }

      // Create new shaft
      const shaft = new MiningShaft({
        claimId: new mongoose.Types.ObjectId(claimId),
        characterId: new mongoose.Types.ObjectId(characterId),
        currentLevel: 1,
        maxLevelReached: 1,
        levelProgress: 0,
      });

      // Generate initial hazards for level 1
      this.generateHazardsForLevel(shaft, 1);

      await shaft.save();
      return shaft;
    } catch (error) {
      logger.error('[DeepMiningShaftService] createShaft error:', error);
      return null;
    }
  }

  /**
   * Get shaft status with available resources and hazards
   */
  static async getShaftStatus(shaftId: string): Promise<IDeepMiningStatusResponse | null> {
    try {
      const shaft = await MiningShaft.findById(shaftId);
      if (!shaft) return null;

      const currentConfig = SHAFT_LEVEL_CONFIG[shaft.currentLevel as ShaftLevel];

      // Get available resources for current level
      const availableResources = Object.values(DEEP_RESOURCES).filter(
        (res) => res.minShaftLevel <= shaft.currentLevel
      );

      // Get required equipment for next level
      const nextLevel = (shaft.currentLevel + 1) as ShaftLevel;
      const nextConfig = SHAFT_LEVEL_CONFIG[nextLevel];
      const requiredEquipment = nextConfig?.requiredEquipment
        ? nextConfig.requiredEquipment.map((type) => MINING_EQUIPMENT[type])
        : [];

      // Check if can descend
      const canDescendCheck = shaft.canDescendTo(nextLevel);

      return {
        shaft: shaft.toObject() as any,
        availableResources: availableResources as any[],
        currentHazards: shaft.activeHazards as any[],
        requiredEquipment: requiredEquipment as any[],
        canDescend: canDescendCheck.canDescend,
        descendBlockedReason: canDescendCheck.reason,
      };
    } catch (error) {
      logger.error('[DeepMiningShaftService] getShaftStatus error:', error);
      return null;
    }
  }

  /**
   * Attempt to descend to the next level
   */
  static async descendToNextLevel(
    shaftId: string,
    characterId: string
  ): Promise<DescendResult> {
    try {
      const shaft = await MiningShaft.findById(shaftId);
      if (!shaft) {
        return { success: false, error: 'Shaft not found' };
      }

      if (shaft.characterId.toString() !== characterId) {
        return { success: false, error: 'Not your shaft' };
      }

      const nextLevel = (shaft.currentLevel + 1) as ShaftLevel;

      if (nextLevel > 10) {
        return { success: false, error: 'Already at maximum depth' };
      }

      // Check if can descend
      const canDescend = shaft.canDescendTo(nextLevel);
      if (!canDescend.canDescend) {
        return { success: false, error: canDescend.reason };
      }

      // Check if level progress is complete
      if (shaft.levelProgress < 100) {
        return { success: false, error: `Need 100% level progress (currently ${shaft.levelProgress}%)` };
      }

      // Descend to next level
      shaft.currentLevel = nextLevel;
      shaft.levelProgress = 0;

      if (nextLevel > shaft.maxLevelReached) {
        shaft.maxLevelReached = nextLevel;
      }

      // Generate hazards for new level
      const newHazards = this.generateHazardsForLevel(shaft, nextLevel);
      shaft.calculateHazardMitigation();

      await shaft.save();

      return {
        success: true,
        newLevel: nextLevel,
        hazardsEncountered: newHazards,
      };
    } catch (error) {
      logger.error('[DeepMiningShaftService] descendToNextLevel error:', error);
      return { success: false, error: 'Failed to descend' };
    }
  }

  /**
   * Mine at current level (progress + resource discovery + hazard check)
   */
  static async mineAtCurrentLevel(
    shaftId: string,
    characterId: string
  ): Promise<MiningResult> {
    try {
      const shaft = await MiningShaft.findById(shaftId);
      if (!shaft) {
        return { success: false, resourcesFound: [], progressGained: 0, error: 'Shaft not found' };
      }

      if (shaft.characterId.toString() !== characterId) {
        return { success: false, resourcesFound: [], progressGained: 0, error: 'Not your shaft' };
      }

      const levelConfig = SHAFT_LEVEL_CONFIG[shaft.currentLevel as ShaftLevel];

      // Check for hazard trigger
      const hazardResult = await this.checkHazardTrigger(shaft);

      // Calculate progress gained (base + mitigation bonus)
      const baseProg = 10;
      const mitigationBonus = Math.floor(shaft.hazardMitigation / 10);
      const progressGained = baseProg + mitigationBonus;

      shaft.levelProgress = Math.min(100, shaft.levelProgress + progressGained);

      // Check for resource discovery
      const resourcesFound = this.rollResourceDiscovery(shaft.currentLevel);

      // Add discovered resources to shaft
      for (const resource of resourcesFound) {
        shaft.discoveredResources.push({
          resourceType: resource.resourceType,
          tier: resource.tier,
          quantity: resource.quantity,
          discoveredAt: new Date(),
          collected: false,
        });
      }

      shaft.totalResourcesExtracted += resourcesFound.reduce((sum, r) => sum + r.quantity, 0);

      await shaft.save();

      return {
        success: true,
        resourcesFound,
        hazardTriggered: hazardResult || undefined,
        progressGained,
      };
    } catch (error) {
      logger.error('[DeepMiningShaftService] mineAtCurrentLevel error:', error);
      return { success: false, resourcesFound: [], progressGained: 0, error: 'Mining failed' };
    }
  }

  /**
   * Install equipment in shaft
   */
  static async installEquipment(
    shaftId: string,
    characterId: string,
    equipmentType: MiningEquipmentType
  ): Promise<InstallEquipmentResult> {
    try {
      const shaft = await MiningShaft.findById(shaftId);
      if (!shaft) {
        return { success: false, error: 'Shaft not found' };
      }

      if (shaft.characterId.toString() !== characterId) {
        return { success: false, error: 'Not your shaft' };
      }

      // Check if equipment is already installed
      if (shaft.hasEquipment(equipmentType)) {
        return { success: false, error: 'Equipment already installed' };
      }

      const equipDef = MINING_EQUIPMENT[equipmentType];
      if (!equipDef) {
        return { success: false, error: 'Invalid equipment type' };
      }

      // PHASE 4 FIX: Deduct equipment cost from character
      const equipmentCost = equipDef.cost;
      if (equipmentCost > 0) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          await DollarService.deductDollars(
            characterId,
            equipmentCost,
            TransactionSource.DEEP_MINING_EQUIPMENT,
            {
              shaftId: shaft._id.toString(),
              equipmentType,
              equipmentName: equipDef.name
            },
            session
          );

          // Install equipment
          shaft.installedEquipment.push({
            type: equipmentType,
            installedAt: new Date(),
            condition: 100,
          });

          // Recalculate mitigation
          const newMitigation = shaft.calculateHazardMitigation();

          await shaft.save({ session });
          await session.commitTransaction();

          return { success: true, newMitigation };
        } catch (error) {
          await session.abortTransaction();
          if (error instanceof AppError) {
            return { success: false, error: error.message };
          }
          return { success: false, error: 'Insufficient funds for equipment' };
        } finally {
          session.endSession();
        }
      }

      // Free equipment (shouldn't happen but handle gracefully)
      shaft.installedEquipment.push({
        type: equipmentType,
        installedAt: new Date(),
        condition: 100,
      });

      const newMitigation = shaft.calculateHazardMitigation();
      await shaft.save();

      return { success: true, newMitigation };
    } catch (error) {
      logger.error('[DeepMiningShaftService] installEquipment error:', error);
      return { success: false, error: 'Failed to install equipment' };
    }
  }

  /**
   * Repair equipment
   */
  static async repairEquipment(
    shaftId: string,
    characterId: string,
    equipmentType: MiningEquipmentType
  ): Promise<{ success: boolean; newCondition?: number; error?: string }> {
    try {
      const shaft = await MiningShaft.findById(shaftId);
      if (!shaft) {
        return { success: false, error: 'Shaft not found' };
      }

      if (shaft.characterId.toString() !== characterId) {
        return { success: false, error: 'Not your shaft' };
      }

      const equipment = shaft.installedEquipment.find((eq) => eq.type === equipmentType);
      if (!equipment) {
        return { success: false, error: 'Equipment not installed' };
      }

      // PHASE 4 FIX: Calculate and deduct repair cost
      const equipDef = MINING_EQUIPMENT[equipmentType];
      if (!equipDef) {
        return { success: false, error: 'Invalid equipment type' };
      }

      // Repair cost is 10% of purchase price, scaled by damage amount
      const damagePercent = 100 - equipment.condition;
      if (damagePercent <= 0) {
        return { success: false, error: 'Equipment is already at full condition' };
      }

      const baseRepairCost = Math.ceil(equipDef.cost * 0.1); // 10% of purchase price
      const repairCost = Math.ceil(baseRepairCost * (damagePercent / 100));

      if (repairCost > 0) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          await DollarService.deductDollars(
            characterId,
            repairCost,
            TransactionSource.DEEP_MINING_REPAIR,
            {
              shaftId: shaft._id.toString(),
              equipmentType,
              equipmentName: equipDef.name,
              conditionBefore: equipment.condition,
              repairCost
            },
            session
          );

          equipment.condition = 100;
          equipment.lastMaintenanceAt = new Date();

          shaft.calculateHazardMitigation();
          await shaft.save({ session });
          await session.commitTransaction();

          return { success: true, newCondition: 100 };
        } catch (error) {
          await session.abortTransaction();
          if (error instanceof AppError) {
            return { success: false, error: error.message };
          }
          return { success: false, error: 'Insufficient funds for repair' };
        } finally {
          session.endSession();
        }
      }

      // Free repair (minimal damage)
      equipment.condition = 100;
      equipment.lastMaintenanceAt = new Date();

      shaft.calculateHazardMitigation();
      await shaft.save();

      return { success: true, newCondition: 100 };
    } catch (error) {
      logger.error('[DeepMiningShaftService] repairEquipment error:', error);
      return { success: false, error: 'Failed to repair equipment' };
    }
  }

  /**
   * Collect discovered resources
   */
  static async collectResources(
    shaftId: string,
    characterId: string
  ): Promise<{ success: boolean; collected: Array<{ resourceType: DeepResourceType; quantity: number }>; error?: string }> {
    try {
      const shaft = await MiningShaft.findById(shaftId);
      if (!shaft) {
        return { success: false, collected: [], error: 'Shaft not found' };
      }

      if (shaft.characterId.toString() !== characterId) {
        return { success: false, collected: [], error: 'Not your shaft' };
      }

      const uncollected = shaft.discoveredResources.filter((r) => !r.collected);
      if (uncollected.length === 0) {
        return { success: false, collected: [], error: 'No resources to collect' };
      }

      // PHASE 4 FIX: Add resources to character inventory atomically
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const collected: Array<{ resourceType: DeepResourceType; quantity: number }> = [];

        // Prepare items for inventory
        const itemsToAdd = uncollected.map(resource => ({
          itemId: resource.resourceType,
          quantity: resource.quantity
        }));

        // Add all resources to inventory in one operation
        await InventoryService.addItems(
          characterId,
          itemsToAdd,
          { type: 'deep_mining', id: shaft._id.toString(), name: 'Deep Mining Shaft' },
          session
        );

        // Mark resources as collected AFTER successful inventory add
        for (const resource of uncollected) {
          resource.collected = true;
          collected.push({
            resourceType: resource.resourceType,
            quantity: resource.quantity,
          });
        }

        await shaft.save({ session });
        await session.commitTransaction();

        return { success: true, collected };
      } catch (error) {
        await session.abortTransaction();
        logger.error('[DeepMiningShaftService] collectResources transaction error:', error);
        if (error instanceof AppError) {
          return { success: false, collected: [], error: error.message };
        }
        return { success: false, collected: [], error: 'Failed to add resources to inventory' };
      } finally {
        session.endSession();
      }
    } catch (error) {
      logger.error('[DeepMiningShaftService] collectResources error:', error);
      return { success: false, collected: [], error: 'Failed to collect resources' };
    }
  }

  /**
   * Generate hazards for a level
   */
  private static generateHazardsForLevel(shaft: IMiningShaftDoc, level: ShaftLevel): HazardType[] {
    const config = SHAFT_LEVEL_CONFIG[level];
    if (!config || !config.possibleHazards) return [];

    const generatedHazards: HazardType[] = [];

    for (const hazardType of config.possibleHazards) {
      // Roll for hazard spawn (higher levels = more likely)
      const spawnChance = 20 + (level * 5); // 25% at L1, 70% at L10
      if (Math.random() * 100 < spawnChance) {
        // Determine severity based on level
        let severity: HazardSeverity;
        const severityRoll = Math.random() * 100;

        if (level >= 8 && severityRoll < 30) {
          severity = HazardSeverity.CRITICAL;
        } else if (level >= 5 && severityRoll < 50) {
          severity = HazardSeverity.SEVERE;
        } else if (level >= 3 && severityRoll < 70) {
          severity = HazardSeverity.MODERATE;
        } else {
          severity = HazardSeverity.MINOR;
        }

        shaft.addHazard(hazardType, severity, level);
        generatedHazards.push(hazardType);
      }
    }

    return generatedHazards;
  }

  /**
   * Check if a hazard triggers during mining
   */
  private static async checkHazardTrigger(
    shaft: IMiningShaftDoc
  ): Promise<{ type: HazardType; severity: HazardSeverity; outcome: string; damage?: number } | null> {
    if (shaft.activeHazards.length === 0) return null;

    // Pick a random active hazard
    const hazard = shaft.activeHazards[Math.floor(Math.random() * shaft.activeHazards.length)];

    // Calculate trigger chance (base 30%, reduced by mitigation)
    const baseTriggerChance = 30;
    const triggerChance = baseTriggerChance * (1 - hazard.currentMitigation / 100);

    if (Math.random() * 100 >= triggerChance) {
      return null; // Hazard didn't trigger
    }

    // Hazard triggered - determine outcome
    const mitigationRoll = Math.random() * 100;
    let outcome: 'avoided' | 'minor_damage' | 'major_damage' | 'injury';
    let damage = 0;

    if (mitigationRoll < hazard.currentMitigation) {
      outcome = 'avoided';
    } else {
      const severityDamage = HAZARD_DAMAGE[hazard.severity];
      const damageRoll = Math.random() * 100;

      if (damageRoll < 20) {
        outcome = 'injury';
        damage = severityDamage.max;
      } else if (damageRoll < 50) {
        outcome = 'major_damage';
        damage = Math.floor((severityDamage.min + severityDamage.max) / 2);
      } else {
        outcome = 'minor_damage';
        damage = severityDamage.min;
      }
    }

    // Record the incident
    shaft.recordIncident(hazard.type, hazard.severity, outcome, damage);

    // Damage equipment if not avoided
    if (outcome !== 'avoided') {
      await this.damageEquipment(shaft, hazard.type, outcome === 'major_damage' || outcome === 'injury' ? 20 : 10);
    }

    return {
      type: hazard.type,
      severity: hazard.severity,
      outcome,
      damage: damage > 0 ? damage : undefined,
    };
  }

  /**
   * Damage equipment that mitigates a hazard type
   */
  private static async damageEquipment(
    shaft: IMiningShaftDoc,
    hazardType: HazardType,
    damageAmount: number
  ): Promise<void> {
    for (const installed of shaft.installedEquipment) {
      const equipDef = MINING_EQUIPMENT[installed.type];
      if (!equipDef) continue;

      const mitigates = equipDef.hazardMitigation.some(
        (m: { hazardType: HazardType }) => m.hazardType === hazardType
      );

      if (mitigates) {
        installed.condition = Math.max(0, installed.condition - damageAmount);
      }
    }

    shaft.calculateHazardMitigation();
  }

  /**
   * Roll for resource discovery at current level
   */
  private static rollResourceDiscovery(
    level: ShaftLevel
  ): Array<{ resourceType: DeepResourceType; quantity: number; tier: DeepResourceTier }> {
    const found: Array<{ resourceType: DeepResourceType; quantity: number; tier: DeepResourceTier }> = [];

    // Get resources available at this level
    const availableResources = Object.entries(DEEP_RESOURCES).filter(
      ([, res]) => res.minShaftLevel <= level
    );

    if (availableResources.length === 0) return found;

    // Roll for each resource type
    for (const [type, resource] of availableResources) {
      // Base discovery chance modified by rarity
      let baseChance: number;
      switch (resource.rarity) {
        case 'rare':
          baseChance = 15;
          break;
        case 'epic':
          baseChance = 8;
          break;
        case 'legendary':
          baseChance = 3;
          break;
        case 'cosmic':
          baseChance = 1;
          break;
        default:
          baseChance = 10;
      }

      // Higher levels have better discovery chance
      const levelBonus = (level - resource.minShaftLevel) * 2;
      const discoveryChance = baseChance + levelBonus;

      if (Math.random() * 100 < discoveryChance) {
        // Determine quantity (1-3, rarer = less)
        let maxQuantity: number;
        switch (resource.rarity) {
          case 'rare':
            maxQuantity = 3;
            break;
          case 'epic':
            maxQuantity = 2;
            break;
          case 'legendary':
          case 'cosmic':
            maxQuantity = 1;
            break;
          default:
            maxQuantity = 2;
        }

        const quantity = Math.ceil(Math.random() * maxQuantity);

        found.push({
          resourceType: type as DeepResourceType,
          quantity,
          tier: resource.tier,
        });
      }
    }

    return found;
  }

  /**
   * Get all shafts for a character
   */
  static async getShaftsForCharacter(characterId: string): Promise<IMiningShaftDoc[]> {
    return MiningShaft.getShaftsForCharacter(characterId);
  }

  /**
   * Get deepest shafts leaderboard
   */
  static async getDeepestShaftsLeaderboard(limit: number = 10): Promise<IMiningShaftDoc[]> {
    return MiningShaft.getDeepestShafts(limit);
  }
}
