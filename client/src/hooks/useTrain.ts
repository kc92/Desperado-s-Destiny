/**
 * useTrain Hook
 * Handles train travel, tickets, cargo shipping, and train robbery operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

/**
 * Train route information
 */
export interface TrainRoute {
  routeId: string;
  name: string;
  startLocation: string;
  endLocation: string;
  stops: TrainStop[];
  distance: number;
  basePrice: number;
  travelTime: number; // in game hours
}

/**
 * Train stop along a route
 */
export interface TrainStop {
  locationId: string;
  locationName: string;
  order: number;
  arrivalOffset: number; // minutes from departure
}

/**
 * Train schedule entry
 */
export interface TrainSchedule {
  scheduleId: string;
  routeId: string;
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed' | 'cancelled';
  availableSeats: number;
  trainClass: 'economy' | 'standard' | 'first_class' | 'luxury';
}

/**
 * Train ticket
 */
export interface TrainTicket {
  ticketId: string;
  characterId: string;
  routeId: string;
  routeName: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  arrivalTime: string;
  trainClass: 'economy' | 'standard' | 'first_class' | 'luxury';
  price: number;
  status: 'valid' | 'used' | 'expired' | 'refunded' | 'cancelled';
  purchasedAt: string;
  boardedAt?: string;
}

/**
 * Search parameters for trains
 */
export interface TrainSearchParams {
  fromLocation: string;
  toLocation: string;
  departureDate?: string;
  trainClass?: 'economy' | 'standard' | 'first_class' | 'luxury';
}

/**
 * Train search result
 */
export interface TrainSearchResult {
  scheduleId: string;
  routeId: string;
  routeName: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  arrivalTime: string;
  trainClass: 'economy' | 'standard' | 'first_class' | 'luxury';
  price: number;
  availableSeats: number;
  travelTime: number;
}

/**
 * Cargo shipping quote
 */
export interface CargoQuote {
  quoteId: string;
  fromLocation: string;
  toLocation: string;
  weight: number;
  itemType: string;
  price: number;
  estimatedDelivery: string;
  insurance: number;
  validUntil: string;
}

/**
 * Cargo shipment
 */
export interface CargoShipment {
  shipmentId: string;
  characterId: string;
  fromLocation: string;
  toLocation: string;
  items: CargoItem[];
  totalWeight: number;
  price: number;
  status: 'pending' | 'in_transit' | 'delivered' | 'lost' | 'stolen';
  shippedAt: string;
  estimatedDelivery: string;
  deliveredAt?: string;
}

/**
 * Item in cargo shipment
 */
export interface CargoItem {
  itemId: string;
  itemName: string;
  quantity: number;
  weight: number;
}

/**
 * Train robbery scout info
 */
export interface TrainScoutInfo {
  trainId: string;
  routeName: string;
  estimatedLoot: number;
  guardCount: number;
  passengerCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  bestAmbushPoints: AmbushPoint[];
  riskLevel: number;
  cargoValue: number;
}

/**
 * Ambush point for train robbery
 */
export interface AmbushPoint {
  pointId: string;
  name: string;
  description: string;
  coverBonus: number;
  escapeRoutes: number;
}

/**
 * Train robbery plan
 */
export interface TrainRobberyPlan {
  robberyId: string;
  trainId: string;
  ambushPointId: string;
  participants: string[];
  plannedTime: string;
  strategy: 'stealth' | 'aggressive' | 'distraction';
  targetCars: string[];
  escapeRoute: string;
  status: 'planning' | 'ready' | 'in_progress' | 'completed' | 'failed' | 'aborted';
}

/**
 * Train robbery result
 */
export interface TrainRobberyResult {
  success: boolean;
  lootObtained: LootItem[];
  totalValue: number;
  wantedLevelIncrease: number;
  injuries: string[];
  casualties: string[];
  witnesses: number;
  escapeStatus: 'clean' | 'pursued' | 'captured';
  experienceGained: number;
  reputationChange: number;
}

/**
 * Loot item from robbery
 */
export interface LootItem {
  itemId: string;
  itemName: string;
  quantity: number;
  value: number;
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
interface UseTrainReturn {
  // State
  routes: TrainRoute[];
  schedules: TrainSchedule[];
  searchResults: TrainSearchResult[];
  tickets: TrainTicket[];
  currentScoutInfo: TrainScoutInfo | null;
  currentRobberyPlan: TrainRobberyPlan | null;
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchRoutes: () => Promise<void>;
  fetchSchedules: (routeId?: string) => Promise<void>;
  searchTrains: (params: TrainSearchParams) => Promise<void>;
  fetchTickets: () => Promise<void>;

  // Ticket operations
  purchaseTicket: (
    scheduleId: string,
    trainClass?: 'economy' | 'standard' | 'first_class' | 'luxury'
  ) => Promise<ActionResult<TrainTicket>>;
  boardTrain: (ticketId: string) => Promise<ActionResult>;
  refundTicket: (ticketId: string) => Promise<ActionResult>;

  // Cargo operations
  getCargoQuote: (
    fromLocation: string,
    toLocation: string,
    items: { itemId: string; quantity: number }[]
  ) => Promise<ActionResult<CargoQuote>>;
  shipCargo: (
    quoteId: string,
    includeInsurance?: boolean
  ) => Promise<ActionResult<CargoShipment>>;

  // Robbery operations
  scoutTrain: (trainId: string) => Promise<ActionResult<TrainScoutInfo>>;
  planRobbery: (
    trainId: string,
    ambushPointId: string,
    strategy: 'stealth' | 'aggressive' | 'distraction',
    participants?: string[]
  ) => Promise<ActionResult<TrainRobberyPlan>>;
  executeRobbery: (robberyId: string) => Promise<ActionResult<TrainRobberyResult>>;

  // UI helpers
  clearSearchResults: () => void;
  clearScoutInfo: () => void;
  clearRobberyPlan: () => void;
  clearError: () => void;
}

/**
 * Train travel and robbery hook
 */
export const useTrain = (): UseTrainReturn => {
  const [routes, setRoutes] = useState<TrainRoute[]>([]);
  const [schedules, setSchedules] = useState<TrainSchedule[]>([]);
  const [searchResults, setSearchResults] = useState<TrainSearchResult[]>([]);
  const [tickets, setTickets] = useState<TrainTicket[]>([]);
  const [currentScoutInfo, setCurrentScoutInfo] = useState<TrainScoutInfo | null>(null);
  const [currentRobberyPlan, setCurrentRobberyPlan] = useState<TrainRobberyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  /**
   * Fetch all train routes
   */
  const fetchRoutes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { routes: TrainRoute[] } }>('/trains/routes');
      setRoutes(response.data.data.routes || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch train routes';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch train schedules
   */
  const fetchSchedules = useCallback(async (routeId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = routeId ? `/trains/schedules?routeId=${routeId}` : '/trains/schedules';
      const response = await api.get<{ data: { schedules: TrainSchedule[] } }>(url);
      setSchedules(response.data.data.schedules || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch train schedules';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Search for trains between locations
   */
  const searchTrains = useCallback(async (params: TrainSearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('fromLocation', params.fromLocation);
      queryParams.append('toLocation', params.toLocation);
      if (params.departureDate) queryParams.append('departureDate', params.departureDate);
      if (params.trainClass) queryParams.append('trainClass', params.trainClass);

      const response = await api.get<{ data: { results: TrainSearchResult[] } }>(
        `/trains/search?${queryParams.toString()}`
      );
      setSearchResults(response.data.data.results || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to search trains';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch character's tickets
   */
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { tickets: TrainTicket[] } }>('/trains/tickets');
      setTickets(response.data.data.tickets || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch tickets';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Purchase a train ticket
   */
  const purchaseTicket = useCallback(
    async (
      scheduleId: string,
      trainClass: 'economy' | 'standard' | 'first_class' | 'luxury' = 'standard'
    ): Promise<ActionResult<TrainTicket>> => {
      try {
        const response = await api.post<{ data: { message: string; ticket: TrainTicket } }>(
          '/trains/tickets/purchase',
          { scheduleId, trainClass }
        );
        await refreshCharacter();
        await fetchTickets();
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.ticket,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to purchase ticket';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchTickets]
  );

  /**
   * Board a train with a ticket
   */
  const boardTrain = useCallback(
    async (ticketId: string): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/trains/tickets/${ticketId}/board`
        );
        await refreshCharacter();
        await fetchTickets();
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to board train';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchTickets]
  );

  /**
   * Refund a train ticket
   */
  const refundTicket = useCallback(
    async (ticketId: string): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/trains/tickets/${ticketId}/refund`
        );
        await refreshCharacter();
        await fetchTickets();
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to refund ticket';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchTickets]
  );

  /**
   * Get a cargo shipping quote
   */
  const getCargoQuote = useCallback(
    async (
      fromLocation: string,
      toLocation: string,
      items: { itemId: string; quantity: number }[]
    ): Promise<ActionResult<CargoQuote>> => {
      try {
        const response = await api.post<{ data: { message: string; quote: CargoQuote } }>(
          '/trains/cargo/quote',
          { fromLocation, toLocation, items }
        );
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.quote,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get cargo quote';
        return { success: false, message: errorMessage };
      }
    },
    []
  );

  /**
   * Ship cargo
   */
  const shipCargo = useCallback(
    async (
      quoteId: string,
      includeInsurance: boolean = false
    ): Promise<ActionResult<CargoShipment>> => {
      try {
        const response = await api.post<{ data: { message: string; shipment: CargoShipment } }>(
          '/trains/cargo/ship',
          { quoteId, includeInsurance }
        );
        await refreshCharacter();
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.shipment,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to ship cargo';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter]
  );

  /**
   * Scout a train for robbery
   */
  const scoutTrain = useCallback(
    async (trainId: string): Promise<ActionResult<TrainScoutInfo>> => {
      try {
        const response = await api.post<{ data: { message: string; scoutInfo: TrainScoutInfo } }>(
          '/trains/robbery/scout',
          { trainId }
        );
        setCurrentScoutInfo(response.data.data.scoutInfo);
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.scoutInfo,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to scout train';
        return { success: false, message: errorMessage };
      }
    },
    []
  );

  /**
   * Plan a train robbery
   */
  const planRobbery = useCallback(
    async (
      trainId: string,
      ambushPointId: string,
      strategy: 'stealth' | 'aggressive' | 'distraction',
      participants: string[] = []
    ): Promise<ActionResult<TrainRobberyPlan>> => {
      try {
        const response = await api.post<{ data: { message: string; plan: TrainRobberyPlan } }>(
          '/trains/robbery/plan',
          { trainId, ambushPointId, strategy, participants }
        );
        setCurrentRobberyPlan(response.data.data.plan);
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.plan,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to plan robbery';
        return { success: false, message: errorMessage };
      }
    },
    []
  );

  /**
   * Execute a train robbery
   */
  const executeRobbery = useCallback(
    async (robberyId: string): Promise<ActionResult<TrainRobberyResult>> => {
      try {
        const response = await api.post<{ data: { message: string; result: TrainRobberyResult } }>(
          `/trains/robbery/${robberyId}/execute`
        );
        await refreshCharacter();
        setCurrentRobberyPlan(null);
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.result,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to execute robbery';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter]
  );

  /**
   * Clear search results
   */
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  /**
   * Clear scout info
   */
  const clearScoutInfo = useCallback(() => {
    setCurrentScoutInfo(null);
  }, []);

  /**
   * Clear robbery plan
   */
  const clearRobberyPlan = useCallback(() => {
    setCurrentRobberyPlan(null);
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
    schedules,
    searchResults,
    tickets,
    currentScoutInfo,
    currentRobberyPlan,
    isLoading,
    error,

    // Fetch operations
    fetchRoutes,
    fetchSchedules,
    searchTrains,
    fetchTickets,

    // Ticket operations
    purchaseTicket,
    boardTrain,
    refundTicket,

    // Cargo operations
    getCargoQuote,
    shipCargo,

    // Robbery operations
    scoutTrain,
    planRobbery,
    executeRobbery,

    // UI helpers
    clearSearchResults,
    clearScoutInfo,
    clearRobberyPlan,
    clearError,
  };
};

export default useTrain;
