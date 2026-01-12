/**
 * Skill Training Service
 * API client for skill training activities at the Academy and other locations
 */

import api from './api';
import type { SkillTrainingActivity } from '@desperados/shared';

// ===== Types =====

export interface TrainingResult {
  success: boolean;
  message: string;
  activityId: string;
  activityName: string;
  skillId: string;
  skillName: string;
  resultCategory: 'great_success' | 'success' | 'partial' | 'failure';
  skillRoll: number;
  difficultyClass: number;
  isCritical: boolean;
  skillXpGained: number;
  characterXpGained: number;
  goldGained: number;
  skillLevelUp?: {
    skillId: string;
    oldLevel: number;
    newLevel: number;
  };
  characterLevelUp?: boolean;
  cooldownEndsAt: string;
  energySpent: number;
  consequences?: {
    injuryTaken?: number;
    goldLost?: number;
  };
  moralReputationChange?: {
    action: string;
    change: number;
    newReputation: number;
  };
}

export interface ActivityCooldown {
  activityId: string;
  endsAt: string;
  remainingSeconds: number;
}

export interface ActivitiesResponse {
  activities: SkillTrainingActivity[];
  available: SkillTrainingActivity[];
  cooldowns: ActivityCooldown[];
  stats: {
    totalActivities: number;
    level1Available: number;
    byCategory: Record<string, number>;
    byRiskLevel: Record<string, number>;
    moralReputationActivities: number;
  };
}

export interface TrainingRequirements {
  canTrain: boolean;
  errors: string[];
  missingRequirements: {
    skillLevel?: { required: number; current: number };
    energy?: { required: number; current: number };
    horse?: boolean;
    gang?: boolean;
    item?: string;
  };
  cooldownRemaining?: number;
}

// ===== Service =====

export const skillTrainingService = {
  /**
   * Get available training activities for the current character
   * @param locationType Optional location type filter (e.g., 'skill_academy')
   */
  async getActivities(locationType?: string): Promise<ActivitiesResponse> {
    const params = locationType ? { location: locationType } : {};
    const response = await api.get('/skill-training/activities', { params });
    return response.data.data;
  },

  /**
   * Get activities available at Level 1 (no requirements)
   */
  async getLevel1Activities(): Promise<SkillTrainingActivity[]> {
    const response = await api.get('/skill-training/level1');
    return response.data.data.activities;
  },

  /**
   * Check requirements for a specific training activity
   */
  async checkRequirements(activityId: string): Promise<{
    activity: SkillTrainingActivity;
    requirements: TrainingRequirements;
  }> {
    const response = await api.get(`/skill-training/check/${activityId}`);
    return response.data.data;
  },

  /**
   * Get all cooldowns for the current character
   */
  async getCooldowns(): Promise<ActivityCooldown[]> {
    const response = await api.get('/skill-training/cooldowns');
    return response.data.data.cooldowns;
  },

  /**
   * Perform a training activity
   */
  async performTraining(activityId: string): Promise<TrainingResult> {
    const response = await api.post('/skill-training/perform', { activityId });
    return response.data.data;
  },

  /**
   * Get training activity stats (public endpoint)
   */
  async getStats(): Promise<ActivitiesResponse['stats']> {
    const response = await api.get('/skill-training/stats');
    return response.data.data;
  },
};

export default skillTrainingService;
