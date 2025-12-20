/**
 * Zodiac Service
 * API client for the Western-themed Frontier Zodiac calendar system
 */

import api from './api';

// ===== Types =====

export type CompatibilityLevel = 'excellent' | 'good' | 'neutral' | 'challenging';

export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  dateRange: {
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
  };
  element: 'fire' | 'earth' | 'air' | 'water';
  description: string;
  traits: string[];
  activityBonuses: Record<string, number>;
  skillBonuses: Record<string, number>;
  specialBonuses: Record<string, number>;
  oppositeSignId: string;
  peakDay: {
    month: number;
    day: number;
  };
  fragmentsRequired: number;
}

export interface ConstellationProgress {
  signId: string;
  fragmentsEarned: number;
  fragmentsRequired: number;
  percentComplete: number;
  completed: boolean;
  completedAt?: string;
  rewardClaimed: boolean;
}

export interface ZodiacProgress {
  birthSign: ZodiacSign | null;
  birthSignSetAt: string | null;
  constellations: Record<string, ConstellationProgress>;
  totalFragments: number;
  isStarWalker: boolean;
  starWalkerAt?: string;
  completionPercentage: number;
  peakDaysAttended: number;
  stats: {
    totalBonusesApplied: number;
    totalPeakDayBonuses: number;
    constellationsCompleted: number;
  };
}

export interface ActiveBonus {
  type: 'activity' | 'skill' | 'special';
  name: string;
  value: number;
  source: string;
  isPeakDayBonus: boolean;
}

export interface ZodiacBonuses {
  currentSign: ZodiacSign;
  birthSign: ZodiacSign | null;
  isPeakDay: boolean;
  activeBonuses: ActiveBonus[];
  summary: {
    activityBonuses: Record<string, number>;
    skillBonuses: Record<string, number>;
    specialBonuses: Record<string, number>;
  };
  isBirthSignActive: boolean;
  bonusMultiplier: number;
}

export interface Compatibility {
  sign1: ZodiacSign;
  sign2: ZodiacSign;
  compatibility: {
    compatible: boolean;
    level: CompatibilityLevel;
    reason: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  birthSign: ZodiacSign | null;
  totalFragments: number;
  constellationsCompleted: number;
  isStarWalker: boolean;
}

export interface StarWalker {
  characterId: string;
  characterName: string;
  birthSign: ZodiacSign;
  starWalkerAt: string;
  totalFragments: number;
}

export interface ConstellationReward {
  signId: string;
  signName: string;
  rewards: {
    gold: number;
    xp: number;
    items?: string[];
    permanentBonus?: {
      type: string;
      value: number;
    };
    title?: string;
  };
}

// ===== Request/Response Types =====

export interface CurrentSignResponse {
  currentSign: ZodiacSign;
  isPeakDay: boolean;
  peakDayBonusMultiplier: number;
  message: string;
}

export interface AllSignsResponse {
  signs: ZodiacSign[];
  count: number;
  currentSignId: string | null;
}

export interface SignDetailResponse {
  sign: ZodiacSign;
  oppositeSign: ZodiacSign;
  isCurrentSign: boolean;
}

export interface PeakDayResponse {
  isPeakDay: boolean;
  sign: ZodiacSign | null;
  bonusMultiplier: number;
  message: string;
}

export interface DateSignResponse {
  month: number;
  day: number;
  sign: ZodiacSign;
}

export interface SetBirthSignResponse {
  success: boolean;
  sign: ZodiacSign;
  message: string;
}

export interface ClaimRewardResponse {
  success: boolean;
  reward: ConstellationReward;
  message: string;
}

export interface AttendPeakDayResponse {
  recorded: boolean;
  sign: ZodiacSign | null;
  fragmentsAwarded?: number;
  message: string;
}

export interface AwardFragmentsResponse {
  fragmentsAdded: number;
  totalFragments: number;
  constellationProgress: {
    fragmentsEarned: number;
    fragmentsRequired: number;
    percentComplete: number;
    completed: boolean;
    justCompleted: boolean;
  };
  becameStarWalker: boolean;
  message: string;
}

export interface StarWalkersResponse {
  starWalkers: StarWalker[];
  count: number;
  rewards: {
    title: string;
    permanentBonuses: string[];
    exclusiveItems: string[];
  };
}

// ===== Zodiac Service =====

export const zodiacService = {
  // ===== Public Routes =====

  /**
   * Get the current zodiac sign based on real-world date
   */
  async getCurrentSign(): Promise<CurrentSignResponse> {
    const response = await api.get<{ data: CurrentSignResponse }>('/zodiac/current');
    return response.data.data;
  },

  /**
   * Get all 12 frontier zodiac signs with their details
   */
  async getAllSigns(): Promise<AllSignsResponse> {
    const response = await api.get<{ data: AllSignsResponse }>('/zodiac/signs');
    return response.data.data;
  },

  /**
   * Get details for a specific zodiac sign
   */
  async getSignById(signId: string): Promise<SignDetailResponse> {
    const response = await api.get<{ data: SignDetailResponse }>(`/zodiac/signs/${signId}`);
    return response.data.data;
  },

  /**
   * Check if today is a peak day for any sign
   */
  async getPeakDay(): Promise<PeakDayResponse> {
    const response = await api.get<{ data: PeakDayResponse }>('/zodiac/peak-day');
    return response.data.data;
  },

  /**
   * Get the zodiac sign for a specific date
   */
  async getSignForDate(month: number, day: number): Promise<DateSignResponse> {
    const response = await api.get<{ data: DateSignResponse }>(`/zodiac/date/${month}/${day}`);
    return response.data.data;
  },

  /**
   * Check compatibility between two signs
   */
  async getCompatibility(signId1: string, signId2: string): Promise<Compatibility> {
    const response = await api.get<{ data: Compatibility }>(
      `/zodiac/compatibility/${signId1}/${signId2}`
    );
    return response.data.data;
  },

  /**
   * Get zodiac leaderboard
   */
  async getLeaderboard(
    metric: 'totalFragments' | 'constellationsCompleted' = 'totalFragments',
    limit?: number
  ): Promise<LeaderboardEntry[]> {
    const response = await api.get<{ data: { leaderboard: LeaderboardEntry[]; metric: string } }>(
      '/zodiac/leaderboard',
      { params: { metric, limit } }
    );
    return response.data.data?.leaderboard || [];
  },

  /**
   * Get all Star Walkers (players who completed all 12 constellations)
   */
  async getStarWalkers(): Promise<StarWalkersResponse> {
    const response = await api.get<{ data: StarWalkersResponse }>('/zodiac/star-walkers');
    return response.data.data;
  },

  // ===== Authenticated Routes =====

  /**
   * Get character's zodiac progress including constellation completion
   */
  async getProgress(): Promise<ZodiacProgress> {
    const response = await api.get<{ data: ZodiacProgress }>('/zodiac/progress');
    return response.data.data;
  },

  /**
   * Set character's birth sign (one-time selection, cannot be changed)
   */
  async setBirthSign(signId: string): Promise<SetBirthSignResponse> {
    const response = await api.post<{ data: SetBirthSignResponse }>('/zodiac/birth-sign', {
      signId,
    });
    return response.data.data;
  },

  /**
   * Get active zodiac bonuses for the current character
   */
  async getActiveBonuses(): Promise<ZodiacBonuses> {
    const response = await api.get<{ data: ZodiacBonuses }>('/zodiac/bonuses');
    return response.data.data;
  },

  /**
   * Claim reward for completing a constellation
   */
  async claimConstellationReward(signId: string): Promise<ClaimRewardResponse> {
    const response = await api.post<{ data: ClaimRewardResponse }>(
      `/zodiac/constellation/${signId}/claim`
    );
    return response.data.data;
  },

  /**
   * Record attendance for a peak day (awards bonus fragments)
   */
  async attendPeakDay(): Promise<AttendPeakDayResponse> {
    const response = await api.post<{ data: AttendPeakDayResponse }>('/zodiac/peak-day/attend');
    return response.data.data;
  },

  /**
   * Award star fragments to character (internal/game use)
   */
  async awardFragments(signId: string, amount: number): Promise<AwardFragmentsResponse> {
    const response = await api.post<{ data: AwardFragmentsResponse }>('/zodiac/fragments/award', {
      signId,
      amount,
    });
    return response.data.data;
  },
};

export default zodiacService;
