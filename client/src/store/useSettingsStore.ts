/**
 * Settings Store
 * Manages user preferences including sound and music settings
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  // Sound settings
  soundEnabled: boolean;
  soundVolume: number; // 0-1

  // Music settings
  musicEnabled: boolean;
  musicVolume: number; // 0-1

  // UI settings
  reducedMotion: boolean;
  showAnimations: boolean;

  // Notification settings
  notificationSoundsEnabled: boolean;

  // Actions
  toggleSound: () => void;
  setSoundVolume: (volume: number) => void;
  toggleMusic: () => void;
  setMusicVolume: (volume: number) => void;
  toggleReducedMotion: () => void;
  toggleAnimations: () => void;
  toggleNotificationSounds: () => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  soundVolume: 0.7,
  musicEnabled: true,
  musicVolume: 0.5,
  reducedMotion: false,
  showAnimations: true,
  notificationSoundsEnabled: true,
};

/**
 * Zustand store for user settings with persistence
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Initial state
      ...DEFAULT_SETTINGS,

      /**
       * Toggle sound effects on/off
       */
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      /**
       * Set sound effects volume (0-1)
       */
      setSoundVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ soundVolume: clampedVolume });
      },

      /**
       * Toggle background music on/off
       */
      toggleMusic: () => {
        set((state) => ({ musicEnabled: !state.musicEnabled }));
      },

      /**
       * Set background music volume (0-1)
       */
      setMusicVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ musicVolume: clampedVolume });
      },

      /**
       * Toggle reduced motion preference
       */
      toggleReducedMotion: () => {
        set((state) => ({ reducedMotion: !state.reducedMotion }));
      },

      /**
       * Toggle animations on/off
       */
      toggleAnimations: () => {
        set((state) => ({ showAnimations: !state.showAnimations }));
      },

      /**
       * Toggle notification sounds on/off
       */
      toggleNotificationSounds: () => {
        set((state) => ({ notificationSoundsEnabled: !state.notificationSoundsEnabled }));
      },

      /**
       * Reset all settings to defaults
       */
      resetSettings: () => {
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: 'desperados-settings', // Key in localStorage
      version: 1,
    }
  )
);

export default useSettingsStore;
