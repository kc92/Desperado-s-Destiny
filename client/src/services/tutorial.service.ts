/**
 * Tutorial Service
 * Client-side API service for tutorial rewards and analytics
 *
 * Phase 16: Enhanced with Hawk mentorship system API
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';
import { logger } from '@/services/logger.service';

// ============================================================================
// LEGACY TYPES
// ============================================================================

export interface TutorialRewardResult {
  stepId: string;
  rewards: {
    gold: number;
    xp: number;
    items: Array<{ itemId: string; quantity: number }>;
    leveledUp: boolean;
    newLevel?: number;
  };
  character?: {
    gold: number;
    experience: number;
    level: number;
  };
}

export interface TutorialProgressResult {
  claimedSteps: string[];
  availableRewards: Array<{
    stepId: string;
    gold?: number;
    xp?: number;
    items?: Array<{ itemId: string; quantity: number }>;
  }>;
}

export interface TutorialAnalyticsData {
  event: 'skip' | 'complete' | 'section_complete';
  sectionId?: string;
  stepId?: string;
  progress?: number;
  timeSpentMs?: number;
  tutorialType?: 'core' | 'deep_dive';
}

// ============================================================================
// PHASE 16 TYPES
// ============================================================================

export type TutorialPhase =
  | 'not_started'
  | 'awakening'
  | 'first_combat'
  | 'survival'
  | 'skill_training'
  | 'contracts'
  | 'social'
  | 'faction_intro'
  | 'gang_basics'
  | 'graduation'
  | 'completed'
  | 'skipped';

export type HawkExpression =
  | 'neutral'
  | 'teaching'
  | 'warning'
  | 'pleased'
  | 'thinking'
  | 'concerned'
  | 'amused'
  | 'proud'
  | 'farewell'
  | 'combat_ready';

export type HawkMood =
  | 'friendly'
  | 'concerned'
  | 'proud'
  | 'urgent'
  | 'nostalgic';

export type DialogueTrigger =
  | 'phase_start'
  | 'phase_complete'
  | 'step_complete'
  | 'first_time'
  | 'struggling'
  | 'success'
  | 'idle'
  | 'returning'
  | 'low_energy'
  | 'low_health'
  | 'level_up'
  | 'combat_loss'
  | 'combat_win'
  | 'first_skill'
  | 'first_contract'
  | 'easter_egg'
  | 'farewell';

export interface TutorialStatus {
  characterId: string;
  isActive: boolean;
  currentPhase: TutorialPhase;
  currentStep: number;
  totalSteps: number;
  phaseName: string;
  phaseProgress: number;
  overallProgress: number;
  phasesCompleted: TutorialPhase[];
  milestonesEarned: string[];
  mechanicsLearned: string[];
  wasSkipped: boolean;
  isGraduated: boolean;
  autoSkipped?: boolean;
  hawk: {
    isActive: boolean;
    expression: HawkExpression;
    mood: HawkMood;
  } | null;
}

export interface HawkDialogue {
  text: string;
  expression: HawkExpression;
  voiceHint?: string;
  duration: number;
  hasChoice?: boolean;
  choices?: Array<{ id: string; text: string }>;
}

export interface ContextualTip {
  tipId: string;
  text: string;
  expression: HawkExpression;
  priority: 'low' | 'medium' | 'high';
  dismissable: boolean;
}

export interface TutorialMilestone {
  id: string;
  phase: TutorialPhase;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  dollarsReward: number;
  itemReward?: { itemId: string; quantity: number };
}

export interface MilestoneAwardResult {
  milestoneId: string;
  milestoneName: string;
  xpAwarded: number;
  dollarsAwarded: number;
  itemsAwarded: Array<{ itemId: string; quantity: number }>;
  leveledUp: boolean;
  newLevel?: number;
}

export interface InitializeResult {
  phase: TutorialPhase;
  step: number;
  phaseName: string;
  hawkDialogue: HawkDialogue | null;
}

export interface AdvanceResult {
  newStep: number;
  phaseComplete: boolean;
  hawkDialogue?: HawkDialogue;
}

export interface CompletePhaseResult {
  previousPhase: TutorialPhase;
  newPhase: TutorialPhase;
  newPhaseName: string;
  milestone: MilestoneAwardResult | null;
  hawkDialogue: HawkDialogue;
  isGraduation: boolean;
}

export interface GraduationRewards {
  totalXp: number;
  totalDollars: number;
  specialItem: {
    itemId: string;
    name: string;
    description: string;
  };
  milestonesEarned: string[];
}

export interface MilestonesResult {
  earned: TutorialMilestone[];
  available: TutorialMilestone[];
  total: number;
  progress: number;
}

export const tutorialService = {
  /**
   * Claim rewards for completing a tutorial step
   */
  claimReward: async (stepId: string, characterId: string): Promise<ApiResponse<TutorialRewardResult>> => {
    try {
      const response = await apiClient.post<ApiResponse<TutorialRewardResult>>(
        '/tutorial/claim-reward',
        { stepId, characterId }
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to claim reward', error as Error, { context: 'tutorialService.claimReward', stepId, characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to claim reward',
      };
    }
  },

  /**
   * Get tutorial progress for a character
   */
  getProgress: async (characterId: string): Promise<ApiResponse<TutorialProgressResult>> => {
    try {
      const response = await apiClient.get<ApiResponse<TutorialProgressResult>>(
        `/tutorial/progress/${characterId}`
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to get progress', error as Error, { context: 'tutorialService.getProgress', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get progress',
      };
    }
  },

  /**
   * Track tutorial analytics
   */
  trackAnalytics: async (characterId: string, data: TutorialAnalyticsData): Promise<ApiResponse<{ recorded: boolean }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ recorded: boolean }>>(
        '/tutorial/analytics',
        { characterId, ...data }
      );
      return response.data;
    } catch (error: any) {
      // Don't throw on analytics failures - just log
      logger.warn('[Tutorial Service] Failed to track analytics', { context: 'tutorialService.trackAnalytics', characterId, data, error });
      return {
        success: false,
        error: 'Analytics tracking failed',
      };
    }
  },

  // ============================================================================
  // PHASE 16: HAWK MENTORSHIP SYSTEM API
  // ============================================================================

  /**
   * Get complete tutorial status including Hawk companion state
   */
  getStatus: async (characterId: string): Promise<ApiResponse<TutorialStatus>> => {
    try {
      const response = await apiClient.get<ApiResponse<TutorialStatus>>(
        `/tutorial/status/${characterId}`
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to get status', error as Error, { context: 'tutorialService.getStatus', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get tutorial status',
      };
    }
  },

  /**
   * Initialize tutorial for a new character
   */
  initialize: async (characterId: string): Promise<ApiResponse<InitializeResult>> => {
    try {
      const response = await apiClient.post<ApiResponse<InitializeResult>>(
        '/tutorial/initialize',
        { characterId }
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to initialize', error as Error, { context: 'tutorialService.initialize', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to initialize tutorial',
      };
    }
  },

  /**
   * Advance to next step within current phase
   */
  advanceStep: async (characterId: string, objectiveCompleted?: string): Promise<ApiResponse<AdvanceResult>> => {
    try {
      const response = await apiClient.post<ApiResponse<AdvanceResult>>(
        '/tutorial/advance',
        { characterId, objectiveCompleted }
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to advance step', error as Error, { context: 'tutorialService.advanceStep', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to advance step',
      };
    }
  },

  /**
   * Complete current phase and transition to next
   */
  completePhase: async (characterId: string): Promise<ApiResponse<CompletePhaseResult>> => {
    try {
      const response = await apiClient.post<ApiResponse<CompletePhaseResult>>(
        '/tutorial/complete-phase',
        { characterId }
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to complete phase', error as Error, { context: 'tutorialService.completePhase', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to complete phase',
      };
    }
  },

  /**
   * Skip tutorial entirely
   */
  skip: async (characterId: string, reason: 'user_request' | 'overlevel' | 'returning_player' = 'user_request'): Promise<ApiResponse<{ skipped: boolean; message: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ skipped: boolean; message: string }>>(
        '/tutorial/skip',
        { characterId, reason }
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to skip tutorial', error as Error, { context: 'tutorialService.skip', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to skip tutorial',
      };
    }
  },

  /**
   * Resume tutorial after disconnect/break
   */
  resume: async (characterId: string): Promise<ApiResponse<{ currentPhase: TutorialPhase; currentStep: number; phaseName: string; hawkDialogue: HawkDialogue }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ currentPhase: TutorialPhase; currentStep: number; phaseName: string; hawkDialogue: HawkDialogue }>>(
        '/tutorial/resume',
        { characterId }
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to resume tutorial', error as Error, { context: 'tutorialService.resume', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to resume tutorial',
      };
    }
  },

  // ============================================================================
  // HAWK DIALOGUE API
  // ============================================================================

  /**
   * Get contextual Hawk dialogue
   */
  getHawkDialogue: async (characterId: string, trigger?: DialogueTrigger, context?: Record<string, unknown>): Promise<ApiResponse<HawkDialogue | null>> => {
    try {
      const params = new URLSearchParams();
      if (trigger) params.append('trigger', trigger);
      if (context) params.append('context', JSON.stringify(context));

      const response = await apiClient.get<ApiResponse<HawkDialogue | null>>(
        `/tutorial/hawk/dialogue/${characterId}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to get Hawk dialogue', error as Error, { context: 'tutorialService.getHawkDialogue', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get dialogue',
      };
    }
  },

  /**
   * Record player interaction with Hawk
   */
  interactWithHawk: async (characterId: string, topic?: string): Promise<ApiResponse<{ dialogue: HawkDialogue | null; topic: string | null }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ dialogue: HawkDialogue | null; topic: string | null }>>(
        '/tutorial/hawk/interact',
        { characterId, topic }
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to interact with Hawk', error as Error, { context: 'tutorialService.interactWithHawk', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to interact with Hawk',
      };
    }
  },

  /**
   * Get contextual tip based on game state
   */
  getContextualTip: async (characterId: string): Promise<ApiResponse<ContextualTip | null>> => {
    try {
      const response = await apiClient.get<ApiResponse<ContextualTip | null>>(
        `/tutorial/hawk/tip/${characterId}`
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to get contextual tip', error as Error, { context: 'tutorialService.getContextualTip', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get tip',
      };
    }
  },

  /**
   * Mark a tip as shown
   */
  markTipShown: async (characterId: string, tipId: string): Promise<ApiResponse<{ tipId: string; marked: boolean }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ tipId: string; marked: boolean }>>(
        `/tutorial/hawk/tip/${tipId}/shown`,
        { characterId }
      );
      return response.data;
    } catch (error: any) {
      // Non-critical - just log
      logger.warn('[Tutorial Service] Failed to mark tip shown', { context: 'tutorialService.markTipShown', characterId, tipId, error });
      return {
        success: false,
        error: 'Failed to mark tip shown',
      };
    }
  },

  // ============================================================================
  // MILESTONE API
  // ============================================================================

  /**
   * Get player's tutorial milestones
   */
  getMilestones: async (characterId: string): Promise<ApiResponse<MilestonesResult>> => {
    try {
      const response = await apiClient.get<ApiResponse<MilestonesResult>>(
        `/tutorial/milestones/${characterId}`
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to get milestones', error as Error, { context: 'tutorialService.getMilestones', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get milestones',
      };
    }
  },

  /**
   * Complete graduation ceremony
   */
  completeGraduation: async (characterId: string): Promise<ApiResponse<{ graduated: boolean; rewards: GraduationRewards; message: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ graduated: boolean; rewards: GraduationRewards; message: string }>>(
        '/tutorial/graduation/complete',
        { characterId }
      );
      return response.data;
    } catch (error: any) {
      logger.error('[Tutorial Service] Failed to complete graduation', error as Error, { context: 'tutorialService.completeGraduation', characterId });
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to complete graduation',
      };
    }
  },
};

export default tutorialService;
