/**
 * Login Reward Service
 * API client for daily login reward system
 * Part of Competitor Parity Plan - Phase B
 */

import api from './api';

// ===== Types =====

export type RewardType = 'dollars' | 'item' | 'energy' | 'material' | 'premium';

export interface RewardItem {
  type: RewardType;
  amount?: number;
  itemId?: string;
  itemName?: string;
  itemRarity?: string;
  description?: string;
}

export interface DayReward {
  day: number;
  week: number;
  rewards: RewardItem[];
  isBonus: boolean;
  description: string;
}

export interface ClaimedDay {
  day: number;
  week: number;
  claimedAt: string;
  rewards: RewardItem[];
}

export interface LoginRewardProgress {
  characterId: string;
  currentDay: number;
  currentWeek: number;
  lastClaimDate?: string;
  claimedDays: ClaimedDay[];
  totalDaysClaimed: number;
  currentStreak: number;
  longestStreak: number;
  monthlyBonusClaimed: boolean;
  cycleStartDate: string;
}

export interface LoginRewardStatistics {
  totalDaysClaimed: number;
  currentStreak: number;
  longestStreak: number;
  totalGoldEarned: number;
  totalItemsEarned: number;
  totalExperienceEarned: number;
  monthlyBonusesEarned: number;
  favoriteRewardType: RewardType | null;
  lastClaimDate?: string;
  daysUntilMonthlyBonus: number;
}

// ===== Request/Response Types =====

export interface ClaimStatusResponse {
  canClaim: boolean;
  reason?: string;
  currentDay: number;
  currentWeek: number;
  nextClaimAvailable?: string;
  todayReward?: DayReward;
  hoursUntilNextClaim?: number;
}

export interface CalendarResponse {
  calendar: DayReward[];
  claimedDays: number[];
  currentDay: number;
  currentWeek: number;
  monthlyBonusAvailable: boolean;
  progress: LoginRewardProgress;
}

export interface CurrentRewardResponse {
  day: number;
  week: number;
  reward: DayReward;
  canClaim: boolean;
  alreadyClaimed: boolean;
}

export interface ClaimRewardResponse {
  success: true;
  claimed: DayReward;
  rewards: RewardItem[];
  newDay: number;
  newWeek: number;
  nextClaimAvailable: string;
  goldAdded?: number;
  experienceAdded?: number;
  itemsAdded?: Array<{ itemId: string; name: string; quantity: number }>;
  message: string;
}

export interface MonthlyBonusResponse {
  success: true;
  rewards: RewardItem[];
  goldAdded?: number;
  itemsAdded?: Array<{ itemId: string; name: string; quantity: number }>;
  message: string;
}

export interface StatisticsResponse {
  statistics: LoginRewardStatistics;
  progress: LoginRewardProgress;
}

export interface ResetProgressRequest {
  characterId: string;
}

export interface ResetProgressResponse {
  success: true;
  message: string;
  characterId: string;
}

// ===== Login Reward Service =====

export const loginRewardService = {
  // ===== Status and Information Routes =====

  /**
   * Get claim status for current day
   */
  async getStatus(): Promise<ClaimStatusResponse> {
    const response = await api.get<{ data: ClaimStatusResponse }>('/login-rewards/status');
    return response.data.data;
  },

  /**
   * Get full 28-day calendar with claimed status
   */
  async getCalendar(): Promise<CalendarResponse> {
    const response = await api.get<{ data: CalendarResponse }>('/login-rewards/calendar');
    return response.data.data;
  },

  /**
   * Get current day's reward preview
   */
  async getCurrentReward(): Promise<CurrentRewardResponse> {
    const response = await api.get<{ data: CurrentRewardResponse }>('/login-rewards/current');
    return response.data.data;
  },

  /**
   * Get login reward statistics
   */
  async getStatistics(): Promise<StatisticsResponse> {
    const response = await api.get<{ data: StatisticsResponse }>('/login-rewards/statistics');
    return response.data.data;
  },

  // ===== Claim Routes =====

  /**
   * Claim today's reward
   */
  async claimReward(): Promise<ClaimRewardResponse> {
    const response = await api.post<{ data: ClaimRewardResponse }>('/login-rewards/claim');
    return response.data.data;
  },

  /**
   * Claim monthly bonus (requires all 28 days claimed)
   */
  async claimMonthlyBonus(): Promise<MonthlyBonusResponse> {
    const response = await api.post<{ data: MonthlyBonusResponse }>('/login-rewards/monthly');
    return response.data.data;
  },

  // ===== Admin Routes =====

  /**
   * Reset a character's login reward progress (Admin only)
   */
  async resetProgress(characterId: string): Promise<ResetProgressResponse> {
    const response = await api.post<{ data: ResetProgressResponse }>(
      '/login-rewards/reset',
      { characterId }
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if player can claim today's reward
   */
  async canClaimToday(): Promise<boolean> {
    const status = await this.getStatus();
    return status.canClaim;
  },

  /**
   * Get days remaining until monthly bonus
   */
  async getDaysUntilMonthlyBonus(): Promise<number> {
    const calendar = await this.getCalendar();
    return 28 - calendar.claimedDays.length;
  },

  /**
   * Check if monthly bonus is available
   */
  async isMonthlyBonusAvailable(): Promise<boolean> {
    const calendar = await this.getCalendar();
    return calendar.monthlyBonusAvailable;
  },

  /**
   * Get streak information
   */
  async getStreak(): Promise<{ current: number; longest: number }> {
    const stats = await this.getStatistics();
    return {
      current: stats.statistics.currentStreak,
      longest: stats.statistics.longestStreak,
    };
  },

  /**
   * Get total rewards earned summary
   */
  async getTotalRewardsEarned(): Promise<{
    gold: number;
    items: number;
    experience: number;
    monthlyBonuses: number;
  }> {
    const stats = await this.getStatistics();
    return {
      gold: stats.statistics.totalGoldEarned,
      items: stats.statistics.totalItemsEarned,
      experience: stats.statistics.totalExperienceEarned,
      monthlyBonuses: stats.statistics.monthlyBonusesEarned,
    };
  },

  /**
   * Calculate hours until next claim
   */
  async getHoursUntilNextClaim(): Promise<number> {
    const status = await this.getStatus();
    return status.hoursUntilNextClaim || 0;
  },

  /**
   * Format time until next claim as human-readable string
   */
  formatTimeUntilNextClaim(hours: number): string {
    if (hours === 0) return 'Available now';
    if (hours < 1) return `${Math.ceil(hours * 60)} minutes`;
    if (hours < 24) return `${Math.floor(hours)} hours`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  },

  /**
   * Get reward type icon/color for UI
   */
  getRewardTypeDisplay(type: RewardType): { icon: string; color: string } {
    const displays: Record<RewardType, { icon: string; color: string }> = {
      gold: { icon: '💰', color: '#FFD700' },
      item: { icon: '📦', color: '#8B4513' },
      experience: { icon: '⭐', color: '#4169E1' },
      skill_points: { icon: '🎯', color: '#FF4500' },
      energy: { icon: '⚡', color: '#00CED1' },
      bundle: { icon: '🎁', color: '#9370DB' },
    };
    return displays[type] || { icon: '❓', color: '#808080' };
  },

  /**
   * Format reward description for display
   */
  formatRewardDescription(reward: RewardItem): string {
    switch (reward.type) {
      case 'gold':
        return `${reward.amount} Gold`;
      case 'experience':
        return `${reward.amount} XP`;
      case 'skill_points':
        return `${reward.amount} Skill Points`;
      case 'energy':
        return `${reward.amount} Energy`;
      case 'item':
        return reward.itemName || 'Mystery Item';
      case 'bundle':
        return reward.description || 'Reward Bundle';
      default:
        return reward.description || 'Unknown Reward';
    }
  },

  /**
   * Get week progress percentage
   */
  getWeekProgress(currentDay: number): number {
    const dayInWeek = ((currentDay - 1) % 7) + 1;
    return (dayInWeek / 7) * 100;
  },

  /**
   * Get month progress percentage
   */
  getMonthProgress(claimedDays: number): number {
    return (claimedDays / 28) * 100;
  },

  /**
   * Check if day is a bonus day (multiples of 7)
   */
  isBonusDay(day: number): boolean {
    return day % 7 === 0;
  },

  /**
   * Get next bonus day
   */
  getNextBonusDay(currentDay: number): number {
    return Math.ceil(currentDay / 7) * 7;
  },

  /**
   * Calculate days until next bonus
   */
  getDaysUntilNextBonus(currentDay: number): number {
    return this.getNextBonusDay(currentDay) - currentDay;
  },

  /**
   * Check if player has claimed today
   */
  async hasClaimedToday(): Promise<boolean> {
    const status = await this.getStatus();
    return !status.canClaim && status.hoursUntilNextClaim !== undefined;
  },

  /**
   * Get calendar grid for UI (4 weeks x 7 days)
   */
  async getCalendarGrid(): Promise<DayReward[][]> {
    const calendar = await this.getCalendar();
    const grid: DayReward[][] = [];

    for (let week = 0; week < 4; week++) {
      grid[week] = calendar.calendar.slice(week * 7, (week + 1) * 7);
    }

    return grid;
  },

  /**
   * Check if all days in a week are claimed
   */
  isWeekComplete(week: number, claimedDays: number[]): boolean {
    const weekStart = (week - 1) * 7 + 1;
    const weekEnd = week * 7;

    for (let day = weekStart; day <= weekEnd; day++) {
      if (!claimedDays.includes(day)) return false;
    }

    return true;
  },

  /**
   * Get unclaimed days count
   */
  getUnclaimedDaysCount(claimedDays: number[]): number {
    return 28 - claimedDays.length;
  },
};

export default loginRewardService;
