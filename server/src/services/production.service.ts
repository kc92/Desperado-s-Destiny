/**
 * Production Service
 *
 * Handles all production operations for properties
 */

import mongoose from 'mongoose';
import { ProductionSlot, IProductionSlot } from '../models/ProductionSlot.model';
import { PropertyWorker, IPropertyWorker } from '../models/PropertyWorker.model';
import { Character, ICharacter } from '../models/Character.model';
import { Item } from '../models/Item.model';
import { Property } from '../models/Property.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { TerritoryBonusService } from './territoryBonus.service';
import {
  ProductDefinition,
  ProductQuality,
  ProductionStatus,
  PropertyType,
  PROPERTY_CONSTANTS,
} from '@desperados/shared';
import { getProductById } from '../data/productDefinitions';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

/**
 * Start production order result
 */
interface StartProductionResult {
  success: boolean;
  slot: IProductionSlot;
  message: string;
  estimatedCompletion: Date;
}

/**
 * Collect production result
 */
interface CollectProductionResult {
  success: boolean;
  products: Array<{
    itemId: string;
    quantity: number;
    quality: ProductQuality;
  }>;
  goldEarned: number;
  experienceGained: number;
  message: string;
}

/**
 * Production Service
 */
export class ProductionService {
  /**
   * Calculate the daily property income cap for a character
   * BALANCE FIX: Prevents exponential wealth accumulation from properties
   *
   * Formula: BASE_DAILY_CAP + (level * PER_LEVEL_BONUS), capped at ABSOLUTE_MAX_DAILY
   *
   * @param level - Character level
   * @returns Maximum daily dollars from property income
   */
  static calculateDailyIncomeCap(level: number): number {
    const { INCOME_CAP } = PROPERTY_CONSTANTS;
    const calculatedCap = INCOME_CAP.BASE_DAILY_CAP + (level * INCOME_CAP.PER_LEVEL_BONUS);
    return Math.min(calculatedCap, INCOME_CAP.ABSOLUTE_MAX_DAILY);
  }

  /**
   * Apply income cap to dollars earned from production
   * BALANCE FIX: Tracks daily property income and caps it
   *
   * PHASE 4 FIX: Uses atomic increment to prevent race condition
   * where concurrent collections could bypass the daily cap.
   *
   * @param character - The character collecting production
   * @param dollarsEarned - Raw dollar amount from production
   * @param session - Optional MongoDB session for transaction
   * @returns Capped dollar amount
   */
  static async applyIncomeCap(
    character: ICharacter,
    dollarsEarned: number,
    session?: mongoose.ClientSession
  ): Promise<number> {
    const dailyCap = this.calculateDailyIncomeCap(character.level);

    // Get today's start time (UTC midnight)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // PHASE 4 FIX: First, check if we need to reset the daily counter
    // Use atomic operation to reset if lastProductionIncomeReset is before today
    const needsReset = !character.lastProductionIncomeReset ||
      new Date(character.lastProductionIncomeReset) < today;

    if (needsReset) {
      // Atomically reset the daily counter
      await Character.findOneAndUpdate(
        { _id: character._id },
        {
          $set: {
            dailyProductionIncome: 0,
            lastProductionIncomeReset: today
          }
        },
        { session }
      );
      character.dailyProductionIncome = 0;
      character.lastProductionIncomeReset = today;
    }

    // Get current tracked income (refresh from DB for atomic accuracy)
    const freshCharacter = await Character.findById(character._id).session(session || null);
    const currentIncome = freshCharacter?.dailyProductionIncome || 0;

    // Calculate how much more the character can earn today
    const remainingCap = Math.max(0, dailyCap - currentIncome);
    const cappedDollars = Math.min(dollarsEarned, remainingCap);

    if (cappedDollars <= 0) {
      // Already at cap
      logger.info(
        `[BALANCE] Property income at cap for ${character.name}: ` +
        `${dollarsEarned} → 0 (daily cap: ${dailyCap}, used: ${currentIncome})`
      );
      return 0;
    }

    // PHASE 4 FIX: Atomically increment daily income with cap check
    // This prevents race condition where two requests both pass cap check
    const result = await Character.findOneAndUpdate(
      {
        _id: character._id,
        // Atomic check: only update if there's still room under the cap
        dailyProductionIncome: { $lt: dailyCap }
      },
      {
        $inc: { dailyProductionIncome: cappedDollars }
      },
      { new: true, session }
    );

    if (!result) {
      // Cap was reached by a concurrent request
      logger.info(
        `[BALANCE] Property income cap reached (concurrent) for ${character.name}: ` +
        `${dollarsEarned} → 0`
      );
      return 0;
    }

    // Update in-memory character for consistency
    character.dailyProductionIncome = result.dailyProductionIncome;

    // Log if capping occurred
    if (cappedDollars < dollarsEarned) {
      logger.info(
        `[BALANCE] Property income capped for ${character.name}: ` +
        `${dollarsEarned} → ${cappedDollars} (daily cap: ${dailyCap}, used: ${result.dailyProductionIncome})`
      );
    }

    return cappedDollars;
  }

  /**
   * Start a new production order
   */
  static async startProduction(
    slotId: string,
    productId: string,
    quantity: number,
    characterId: string,
    workerIds: string[] = [],
    rushOrder: boolean = false
  ): Promise<StartProductionResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get production slot
      const slot = await ProductionSlot.findOne({ slotId }).session(session);
      if (!slot) {
        throw new Error('Production slot not found');
      }

      // Verify ownership
      if (slot.characterId.toString() !== characterId) {
        throw new Error('You do not own this production slot');
      }

      // Check if slot can start production
      if (!slot.canStartProduction()) {
        throw new Error(`Slot is ${slot.status} and cannot start production`);
      }

      // Get product definition
      const product = getProductById(productId);
      if (!product) {
        throw new Error('Invalid product ID');
      }

      // Verify property type
      if (!product.propertyTypes.includes(slot.propertyType)) {
        throw new Error('This product cannot be produced at this property type');
      }

      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Check level requirement
      if (character.level < product.requiredLevel) {
        throw new Error(
          `Requires level ${product.requiredLevel} (you are level ${character.level})`
        );
      }

      // Check dollar cost
      const totalDollarCost = product.goldCost * quantity;
      if (!character.hasDollars(totalDollarCost)) {
        throw new Error(`Insufficient dollars (need ${totalDollarCost})`);
      }

      // Check materials
      const materialsNeeded: Array<{ itemId: string; quantity: number }> = [];
      for (const material of product.materials) {
        const totalNeeded = material.quantity * quantity;
        materialsNeeded.push({ itemId: material.itemId, quantity: totalNeeded });

        const invItem = character.inventory.find((i) => i.itemId === material.itemId);
        if (!invItem || invItem.quantity < totalNeeded) {
          throw new Error(
            `Insufficient ${material.itemId} (need ${totalNeeded}, have ${invItem?.quantity || 0})`
          );
        }
      }

      // Get and validate workers
      const workers: IPropertyWorker[] = [];
      if (workerIds.length > 0) {
        for (const workerId of workerIds) {
          const worker = await PropertyWorker.findOne({
            workerId,
            propertyId: slot.propertyId,
          }).session(session);

          if (!worker) {
            throw new Error(`Worker ${workerId} not found`);
          }

          if (!worker.canWork()) {
            throw new Error(`Worker ${worker.name} cannot work (sick or on strike)`);
          }

          if (worker.isAssigned) {
            throw new Error(`Worker ${worker.name} is already assigned`);
          }

          workers.push(worker);
        }
      }

      // Validate worker count
      if (workers.length < product.minWorkers) {
        throw new Error(`This product requires at least ${product.minWorkers} workers`);
      }

      if (workers.length > product.maxWorkers) {
        throw new Error(`This product allows maximum ${product.maxWorkers} workers`);
      }

      // Check for required worker type
      if (product.requiredWorkerType) {
        const hasRequiredWorker = workers.some(
          (w) => w.specialization === product.requiredWorkerType
        );
        if (!hasRequiredWorker) {
          throw new Error(`Requires a ${product.requiredWorkerType} worker`);
        }
      }

      // Calculate production time with bonuses
      let productionTime = product.baseProductionTime;

      // Apply slot speed bonus
      productionTime = slot.calculateCompletionTime(productionTime);

      // Apply worker efficiency bonuses
      for (const worker of workers) {
        const workerSpeedBonus = worker.calculateProductionBonus('speed');
        productionTime *= 1 - workerSpeedBonus;
      }

      // Multiple workers provide bonus
      if (workers.length > product.minWorkers) {
        const extraWorkers = workers.length - product.minWorkers;
        const workerBonus = extraWorkers * product.workerEfficiencyBonus;
        productionTime *= 1 - workerBonus;
      }

      // Apply territory bonuses for production speed and worker efficiency
      try {
        const property = await Property.findOne({ propertyId: slot.propertyId }).session(session);
        if (property && property.locationId && character.gangId) {
          const propertyBonuses = await TerritoryBonusService.getPropertyBonuses(
            property.locationId,
            character.gangId
          );

          // Apply production speed bonus (speed < 1 means faster production)
          if (propertyBonuses.bonuses.speed < 1.0) {
            productionTime *= propertyBonuses.bonuses.speed;
          }

          // Apply worker efficiency bonus to worker contribution
          if (propertyBonuses.bonuses.workerEfficiency > 1.0 && workers.length > 0) {
            const efficiencyBonus = (propertyBonuses.bonuses.workerEfficiency - 1.0) * 0.5;
            productionTime *= (1 - efficiencyBonus);
          }
        }
      } catch (error) {
        logger.debug('Territory bonus lookup failed for production speed', { error });
        // Continue without territory bonuses
      }

      // Rush order
      let rushCost = 0;
      if (rushOrder) {
        if (!product.canRush) {
          throw new Error('This product cannot be rushed');
        }
        rushCost = Math.ceil(totalDollarCost * product.rushCostMultiplier);
        productionTime = Math.ceil(productionTime * 0.25); // Rush reduces time to 25%

        if (!character.hasDollars(rushCost)) {
          throw new Error(`Insufficient dollars for rush order (need ${rushCost})`);
        }
      }

      // Calculate completion time
      const now = new Date();
      const estimatedCompletion = new Date(now.getTime() + productionTime * 60 * 1000);

      // Deduct dollars
      const totalCost = totalDollarCost + rushCost;
      await character.deductDollars(totalCost, TransactionSource.PRODUCTION_START, {
        productId,
        quantity,
        rushOrder,
        currencyType: 'DOLLAR',
      });

      // Consume materials
      for (const materialNeeded of materialsNeeded) {
        const material = product.materials.find((m) => m.itemId === materialNeeded.itemId);
        if (material?.consumed) {
          const invItem = character.inventory.find(
            (i) => i.itemId === materialNeeded.itemId
          );
          if (invItem) {
            invItem.quantity -= materialNeeded.quantity;
            if (invItem.quantity <= 0) {
              character.inventory = character.inventory.filter(
                (i) => i.itemId !== materialNeeded.itemId
              );
            }
          }
        }
      }

      await character.save({ session });

      // Assign workers
      for (const worker of workers) {
        worker.isAssigned = true;
        worker.assignedSlotId = slotId;
        worker.currentOrderId = uuidv4();
        await worker.save({ session });
      }

      // Create production order
      slot.currentOrder = {
        orderId: uuidv4(),
        productId,
        quantity,
        targetQuality: ProductQuality.STANDARD,
        materialsUsed: materialsNeeded,
        workersAssigned: workers.length,
        workerIds: workers.map((w) => w.workerId),
        startTime: now,
        estimatedCompletion,
        isRushed: rushOrder,
        rushCost: rushOrder ? rushCost : undefined,
        completedQuantity: 0,
        bonusYield: 0,
        createdAt: now,
      };

      slot.status = 'producing';
      await slot.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        slot,
        message: `Started production of ${quantity}x ${product.name}`,
        estimatedCompletion,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Collect completed production
   */
  static async collectProduction(
    slotId: string,
    characterId: string,
    autoSell: boolean = false
  ): Promise<CollectProductionResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get production slot
      const slot = await ProductionSlot.findOne({ slotId }).session(session);
      if (!slot) {
        throw new Error('Production slot not found');
      }

      // Verify ownership
      if (slot.characterId.toString() !== characterId) {
        throw new Error('You do not own this production slot');
      }

      // Check if ready
      if (!slot.isReady()) {
        throw new Error('Production is not ready yet');
      }

      if (!slot.currentOrder) {
        throw new Error('No production to collect');
      }

      // Get product definition
      const product = getProductById(slot.currentOrder.productId);
      if (!product) {
        throw new Error('Invalid product');
      }

      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Calculate production results
      const results = await this.calculateProductionResults(
        slot,
        product,
        character
      );

      let dollarsEarned = 0;
      const producedItems: Array<{
        itemId: string;
        quantity: number;
        quality: ProductQuality;
      }> = [];

      // Process each output
      for (const output of results.outputs) {
        if (output.itemId === 'gold_direct') {
          // Direct dollar production with territory bonus
          const bonusedAmount = Math.floor(output.quantity * results.territoryIncomeMultiplier);
          dollarsEarned += bonusedAmount;
        } else if (autoSell) {
          // Auto-sell items with territory bonus
          const sellValue = Math.floor(output.quantity * output.sellPrice * results.territoryIncomeMultiplier);
          dollarsEarned += sellValue;
        } else {
          // Add to inventory
          const existingItem = character.inventory.find(
            (i) => i.itemId === output.itemId
          );
          if (existingItem) {
            existingItem.quantity += output.quantity;
          } else {
            character.inventory.push({
              itemId: output.itemId,
              quantity: output.quantity,
              acquiredAt: new Date(),
            });
          }

          producedItems.push({
            itemId: output.itemId,
            quantity: output.quantity,
            quality: results.quality,
          });
        }
      }

      // Apply income cap to dollars earned
      // BALANCE FIX: Prevents exponential wealth accumulation from properties
      // PHASE 4 FIX: Pass session for atomic cap enforcement
      const cappedDollarsEarned = await this.applyIncomeCap(character, dollarsEarned, session);

      // Award dollars (capped)
      if (cappedDollarsEarned > 0) {
        await character.addDollars(cappedDollarsEarned, TransactionSource.PRODUCTION_COLLECT, {
          productId: product.productId,
          quantity: slot.currentOrder.quantity,
          originalAmount: dollarsEarned,
          cappedAmount: cappedDollarsEarned,
          wasCapped: cappedDollarsEarned < dollarsEarned,
          currencyType: 'DOLLAR',
        });
      }

      // Update dollarsEarned for return value
      dollarsEarned = cappedDollarsEarned;

      // Award experience
      const experienceGained = Math.ceil(product.requiredLevel * 10);
      await character.addExperience(experienceGained);

      // Update workers
      const workers = await PropertyWorker.find({
        workerId: { $in: slot.currentOrder.workerIds },
      }).session(session);

      for (const worker of workers) {
        worker.isAssigned = false;
        worker.assignedSlotId = undefined;
        worker.currentOrderId = undefined;
        worker.addExperience(20); // Workers gain XP
        worker.updateMorale(3); // Successful production boosts morale
        await worker.save({ session });
      }

      await character.save({ session });

      // Clear slot
      slot.currentOrder = undefined;
      slot.status = 'idle';
      await slot.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        products: producedItems,
        goldEarned: dollarsEarned,
        experienceGained,
        message: autoSell
          ? `Sold production for ${dollarsEarned} dollars`
          : `Collected ${producedItems.length} items`,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancel production order
   */
  static async cancelProduction(
    slotId: string,
    characterId: string
  ): Promise<{ success: boolean; message: string; refund: number }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const slot = await ProductionSlot.findOne({ slotId }).session(session);
      if (!slot) {
        throw new Error('Production slot not found');
      }

      if (slot.characterId.toString() !== characterId) {
        throw new Error('You do not own this production slot');
      }

      if (!slot.currentOrder) {
        throw new Error('No active production to cancel');
      }

      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Calculate refund (50% of dollar cost)
      const product = getProductById(slot.currentOrder.productId);
      if (!product) {
        throw new Error('Invalid product');
      }

      const refund = Math.floor(
        (product.goldCost * slot.currentOrder.quantity) * 0.5
      );

      // Refund dollars
      if (refund > 0) {
        await character.addDollars(refund, TransactionSource.PRODUCTION_CANCEL, {
          productId: slot.currentOrder.productId,
          currencyType: 'DOLLAR',
        });
      }

      // Return materials (if not consumed yet - based on progress)
      const progress = slot.getProgress();
      if (progress < 50) {
        // Return all materials if less than 50% done
        for (const material of slot.currentOrder.materialsUsed) {
          const existingItem = character.inventory.find((i) => i.itemId === material.itemId);
          if (existingItem) {
            existingItem.quantity += material.quantity;
          } else {
            character.inventory.push({
              itemId: material.itemId,
              quantity: material.quantity,
              acquiredAt: new Date(),
            });
          }
        }
      }

      // Unassign workers
      const workers = await PropertyWorker.find({
        workerId: { $in: slot.currentOrder.workerIds },
      }).session(session);

      for (const worker of workers) {
        worker.isAssigned = false;
        worker.assignedSlotId = undefined;
        worker.currentOrderId = undefined;
        worker.updateMorale(-5); // Cancellation hurts morale
        await worker.save({ session });
      }

      await character.save({ session });

      // Clear slot
      slot.currentOrder = undefined;
      slot.status = 'idle';
      await slot.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        message: 'Production cancelled',
        refund,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Calculate production results with quality and bonuses
   */
  private static async calculateProductionResults(
    slot: IProductionSlot,
    product: ProductDefinition,
    character: ICharacter
  ): Promise<{
    quality: ProductQuality;
    outputs: Array<{ itemId: string; quantity: number; sellPrice: number }>;
    territoryIncomeMultiplier: number;
  }> {
    // Determine quality
    let qualityRoll = SecureRNG.float(0, 1);

    // Apply slot quality bonus
    qualityRoll += slot.qualityBonus;

    // Apply character skill bonus
    const craftSkill = character.getSkillLevel('crafting');
    qualityRoll += craftSkill / 200; // Up to +0.5

    // Determine final quality
    let quality = ProductQuality.STANDARD;
    if (qualityRoll > 0.95) {
      quality = ProductQuality.MASTERWORK;
    } else if (qualityRoll > 0.8) {
      quality = ProductQuality.EXCELLENT;
    } else if (qualityRoll > 0.6) {
      quality = ProductQuality.GOOD;
    } else if (qualityRoll < 0.2) {
      quality = ProductQuality.POOR;
    }

    // Calculate output quantities
    const outputs: Array<{ itemId: string; quantity: number; sellPrice: number }> = [];

    for (const output of product.outputs) {
      let quantity = output.baseQuantity * (slot.currentOrder?.quantity || 1);

      // Apply quality modifier
      if (output.qualityAffectsQuantity) {
        switch (quality) {
          case ProductQuality.MASTERWORK:
            quantity = Math.ceil(quantity * 1.5);
            break;
          case ProductQuality.EXCELLENT:
            quantity = Math.ceil(quantity * 1.3);
            break;
          case ProductQuality.GOOD:
            quantity = Math.ceil(quantity * 1.15);
            break;
          case ProductQuality.POOR:
            quantity = Math.ceil(quantity * 0.8);
            break;
        }
      }

      // Apply yield bonus from slot
      quantity = slot.applyBonuses(quantity, 'yield');

      // Ensure within min/max
      quantity = Math.max(
        output.minQuantity,
        Math.min(output.maxQuantity * (slot.currentOrder?.quantity || 1), quantity)
      );

      outputs.push({
        itemId: output.itemId,
        quantity,
        sellPrice: output.sellPrice,
      });
    }

    // Get territory income bonus for property
    let territoryIncomeMultiplier = 1.0;
    try {
      const property = await Property.findOne({ propertyId: slot.propertyId });
      if (property && property.locationId && character.gangId) {
        const propertyBonuses = await TerritoryBonusService.getPropertyBonuses(
          property.locationId,
          character.gangId
        );
        territoryIncomeMultiplier = propertyBonuses.bonuses.income;
      }
    } catch (error) {
      logger.debug('Territory bonus lookup failed for production income', { error });
    }

    return { quality, outputs, territoryIncomeMultiplier };
  }

  /**
   * Check and update production statuses (called by cron job)
   */
  static async updateProductionStatuses(): Promise<number> {
    try {
      const now = new Date();

      // Find all producing slots where completion time has passed
      const completedSlots = await ProductionSlot.find({
        status: 'producing',
        'currentOrder.estimatedCompletion': { $lte: now },
      });

      for (const slot of completedSlots) {
        slot.status = 'ready';
        await slot.save();
      }

      return completedSlots.length;
    } catch (error) {
      logger.error('Error updating production statuses', { error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
      throw error;
    }
  }

  /**
   * Get production slot details
   */
  static async getSlotDetails(slotId: string): Promise<IProductionSlot | null> {
    return ProductionSlot.findOne({ slotId });
  }

  /**
   * Get all slots for a property
   */
  static async getPropertySlots(propertyId: string): Promise<IProductionSlot[]> {
    return ProductionSlot.findByProperty(propertyId);
  }

  /**
   * Get all active productions for a character
   */
  static async getActiveProductions(characterId: string): Promise<IProductionSlot[]> {
    return ProductionSlot.getActiveProductions(characterId);
  }

  /**
   * Get all completed productions for a character
   */
  static async getCompletedProductions(characterId: string): Promise<IProductionSlot[]> {
    return ProductionSlot.getCompletedProductions(characterId);
  }
}
