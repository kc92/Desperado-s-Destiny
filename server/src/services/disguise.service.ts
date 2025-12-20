/**
 * Disguise Service
 * Handles disguise mechanics for reducing effective wanted level
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { DollarService } from './dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

export interface DisguiseType {
  id: string;
  name: string;
  description: string;
  faction: string | null; // Faction it disguises as
  wantedReduction: number; // How much it reduces wanted level
  durationMinutes: number;
  cost: number;
  requiredItems?: string[];
}

// Available disguise types
export const DISGUISE_TYPES: DisguiseType[] = [
  {
    id: 'settler_clothes',
    name: 'Settler Clothes',
    description: 'Plain work clothes that help you blend in with settlers.',
    faction: 'settler',
    wantedReduction: 2,
    durationMinutes: 30,
    cost: 50,
  },
  {
    id: 'nahi_garb',
    name: 'Nahi Garb',
    description: 'Traditional clothing that helps you pass as Nahi.',
    faction: 'nahi',
    wantedReduction: 2,
    durationMinutes: 30,
    cost: 50,
  },
  {
    id: 'frontera_outfit',
    name: 'Frontera Outfit',
    description: 'Flashy clothes favored by Frontera outlaws.',
    faction: 'frontera',
    wantedReduction: 2,
    durationMinutes: 30,
    cost: 50,
  },
  {
    id: 'deputy_badge',
    name: 'Fake Deputy Badge',
    description: 'A counterfeit badge that makes you look like law enforcement.',
    faction: null,
    wantedReduction: 3,
    durationMinutes: 20,
    cost: 100,
  },
  {
    id: 'merchant_disguise',
    name: 'Traveling Merchant',
    description: 'Clothes and props of a traveling salesman.',
    faction: null,
    wantedReduction: 2,
    durationMinutes: 45,
    cost: 75,
  },
  {
    id: 'priest_robes',
    name: 'Priest Robes',
    description: 'Holy vestments that inspire trust and avoid suspicion.',
    faction: null,
    wantedReduction: 3,
    durationMinutes: 25,
    cost: 125,
  },
];

export interface DisguiseResult {
  success: boolean;
  message: string;
  disguiseId?: string;
  expiresAt?: Date;
  faction?: string | null;
  goldSpent?: number;
}

export interface DetectionResult {
  detected: boolean;
  consequence?: string;
  wantedIncrease?: number;
}

export class DisguiseService {
  /**
   * Apply a disguise to a character
   */
  static async applyDisguise(
    characterId: string,
    disguiseId: string
  ): Promise<DisguiseResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);

      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, message: 'Character not found' };
      }

      // Find disguise type
      const disguise = DISGUISE_TYPES.find((d) => d.id === disguiseId);
      if (!disguise) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, message: 'Invalid disguise type' };
      }

      // Check if already disguised
      if (character.currentDisguise && character.disguiseExpiresAt) {
        const now = new Date();
        if (character.disguiseExpiresAt > now) {
          await session.abortTransaction();
          session.endSession();
          return {
            success: false,
            message: 'Already wearing a disguise. Remove it first.',
          };
        }
      }

      // Check if character has enough dollars
      if (character.dollars < disguise.cost) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `Insufficient dollars. Need $${disguise.cost}, have $${character.dollars}.`,
        };
      }

      // Check required items
      if (disguise.requiredItems && disguise.requiredItems.length > 0) {
        const hasItems = disguise.requiredItems.every((itemId) =>
          character.inventory.some((inv) => inv.itemId === itemId && inv.quantity > 0)
        );
        if (!hasItems) {
          await session.abortTransaction();
          session.endSession();
          return { success: false, message: 'Missing required items for disguise' };
        }
      }

      // Deduct dollars
      await DollarService.deductDollars(
        characterId,
        disguise.cost,
        TransactionSource.DISGUISE_PURCHASE,
        {
          disguiseId,
          disguiseName: disguise.name,
          currencyType: CurrencyType.DOLLAR,
        },
        session
      );

      // Apply disguise
      const expiresAt = new Date(Date.now() + disguise.durationMinutes * 60 * 1000);
      character.currentDisguise = disguiseId;
      character.disguiseExpiresAt = expiresAt;
      character.disguiseFaction = disguise.faction;

      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} applied disguise ${disguiseId}`);

      return {
        success: true,
        message: `You don the ${disguise.name}. Try not to act suspicious.`,
        disguiseId,
        expiresAt,
        faction: disguise.faction,
        goldSpent: disguise.cost,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error applying disguise:', error);
      throw error;
    }
  }

  /**
   * Remove current disguise
   */
  static async removeDisguise(characterId: string): Promise<DisguiseResult> {
    try {
      const character = await Character.findById(characterId);

      if (!character) {
        return { success: false, message: 'Character not found' };
      }

      if (!character.currentDisguise) {
        return { success: false, message: 'Not wearing a disguise' };
      }

      character.currentDisguise = null;
      character.disguiseExpiresAt = null;
      character.disguiseFaction = null;

      await character.save();

      logger.info(`Character ${characterId} removed disguise`);

      return {
        success: true,
        message: 'You remove your disguise and reveal your true self.',
      };
    } catch (error) {
      logger.error('Error removing disguise:', error);
      throw error;
    }
  }

  /**
   * Check if disguise is detected during an action
   */
  static async checkDetection(
    character: ICharacter,
    buildingDangerLevel: number
  ): Promise<DetectionResult> {
    // No disguise = no detection
    if (!character.currentDisguise || !character.disguiseExpiresAt) {
      return { detected: false };
    }

    // Check if disguise has expired
    const now = new Date();
    if (character.disguiseExpiresAt <= now) {
      // Auto-remove expired disguise
      character.currentDisguise = null;
      character.disguiseExpiresAt = null;
      character.disguiseFaction = null;
      await character.save();
      return { detected: false };
    }

    // Base detection chance: 5%
    // + danger level
    // + wanted level * 3
    const detectionChance = 5 + buildingDangerLevel + character.wantedLevel * 3;

    const detected = SecureRNG.chance(detectionChance / 100);

    if (detected) {
      // Remove disguise on detection
      character.currentDisguise = null;
      character.disguiseExpiresAt = null;
      character.disguiseFaction = null;

      // Increase wanted level for using disguise
      const wantedIncrease = 1;
      character.wantedLevel = Math.min(5, character.wantedLevel + wantedIncrease);

      await character.save();

      logger.info(`Character ${character._id} disguise detected`);

      return {
        detected: true,
        consequence: 'Your disguise has been seen through! Wanted level increased.',
        wantedIncrease,
      };
    }

    return { detected: false };
  }

  /**
   * Get available disguises for character
   */
  static getAvailableDisguises(characterDollars: number): DisguiseType[] {
    return DISGUISE_TYPES.map((disguise) => ({
      ...disguise,
      canAfford: characterDollars >= disguise.cost,
    })) as any;
  }

  /**
   * Get character's current disguise info
   */
  static getDisguiseStatus(character: ICharacter): {
    isDisguised: boolean;
    disguise?: DisguiseType;
    expiresAt?: Date;
    remainingMinutes?: number;
  } {
    if (!character.currentDisguise || !character.disguiseExpiresAt) {
      return { isDisguised: false };
    }

    const now = new Date();
    if (character.disguiseExpiresAt <= now) {
      return { isDisguised: false };
    }

    const disguise = DISGUISE_TYPES.find((d) => d.id === character.currentDisguise);
    const remainingMinutes = Math.ceil(
      (character.disguiseExpiresAt.getTime() - now.getTime()) / (60 * 1000)
    );

    return {
      isDisguised: true,
      disguise,
      expiresAt: character.disguiseExpiresAt,
      remainingMinutes,
    };
  }
}

export default DisguiseService;
