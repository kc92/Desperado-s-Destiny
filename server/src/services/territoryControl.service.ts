/**
 * Territory Control Service
 *
 * Handles zone-level territory control, influence mechanics, and gang warfare
 */

import mongoose from 'mongoose';
import { TerritoryZone, ITerritoryZone, ZoneBenefitType } from '../models/TerritoryZone.model';
import { Gang, IGang } from '../models/Gang.model';
import { Character } from '../models/Character.model';
import {
  TerritoryControl,
  ControlledZone,
  EmpireRating,
  InfluenceActivityType,
  InfluenceGainResult,
  ContestZoneResult,
  TerritoryMapData,
  TerritoryZoneMapInfo,
  GangLegendEntry,
  ZoneStatistics,
  INFLUENCE_GAIN,
  INFLUENCE_LOSS,
  EMPIRE_RATING_THRESHOLDS,
} from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

export class TerritoryControlService {
  /**
   * Get all zones
   */
  static async getZones(): Promise<ITerritoryZone[]> {
    return TerritoryZone.find()
      .populate('controlledBy', 'name tag')
      .populate('contestedBy', 'name tag')
      .sort({ parentLocation: 1, name: 1 })
      .lean() as unknown as ITerritoryZone[];
  }

  /**
   * Get single zone by ID
   */
  static async getZone(zoneId: string): Promise<ITerritoryZone> {
    const zone = await TerritoryZone.findBySlug(zoneId);

    if (!zone) {
      throw new Error(`Zone not found: ${zoneId}`);
    }

    return zone;
  }

  /**
   * Get gang's territory overview
   */
  static async getGangTerritoryControl(gangId: mongoose.Types.ObjectId): Promise<TerritoryControl> {
    const gang = await Gang.findById(gangId).select('name tag');
    if (!gang) {
      throw new Error('Gang not found');
    }

    const controlledZones = await TerritoryZone.findControlledByGang(gangId);
    const allZones = await TerritoryZone.find({ 'influence.gangId': gangId });

    let totalIncome = 0;
    let totalInfluence = 0;
    let contestedCount = 0;

    const zones: ControlledZone[] = controlledZones.map(zone => {
      const gangInfluence = zone.getGangInfluence(gangId);
      const dailyIncome = zone.calculateDailyIncome();
      const isContested = zone.isContested();

      totalIncome += dailyIncome;
      totalInfluence += gangInfluence;
      if (isContested) contestedCount++;

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        zoneType: zone.type,
        influence: gangInfluence,
        isContested,
        dailyIncome,
        benefits: zone.benefits.map(b => ({
          type: b.type,
          description: b.description,
          value: b.value,
        })),
      };
    });

    // Calculate empire rating
    const zonesCount = controlledZones.length;
    let empireRating: EmpireRating;
    if (zonesCount >= EMPIRE_RATING_THRESHOLDS.DOMINANT) {
      empireRating = EmpireRating.DOMINANT;
    } else if (zonesCount >= EMPIRE_RATING_THRESHOLDS.MAJOR) {
      empireRating = EmpireRating.MAJOR;
    } else if (zonesCount >= EMPIRE_RATING_THRESHOLDS.GROWING) {
      empireRating = EmpireRating.GROWING;
    } else {
      empireRating = EmpireRating.SMALL;
    }

    return {
      gangId: gangId.toString(),
      gangName: gang.name,
      zones,
      totalIncome,
      totalInfluence,
      contestedZones: contestedCount,
      empireRating,
    };
  }

  /**
   * Record influence gain from activity
   */
  static async recordInfluenceGain(
    zoneId: string,
    characterId: mongoose.Types.ObjectId,
    activityType: InfluenceActivityType
  ): Promise<InfluenceGainResult> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const gang = await Gang.findByMember(characterId);
    if (!gang) {
      throw new Error('Character is not in a gang');
    }

    const zone = await TerritoryZone.findBySlug(zoneId);
    if (!zone) {
      throw new Error(`Zone not found: ${zoneId}`);
    }

    // Calculate influence gained based on activity type
    let influenceGained = 0;
    switch (activityType) {
      case InfluenceActivityType.CRIME:
        influenceGained = SecureRNG.range(
          INFLUENCE_GAIN.CRIME_MIN,
          INFLUENCE_GAIN.CRIME_MAX
        );
        break;
      case InfluenceActivityType.FIGHT:
        influenceGained = SecureRNG.range(
          INFLUENCE_GAIN.FIGHT_MIN,
          INFLUENCE_GAIN.FIGHT_MAX
        );
        break;
      case InfluenceActivityType.BRIBE:
        influenceGained = SecureRNG.range(
          INFLUENCE_GAIN.BRIBE_MIN,
          INFLUENCE_GAIN.BRIBE_MAX
        );
        break;
      case InfluenceActivityType.BUSINESS:
        influenceGained = SecureRNG.range(
          INFLUENCE_GAIN.BUSINESS_MIN,
          INFLUENCE_GAIN.BUSINESS_MAX
        );
        break;
      case InfluenceActivityType.PASSIVE:
        influenceGained = INFLUENCE_GAIN.PASSIVE_PER_HOUR;
        break;
    }

    const oldInfluence = zone.getGangInfluence(gang._id as mongoose.Types.ObjectId);
    const wasControlled = zone.isControlled() &&
                         zone.controlledBy?.equals(gang._id as mongoose.Types.ObjectId);
    const wasContested = zone.isContested();

    // Add influence
    zone.addInfluence(
      gang._id as mongoose.Types.ObjectId,
      gang.name,
      influenceGained,
      false
    );

    await zone.save();

    const newInfluence = zone.getGangInfluence(gang._id as mongoose.Types.ObjectId);
    const nowControlled = zone.isControlled() &&
                         zone.controlledBy?.equals(gang._id as mongoose.Types.ObjectId);
    const nowContested = zone.isContested();

    const controlChanged = wasControlled !== nowControlled;

    // Update gang territories list if control gained
    if (!wasControlled && nowControlled) {
      gang.addTerritory(zone.id);
      await gang.save();
    }

    logger.info(
      `Gang ${gang.name} gained ${influenceGained} influence in ${zone.name} via ${activityType}. ` +
      `New influence: ${newInfluence}`
    );

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      gangId: gang._id.toString(),
      activityType,
      influenceGained,
      newInfluence,
      controlChanged,
      nowControlled,
      nowContested,
    };
  }

  /**
   * Contest a zone (declare intent to take it)
   */
  static async contestZone(
    zoneId: string,
    gangId: mongoose.Types.ObjectId
  ): Promise<ContestZoneResult> {
    const gang = await Gang.findById(gangId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    const zone = await TerritoryZone.findBySlug(zoneId);
    if (!zone) {
      throw new Error(`Zone not found: ${zoneId}`);
    }

    // Can't contest if you already control it
    if (zone.controlledBy?.equals(gangId)) {
      return {
        success: false,
        zoneId: zone.id,
        zoneName: zone.name,
        message: 'Your gang already controls this zone',
        contestedBy: zone.contestedBy.map(id => id.toString()),
      };
    }

    // Need at least 10 influence to contest
    const currentInfluence = zone.getGangInfluence(gangId);
    if (currentInfluence < 10) {
      return {
        success: false,
        zoneId: zone.id,
        zoneName: zone.name,
        message: 'Need at least 10 influence to contest this zone',
        contestedBy: zone.contestedBy.map(id => id.toString()),
      };
    }

    // Add initial influence if needed
    if (currentInfluence === 0) {
      zone.addInfluence(gangId, gang.name, 10, false);
    }

    zone.updateControl();
    await zone.save();

    logger.info(`Gang ${gang.name} is now contesting zone ${zone.name}`);

    return {
      success: true,
      zoneId: zone.id,
      zoneName: zone.name,
      message: `Your gang is now contesting ${zone.name}`,
      contestedBy: zone.contestedBy.map(id => id.toString()),
    };
  }

  /**
   * Get territory map data
   */
  static async getTerritoryMap(): Promise<TerritoryMapData> {
    const zones = await TerritoryZone.find()
      .populate('controlledBy', 'name tag')
      .sort({ parentLocation: 1, name: 1 });

    // Collect all gangs with influence
    const gangMap = new Map<string, {
      name: string;
      tag: string;
      zonesControlled: number;
      totalInfluence: number;
    }>();

    const zoneMapInfo: TerritoryZoneMapInfo[] = zones.map(zone => {
      const topInfluences = [...zone.influence]
        .sort((a, b) => b.influence - a.influence)
        .slice(0, 3)
        .map(inf => ({
          gangId: inf.gangId.toString(),
          gangName: inf.gangName,
          influence: inf.influence,
        }));

      // Track gang stats
      for (const inf of zone.influence) {
        const gangId = inf.gangId.toString();
        if (!gangMap.has(gangId)) {
          gangMap.set(gangId, {
            name: inf.gangName,
            tag: '',
            zonesControlled: 0,
            totalInfluence: 0,
          });
        }
        const gangStats = gangMap.get(gangId)!;
        gangStats.totalInfluence += inf.influence;

        if (zone.controlledBy?.equals(inf.gangId)) {
          gangStats.zonesControlled++;
        }
      }

      return {
        id: zone.id,
        name: zone.name,
        type: zone.type,
        parentLocation: zone.parentLocation,
        controlledBy: zone.controlledBy?.toString() || null,
        controllingGangName: zone.controllingGangName,
        controllingGangColor: this.getGangColor(zone.controlledBy?.toString() || null),
        isContested: zone.isContested(),
        topInfluences,
      };
    });

    // Build gang legend
    const gangLegend: GangLegendEntry[] = [];
    for (const [gangId, stats] of Array.from(gangMap.entries())) {
      gangLegend.push({
        gangId,
        gangName: stats.name,
        gangTag: stats.tag,
        color: this.getGangColor(gangId),
        zonesControlled: stats.zonesControlled,
        totalInfluence: stats.totalInfluence,
      });
    }

    // Sort by zones controlled
    gangLegend.sort((a, b) => b.zonesControlled - a.zonesControlled);

    return {
      zones: zoneMapInfo,
      gangLegend,
    };
  }

  /**
   * Get zone statistics
   */
  static async getZoneStatistics(): Promise<ZoneStatistics> {
    const zones = await TerritoryZone.find();

    const stats: ZoneStatistics = {
      totalZones: zones.length,
      controlledZones: zones.filter(z => z.isControlled()).length,
      contestedZones: zones.filter(z => z.isContested()).length,
      uncontrolledZones: zones.filter(z => !z.isControlled()).length,
      byType: {
        town_district: zones.filter(z => z.type === 'town_district').length,
        wilderness: zones.filter(z => z.type === 'wilderness').length,
        strategic_point: zones.filter(z => z.type === 'strategic_point').length,
      },
      byGang: [],
    };

    // Count by gang
    const gangCounts = new Map<string, { gangName: string; count: number }>();
    for (const zone of zones) {
      if (zone.controlledBy) {
        const gangId = zone.controlledBy.toString();
        const gangName = zone.controllingGangName || 'Unknown';
        if (!gangCounts.has(gangId)) {
          gangCounts.set(gangId, { gangName, count: 0 });
        }
        gangCounts.get(gangId)!.count++;
      }
    }

    stats.byGang = Array.from(gangCounts.entries()).map(([gangId, data]) => ({
      gangId,
      gangName: data.gangName,
      zonesControlled: data.count,
    })).sort((a, b) => b.zonesControlled - a.zonesControlled);

    return stats;
  }

  /**
   * Apply influence decay (daily cron job)
   */
  static async applyInfluenceDecay(): Promise<void> {
    const zones = await TerritoryZone.find();
    let decayedCount = 0;
    let controlChanges = 0;

    for (const zone of zones) {
      const hadControl = zone.isControlled();
      const controllingGangId = zone.controlledBy?.toString();

      zone.decayInfluence(INFLUENCE_LOSS.INACTIVITY_PER_DAY);

      const hasControl = zone.isControlled();
      const newControllingGangId = zone.controlledBy?.toString();

      if (hadControl !== hasControl || controllingGangId !== newControllingGangId) {
        controlChanges++;

        // Update gang territories if control lost
        if (hadControl && !hasControl && controllingGangId) {
          const gang = await Gang.findById(controllingGangId);
          if (gang) {
            gang.removeTerritory(zone.id);
            await gang.save();
          }
        }
      }

      await zone.save();
      decayedCount++;
    }

    logger.info(
      `Influence decay applied to ${decayedCount} zones. ` +
      `Control changed in ${controlChanges} zones.`
    );
  }

  /**
   * Collect daily income for all gangs (daily cron job)
   */
  static async collectDailyIncome(): Promise<void> {
    const gangs = await Gang.find({ isActive: true });

    for (const gang of gangs) {
      const zones = await TerritoryZone.findControlledByGang(gang._id as mongoose.Types.ObjectId);
      let totalIncome = 0;

      for (const zone of zones) {
        totalIncome += zone.calculateDailyIncome();
      }

      if (totalIncome > 0) {
        gang.bank += totalIncome;
        gang.stats.totalRevenue += totalIncome;
        await gang.save();

        logger.info(
          `Gang ${gang.name} collected ${totalIncome} gold from ${zones.length} territories`
        );
      }
    }
  }

  /**
   * Handle rival gang activity (reduces influence)
   */
  static async handleRivalActivity(
    zoneId: string,
    rivalGangId: mongoose.Types.ObjectId,
    targetGangId: mongoose.Types.ObjectId
  ): Promise<void> {
    const zone = await TerritoryZone.findBySlug(zoneId);
    if (!zone) {
      throw new Error(`Zone not found: ${zoneId}`);
    }

    const influenceLoss = SecureRNG.range(
      INFLUENCE_LOSS.RIVAL_ACTIVITY_MIN,
      INFLUENCE_LOSS.RIVAL_ACTIVITY_MAX
    );

    const wasControlled = zone.controlledBy?.equals(targetGangId);

    zone.removeInfluence(targetGangId, influenceLoss);
    await zone.save();

    const nowControlled = zone.controlledBy?.equals(targetGangId);

    // Update gang territories if control lost
    if (wasControlled && !nowControlled) {
      const gang = await Gang.findById(targetGangId);
      if (gang) {
        gang.removeTerritory(zone.id);
        await gang.save();
      }
    }

    logger.info(
      `Rival gang activity: ${targetGangId} lost ${influenceLoss} influence in ${zone.name}`
    );
  }

  /**
   * Handle law enforcement crackdown (reduces influence)
   */
  static async handleLawEnforcement(
    zoneId: string,
    gangId: mongoose.Types.ObjectId
  ): Promise<void> {
    const zone = await TerritoryZone.findBySlug(zoneId);
    if (!zone) {
      throw new Error(`Zone not found: ${zoneId}`);
    }

    const influenceLoss = SecureRNG.range(
      INFLUENCE_LOSS.LAW_ENFORCEMENT_MIN,
      INFLUENCE_LOSS.LAW_ENFORCEMENT_MAX
    );

    const wasControlled = zone.controlledBy?.equals(gangId);

    zone.removeInfluence(gangId, influenceLoss);
    await zone.save();

    const nowControlled = zone.controlledBy?.equals(gangId);

    // Update gang territories if control lost
    if (wasControlled && !nowControlled) {
      const gang = await Gang.findById(gangId);
      if (gang) {
        gang.removeTerritory(zone.id);
        await gang.save();
      }
    }

    logger.info(
      `Law enforcement crackdown: Gang lost ${influenceLoss} influence in ${zone.name}`
    );
  }

  /**
   * Handle member arrest (reduces influence)
   */
  static async handleMemberArrest(
    zoneId: string,
    gangId: mongoose.Types.ObjectId
  ): Promise<void> {
    const zone = await TerritoryZone.findBySlug(zoneId);
    if (!zone) {
      throw new Error(`Zone not found: ${zoneId}`);
    }

    const wasControlled = zone.controlledBy?.equals(gangId);

    zone.removeInfluence(gangId, INFLUENCE_LOSS.MEMBER_ARREST);
    await zone.save();

    const nowControlled = zone.controlledBy?.equals(gangId);

    // Update gang territories if control lost
    if (wasControlled && !nowControlled) {
      const gang = await Gang.findById(gangId);
      if (gang) {
        gang.removeTerritory(zone.id);
        await gang.save();
      }
    }

    logger.info(
      `Member arrest: Gang lost ${INFLUENCE_LOSS.MEMBER_ARREST} influence in ${zone.name}`
    );
  }

  /**
   * Get gang color for map display (placeholder)
   */
  private static getGangColor(gangId: string | null): string | null {
    if (!gangId) return null;

    // Simple hash-based color generation
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    ];

    const hash = gangId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  }
}
