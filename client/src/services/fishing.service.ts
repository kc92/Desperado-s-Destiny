/**
 * Fishing Service
 * API client for the fishing system
 */

import api from './api';

// ===== Types =====

export type FishRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type BaitType = 'worm' | 'cricket' | 'minnow' | 'special';
export type FishingSpotType = 'river' | 'lake' | 'pond' | 'ocean' | 'swamp';

export interface Fish {
  id: string;
  name: string;
  description: string;
  rarity: FishRarity;
  minWeight: number;
  maxWeight: number;
  baseValue: number;
  spotTypes: FishingSpotType[];
  preferredBait?: BaitType;
  timeOfDay?: 'day' | 'night' | 'any';
  weather?: 'clear' | 'rain' | 'any';
}

export interface CaughtFish extends Fish {
  weight: number;
  value: number;
  caughtAt: string;
  isRecord?: boolean;
}

export interface FishingSpot {
  id: string;
  name: string;
  description: string;
  type: FishingSpotType;
  locationId: string;
  locationName: string;
  difficulty: number;
  availableFish: string[];
  bonusChance?: number;
}

export interface FishingSession {
  _id: string;
  characterId: string;
  spotId: string;
  spot: FishingSpot;
  baitType: BaitType;
  startTime: string;
  hasBite: boolean;
  biteTime?: string;
  currentFish?: Fish;
  caughtFish: CaughtFish[];
  totalValue: number;
  isActive: boolean;
}

export interface FishingStats {
  totalCatches: number;
  totalValue: number;
  biggestCatch: CaughtFish | null;
  rarestCatch: CaughtFish | null;
  catchesByRarity: Record<FishRarity, number>;
  favoriteSpot: string | null;
  fishingTime: number;
}

// ===== Request/Response Types =====

export interface StartFishingRequest {
  spotId: string;
  baitType: BaitType;
}

export interface StartFishingResponse {
  success: boolean;
  session: FishingSession;
  message: string;
}

export interface CheckBiteResponse {
  success: boolean;
  hasBite: boolean;
  fish?: Fish;
  timeRemaining?: number;
  message: string;
}

export interface SetHookResponse {
  success: boolean;
  caught: boolean;
  fish?: CaughtFish;
  xpGained?: number;
  session: FishingSession;
  message: string;
}

export interface EndFishingResponse {
  success: boolean;
  session: FishingSession;
  totalCatches: number;
  totalValue: number;
  xpGained: number;
  goldEarned: number;
  message: string;
}

// ===== Fishing Service =====

export const fishingService = {
  /**
   * Get current fishing session (if any)
   */
  async getCurrentSession(): Promise<FishingSession | null> {
    try {
      const response = await api.get<{ data: { session: FishingSession | null } }>(
        '/fishing/session'
      );
      return response.data.data?.session || null;
    } catch {
      return null;
    }
  },

  /**
   * Start a new fishing session
   */
  async startFishing(spotId: string, baitType: BaitType): Promise<StartFishingResponse> {
    const response = await api.post<{ data: StartFishingResponse }>('/fishing/start', {
      spotId,
      baitType,
    });
    return response.data.data;
  },

  /**
   * Check for a bite (called frequently during fishing)
   */
  async checkForBite(): Promise<CheckBiteResponse> {
    const response = await api.post<{ data: CheckBiteResponse }>('/fishing/check-bite');
    return response.data.data;
  },

  /**
   * Set the hook when a bite is detected
   */
  async setHook(): Promise<SetHookResponse> {
    const response = await api.post<{ data: SetHookResponse }>('/fishing/set-hook');
    return response.data.data;
  },

  /**
   * End the current fishing session
   */
  async endFishing(): Promise<EndFishingResponse> {
    const response = await api.post<{ data: EndFishingResponse }>('/fishing/end');
    return response.data.data;
  },
};

export default fishingService;
