/**
 * Mentor Service
 * API client for mentor system
 */

import apiClient from './api';

export interface MentorAbilityEffect {
  stat: string;
  modifier: number;
  description: string;
}

export interface MentorAbility {
  id: string;
  name: string;
  description: string;
  trustRequired: string;
  type: 'passive' | 'active' | 'unlock';
  effects: MentorAbilityEffect[];
  cooldown?: number;
  energyCost?: number;
}

export interface MentorQuest {
  questId: string;
  trustLevelUnlock: string;
  title: string;
  description: string;
}

export interface MentorRequirements {
  minLevel?: number;
  minFactionRep?: number;
  minNpcTrust?: number;
  minCriminalRep?: number;
  completedQuests?: string[];
  noActiveBounty?: boolean;
  skills?: Record<string, number>;
}

export interface Mentor {
  mentorId: string;
  npcId: string;
  npcName: string;
  specialty: string;
  faction: string;
  location: string;
  requirements: MentorRequirements;
  abilities: MentorAbility[];
  storyline: {
    introduction: string;
    background: string;
    quests: MentorQuest[];
    finalChallenge: string;
    legacy: string;
  };
  dialogue: {
    greeting: string;
    introduction: string;
    training: string[];
    success: string[];
    failure: string[];
    farewell: string;
  };
  conflictsWith?: string[];
}

export interface Mentorship {
  characterId: string;
  mentorId: string;
  trustLevel: string;
  trustPoints: number;
  startedAt: Date;
  completedQuests: string[];
  unlockedAbilities: string[];
  lastInteraction?: Date;
}

export interface MentorEligibility {
  eligible: boolean;
  reasons: string[];
  missingRequirements: string[];
}

export interface CurrentMentorResponse {
  mentor: Mentor | null;
  mentorship: Mentorship | null;
  message?: string;
}

export interface MentorshipStats {
  totalMentors: number;
  completedMentorships: number;
  currentMentor?: string;
  totalAbilitiesUnlocked: number;
  highestTrustLevel: string;
}

class MentorService {
  /**
   * Get all mentors
   */
  async getAllMentors(): Promise<Mentor[]> {
    const response = await apiClient.get('/mentors');
    return response.data.data.mentors;
  }

  /**
   * Get mentors available to current character
   */
  async getAvailableMentors(): Promise<Mentor[]> {
    const response = await apiClient.get('/mentors/available');
    return response.data.data.mentors;
  }

  /**
   * Get specific mentor details with eligibility
   */
  async getMentorDetails(mentorId: string): Promise<{ mentor: Mentor; eligibility: MentorEligibility | null }> {
    const response = await apiClient.get(`/mentors/${mentorId}`);
    return response.data.data;
  }

  /**
   * Get current mentor and mentorship
   */
  async getCurrentMentor(): Promise<CurrentMentorResponse> {
    const response = await apiClient.get('/mentors/current');
    return response.data.data;
  }

  /**
   * Request mentorship with a mentor
   */
  async requestMentorship(mentorId: string): Promise<{ success: boolean; message: string; mentorship?: Mentorship }> {
    const response = await apiClient.post(`/mentors/${mentorId}/request`);
    return response.data.data;
  }

  /**
   * Leave current mentor
   */
  async leaveMentor(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/mentors/leave');
    return response.data.data;
  }

  /**
   * Get unlocked abilities
   */
  async getMentorAbilities(): Promise<MentorAbility[]> {
    const response = await apiClient.get('/mentors/abilities');
    return response.data.data.abilities;
  }

  /**
   * Use a mentor ability
   */
  async useAbility(abilityId: string): Promise<{ success: boolean; message: string; result?: any }> {
    const response = await apiClient.post(`/mentors/abilities/${abilityId}/use`);
    return response.data.data;
  }

  /**
   * Get mentorship statistics
   */
  async getMentorshipStats(): Promise<MentorshipStats> {
    const response = await apiClient.get('/mentors/stats');
    return response.data.data;
  }
}

export const mentorService = new MentorService();
export default mentorService;
