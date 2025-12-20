/**
 * Territory Influence Service
 * API client for faction influence and territory control system
 * Phase 11, Wave 11.1 - Territory Influence System
 */

import api from './api';
import type {
  TerritoryInfluence,
  TerritoryInfluenceSummary,
  FactionInfluenceGainResult,
  FactionOverview,
  AlignmentBenefits,
  InfluenceChange,
  TerritoryFactionId,
  InfluenceSource,
  ControlLevel,
  FactionInfluence,
} from '@shared/types/territoryWar.types';

// ===== Types =====

export interface AllTerritoriesResponse {
  territories: TerritoryInfluenceSummary[];
  total: number;
}

export interface TerritoryInfluenceResponse {
  territory: TerritoryInfluence;
}

export interface InfluenceHistoryResponse {
  history: InfluenceChange[];
  total: number;
}

export interface AlignmentBenefitsResponse {
  benefits: AlignmentBenefits;
}

export interface FactionOverviewResponse {
  overview: FactionOverview;
}

export interface CharacterInfluenceResponse {
  contributions: InfluenceChange[];
  total: number;
  totalInfluence: number;
}

export interface ContributeInfluenceRequest {
  factionId: TerritoryFactionId;
  amount: number;
  source: InfluenceSource;
  metadata?: Record<string, unknown>;
}

export interface ContributeInfluenceResponse {
  result: FactionInfluenceGainResult;
}

export interface DonateForInfluenceRequest {
  factionId: TerritoryFactionId;
  donationAmount: number;
}

export interface DonateForInfluenceResponse {
  result: FactionInfluenceGainResult;
  goldSpent: number;
  influenceGained: number;
}

export interface GangAlignmentInfluenceRequest {
  gangId: string;
  gangName: string;
  factionId: TerritoryFactionId;
  influenceAmount: number;
}

export interface QuestInfluenceRequest {
  factionId: TerritoryFactionId;
  questId: string;
  influenceAmount: number;
}

export interface CrimeInfluenceRequest {
  crimeType: string;
}

export interface CrimeInfluenceResponse {
  result: FactionInfluenceGainResult;
  penaltyApplied: number;
}

export interface InitializeTerritoriesResponse {
  initialized: number;
  territories: string[];
}

export interface DailyDecayResponse {
  territoriesProcessed: number;
  totalDecay: number;
}

// ===== Territory Influence Service =====

export const territoryInfluenceService = {
  // ===== Territory Queries =====

  /**
   * Get all territory influence summaries
   */
  async getAllTerritories(): Promise<TerritoryInfluenceSummary[]> {
    const response = await api.get<{ data: AllTerritoriesResponse }>('/territory-influence');
    return response.data.data.territories;
  },

  /**
   * Get territory influence summary
   */
  async getTerritoryInfluence(territoryId: string): Promise<TerritoryInfluence> {
    const response = await api.get<{ data: TerritoryInfluenceResponse }>(
      `/territory-influence/${territoryId}`
    );
    return response.data.data.territory;
  },

  /**
   * Get influence history for a territory
   */
  async getInfluenceHistory(
    territoryId: string,
    limit: number = 50
  ): Promise<InfluenceChange[]> {
    const response = await api.get<{ data: InfluenceHistoryResponse }>(
      `/territory-influence/${territoryId}/history`,
      { params: { limit } }
    );
    return response.data.data.history;
  },

  /**
   * Get alignment benefits for faction in territory
   */
  async getAlignmentBenefits(
    territoryId: string,
    factionId: TerritoryFactionId
  ): Promise<AlignmentBenefits> {
    const response = await api.get<{ data: AlignmentBenefitsResponse }>(
      `/territory-influence/${territoryId}/benefits`,
      { params: { factionId } }
    );
    return response.data.data.benefits;
  },

  // ===== Faction Queries =====

  /**
   * Get faction overview across all territories
   */
  async getFactionOverview(factionId: TerritoryFactionId): Promise<FactionOverview> {
    const response = await api.get<{ data: FactionOverviewResponse }>(
      `/territory-influence/factions/${factionId}/overview`
    );
    return response.data.data.overview;
  },

  // ===== Character Contributions =====

  /**
   * Get character's influence contributions
   */
  async getCharacterInfluence(
    characterId: string,
    limit: number = 50
  ): Promise<CharacterInfluenceResponse> {
    const response = await api.get<{ data: CharacterInfluenceResponse }>(
      `/territory-influence/characters/${characterId}/contributions`,
      { params: { limit } }
    );
    return response.data.data;
  },

  // ===== Influence Modification =====

  /**
   * Contribute to faction influence in a territory
   */
  async contributeInfluence(
    territoryId: string,
    factionId: TerritoryFactionId,
    amount: number,
    source: InfluenceSource,
    metadata?: Record<string, unknown>
  ): Promise<FactionInfluenceGainResult> {
    const response = await api.post<{ data: ContributeInfluenceResponse }>(
      `/territory-influence/${territoryId}/contribute`,
      { factionId, amount, source, metadata }
    );
    return response.data.data.result;
  },

  /**
   * Donate gold to faction for influence
   */
  async donateForInfluence(
    territoryId: string,
    factionId: TerritoryFactionId,
    donationAmount: number
  ): Promise<DonateForInfluenceResponse> {
    const response = await api.post<{ data: DonateForInfluenceResponse }>(
      `/territory-influence/${territoryId}/donate`,
      { factionId, donationAmount }
    );
    return response.data.data;
  },

  /**
   * Apply gang alignment influence (daily passive gain)
   */
  async applyGangAlignmentInfluence(
    territoryId: string,
    gangId: string,
    gangName: string,
    factionId: TerritoryFactionId,
    influenceAmount: number
  ): Promise<FactionInfluenceGainResult> {
    const response = await api.post<{ data: ContributeInfluenceResponse }>(
      `/territory-influence/${territoryId}/gang-alignment`,
      { gangId, gangName, factionId, influenceAmount }
    );
    return response.data.data.result;
  },

  /**
   * Apply quest completion influence
   */
  async applyQuestInfluence(
    territoryId: string,
    factionId: TerritoryFactionId,
    questId: string,
    influenceAmount: number
  ): Promise<FactionInfluenceGainResult> {
    const response = await api.post<{ data: ContributeInfluenceResponse }>(
      `/territory-influence/${territoryId}/quest`,
      { factionId, questId, influenceAmount }
    );
    return response.data.data.result;
  },

  /**
   * Apply criminal activity influence (negative for controlling faction)
   */
  async applyCrimeInfluence(
    territoryId: string,
    crimeType: string
  ): Promise<CrimeInfluenceResponse> {
    const response = await api.post<{ data: CrimeInfluenceResponse }>(
      `/territory-influence/${territoryId}/crime`,
      { crimeType }
    );
    return response.data.data;
  },

  // ===== System Operations (Admin/Cron) =====

  /**
   * Initialize all territories with base influence
   */
  async initializeTerritories(): Promise<InitializeTerritoriesResponse> {
    const response = await api.post<{ data: InitializeTerritoriesResponse }>(
      '/territory-influence/initialize'
    );
    return response.data.data;
  },

  /**
   * Apply daily influence decay to all territories
   */
  async applyDailyDecay(): Promise<DailyDecayResponse> {
    const response = await api.post<{ data: DailyDecayResponse }>(
      '/territory-influence/apply-daily-decay'
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Get territories controlled by a faction
   */
  async getTerritoriesControlledByFaction(
    factionId: TerritoryFactionId
  ): Promise<TerritoryInfluenceSummary[]> {
    const territories = await this.getAllTerritories();
    return territories.filter(t => t.controllingFaction === factionId);
  },

  /**
   * Get contested territories
   */
  async getContestedTerritories(): Promise<TerritoryInfluenceSummary[]> {
    const territories = await this.getAllTerritories();
    return territories.filter(t => t.isContested);
  },

  /**
   * Get territories by control level
   */
  async getTerritoriesByControlLevel(
    controlLevel: ControlLevel
  ): Promise<TerritoryInfluenceSummary[]> {
    const territories = await this.getAllTerritories();
    return territories.filter(t => t.controlLevel === controlLevel);
  },

  /**
   * Get dominant faction in territory
   */
  getDominantFaction(territory: TerritoryInfluence): FactionInfluence | null {
    if (territory.factionInfluence.length === 0) return null;
    return [...territory.factionInfluence].sort((a, b) => b.influence - a.influence)[0];
  },

  /**
   * Get faction influence percentage
   */
  getFactionInfluencePercentage(
    territory: TerritoryInfluence,
    factionId: TerritoryFactionId
  ): number {
    const faction = territory.factionInfluence.find(f => f.factionId === factionId);
    return faction?.influence || 0;
  },

  /**
   * Check if faction controls territory
   */
  isControlledByFaction(
    territory: TerritoryInfluence,
    factionId: TerritoryFactionId
  ): boolean {
    return territory.controllingFaction === factionId;
  },

  /**
   * Calculate influence needed for control
   */
  calculateInfluenceNeededForControl(
    currentInfluence: number,
    targetLevel: ControlLevel
  ): number {
    const thresholds = {
      contested: 30,
      disputed: 50,
      controlled: 70,
      dominated: 85,
    };

    const targetInfluence = thresholds[targetLevel];
    return Math.max(0, targetInfluence - currentInfluence);
  },

  /**
   * Get influence trend analysis
   */
  async getInfluenceTrendAnalysis(territoryId: string, factionId: TerritoryFactionId): Promise<{
    trend: 'rising' | 'falling' | 'stable';
    averageChange: number;
    recentChanges: number[];
  }> {
    const history = await this.getInfluenceHistory(territoryId, 10);
    const factionChanges = history
      .filter(h => h.factionId === factionId)
      .map(h => h.amount);

    if (factionChanges.length === 0) {
      return { trend: 'stable', averageChange: 0, recentChanges: [] };
    }

    const averageChange = factionChanges.reduce((sum, val) => sum + val, 0) / factionChanges.length;

    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (averageChange > 2) trend = 'rising';
    else if (averageChange < -2) trend = 'falling';

    return {
      trend,
      averageChange,
      recentChanges: factionChanges,
    };
  },

  /**
   * Sort territories by faction influence
   */
  sortTerritoriesByInfluence(
    territories: TerritoryInfluenceSummary[],
    factionId: TerritoryFactionId
  ): TerritoryInfluenceSummary[] {
    return [...territories].sort((a, b) => {
      const aInfluence = a.topFactions.find(f => f.factionId === factionId)?.influence || 0;
      const bInfluence = b.topFactions.find(f => f.factionId === factionId)?.influence || 0;
      return bInfluence - aInfluence;
    });
  },

  /**
   * Get top contributors to a faction
   */
  async getTopContributors(
    territoryId: string,
    factionId: TerritoryFactionId,
    limit: number = 10
  ): Promise<Array<{
    characterId: string;
    characterName: string;
    totalContribution: number;
  }>> {
    const history = await this.getInfluenceHistory(territoryId, 100);
    const contributions = new Map<string, { name: string; total: number }>();

    history
      .filter(h => h.factionId === factionId && h.characterId)
      .forEach(h => {
        const existing = contributions.get(h.characterId!);
        if (existing) {
          existing.total += h.amount;
        } else {
          contributions.set(h.characterId!, {
            name: h.characterName || 'Unknown',
            total: h.amount,
          });
        }
      });

    return Array.from(contributions.entries())
      .map(([characterId, data]) => ({
        characterId,
        characterName: data.name,
        totalContribution: data.total,
      }))
      .sort((a, b) => b.totalContribution - a.totalContribution)
      .slice(0, limit);
  },

  /**
   * Calculate gold needed for desired influence
   */
  calculateGoldForInfluence(desiredInfluence: number): number {
    // Based on INFLUENCE_GAINS.FACTION_DONATION_PER_100_GOLD: 1
    return desiredInfluence * 100;
  },

  /**
   * Check if territory is stable
   */
  isTerritoryStable(territory: TerritoryInfluence): boolean {
    return territory.stability >= 60;
  },

  /**
   * Get faction strength rating
   */
  getFactionStrength(overview: FactionOverview): 'weak' | 'moderate' | 'strong' | 'dominant' {
    return overview.strength;
  },
};

export default territoryInfluenceService;
