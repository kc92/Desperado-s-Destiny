/**
 * useStagecoach Hook
 * Handles stagecoach travel, ticket booking, and ambush operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

/**
 * Stagecoach route information
 */
export interface StagecoachRoute {
  routeId: string;
  name: string;
  startLocation: string;
  endLocation: string;
  wayStations: WayStation[];
  distance: number;
  basePrice: number;
  travelTime: number; // in game hours
  terrain: 'plains' | 'desert' | 'mountains' | 'forest' | 'mixed';
  dangerLevel: 'safe' | 'moderate' | 'dangerous' | 'lawless';
}

/**
 * Way station along a stagecoach route
 */
export interface WayStation {
  stationId: string;
  name: string;
  locationId: string;
  order: number;
  distanceFromStart: number;
  hasLodging: boolean;
  hasStable: boolean;
  hasStore: boolean;
  description: string;
}

/**
 * Stagecoach ticket
 */
export interface StagecoachTicket {
  ticketId: string;
  characterId: string;
  routeId: string;
  routeName: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  estimatedArrival: string;
  ticketClass: 'basic' | 'standard' | 'premium';
  price: number;
  status: 'booked' | 'in_progress' | 'completed' | 'cancelled' | 'ambushed';
  bookedAt: string;
  boardedAt?: string;
  completedAt?: string;
  currentWayStation?: string;
  passengers: number;
}

/**
 * Travel history entry
 */
export interface TravelHistoryEntry {
  ticketId: string;
  routeName: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  arrivalTime: string;
  ticketClass: 'basic' | 'standard' | 'premium';
  price: number;
  status: 'completed' | 'cancelled' | 'ambushed';
  incidents: TravelIncident[];
}

/**
 * Travel incident that occurred during a journey
 */
export interface TravelIncident {
  type: 'bandit_attack' | 'weather_delay' | 'mechanical_issue' | 'wildlife_encounter' | 'robbery';
  description: string;
  outcome: 'escaped' | 'delayed' | 'fought_off' | 'robbed' | 'injured';
  timestamp: string;
}

/**
 * Ambush spot information
 */
export interface AmbushSpot {
  spotId: string;
  name: string;
  description: string;
  routeId: string;
  distanceFromStart: number;
  terrain: 'canyon' | 'bridge' | 'forest' | 'river_crossing' | 'hillside';
  coverQuality: 'poor' | 'moderate' | 'good' | 'excellent';
  escapeRoutes: number;
  visibility: 'low' | 'medium' | 'high';
  lawPresence: 'none' | 'patrol' | 'stationed';
  bestTimeOfDay: 'dawn' | 'day' | 'dusk' | 'night' | 'any';
}

/**
 * Ambush setup configuration
 */
export interface AmbushSetup {
  ambushId: string;
  spotId: string;
  routeId: string;
  targetTime: string;
  participants: AmbushParticipant[];
  strategy: 'quick_hit' | 'full_robbery' | 'kidnapping' | 'cargo_only';
  positions: AmbushPosition[];
  signalMethod: 'whistle' | 'gunshot' | 'flag' | 'fire';
  escapeRoute: string;
  status: 'setting_up' | 'ready' | 'in_progress' | 'completed' | 'failed' | 'aborted';
}

/**
 * Participant in an ambush
 */
export interface AmbushParticipant {
  characterId: string;
  characterName: string;
  role: 'leader' | 'gunner' | 'lookout' | 'driver_stopper' | 'loot_collector';
  ready: boolean;
}

/**
 * Position assignment in ambush
 */
export interface AmbushPosition {
  participantId: string;
  position: 'front' | 'left' | 'right' | 'rear' | 'elevated';
  coverType: 'rock' | 'tree' | 'building' | 'wagon' | 'none';
}

/**
 * Ambush execution result
 */
export interface AmbushResult {
  success: boolean;
  lootObtained: AmbushLoot[];
  totalValue: number;
  wantedLevelIncrease: number;
  injuries: InjuryReport[];
  casualties: CasualtyReport[];
  passengersRobbed: number;
  guardsDefeated: number;
  driverStatus: 'cooperated' | 'fled' | 'fought' | 'killed';
  coachStatus: 'captured' | 'escaped' | 'destroyed';
  witnesses: number;
  pursuitStatus: 'none' | 'delayed' | 'immediate';
  experienceGained: number;
  reputationChanges: ReputationChange[];
}

/**
 * Loot from ambush
 */
export interface AmbushLoot {
  itemId: string;
  itemName: string;
  quantity: number;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'valuable' | 'precious';
}

/**
 * Injury report from ambush
 */
export interface InjuryReport {
  characterId: string;
  characterName: string;
  injuryType: 'minor' | 'moderate' | 'severe' | 'critical';
  description: string;
  healingTime: number; // in game hours
}

/**
 * Casualty report from ambush
 */
export interface CasualtyReport {
  characterId?: string;
  characterName?: string;
  isNPC: boolean;
  npcType?: 'guard' | 'passenger' | 'driver';
  cause: string;
}

/**
 * Reputation change from ambush
 */
export interface ReputationChange {
  factionId: string;
  factionName: string;
  change: number;
  reason: string;
}

/**
 * Action result type
 */
interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Hook return type
 */
interface UseStagecoachReturn {
  // State
  routes: StagecoachRoute[];
  wayStations: WayStation[];
  activeTicket: StagecoachTicket | null;
  travelHistory: TravelHistoryEntry[];
  ambushSpots: AmbushSpot[];
  currentAmbush: AmbushSetup | null;
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchRoutes: () => Promise<void>;
  fetchWayStations: (routeId?: string) => Promise<void>;
  fetchActiveTicket: () => Promise<void>;
  fetchTravelHistory: () => Promise<void>;
  fetchAmbushSpots: (routeId: string) => Promise<void>;

  // Ticket operations
  bookTicket: (
    routeId: string,
    departureLocation: string,
    arrivalLocation: string,
    ticketClass?: 'basic' | 'standard' | 'premium'
  ) => Promise<ActionResult<StagecoachTicket>>;
  cancelTicket: (ticketId: string) => Promise<ActionResult>;

  // Ambush operations
  setupAmbush: (
    spotId: string,
    targetTime: string,
    strategy: 'quick_hit' | 'full_robbery' | 'kidnapping' | 'cargo_only',
    participants?: string[]
  ) => Promise<ActionResult<AmbushSetup>>;
  executeAmbush: (ambushId: string) => Promise<ActionResult<AmbushResult>>;

  // UI helpers
  clearActiveTicket: () => void;
  clearAmbushSpots: () => void;
  clearCurrentAmbush: () => void;
  clearError: () => void;
}

/**
 * Stagecoach travel and ambush hook
 */
export const useStagecoach = (): UseStagecoachReturn => {
  const [routes, setRoutes] = useState<StagecoachRoute[]>([]);
  const [wayStations, setWayStations] = useState<WayStation[]>([]);
  const [activeTicket, setActiveTicket] = useState<StagecoachTicket | null>(null);
  const [travelHistory, setTravelHistory] = useState<TravelHistoryEntry[]>([]);
  const [ambushSpots, setAmbushSpots] = useState<AmbushSpot[]>([]);
  const [currentAmbush, setCurrentAmbush] = useState<AmbushSetup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  /**
   * Fetch all stagecoach routes
   */
  const fetchRoutes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { routes: StagecoachRoute[] } }>('/stagecoach/routes');
      setRoutes(response.data.data.routes || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch stagecoach routes';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch way stations
   */
  const fetchWayStations = useCallback(async (routeId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = routeId
        ? `/stagecoach/way-stations?routeId=${routeId}`
        : '/stagecoach/way-stations';
      const response = await api.get<{ data: { wayStations: WayStation[] } }>(url);
      setWayStations(response.data.data.wayStations || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch way stations';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch active ticket for current character
   */
  const fetchActiveTicket = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { ticket: StagecoachTicket | null } }>(
        '/stagecoach/tickets/active'
      );
      setActiveTicket(response.data.data.ticket);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch active ticket';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch travel history
   */
  const fetchTravelHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { history: TravelHistoryEntry[] } }>(
        '/stagecoach/tickets/history'
      );
      setTravelHistory(response.data.data.history || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch travel history';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch ambush spots for a route
   */
  const fetchAmbushSpots = useCallback(async (routeId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { spots: AmbushSpot[] } }>(
        `/stagecoach/ambush/spots/${routeId}`
      );
      setAmbushSpots(response.data.data.spots || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch ambush spots';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Book a stagecoach ticket
   */
  const bookTicket = useCallback(
    async (
      routeId: string,
      departureLocation: string,
      arrivalLocation: string,
      ticketClass: 'basic' | 'standard' | 'premium' = 'standard'
    ): Promise<ActionResult<StagecoachTicket>> => {
      try {
        const response = await api.post<{ data: { message: string; ticket: StagecoachTicket } }>(
          '/stagecoach/tickets/book',
          { routeId, departureLocation, arrivalLocation, ticketClass }
        );
        await refreshCharacter();
        await fetchActiveTicket();
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.ticket,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to book ticket';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchActiveTicket]
  );

  /**
   * Cancel a stagecoach ticket
   */
  const cancelTicket = useCallback(
    async (ticketId: string): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/stagecoach/tickets/${ticketId}/cancel`
        );
        await refreshCharacter();
        await fetchActiveTicket();
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to cancel ticket';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchActiveTicket]
  );

  /**
   * Setup an ambush
   */
  const setupAmbush = useCallback(
    async (
      spotId: string,
      targetTime: string,
      strategy: 'quick_hit' | 'full_robbery' | 'kidnapping' | 'cargo_only',
      participants: string[] = []
    ): Promise<ActionResult<AmbushSetup>> => {
      try {
        const response = await api.post<{ data: { message: string; ambush: AmbushSetup } }>(
          '/stagecoach/ambush/setup',
          { spotId, targetTime, strategy, participants }
        );
        setCurrentAmbush(response.data.data.ambush);
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.ambush,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to setup ambush';
        return { success: false, message: errorMessage };
      }
    },
    []
  );

  /**
   * Execute an ambush
   */
  const executeAmbush = useCallback(
    async (ambushId: string): Promise<ActionResult<AmbushResult>> => {
      try {
        const response = await api.post<{ data: { message: string; result: AmbushResult } }>(
          '/stagecoach/ambush/execute',
          { ambushId }
        );
        await refreshCharacter();
        setCurrentAmbush(null);
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.result,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to execute ambush';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter]
  );

  /**
   * Clear active ticket
   */
  const clearActiveTicket = useCallback(() => {
    setActiveTicket(null);
  }, []);

  /**
   * Clear ambush spots
   */
  const clearAmbushSpots = useCallback(() => {
    setAmbushSpots([]);
  }, []);

  /**
   * Clear current ambush
   */
  const clearCurrentAmbush = useCallback(() => {
    setCurrentAmbush(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    routes,
    wayStations,
    activeTicket,
    travelHistory,
    ambushSpots,
    currentAmbush,
    isLoading,
    error,

    // Fetch operations
    fetchRoutes,
    fetchWayStations,
    fetchActiveTicket,
    fetchTravelHistory,
    fetchAmbushSpots,

    // Ticket operations
    bookTicket,
    cancelTicket,

    // Ambush operations
    setupAmbush,
    executeAmbush,

    // UI helpers
    clearActiveTicket,
    clearAmbushSpots,
    clearCurrentAmbush,
    clearError,
  };
};

export default useStagecoach;
