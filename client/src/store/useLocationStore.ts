/**
 * Location Store
 * Centralized state management for location page and related components
 */

import { create } from 'zustand';
import { api } from '@/services/api';
import { actionService } from '@/services/action.service';
import { npcService } from '@/services/npc.service';
import { skillTrainingService, type TrainingResult, type ActivitiesResponse } from '@/services/skillTraining.service';
import { logger } from '@/services/logger.service';
import { useErrorStore } from '@/store/useErrorStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { dispatchJobCompleted } from '@/utils/tutorialEvents';
import type { Action, NPC, Location as SharedLocation } from '@desperados/shared';
import type { GameState, DeckGameResult, ActionResult } from '@/components/game/deckgames/DeckGame';

// Types
export interface LocationJob {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldownMinutes: number;
  rewards: {
    goldMin: number;
    goldMax: number;
    xp: number;
    items?: string[];
  };
  requirements?: {
    minLevel?: number;
    requiredSkill?: string;
    skillLevel?: number;
  };
}

export interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  requiredLevel?: number;
}

export interface LocationShop {
  id: string;
  name: string;
  description: string;
  shopType: string;
  items: ShopItem[];
}

export interface LocationNPC {
  id: string;
  name: string;
  title?: string;
  description: string;
  faction?: string;
  dialogue?: string[];
  quests?: string[];
}

export interface LocationConnection {
  targetLocationId: string;
  energyCost: number;
  description?: string;
}

export type WorldZoneType =
  | 'settler_territory'
  | 'sangre_canyon'
  | 'coalition_lands'
  | 'outlaw_territory'
  | 'frontier'
  | 'ranch_country'
  | 'sacred_mountains';

export interface ZoneInfo {
  id: WorldZoneType;
  name: string;
  description: string;
  icon: string;
  theme: string;
  dangerRange: [number, number];
  primaryFaction: 'settler' | 'nahi' | 'frontera' | 'neutral';
}

export interface ZoneExit {
  zone: WorldZoneType;
  hub: LocationData;
  energyCost: number;
}

export interface ZoneTravelOptions {
  localConnections: LocationData[];
  zoneExits: ZoneExit[];
  currentZone: WorldZoneType | null;
  zoneInfo: ZoneInfo | null;
}

export interface LocationData {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  type: string;
  region: string;
  parentId?: string;
  icon?: string;
  atmosphere?: string;
  features?: string[];
  jobs: LocationJob[];
  shops: LocationShop[];
  npcs: LocationNPC[];
  connections: LocationConnection[];
  dangerLevel: number;
  factionInfluence: {
    settlerAlliance: number;
    nahiCoalition: number;
    frontera: number;
  };
  connectedLocations?: LocationData[];
}

export interface TownBuilding {
  id: string;
  name: string;
  type: string;
  description: string;
  icon?: string;
  isOpen: boolean;
}

export interface LocationActions {
  crimes: Action[];
  combat: Action[];
  craft: Action[];
  social: Action[];
  global: Action[];
}

export interface JobInfo {
  id: string;
  name: string;
  description: string;
  jobCategory: string;
  energyCost: number;
  rewards: any;
}

export type ActivityTab = 'overview' | 'jobs' | 'crimes' | 'train' | 'craft' | 'gather' | 'shop' | 'travel';

interface LocationState {
  // Core location data
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;

  // Activity tab
  activeTab: ActivityTab;

  // Buildings
  buildings: TownBuilding[];
  buildingsLoading: boolean;
  selectedBuilding: TownBuilding | null;

  // Zone travel
  zoneTravelOptions: ZoneTravelOptions | null;
  allLocations: SharedLocation[];
  travelingTo: string | null;

  // Location actions
  locationActions: LocationActions | null;
  actionsLoading: boolean;
  actionsExpanded: Record<string, boolean>;
  selectedAction: Action | null;

  // Jobs
  performingJob: string | null;
  jobResult: any;
  activeJobGame: GameState | null;
  activeJobInfo: JobInfo | null;

  // Shops
  selectedShop: LocationShop | null;
  purchaseResult: any;

  // NPCs
  selectedNPC: LocationNPC | null;

  // Hostile NPCs
  hostileNPCs: NPC[];
  hostilesLoading: boolean;
  selectedCombatNPC: NPC | null;

  // Training (Academy)
  trainingData: ActivitiesResponse | null;
  trainingLoading: boolean;
  performingTraining: string | null;
  trainingResult: TrainingResult | null;

  // Actions
  fetchLocation: () => Promise<void>;
  fetchBuildings: (locationId: string) => Promise<void>;
  fetchZoneTravelOptions: () => Promise<void>;
  fetchAllLocations: () => Promise<void>;
  fetchLocationActions: () => Promise<void>;
  fetchHostileNPCs: () => Promise<void>;
  fetchTrainingActivities: () => Promise<void>;

  setActiveTab: (tab: ActivityTab) => void;
  setSelectedBuilding: (building: TownBuilding | null) => void;
  setActionsExpanded: (key: string, expanded: boolean) => void;
  setSelectedAction: (action: Action | null) => void;
  setSelectedShop: (shop: LocationShop | null) => void;
  setSelectedNPC: (npc: LocationNPC | null) => void;
  setSelectedCombatNPC: (npc: NPC | null) => void;

  handleEnterBuilding: (buildingId: string) => Promise<void>;
  handleExitBuilding: () => Promise<void>;
  handleTravel: (targetId: string) => Promise<void>;
  handlePerformJob: (jobId: string) => Promise<void>;
  handleJobGameComplete: (result: { gameResult: DeckGameResult; actionResult?: ActionResult }) => void;
  handleJobForfeit: () => void;
  handlePurchase: (shopId: string, itemId: string) => Promise<void>;
  handlePerformTraining: (activityId: string) => Promise<void>;
  interactWithNPC: (npcId: string) => Promise<void>;

  clearJobResult: () => void;
  clearPurchaseResult: () => void;
  clearTrainingResult: () => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  // Initial state
  location: null,
  isLoading: true,
  error: null,

  activeTab: 'overview',

  buildings: [],
  buildingsLoading: false,
  selectedBuilding: null,

  zoneTravelOptions: null,
  allLocations: [],
  travelingTo: null,

  locationActions: null,
  actionsLoading: false,
  actionsExpanded: {
    crimes: true,
    combat: true,
    craft: false,
    social: false,
    global: false,
  },
  selectedAction: null,

  performingJob: null,
  jobResult: null,
  activeJobGame: null,
  activeJobInfo: null,

  selectedShop: null,
  purchaseResult: null,

  selectedNPC: null,

  hostileNPCs: [],
  hostilesLoading: false,
  selectedCombatNPC: null,

  trainingData: null,
  trainingLoading: false,
  performingTraining: null,
  trainingResult: null,

  // Fetch functions
  fetchLocation: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/locations/current');
      const locationData = response.data.data.location;
      set({ location: locationData, isLoading: false });

      // Fetch location-specific data
      if (locationData?._id) {
        const { fetchBuildings, fetchZoneTravelOptions, fetchAllLocations, fetchLocationActions, fetchHostileNPCs, fetchTrainingActivities } = get();
        fetchBuildings(locationData._id);
        fetchZoneTravelOptions();
        fetchAllLocations();
        fetchLocationActions();
        fetchHostileNPCs();

        if (locationData.type === 'skill_academy') {
          fetchTrainingActivities();
        }
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to load location',
        isLoading: false
      });
    }
  },

  fetchBuildings: async (locationId: string) => {
    try {
      set({ buildingsLoading: true });
      const response = await api.get(`/locations/${locationId}/buildings`);
      if (response.data.success && response.data.data?.buildings) {
        set({ buildings: response.data.data.buildings });
      } else {
        set({ buildings: [] });
      }
    } catch (err: any) {
      logger.error('Failed to fetch buildings', err, { locationId });
      set({ buildings: [] });
    } finally {
      set({ buildingsLoading: false });
    }
  },

  fetchZoneTravelOptions: async () => {
    try {
      const response = await api.get('/locations/current/travel-options');
      if (response.data.success && response.data.data) {
        set({ zoneTravelOptions: response.data.data });
      }
    } catch (err: any) {
      logger.error('Failed to fetch zone travel options', err);
      set({ zoneTravelOptions: null });
    }
  },

  fetchAllLocations: async () => {
    try {
      const response = await api.get('/locations');
      if (response.data.success && response.data.data?.locations) {
        set({ allLocations: response.data.data.locations });
      }
    } catch (err: any) {
      logger.error('Failed to fetch all locations', err);
      set({ allLocations: [] });
    }
  },

  fetchLocationActions: async () => {
    try {
      set({ actionsLoading: true });
      const response = await actionService.getFilteredLocationActions();
      if (response.success && response.data) {
        set({ locationActions: response.data.actions });
      }
    } catch (err: any) {
      logger.error('Failed to fetch location actions', err);
    } finally {
      set({ actionsLoading: false });
    }
  },

  fetchHostileNPCs: async () => {
    try {
      set({ hostilesLoading: true });
      const response = await api.get('/locations/current/hostiles');
      if (response.data.success && response.data.data?.npcs) {
        set({ hostileNPCs: response.data.data.npcs });
      } else {
        set({ hostileNPCs: [] });
      }
    } catch (err: any) {
      logger.error('Failed to fetch hostile NPCs', err);
      set({ hostileNPCs: [] });
    } finally {
      set({ hostilesLoading: false });
    }
  },

  fetchTrainingActivities: async () => {
    try {
      set({ trainingLoading: true });
      const data = await skillTrainingService.getActivities('skill_academy');
      set({ trainingData: data });
    } catch (err: any) {
      logger.error('Failed to fetch training activities', err);
      set({ trainingData: null });
    } finally {
      set({ trainingLoading: false });
    }
  },

  // Setters
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),
  setActionsExpanded: (key, expanded) => set((state) => ({
    actionsExpanded: { ...state.actionsExpanded, [key]: expanded }
  })),
  setSelectedAction: (action) => set({ selectedAction: action }),
  setSelectedShop: (shop) => set({ selectedShop: shop }),
  setSelectedNPC: (npc) => set({ selectedNPC: npc }),
  setSelectedCombatNPC: (npc) => set({ selectedCombatNPC: npc }),

  // Handlers
  handleEnterBuilding: async (buildingId: string) => {
    try {
      await api.post(`/locations/buildings/${buildingId}/enter`);
      set({ selectedBuilding: null });
      await get().fetchLocation();
    } catch (err: any) {
      logger.error('Failed to enter building', err, { buildingId });
    }
  },

  handleExitBuilding: async () => {
    try {
      await api.post('/locations/buildings/exit');
      await get().fetchLocation();
    } catch (err: any) {
      logger.error('Failed to exit building', err);
      set({ error: err.response?.data?.message || 'Failed to exit building' });
    }
  },

  handleTravel: async (targetId: string) => {
    try {
      set({ travelingTo: targetId });
      const response = await api.post('/locations/travel', { targetLocationId: targetId });
      const newLocation = response.data.data.result.newLocation;
      set({ location: newLocation, travelingTo: null });

      // Refetch data for new location
      if (newLocation?._id) {
        const { fetchBuildings, fetchZoneTravelOptions, fetchLocationActions, fetchHostileNPCs } = get();
        fetchBuildings(newLocation._id);
        fetchZoneTravelOptions();
        fetchLocationActions();
        fetchHostileNPCs();
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to travel',
        travelingTo: null
      });
    }
  },

  handlePerformJob: async (jobId: string) => {
    try {
      set({ performingJob: jobId, jobResult: null });
      const response = await api.post(`/locations/current/jobs/${jobId}/start`);
      const { gameState, availableActions, jobInfo } = response.data.data;
      set({
        activeJobGame: { ...gameState, availableActions },
        activeJobInfo: jobInfo,
        performingJob: null,
      });
    } catch (err: any) {
      useErrorStore.getState().clearErrors();
      set({
        jobResult: {
          success: false,
          message: err.response?.data?.message || 'Failed to start job'
        },
        performingJob: null,
      });
    }
  },

  handleJobGameComplete: (result) => {
    const { activeJobInfo } = get();

    if (result.actionResult) {
      set({
        jobResult: {
          success: result.actionResult.success,
          goldEarned: result.actionResult.rewardsGained.gold,
          xpEarned: result.actionResult.rewardsGained.xp,
          items: result.actionResult.rewardsGained.items,
          message: `You completed ${result.actionResult.actionName} and earned $${result.actionResult.rewardsGained.gold} and ${result.actionResult.rewardsGained.xp} XP!`,
          score: result.gameResult.score,
          handName: result.gameResult.handName,
        },
      });
    }

    // Dispatch tutorial event
    if (activeJobInfo?.id) {
      const normalizedJobId = activeJobInfo.id.replace(/_/g, '-');
      dispatchJobCompleted(normalizedJobId);
    }

    set({ activeJobGame: null, activeJobInfo: null });

    // Sync location with character store to keep sidebar in sync
    const location = get().location;
    if (location?._id) {
      const { updateCharacter } = useCharacterStore.getState();
      updateCharacter({ locationId: location._id });
    }
  },

  handleJobForfeit: () => {
    set({
      activeJobGame: null,
      activeJobInfo: null,
      jobResult: {
        success: false,
        message: 'Job cancelled - no energy spent'
      },
    });
  },

  handlePurchase: async (shopId: string, itemId: string) => {
    try {
      set({ purchaseResult: null });
      const response = await api.post(`/locations/current/shops/${shopId}/purchase`, { itemId });
      set({ purchaseResult: response.data.data.result });
    } catch (err: any) {
      set({
        purchaseResult: {
          success: false,
          message: err.response?.data?.message || 'Failed to purchase item'
        }
      });
    }
  },

  handlePerformTraining: async (activityId: string) => {
    try {
      set({ performingTraining: activityId, trainingResult: null });
      const result = await skillTrainingService.performTraining(activityId);
      set({ trainingResult: result });
      await get().fetchTrainingActivities();
    } catch (err: any) {
      logger.error('Failed to perform training', err);
      set({
        trainingResult: {
          success: false,
          message: err.response?.data?.error || 'Training failed',
          activityId,
          activityName: '',
          skillId: '',
          skillName: '',
          resultCategory: 'failure',
          skillRoll: 0,
          difficultyClass: 0,
          isCritical: false,
          skillXpGained: 0,
          characterXpGained: 0,
          goldGained: 0,
          cooldownEndsAt: '',
          energySpent: 0,
        }
      });
    } finally {
      set({ performingTraining: null });
    }
  },

  interactWithNPC: async (npcId: string) => {
    try {
      await npcService.interactWithNPC(npcId);
    } catch (err: any) {
      logger.debug('NPC interaction failed (possibly low energy)', { error: err.message });
    }
  },

  // Clear functions
  clearJobResult: () => set({ jobResult: null }),
  clearPurchaseResult: () => set({ purchaseResult: null }),
  clearTrainingResult: () => set({ trainingResult: null }),
  clearError: () => set({ error: null }),
}));

export default useLocationStore;
