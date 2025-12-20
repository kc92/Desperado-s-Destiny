/**
 * Faction War Service
 * API client for faction war events and participation
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import api from './api';
import type {
  FactionWarEvent,
  WarEventType,
  WarPhase,
  WarEventStatus,
  WarParticipant,
  WarObjective,
  WarEventTemplate,
  FactionWarStatistics,
  WarEventSummary,
  WarLeaderboardEntry,
  WarReward,
  ObjectivePriority,
  ContributionType,
} from '@shared/types/factionWar.types';
import type { TerritoryFactionId } from '@shared/types/territoryWar.types';

// ===== Types =====

/**
 * Request to create war event from template
 */
export interface CreateWarEventRequest {
  templateId: string;
  attackingFaction: TerritoryFactionId;
  defendingFaction: TerritoryFactionId;
  targetTerritory: string;
  customStartTime?: string; // ISO date string
}

/**
 * Request to join war event
 */
export interface JoinWarEventRequest {
  side: TerritoryFactionId;
}

// ===== Response Types =====

export interface ActiveEventsResponse {
  events: FactionWarEvent[];
  total: number;
}

export interface UpcomingEventsResponse {
  events: FactionWarEvent[];
  total: number;
}

export interface WarEventDetailsResponse {
  event: FactionWarEvent;
  participants: WarParticipant[];
  leaderboard: WarLeaderboardEntry[];
}

export interface WarStatisticsResponse {
  statistics: FactionWarStatistics;
}

export interface CreateWarEventResponse {
  success: boolean;
  event: FactionWarEvent;
  message: string;
}

export interface JoinWarEventResponse {
  success: boolean;
  participant: WarParticipant;
  currentPhase: WarPhase;
  timeUntilStart?: number; // Minutes
  message: string;
}

export interface UpdateEventPhasesResponse {
  success: boolean;
  updated: number;
  phaseChanges: Array<{
    eventId: string;
    oldPhase: WarPhase;
    newPhase: WarPhase;
  }>;
  message: string;
}

export interface ResolveWarEventResponse {
  success: boolean;
  event: FactionWarEvent;
  winner: TerritoryFactionId;
  rewards: {
    victors: WarReward[];
    defeated: WarReward[];
    mvp: WarReward[];
  };
  message: string;
}

// ===== Faction War Service =====

export const factionWarService = {
  // ===== War Event Queries =====

  /**
   * Get all active war events
   */
  async getActiveEvents(): Promise<ActiveEventsResponse> {
    const response = await api.get<{ data: ActiveEventsResponse }>('/faction-wars/active');
    return response.data.data;
  },

  /**
   * Get upcoming war events
   */
  async getUpcomingEvents(): Promise<UpcomingEventsResponse> {
    const response = await api.get<{ data: UpcomingEventsResponse }>('/faction-wars/upcoming');
    return response.data.data;
  },

  /**
   * Get war event details with participants
   */
  async getWarEventDetails(warEventId: string): Promise<WarEventDetailsResponse> {
    const response = await api.get<{ data: WarEventDetailsResponse }>(`/faction-wars/${warEventId}`);
    return response.data.data;
  },

  /**
   * Get war event statistics
   */
  async getWarStatistics(warEventId: string): Promise<FactionWarStatistics> {
    const response = await api.get<{ data: WarStatisticsResponse }>(
      `/faction-wars/${warEventId}/statistics`
    );
    return response.data.data.statistics;
  },

  // ===== War Event Creation =====

  /**
   * Create a new war event from template
   */
  async createWarEvent(request: CreateWarEventRequest): Promise<CreateWarEventResponse> {
    const response = await api.post<{ data: CreateWarEventResponse }>('/faction-wars', request);
    return response.data.data;
  },

  // ===== War Participation =====

  /**
   * Join a war event
   */
  async joinWarEvent(warEventId: string, request: JoinWarEventRequest): Promise<JoinWarEventResponse> {
    const response = await api.post<{ data: JoinWarEventResponse }>(
      `/faction-wars/${warEventId}/join`,
      request
    );
    return response.data.data;
  },

  // ===== War Event Management (Admin/System) =====

  /**
   * Update war event phases (cron job)
   */
  async updateEventPhases(): Promise<UpdateEventPhasesResponse> {
    const response = await api.post<{ data: UpdateEventPhasesResponse }>('/faction-wars/update-phases');
    return response.data.data;
  },

  /**
   * Manually resolve a war event
   */
  async resolveWarEvent(warEventId: string): Promise<ResolveWarEventResponse> {
    const response = await api.post<{ data: ResolveWarEventResponse }>(
      `/faction-wars/${warEventId}/resolve`
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if event is joinable
   */
  isEventJoinable(event: FactionWarEvent): boolean {
    return (
      event.status === WarEventStatus.SCHEDULED &&
      event.currentPhase === WarPhase.MOBILIZATION
    );
  },

  /**
   * Check if event is active
   */
  isEventActive(event: FactionWarEvent): boolean {
    return (
      event.status === WarEventStatus.ACTIVE &&
      event.currentPhase === WarPhase.ACTIVE_COMBAT
    );
  },

  /**
   * Get time until event starts (in minutes)
   */
  getTimeUntilStart(event: FactionWarEvent): number {
    const now = new Date().getTime();
    const start = new Date(event.startsAt).getTime();
    const diff = start - now;
    return Math.max(0, Math.floor(diff / (1000 * 60)));
  },

  /**
   * Get time remaining in event (in minutes)
   */
  getTimeRemaining(event: FactionWarEvent): number {
    const now = new Date().getTime();
    const end = new Date(event.endsAt).getTime();
    const diff = end - now;
    return Math.max(0, Math.floor(diff / (1000 * 60)));
  },

  /**
   * Calculate event progress percentage
   */
  calculateEventProgress(event: FactionWarEvent): number {
    const start = new Date(event.startsAt).getTime();
    const end = new Date(event.endsAt).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  },

  /**
   * Filter events by type
   */
  filterEventsByType(events: FactionWarEvent[], type: WarEventType): FactionWarEvent[] {
    return events.filter(event => event.eventType === type);
  },

  /**
   * Filter events by phase
   */
  filterEventsByPhase(events: FactionWarEvent[], phase: WarPhase): FactionWarEvent[] {
    return events.filter(event => event.currentPhase === phase);
  },

  /**
   * Get events for a specific faction
   */
  getEventsForFaction(events: FactionWarEvent[], factionId: TerritoryFactionId): FactionWarEvent[] {
    return events.filter(
      event => event.attackingFaction === factionId || event.defendingFaction === factionId
    );
  },

  /**
   * Calculate objective completion percentage
   */
  calculateObjectiveProgress(objective: WarObjective): number {
    if (objective.target === 0) return 0;
    return Math.min(100, (objective.current / objective.target) * 100);
  },

  /**
   * Get completed objectives
   */
  getCompletedObjectives(objectives: WarObjective[]): WarObjective[] {
    return objectives.filter(obj => obj.completed);
  },

  /**
   * Get incomplete objectives
   */
  getIncompleteObjectives(objectives: WarObjective[]): WarObjective[] {
    return objectives.filter(obj => !obj.completed);
  },

  /**
   * Filter objectives by priority
   */
  filterObjectivesByPriority(objectives: WarObjective[], priority: ObjectivePriority): WarObjective[] {
    return objectives.filter(obj => obj.priority === priority);
  },

  /**
   * Calculate total score for a side
   */
  calculateSideScore(participants: WarParticipant[]): number {
    return participants.reduce((total, participant) => total + participant.totalScore, 0);
  },

  /**
   * Get top performers by contribution type
   */
  getTopPerformersByType(
    participants: WarParticipant[],
    type: ContributionType,
    limit: number = 10
  ): WarParticipant[] {
    return [...participants]
      .sort((a, b) => b.contributionBreakdown[type] - a.contributionBreakdown[type])
      .slice(0, limit);
  },

  /**
   * Get MVP candidates
   */
  getMVPCandidates(participants: WarParticipant[]): WarParticipant[] {
    return participants.filter(p => p.mvpCandidate);
  },

  /**
   * Calculate participant's rank
   */
  calculateParticipantRank(participant: WarParticipant, allParticipants: WarParticipant[]): number {
    const sorted = [...allParticipants].sort((a, b) => b.totalScore - a.totalScore);
    return sorted.findIndex(p => p.characterId === participant.characterId) + 1;
  },

  /**
   * Format event duration for display
   */
  formatEventDuration(event: FactionWarEvent): string {
    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
    return `${hours}h`;
  },

  /**
   * Check if character is participating
   */
  isParticipating(event: FactionWarEvent, characterId: string): boolean {
    return (
      event.attackerParticipants.some(p => p.characterId === characterId) ||
      event.defenderParticipants.some(p => p.characterId === characterId)
    );
  },

  /**
   * Get participant by character ID
   */
  getParticipant(event: FactionWarEvent, characterId: string): WarParticipant | undefined {
    return (
      event.attackerParticipants.find(p => p.characterId === characterId) ||
      event.defenderParticipants.find(p => p.characterId === characterId)
    );
  },

  /**
   * Get participants for a side
   */
  getParticipantsForSide(event: FactionWarEvent, side: 'attacker' | 'defender'): WarParticipant[] {
    return side === 'attacker' ? event.attackerParticipants : event.defenderParticipants;
  },

  /**
   * Calculate win probability based on scores
   */
  calculateWinProbability(attackerScore: number, defenderScore: number): {
    attackerChance: number;
    defenderChance: number;
  } {
    const total = attackerScore + defenderScore;
    if (total === 0) {
      return { attackerChance: 50, defenderChance: 50 };
    }
    return {
      attackerChance: Math.round((attackerScore / total) * 100),
      defenderChance: Math.round((defenderScore / total) * 100),
    };
  },

  /**
   * Format event summary for display
   */
  formatEventSummary(summary: WarEventSummary): string {
    const winner = summary.winner ? summary.winner : 'Unknown';
    const date = new Date(summary.startedAt).toLocaleDateString();
    return `${summary.eventName} (${summary.eventType}) - ${winner} victorious - ${date}`;
  },

  /**
   * Get all objectives combined
   */
  getAllObjectives(event: FactionWarEvent): WarObjective[] {
    return [
      ...event.primaryObjectives,
      ...event.secondaryObjectives,
      ...event.bonusObjectives,
    ];
  },

  /**
   * Calculate total potential points
   */
  calculateTotalPotentialPoints(event: FactionWarEvent): number {
    const allObjectives = this.getAllObjectives(event);
    return allObjectives.reduce((total, obj) => {
      return total + (obj.target * obj.pointsPerProgress) + obj.completionBonus;
    }, 0);
  },
};

export default factionWarService;
