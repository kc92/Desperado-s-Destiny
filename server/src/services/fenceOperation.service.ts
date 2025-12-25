/**
 * Fence Operation Service
 *
 * Phase 13: Deep Mining System
 *
 * Handles black market fence operations, trust system,
 * sting risk calculations, and illegal ore sales.
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { FenceTransaction } from '../models/FenceTransaction.model';
import { DollarService, TransactionSource } from './dollar.service';
import { InventoryService } from './inventory.service';
import logger from '../utils/logger';
import {
  FenceLocationId,
  FenceTrustLevel,
  FenceSpecialization,
  IFenceTransaction,
  IFenceTrust,
  IFenceListingResponse,
} from '@desperados/shared';
import {
  FENCE_LOCATIONS,
  FENCE_TRUST_THRESHOLDS,
  getTrustLevel,
} from '@desperados/shared';

/**
 * Character fence trust subdocument (stored in character)
 */
interface ICharacterFenceTrust {
  fenceLocationId: FenceLocationId;
  trustLevel: number;
  totalTransactions: number;
  totalValueTraded: number;
  lastTransactionAt?: Date;
  stingOperationsTriggered: number;
}

/**
 * Result of selling to fence
 */
interface FenceSaleResult {
  success: boolean;
  goldReceived?: number;
  fenceRate?: number;
  trustGained?: number;
  newTrustLevel?: number;
  wasStingOperation?: boolean;
  error?: string;
}

/**
 * Item to sell to fence
 */
interface FenceItem {
  itemId: string;
  itemName: string;
  quantity: number;
  marketValue: number;
  isContraband: boolean;
}

export class FenceOperationService {
  /**
   * Get all fence locations with character's trust levels
   */
  static async getFenceListings(characterId: string): Promise<IFenceListingResponse> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      const fences: IFenceListingResponse['fences'] = [];

      for (const [locationId, location] of Object.entries(FENCE_LOCATIONS)) {
        // Get character's trust with this fence
        const trust = this.getCharacterTrust(character, locationId as FenceLocationId);

        // Calculate current capacity (resets daily)
        const usedToday = await this.getUsedCapacityToday(characterId, locationId as FenceLocationId);
        const currentCapacity = location.maxCapacityPerDay - usedToday;

        // Estimate rate based on trust
        const estimatedRate = this.calculateFenceRate(location, trust?.trustLevel || 0);

        fences.push({
          location: location as any,
          characterTrust: trust as any,
          currentCapacity,
          estimatedRateForItems: estimatedRate,
        });
      }

      return { fences };
    } catch (error) {
      logger.error('[FenceOperationService] getFenceListings error:', error);
      return { fences: [] };
    }
  }

  /**
   * Sell items to a fence
   */
  static async sellToFence(
    characterId: string,
    fenceLocationId: FenceLocationId,
    items: FenceItem[]
  ): Promise<FenceSaleResult> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      const fenceLocation = FENCE_LOCATIONS[fenceLocationId];
      if (!fenceLocation) {
        return { success: false, error: 'Invalid fence location' };
      }

      // Check if fence accepts contraband
      const hasContraband = items.some((item) => item.isContraband);
      if (hasContraband && !fenceLocation.acceptsContraband) {
        return { success: false, error: 'This fence does not accept contraband' };
      }

      // Check capacity
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const usedToday = await this.getUsedCapacityToday(characterId, fenceLocationId);
      if (usedToday + totalItems > fenceLocation.maxCapacityPerDay) {
        return { success: false, error: 'Fence capacity exceeded for today' };
      }

      // Get trust level
      const trust = this.getCharacterTrust(character, fenceLocationId);
      const trustLevel = trust?.trustLevel || 0;

      // Check for sting operation
      const stingRisk = this.calculateStingRisk(fenceLocation, trustLevel);
      const wasStingOperation = Math.random() * 100 < stingRisk;

      // Calculate sale value first (needed for transaction logging)
      const fenceRate = this.calculateFenceRate(fenceLocation, trustLevel);
      const totalMarketValue = items.reduce((sum, item) => sum + item.marketValue * item.quantity, 0);
      const goldReceived = Math.floor(totalMarketValue * (fenceRate / 100));

      // Start a MongoDB session for atomic operations
      const session = await mongoose.startSession();
      await session.startTransaction();

      try {
        // First, remove items from inventory (must happen before sting check)
        // This ensures items are "handed over" before we know if it's a sting
        for (const item of items) {
          const removed = await InventoryService.removeItems(
            characterId,
            item.itemId,
            item.quantity,
            session
          );
          if (!removed) {
            await session.abortTransaction();
            session.endSession();
            return {
              success: false,
              error: `Insufficient quantity of ${item.itemName} in inventory`,
            };
          }
        }

        if (wasStingOperation) {
          // Sting operation! Items already removed (confiscated), record the failed transaction
          await this.recordStingOperation(character, fenceLocationId);

          // Record the failed transaction for audit trail
          await this.recordTransaction(
            character,
            fenceLocationId,
            items,
            totalMarketValue,
            0, // No money received
            fenceRate,
            trustLevel,
            Math.max(0, trustLevel - 20), // Trust loss
            false, // Not successful
            true, // Was sting operation
            session
          );

          await session.commitTransaction();
          session.endSession();

          logger.warn(
            `[FenceOperationService] Sting operation! Character ${characterId} lost items at ${fenceLocationId}`
          );

          return {
            success: false,
            wasStingOperation: true,
            error: 'You were caught in a sting operation! Items confiscated.',
          };
        }

        // Successful sale - add dollars to character
        await DollarService.addDollars(
          characterId,
          goldReceived,
          TransactionSource.FENCE_SALE,
          {
            fenceLocationId,
            itemCount: items.length,
            totalMarketValue,
            fenceRate,
          },
          session
        );

        // Update trust
        const trustGained = this.calculateTrustGain(totalMarketValue);
        const newTrustLevel = Math.min(100, trustLevel + trustGained);
        await this.updateTrust(character, fenceLocationId, newTrustLevel, totalMarketValue);

        // Record successful transaction
        await this.recordTransaction(
          character,
          fenceLocationId,
          items,
          totalMarketValue,
          goldReceived,
          fenceRate,
          trustLevel,
          newTrustLevel,
          true, // Successful
          false, // Not a sting
          session
        );

        await session.commitTransaction();
        session.endSession();

        logger.info(
          `[FenceOperationService] Successful sale: Character ${characterId} sold ${items.length} items for $${goldReceived} at ${fenceLocationId}`
        );

        return {
          success: true,
          goldReceived,
          fenceRate,
          trustGained,
          newTrustLevel,
          wasStingOperation: false,
        };
      } catch (innerError) {
        await session.abortTransaction();
        session.endSession();
        throw innerError;
      }
    } catch (error) {
      logger.error('[FenceOperationService] sellToFence error:', error);
      return { success: false, error: 'Sale failed' };
    }
  }

  /**
   * Get fence price quote for items
   */
  static async getFenceQuote(
    characterId: string,
    fenceLocationId: FenceLocationId,
    items: FenceItem[]
  ): Promise<{ totalMarketValue: number; estimatedPayout: number; fenceRate: number; stingRisk: number }> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      const fenceLocation = FENCE_LOCATIONS[fenceLocationId];
      if (!fenceLocation) {
        throw new Error('Invalid fence location');
      }

      const trust = this.getCharacterTrust(character, fenceLocationId);
      const trustLevel = trust?.trustLevel || 0;

      const fenceRate = this.calculateFenceRate(fenceLocation, trustLevel);
      const totalMarketValue = items.reduce((sum, item) => sum + item.marketValue * item.quantity, 0);
      const estimatedPayout = Math.floor(totalMarketValue * (fenceRate / 100));
      const stingRisk = this.calculateStingRisk(fenceLocation, trustLevel);

      return { totalMarketValue, estimatedPayout, fenceRate, stingRisk };
    } catch (error) {
      logger.error('[FenceOperationService] getFenceQuote error:', error);
      return { totalMarketValue: 0, estimatedPayout: 0, fenceRate: 0, stingRisk: 0 };
    }
  }

  /**
   * Calculate fence rate based on trust and specialization
   */
  private static calculateFenceRate(fenceLocation: typeof FENCE_LOCATIONS[FenceLocationId], trustLevel: number): number {
    const trustLevelEnum = getTrustLevel(trustLevel);

    // Base rate + trust bonus
    let rate = fenceLocation.baseRatePercent;

    switch (trustLevelEnum) {
      case FenceTrustLevel.PARTNER:
        rate += fenceLocation.trustBonus * 4;
        break;
      case FenceTrustLevel.TRUSTED:
        rate += fenceLocation.trustBonus * 3;
        break;
      case FenceTrustLevel.ASSOCIATE:
        rate += fenceLocation.trustBonus * 2;
        break;
      case FenceTrustLevel.ACQUAINTANCE:
        rate += fenceLocation.trustBonus;
        break;
      case FenceTrustLevel.STRANGER:
      default:
        // No bonus
        break;
    }

    return Math.min(95, rate); // Cap at 95%
  }

  /**
   * Calculate sting operation risk
   */
  private static calculateStingRisk(fenceLocation: typeof FENCE_LOCATIONS[FenceLocationId], trustLevel: number): number {
    const trustLevelEnum = getTrustLevel(trustLevel);

    switch (trustLevelEnum) {
      case FenceTrustLevel.PARTNER:
        return 0; // No risk
      case FenceTrustLevel.TRUSTED:
        return fenceLocation.stingRiskAtLowTrust * 0.1; // 10% of base
      case FenceTrustLevel.ASSOCIATE:
        return fenceLocation.stingRiskAtLowTrust * 0.25; // 25% of base
      case FenceTrustLevel.ACQUAINTANCE:
        return fenceLocation.stingRiskAtLowTrust * 0.5; // 50% of base
      case FenceTrustLevel.STRANGER:
      default:
        return fenceLocation.stingRiskAtLowTrust; // Full risk
    }
  }

  /**
   * Calculate trust gain from transaction
   */
  private static calculateTrustGain(marketValue: number): number {
    // Base trust gain from transaction value
    // $100 = 1 trust, $1000 = 3 trust, $10000 = 5 trust
    if (marketValue >= 10000) return 5;
    if (marketValue >= 5000) return 4;
    if (marketValue >= 1000) return 3;
    if (marketValue >= 500) return 2;
    if (marketValue >= 100) return 1;
    return 0;
  }

  /**
   * Get character's trust with a fence
   */
  private static getCharacterTrust(character: any, fenceLocationId: FenceLocationId): ICharacterFenceTrust | null {
    // Trust is stored in character subdocument
    if (!character.fenceTrust) return null;

    return character.fenceTrust.find(
      (t: ICharacterFenceTrust) => t.fenceLocationId === fenceLocationId
    );
  }

  /**
   * Update character's trust with a fence
   */
  private static async updateTrust(
    character: any,
    fenceLocationId: FenceLocationId,
    newTrustLevel: number,
    valueTraded: number
  ): Promise<void> {
    if (!character.fenceTrust) {
      character.fenceTrust = [];
    }

    const existingTrust = character.fenceTrust.find(
      (t: ICharacterFenceTrust) => t.fenceLocationId === fenceLocationId
    );

    if (existingTrust) {
      existingTrust.trustLevel = newTrustLevel;
      existingTrust.totalTransactions++;
      existingTrust.totalValueTraded += valueTraded;
      existingTrust.lastTransactionAt = new Date();
    } else {
      character.fenceTrust.push({
        fenceLocationId,
        trustLevel: newTrustLevel,
        totalTransactions: 1,
        totalValueTraded: valueTraded,
        lastTransactionAt: new Date(),
        stingOperationsTriggered: 0,
      });
    }

    await character.save();
  }

  /**
   * Record sting operation
   */
  private static async recordStingOperation(character: any, fenceLocationId: FenceLocationId): Promise<void> {
    if (!character.fenceTrust) {
      character.fenceTrust = [];
    }

    const existingTrust = character.fenceTrust.find(
      (t: ICharacterFenceTrust) => t.fenceLocationId === fenceLocationId
    );

    if (existingTrust) {
      existingTrust.stingOperationsTriggered++;
      existingTrust.trustLevel = Math.max(0, existingTrust.trustLevel - 20); // Lose trust
    } else {
      character.fenceTrust.push({
        fenceLocationId,
        trustLevel: 0,
        totalTransactions: 0,
        totalValueTraded: 0,
        stingOperationsTriggered: 1,
      });
    }

    // TODO: Add wanted level, jail time, etc.

    await character.save();
  }

  /**
   * Record transaction to FenceTransaction model
   */
  private static async recordTransaction(
    character: any,
    fenceLocationId: FenceLocationId,
    items: FenceItem[],
    totalMarketValue: number,
    salePrice: number,
    fenceRate: number,
    trustBefore: number,
    trustAfter: number,
    wasSuccessful: boolean,
    wasStingOperation: boolean,
    session?: mongoose.ClientSession
  ): Promise<void> {
    const transactionData = {
      characterId: character._id,
      fenceLocationId,
      items: items.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        marketValue: item.marketValue,
      })),
      totalMarketValue,
      salePrice,
      fenceRate,
      wasSuccessful,
      wasStingOperation,
      trustBefore,
      trustAfter,
      timestamp: new Date(),
    };

    if (session) {
      await FenceTransaction.create([transactionData], { session });
    } else {
      await FenceTransaction.create(transactionData);
    }

    logger.debug('[FenceOperationService] Transaction recorded:', {
      characterId: character._id.toString(),
      fenceLocationId,
      itemCount: items.length,
      totalMarketValue,
      salePrice,
      wasSuccessful,
      wasStingOperation,
    });
  }

  /**
   * Get used capacity today for a fence
   * Queries FenceTransaction model for today's successful transactions
   */
  private static async getUsedCapacityToday(
    characterId: string,
    fenceLocationId: FenceLocationId
  ): Promise<number> {
    return FenceTransaction.getUsedCapacityToday(characterId, fenceLocationId);
  }

  /**
   * Get fence by specialization
   */
  static getFenceBySpecialization(specialization: FenceSpecialization): typeof FENCE_LOCATIONS[FenceLocationId] | null {
    for (const location of Object.values(FENCE_LOCATIONS)) {
      if (location.specialization === specialization) {
        return location;
      }
    }
    return null;
  }

  /**
   * Get best fence for a specific item type
   */
  static getBestFenceForItem(
    itemType: 'ore' | 'gems' | 'exotic' | 'general',
    characterTrustLevels: Map<FenceLocationId, number>
  ): { fenceId: FenceLocationId; estimatedRate: number } | null {
    let bestFence: { fenceId: FenceLocationId; estimatedRate: number } | null = null;

    for (const [fenceId, location] of Object.entries(FENCE_LOCATIONS)) {
      // Check specialization match
      const specializationMatch =
        location.specialization === FenceSpecialization.GENERAL ||
        (itemType === 'ore' && location.specialization === FenceSpecialization.ORE) ||
        (itemType === 'gems' && location.specialization === FenceSpecialization.GEMS) ||
        (itemType === 'exotic' && location.specialization === FenceSpecialization.EXOTIC);

      if (specializationMatch) {
        const trustLevel = characterTrustLevels.get(fenceId as FenceLocationId) || 0;
        const rate = this.calculateFenceRate(location, trustLevel);

        if (!bestFence || rate > bestFence.estimatedRate) {
          bestFence = { fenceId: fenceId as FenceLocationId, estimatedRate: rate };
        }
      }
    }

    return bestFence;
  }
}
