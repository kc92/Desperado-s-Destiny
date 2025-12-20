/**
 * useFactionWar Hook
 * Manages faction war events and participation
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';

// Faction type
export type FactionId = 'settler' | 'nahi' | 'frontera' | 'outlaw' | 'neutral';

// War event type
export type WarEventType = 'TERRITORY_SKIRMISH' | 'RESOURCE_RAID' | 'FULL_ASSAULT' | 'BORDER_CONFLICT' | 'AMBUSH';

// War phase
export type WarPhase = 'ANNOUNCEMENT' | 'PREPARATION' | 'ACTIVE' | 'RESOLUTION' | 'AFTERMATH';

// War event status
export type WarEventStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// War objective
export interface WarObjective {
  id: string;
  name: string;
  description: string;
  type: 'primary' | 'secondary' | 'bonus';
  target: number;
  current: number;
  completed: boolean;
  reward: ObjectiveReward;
}

// Objective reward
export interface ObjectiveReward {
  experience: number;
  gold: number;
  reputation: number;
  items?: string[];
}

// War reward
export interface WarReward {
  type: 'VICTORY' | 'PARTICIPATION' | 'MVP' | 'OBJECTIVE';
  experience: number;
  gold: number;
  reputation: number;
  items: string[];
  unlocks?: string[];
}

// War participant
export interface WarParticipant {
  characterId: string;
  characterName: string;
  level: number;
  faction: FactionId;
  side: 'attacker' | 'defender';
  contribution: number;
  kills: number;
  deaths: number;
  objectivesCompleted: number;
  joinedAt: string;
}

// War event
export interface WarEvent {
  _id: string;
  eventType: WarEventType;
  name: string;
  description: string;
  lore?: string;
  attackingFaction: FactionId;
  defendingFaction: FactionId;
  alliedFactions: Record<FactionId, 'attacker' | 'defender'>;
  targetTerritory: string;
  adjacentTerritories: string[];
  announcedAt: string;
  startsAt: string;
  endsAt: string;
  currentPhase: WarPhase;
  primaryObjectives: WarObjective[];
  secondaryObjectives: WarObjective[];
  bonusObjectives: WarObjective[];
  attackerScore: number;
  defenderScore: number;
  totalParticipants: number;
  attackerCount: number;
  defenderCount: number;
  victoryRewards: WarReward[];
  participationRewards: WarReward[];
  mvpRewards: WarReward[];
  status: WarEventStatus;
  winner?: FactionId;
  casualties: { attacker: number; defender: number };
}

// War statistics
export interface WarStatistics {
  warEventId: string;
  totalParticipants: number;
  attackerParticipants: number;
  defenderParticipants: number;
  totalKills: number;
  totalDeaths: number;
  objectivesCompleted: number;
  totalObjectives: number;
  attackerScore: number;
  defenderScore: number;
  topContributors: {
    attacker: WarParticipant[];
    defender: WarParticipant[];
  };
  timeline: WarTimelineEvent[];
}

// Timeline event
export interface WarTimelineEvent {
  timestamp: string;
  type: string;
  description: string;
  faction?: FactionId;
  character?: string;
}

// Create war event request
export interface CreateWarEventRequest {
  templateId: string;
  attackingFaction: FactionId;
  defendingFaction: FactionId;
  targetTerritory: string;
  customStartTime?: string;
}

interface UseFactionWarReturn {
  activeEvents: WarEvent[];
  upcomingEvents: WarEvent[];
  currentEvent: WarEvent | null;
  isLoading: boolean;
  error: string | null;

  // Queries
  fetchActiveEvents: () => Promise<void>;
  fetchUpcomingEvents: () => Promise<void>;
  fetchWarEventDetails: (warEventId: string) => Promise<WarEvent | null>;
  fetchWarStatistics: (warEventId: string) => Promise<WarStatistics | null>;

  // Participation
  joinWarEvent: (warEventId: string, side: FactionId) => Promise<{ success: boolean; message: string; participant?: WarParticipant }>;

  // Management (Admin/System)
  createWarEvent: (request: CreateWarEventRequest) => Promise<{ success: boolean; message: string; event?: WarEvent }>;
  updateEventPhases: () => Promise<{ success: boolean; message: string; updated: number }>;
  resolveWarEvent: (warEventId: string) => Promise<{ success: boolean; message: string; winner?: FactionId }>;

  clearError: () => void;
}

export const useFactionWar = (): UseFactionWarReturn => {
  const [activeEvents, setActiveEvents] = useState<WarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<WarEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<WarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch all active war events
  const fetchActiveEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { events: WarEvent[] } }>('/faction-wars/active');
      setActiveEvents(response.data.data.events || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch active events';
      setError(errorMessage);
      logger.error('Fetch active events error', err as Error, { context: 'useFactionWar' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch upcoming war events
  const fetchUpcomingEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { events: WarEvent[] } }>('/faction-wars/upcoming');
      setUpcomingEvents(response.data.data.events || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch upcoming events';
      setError(errorMessage);
      logger.error('Fetch upcoming events error', err as Error, { context: 'useFactionWar' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch war event details
  const fetchWarEventDetails = useCallback(async (warEventId: string): Promise<WarEvent | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { event: WarEvent } }>(`/faction-wars/${warEventId}`);
      const event = response.data.data.event;
      setCurrentEvent(event);
      return event;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch event details';
      setError(errorMessage);
      logger.error('Fetch event details error', err as Error, { context: 'useFactionWar' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch war statistics
  const fetchWarStatistics = useCallback(async (warEventId: string): Promise<WarStatistics | null> => {
    try {
      const response = await api.get<{ data: { statistics: WarStatistics } }>(
        `/faction-wars/${warEventId}/statistics`
      );
      return response.data.data.statistics;
    } catch (err: any) {
      logger.error('Fetch statistics error', err as Error, { context: 'useFactionWar' });
      return null;
    }
  }, []);

  // Join a war event
  const joinWarEvent = useCallback(async (
    warEventId: string,
    side: FactionId
  ): Promise<{ success: boolean; message: string; participant?: WarParticipant }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: { message: string; participant: WarParticipant } }>(
        `/faction-wars/${warEventId}/join`,
        { side }
      );
      const { message, participant } = response.data.data;

      await refreshCharacter();

      return { success: true, message, participant };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to join war event';
      setError(errorMessage);
      logger.error('Join war event error', err as Error, { context: 'useFactionWar' });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  // Create a new war event (admin)
  const createWarEvent = useCallback(async (
    request: CreateWarEventRequest
  ): Promise<{ success: boolean; message: string; event?: WarEvent }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: { message: string; event: WarEvent } }>(
        '/faction-wars',
        request
      );
      const { message, event } = response.data.data;

      setUpcomingEvents(prev => [...prev, event]);

      return { success: true, message, event };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create war event';
      setError(errorMessage);
      logger.error('Create war event error', err as Error, { context: 'useFactionWar' });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update event phases (admin/cron)
  const updateEventPhases = useCallback(async (): Promise<{ success: boolean; message: string; updated: number }> => {
    try {
      const response = await api.post<{ data: { message: string; updated: number } }>(
        '/faction-wars/update-phases'
      );
      return { success: true, ...response.data.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update phases';
      return { success: false, message: errorMessage, updated: 0 };
    }
  }, []);

  // Resolve a war event (admin)
  const resolveWarEvent = useCallback(async (
    warEventId: string
  ): Promise<{ success: boolean; message: string; winner?: FactionId }> => {
    try {
      const response = await api.post<{ data: { message: string; winner: FactionId } }>(
        `/faction-wars/${warEventId}/resolve`
      );
      const { message, winner } = response.data.data;

      // Move from active to completed
      setActiveEvents(prev => prev.filter(e => e._id !== warEventId));

      return { success: true, message, winner };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to resolve war event';
      return { success: false, message: errorMessage };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    activeEvents,
    upcomingEvents,
    currentEvent,
    isLoading,
    error,
    fetchActiveEvents,
    fetchUpcomingEvents,
    fetchWarEventDetails,
    fetchWarStatistics,
    joinWarEvent,
    createWarEvent,
    updateEventPhases,
    resolveWarEvent,
    clearError,
  };
};

export default useFactionWar;
