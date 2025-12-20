/**
 * useEntertainers Hook
 * Handles entertainer API operations including performances and skill learning
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

export enum PerformanceType {
  PIANO = 'piano',
  MAGIC = 'magic',
  SINGING = 'singing',
  STORYTELLING = 'storytelling',
  DANCING = 'dancing',
  HARMONICA = 'harmonica',
  WILD_WEST_SHOW = 'wild_west_show',
  FORTUNE_TELLING = 'fortune_telling',
  GOSPEL = 'gospel',
  COMEDY = 'comedy',
}

export interface Performance {
  id: string;
  name: string;
  description: string;
  performanceType: PerformanceType;
  duration: number;
  energyCost: number;
  moodEffect: {
    mood: string;
    duration: number;
    intensity: number;
  };
  rewards?: {
    experience?: number;
    gold?: number;
    item?: string;
    buff?: {
      stat: string;
      modifier: number;
      duration: number;
    };
  };
}

export interface TeachableSkill {
  skillId: string;
  skillName: string;
  trustRequired: number;
  energyCost: number;
  goldCost: number;
  description: string;
  effect: {
    stat: string;
    modifier: number;
    permanent: boolean;
  };
}

export interface EntertainerDialogue {
  greeting: string[];
  aboutPerformance: string[];
  sharingGossip: string[];
  teachingSkill: string[];
  farewell: string[];
  duringPerformance: string[];
}

export interface RouteStop {
  locationId: string;
  locationName: string;
  arrivalDay: number;
  stayDuration: number;
  performanceVenue: string;
}

export interface EntertainerSchedule {
  entertainerId: string;
  currentLocation: {
    locationId: string;
    locationName: string;
    venue: string;
  };
  nextPerformance?: {
    time: string;
    performanceType: PerformanceType;
    venue: string;
  };
  weeklySchedule: Array<{
    dayOfWeek: number;
    locationId: string;
    locationName: string;
    performances: Array<{
      time: string;
      type: PerformanceType;
    }>;
  }>;
  route: RouteStop[];
}

export interface Entertainer {
  id: string;
  name: string;
  title: string;
  performanceType: PerformanceType;
  description: string;
  personality: string;
  baseMood: string;
  route: RouteStop[];
  performances: Performance[];
  dialogue: EntertainerDialogue;
  specialAbilities?: string[];
  teachableSkills?: TeachableSkill[];
  gossipAccess?: string[];
  trustLevel: number;
  currentLocationId?: string;
  currentLocationName?: string;
  imageUrl?: string;
}

// Type alias for backwards compatibility
export type WanderingEntertainer = Entertainer;

export interface PerformanceResult {
  success: boolean;
  message: string;
  performance: Performance;
  moodChange: {
    mood: string;
    duration: number;
    intensity: number;
  };
  buffsApplied?: Array<{
    stat: string;
    modifier: number;
    duration: number;
    expiresAt: Date;
  }>;
  experienceGained: number;
  goldEarned?: number;
  itemReceived?: string;
  trustGained: number;
}

export interface SkillLearningResult {
  success: boolean;
  message: string;
  skill?: TeachableSkill;
  energyCost: number;
  goldCost: number;
  effectApplied?: {
    stat: string;
    modifier: number;
    permanent: boolean;
  };
  trustRequired: number;
  currentTrust: number;
}

export interface EntertainerRecommendation {
  entertainer: Entertainer;
  performance: Performance;
  reason: string;
  matchScore: number;
}

export interface SearchParams {
  name?: string;
  performanceType?: PerformanceType;
  locationId?: string;
  minTrust?: number;
}

interface UseEntertainersReturn {
  entertainers: Entertainer[];
  entertainersAtLocation: Entertainer[];
  selectedEntertainer: Entertainer | null;
  entertainerSchedule: EntertainerSchedule | null;
  availablePerformances: Performance[];
  recommendations: EntertainerRecommendation[];
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchAllEntertainers: () => Promise<void>;
  searchEntertainers: (params: SearchParams) => Promise<void>;
  fetchEntertainersByType: (type: PerformanceType) => Promise<void>;
  fetchEntertainersAtLocation: (locationId: string) => Promise<void>;
  fetchEntertainerDetails: (entertainerId: string) => Promise<void>;
  fetchEntertainerSchedule: (entertainerId: string) => Promise<void>;
  fetchRecommendations: () => Promise<void>;

  // Actions
  watchPerformance: (
    entertainerId: string,
    performanceId: string
  ) => Promise<PerformanceResult | null>;
  learnSkill: (
    entertainerId: string,
    skillId: string
  ) => Promise<SkillLearningResult | null>;

  // Utility
  clearSelectedEntertainer: () => void;
}

export const useEntertainers = (): UseEntertainersReturn => {
  const [entertainers, setEntertainers] = useState<Entertainer[]>([]);
  const [entertainersAtLocation, setEntertainersAtLocation] = useState<Entertainer[]>([]);
  const [selectedEntertainer, setSelectedEntertainer] = useState<Entertainer | null>(null);
  const [entertainerSchedule, setEntertainerSchedule] = useState<EntertainerSchedule | null>(null);
  const [availablePerformances, setAvailablePerformances] = useState<Performance[]>([]);
  const [recommendations, setRecommendations] = useState<EntertainerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // GET / - Fetch all entertainers
  const fetchAllEntertainers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { entertainers: Entertainer[] } }>(
        '/entertainers'
      );
      setEntertainers(response.data.data.entertainers);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch entertainers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // GET /search - Search entertainers
  const searchEntertainers = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.name) queryParams.append('name', params.name);
      if (params.performanceType) queryParams.append('performanceType', params.performanceType);
      if (params.locationId) queryParams.append('locationId', params.locationId);
      if (params.minTrust !== undefined) queryParams.append('minTrust', params.minTrust.toString());

      const response = await api.get<{ data: { entertainers: Entertainer[] } }>(
        `/entertainers/search?${queryParams.toString()}`
      );
      setEntertainers(response.data.data.entertainers);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search entertainers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // GET /type/:type - Fetch entertainers by performance type
  const fetchEntertainersByType = useCallback(async (type: PerformanceType) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { entertainers: Entertainer[] } }>(
        `/entertainers/type/${type}`
      );
      setEntertainers(response.data.data.entertainers);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch entertainers by type');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // GET /location/:locationId - Fetch entertainers at location
  const fetchEntertainersAtLocation = useCallback(async (locationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { entertainers: Entertainer[]; performances: Performance[] } }>(
        `/entertainers/location/${locationId}`
      );
      setEntertainersAtLocation(response.data.data.entertainers);
      setAvailablePerformances(response.data.data.performances || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch entertainers at location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // GET /:entertainerId - Fetch entertainer details
  const fetchEntertainerDetails = useCallback(async (entertainerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { entertainer: Entertainer } }>(
        `/entertainers/${entertainerId}`
      );
      setSelectedEntertainer(response.data.data.entertainer);
      if (response.data.data.entertainer.performances) {
        setAvailablePerformances(response.data.data.entertainer.performances);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch entertainer details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // GET /:entertainerId/schedule - Fetch entertainer schedule
  const fetchEntertainerSchedule = useCallback(async (entertainerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { schedule: EntertainerSchedule } }>(
        `/entertainers/${entertainerId}/schedule`
      );
      setEntertainerSchedule(response.data.data.schedule);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch entertainer schedule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // GET /recommendations - Fetch recommended performances
  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { recommendations: EntertainerRecommendation[] } }>(
        '/entertainers/recommendations'
      );
      setRecommendations(response.data.data.recommendations);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // POST /:entertainerId/performances/:performanceId/watch - Watch a performance
  const watchPerformance = useCallback(
    async (entertainerId: string, performanceId: string): Promise<PerformanceResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post<{ data: PerformanceResult }>(
          `/entertainers/${entertainerId}/performances/${performanceId}/watch`
        );
        await refreshCharacter();
        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to watch performance');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCharacter]
  );

  // POST /:entertainerId/skills/:skillId/learn - Learn a skill
  const learnSkill = useCallback(
    async (entertainerId: string, skillId: string): Promise<SkillLearningResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post<{ data: SkillLearningResult }>(
          `/entertainers/${entertainerId}/skills/${skillId}/learn`
        );
        await refreshCharacter();
        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to learn skill');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCharacter]
  );

  // Clear selected entertainer
  const clearSelectedEntertainer = useCallback(() => {
    setSelectedEntertainer(null);
    setEntertainerSchedule(null);
    setAvailablePerformances([]);
  }, []);

  return {
    entertainers,
    entertainersAtLocation,
    selectedEntertainer,
    entertainerSchedule,
    availablePerformances,
    recommendations,
    isLoading,
    error,
    fetchAllEntertainers,
    searchEntertainers,
    fetchEntertainersByType,
    fetchEntertainersAtLocation,
    fetchEntertainerDetails,
    fetchEntertainerSchedule,
    fetchRecommendations,
    watchPerformance,
    learnSkill,
    clearSelectedEntertainer,
  };
};

export default useEntertainers;
