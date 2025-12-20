/**
 * Conquest Service
 * API client for territory siege and conquest mechanics
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import api from './api';
import type {
  ConquestAttempt,
  ConquestStage,
  ConquestAttemptStatus,
  TerritoryConquestState,
  SiegeEligibility,
  ConquestResult,
  ConquestStatistics,
  ConquestResources,
  TerritoryFortification,
  ResistanceActivity,
  ControlChange,
} from '@shared/types/conquest.types';
import type { TerritoryFactionId } from '@shared/types/territoryWar.types';

// ===== Types =====

/**
 * Request to check siege eligibility
 */
export interface CheckSiegeEligibilityRequest {
  attackingFaction: TerritoryFactionId;
  currentInfluence?: number;
}

/**
 * Request to declare siege
 */
export interface DeclareSiegeRequest {
  attackingFaction: TerritoryFactionId;
  resourceCommitment: ConquestResources;
  requestedAllies?: TerritoryFactionId[];
  warDuration?: number; // Hours, default 48
}

/**
 * Request to rally defense
 */
export interface RallyDefenseRequest {
  defendingFaction: TerritoryFactionId;
  resourceCommitment: ConquestResources;
  requestedAllies?: TerritoryFactionId[];
}

/**
 * Request to start assault
 */
export interface StartAssaultRequest {
  warEventId?: string;
}

/**
 * Request to complete conquest
 */
export interface CompleteConquestRequest {
  attackerScore: number;
  defenderScore: number;
}

/**
 * Request to initialize territory state
 */
export interface InitializeTerritoryStateRequest {
  territoryName: string;
  initialController: TerritoryFactionId;
}

// ===== Response Types =====

export interface SiegeEligibilityResponse {
  eligibility: SiegeEligibility;
}

export interface DeclareSiegeResponse {
  success: boolean;
  siegeAttempt: ConquestAttempt;
  message: string;
}

export interface RallyDefenseResponse {
  success: boolean;
  siegeAttempt: ConquestAttempt;
  message: string;
}

export interface StartAssaultResponse {
  success: boolean;
  siegeAttempt: ConquestAttempt;
  warEventId: string;
  message: string;
}

export interface CompleteConquestResponse {
  success: boolean;
  result: ConquestResult;
  territoryState: TerritoryConquestState;
  message: string;
}

export interface CancelSiegeResponse {
  success: boolean;
  refundedResources: ConquestResources;
  message: string;
}

export interface ActiveSiegesResponse {
  sieges: ConquestAttempt[];
  total: number;
}

export interface ConquestHistoryResponse {
  history: ControlChange[];
  total: number;
}

export interface FactionStatisticsResponse {
  statistics: ConquestStatistics;
}

export interface InitializeTerritoryStateResponse {
  success: boolean;
  territoryState: TerritoryConquestState;
  message: string;
}

export interface UpdateOccupationStatusesResponse {
  success: boolean;
  updated: number;
  message: string;
}

// ===== Conquest Service =====

export const conquestService = {
  // ===== Siege Eligibility =====

  /**
   * Check if faction can declare siege on territory
   */
  async checkSiegeEligibility(
    territoryId: string,
    request: CheckSiegeEligibilityRequest
  ): Promise<SiegeEligibility> {
    const params = new URLSearchParams();
    params.append('attackingFaction', request.attackingFaction);
    if (request.currentInfluence !== undefined) {
      params.append('currentInfluence', request.currentInfluence.toString());
    }

    const response = await api.get<{ data: SiegeEligibilityResponse }>(
      `/conquest/territories/${territoryId}/eligibility?${params.toString()}`
    );
    return response.data.data.eligibility;
  },

  // ===== Siege Declaration =====

  /**
   * Declare siege on a territory
   */
  async declareSiege(territoryId: string, request: DeclareSiegeRequest): Promise<DeclareSiegeResponse> {
    const response = await api.post<{ data: DeclareSiegeResponse }>(
      `/conquest/territories/${territoryId}/declare-siege`,
      request
    );
    return response.data.data;
  },

  /**
   * Rally defense for a siege (defending faction)
   */
  async rallyDefense(siegeAttemptId: string, request: RallyDefenseRequest): Promise<RallyDefenseResponse> {
    const response = await api.post<{ data: RallyDefenseResponse }>(
      `/conquest/sieges/${siegeAttemptId}/rally-defense`,
      request
    );
    return response.data.data;
  },

  // ===== Siege Execution =====

  /**
   * Start the assault phase (war event begins)
   */
  async startAssault(siegeAttemptId: string, request: StartAssaultRequest = {}): Promise<StartAssaultResponse> {
    const response = await api.post<{ data: StartAssaultResponse }>(
      `/conquest/sieges/${siegeAttemptId}/start-assault`,
      request
    );
    return response.data.data;
  },

  /**
   * Complete a conquest attempt (resolve siege outcome)
   */
  async completeConquest(siegeAttemptId: string, request: CompleteConquestRequest): Promise<CompleteConquestResponse> {
    const response = await api.post<{ data: CompleteConquestResponse }>(
      `/conquest/sieges/${siegeAttemptId}/complete`,
      request
    );
    return response.data.data;
  },

  /**
   * Cancel a pending siege
   */
  async cancelSiege(siegeAttemptId: string): Promise<CancelSiegeResponse> {
    const response = await api.post<{ data: CancelSiegeResponse }>(
      `/conquest/sieges/${siegeAttemptId}/cancel`
    );
    return response.data.data;
  },

  // ===== Siege Queries =====

  /**
   * Get all active sieges
   */
  async getActiveSieges(): Promise<ActiveSiegesResponse> {
    const response = await api.get<{ data: ActiveSiegesResponse }>('/conquest/sieges/active');
    return response.data.data;
  },

  /**
   * Get conquest history for a territory
   */
  async getConquestHistory(territoryId: string): Promise<ConquestHistoryResponse> {
    const response = await api.get<{ data: ConquestHistoryResponse }>(
      `/conquest/territories/${territoryId}/history`
    );
    return response.data.data;
  },

  /**
   * Get faction conquest statistics
   */
  async getFactionStatistics(factionId: TerritoryFactionId): Promise<ConquestStatistics> {
    const response = await api.get<{ data: FactionStatisticsResponse }>(
      `/conquest/factions/${factionId}/statistics`
    );
    return response.data.data.statistics;
  },

  // ===== Territory State Management (Admin/System) =====

  /**
   * Initialize conquest state for a territory
   */
  async initializeTerritoryState(
    territoryId: string,
    request: InitializeTerritoryStateRequest
  ): Promise<InitializeTerritoryStateResponse> {
    const response = await api.post<{ data: InitializeTerritoryStateResponse }>(
      `/conquest/territories/${territoryId}/initialize`,
      request
    );
    return response.data.data;
  },

  /**
   * Update occupation statuses for all territories
   */
  async updateOccupationStatuses(): Promise<UpdateOccupationStatusesResponse> {
    const response = await api.post<{ data: UpdateOccupationStatusesResponse }>(
      '/conquest/update-occupation-statuses'
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if character can afford siege declaration
   */
  canAffordSiege(
    characterGold: number,
    characterSupplies: number,
    characterTroops: number,
    requiredResources: ConquestResources
  ): boolean {
    return (
      characterGold >= requiredResources.gold &&
      characterSupplies >= requiredResources.supplies &&
      characterTroops >= requiredResources.troops
    );
  },

  /**
   * Calculate total defense bonus from fortifications
   */
  calculateTotalDefenseBonus(fortifications: TerritoryFortification[]): number {
    return fortifications.reduce((total, fort) => {
      // Only count fortifications at >0% health
      if (fort.healthPercentage > 0) {
        return total + fort.defenseBonus;
      }
      return total;
    }, 0);
  },

  /**
   * Calculate resistance strength from activities
   */
  calculateResistanceStrength(activities: ResistanceActivity[]): number {
    return activities
      .filter(activity => activity.active)
      .reduce((total, activity) => total + activity.strength, 0);
  },

  /**
   * Filter sieges by stage
   */
  filterSiegesByStage(sieges: ConquestAttempt[], stage: ConquestStage): ConquestAttempt[] {
    return sieges.filter(siege => siege.stage === stage);
  },

  /**
   * Filter sieges by status
   */
  filterSiegesByStatus(sieges: ConquestAttempt[], status: ConquestAttemptStatus): ConquestAttempt[] {
    return sieges.filter(siege => siege.status === status);
  },

  /**
   * Get sieges for a specific faction (attacking or defending)
   */
  getSiegesForFaction(sieges: ConquestAttempt[], factionId: TerritoryFactionId): ConquestAttempt[] {
    return sieges.filter(
      siege => siege.attackingFaction === factionId || siege.defendingFaction === factionId
    );
  },

  /**
   * Calculate estimated siege duration based on resources
   */
  calculateSiegeDuration(resources: ConquestResources, defaultHours: number = 48): number {
    // Higher resource commitment = longer siege can be sustained
    const resourceScore = resources.gold / 1000 + resources.supplies / 100 + resources.troops / 10;
    const durationModifier = Math.min(resourceScore / 100, 2); // Max 2x duration
    return Math.floor(defaultHours * (1 + durationModifier));
  },

  /**
   * Format control change for display
   */
  formatControlChange(change: ControlChange): string {
    const date = new Date(change.changedAt).toLocaleDateString();
    return `${change.previousController} → ${change.newController} (${change.method}) on ${date}`;
  },

  /**
   * Check if siege is in progress
   */
  isSiegeInProgress(siege: ConquestAttempt): boolean {
    return (
      siege.status === ConquestAttemptStatus.ACTIVE ||
      siege.stage === ConquestStage.ASSAULT
    );
  },

  /**
   * Check if siege can be cancelled
   */
  canCancelSiege(siege: ConquestAttempt): boolean {
    return (
      siege.status === ConquestAttemptStatus.PENDING &&
      siege.stage !== ConquestStage.ASSAULT
    );
  },

  /**
   * Get time until siege starts (in hours)
   */
  getTimeUntilSiege(siege: ConquestAttempt): number | null {
    if (!siege.warEventId && siege.status === ConquestAttemptStatus.PENDING) {
      const now = new Date().getTime();
      const declared = new Date(siege.declaredAt).getTime();
      const elapsed = (now - declared) / (1000 * 60 * 60); // Convert to hours
      const warningPeriod = 24; // Default warning period
      return Math.max(0, warningPeriod - elapsed);
    }
    return null;
  },
};

export default conquestService;
