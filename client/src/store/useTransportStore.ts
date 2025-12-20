/**
 * Transport Store
 * Manages train and stagecoach transportation state
 */

import { create } from 'zustand';
import { trainService } from '@/services/train.service';
import { stagecoachService } from '@/services/stagecoach.service';
import { logger } from '@/services/logger.service';
import type {
  TrainRoute,
  TrainSchedule,
  TrainTicket,
  TrainRobberyPlan,
  PinkertonPursuit,
  TicketClass,
  RobberyApproach,
  RobberyEquipment,
} from '@/services/train.service';
import type {
  StagecoachRoute,
  StagecoachTicket,
  WayStation,
  AmbushSpot,
  AmbushPlan,
} from '@/services/stagecoach.service';

interface TransportState {
  // Train state
  trainRoutes: TrainRoute[];
  trainSchedules: TrainSchedule[];
  myTrainTickets: TrainTicket[];
  activeTrainTicket: TrainTicket | null;
  robberyPlans: TrainRobberyPlan[];
  activePursuit: PinkertonPursuit | null;

  // Stagecoach state
  stagecoachRoutes: StagecoachRoute[];
  wayStations: WayStation[];
  activeStagecoachTicket: StagecoachTicket | null;
  travelHistory: StagecoachTicket[];
  ambushPlan: AmbushPlan | null;
  ambushSpots: AmbushSpot[];

  // UI state
  isLoading: boolean;
  isTrainLoading: boolean;
  isStagecoachLoading: boolean;
  error: string | null;
  selectedTrainRoute: string | null;
  selectedStagecoachRoute: string | null;

  // Train actions
  loadTrainData: () => Promise<void>;
  loadTrainRoutes: () => Promise<void>;
  loadTrainSchedules: () => Promise<void>;
  loadMyTrainTickets: (includeUsed?: boolean) => Promise<void>;
  purchaseTrainTicket: (
    origin: string,
    destination: string,
    ticketClass: TicketClass,
    departureTime?: Date | string
  ) => Promise<TrainTicket | null>;
  boardTrain: (ticketId: string) => Promise<boolean>;
  refundTrainTicket: (ticketId: string) => Promise<{ success: boolean; refundAmount: number }>;

  // Train robbery actions
  loadRobberyPlans: () => Promise<void>;
  loadActivePursuit: () => Promise<void>;
  scoutTrain: (trainId: string, departureTime?: Date | string) => Promise<any>;
  planRobbery: (
    trainId: string,
    departureTime: Date | string,
    approach: RobberyApproach,
    targetLocation: string,
    gangMemberIds: string[],
    equipment: RobberyEquipment[]
  ) => Promise<TrainRobberyPlan | null>;
  executeRobbery: (robberyId: string) => Promise<any>;

  // Stagecoach actions
  loadStagecoachData: () => Promise<void>;
  loadStagecoachRoutes: () => Promise<void>;
  loadWayStations: () => Promise<void>;
  loadActiveStagecoachTicket: () => Promise<void>;
  loadTravelHistory: () => Promise<void>;
  bookStagecoach: (
    routeId: string,
    departureLocationId: string,
    destinationLocationId: string,
    departureTime?: Date | string,
    luggageWeight?: number,
    weaponDeclared?: boolean
  ) => Promise<StagecoachTicket | null>;
  cancelStagecoachTicket: (ticketId: string) => Promise<{ success: boolean; refundAmount: number }>;
  getJourneyProgress: (ticketId: string) => Promise<any>;

  // Stagecoach ambush actions
  loadAmbushSpots: (routeId: string) => Promise<void>;
  loadActivePlan: () => Promise<void>;
  setupAmbush: (
    routeId: string,
    ambushSpotId: string,
    scheduledTime: Date | string,
    gangMemberIds?: string[],
    strategy?: 'roadblock' | 'canyon_trap' | 'bridge_sabotage' | 'surprise_attack'
  ) => Promise<AmbushPlan | null>;
  executeAmbush: (stagecoachId: string) => Promise<any>;
  cancelAmbush: () => Promise<boolean>;
  defendStagecoach: (stagecoachId: string) => Promise<any>;

  // UI actions
  setSelectedTrainRoute: (routeId: string | null) => void;
  setSelectedStagecoachRoute: (routeId: string | null) => void;
  clearError: () => void;
  resetStore: () => void;
}

const initialState = {
  trainRoutes: [],
  trainSchedules: [],
  myTrainTickets: [],
  activeTrainTicket: null,
  robberyPlans: [],
  activePursuit: null,
  stagecoachRoutes: [],
  wayStations: [],
  activeStagecoachTicket: null,
  travelHistory: [],
  ambushPlan: null,
  ambushSpots: [],
  isLoading: false,
  isTrainLoading: false,
  isStagecoachLoading: false,
  error: null,
  selectedTrainRoute: null,
  selectedStagecoachRoute: null,
};

export const useTransportStore = create<TransportState>((set, get) => ({
  ...initialState,

  // ===== Train Actions =====

  loadTrainData: async () => {
    set({ isTrainLoading: true, error: null });
    try {
      const [routes, schedules, tickets, pursuit] = await Promise.all([
        trainService.getRoutes(),
        trainService.getSchedules(),
        trainService.getMyTickets(false),
        trainService.getActivePursuit(),
      ]);

      set({
        trainRoutes: routes,
        trainSchedules: schedules,
        myTrainTickets: tickets,
        activePursuit: pursuit,
        activeTrainTicket: tickets.find((t) => t.status === 'VALID') || null,
        isTrainLoading: false,
      });
    } catch (error: any) {
      logger.error('Failed to load train data', error as Error, { context: 'useTransportStore.loadTrainData' });
      set({
        isTrainLoading: false,
        error: error.message || 'Failed to load train data',
      });
    }
  },

  loadTrainRoutes: async () => {
    try {
      const routes = await trainService.getRoutes();
      set({ trainRoutes: routes });
    } catch (error: any) {
      logger.error('Failed to load train routes', error as Error, { context: 'useTransportStore.loadTrainRoutes' });
      set({ error: error.message || 'Failed to load train routes' });
    }
  },

  loadTrainSchedules: async () => {
    try {
      const schedules = await trainService.getSchedules();
      set({ trainSchedules: schedules });
    } catch (error: any) {
      logger.error('Failed to load train schedules', error as Error, { context: 'useTransportStore.loadTrainSchedules' });
      set({ error: error.message || 'Failed to load train schedules' });
    }
  },

  loadMyTrainTickets: async (includeUsed = false) => {
    try {
      const tickets = await trainService.getMyTickets(includeUsed);
      set({
        myTrainTickets: tickets,
        activeTrainTicket: tickets.find((t) => t.status === 'VALID') || null,
      });
    } catch (error: any) {
      logger.error('Failed to load train tickets', error as Error, { context: 'useTransportStore.loadMyTrainTickets' });
      set({ error: error.message || 'Failed to load train tickets' });
    }
  },

  purchaseTrainTicket: async (origin, destination, ticketClass, departureTime) => {
    set({ isLoading: true, error: null });
    try {
      const response = await trainService.purchaseTicket({
        origin,
        destination,
        ticketClass,
        departureTime,
      });

      if (response.success && response.ticket) {
        // Reload tickets to get updated list
        await get().loadMyTrainTickets();
        set({ isLoading: false });
        return response.ticket;
      }

      throw new Error(response.message || 'Failed to purchase ticket');
    } catch (error: any) {
      logger.error('Failed to purchase train ticket', error as Error, { context: 'useTransportStore.purchaseTrainTicket' });
      set({
        isLoading: false,
        error: error.message || 'Failed to purchase ticket',
      });
      return null;
    }
  },

  boardTrain: async (ticketId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await trainService.boardTrain(ticketId);

      if (response.success) {
        await get().loadMyTrainTickets();
        set({ isLoading: false });
        return true;
      }

      throw new Error(response.message || 'Failed to board train');
    } catch (error: any) {
      logger.error('Failed to board train', error as Error, { context: 'useTransportStore.boardTrain' });
      set({
        isLoading: false,
        error: error.message || 'Failed to board train',
      });
      return false;
    }
  },

  refundTrainTicket: async (ticketId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await trainService.refundTicket(ticketId);

      if (response.success) {
        await get().loadMyTrainTickets();
        set({ isLoading: false });
        return { success: true, refundAmount: response.refundAmount };
      }

      throw new Error(response.message || 'Failed to refund ticket');
    } catch (error: any) {
      logger.error('Failed to refund train ticket', error as Error, { context: 'useTransportStore.refundTrainTicket' });
      set({
        isLoading: false,
        error: error.message || 'Failed to refund ticket',
      });
      return { success: false, refundAmount: 0 };
    }
  },

  // ===== Train Robbery Actions =====

  loadRobberyPlans: async () => {
    try {
      const plans = await trainService.getRobberyPlans();
      set({ robberyPlans: plans });
    } catch (error: any) {
      logger.error('Failed to load robbery plans', error as Error, { context: 'useTransportStore.loadRobberyPlans' });
      set({ error: error.message || 'Failed to load robbery plans' });
    }
  },

  loadActivePursuit: async () => {
    try {
      const pursuit = await trainService.getActivePursuit();
      set({ activePursuit: pursuit });
    } catch (error: any) {
      logger.error('Failed to load active pursuit', error as Error, { context: 'useTransportStore.loadActivePursuit' });
      set({ error: error.message || 'Failed to load pursuit status' });
    }
  },

  scoutTrain: async (trainId, departureTime) => {
    set({ isLoading: true, error: null });
    try {
      const response = await trainService.scoutTrain({ trainId, departureTime });
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      logger.error('Failed to scout train', error as Error, { context: 'useTransportStore.scoutTrain' });
      set({
        isLoading: false,
        error: error.message || 'Failed to scout train',
      });
      return null;
    }
  },

  planRobbery: async (trainId, departureTime, approach, targetLocation, gangMemberIds, equipment) => {
    set({ isLoading: true, error: null });
    try {
      const response = await trainService.planRobbery({
        trainId,
        departureTime,
        approach,
        targetLocation,
        gangMemberIds,
        equipment,
      });

      if (response.success && response.plan) {
        await get().loadRobberyPlans();
        set({ isLoading: false });
        return response.plan;
      }

      throw new Error(response.message || 'Failed to plan robbery');
    } catch (error: any) {
      logger.error('Failed to plan robbery', error as Error, { context: 'useTransportStore.planRobbery' });
      set({
        isLoading: false,
        error: error.message || 'Failed to plan robbery',
      });
      return null;
    }
  },

  executeRobbery: async (robberyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await trainService.executeRobbery(robberyId);

      // Reload pursuit status after robbery
      await get().loadActivePursuit();
      await get().loadRobberyPlans();

      set({ isLoading: false });
      return response;
    } catch (error: any) {
      logger.error('Failed to execute robbery', error as Error, { context: 'useTransportStore.executeRobbery' });
      set({
        isLoading: false,
        error: error.message || 'Failed to execute robbery',
      });
      return null;
    }
  },

  // ===== Stagecoach Actions =====

  loadStagecoachData: async () => {
    set({ isStagecoachLoading: true, error: null });
    try {
      const [routes, wayStations, activeTicket, history] = await Promise.all([
        stagecoachService.getRoutes(),
        stagecoachService.getWayStations(),
        stagecoachService.getActiveTicket(),
        stagecoachService.getTravelHistory(),
      ]);

      set({
        stagecoachRoutes: routes,
        wayStations: wayStations,
        activeStagecoachTicket: activeTicket,
        travelHistory: history,
        isStagecoachLoading: false,
      });
    } catch (error: any) {
      logger.error('Failed to load stagecoach data', error as Error, { context: 'useTransportStore.loadStagecoachData' });
      set({
        isStagecoachLoading: false,
        error: error.message || 'Failed to load stagecoach data',
      });
    }
  },

  loadStagecoachRoutes: async () => {
    try {
      const routes = await stagecoachService.getRoutes();
      set({ stagecoachRoutes: routes });
    } catch (error: any) {
      logger.error('Failed to load stagecoach routes', error as Error, { context: 'useTransportStore.loadStagecoachRoutes' });
      set({ error: error.message || 'Failed to load stagecoach routes' });
    }
  },

  loadWayStations: async () => {
    try {
      const wayStations = await stagecoachService.getWayStations();
      set({ wayStations: wayStations });
    } catch (error: any) {
      logger.error('Failed to load way stations', error as Error, { context: 'useTransportStore.loadWayStations' });
      set({ error: error.message || 'Failed to load way stations' });
    }
  },

  loadActiveStagecoachTicket: async () => {
    try {
      const ticket = await stagecoachService.getActiveTicket();
      set({ activeStagecoachTicket: ticket });
    } catch (error: any) {
      logger.error('Failed to load active ticket', error as Error, { context: 'useTransportStore.loadActiveStagecoachTicket' });
      set({ error: error.message || 'Failed to load active ticket' });
    }
  },

  loadTravelHistory: async () => {
    try {
      const history = await stagecoachService.getTravelHistory();
      set({ travelHistory: history });
    } catch (error: any) {
      logger.error('Failed to load travel history', error as Error, { context: 'useTransportStore.loadTravelHistory' });
      set({ error: error.message || 'Failed to load travel history' });
    }
  },

  bookStagecoach: async (routeId, departureLocationId, destinationLocationId, departureTime, luggageWeight, weaponDeclared) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stagecoachService.bookTicket({
        routeId,
        departureLocationId,
        destinationLocationId,
        departureTime,
        luggageWeight,
        weaponDeclared,
      });

      if (response.success && response.ticket) {
        set({
          activeStagecoachTicket: response.ticket,
          isLoading: false,
        });
        return response.ticket;
      }

      throw new Error(response.message || 'Failed to book stagecoach');
    } catch (error: any) {
      logger.error('Failed to book stagecoach', error as Error, { context: 'useTransportStore.bookStagecoach' });
      set({
        isLoading: false,
        error: error.message || 'Failed to book stagecoach',
      });
      return null;
    }
  },

  cancelStagecoachTicket: async (ticketId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stagecoachService.cancelTicket(ticketId);

      if (response.success) {
        set({
          activeStagecoachTicket: null,
          isLoading: false,
        });
        return { success: true, refundAmount: response.refundAmount };
      }

      throw new Error(response.message || 'Failed to cancel ticket');
    } catch (error: any) {
      logger.error('Failed to cancel stagecoach ticket', error as Error, { context: 'useTransportStore.cancelStagecoachTicket' });
      set({
        isLoading: false,
        error: error.message || 'Failed to cancel ticket',
      });
      return { success: false, refundAmount: 0 };
    }
  },

  getJourneyProgress: async (ticketId) => {
    try {
      const progress = await stagecoachService.getProgress(ticketId);
      return progress;
    } catch (error: any) {
      logger.error('Failed to get journey progress', error as Error, { context: 'useTransportStore.getJourneyProgress' });
      return null;
    }
  },

  // ===== Stagecoach Ambush Actions =====

  loadAmbushSpots: async (routeId) => {
    try {
      const spots = await stagecoachService.getAmbushSpots(routeId);
      set({ ambushSpots: spots });
    } catch (error: any) {
      logger.error('Failed to load ambush spots', error as Error, { context: 'useTransportStore.loadAmbushSpots' });
      set({ error: error.message || 'Failed to load ambush spots' });
    }
  },

  loadActivePlan: async () => {
    try {
      const plan = await stagecoachService.getActivePlan();
      set({ ambushPlan: plan });
    } catch (error: any) {
      logger.error('Failed to load active ambush plan', error as Error, { context: 'useTransportStore.loadActivePlan' });
      set({ error: error.message || 'Failed to load ambush plan' });
    }
  },

  setupAmbush: async (routeId, ambushSpotId, scheduledTime, gangMemberIds, strategy) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stagecoachService.setupAmbush({
        routeId,
        ambushSpotId,
        scheduledTime,
        gangMemberIds,
        strategy,
      });

      if (response.success && response.plan) {
        set({
          ambushPlan: response.plan,
          isLoading: false,
        });
        return response.plan;
      }

      throw new Error(response.message || 'Failed to setup ambush');
    } catch (error: any) {
      logger.error('Failed to setup ambush', error as Error, { context: 'useTransportStore.setupAmbush' });
      set({
        isLoading: false,
        error: error.message || 'Failed to setup ambush',
      });
      return null;
    }
  },

  executeAmbush: async (stagecoachId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stagecoachService.executeAmbush(stagecoachId);

      set({
        ambushPlan: null,
        isLoading: false,
      });

      return response;
    } catch (error: any) {
      logger.error('Failed to execute ambush', error as Error, { context: 'useTransportStore.executeAmbush' });
      set({
        isLoading: false,
        error: error.message || 'Failed to execute ambush',
      });
      return null;
    }
  },

  cancelAmbush: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stagecoachService.cancelAmbush();

      if (response.success) {
        set({
          ambushPlan: null,
          isLoading: false,
        });
        return true;
      }

      throw new Error(response.message || 'Failed to cancel ambush');
    } catch (error: any) {
      logger.error('Failed to cancel ambush', error as Error, { context: 'useTransportStore.cancelAmbush' });
      set({
        isLoading: false,
        error: error.message || 'Failed to cancel ambush',
      });
      return false;
    }
  },

  defendStagecoach: async (stagecoachId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stagecoachService.defendStagecoach(stagecoachId);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      logger.error('Failed to defend stagecoach', error as Error, { context: 'useTransportStore.defendStagecoach' });
      set({
        isLoading: false,
        error: error.message || 'Failed to defend stagecoach',
      });
      return null;
    }
  },

  // ===== UI Actions =====

  setSelectedTrainRoute: (routeId) => {
    set({ selectedTrainRoute: routeId });
  },

  setSelectedStagecoachRoute: (routeId) => {
    set({ selectedStagecoachRoute: routeId });
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set(initialState);
  },
}));

export default useTransportStore;
