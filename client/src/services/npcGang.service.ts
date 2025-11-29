/**
 * NPC Gang Service
 * API client for NPC gang conflict system
 */

import apiClient from './api';

export interface NPCGangLeader {
  name: string;
  title: string;
  level: number;
  maxHP: number;
  description: string;
  abilities: string[];
  loot: {
    goldMin: number;
    goldMax: number;
    uniqueItems: string[];
  };
}

export interface NPCGangMission {
  id: string;
  gangId: string;
  name: string;
  description: string;
  type: string;
  requirements: Array<{
    type: string;
    value: number;
    description: string;
  }>;
  rewards: Array<{
    type: string;
    amount?: number;
    itemId?: string;
    zoneId?: string;
    description: string;
  }>;
  minRelationship: number;
  cooldown: number;
  repeatable: boolean;
  difficulty: number;
}

export interface NPCGang {
  id: string;
  name: string;
  description: string;
  leader: NPCGangLeader;
  strength: number;
  specialty: string[];
  controlledZones: string[];
  tributeCost: number;
  baseTribute: number;
  attitude: string;
  backstory: string;
  allies: string[];
  enemies: string[];
  missions: NPCGangMission[];
}

export interface NPCGangRelationship {
  gangId: string;
  npcGangId: string;
  reputation: number;
  attitude: string;
  lastTribute?: Date;
  activeChallenge?: {
    zoneId: string;
    missionsCompleted: number;
    startedAt: Date;
  };
  completedMissions: string[];
  totalTributePaid: number;
}

export interface NPCGangOverview {
  gang: NPCGang;
  relationship: NPCGangRelationship;
  availableMissions: NPCGangMission[];
  activeMissions: any[];
  canChallenge: boolean;
  challengeRequirements?: string[];
}

class NPCGangService {
  /**
   * Get all NPC gangs
   */
  async getAllGangs(): Promise<NPCGang[]> {
    const response = await apiClient.get('/npc-gangs');
    return response.data.data;
  }

  /**
   * Get specific NPC gang details
   */
  async getGangDetails(gangId: string): Promise<NPCGang> {
    const response = await apiClient.get(`/npc-gangs/${gangId}`);
    return response.data.data;
  }

  /**
   * Get comprehensive overview of NPC gang for player
   */
  async getGangOverview(gangId: string): Promise<NPCGangOverview> {
    const response = await apiClient.get(`/npc-gangs/${gangId}/overview`);
    return response.data.data;
  }

  /**
   * Get player gang's relationship with NPC gang
   */
  async getRelationship(gangId: string): Promise<NPCGangRelationship> {
    const response = await apiClient.get(`/npc-gangs/${gangId}/relationship`);
    return response.data.data;
  }

  /**
   * Get all NPC gang relationships for player gang
   */
  async getAllRelationships(): Promise<NPCGangRelationship[]> {
    const response = await apiClient.get('/npc-gangs/relationships');
    return response.data.data;
  }

  /**
   * Pay tribute to NPC gang
   */
  async payTribute(gangId: string): Promise<{ success: boolean; message: string; newReputation?: number }> {
    const response = await apiClient.post(`/npc-gangs/${gangId}/tribute`);
    return response.data;
  }

  /**
   * Get available missions from NPC gang
   */
  async getAvailableMissions(gangId: string): Promise<{ missions: NPCGangMission[]; activeMissions: any[] }> {
    const response = await apiClient.get(`/npc-gangs/${gangId}/missions`);
    return response.data.data;
  }

  /**
   * Accept mission from NPC gang
   */
  async acceptMission(gangId: string, missionId: string): Promise<{ success: boolean; message: string; mission?: any }> {
    const response = await apiClient.post(`/npc-gangs/${gangId}/missions/${missionId}`);
    return response.data;
  }

  /**
   * Challenge NPC gang for territory
   */
  async challengeTerritory(gangId: string, zoneId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/npc-gangs/${gangId}/challenge`, { zoneId });
    return response.data;
  }

  /**
   * Complete challenge mission
   */
  async completeChallengeMission(gangId: string, missionType: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/npc-gangs/${gangId}/challenge/mission`, { missionType });
    return response.data;
  }

  /**
   * Fight final battle for territory
   */
  async fightFinalBattle(gangId: string): Promise<{ victory: boolean; message: string; rewards?: any }> {
    const response = await apiClient.post(`/npc-gangs/${gangId}/challenge/final-battle`);
    return response.data;
  }
}

export const npcGangService = new NPCGangService();
export default npcGangService;
