/**
 * Building Store
 * Zustand store for building system state management
 */

import { create } from 'zustand';
import { buildingService, Building, BuildingWithStatus, BuildingNPC } from '../services/building.service';

interface BuildingStore {
  // State
  buildings: BuildingWithStatus[];
  currentBuilding: Building | null;
  selectedNPC: BuildingNPC | null;
  isLoading: boolean;
  error: string | null;
  activeTab: 'actions' | 'shops' | 'jobs' | 'npcs';
  activityFeed: BuildingActivity[];

  // Actions
  fetchBuildingsInTown: (townId: string) => Promise<void>;
  enterBuilding: (buildingId: string) => Promise<boolean>;
  exitBuilding: () => Promise<boolean>;
  selectNPC: (npc: BuildingNPC | null) => void;
  setActiveTab: (tab: 'actions' | 'shops' | 'jobs' | 'npcs') => void;
  addActivity: (activity: BuildingActivity) => void;
  clearError: () => void;
  reset: () => void;
}

export interface BuildingActivity {
  id: string;
  type: 'enter' | 'exit' | 'purchase' | 'job' | 'crime' | 'arrest' | 'fight';
  buildingId: string;
  buildingName: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

export const useBuildingStore = create<BuildingStore>((set, get) => ({
  // Initial state
  buildings: [],
  currentBuilding: null,
  selectedNPC: null,
  isLoading: false,
  error: null,
  activeTab: 'actions',
  activityFeed: [],

  // Actions
  fetchBuildingsInTown: async (townId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await buildingService.getBuildingsInTown(townId);
      if (response.success && response.data) {
        set({ buildings: response.data.buildings, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch buildings', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch buildings', isLoading: false });
    }
  },

  enterBuilding: async (buildingId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await buildingService.enterBuilding(buildingId);
      if (response.success && response.data) {
        set({
          currentBuilding: response.data.building,
          isLoading: false,
          activeTab: 'actions',
        });

        // Add activity
        get().addActivity({
          id: Date.now().toString(),
          type: 'enter',
          buildingId: response.data.building._id,
          buildingName: response.data.building.name,
          playerName: 'You',
          message: `entered ${response.data.building.name}`,
          timestamp: new Date(),
        });

        return true;
      } else {
        set({ error: response.error || 'Failed to enter building', isLoading: false });
        return false;
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to enter building', isLoading: false });
      return false;
    }
  },

  exitBuilding: async () => {
    const { currentBuilding } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await buildingService.exitBuilding();
      if (response.success) {
        // Add activity before clearing
        if (currentBuilding) {
          get().addActivity({
            id: Date.now().toString(),
            type: 'exit',
            buildingId: currentBuilding._id,
            buildingName: currentBuilding.name,
            playerName: 'You',
            message: `left ${currentBuilding.name}`,
            timestamp: new Date(),
          });
        }

        set({
          currentBuilding: null,
          selectedNPC: null,
          isLoading: false,
        });
        return true;
      } else {
        set({ error: response.error || 'Failed to exit building', isLoading: false });
        return false;
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to exit building', isLoading: false });
      return false;
    }
  },

  selectNPC: (npc: BuildingNPC | null) => {
    set({ selectedNPC: npc });
  },

  setActiveTab: (tab: 'actions' | 'shops' | 'jobs' | 'npcs') => {
    set({ activeTab: tab });
  },

  addActivity: (activity: BuildingActivity) => {
    set((state) => ({
      activityFeed: [activity, ...state.activityFeed].slice(0, 50), // Keep last 50
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      buildings: [],
      currentBuilding: null,
      selectedNPC: null,
      isLoading: false,
      error: null,
      activeTab: 'actions',
      activityFeed: [],
    });
  },
}));

export default useBuildingStore;
