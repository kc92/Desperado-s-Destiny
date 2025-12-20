/**
 * Achievement Service
 * API client for achievement tracking and rewards
 */

import api from './api';

// ===== Types =====

export type AchievementCategory = 'combat' | 'crime' | 'social' | 'economy' | 'exploration' | 'special';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';

export interface Achievement {
  _id: string;
  characterId: string;
  achievementType: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  target: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
  claimedAt?: string;
  reward: AchievementReward;
}

export interface AchievementReward {
  experience?: number;
  gold?: number;
  reputation?: number;
  skillPoints?: number;
  title?: string;
  cosmetic?: {
    type: 'badge' | 'title' | 'frame' | 'emote';
    id: string;
    name: string;
  };
}

export interface AchievementProgress {
  achievementType: string;
  title: string;
  current: number;
  target: number;
  percentage: number;
  tier: AchievementTier;
}

export interface AchievementStats {
  completed: number;
  total: number;
  percentage: number;
}

export interface AchievementsByCategory {
  combat: Achievement[];
  crime: Achievement[];
  social: Achievement[];
  economy: Achievement[];
  exploration: Achievement[];
  special: Achievement[];
}

// ===== Request/Response Types =====

export interface GetAchievementsResponse {
  achievements: AchievementsByCategory;
  stats: AchievementStats;
  recentlyCompleted: Achievement[];
}

export interface GetAchievementSummaryResponse {
  totalCompleted: number;
  totalAchievements: number;
  completionRate: number;
  byCategory: {
    category: AchievementCategory;
    completed: number;
    total: number;
  }[];
  byTier: {
    tier: AchievementTier;
    completed: number;
    total: number;
  }[];
  recentlyCompleted: Achievement[];
  nearCompletion: AchievementProgress[];
  unclaimedRewards: Achievement[];
}

export interface ClaimAchievementRewardRequest {
  achievementId: string;
}

export interface ClaimAchievementRewardResponse {
  message: string;
  achievement: Achievement;
  rewards: {
    experience?: number;
    gold?: number;
    reputation?: number;
    skillPoints?: number;
    title?: string;
    cosmetic?: {
      type: string;
      id: string;
      name: string;
    };
  };
  newStats: {
    experience?: number;
    gold?: number;
    reputation?: number;
    skillPoints?: number;
  };
}

// ===== Achievement Service =====

export const achievementService = {
  // ===== Authenticated Routes =====

  /**
   * Get all achievements for current character
   */
  async getAchievements(): Promise<GetAchievementsResponse> {
    const response = await api.get<{ data: GetAchievementsResponse }>('/achievements');
    return response.data.data;
  },

  /**
   * Get achievement progress summary
   */
  async getAchievementSummary(): Promise<GetAchievementSummaryResponse> {
    const response = await api.get<{ data: GetAchievementSummaryResponse }>('/achievements/summary');
    return response.data.data;
  },

  /**
   * Claim achievement reward
   */
  async claimAchievementReward(achievementId: string): Promise<ClaimAchievementRewardResponse> {
    const response = await api.post<{ data: ClaimAchievementRewardResponse }>(
      `/achievements/${achievementId}/claim`
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Calculate achievement progress percentage
   */
  calculateProgress(achievement: Achievement): number {
    if (achievement.target === 0) return 0;
    return Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
  },

  /**
   * Check if achievement is completed but unclaimed
   */
  isUnclaimed(achievement: Achievement): boolean {
    return achievement.completed && !achievement.claimedAt;
  },

  /**
   * Check if achievement is near completion
   */
  isNearCompletion(achievement: Achievement, threshold = 80): boolean {
    if (achievement.completed) return false;
    const progress = this.calculateProgress(achievement);
    return progress >= threshold;
  },

  /**
   * Filter achievements by category
   */
  filterByCategory(achievements: Achievement[], category: AchievementCategory): Achievement[] {
    return achievements.filter((achievement) => achievement.category === category);
  },

  /**
   * Filter achievements by tier
   */
  filterByTier(achievements: Achievement[], tier: AchievementTier): Achievement[] {
    return achievements.filter((achievement) => achievement.tier === tier);
  },

  /**
   * Get completed achievements
   */
  getCompleted(achievements: Achievement[]): Achievement[] {
    return achievements.filter((achievement) => achievement.completed);
  },

  /**
   * Get unclaimed achievements
   */
  getUnclaimed(achievements: Achievement[]): Achievement[] {
    return achievements.filter((achievement) => this.isUnclaimed(achievement));
  },

  /**
   * Get in-progress achievements
   */
  getInProgress(achievements: Achievement[]): Achievement[] {
    return achievements.filter((achievement) => !achievement.completed && achievement.progress > 0);
  },

  /**
   * Sort achievements by progress
   */
  sortByProgress(achievements: Achievement[], descending = true): Achievement[] {
    return [...achievements].sort((a, b) => {
      const aProgress = this.calculateProgress(a);
      const bProgress = this.calculateProgress(b);
      return descending ? bProgress - aProgress : aProgress - bProgress;
    });
  },

  /**
   * Sort achievements by tier value
   */
  sortByTier(achievements: Achievement[], descending = true): Achievement[] {
    const tierValue = {
      bronze: 1,
      silver: 2,
      gold: 3,
      platinum: 4,
      legendary: 5,
    };

    return [...achievements].sort((a, b) => {
      const aValue = tierValue[a.tier];
      const bValue = tierValue[b.tier];
      return descending ? bValue - aValue : aValue - bValue;
    });
  },

  /**
   * Get achievement tier color
   */
  getTierColor(tier: AchievementTier): string {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      legendary: '#FF6B35',
    };
    return colors[tier];
  },

  /**
   * Get achievement category icon
   */
  getCategoryIcon(category: AchievementCategory): string {
    const icons = {
      combat: '⚔️',
      crime: '💰',
      social: '👥',
      economy: '💵',
      exploration: '🗺️',
      special: '⭐',
    };
    return icons[category];
  },

  /**
   * Format achievement reward as readable string
   */
  formatReward(reward: AchievementReward): string {
    const parts: string[] = [];

    if (reward.experience) parts.push(`${reward.experience} XP`);
    if (reward.gold) parts.push(`${reward.gold} Gold`);
    if (reward.reputation) parts.push(`${reward.reputation} Reputation`);
    if (reward.skillPoints) parts.push(`${reward.skillPoints} Skill Points`);
    if (reward.title) parts.push(`Title: "${reward.title}"`);
    if (reward.cosmetic) parts.push(`${reward.cosmetic.name}`);

    return parts.join(', ');
  },

  /**
   * Calculate total rewards from multiple achievements
   */
  calculateTotalRewards(achievements: Achievement[]): {
    totalExperience: number;
    totalGold: number;
    totalReputation: number;
    totalSkillPoints: number;
    titles: string[];
    cosmetics: string[];
  } {
    return achievements.reduce(
      (acc, achievement) => {
        const reward = achievement.reward;
        return {
          totalExperience: acc.totalExperience + (reward.experience || 0),
          totalGold: acc.totalGold + (reward.gold || 0),
          totalReputation: acc.totalReputation + (reward.reputation || 0),
          totalSkillPoints: acc.totalSkillPoints + (reward.skillPoints || 0),
          titles: reward.title ? [...acc.titles, reward.title] : acc.titles,
          cosmetics: reward.cosmetic
            ? [...acc.cosmetics, reward.cosmetic.name]
            : acc.cosmetics,
        };
      },
      {
        totalExperience: 0,
        totalGold: 0,
        totalReputation: 0,
        totalSkillPoints: 0,
        titles: [] as string[],
        cosmetics: [] as string[],
      }
    );
  },

  /**
   * Get achievements near completion
   */
  getNearCompletion(achievements: Achievement[], threshold = 80, limit = 5): AchievementProgress[] {
    return achievements
      .filter((achievement) => this.isNearCompletion(achievement, threshold))
      .sort((a, b) => {
        const aProgress = this.calculateProgress(a);
        const bProgress = this.calculateProgress(b);
        return bProgress - aProgress;
      })
      .slice(0, limit)
      .map((achievement) => ({
        achievementType: achievement.achievementType,
        title: achievement.title,
        current: achievement.progress,
        target: achievement.target,
        percentage: this.calculateProgress(achievement),
        tier: achievement.tier,
      }));
  },
};

export default achievementService;
