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

/**
 * Skill service for managing skill training
 */
export const skillService = {
  /**
   * Get all skills and character's skill data
   */
  async getSkills(): Promise<ApiResponse<SkillsResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<SkillsResponse>>('/skills');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get skills:', error);
      return {
        success: false,
        error: error.message || 'Failed to get skills',
      };
    }
  },

  /**
   * Start training a skill
   */
  async startTraining(skillId: string): Promise<ApiResponse<StartTrainingResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<StartTrainingResponse>>(
        '/skills/train',
        { skillId }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to start training:', error);
      return {
        success: false,
        error: error.message || 'Failed to start training',
      };
    }
  },

  /**
   * Cancel current training
   */
  async cancelTraining(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<ApiResponse<void>>('/skills/cancel');
      return response.data;
    } catch (error: any) {
      console.error('Failed to cancel training:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel training',
      };
    }
  },

  /**
   * Complete current training and claim rewards
   */
  async completeTraining(): Promise<ApiResponse<CompleteTrainingResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<CompleteTrainingResponse>>(
        '/skills/complete'
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to complete training:', error);
      return {
        success: false,
        error: error.message || 'Failed to complete training',
      };
    }
  },

  /**
   * Get skill bonuses to Destiny Deck suits
   */
  async getBonuses(): Promise<ApiResponse<SuitBonuses>> {
    try {
      const response = await apiClient.get<ApiResponse<SuitBonuses>>('/skills/bonuses');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get bonuses:', error);
      return {
        success: false,
        error: error.message || 'Failed to get bonuses',
      };
    }
  },
};

export default skillService;
