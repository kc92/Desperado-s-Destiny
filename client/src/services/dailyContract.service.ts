/**
 * Daily Contract Service
 * API client for the daily contract system
 * Part of Competitor Parity Plan - Phase B
 */

import api from './api';

// ===== Types =====

export type ContractType = 'combat' | 'crafting' | 'gathering' | 'social' | 'exploration' | 'special';
export type ContractDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type ContractStatus = 'available' | 'active' | 'completed' | 'failed' | 'expired';

export interface ContractObjective {
  description: string;
  target: number;
  current: number;
  completed: boolean;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface ContractReward {
  type: 'gold' | 'experience' | 'item' | 'reputation' | 'skill_points';
  amount?: number;
  itemId?: string;
  itemName?: string;
  itemRarity?: string;
  description?: string;
}

export interface DailyContract {
  _id: string;
  contractId: string;
  name: string;
  description: string;
  type: ContractType;
  difficulty: ContractDifficulty;
  objectives: ContractObjective[];
  rewards: ContractReward[];
  bonusRewards?: ContractReward[];
  expiresAt: string;
  timeLimit?: number;
  minLevel?: number;
  requiredSkills?: string[];
  status: ContractStatus;
  progress: number;
  acceptedAt?: string;
  completedAt?: string;
  canComplete: boolean;
}

export interface ContractStreak {
  characterId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate?: string;
  streakBonuses: StreakBonus[];
  nextBonusAt: number;
}

export interface StreakBonus {
  streakDays: number;
  name: string;
  description: string;
  rewards: ContractReward[];
  claimed: boolean;
  claimedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  currentStreak: number;
  longestStreak: number;
  totalContractsCompleted: number;
  lastCompletion?: string;
}

export interface ContractProgress {
  contractId: string;
  objectiveIndex: number;
  progress: number;
  completed: boolean;
  timestamp: string;
}

// ===== Request/Response Types =====

export interface DailyContractsResponse {
  contracts: DailyContract[];
  availableSlots: number;
  activeContracts: number;
  completedToday: number;
  resetTime: string;
}

export interface AcceptContractResponse {
  success: true;
  contract: DailyContract;
  activeContracts: number;
  message: string;
}

export interface UpdateProgressRequest {
  objectiveIndex?: number;
  amount?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateProgressResponse {
  success: true;
  contract: DailyContract;
  progress: number;
  completed: boolean;
  message: string;
}

export interface CompleteContractResponse {
  success: true;
  contract: DailyContract;
  rewards: ContractReward[];
  bonusRewards?: ContractReward[];
  goldAdded?: number;
  experienceAdded?: number;
  itemsAdded?: Array<{ itemId: string; name: string; quantity: number }>;
  reputationAdded?: Record<string, number>;
  streakIncreased: boolean;
  newStreak: number;
  message: string;
}

export interface StreakResponse {
  streak: ContractStreak;
  availableBonuses: StreakBonus[];
  nextMilestone: number;
  daysUntilNextBonus: number;
}

export interface ClaimStreakBonusRequest {
  streakDays: number;
}

export interface ClaimStreakBonusResponse {
  success: true;
  bonus: StreakBonus;
  rewards: ContractReward[];
  goldAdded?: number;
  itemsAdded?: Array<{ itemId: string; name: string; quantity: number }>;
  message: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  playerRank?: number;
  totalPlayers: number;
}

export interface ResetTimerResponse {
  resetTime: string;
  hoursUntilReset: number;
  minutesUntilReset: number;
  secondsUntilReset: number;
}

export interface TriggerProgressRequest {
  eventType: string;
  data: Record<string, unknown>;
}

export interface TriggerProgressResponse {
  success: true;
  updatedContracts: DailyContract[];
  message: string;
}

// ===== Daily Contract Service =====

export const dailyContractService = {
  // ===== Contract Management Routes =====

  /**
   * Get today's available daily contracts
   */
  async getDailyContracts(): Promise<DailyContractsResponse> {
    const response = await api.get<{ data: DailyContractsResponse }>('/contracts/daily');
    return response.data.data;
  },

  /**
   * Accept a daily contract
   */
  async acceptContract(contractId: string): Promise<AcceptContractResponse> {
    const response = await api.post<{ data: AcceptContractResponse }>(
      `/contracts/${contractId}/accept`
    );
    return response.data.data;
  },

  /**
   * Update contract progress
   */
  async updateProgress(
    contractId: string,
    request: UpdateProgressRequest = {}
  ): Promise<UpdateProgressResponse> {
    const response = await api.post<{ data: UpdateProgressResponse }>(
      `/contracts/${contractId}/progress`,
      request
    );
    return response.data.data;
  },

  /**
   * Complete a contract and claim rewards
   */
  async completeContract(contractId: string): Promise<CompleteContractResponse> {
    const response = await api.post<{ data: CompleteContractResponse }>(
      `/contracts/${contractId}/complete`
    );
    return response.data.data;
  },

  // ===== Streak System Routes =====

  /**
   * Get current streak information
   */
  async getStreak(): Promise<StreakResponse> {
    const response = await api.get<{ data: StreakResponse }>('/contracts/streak');
    return response.data.data;
  },

  /**
   * Claim a streak milestone bonus
   */
  async claimStreakBonus(streakDays: number): Promise<ClaimStreakBonusResponse> {
    const response = await api.post<{ data: ClaimStreakBonusResponse }>(
      '/contracts/streak/claim',
      { streakDays }
    );
    return response.data.data;
  },

  /**
   * Get streak leaderboard
   */
  async getStreakLeaderboard(): Promise<LeaderboardResponse> {
    const response = await api.get<{ data: LeaderboardResponse }>('/contracts/leaderboard');
    return response.data.data;
  },

  // ===== Utility Routes =====

  /**
   * Get time until daily reset
   */
  async getResetTimer(): Promise<ResetTimerResponse> {
    const response = await api.get<{ data: ResetTimerResponse }>('/contracts/reset-timer');
    return response.data.data;
  },

  /**
   * Trigger contract progress (for testing/debugging)
   */
  async triggerContractProgress(
    eventType: string,
    data: Record<string, unknown>
  ): Promise<TriggerProgressResponse> {
    const response = await api.post<{ data: TriggerProgressResponse }>(
      '/contracts/trigger',
      { eventType, data }
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Get active contracts only
   */
  async getActiveContracts(): Promise<DailyContract[]> {
    const response = await this.getDailyContracts();
    return response.contracts.filter((c) => c.status === 'active');
  },

  /**
   * Get available contracts only
   */
  async getAvailableContracts(): Promise<DailyContract[]> {
    const response = await this.getDailyContracts();
    return response.contracts.filter((c) => c.status === 'available');
  },

  /**
   * Get completed contracts only
   */
  async getCompletedContracts(): Promise<DailyContract[]> {
    const response = await this.getDailyContracts();
    return response.contracts.filter((c) => c.status === 'completed');
  },

  /**
   * Check if character can accept more contracts
   */
  async canAcceptMoreContracts(): Promise<boolean> {
    const response = await this.getDailyContracts();
    return response.activeContracts < response.availableSlots;
  },

  /**
   * Get total progress percentage for a contract
   */
  getContractProgress(contract: DailyContract): number {
    if (contract.objectives.length === 0) return 0;

    const totalProgress = contract.objectives.reduce((sum, obj) => {
      const objProgress = Math.min((obj.current / obj.target) * 100, 100);
      return sum + objProgress;
    }, 0);

    return Math.round(totalProgress / contract.objectives.length);
  },

  /**
   * Check if contract is completable
   */
  isContractCompletable(contract: DailyContract): boolean {
    return contract.objectives.every((obj) => obj.completed);
  },

  /**
   * Get difficulty color for UI
   */
  getDifficultyColor(difficulty: ContractDifficulty): string {
    const colors: Record<ContractDifficulty, string> = {
      easy: '#90EE90',
      medium: '#FFD700',
      hard: '#FF6347',
      expert: '#8B008B',
    };
    return colors[difficulty] || '#808080';
  },

  /**
   * Get contract type icon for UI
   */
  getContractTypeIcon(type: ContractType): string {
    const icons: Record<ContractType, string> = {
      combat: '⚔️',
      crafting: '🔨',
      gathering: '⛏️',
      social: '👥',
      exploration: '🗺️',
      special: '⭐',
    };
    return icons[type] || '📋';
  },

  /**
   * Format time remaining until expiration
   */
  formatTimeRemaining(expiresAt: string): string {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  },

  /**
   * Calculate total reward value (in gold equivalent)
   */
  calculateRewardValue(rewards: ContractReward[]): number {
    return rewards.reduce((total, reward) => {
      if (reward.type === 'gold') return total + (reward.amount || 0);
      // Rough equivalents for other reward types
      if (reward.type === 'experience') return total + (reward.amount || 0) * 0.1;
      if (reward.type === 'skill_points') return total + (reward.amount || 0) * 50;
      if (reward.type === 'item') return total + 100; // Base item value
      return total;
    }, 0);
  },

  /**
   * Get unclaimed streak bonuses
   */
  async getUnclaimedStreakBonuses(): Promise<StreakBonus[]> {
    const streak = await this.getStreak();
    return streak.streak.streakBonuses.filter((b) => !b.claimed);
  },

  /**
   * Check if player is on leaderboard
   */
  async isOnLeaderboard(): Promise<boolean> {
    const leaderboard = await this.getStreakLeaderboard();
    return leaderboard.playerRank !== undefined;
  },

  /**
   * Format reset time as human-readable string
   */
  formatResetTime(resetTimer: ResetTimerResponse): string {
    const { hoursUntilReset, minutesUntilReset } = resetTimer;

    if (hoursUntilReset === 0) {
      return `${minutesUntilReset}m`;
    }

    return `${hoursUntilReset}h ${minutesUntilReset}m`;
  },

  /**
   * Get contracts by type
   */
  async getContractsByType(type: ContractType): Promise<DailyContract[]> {
    const response = await this.getDailyContracts();
    return response.contracts.filter((c) => c.type === type);
  },

  /**
   * Get contracts by difficulty
   */
  async getContractsByDifficulty(difficulty: ContractDifficulty): Promise<DailyContract[]> {
    const response = await this.getDailyContracts();
    return response.contracts.filter((c) => c.difficulty === difficulty);
  },

  /**
   * Sort contracts by reward value
   */
  sortByRewardValue(contracts: DailyContract[]): DailyContract[] {
    return [...contracts].sort((a, b) => {
      const aValue = this.calculateRewardValue(a.rewards);
      const bValue = this.calculateRewardValue(b.rewards);
      return bValue - aValue;
    });
  },

  /**
   * Sort contracts by difficulty
   */
  sortByDifficulty(contracts: DailyContract[]): DailyContract[] {
    const difficultyOrder: Record<ContractDifficulty, number> = {
      easy: 1,
      medium: 2,
      hard: 3,
      expert: 4,
    };

    return [...contracts].sort((a, b) => {
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
  },

  /**
   * Sort contracts by progress
   */
  sortByProgress(contracts: DailyContract[]): DailyContract[] {
    return [...contracts].sort((a, b) => {
      return this.getContractProgress(b) - this.getContractProgress(a);
    });
  },

  /**
   * Get recommended contracts based on level and skills
   */
  filterRecommendedContracts(
    contracts: DailyContract[],
    characterLevel: number,
    characterSkills: string[]
  ): DailyContract[] {
    return contracts.filter((c) => {
      // Check level requirement
      if (c.minLevel && characterLevel < c.minLevel) return false;

      // Check skill requirements
      if (c.requiredSkills && c.requiredSkills.length > 0) {
        const hasRequiredSkills = c.requiredSkills.some((skill) =>
          characterSkills.includes(skill)
        );
        if (!hasRequiredSkills) return false;
      }

      return true;
    });
  },
};

export default dailyContractService;
