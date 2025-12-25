/**
 * Competition Service
 *
 * Phase 14.3: Risk Simulation - Competition System
 *
 * Core service for calculating traffic share, market saturation,
 * and competition modifiers for businesses.
 */

import { NPCBusiness, INPCBusinessDocument } from '../models/NPCBusiness.model';
import { TerritoryZone } from '../models/TerritoryZone.model';
import logger from '../utils/logger';
import {
  BusinessTypeCategory,
  MarketSaturationLevel,
  ZoneBusinessType,
  ITrafficShareResult,
  IMarketSaturationResult,
  ICompetitionModifier,
  NPCBusinessStatus,
} from '@desperados/shared';
import {
  TRAFFIC_SHARE_WEIGHTS,
  TRAFFIC_SHARE_CONSTRAINTS,
  SATURATION_MODIFIERS,
  ZONE_CAPACITIES,
  TERRITORY_EFFECTS,
  SCORE_CALCULATION,
  calculatePriceScore,
  calculateQualityScore,
  getSaturationLevel,
} from '@desperados/shared';

/**
 * Generic business info for competition calculations
 */
interface IBusinessInfo {
  id: string;
  name: string;
  isPlayerOwned: boolean;
  businessType: BusinessTypeCategory;
  zoneId: string;
  reputation: number;
  priceModifier: number;
  quality: number;
  gangId?: string;
}

/**
 * Zone control info interface
 */
interface IZoneControlInfo {
  zoneId: string;
  controllingGangId?: string;
  isContested: boolean;
  influence: number;
}

/**
 * Competition Service
 */
export class CompetitionService {
  /**
   * Calculate traffic shares for all NPC businesses of a type in a zone
   * Note: Player business integration is handled separately in CustomerTrafficService
   */
  static async calculateNPCTrafficShares(
    zoneId: string,
    businessType: BusinessTypeCategory
  ): Promise<ITrafficShareResult[]> {
    // Get NPC businesses of this type in the zone
    const npcBusinesses = await NPCBusiness.findByZoneAndType(zoneId, businessType);
    const activeBusinesses = npcBusinesses.filter(b => b.status !== NPCBusinessStatus.CLOSED);

    if (activeBusinesses.length === 0) {
      return [];
    }

    // Get zone control info
    const zoneControl = await this.getZoneControlInfo(zoneId);

    // Calculate scores for each business
    const businessInfos: IBusinessInfo[] = activeBusinesses.map(biz => ({
      id: biz._id.toString(),
      name: biz.name,
      isPlayerOwned: false,
      businessType: biz.businessType,
      zoneId: biz.zoneId,
      reputation: biz.reputation,
      priceModifier: biz.priceModifier,
      quality: biz.currentQuality,
      gangId: biz.protectingGangId?.toString(),
    }));

    const scores = businessInfos.map(business => ({
      business,
      scores: this.calculateBusinessScores(business, zoneControl),
    }));

    // Calculate total score
    const totalScore = scores.reduce((sum, s) => sum + s.scores.total, 0);

    // Get saturation modifier
    const saturation = await this.getMarketSaturation(zoneId, businessType);
    const saturationModifier = SATURATION_MODIFIERS[saturation.level];

    // Calculate raw shares
    const results: ITrafficShareResult[] = scores.map(({ business, scores: businessScores }) => {
      const rawShare = totalScore > 0 ? businessScores.total / totalScore : 1 / businessInfos.length;

      // Apply constraints
      let finalShare = rawShare;
      finalShare = Math.max(TRAFFIC_SHARE_CONSTRAINTS.MIN_SHARE, finalShare);
      finalShare = Math.min(TRAFFIC_SHARE_CONSTRAINTS.MAX_SHARE, finalShare);

      // Determine territory bonus
      const territoryBonus = this.calculateTerritoryBonus(business, zoneControl);

      // Determine gang protection effect
      const gangProtectionEffect = this.calculateGangProtectionEffect(business, zoneControl);

      return {
        businessId: business.id,
        businessName: business.name,
        isPlayerOwned: business.isPlayerOwned,
        reputationScore: businessScores.reputation,
        priceScore: businessScores.price,
        qualityScore: businessScores.quality,
        territoryScore: businessScores.territory,
        totalScore: businessScores.total,
        rawShare,
        finalShare,
        saturationModifier,
        territoryBonus,
        gangProtectionEffect,
      };
    });

    // Normalize shares to sum to 1.0
    const totalFinalShare = results.reduce((sum, r) => sum + r.finalShare, 0);
    if (totalFinalShare > 0 && totalFinalShare !== 1.0) {
      const adjustmentFactor = 1.0 / totalFinalShare;
      results.forEach(r => {
        r.finalShare *= adjustmentFactor;
      });
    }

    return results;
  }

  /**
   * Calculate competition scores for a business
   */
  static calculateBusinessScores(
    business: IBusinessInfo,
    zoneControl: IZoneControlInfo
  ): {
    reputation: number;
    price: number;
    quality: number;
    territory: number;
    total: number;
  } {
    // Reputation score (0-100 maps to 0-100)
    const reputationScore = business.reputation * SCORE_CALCULATION.REPUTATION_WEIGHT;

    // Price score (0.7 = 100, 1.3 = 0)
    const priceScore = calculatePriceScore(business.priceModifier);

    // Quality score (1-10 maps to 0-100)
    const qualityScore = calculateQualityScore(business.quality);

    // Territory score
    let territoryScore = 0;
    if (business.gangId && zoneControl.controllingGangId === business.gangId) {
      territoryScore = SCORE_CALCULATION.TERRITORY_CONTROL_BONUS;
      if (zoneControl.isContested) {
        territoryScore = SCORE_CALCULATION.TERRITORY_CONTESTED_BONUS;
      }
    }

    // Calculate weighted total
    const total =
      (reputationScore * TRAFFIC_SHARE_WEIGHTS.REPUTATION) +
      (priceScore * TRAFFIC_SHARE_WEIGHTS.PRICE) +
      (qualityScore * TRAFFIC_SHARE_WEIGHTS.QUALITY) +
      (territoryScore * TRAFFIC_SHARE_WEIGHTS.TERRITORY);

    return {
      reputation: reputationScore,
      price: priceScore,
      quality: qualityScore,
      territory: territoryScore,
      total,
    };
  }

  /**
   * Get zone control information
   */
  static async getZoneControlInfo(zoneId: string): Promise<IZoneControlInfo> {
    const zone = await TerritoryZone.findOne({ id: zoneId });

    if (!zone) {
      return {
        zoneId,
        controllingGangId: undefined,
        isContested: false,
        influence: 0,
      };
    }

    // Find the gang with highest influence from the influence array
    let highestInfluence = 0;
    let controllingGangId: string | undefined;
    let secondHighest = 0;

    for (const gangInfluence of zone.influence || []) {
      const influenceValue = gangInfluence.influence;
      if (influenceValue > highestInfluence) {
        secondHighest = highestInfluence;
        highestInfluence = influenceValue;
        controllingGangId = gangInfluence.gangId.toString();
      } else if (influenceValue > secondHighest) {
        secondHighest = influenceValue;
      }
    }

    // Zone is contested if second-highest is within 20% of highest
    const isContested = secondHighest > 0 && (secondHighest / highestInfluence) >= 0.8;

    return {
      zoneId,
      controllingGangId: highestInfluence >= 50 ? controllingGangId : undefined,
      isContested,
      influence: highestInfluence,
    };
  }

  /**
   * Calculate territory bonus for a business
   */
  static calculateTerritoryBonus(
    business: IBusinessInfo,
    zoneControl: IZoneControlInfo
  ): number {
    if (!business.gangId || !zoneControl.controllingGangId) {
      return 0;
    }

    if (business.gangId !== zoneControl.controllingGangId) {
      return 0;
    }

    let bonus = TERRITORY_EFFECTS.PLAYER_GANG_CONTROL_BONUS;

    if (zoneControl.isContested) {
      bonus *= TERRITORY_EFFECTS.CONTESTED_BONUS_REDUCTION;
    }

    return bonus;
  }

  /**
   * Calculate gang protection effect
   */
  static calculateGangProtectionEffect(
    business: IBusinessInfo,
    zoneControl: IZoneControlInfo
  ): number {
    // If zone is gang-controlled and business isn't protected by that gang
    if (
      zoneControl.controllingGangId &&
      business.gangId !== zoneControl.controllingGangId &&
      !business.isPlayerOwned
    ) {
      // NPC business not paying protection
      return -TERRITORY_EFFECTS.PROTECTION_TRAFFIC_PENALTY;
    }

    return 0;
  }

  /**
   * Map ZoneType (territory model) to ZoneBusinessType (competition capacity)
   */
  private static mapZoneTypeToBusinessType(zoneType: string | undefined): ZoneBusinessType {
    // Map territory zone types to business capacity zone types
    switch (zoneType) {
      case 'town_district':
        return ZoneBusinessType.COMMERCIAL;
      case 'wilderness':
        return ZoneBusinessType.FRONTIER;
      case 'strategic_point':
        return ZoneBusinessType.COMMERCIAL;
      default:
        return ZoneBusinessType.COMMERCIAL;
    }
  }

  /**
   * Get market saturation for a business type in a zone
   */
  static async getMarketSaturation(
    zoneId: string,
    businessType: BusinessTypeCategory
  ): Promise<IMarketSaturationResult> {
    // Get zone type (default to commercial)
    const zone = await TerritoryZone.findOne({ id: zoneId });
    const zoneType = this.mapZoneTypeToBusinessType(zone?.type);

    // Get capacity for this zone type and business type
    const zoneCapacities = ZONE_CAPACITIES[zoneType] || {};
    const capacity = zoneCapacities[businessType] || 3; // Default capacity of 3

    // Count NPC businesses
    const npcCount = await NPCBusiness.countByZoneAndType(zoneId, businessType);

    // Note: Player business count would be added in integration
    const currentCount = npcCount;
    const saturationPercent = capacity > 0 ? currentCount / capacity : 0;

    const level = getSaturationLevel(saturationPercent);
    const trafficModifier = SATURATION_MODIFIERS[level];

    return {
      zoneId,
      businessType,
      capacity,
      currentCount,
      saturationPercent,
      level,
      trafficModifier,
    };
  }

  /**
   * Get competition modifier for an NPC business
   */
  static async getNPCCompetitionModifier(
    businessId: string
  ): Promise<ICompetitionModifier> {
    const npcBusiness = await NPCBusiness.findById(businessId);

    if (!npcBusiness) {
      return {
        businessId,
        baseTraffic: 100,
        saturationModifier: 1.0,
        competitionModifier: 1.0,
        territoryModifier: 1.0,
        gangModifier: 1.0,
        finalTraffic: 100,
        modifierBreakdown: 'Business not found',
      };
    }

    const zoneId = npcBusiness.zoneId;
    const businessType = npcBusiness.businessType;

    // Get saturation
    const saturation = await this.getMarketSaturation(zoneId, businessType);
    const saturationModifier = saturation.trafficModifier;

    // Get traffic shares
    const shares = await this.calculateNPCTrafficShares(zoneId, businessType);
    const ourShare = shares.find(s => s.businessId === businessId);
    const competitionModifier = ourShare?.finalShare ?? 0.2;

    // Get zone control
    const zoneControl = await this.getZoneControlInfo(zoneId);

    const business: IBusinessInfo = {
      id: npcBusiness._id.toString(),
      name: npcBusiness.name,
      isPlayerOwned: false,
      businessType: npcBusiness.businessType,
      zoneId: npcBusiness.zoneId,
      reputation: npcBusiness.reputation,
      priceModifier: npcBusiness.priceModifier,
      quality: npcBusiness.currentQuality,
      gangId: npcBusiness.protectingGangId?.toString(),
    };

    const territoryModifier = 1 + this.calculateTerritoryBonus(business, zoneControl);
    const gangModifier = 1 + this.calculateGangProtectionEffect(business, zoneControl);

    const baseTraffic = 100; // Base traffic units
    const finalTraffic = baseTraffic * saturationModifier * competitionModifier * territoryModifier * gangModifier;

    const breakdown = [
      `Base: ${baseTraffic}`,
      `Saturation: ×${saturationModifier.toFixed(2)} (${saturation.level})`,
      `Competition: ×${competitionModifier.toFixed(2)} (${Math.round(competitionModifier * 100)}% share)`,
      `Territory: ×${territoryModifier.toFixed(2)}`,
      `Gang: ×${gangModifier.toFixed(2)}`,
    ].join(', ');

    return {
      businessId,
      baseTraffic,
      saturationModifier,
      competitionModifier,
      territoryModifier,
      gangModifier,
      finalTraffic,
      modifierBreakdown: breakdown,
    };
  }

  /**
   * Count all active NPC businesses by zone and type
   */
  static async countNPCBusinessesByZoneAndType(
    zoneId: string,
    businessType: BusinessTypeCategory
  ): Promise<number> {
    return NPCBusiness.countByZoneAndType(zoneId, businessType);
  }
}
