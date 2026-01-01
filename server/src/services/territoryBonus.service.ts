/**
 * Territory Bonus Service
 *
 * Phase 2.2: Territory Bonuses (Full Activity Coverage)
 *
 * Centralized service for calculating territory-based bonuses for all activities.
 * All activity services should call this service to get their territory bonuses.
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { Gang } from '../models/Gang.model';
import { TerritoryZone, ITerritoryZone } from '../models/TerritoryZone.model';
import {
  ZoneBenefitType,
  ZoneSpecialization,
  TERRITORY_BONUS_CAPS,
  BONUS_TYPE_TO_CATEGORY,
  SPECIALIZATION_BONUS_MAPPING,
  INFLUENCE_BONUS_THRESHOLDS,
  BonusCategory,
} from '@desperados/shared';
import {
  TerritoryActivityType,
  ZoneBonusInfo,
  CharacterZoneInfluence,
  CalculatedBonus,
  CombatBonuses,
  MiningBonuses,
  CrimeBonuses,
  TradeBonuses,
  ContractBonuses,
  PropertyBonuses,
  BountyBonuses,
  CattleBonuses,
  TerritoryBonusResult,
  DEFAULT_COMBAT_BONUSES,
  DEFAULT_MINING_BONUSES,
  DEFAULT_CRIME_BONUSES,
  DEFAULT_TRADE_BONUSES,
  DEFAULT_CONTRACT_BONUSES,
  DEFAULT_PROPERTY_BONUSES,
  DEFAULT_BOUNTY_BONUSES,
  DEFAULT_CATTLE_BONUSES,
} from '@desperados/shared';
import logger from '../utils/logger';

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

interface CacheEntry {
  data: ZoneBonusInfo;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const bonusCache = new Map<string, CacheEntry>();

function getCacheKey(zoneId: string, gangId: string): string {
  return `${zoneId}:${gangId}`;
}

function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of bonusCache.entries()) {
    if (entry.expiresAt < now) {
      bonusCache.delete(key);
    }
  }
}

// Clear expired entries every minute - store reference for graceful shutdown
let cacheCleanupInterval: NodeJS.Timeout | null = null;

function startCacheCleanup(): void {
  if (!cacheCleanupInterval) {
    cacheCleanupInterval = setInterval(clearExpiredCache, 60 * 1000);
  }
}

function stopCacheCleanup(): void {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval);
    cacheCleanupInterval = null;
  }
}

// Auto-start on module load
startCacheCleanup();

// Export for graceful shutdown
export { startCacheCleanup, stopCacheCleanup };

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate influence multiplier based on gang's influence level
 */
function calculateInfluenceMultiplier(influence: number, isContested: boolean): number {
  let multiplier: number;

  if (influence < INFLUENCE_BONUS_THRESHOLDS.MINIMUM) {
    multiplier = 0;
  } else if (influence < INFLUENCE_BONUS_THRESHOLDS.MEDIUM) {
    multiplier = 0.25; // 25% of bonus
  } else if (influence < INFLUENCE_BONUS_THRESHOLDS.HIGH) {
    multiplier = 0.5; // 50% of bonus
  } else if (influence < INFLUENCE_BONUS_THRESHOLDS.DOMINATION) {
    multiplier = 1.0; // 100% of bonus
  } else {
    multiplier = 1.25; // 125% domination bonus
  }

  // Apply contested penalty
  if (isContested && multiplier > 0) {
    multiplier *= INFLUENCE_BONUS_THRESHOLDS.CONTESTED_PENALTY;
  }

  return multiplier;
}

/**
 * Calculate specialization multiplier for a bonus type
 */
function calculateSpecializationMultiplier(
  bonusType: ZoneBenefitType,
  specialization: ZoneSpecialization
): number {
  const category = BONUS_TYPE_TO_CATEGORY[bonusType];
  if (!category) return 0.5; // Unknown category gets 50%

  const mapping = SPECIALIZATION_BONUS_MAPPING[specialization];

  if (mapping.primary.includes(category)) {
    return 1.0; // 100% for primary
  } else if (mapping.secondary.includes(category)) {
    return 0.5; // 50% for secondary
  } else if (mapping.tertiary.includes(category)) {
    return 0.25; // 25% for tertiary
  }

  return 0; // Not in any tier
}

/**
 * Apply cap to a bonus value
 */
function applyBonusCap(
  value: number,
  bonusType: ZoneBenefitType
): { finalValue: number; wasCapped: boolean; capValue?: number } {
  const cap = TERRITORY_BONUS_CAPS[bonusType];
  if (cap !== undefined && value > cap) {
    return { finalValue: cap, wasCapped: true, capValue: cap };
  }
  return { finalValue: value, wasCapped: false };
}

/**
 * Map ZoneBenefitType to activity-specific bonus property
 */
function mapBonusTypeToProperty(
  bonusType: ZoneBenefitType
): { activity: TerritoryActivityType; property: string } | null {
  const mapping: Record<string, { activity: TerritoryActivityType; property: string }> = {
    [ZoneBenefitType.COMBAT_DAMAGE]: { activity: 'combat', property: 'damage' },
    [ZoneBenefitType.COMBAT_DEFENSE]: { activity: 'combat', property: 'defense' },
    [ZoneBenefitType.COMBAT_XP]: { activity: 'combat', property: 'xp' },
    [ZoneBenefitType.COMBAT_GOLD]: { activity: 'combat', property: 'gold' },
    [ZoneBenefitType.COMBAT]: { activity: 'combat', property: 'damage' },

    [ZoneBenefitType.MINING_YIELD]: { activity: 'mining', property: 'yield' },
    [ZoneBenefitType.MINING_RARE]: { activity: 'mining', property: 'rareChance' },
    [ZoneBenefitType.MINING_SPEED]: { activity: 'mining', property: 'speed' },
    [ZoneBenefitType.MINING_VALUE]: { activity: 'mining', property: 'value' },

    [ZoneBenefitType.CRIME_SUCCESS]: { activity: 'crime', property: 'success' },
    [ZoneBenefitType.CRIME_DETECTION]: { activity: 'crime', property: 'detection' },
    [ZoneBenefitType.CRIME_JAIL]: { activity: 'crime', property: 'jail' },
    [ZoneBenefitType.CRIME_FENCE]: { activity: 'crime', property: 'fence' },

    [ZoneBenefitType.TRADE_BUY]: { activity: 'trade', property: 'buy' },
    [ZoneBenefitType.TRADE_SELL]: { activity: 'trade', property: 'sell' },
    [ZoneBenefitType.TRADE_DISCOUNT]: { activity: 'trade', property: 'discount' },
    [ZoneBenefitType.ECONOMIC]: { activity: 'trade', property: 'sell' },

    [ZoneBenefitType.CONTRACT_GOLD]: { activity: 'contract', property: 'gold' },
    [ZoneBenefitType.CONTRACT_XP]: { activity: 'contract', property: 'xp' },
    [ZoneBenefitType.CONTRACT_BONUS]: { activity: 'contract', property: 'streak' },

    [ZoneBenefitType.PROPERTY_INCOME]: { activity: 'property', property: 'income' },
    [ZoneBenefitType.PROPERTY_SPEED]: { activity: 'property', property: 'speed' },
    [ZoneBenefitType.WORKER_EFFICIENCY]: { activity: 'property', property: 'workerEfficiency' },
    [ZoneBenefitType.INCOME]: { activity: 'property', property: 'income' },

    [ZoneBenefitType.BOUNTY_VALUE]: { activity: 'bounty', property: 'value' },
    [ZoneBenefitType.BOUNTY_TRACKING]: { activity: 'bounty', property: 'tracking' },
    [ZoneBenefitType.BOUNTY_XP]: { activity: 'bounty', property: 'xp' },

    [ZoneBenefitType.CATTLE_REWARD]: { activity: 'cattle', property: 'reward' },
    [ZoneBenefitType.CATTLE_SURVIVAL]: { activity: 'cattle', property: 'survival' },
  };

  return mapping[bonusType] || null;
}

// =============================================================================
// SERVICE CLASS
// =============================================================================

export class TerritoryBonusService {
  /**
   * Get character's zone influence information
   */
  static async getCharacterZoneInfluence(
    characterId: mongoose.Types.ObjectId
  ): Promise<CharacterZoneInfluence | null> {
    try {
      const character = await Character.findById(characterId).select('currentLocation gangId');
      if (!character || !character.currentLocation) {
        return null;
      }

      // Find zone by parent location
      const zone = await TerritoryZone.findOne({
        parentLocation: character.currentLocation,
      });

      if (!zone) {
        return null;
      }

      // Get gang influence if character is in a gang
      let influence = 0;
      let gangId: string | null = null;

      if (character.gangId) {
        gangId = character.gangId.toString();
        const gangInfluence = zone.influence.find(
          (inf) => inf.gangId.equals(character.gangId as mongoose.Types.ObjectId)
        );
        influence = gangInfluence?.influence || 0;
      }

      // Get zone specialization (default to MIXED if not set)
      const specialization = (zone as any).specialization || ZoneSpecialization.MIXED;

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        gangId,
        influence,
        isContested: zone.contestedBy.length > 0,
        specialization,
      };
    } catch (error) {
      logger.error('Failed to get character zone influence:', error);
      return null;
    }
  }

  /**
   * Get zone bonuses for a gang
   */
  static async getZoneBonuses(
    zoneId: string,
    gangId: mongoose.Types.ObjectId
  ): Promise<ZoneBonusInfo | null> {
    try {
      // Check cache
      const cacheKey = getCacheKey(zoneId, gangId.toString());
      const cached = bonusCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      const zone = await TerritoryZone.findOne({ id: zoneId });
      if (!zone) {
        return null;
      }

      // Get gang's influence in this zone
      const gangInfluence = zone.influence.find((inf) => inf.gangId.equals(gangId));
      const influence = gangInfluence?.influence || 0;
      const isContested = zone.contestedBy.length > 0;

      // Get zone specialization (default to MIXED if not set)
      const specialization = (zone as any).specialization || ZoneSpecialization.MIXED;

      // Check if gang controls the zone
      const hasControl =
        zone.controlledBy !== null && zone.controlledBy.equals(gangId);

      // Calculate bonuses
      const bonuses: CalculatedBonus[] = [];

      for (const benefit of zone.benefits) {
        const influenceMultiplier = calculateInfluenceMultiplier(influence, isContested);
        const specializationMultiplier = calculateSpecializationMultiplier(
          benefit.type as ZoneBenefitType,
          specialization
        );

        const rawValue = benefit.value;
        const scaledValue = rawValue * influenceMultiplier * specializationMultiplier;
        const { finalValue, wasCapped, capValue } = applyBonusCap(
          scaledValue,
          benefit.type as ZoneBenefitType
        );

        bonuses.push({
          type: benefit.type as ZoneBenefitType,
          rawValue,
          influenceMultiplier,
          specializationMultiplier,
          finalValue,
          wasCapped,
          capValue,
        });
      }

      const result: ZoneBonusInfo = {
        zoneId: zone.id,
        zoneName: zone.name,
        specialization,
        influence,
        isContested,
        hasControl,
        bonuses,
      };

      // Cache result
      bonusCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return result;
    } catch (error) {
      logger.error('Failed to get zone bonuses:', error);
      return null;
    }
  }

  /**
   * Get combat bonuses for a character
   */
  static async getCombatBonuses(
    characterId: mongoose.Types.ObjectId
  ): Promise<TerritoryBonusResult<'combat'>> {
    const zoneInfluence = await this.getCharacterZoneInfluence(characterId);

    if (!zoneInfluence || !zoneInfluence.gangId) {
      return {
        activityType: 'combat',
        zone: null,
        bonuses: { ...DEFAULT_COMBAT_BONUSES },
        hasBonuses: false,
      };
    }

    const zoneBonuses = await this.getZoneBonuses(
      zoneInfluence.zoneId,
      new mongoose.Types.ObjectId(zoneInfluence.gangId)
    );

    if (!zoneBonuses) {
      return {
        activityType: 'combat',
        zone: null,
        bonuses: { ...DEFAULT_COMBAT_BONUSES },
        hasBonuses: false,
      };
    }

    const bonuses: CombatBonuses = { ...DEFAULT_COMBAT_BONUSES };

    for (const bonus of zoneBonuses.bonuses) {
      const mapping = mapBonusTypeToProperty(bonus.type);
      if (mapping && mapping.activity === 'combat') {
        const key = mapping.property as keyof CombatBonuses;
        bonuses[key] = 1 + bonus.finalValue;
      }
    }

    return {
      activityType: 'combat',
      zone: zoneBonuses,
      bonuses,
      hasBonuses: Object.values(bonuses).some((v) => v !== 1.0),
      breakdown: zoneBonuses.bonuses.filter(
        (b) => mapBonusTypeToProperty(b.type)?.activity === 'combat'
      ),
    };
  }

  /**
   * Get mining bonuses for a character or location
   */
  static async getMiningBonuses(
    characterId: mongoose.Types.ObjectId
  ): Promise<TerritoryBonusResult<'mining'>> {
    const zoneInfluence = await this.getCharacterZoneInfluence(characterId);

    if (!zoneInfluence || !zoneInfluence.gangId) {
      return {
        activityType: 'mining',
        zone: null,
        bonuses: { ...DEFAULT_MINING_BONUSES },
        hasBonuses: false,
      };
    }

    const zoneBonuses = await this.getZoneBonuses(
      zoneInfluence.zoneId,
      new mongoose.Types.ObjectId(zoneInfluence.gangId)
    );

    if (!zoneBonuses) {
      return {
        activityType: 'mining',
        zone: null,
        bonuses: { ...DEFAULT_MINING_BONUSES },
        hasBonuses: false,
      };
    }

    const bonuses: MiningBonuses = { ...DEFAULT_MINING_BONUSES };

    for (const bonus of zoneBonuses.bonuses) {
      const mapping = mapBonusTypeToProperty(bonus.type);
      if (mapping && mapping.activity === 'mining') {
        const key = mapping.property as keyof MiningBonuses;
        // Speed is a reduction, so subtract instead of add
        if (key === 'speed') {
          bonuses[key] = 1 - bonus.finalValue;
        } else {
          bonuses[key] = 1 + bonus.finalValue;
        }
      }
    }

    return {
      activityType: 'mining',
      zone: zoneBonuses,
      bonuses,
      hasBonuses: Object.values(bonuses).some((v) => v !== 1.0),
      breakdown: zoneBonuses.bonuses.filter(
        (b) => mapBonusTypeToProperty(b.type)?.activity === 'mining'
      ),
    };
  }

  /**
   * Get crime bonuses for a character
   */
  static async getCrimeBonuses(
    characterId: mongoose.Types.ObjectId
  ): Promise<TerritoryBonusResult<'crime'>> {
    const zoneInfluence = await this.getCharacterZoneInfluence(characterId);

    if (!zoneInfluence || !zoneInfluence.gangId) {
      return {
        activityType: 'crime',
        zone: null,
        bonuses: { ...DEFAULT_CRIME_BONUSES },
        hasBonuses: false,
      };
    }

    const zoneBonuses = await this.getZoneBonuses(
      zoneInfluence.zoneId,
      new mongoose.Types.ObjectId(zoneInfluence.gangId)
    );

    if (!zoneBonuses) {
      return {
        activityType: 'crime',
        zone: null,
        bonuses: { ...DEFAULT_CRIME_BONUSES },
        hasBonuses: false,
      };
    }

    const bonuses: CrimeBonuses = { ...DEFAULT_CRIME_BONUSES };

    for (const bonus of zoneBonuses.bonuses) {
      const mapping = mapBonusTypeToProperty(bonus.type);
      if (mapping && mapping.activity === 'crime') {
        const key = mapping.property as keyof CrimeBonuses;
        // Success is additive (not multiplicative)
        if (key === 'success') {
          bonuses[key] = bonus.finalValue;
        } else if (key === 'detection' || key === 'jail') {
          // Detection and jail are reductions
          bonuses[key] = 1 - bonus.finalValue;
        } else {
          bonuses[key] = 1 + bonus.finalValue;
        }
      }
    }

    return {
      activityType: 'crime',
      zone: zoneBonuses,
      bonuses,
      hasBonuses:
        bonuses.success !== 0 ||
        bonuses.detection !== 1.0 ||
        bonuses.jail !== 1.0 ||
        bonuses.fence !== 1.0,
      breakdown: zoneBonuses.bonuses.filter(
        (b) => mapBonusTypeToProperty(b.type)?.activity === 'crime'
      ),
    };
  }

  /**
   * Get trade bonuses for a character
   */
  static async getTradeBonuses(
    characterId: mongoose.Types.ObjectId
  ): Promise<TerritoryBonusResult<'trade'>> {
    const zoneInfluence = await this.getCharacterZoneInfluence(characterId);

    if (!zoneInfluence || !zoneInfluence.gangId) {
      return {
        activityType: 'trade',
        zone: null,
        bonuses: { ...DEFAULT_TRADE_BONUSES },
        hasBonuses: false,
      };
    }

    const zoneBonuses = await this.getZoneBonuses(
      zoneInfluence.zoneId,
      new mongoose.Types.ObjectId(zoneInfluence.gangId)
    );

    if (!zoneBonuses) {
      return {
        activityType: 'trade',
        zone: null,
        bonuses: { ...DEFAULT_TRADE_BONUSES },
        hasBonuses: false,
      };
    }

    const bonuses: TradeBonuses = { ...DEFAULT_TRADE_BONUSES };

    for (const bonus of zoneBonuses.bonuses) {
      const mapping = mapBonusTypeToProperty(bonus.type);
      if (mapping && mapping.activity === 'trade') {
        const key = mapping.property as keyof TradeBonuses;
        // Buy and discount are reductions
        if (key === 'buy' || key === 'discount') {
          bonuses[key] = 1 - bonus.finalValue;
        } else {
          bonuses[key] = 1 + bonus.finalValue;
        }
      }
    }

    return {
      activityType: 'trade',
      zone: zoneBonuses,
      bonuses,
      hasBonuses: Object.values(bonuses).some((v) => v !== 1.0),
      breakdown: zoneBonuses.bonuses.filter(
        (b) => mapBonusTypeToProperty(b.type)?.activity === 'trade'
      ),
    };
  }

  /**
   * Get contract bonuses for a character
   */
  static async getContractBonuses(
    characterId: mongoose.Types.ObjectId
  ): Promise<TerritoryBonusResult<'contract'>> {
    const zoneInfluence = await this.getCharacterZoneInfluence(characterId);

    if (!zoneInfluence || !zoneInfluence.gangId) {
      return {
        activityType: 'contract',
        zone: null,
        bonuses: { ...DEFAULT_CONTRACT_BONUSES },
        hasBonuses: false,
      };
    }

    const zoneBonuses = await this.getZoneBonuses(
      zoneInfluence.zoneId,
      new mongoose.Types.ObjectId(zoneInfluence.gangId)
    );

    if (!zoneBonuses) {
      return {
        activityType: 'contract',
        zone: null,
        bonuses: { ...DEFAULT_CONTRACT_BONUSES },
        hasBonuses: false,
      };
    }

    const bonuses: ContractBonuses = { ...DEFAULT_CONTRACT_BONUSES };

    for (const bonus of zoneBonuses.bonuses) {
      const mapping = mapBonusTypeToProperty(bonus.type);
      if (mapping && mapping.activity === 'contract') {
        const key = mapping.property as keyof ContractBonuses;
        bonuses[key] = 1 + bonus.finalValue;
      }
    }

    return {
      activityType: 'contract',
      zone: zoneBonuses,
      bonuses,
      hasBonuses: Object.values(bonuses).some((v) => v !== 1.0),
      breakdown: zoneBonuses.bonuses.filter(
        (b) => mapBonusTypeToProperty(b.type)?.activity === 'contract'
      ),
    };
  }

  /**
   * Get property bonuses for a location
   */
  static async getPropertyBonuses(
    locationId: string,
    gangId: mongoose.Types.ObjectId
  ): Promise<TerritoryBonusResult<'property'>> {
    // Find zone by parent location
    const zone = await TerritoryZone.findOne({
      parentLocation: locationId,
    });

    if (!zone) {
      return {
        activityType: 'property',
        zone: null,
        bonuses: { ...DEFAULT_PROPERTY_BONUSES },
        hasBonuses: false,
      };
    }

    const zoneBonuses = await this.getZoneBonuses(zone.id, gangId);

    if (!zoneBonuses) {
      return {
        activityType: 'property',
        zone: null,
        bonuses: { ...DEFAULT_PROPERTY_BONUSES },
        hasBonuses: false,
      };
    }

    const bonuses: PropertyBonuses = { ...DEFAULT_PROPERTY_BONUSES };

    for (const bonus of zoneBonuses.bonuses) {
      const mapping = mapBonusTypeToProperty(bonus.type);
      if (mapping && mapping.activity === 'property') {
        const key = mapping.property as keyof PropertyBonuses;
        // Speed is a reduction
        if (key === 'speed') {
          bonuses[key] = 1 - bonus.finalValue;
        } else {
          bonuses[key] = 1 + bonus.finalValue;
        }
      }
    }

    return {
      activityType: 'property',
      zone: zoneBonuses,
      bonuses,
      hasBonuses: Object.values(bonuses).some((v) => v !== 1.0),
      breakdown: zoneBonuses.bonuses.filter(
        (b) => mapBonusTypeToProperty(b.type)?.activity === 'property'
      ),
    };
  }

  /**
   * Get bounty hunting bonuses for a character
   */
  static async getBountyBonuses(
    characterId: mongoose.Types.ObjectId
  ): Promise<TerritoryBonusResult<'bounty'>> {
    const zoneInfluence = await this.getCharacterZoneInfluence(characterId);

    if (!zoneInfluence || !zoneInfluence.gangId) {
      return {
        activityType: 'bounty',
        zone: null,
        bonuses: { ...DEFAULT_BOUNTY_BONUSES },
        hasBonuses: false,
      };
    }

    const zoneBonuses = await this.getZoneBonuses(
      zoneInfluence.zoneId,
      new mongoose.Types.ObjectId(zoneInfluence.gangId)
    );

    if (!zoneBonuses) {
      return {
        activityType: 'bounty',
        zone: null,
        bonuses: { ...DEFAULT_BOUNTY_BONUSES },
        hasBonuses: false,
      };
    }

    const bonuses: BountyBonuses = { ...DEFAULT_BOUNTY_BONUSES };

    for (const bonus of zoneBonuses.bonuses) {
      const mapping = mapBonusTypeToProperty(bonus.type);
      if (mapping && mapping.activity === 'bounty') {
        const key = mapping.property as keyof BountyBonuses;
        bonuses[key] = 1 + bonus.finalValue;
      }
    }

    return {
      activityType: 'bounty',
      zone: zoneBonuses,
      bonuses,
      hasBonuses: Object.values(bonuses).some((v) => v !== 1.0),
      breakdown: zoneBonuses.bonuses.filter(
        (b) => mapBonusTypeToProperty(b.type)?.activity === 'bounty'
      ),
    };
  }

  /**
   * Get cattle drive bonuses for a character
   */
  static async getCattleBonuses(
    characterId: mongoose.Types.ObjectId
  ): Promise<TerritoryBonusResult<'cattle'>> {
    const zoneInfluence = await this.getCharacterZoneInfluence(characterId);

    if (!zoneInfluence || !zoneInfluence.gangId) {
      return {
        activityType: 'cattle',
        zone: null,
        bonuses: { ...DEFAULT_CATTLE_BONUSES },
        hasBonuses: false,
      };
    }

    const zoneBonuses = await this.getZoneBonuses(
      zoneInfluence.zoneId,
      new mongoose.Types.ObjectId(zoneInfluence.gangId)
    );

    if (!zoneBonuses) {
      return {
        activityType: 'cattle',
        zone: null,
        bonuses: { ...DEFAULT_CATTLE_BONUSES },
        hasBonuses: false,
      };
    }

    const bonuses: CattleBonuses = { ...DEFAULT_CATTLE_BONUSES };

    for (const bonus of zoneBonuses.bonuses) {
      const mapping = mapBonusTypeToProperty(bonus.type);
      if (mapping && mapping.activity === 'cattle') {
        const key = mapping.property as keyof CattleBonuses;
        bonuses[key] = 1 + bonus.finalValue;
      }
    }

    return {
      activityType: 'cattle',
      zone: zoneBonuses,
      bonuses,
      hasBonuses: Object.values(bonuses).some((v) => v !== 1.0),
      breakdown: zoneBonuses.bonuses.filter(
        (b) => mapBonusTypeToProperty(b.type)?.activity === 'cattle'
      ),
    };
  }

  /**
   * Phase 15: Get gang's influence in a specific zone by zone ID
   */
  static async getGangZoneInfluence(
    gangId: mongoose.Types.ObjectId,
    zoneId: string
  ): Promise<number> {
    try {
      const zone = await TerritoryZone.findOne({ id: zoneId });
      if (!zone) {
        return 0;
      }

      const gangInfluence = zone.influence.find((inf) => inf.gangId.equals(gangId));
      return gangInfluence?.influence || 0;
    } catch (error) {
      logger.error('Failed to get gang zone influence:', error);
      return 0;
    }
  }

  /**
   * Get a single bonus multiplier for a specific bonus type
   */
  static async getSingleBonus(
    characterId: mongoose.Types.ObjectId,
    bonusType: ZoneBenefitType
  ): Promise<{ multiplier: number; applied: boolean }> {
    const zoneInfluence = await this.getCharacterZoneInfluence(characterId);

    if (!zoneInfluence || !zoneInfluence.gangId) {
      return { multiplier: 1.0, applied: false };
    }

    const zoneBonuses = await this.getZoneBonuses(
      zoneInfluence.zoneId,
      new mongoose.Types.ObjectId(zoneInfluence.gangId)
    );

    if (!zoneBonuses) {
      return { multiplier: 1.0, applied: false };
    }

    const bonus = zoneBonuses.bonuses.find((b) => b.type === bonusType);
    if (!bonus) {
      return { multiplier: 1.0, applied: false };
    }

    return { multiplier: 1 + bonus.finalValue, applied: true };
  }

  /**
   * Clear bonus cache for a zone (call when zone data changes)
   */
  static clearZoneCache(zoneId: string): void {
    for (const key of bonusCache.keys()) {
      if (key.startsWith(`${zoneId}:`)) {
        bonusCache.delete(key);
      }
    }
  }

  /**
   * Clear all bonus cache (call on major updates)
   */
  static clearAllCache(): void {
    bonusCache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: bonusCache.size,
      entries: Array.from(bonusCache.keys()),
    };
  }
}

export default TerritoryBonusService;
