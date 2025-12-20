/**
 * Tutorial Service
 * Client-side API service for tutorial rewards and analytics
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';
import { logger } from '@/services/logger.service';

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
};

export default tutorialService;
