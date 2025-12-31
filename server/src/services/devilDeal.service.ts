/**
 * Devil Deal Service
 *
 * Handles purchases and management of deals with The Outlaw King.
 * Players can trade gold and sin for protection from permadeath.
 *
 * "The Outlaw King always collects. One way or another."
 */

import mongoose from 'mongoose';
import { DevilDeal, IDevilDeal } from '../models/DevilDeal.model';
import { Character, ICharacter } from '../models/Character.model';
import { CharacterKarma } from '../models/CharacterKarma.model';
import karmaService from './karma.service';
import { DollarService } from './dollar.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import logger from '../utils/logger';
import {
  DevilDealType,
  DEVIL_DEALS,
  DevilDealDefinition,
  ActiveDevilDeal
} from '@desperados/shared';

/**
 * Locations where devil deals can be made
 */
export const DEVIL_DEAL_LOCATIONS = [
  'mission-chapel',      // Abandoned mission chapel
  'outlaws-shrine',      // Hidden shrine in the wilderness
  'crossroads',          // Midnight crossroads
  'ghost-town-church',   // Haunted church in ghost towns
  'hangmans-tree'        // Where outlaws meet their end
];

/**
 * Result of attempting to purchase a devil deal
 */
export interface DevilDealPurchaseResult {
  success: boolean;
  deal?: IDevilDeal;
  message: string;
  goldSpent: number;
  sinGained: number;
}

export class DevilDealService {
  /**
   * Check if player can purchase a devil deal at current location
   */
  static canMakeDeal(locationId: string): boolean {
    return DEVIL_DEAL_LOCATIONS.includes(locationId);
  }

  /**
   * Get available deals for a character (ones they don't already have active)
   */
  static async getAvailableDeals(characterId: string): Promise<DevilDealDefinition[]> {
    const activeDeals = await DevilDeal.getActiveDeals(characterId);
    const activeDealTypes = new Set(activeDeals.map(d => d.dealType));

    // Filter out deals they already have active
    return Object.values(DEVIL_DEALS).filter(deal => {
      // Single-use deals can only be purchased if not already active
      if (deal.singleUse && activeDealTypes.has(deal.type)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get cost for Ultimate Wager (all gold)
   */
  static async getUltimateWagerCost(characterId: string): Promise<number> {
    const character = await Character.findById(characterId);
    if (!character) {
      return 0;
    }
    return character.dollars || character.gold || 0;
  }

  /**
   * Purchase a devil deal
   */
  static async purchaseDeal(
    characterId: string,
    dealType: DevilDealType,
    locationId: string,
    session?: mongoose.ClientSession
  ): Promise<DevilDealPurchaseResult> {
    // Validate location
    if (!this.canMakeDeal(locationId)) {
      return {
        success: false,
        message: 'The Outlaw King cannot hear you from this place.',
        goldSpent: 0,
        sinGained: 0
      };
    }

    // Get deal definition
    const dealDef = DEVIL_DEALS[dealType];
    if (!dealDef) {
      return {
        success: false,
        message: 'Unknown deal type.',
        goldSpent: 0,
        sinGained: 0
      };
    }

    // Get character
    const character = await Character.findById(characterId);
    if (!character) {
      return {
        success: false,
        message: 'Character not found.',
        goldSpent: 0,
        sinGained: 0
      };
    }

    // Check for existing deal
    if (dealDef.singleUse) {
      const existingDeal = await DevilDeal.getDealOfType(characterId, dealType);
      if (existingDeal) {
        return {
          success: false,
          message: 'You already have this deal active.',
          goldSpent: 0,
          sinGained: 0
        };
      }
    }

    // Calculate gold cost (Ultimate Wager takes all gold)
    const goldCost = dealDef.goldCost === -1
      ? (character.dollars || character.gold || 0)
      : dealDef.goldCost;

    // Check if player can afford
    const characterBalance = character.dollars ?? character.gold ?? 0;
    if (characterBalance < goldCost) {
      return {
        success: false,
        message: `Not enough gold. The Outlaw King requires ${goldCost} dollars.`,
        goldSpent: 0,
        sinGained: 0
      };
    }

    // Start transaction if not provided
    const useSession = session || await mongoose.startSession();
    const isOwnSession = !session;

    try {
      if (isOwnSession) {
        await useSession.startTransaction();
      }

      // Deduct gold
      await DollarService.deductDollars(
        characterId,
        goldCost,
        TransactionSource.DEVIL_DEAL,
        {
          dealType,
          description: `Purchased devil deal: ${dealDef.name}`
        },
        useSession
      );

      // Add sin via karma system
      const karma = await karmaService.getOrCreateKarma(characterId, useSession);
      karma.karma.chaos = Math.min(100, karma.karma.chaos + dealDef.sinCost * 0.5);
      karma.karma.deception = Math.min(100, karma.karma.deception + dealDef.sinCost * 0.3);
      karma.karma.greed = Math.min(100, karma.karma.greed + dealDef.sinCost * 0.2);
      karma.outlawKingAffinity = Math.min(100, karma.outlawKingAffinity + dealDef.sinCost);
      await karma.save({ session: useSession });

      // Calculate expiration
      let expiresAt: Date | undefined;
      if (dealDef.duration === '7_days') {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }

      // Create deal record
      const deal = new DevilDeal({
        characterId,
        dealType,
        goldPaid: goldCost,
        sinCost: dealDef.sinCost,
        purchaseLocation: locationId,
        expiresAt
      });
      await deal.save({ session: useSession });

      // Also store on character for quick lookup
      await this.syncDealsToCharacter(characterId, useSession);

      if (isOwnSession) {
        await useSession.commitTransaction();
      }

      logger.info(
        `Devil deal purchased: ${character.name} bought ${dealDef.name} ` +
        `for ${goldCost} gold and ${dealDef.sinCost} sin`
      );

      return {
        success: true,
        deal,
        message: this.getDealPurchaseMessage(dealType),
        goldSpent: goldCost,
        sinGained: dealDef.sinCost
      };
    } catch (error) {
      if (isOwnSession) {
        await useSession.abortTransaction();
      }
      logger.error('Error purchasing devil deal:', error);
      throw error;
    } finally {
      if (isOwnSession) {
        useSession.endSession();
      }
    }
  }

  /**
   * Get dramatic message for deal purchase
   */
  private static getDealPurchaseMessage(dealType: DevilDealType): string {
    const messages: Record<DevilDealType, string> = {
      [DevilDealType.BORROWED_TIME]:
        'Time bends to your will... for now. "When I call, you answer," whispers the darkness.',
      [DevilDealType.DEATHS_DELAY]:
        'The reaper nods and turns away. For seven days, death walks a longer path to find you.',
      [DevilDealType.SOUL_FRAGMENT]:
        'A piece of your soul tears free, glowing red in the darkness. "This binds us," laughs the King.',
      [DevilDealType.ULTIMATE_WAGER]:
        'Everything you have, gambled on everything you want. The Outlaw King grins. "Now THAT\'s an outlaw."'
    };
    return messages[dealType];
  }

  /**
   * Sync active deals to character document for quick access
   */
  static async syncDealsToCharacter(
    characterId: string,
    session?: mongoose.ClientSession
  ): Promise<void> {
    const activeDeals = await DevilDeal.getActiveDeals(characterId);

    const dealsForCharacter: ActiveDevilDeal[] = activeDeals.map(deal => ({
      type: deal.dealType,
      purchasedAt: deal.purchasedAt,
      expiresAt: deal.expiresAt,
      consumed: deal.consumed,
      consumedAt: deal.consumedAt
    }));

    await Character.findByIdAndUpdate(
      characterId,
      { devilDeals: dealsForCharacter },
      session ? { session } : {}
    );
  }

  /**
   * Consume a deal (called when deal protects from death)
   */
  static async consumeDeal(
    characterId: string,
    dealType: DevilDealType,
    reason: string,
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    const deal = await DevilDeal.getDealOfType(characterId, dealType);
    if (!deal) {
      return false;
    }

    deal.consumed = true;
    deal.consumedAt = new Date();
    deal.consumedReason = reason;
    await deal.save(session ? { session } : {});

    // Sync to character
    await this.syncDealsToCharacter(characterId, session);

    logger.info(
      `Devil deal ${dealType} consumed for character ${characterId}: ${reason}`
    );

    return true;
  }

  /**
   * Get all active deals for a character
   */
  static async getActiveDeals(characterId: string): Promise<IDevilDeal[]> {
    return DevilDeal.getActiveDeals(characterId);
  }

  /**
   * Get deal history for a character
   */
  static async getDealHistory(characterId: string): Promise<IDevilDeal[]> {
    return DevilDeal.getCharacterDealHistory(characterId);
  }

  /**
   * Check if character has specific active deal
   */
  static async hasDeal(characterId: string, dealType: DevilDealType): Promise<boolean> {
    const deal = await DevilDeal.getDealOfType(characterId, dealType);
    return !!deal;
  }

  /**
   * Process expired deals (should be called periodically)
   */
  static async processExpiredDeals(): Promise<number> {
    const now = new Date();

    const expiredDeals = await DevilDeal.find({
      consumed: false,
      expiresAt: { $lt: now }
    });

    for (const deal of expiredDeals) {
      deal.consumed = true;
      deal.consumedAt = now;
      deal.consumedReason = 'Expired';
      await deal.save();

      // Sync to character
      await this.syncDealsToCharacter(deal.characterId.toString());
    }

    if (expiredDeals.length > 0) {
      logger.info(`Processed ${expiredDeals.length} expired devil deals`);
    }

    return expiredDeals.length;
  }

  /**
   * Link Ultimate Wager to a specific heist
   */
  static async linkToHeist(
    characterId: string,
    heistId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    const deal = await DevilDeal.getDealOfType(characterId, DevilDealType.ULTIMATE_WAGER);
    if (!deal) {
      return false;
    }

    deal.linkedHeistId = new mongoose.Types.ObjectId(heistId);
    await deal.save(session ? { session } : {});

    return true;
  }

  /**
   * Get death risk modifier from active deals
   */
  static async getDeathRiskModifier(characterId: string): Promise<number> {
    let modifier = 1.0;

    // Check for Death's Delay
    if (await this.hasDeal(characterId, DevilDealType.DEATHS_DELAY)) {
      modifier *= 0.5; // 50% reduced death risk
    }

    return modifier;
  }

  /**
   * Get stats about deals for UI
   */
  static async getDealStats(characterId: string): Promise<{
    activeDeals: number;
    totalDeals: number;
    totalGoldSpent: number;
    totalSinGained: number;
    dealsUsed: number;
  }> {
    const allDeals = await DevilDeal.getCharacterDealHistory(characterId);
    const activeDeals = allDeals.filter(d =>
      !d.consumed && (!d.expiresAt || d.expiresAt > new Date())
    );

    return {
      activeDeals: activeDeals.length,
      totalDeals: allDeals.length,
      totalGoldSpent: allDeals.reduce((sum, d) => sum + d.goldPaid, 0),
      totalSinGained: allDeals.reduce((sum, d) => sum + d.sinCost, 0),
      dealsUsed: allDeals.filter(d => d.consumed && d.consumedReason !== 'Expired').length
    };
  }
}

export default DevilDealService;
