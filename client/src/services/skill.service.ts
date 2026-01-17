/**
 * Skill Service
 * API client for skill training endpoints
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';
import type {
  SkillsResponse,
  StartTrainingResponse,
  CompleteTrainingResponse,
  SuitBonuses,
} from '@desperados/shared';
import { logger } from '@/services/logger.service';

/**
 * Skill service for managing skill training
 * All methods support AbortSignal for request cancellation
 */
export const skillService = {
  /**
   * Get all skills and character's skill data
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getSkills(signal?: AbortSignal): Promise<ApiResponse<SkillsResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<SkillsResponse>>('/skills', { signal });
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      logger.error('Failed to get skills', error as Error, { context: 'skillService.getSkills' });
      return {
        success: false,
        error: error.message || 'Failed to get skills',
      };
    }
  },

  /**
   * Start training a skill
   * @param skillId - The skill to start training
   * @param signal - Optional AbortSignal for request cancellation
   */
  async startTraining(skillId: string, signal?: AbortSignal): Promise<ApiResponse<StartTrainingResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<StartTrainingResponse>>(
        '/skills/train',
        { skillId },
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      logger.error('Failed to start training', error as Error, { context: 'skillService.startTraining', skillId });
      return {
        success: false,
        error: error.message || 'Failed to start training',
      };
    }
  },

  /**
   * Cancel current training
   * @param signal - Optional AbortSignal for request cancellation
   */
  async cancelTraining(signal?: AbortSignal): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<ApiResponse<void>>('/skills/cancel', {}, { signal });
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      logger.error('Failed to cancel training', error as Error, { context: 'skillService.cancelTraining' });
      return {
        success: false,
        error: error.message || 'Failed to cancel training',
      };
    }
  },

  /**
   * Complete current training and claim rewards
   * @param signal - Optional AbortSignal for request cancellation
   */
  async completeTraining(signal?: AbortSignal): Promise<ApiResponse<CompleteTrainingResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<CompleteTrainingResponse>>(
        '/skills/complete',
        {},
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      logger.error('Failed to complete training', error as Error, { context: 'skillService.completeTraining' });
      return {
        success: false,
        error: error.message || 'Failed to complete training',
      };
    }
  },

  /**
   * Get skill bonuses to Destiny Deck suits
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getBonuses(signal?: AbortSignal): Promise<ApiResponse<SuitBonuses>> {
    try {
      const response = await apiClient.get<ApiResponse<SuitBonuses>>('/skills/bonuses', { signal });
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      logger.error('Failed to get bonuses', error as Error, { context: 'skillService.getBonuses' });
      return {
        success: false,
        error: error.message || 'Failed to get bonuses',
      };
    }
  },
};

export default skillService;
