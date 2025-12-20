/**
 * Quest Service
 * API client for quest management and progression
 */

import api from './api';

// ===== Types =====

export type QuestStatus = 'available' | 'active' | 'completed' | 'failed' | 'abandoned';
export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'repeatable' | 'legendary' | 'faction';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'talk' | 'visit' | 'craft' | 'gamble' | 'earn';
  target?: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  experience?: number;
  gold?: number;
  reputation?: number;
  items?: {
    itemId: string;
    name: string;
    quantity: number;
  }[];
  skillPoints?: number;
  title?: string;
}

export interface QuestDefinition {
  questId: string;
  name: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  level: number;
  requirements?: {
    level?: number;
    faction?: string;
    reputation?: number;
    completedQuests?: string[];
    items?: string[];
  };
  objectives: QuestObjective[];
  rewards: QuestReward;
  timeLimit?: number; // in minutes
  location?: string;
  npc?: string;
  chain?: {
    chainId: string;
    chainName: string;
    order: number;
    total: number;
  };
  repeatable?: boolean;
  resetInterval?: 'daily' | 'weekly';
  lore?: string;
}

export interface Quest {
  _id: string;
  characterId: string;
  questId: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  startedAt: string;
  completedAt?: string;
  expiresAt?: string;
  timesCompleted?: number;
  lastCompletedAt?: string;
  definition?: QuestDefinition;
}

export interface QuestProgress {
  questId: string;
  name: string;
  progress: number; // percentage 0-100
  objectives: QuestObjective[];
  timeRemaining?: number; // in minutes
}

export interface QuestChain {
  chainId: string;
  chainName: string;
  description: string;
  totalQuests: number;
  completedQuests: number;
  currentQuest?: string;
  rewards?: QuestReward;
}

// ===== Request/Response Types =====

export interface GetAvailableQuestsResponse {
  quests: QuestDefinition[];
}

export interface GetActiveQuestsResponse {
  quests: Quest[];
}

export interface GetCompletedQuestsResponse {
  quests: Quest[];
}

export interface AcceptQuestRequest {
  questId: string;
}

export interface AcceptQuestResponse {
  message: string;
  quest: Quest;
  definition: QuestDefinition;
}

export interface AbandonQuestRequest {
  questId: string;
}

export interface AbandonQuestResponse {
  message: string;
  questId: string;
}

export interface GetQuestDetailsResponse {
  quest: Quest;
  definition: QuestDefinition;
  chain?: QuestChain;
}

// ===== Quest Service =====

export const questService = {
  // ===== Authenticated Routes =====

  /**
   * Get available quests for character
   */
  async getAvailableQuests(): Promise<GetAvailableQuestsResponse> {
    const response = await api.get<{ data: GetAvailableQuestsResponse }>('/quests/available');
    return response.data.data;
  },

  /**
   * Get character's active quests
   */
  async getActiveQuests(): Promise<GetActiveQuestsResponse> {
    const response = await api.get<{ data: GetActiveQuestsResponse }>('/quests/active');
    return response.data.data;
  },

  /**
   * Get character's completed quests
   */
  async getCompletedQuests(): Promise<GetCompletedQuestsResponse> {
    const response = await api.get<{ data: GetCompletedQuestsResponse }>('/quests/completed');
    return response.data.data;
  },

  /**
   * Accept a quest
   */
  async acceptQuest(questId: string): Promise<AcceptQuestResponse> {
    const response = await api.post<{ data: AcceptQuestResponse }>('/quests/accept', {
      questId,
    });
    return response.data.data;
  },

  /**
   * Abandon an active quest
   */
  async abandonQuest(questId: string): Promise<AbandonQuestResponse> {
    const response = await api.post<{ data: AbandonQuestResponse }>('/quests/abandon', {
      questId,
    });
    return response.data.data;
  },

  /**
   * Get details for a specific quest
   */
  async getQuestDetails(questId: string): Promise<GetQuestDetailsResponse> {
    const response = await api.get<{ data: GetQuestDetailsResponse }>(`/quests/${questId}`);
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if character meets quest requirements
   */
  meetsRequirements(
    characterLevel: number,
    characterFaction: string,
    characterReputation: number,
    completedQuestIds: string[],
    quest: QuestDefinition
  ): { canAccept: boolean; reason?: string } {
    if (!quest.requirements) {
      return { canAccept: true };
    }

    if (quest.requirements.level && characterLevel < quest.requirements.level) {
      return { canAccept: false, reason: `Requires level ${quest.requirements.level}` };
    }

    if (quest.requirements.faction && characterFaction !== quest.requirements.faction) {
      return { canAccept: false, reason: `Requires faction: ${quest.requirements.faction}` };
    }

    if (quest.requirements.reputation && characterReputation < quest.requirements.reputation) {
      return { canAccept: false, reason: `Requires ${quest.requirements.reputation} reputation` };
    }

    if (quest.requirements.completedQuests) {
      const missingQuests = quest.requirements.completedQuests.filter(
        (qId) => !completedQuestIds.includes(qId)
      );
      if (missingQuests.length > 0) {
        return { canAccept: false, reason: 'Requires completion of previous quests' };
      }
    }

    return { canAccept: true };
  },

  /**
   * Calculate quest completion percentage
   */
  calculateProgress(quest: Quest): number {
    if (!quest.objectives || quest.objectives.length === 0) return 0;

    const totalObjectives = quest.objectives.length;
    const completedObjectives = quest.objectives.filter((obj) => obj.completed).length;

    return Math.round((completedObjectives / totalObjectives) * 100);
  },

  /**
   * Get time remaining for timed quests
   */
  getTimeRemaining(quest: Quest): number | null {
    if (!quest.expiresAt) return null;

    const expiresAt = new Date(quest.expiresAt);
    const now = new Date();
    const remaining = expiresAt.getTime() - now.getTime();

    return remaining > 0 ? Math.floor(remaining / 60000) : 0; // Convert to minutes
  },

  /**
   * Check if quest is expired
   */
  isExpired(quest: Quest): boolean {
    if (!quest.expiresAt) return false;

    const expiresAt = new Date(quest.expiresAt);
    const now = new Date();

    return now > expiresAt;
  },

  /**
   * Format quest rewards as readable string
   */
  formatRewards(rewards: QuestReward): string {
    const parts: string[] = [];

    if (rewards.experience) parts.push(`${rewards.experience} XP`);
    if (rewards.gold) parts.push(`${rewards.gold} Gold`);
    if (rewards.reputation) parts.push(`${rewards.reputation} Reputation`);
    if (rewards.skillPoints) parts.push(`${rewards.skillPoints} Skill Points`);
    if (rewards.items && rewards.items.length > 0) {
      parts.push(`${rewards.items.length} item(s)`);
    }
    if (rewards.title) parts.push(`Title: ${rewards.title}`);

    return parts.join(', ');
  },

  /**
   * Filter quests by type
   */
  filterByType(quests: QuestDefinition[], type: QuestType): QuestDefinition[] {
    return quests.filter((quest) => quest.type === type);
  },

  /**
   * Filter quests by difficulty
   */
  filterByDifficulty(quests: QuestDefinition[], difficulty: QuestDifficulty): QuestDefinition[] {
    return quests.filter((quest) => quest.difficulty === difficulty);
  },

  /**
   * Sort quests by level requirement
   */
  sortByLevel(quests: QuestDefinition[], ascending = true): QuestDefinition[] {
    return [...quests].sort((a, b) => (ascending ? a.level - b.level : b.level - a.level));
  },

  /**
   * Sort quests by reward value
   */
  sortByReward(quests: QuestDefinition[], ascending = false): QuestDefinition[] {
    return [...quests].sort((a, b) => {
      const aValue = (a.rewards.experience || 0) + (a.rewards.gold || 0) * 10;
      const bValue = (b.rewards.experience || 0) + (b.rewards.gold || 0) * 10;
      return ascending ? aValue - bValue : bValue - aValue;
    });
  },

  /**
   * Get quest chains from quest list
   */
  getQuestChains(quests: QuestDefinition[]): Map<string, QuestDefinition[]> {
    const chains = new Map<string, QuestDefinition[]>();

    quests.forEach((quest) => {
      if (quest.chain) {
        const existing = chains.get(quest.chain.chainId) || [];
        existing.push(quest);
        chains.set(quest.chain.chainId, existing);
      }
    });

    return chains;
  },
};

export default questService;
