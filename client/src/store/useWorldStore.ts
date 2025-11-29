/**
 * World Store
 * Zustand store for world state management
 */

import { create } from 'zustand';
import apiClient from '../services/api';

// Types
export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
  locationId?: string;
  isGlobal: boolean;
  scheduledStart: Date;
  scheduledEnd: Date;
  participantCount: number;
  maxParticipants?: number;
  worldEffects: {
    type: string;
    target: string;
    value: number;
    description: string;
  }[];
  participationRewards: {
    type: string;
    amount: number;
  }[];
  newsHeadline?: string;
}

export interface WorldState {
  currentWeather: string;
  weatherEffects: {
    travelTimeModifier: number;
    combatModifier: number;
    energyCostModifier: number;
    visibilityModifier: number;
    encounterModifier: number;
  };
  nextWeatherChange: Date;
  weatherForecast: { time: Date; weather: string }[];
  gameHour: number;
  gameDay: number;
  gameMonth: number;
  gameYear: number;
  timeOfDay: string;
  currentHeadlines: string[];
  recentGossip: { text: string; location?: string; age: number }[];
  factionPower: {
    faction: string;
    power: number;
    trend: string;
  }[];
}

interface WorldStoreState {
  // State
  worldState: WorldState | null;
  activeEvents: WorldEvent[];
  upcomingEvents: WorldEvent[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;

  // Actions
  fetchWorldState: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  joinEvent: (eventId: string) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useWorldStore = create<WorldStoreState>((set, get) => ({
  // Initial state
  worldState: null,
  activeEvents: [],
  upcomingEvents: [],
  isLoading: false,
  error: null,
  lastUpdate: null,

  // Actions
  fetchWorldState: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/world/state');
      if (response.data.success) {
        set({
          worldState: response.data.data.worldState,
          isLoading: false,
          lastUpdate: new Date(),
        });
      } else {
        set({ error: response.data.error, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch world state', isLoading: false });
    }
  },

  fetchEvents: async () => {
    try {
      const [activeRes, upcomingRes] = await Promise.all([
        apiClient.get('/world/events/active'),
        apiClient.get('/world/events/upcoming'),
      ]);

      set({
        activeEvents: activeRes.data.success ? activeRes.data.data.events : [],
        upcomingEvents: upcomingRes.data.success ? upcomingRes.data.data.events : [],
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch events' });
    }
  },

  joinEvent: async (eventId: string) => {
    try {
      const response = await apiClient.post(`/world/events/${eventId}/join`);
      if (response.data.success) {
        // Refresh events
        get().fetchEvents();
        return { success: true, message: response.data.data.message };
      }
      return { success: false, message: response.data.error || 'Failed to join event' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to join event' };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useWorldStore;
