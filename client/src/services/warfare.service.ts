/**
 * Warfare Service
 * API client for territory warfare, fortifications, and resistance
 * Phase 11, Wave 11.2 - Territory Warfare System
 */

import api from './api';
import type {
  TerritoryFortification,
  FortificationType,
  ResistanceActivity,
  ResistanceActivityType,
  TerritoryConquestState,
  LiberationCampaign,
  DiplomaticSolution,
} from '@shared/types/conquest.types';
import type { TerritoryFactionId } from '@shared/types/territoryWar.types';

// ===== Types =====

/**
 * Fortification build request
 */
export interface BuildFortificationRequest {
  fortificationType: FortificationType;
  factionId: TerritoryFactionId;
}

/**
 * Fortification upgrade request
 */
export interface UpgradeFortificationRequest {
  factionId: TerritoryFactionId;
}

/**
 * Fortification repair request
 */
export interface RepairFortificationRequest {
  factionId: TerritoryFactionId;
}

/**
 * Fortification demolish request
 */
export interface DemolishFortificationRequest {
  factionId: TerritoryFactionId;
}

/**
 * Siege damage request
 */
export interface ApplySiegeDamageRequest {
  siegeIntensity: number;
  duration: number; // Hours
}

/**
 * Resistance action execution request
 */
export interface ExecuteResistanceActionRequest {
  activityType: ResistanceActivityType;
  faction: TerritoryFactionId;
  resourcesCommitted: number;
}

/**
 * Resistance suppression request
 */
export interface SuppressResistanceRequest {
  controllingFaction: TerritoryFactionId;
  resourcesCommitted: number;
}

/**
 * Liberation campaign start request
 */
export interface StartLiberationCampaignRequest {
  liberatingFaction: TerritoryFactionId;
  initialResources: {
    gold: number;
    supplies: number;
    troops: number;
  };
}

/**
 * Diplomatic proposal request
 */
export interface ProposeDiplomaticSolutionRequest {
  proposingFaction: TerritoryFactionId;
  targetFaction: TerritoryFactionId;
  solutionType: 'partial_return' | 'power_sharing' | 'tribute' | 'truce';
  customTerms?: {
    influenceShare?: number;
    goldPayment?: number;
    territoryAccess?: boolean;
    duration?: number;
  };
}

/**
 * Diplomatic acceptance request
 */
export interface AcceptDiplomaticSolutionRequest {
  acceptingFaction: TerritoryFactionId;
}

// ===== Response Types =====

export interface TerritoryFortificationsResponse {
  fortifications: TerritoryFortification[];
  totalDefenseBonus: number;
  fortificationLevel: number;
}

export interface FortificationInfoResponse {
  fortification: TerritoryFortification;
  canUpgrade: boolean;
  canRepair: boolean;
  upgradeCost?: {
    gold: number;
    supplies: number;
    time: number;
  };
  repairCost?: {
    gold: number;
    supplies: number;
  };
}

export interface BuildFortificationResponse {
  success: boolean;
  fortification: TerritoryFortification;
  cost: {
    gold: number;
    supplies: number;
    time: number;
  };
  newDefenseBonus: number;
  message: string;
}

export interface UpgradeFortificationResponse {
  success: boolean;
  fortification: TerritoryFortification;
  cost: {
    gold: number;
    supplies: number;
    time: number;
  };
  newDefenseBonus: number;
  message: string;
}

export interface RepairFortificationResponse {
  success: boolean;
  fortification: TerritoryFortification;
  cost: {
    gold: number;
    supplies: number;
  };
  healthRestored: number;
  message: string;
}

export interface DemolishFortificationResponse {
  success: boolean;
  refund: {
    gold: number;
    supplies: number;
  };
  message: string;
}

export interface BuildRecommendationsResponse {
  recommendations: Array<{
    fortificationType: FortificationType;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
    estimatedCost: {
      gold: number;
      supplies: number;
    };
    estimatedDefenseBonus: number;
  }>;
}

export interface ApplySiegeDamageResponse {
  success: boolean;
  fortificationsDamaged: number;
  totalDamage: number;
  fortifications: TerritoryFortification[];
  message: string;
}

export interface ResistanceActivitiesResponse {
  activities: ResistanceActivity[];
  totalStrength: number;
  hasActiveResistance: boolean;
}

export interface AvailableResistanceActionsResponse {
  actions: Array<{
    type: ResistanceActivityType;
    name: string;
    description: string;
    cost: number;
    effectDescription: string;
    successRate: number;
  }>;
}

export interface ExecuteResistanceActionResponse {
  success: boolean;
  activity: ResistanceActivity;
  cost: number;
  effect: string;
  influenceChange?: number;
  message: string;
}

export interface SuppressResistanceResponse {
  success: boolean;
  suppressionStrength: number;
  activitiesReduced: number;
  cost: number;
  message: string;
}

export interface StartLiberationCampaignResponse {
  success: boolean;
  campaign: LiberationCampaign;
  message: string;
}

export interface ProposeDiplomaticSolutionResponse {
  success: boolean;
  proposal: DiplomaticSolution;
  message: string;
}

export interface AcceptDiplomaticSolutionResponse {
  success: boolean;
  solution: DiplomaticSolution;
  territoryState: TerritoryConquestState;
  effectsApplied: string[];
  message: string;
}

// ===== Warfare Service =====

export const warfareService = {
  // ===== Fortification Routes =====

  /**
   * Get all fortifications for a territory
   */
  async getTerritoryFortifications(territoryId: string): Promise<TerritoryFortificationsResponse> {
    const response = await api.get<{ data: TerritoryFortificationsResponse }>(
      `/warfare/territories/${territoryId}/fortifications`
    );
    return response.data.data;
  },

  /**
   * Get info about a specific fortification
   */
  async getFortificationInfo(territoryId: string, fortificationId: string): Promise<FortificationInfoResponse> {
    const response = await api.get<{ data: FortificationInfoResponse }>(
      `/warfare/territories/${territoryId}/fortifications/${fortificationId}`
    );
    return response.data.data;
  },

  /**
   * Build a new fortification
   */
  async buildFortification(
    territoryId: string,
    request: BuildFortificationRequest
  ): Promise<BuildFortificationResponse> {
    const response = await api.post<{ data: BuildFortificationResponse }>(
      `/warfare/territories/${territoryId}/fortifications`,
      request
    );
    return response.data.data;
  },

  /**
   * Upgrade an existing fortification
   */
  async upgradeFortification(
    territoryId: string,
    fortificationId: string,
    request: UpgradeFortificationRequest
  ): Promise<UpgradeFortificationResponse> {
    const response = await api.put<{ data: UpgradeFortificationResponse }>(
      `/warfare/territories/${territoryId}/fortifications/${fortificationId}/upgrade`,
      request
    );
    return response.data.data;
  },

  /**
   * Repair a damaged fortification
   */
  async repairFortification(
    territoryId: string,
    fortificationId: string,
    request: RepairFortificationRequest
  ): Promise<RepairFortificationResponse> {
    const response = await api.put<{ data: RepairFortificationResponse }>(
      `/warfare/territories/${territoryId}/fortifications/${fortificationId}/repair`,
      request
    );
    return response.data.data;
  },

  /**
   * Demolish a fortification
   */
  async demolishFortification(
    territoryId: string,
    fortificationId: string,
    request: DemolishFortificationRequest
  ): Promise<DemolishFortificationResponse> {
    const response = await api.delete<{ data: DemolishFortificationResponse }>(
      `/warfare/territories/${territoryId}/fortifications/${fortificationId}`,
      { data: request }
    );
    return response.data.data;
  },

  /**
   * Get fortification build recommendations
   */
  async getBuildRecommendations(territoryId: string): Promise<BuildRecommendationsResponse> {
    const response = await api.get<{ data: BuildRecommendationsResponse }>(
      `/warfare/territories/${territoryId}/recommendations`
    );
    return response.data.data;
  },

  /**
   * Apply siege damage to fortifications (admin/system use)
   */
  async applySiegeDamage(
    territoryId: string,
    request: ApplySiegeDamageRequest
  ): Promise<ApplySiegeDamageResponse> {
    const response = await api.post<{ data: ApplySiegeDamageResponse }>(
      `/warfare/territories/${territoryId}/siege-damage`,
      request
    );
    return response.data.data;
  },

  // ===== Resistance Routes =====

  /**
   * Get resistance activities for a territory
   */
  async getResistanceActivities(territoryId: string): Promise<ResistanceActivitiesResponse> {
    const response = await api.get<{ data: ResistanceActivitiesResponse }>(
      `/warfare/territories/${territoryId}/resistance`
    );
    return response.data.data;
  },

  /**
   * Get available resistance actions for a faction
   */
  async getAvailableResistanceActions(
    territoryId: string,
    faction: TerritoryFactionId
  ): Promise<AvailableResistanceActionsResponse> {
    const params = new URLSearchParams();
    params.append('faction', faction);

    const response = await api.get<{ data: AvailableResistanceActionsResponse }>(
      `/warfare/territories/${territoryId}/resistance/actions?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Execute a resistance action
   */
  async executeResistanceAction(
    territoryId: string,
    request: ExecuteResistanceActionRequest
  ): Promise<ExecuteResistanceActionResponse> {
    const response = await api.post<{ data: ExecuteResistanceActionResponse }>(
      `/warfare/territories/${territoryId}/resistance/execute`,
      request
    );
    return response.data.data;
  },

  /**
   * Suppress resistance (for controlling faction)
   */
  async suppressResistance(
    territoryId: string,
    request: SuppressResistanceRequest
  ): Promise<SuppressResistanceResponse> {
    const response = await api.post<{ data: SuppressResistanceResponse }>(
      `/warfare/territories/${territoryId}/resistance/suppress`,
      request
    );
    return response.data.data;
  },

  // ===== Liberation Routes =====

  /**
   * Start a liberation campaign
   */
  async startLiberationCampaign(
    territoryId: string,
    request: StartLiberationCampaignRequest
  ): Promise<StartLiberationCampaignResponse> {
    const response = await api.post<{ data: StartLiberationCampaignResponse }>(
      `/warfare/territories/${territoryId}/liberation/start`,
      request
    );
    return response.data.data;
  },

  // ===== Diplomacy Routes =====

  /**
   * Propose a diplomatic solution
   */
  async proposeDiplomaticSolution(
    territoryId: string,
    request: ProposeDiplomaticSolutionRequest
  ): Promise<ProposeDiplomaticSolutionResponse> {
    const response = await api.post<{ data: ProposeDiplomaticSolutionResponse }>(
      `/warfare/territories/${territoryId}/diplomacy/propose`,
      request
    );
    return response.data.data;
  },

  /**
   * Accept a diplomatic proposal
   */
  async acceptDiplomaticSolution(
    proposalId: string,
    request: AcceptDiplomaticSolutionRequest
  ): Promise<AcceptDiplomaticSolutionResponse> {
    const response = await api.post<{ data: AcceptDiplomaticSolutionResponse }>(
      `/warfare/diplomacy/${proposalId}/accept`,
      request
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Calculate fortification health status
   */
  getFortificationHealthStatus(fortification: TerritoryFortification): 'healthy' | 'damaged' | 'critical' {
    if (fortification.healthPercentage >= 80) return 'healthy';
    if (fortification.healthPercentage >= 40) return 'damaged';
    return 'critical';
  },

  /**
   * Check if fortification needs repair
   */
  needsRepair(fortification: TerritoryFortification, threshold: number = 80): boolean {
    return fortification.healthPercentage < threshold;
  },

  /**
   * Check if fortification can be upgraded
   */
  canUpgrade(fortification: TerritoryFortification, maxLevel: number = 10): boolean {
    return fortification.level < maxLevel && fortification.healthPercentage >= 50;
  },

  /**
   * Filter fortifications by type
   */
  filterByType(fortifications: TerritoryFortification[], type: FortificationType): TerritoryFortification[] {
    return fortifications.filter(fort => fort.type === type);
  },

  /**
   * Get damaged fortifications
   */
  getDamagedFortifications(
    fortifications: TerritoryFortification[],
    threshold: number = 100
  ): TerritoryFortification[] {
    return fortifications.filter(fort => fort.healthPercentage < threshold);
  },

  /**
   * Calculate average fortification level
   */
  calculateAverageFortificationLevel(fortifications: TerritoryFortification[]): number {
    if (fortifications.length === 0) return 0;
    const total = fortifications.reduce((sum, fort) => sum + fort.level, 0);
    return Math.round((total / fortifications.length) * 10) / 10;
  },

  /**
   * Calculate total defense bonus
   */
  calculateTotalDefenseBonus(fortifications: TerritoryFortification[]): number {
    return fortifications.reduce((total, fort) => {
      // Only count fortifications at >0% health
      const healthMultiplier = fort.healthPercentage / 100;
      return total + (fort.defenseBonus * healthMultiplier);
    }, 0);
  },

  /**
   * Get active resistance activities
   */
  getActiveResistanceActivities(activities: ResistanceActivity[]): ResistanceActivity[] {
    return activities.filter(activity => activity.active);
  },

  /**
   * Calculate total resistance strength
   */
  calculateTotalResistanceStrength(activities: ResistanceActivity[]): number {
    return this.getActiveResistanceActivities(activities).reduce(
      (total, activity) => total + activity.strength,
      0
    );
  },

  /**
   * Filter resistance by faction
   */
  filterResistanceByFaction(
    activities: ResistanceActivity[],
    faction: TerritoryFactionId
  ): ResistanceActivity[] {
    return activities.filter(activity => activity.faction === faction);
  },

  /**
   * Check if liberation campaign is viable
   */
  isLiberationViable(campaign: LiberationCampaign): boolean {
    return (
      campaign.active &&
      campaign.currentInfluence >= campaign.targetInfluence * 0.5 // At least 50% progress
    );
  },

  /**
   * Calculate liberation progress percentage
   */
  calculateLiberationProgress(campaign: LiberationCampaign): number {
    if (campaign.targetInfluence === 0) return 0;
    return Math.min(100, (campaign.currentInfluence / campaign.targetInfluence) * 100);
  },

  /**
   * Check if diplomatic proposal is expired
   */
  isProposalExpired(proposal: DiplomaticSolution): boolean {
    return new Date(proposal.expiresAt) < new Date();
  },

  /**
   * Get time until proposal expires (in hours)
   */
  getTimeUntilProposalExpires(proposal: DiplomaticSolution): number {
    const now = new Date().getTime();
    const expires = new Date(proposal.expiresAt).getTime();
    const diff = expires - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  },

  /**
   * Format fortification name for display
   */
  formatFortificationName(fortification: TerritoryFortification): string {
    const typeNames: Record<FortificationType, string> = {
      [FortificationType.WALLS]: 'Defensive Walls',
      [FortificationType.WATCHTOWERS]: 'Watchtowers',
      [FortificationType.BARRACKS]: 'Barracks',
      [FortificationType.SUPPLY_DEPOT]: 'Supply Depot',
      [FortificationType.ARTILLERY]: 'Artillery Emplacements',
    };
    return `${typeNames[fortification.type]} (Lvl ${fortification.level})`;
  },

  /**
   * Format resistance activity name for display
   */
  formatResistanceActivityName(activity: ResistanceActivity): string {
    const typeNames: Record<ResistanceActivityType, string> = {
      [ResistanceActivityType.SABOTAGE]: 'Sabotage Operations',
      [ResistanceActivityType.GUERRILLA]: 'Guerrilla Warfare',
      [ResistanceActivityType.PROPAGANDA]: 'Propaganda Campaign',
      [ResistanceActivityType.SMUGGLING]: 'Smuggling Network',
      [ResistanceActivityType.RECRUITMENT]: 'Recruitment Drive',
    };
    return typeNames[activity.type];
  },

  /**
   * Estimate repair cost based on damage
   */
  estimateRepairCost(fortification: TerritoryFortification, baseCost: number): {
    gold: number;
    supplies: number;
  } {
    const damagePercent = (100 - fortification.healthPercentage) / 100;
    const levelMultiplier = 1 + (fortification.level * 0.1);
    const cost = Math.ceil(baseCost * damagePercent * levelMultiplier);

    return {
      gold: cost,
      supplies: Math.ceil(cost * 0.3),
    };
  },

  /**
   * Sort fortifications by priority (damaged first, then by level)
   */
  sortByPriority(fortifications: TerritoryFortification[]): TerritoryFortification[] {
    return [...fortifications].sort((a, b) => {
      // First sort by health (damaged first)
      if (a.healthPercentage !== b.healthPercentage) {
        return a.healthPercentage - b.healthPercentage;
      }
      // Then by level (higher level first)
      return b.level - a.level;
    });
  },

  /**
   * Check if character can afford fortification
   */
  canAffordFortification(
    characterGold: number,
    characterSupplies: number,
    cost: { gold: number; supplies: number }
  ): boolean {
    return characterGold >= cost.gold && characterSupplies >= cost.supplies;
  },
};

export default warfareService;
