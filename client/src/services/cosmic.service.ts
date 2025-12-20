/**
 * Cosmic Service
 * API client for the Cosmic Quest and Cosmic Ending systems
 */

import api from './api';

// ===== Types =====

export type EndingType = 'banishment' | 'destruction' | 'bargain' | 'awakening';
export type CorruptionLevel = 'pristine' | 'tainted' | 'corrupted' | 'consumed' | 'ascended';

export interface CosmicQuest {
  id: string;
  name: string;
  description: string;
  chapter: number;
  objectives: CosmicObjective[];
  prerequisites: string[];
  isCompleted: boolean;
  isActive: boolean;
  rewards: CosmicReward;
  choices?: CosmicChoice[];
}

export interface CosmicObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'discover' | 'ritual' | 'choice' | 'explore';
  target?: string;
  required: number;
  current: number;
  isCompleted: boolean;
  isOptional: boolean;
}

export interface CosmicChoice {
  id: string;
  description: string;
  consequence: string;
  corruptionImpact: number;
  isChosen: boolean;
}

export interface CosmicReward {
  xp: number;
  gold: number;
  corruption?: number;
  items?: string[];
  knowledge?: string;
  title?: string;
}

export interface CosmicProgress {
  started: boolean;
  chapter: number;
  totalChapters: number;
  currentQuest?: string;
  completedQuests: string[];
  majorChoices: Array<{
    questId: string;
    choiceId: string;
    description: string;
  }>;
  totalCorruptionGained: number;
  knowledgeDiscovered: string[];
  predictedEnding?: EndingType;
}

export interface CorruptionState {
  level: CorruptionLevel;
  currentCorruption: number;
  maxCorruption: number;
  effects: string[];
  mutations?: string[];
  resistanceToHoly: number;
  vulnerabilityToLight: number;
}

export interface LoreEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  discoveredAt: string;
  source: string;
}

export interface VisionEntry {
  id: string;
  title: string;
  description: string;
  imagery: string;
  meaning?: string;
  experiencedAt: string;
  questId?: string;
}

export interface EndingPrediction {
  predictedEnding: EndingType;
  confidence: number;
  factors: Array<{
    factor: string;
    weight: number;
    contribution: string;
  }>;
  alternativeEndings: Array<{
    type: EndingType;
    probability: number;
  }>;
}

export interface EndingReward {
  endingType: EndingType;
  title: string;
  description: string;
  rewards: {
    gold: number;
    items: string[];
    permanentEffects: string[];
    achievements: string[];
  };
  consequences: string[];
}

export interface TriggerEndingResult {
  success: boolean;
  endingType: EndingType;
  narrative: string;
  rewards: EndingReward;
  message: string;
}

// ===== Request/Response Types =====

export interface StartStorylineResponse {
  success: boolean;
  progress: CosmicProgress;
  firstQuest: CosmicQuest;
  message: string;
}

export interface CompleteObjectiveResponse {
  success: boolean;
  objective: CosmicObjective;
  questComplete: boolean;
  rewards?: CosmicReward;
  message: string;
}

export interface CompleteQuestResponse {
  success: boolean;
  quest: CosmicQuest;
  rewards: CosmicReward;
  nextQuest?: CosmicQuest;
  chapterComplete: boolean;
  message: string;
}

export interface MakeChoiceResponse {
  success: boolean;
  choice: CosmicChoice;
  corruptionChange: number;
  consequences: string[];
  message: string;
}

// ===== Cosmic Service =====

export const cosmicService = {
  // ===== Cosmic Quest Routes =====

  /**
   * Start the cosmic questline (requires level 25)
   */
  async startStoryline(): Promise<StartStorylineResponse> {
    const response = await api.post<{ data: StartStorylineResponse }>('/cosmic/start');
    return response.data.data;
  },

  /**
   * Get current cosmic quest progress
   */
  async getProgress(): Promise<CosmicProgress> {
    const response = await api.get<{ data: CosmicProgress }>('/cosmic/progress');
    return response.data.data;
  },

  /**
   * Get available cosmic quests
   */
  async getAvailableQuests(): Promise<CosmicQuest[]> {
    const response = await api.get<{ data: { quests: CosmicQuest[] } }>('/cosmic/quests');
    return response.data.data?.quests || [];
  },

  /**
   * Complete a quest objective
   */
  async completeObjective(
    questId: string,
    objectiveId: string
  ): Promise<CompleteObjectiveResponse> {
    const response = await api.post<{ data: CompleteObjectiveResponse }>(
      `/cosmic/quests/${questId}/objectives/${objectiveId}/complete`
    );
    return response.data.data;
  },

  /**
   * Complete a cosmic quest
   */
  async completeQuest(questId: string): Promise<CompleteQuestResponse> {
    const response = await api.post<{ data: CompleteQuestResponse }>(
      `/cosmic/quests/${questId}/complete`
    );
    return response.data.data;
  },

  /**
   * Make a major choice in the questline
   */
  async makeChoice(questId: string, choiceId: string): Promise<MakeChoiceResponse> {
    const response = await api.post<{ data: MakeChoiceResponse }>(
      `/cosmic/quests/${questId}/choices/${choiceId}`
    );
    return response.data.data;
  },

  /**
   * Get corruption state from cosmic questline
   */
  async getCorruptionState(): Promise<CorruptionState> {
    const response = await api.get<{ data: CorruptionState }>('/cosmic/corruption');
    return response.data.data;
  },

  /**
   * Get discovered lore
   */
  async getDiscoveredLore(category?: string): Promise<LoreEntry[]> {
    const response = await api.get<{ data: { lore: LoreEntry[] } }>('/cosmic/lore', {
      params: category ? { category } : {},
    });
    return response.data.data?.lore || [];
  },

  /**
   * Get experienced visions
   */
  async getVisions(): Promise<VisionEntry[]> {
    const response = await api.get<{ data: { visions: VisionEntry[] } }>('/cosmic/visions');
    return response.data.data?.visions || [];
  },

  // ===== Cosmic Ending Routes =====

  /**
   * Predict likely ending based on current choices
   */
  async predictEnding(): Promise<EndingPrediction> {
    const response = await api.get<{ data: EndingPrediction }>('/cosmic/ending/predict');
    return response.data.data;
  },

  /**
   * Trigger a specific ending
   */
  async triggerEnding(endingType: EndingType): Promise<TriggerEndingResult> {
    const response = await api.post<{ data: TriggerEndingResult }>(
      `/cosmic/ending/trigger/${endingType}`
    );
    return response.data.data;
  },

  /**
   * Get rewards for a specific ending type
   */
  async getEndingRewards(endingType: EndingType): Promise<EndingReward> {
    const response = await api.get<{ data: EndingReward }>(
      `/cosmic/ending/rewards/${endingType}`
    );
    return response.data.data;
  },
};

export default cosmicService;
