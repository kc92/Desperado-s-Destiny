/**
 * Profile Store
 * Manages public profile viewing and stats
 */

import { create } from 'zustand';
import { profileService, PublicProfile, CharacterSearchResult } from '@/services/profile.service';
import { logger } from '@/services/logger.service';

interface ProfileStats {
  totalStats: number;
  winRate: number;
  highestStat: { name: string; value: number };
  isWanted: boolean;
  isInGang: boolean;
  isOnline: boolean;
  lastActiveDisplay: string;
}

interface ProfileStore {
  // State
  viewedProfile: PublicProfile | null;
  profileStats: ProfileStats | null;
  searchResults: CharacterSearchResult[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: (characterName: string) => Promise<void>;
  fetchProfileStats: (profile: PublicProfile) => void;
  updateProfile: (updates: Partial<PublicProfile>) => void;
  searchCharacters: (query: string) => Promise<void>;
  clearProfile: () => void;
  clearError: () => void;
  clearSearchResults: () => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  viewedProfile: null,
  profileStats: null,
  searchResults: [],
  isLoading: false,
  error: null,

  fetchProfile: async (characterName: string) => {
    set({ isLoading: true, error: null });

    try {
      const profile = await profileService.getPublicProfile(characterName);

      // Calculate stats immediately
      const stats: ProfileStats = {
        totalStats: profileService.getTotalStats(profile.stats),
        winRate: profileService.calculateWinRate(profile.combatRecord),
        highestStat: profileService.getHighestStat(profile.stats),
        isWanted: profileService.isWanted(profile),
        isInGang: profileService.isInGang(profile),
        isOnline: profileService.isOnline(profile.lastActive),
        lastActiveDisplay: profileService.getLastActiveDisplay(profile.lastActive),
      };

      set({
        viewedProfile: profile,
        profileStats: stats,
        isLoading: false,
        error: null,
      });

      logger.debug('Profile loaded successfully', {
        characterName,
        level: profile.level,
        faction: profile.faction,
      });
    } catch (error: any) {
      logger.error('Failed to fetch profile', error as Error, {
        context: 'useProfileStore.fetchProfile',
        characterName,
      });

      set({
        viewedProfile: null,
        profileStats: null,
        isLoading: false,
        error: error.message || 'Failed to load profile',
      });
    }
  },

  fetchProfileStats: (profile: PublicProfile) => {
    try {
      const stats: ProfileStats = {
        totalStats: profileService.getTotalStats(profile.stats),
        winRate: profileService.calculateWinRate(profile.combatRecord),
        highestStat: profileService.getHighestStat(profile.stats),
        isWanted: profileService.isWanted(profile),
        isInGang: profileService.isInGang(profile),
        isOnline: profileService.isOnline(profile.lastActive),
        lastActiveDisplay: profileService.getLastActiveDisplay(profile.lastActive),
      };

      set({ profileStats: stats });

      logger.debug('Profile stats calculated', {
        characterName: profile.name,
        totalStats: stats.totalStats,
        winRate: stats.winRate,
      });
    } catch (error: any) {
      logger.error('Failed to calculate profile stats', error as Error, {
        context: 'useProfileStore.fetchProfileStats',
        characterName: profile.name,
      });
    }
  },

  updateProfile: (updates: Partial<PublicProfile>) => {
    set((state) => {
      if (!state.viewedProfile) {
        logger.warn('Attempted to update profile when no profile is loaded', {
          context: 'useProfileStore.updateProfile',
        });
        return state;
      }

      const updatedProfile = { ...state.viewedProfile, ...updates };

      // Recalculate stats with updated profile
      const stats: ProfileStats = {
        totalStats: profileService.getTotalStats(updatedProfile.stats),
        winRate: profileService.calculateWinRate(updatedProfile.combatRecord),
        highestStat: profileService.getHighestStat(updatedProfile.stats),
        isWanted: profileService.isWanted(updatedProfile),
        isInGang: profileService.isInGang(updatedProfile),
        isOnline: profileService.isOnline(updatedProfile.lastActive),
        lastActiveDisplay: profileService.getLastActiveDisplay(updatedProfile.lastActive),
      };

      logger.debug('Profile updated', {
        characterName: updatedProfile.name,
        updatedFields: Object.keys(updates),
      });

      return {
        viewedProfile: updatedProfile,
        profileStats: stats,
      };
    });
  },

  searchCharacters: async (query: string) => {
    // Validate query length before making API call
    if (query.length < 2) {
      set({
        searchResults: [],
        error: 'Search query must be at least 2 characters',
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const results = await profileService.searchCharacters(query);

      set({
        searchResults: results,
        isLoading: false,
        error: null,
      });

      logger.debug('Character search completed', {
        query,
        resultsCount: results.length,
      });
    } catch (error: any) {
      logger.error('Failed to search characters', error as Error, {
        context: 'useProfileStore.searchCharacters',
        query,
      });

      set({
        searchResults: [],
        isLoading: false,
        error: error.message || 'Failed to search characters',
      });
    }
  },

  clearProfile: () => {
    set({
      viewedProfile: null,
      profileStats: null,
      error: null,
    });

    logger.debug('Profile cleared', {
      context: 'useProfileStore.clearProfile',
    });
  },

  clearError: () => {
    set({ error: null });
  },

  clearSearchResults: () => {
    set({ searchResults: [] });
  },
}));

export default useProfileStore;
