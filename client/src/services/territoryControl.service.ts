/**
 * Territory Control Service
 * API client for gang territory control system operations
 */

import api from './api';
import { EmpireRating } from '@shared/types/territoryControl.types';
import type {
  TerritoryZone,
  TerritoryControl,
  InfluenceGainResult,
  ContestZoneResult,
  TerritoryMapData,
  ZoneStatistics,
  ZoneType,
  InfluenceActivityType,
  GangInfluence,
  ControlledZone,
} from '@shared/types/territoryControl.types';

// ===== Types =====

export interface ZoneListResponse {
  zones: TerritoryZone[];
  total: number;
}

export interface ZoneByIdResponse {
  zone: TerritoryZone;
}

export interface GangTerritoryControlResponse {
  control: TerritoryControl;
}

export interface RecordInfluenceRequest {
  zoneId: string;
  activityType: InfluenceActivityType;
  amount?: number; // Optional, calculated by backend if not provided
}

export interface RecordInfluenceResponse {
  result: InfluenceGainResult;
}

export interface ContestZoneRequest {
  gangId: string;
}

export interface TerritoryMapResponse {
  map: TerritoryMapData;
}

export interface ZoneStatisticsResponse {
  statistics: ZoneStatistics;
}

// ===== Territory Control Service =====

export const territoryControlService = {
  // ===== Public Routes =====

  /**
   * Get all territory zones
   */
  async getZones(): Promise<TerritoryZone[]> {
    const response = await api.get<{ data: ZoneListResponse }>('/territory/zones');
    return response.data.data.zones;
  },

  /**
   * Get single zone details
   */
  async getZone(zoneId: string): Promise<TerritoryZone> {
    const response = await api.get<{ data: ZoneByIdResponse }>(`/territory/zones/${zoneId}`);
    return response.data.data.zone;
  },

  /**
   * Get gang's territory control overview
   */
  async getGangTerritoryControl(gangId: string): Promise<TerritoryControl> {
    const response = await api.get<{ data: GangTerritoryControlResponse }>(
      `/territory/gang/${gangId}`
    );
    return response.data.data.control;
  },

  /**
   * Get territory map data
   */
  async getTerritoryMap(): Promise<TerritoryMapData> {
    const response = await api.get<{ data: TerritoryMapResponse }>('/territory/map');
    return response.data.data.map;
  },

  /**
   * Get zone statistics
   */
  async getZoneStatistics(): Promise<ZoneStatistics> {
    const response = await api.get<{ data: ZoneStatisticsResponse }>('/territory/statistics');
    return response.data.data.statistics;
  },

  // ===== Authenticated Routes =====

  /**
   * Record influence gain from activity
   */
  async recordInfluenceGain(
    zoneId: string,
    activityType: InfluenceActivityType,
    amount?: number
  ): Promise<InfluenceGainResult> {
    const response = await api.post<{ data: RecordInfluenceResponse }>('/territory/influence', {
      zoneId,
      activityType,
      amount,
    });
    return response.data.data.result;
  },

  /**
   * Contest a zone (declare intent to take it)
   */
  async contestZone(zoneId: string, gangId: string): Promise<ContestZoneResult> {
    const response = await api.post<{ data: { result: ContestZoneResult } }>(
      `/territory/contest/${zoneId}`,
      { gangId }
    );
    return response.data.data.result;
  },

  // ===== Convenience Methods =====

  /**
   * Get zones by type
   */
  async getZonesByType(type: ZoneType): Promise<TerritoryZone[]> {
    const zones = await this.getZones();
    return zones.filter(z => z.type === type);
  },

  /**
   * Get zones by location
   */
  async getZonesByLocation(location: string): Promise<TerritoryZone[]> {
    const zones = await this.getZones();
    return zones.filter(z => z.parentLocation === location);
  },

  /**
   * Get contested zones
   */
  async getContestedZones(): Promise<TerritoryZone[]> {
    const zones = await this.getZones();
    return zones.filter(z => z.contestedBy.length > 0);
  },

  /**
   * Get unclaimed zones
   */
  async getUnclaimedZones(): Promise<TerritoryZone[]> {
    const zones = await this.getZones();
    return zones.filter(z => !z.controlledBy);
  },

  /**
   * Get zones controlled by gang
   */
  async getGangZones(gangId: string): Promise<TerritoryZone[]> {
    const zones = await this.getZones();
    return zones.filter(z => z.controlledBy === gangId);
  },

  /**
   * Get gang's influence in a zone
   */
  getGangInfluenceInZone(zone: TerritoryZone, gangId: string): number {
    const gangInfluence = zone.influence.find(i => i.gangId === gangId);
    return gangInfluence?.influence || 0;
  },

  /**
   * Get leading gang in a zone
   */
  getLeadingGang(zone: TerritoryZone): GangInfluence | null {
    if (zone.influence.length === 0) return null;
    return [...zone.influence].sort((a, b) => b.influence - a.influence)[0];
  },

  /**
   * Check if zone is contested
   */
  isZoneContested(zone: TerritoryZone): boolean {
    return zone.contestedBy.length > 0;
  },

  /**
   * Check if gang can contest zone
   */
  canContestZone(
    zone: TerritoryZone,
    gangId: string,
    gangInfluence: number
  ): { canContest: boolean; reason?: string } {
    // Already contested by this gang
    if (zone.contestedBy.includes(gangId)) {
      return { canContest: false, reason: 'Already contesting this zone' };
    }

    // Already controlled by this gang
    if (zone.controlledBy === gangId) {
      return { canContest: false, reason: 'You already control this zone' };
    }

    // Need minimum influence (example: 30)
    if (gangInfluence < 30) {
      return { canContest: false, reason: 'Need at least 30 influence to contest' };
    }

    return { canContest: true };
  },

  /**
   * Calculate daily income for controlled zones
   */
  calculateTotalDailyIncome(zones: ControlledZone[]): number {
    return zones.reduce((total, zone) => total + zone.dailyIncome, 0);
  },

  /**
   * Calculate empire rating from zone count
   */
  calculateEmpireRating(zoneCount: number): EmpireRating {
    if (zoneCount >= 15) return EmpireRating.DOMINANT;
    if (zoneCount >= 8) return EmpireRating.MAJOR;
    if (zoneCount >= 3) return EmpireRating.GROWING;
    return EmpireRating.SMALL;
  },

  /**
   * Get top gangs by total influence
   */
  async getTopGangsByInfluence(limit: number = 10): Promise<Array<{
    gangId: string;
    gangName: string;
    totalInfluence: number;
    zonesControlled: number;
  }>> {
    const zones = await this.getZones();
    const gangStats = new Map<string, { name: string; influence: number; zones: number }>();

    zones.forEach(zone => {
      zone.influence.forEach(inf => {
        const existing = gangStats.get(inf.gangId);
        if (existing) {
          existing.influence += inf.influence;
          if (zone.controlledBy === inf.gangId) {
            existing.zones++;
          }
        } else {
          gangStats.set(inf.gangId, {
            name: inf.gangName,
            influence: inf.influence,
            zones: zone.controlledBy === inf.gangId ? 1 : 0,
          });
        }
      });
    });

    return Array.from(gangStats.entries())
      .map(([gangId, stats]) => ({
        gangId,
        gangName: stats.name,
        totalInfluence: stats.influence,
        zonesControlled: stats.zones,
      }))
      .sort((a, b) => b.totalInfluence - a.totalInfluence)
      .slice(0, limit);
  },

  /**
   * Sort zones by strategic value (defense rating + income)
   */
  sortZonesByValue(zones: TerritoryZone[]): TerritoryZone[] {
    return [...zones].sort((a, b) => {
      const valueA = a.defenseRating + a.dailyIncome;
      const valueB = b.defenseRating + b.dailyIncome;
      return valueB - valueA;
    });
  },

  /**
   * Filter zones by minimum defense rating
   */
  filterByDefenseRating(zones: TerritoryZone[], minRating: number): TerritoryZone[] {
    return zones.filter(z => z.defenseRating >= minRating);
  },

  /**
   * Get zone control percentage for a gang
   */
  getControlPercentage(zone: TerritoryZone, gangId: string): number {
    const totalInfluence = zone.influence.reduce((sum, i) => sum + i.influence, 0);
    if (totalInfluence === 0) return 0;

    const gangInfluence = zone.influence.find(i => i.gangId === gangId);
    if (!gangInfluence) return 0;

    return Math.round((gangInfluence.influence / totalInfluence) * 100);
  },
};

export default territoryControlService;
