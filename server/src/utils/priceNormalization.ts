/**
 * Price Normalization Utility
 *
 * Calculates fair, balanced prices for items, services, and transactions.
 * Accounts for level, rarity, regional scarcity, and modifiers.
 */

import { ItemRarity, LevelTier, getLevelTier } from '../config/economy.config';
import { getRecommendedPrice } from '../data/balance/economyTables';

/**
 * Price modifiers that can be applied
 */
export interface PriceModifiers {
  // Faction affiliation (0.5 = 50% discount, 1.5 = 50% markup)
  factionDiscount?: number;

  // Regional scarcity (higher = more expensive)
  regionalScarcity?: number;

  // Market demand (higher = more expensive)
  marketDemand?: number;

  // Merchant reputation (0.8 = 20% discount for high rep)
  merchantReputation?: number;

  // Skill discount (crafting skill gives better prices)
  skillDiscount?: number;

  // Event modifier (holiday sales, etc.)
  eventModifier?: number;

  // Gang/alliance discount
  gangDiscount?: number;

  // Bulk purchase discount (for buying multiple items)
  bulkDiscount?: number;

  // Legacy player bonus (veteran players get small discount)
  legacyBonus?: number;
}

/**
 * Regional scarcity multipliers
 */
export const REGIONAL_SCARCITY = {
  // Urban areas - abundant goods
  'red-gulch': 1.0,
  'nuevo-esperanza': 0.95,
  'the-frontera': 1.05,

  // Frontier settlements - moderate scarcity
  'kaiowa-mesa': 1.15,
  'canyon-outpost': 1.2,
  'dusty-trails': 1.1,

  // Remote locations - high scarcity
  'ghost-town': 1.5,
  'cursed-canyon': 1.8,
  'perdition-gulch': 2.0,

  // Special locations
  'npc-territory': 1.3,
  'wilderness': 1.4
} as const;

/**
 * Faction discount rates
 */
export const FACTION_DISCOUNTS = {
  // Shopping in your own faction's territory
  sameFaction: 0.9, // 10% discount

  // Shopping in allied faction territory
  alliedFaction: 1.0, // No discount

  // Shopping in hostile faction territory
  hostileFaction: 1.2, // 20% markup

  // Neutral
  neutral: 1.05 // 5% markup
} as const;

export class PriceNormalizationUtility {
  /**
   * Calculate normalized price for an item
   */
  static calculateItemPrice(
    basePrice: number,
    characterLevel: number,
    modifiers: PriceModifiers = {}
  ): number {
    let price = basePrice;

    // Apply all modifiers
    if (modifiers.factionDiscount !== undefined) {
      price *= modifiers.factionDiscount;
    }

    if (modifiers.regionalScarcity !== undefined) {
      price *= modifiers.regionalScarcity;
    }

    if (modifiers.marketDemand !== undefined) {
      price *= modifiers.marketDemand;
    }

    if (modifiers.merchantReputation !== undefined) {
      price *= modifiers.merchantReputation;
    }

    if (modifiers.skillDiscount !== undefined) {
      price *= modifiers.skillDiscount;
    }

    if (modifiers.eventModifier !== undefined) {
      price *= modifiers.eventModifier;
    }

    if (modifiers.gangDiscount !== undefined) {
      price *= modifiers.gangDiscount;
    }

    if (modifiers.bulkDiscount !== undefined) {
      price *= modifiers.bulkDiscount;
    }

    if (modifiers.legacyBonus !== undefined) {
      price *= modifiers.legacyBonus;
    }

    // Round to nearest gold
    return Math.max(1, Math.round(price));
  }

  /**
   * Calculate price based on item type, rarity, and level
   */
  static calculateNormalizedPrice(
    itemType: 'weapons' | 'armor' | 'consumables' | 'mounts' | 'materials',
    rarity: ItemRarity,
    characterLevel: number,
    modifiers: PriceModifiers = {}
  ): number {
    const tier = getLevelTier(characterLevel);
    const basePrice = getRecommendedPrice(itemType, rarity, tier);

    return this.calculateItemPrice(basePrice, characterLevel, modifiers);
  }

  /**
   * Calculate faction-aware price
   */
  static calculateFactionPrice(
    basePrice: number,
    characterLevel: number,
    playerFaction: string,
    locationFaction: string,
    isAllied: boolean = false
  ): number {
    let factionModifier: number;

    if (playerFaction === locationFaction) {
      factionModifier = FACTION_DISCOUNTS.sameFaction;
    } else if (isAllied) {
      factionModifier = FACTION_DISCOUNTS.alliedFaction;
    } else {
      factionModifier = FACTION_DISCOUNTS.hostileFaction;
    }

    return this.calculateItemPrice(basePrice, characterLevel, {
      factionDiscount: factionModifier
    });
  }

  /**
   * Calculate regional price with scarcity
   */
  static calculateRegionalPrice(
    basePrice: number,
    characterLevel: number,
    locationId: string
  ): number {
    const scarcity = (REGIONAL_SCARCITY as any)[locationId] || 1.0;

    return this.calculateItemPrice(basePrice, characterLevel, {
      regionalScarcity: scarcity
    });
  }

  /**
   * Calculate merchant price with reputation bonus
   */
  static calculateMerchantPrice(
    basePrice: number,
    characterLevel: number,
    merchantReputation: number // 0-100
  ): number {
    // High reputation = better prices (up to 15% discount at 100 rep)
    const reputationMultiplier = 1.0 - (merchantReputation / 100) * 0.15;

    return this.calculateItemPrice(basePrice, characterLevel, {
      merchantReputation: reputationMultiplier
    });
  }

  /**
   * Calculate bulk discount
   */
  static calculateBulkPrice(
    basePrice: number,
    characterLevel: number,
    quantity: number
  ): { totalPrice: number; discount: number } {
    let bulkDiscount = 1.0;

    // Tiered bulk discounts
    if (quantity >= 100) {
      bulkDiscount = 0.80; // 20% off for 100+
    } else if (quantity >= 50) {
      bulkDiscount = 0.85; // 15% off for 50+
    } else if (quantity >= 25) {
      bulkDiscount = 0.90; // 10% off for 25+
    } else if (quantity >= 10) {
      bulkDiscount = 0.95; // 5% off for 10+
    }

    const unitPrice = this.calculateItemPrice(basePrice, characterLevel, {
      bulkDiscount
    });

    const totalPrice = unitPrice * quantity;
    const discount = (1 - bulkDiscount) * 100;

    return { totalPrice, discount };
  }

  /**
   * Calculate crafting material cost with skill discount
   */
  static calculateCraftingCost(
    basePrice: number,
    characterLevel: number,
    craftingSkillLevel: number // 0-50
  ): number {
    // Higher crafting skill = better material prices (up to 25% discount at level 50)
    const skillMultiplier = 1.0 - (craftingSkillLevel / 50) * 0.25;

    return this.calculateItemPrice(basePrice, characterLevel, {
      skillDiscount: skillMultiplier
    });
  }

  /**
   * Calculate sell price (what you get when selling items)
   */
  static calculateSellPrice(
    baseSellPrice: number,
    characterLevel: number,
    modifiers: PriceModifiers = {}
  ): number {
    // Sell prices are generally lower, apply modifiers
    let price = baseSellPrice;

    // Merchant reputation helps sell prices too (up to 10% bonus)
    if (modifiers.merchantReputation !== undefined) {
      const reputationBonus = 1.0 + (1.0 - modifiers.merchantReputation) * 0.1;
      price *= reputationBonus;
    }

    // Regional scarcity affects sell prices (inversely - high scarcity = better sell price)
    if (modifiers.regionalScarcity !== undefined) {
      price *= modifiers.regionalScarcity;
    }

    // Event modifiers can affect sell prices
    if (modifiers.eventModifier !== undefined) {
      price *= modifiers.eventModifier;
    }

    return Math.max(1, Math.round(price));
  }

  /**
   * Calculate service price (travel, training, etc.)
   */
  static calculateServicePrice(
    basePrice: number,
    characterLevel: number,
    serviceTier: LevelTier,
    modifiers: PriceModifiers = {}
  ): number {
    // Services scale with character level
    const levelScaling = this.getLevelScaling(characterLevel, serviceTier);
    const scaledPrice = basePrice * levelScaling;

    return this.calculateItemPrice(scaledPrice, characterLevel, modifiers);
  }

  /**
   * Get level scaling multiplier
   */
  private static getLevelScaling(characterLevel: number, serviceTier: LevelTier): number {
    const tier = getLevelTier(characterLevel);

    // If character is in same tier as service, no scaling
    if (tier === serviceTier) return 1.0;

    // If service is lower tier, discount
    const tierOrder = [LevelTier.NOVICE, LevelTier.JOURNEYMAN, LevelTier.VETERAN, LevelTier.EXPERT, LevelTier.MASTER];
    const charTierIndex = tierOrder.indexOf(tier);
    const serviceTierIndex = tierOrder.indexOf(serviceTier);

    const tierDifference = charTierIndex - serviceTierIndex;

    if (tierDifference > 0) {
      // Service is lower tier, reduce price by 15% per tier
      return Math.max(0.5, 1.0 - (tierDifference * 0.15));
    } else {
      // Service is higher tier, increase price by 20% per tier
      return 1.0 + (Math.abs(tierDifference) * 0.20);
    }
  }

  /**
   * Calculate travel cost with distance and regional modifiers
   */
  static calculateTravelCost(
    baseDistance: number,
    characterLevel: number,
    fromRegion: string,
    toRegion: string,
    travelMethod: 'foot' | 'horse' | 'stagecoach' | 'train' = 'foot'
  ): number {
    // Base cost per distance unit
    const costPerUnit = {
      foot: 5,
      horse: 10,
      stagecoach: 25,
      train: 50
    }[travelMethod];

    let baseCost = baseDistance * costPerUnit;

    // Premium methods cost more but are faster
    const methodMultiplier = {
      foot: 1.0,
      horse: 1.5,
      stagecoach: 2.0,
      train: 3.0
    }[travelMethod];

    baseCost *= methodMultiplier;

    // Regional scarcity affects travel costs
    const fromScarcity = (REGIONAL_SCARCITY as any)[fromRegion] || 1.0;
    const toScarcity = (REGIONAL_SCARCITY as any)[toRegion] || 1.0;
    const avgScarcity = (fromScarcity + toScarcity) / 2;

    return this.calculateItemPrice(baseCost, characterLevel, {
      regionalScarcity: avgScarcity
    });
  }

  /**
   * Calculate property price with regional and tier modifiers
   */
  static calculatePropertyPrice(
    basePrice: number,
    propertyTier: LevelTier,
    locationId: string,
    modifiers: PriceModifiers = {}
  ): number {
    const regionalScarcity = (REGIONAL_SCARCITY as any)[locationId] || 1.0;

    // Properties in scarce regions cost more
    const locationMultiplier = 1.0 + (regionalScarcity - 1.0) * 2;

    const finalModifiers: PriceModifiers = {
      ...modifiers,
      regionalScarcity: locationMultiplier
    };

    // Use property tier to determine character level for scaling
    const tierLevelMap = {
      [LevelTier.NOVICE]: 5,
      [LevelTier.JOURNEYMAN]: 15,
      [LevelTier.VETERAN]: 25,
      [LevelTier.EXPERT]: 35,
      [LevelTier.MASTER]: 45
    };

    const estimatedLevel = tierLevelMap[propertyTier];

    return this.calculateItemPrice(basePrice, estimatedLevel, finalModifiers);
  }

  /**
   * Calculate gang-related prices (creation, upgrades, etc.)
   */
  static calculateGangPrice(
    basePrice: number,
    gangLevel: number,
    modifiers: PriceModifiers = {}
  ): number {
    // Gang prices scale with gang level
    const levelMultiplier = 1.0 + (gangLevel * 0.1);
    const scaledPrice = basePrice * levelMultiplier;

    return this.calculateItemPrice(scaledPrice, gangLevel * 5, modifiers);
  }

  /**
   * Calculate dynamic market price based on supply and demand
   */
  static calculateMarketPrice(
    basePrice: number,
    characterLevel: number,
    supply: number,
    demand: number
  ): number {
    // Supply and demand affect price
    // High demand, low supply = high price
    // Low demand, high supply = low price

    let marketMultiplier = 1.0;

    if (supply > 0) {
      const ratio = demand / supply;

      if (ratio > 2.0) {
        marketMultiplier = 1.5; // High demand, very high price
      } else if (ratio > 1.5) {
        marketMultiplier = 1.3;
      } else if (ratio > 1.0) {
        marketMultiplier = 1.1;
      } else if (ratio < 0.5) {
        marketMultiplier = 0.7; // Low demand, very low price
      } else if (ratio < 0.75) {
        marketMultiplier = 0.85;
      } else if (ratio < 1.0) {
        marketMultiplier = 0.95;
      }
    }

    return this.calculateItemPrice(basePrice, characterLevel, {
      marketDemand: marketMultiplier
    });
  }

  /**
   * Get comprehensive price breakdown (for debugging/transparency)
   */
  static getPriceBreakdown(
    basePrice: number,
    characterLevel: number,
    modifiers: PriceModifiers = {}
  ): {
    basePrice: number;
    modifiers: Array<{ name: string; multiplier: number; newPrice: number }>;
    finalPrice: number;
  } {
    let currentPrice = basePrice;
    const modifierSteps: Array<{ name: string; multiplier: number; newPrice: number }> = [];

    const applyModifier = (name: string, multiplier: number | undefined) => {
      if (multiplier !== undefined && multiplier !== 1.0) {
        currentPrice *= multiplier;
        modifierSteps.push({
          name,
          multiplier,
          newPrice: Math.round(currentPrice)
        });
      }
    };

    applyModifier('Faction Discount', modifiers.factionDiscount);
    applyModifier('Regional Scarcity', modifiers.regionalScarcity);
    applyModifier('Market Demand', modifiers.marketDemand);
    applyModifier('Merchant Reputation', modifiers.merchantReputation);
    applyModifier('Skill Discount', modifiers.skillDiscount);
    applyModifier('Event Modifier', modifiers.eventModifier);
    applyModifier('Gang Discount', modifiers.gangDiscount);
    applyModifier('Bulk Discount', modifiers.bulkDiscount);
    applyModifier('Legacy Bonus', modifiers.legacyBonus);

    return {
      basePrice,
      modifiers: modifierSteps,
      finalPrice: Math.max(1, Math.round(currentPrice))
    };
  }
}

export default PriceNormalizationUtility;
