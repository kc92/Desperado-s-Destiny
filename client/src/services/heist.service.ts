/**
 * Heist Service
 * API client for gang heist operations
 */

import api from './api';

// ===== Types =====

export type HeistTarget =
  | 'bank_vault'
  | 'train_robbery'
  | 'stagecoach'
  | 'mine_payroll'
  | 'ranch_estate'
  | 'merchant_warehouse'
  | 'casino_vault'
  | 'government_office';

export type HeistRole =
  | 'leader'
  | 'gunslinger'
  | 'explosives_expert'
  | 'lockpicker'
  | 'lookout'
  | 'driver'
  | 'distraction';

export type HeistStatus = 'planning' | 'ready' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface HeistRoleAssignment {
  role: HeistRole;
  characterId: string;
  characterName?: string;
}

export interface HeistTargetInfo {
  id: HeistTarget;
  name: string;
  description: string;
  difficulty: number;
  minGangLevel: number;
  minGangMembers: number;
  requiredRoles: HeistRole[];
  optionalRoles: HeistRole[];
  planningTimeRequired: number;
  estimatedReward: {
    min: number;
    max: number;
  };
  risks: string[];
  requirements?: {
    minLevel?: number;
    minReputation?: number;
    requiredSkills?: { skill: string; level: number }[];
  };
}

export interface Heist {
  _id: string;
  gangId: string;
  gangName?: string;
  target: HeistTarget;
  targetInfo?: HeistTargetInfo;
  status: HeistStatus;
  planningProgress: number;
  planningRequired: number;
  roleAssignments: HeistRoleAssignment[];
  leaderId: string;
  leaderName?: string;
  participants: string[];
  createdAt: string;
  plannedExecutionTime?: string;
  executedAt?: string;
  completedAt?: string;
  result?: {
    success: boolean;
    loot: number;
    casualties: number;
    experience: number;
    reputationChange: number;
    description: string;
  };
}

export interface HeistHistoryEntry {
  _id: string;
  target: HeistTarget;
  targetName: string;
  status: HeistStatus;
  executedAt?: string;
  completedAt: string;
  result?: {
    success: boolean;
    loot: number;
  };
}

// ===== Request/Response Types =====

export interface AvailableHeistsResponse {
  availableTargets: HeistTargetInfo[];
  gangLevel: number;
  gangMemberCount: number;
}

export interface GangHeistsResponse {
  heists: Heist[];
  activeHeist?: Heist;
  completedCount: number;
}

export interface PlanHeistRequest {
  target: HeistTarget;
  roleAssignments?: HeistRoleAssignment[];
}

export interface PlanHeistResponse {
  heist: Heist;
  message: string;
}

export interface IncreaseProgressRequest {
  amount?: number;
}

export interface IncreaseProgressResponse {
  heist: Heist;
  progressAdded: number;
  message: string;
}

export interface ExecuteHeistResponse {
  result: {
    success: boolean;
    loot: number;
    casualties: number;
    experience: number;
    reputationChange: number;
    description: string;
    participantRewards: {
      characterId: string;
      characterName: string;
      goldEarned: number;
      experienceEarned: number;
    }[];
  };
  message: string;
}

export interface CancelHeistResponse {
  message: string;
  refundAmount?: number;
}

export interface AssignRoleRequest {
  role: HeistRole;
  targetCharacterId: string;
}

export interface AssignRoleResponse {
  heist: Heist;
  message: string;
}

// ===== Heist Service =====

export const heistService = {
  // ===== Get Available Heists =====

  /**
   * Get available heist targets for the character's gang
   */
  async getAvailableHeists(): Promise<AvailableHeistsResponse> {
    const response = await api.get<{ data: AvailableHeistsResponse }>('/heists/available');
    return response.data.data;
  },

  // ===== Get Gang Heists =====

  /**
   * Get all heists for the character's gang
   */
  async getGangHeists(includeCompleted: boolean = false): Promise<GangHeistsResponse> {
    const params = includeCompleted ? { includeCompleted: 'true' } : {};
    const response = await api.get<{ data: GangHeistsResponse }>('/heists', { params });
    return response.data.data;
  },

  /**
   * Get active heist for the gang (convenience method)
   */
  async getActiveHeist(): Promise<Heist | null> {
    const response = await this.getGangHeists(false);
    return response.activeHeist || null;
  },

  // ===== Plan Heist =====

  /**
   * Start planning a new heist
   */
  async planHeist(request: PlanHeistRequest): Promise<PlanHeistResponse> {
    const response = await api.post<{ data: PlanHeistResponse }>('/heists/plan', request);
    return response.data.data;
  },

  // ===== Increase Planning Progress =====

  /**
   * Increase planning progress for a heist
   */
  async increaseProgress(heistId: string, amount?: number): Promise<IncreaseProgressResponse> {
    const response = await api.post<{ data: IncreaseProgressResponse }>(
      `/heists/${heistId}/progress`,
      { amount }
    );
    return response.data.data;
  },

  // ===== Execute Heist =====

  /**
   * Execute a planned heist (leader only)
   */
  async executeHeist(heistId: string): Promise<ExecuteHeistResponse> {
    const response = await api.post<{ data: ExecuteHeistResponse }>(
      `/heists/${heistId}/execute`
    );
    return response.data.data;
  },

  // ===== Cancel Heist =====

  /**
   * Cancel a heist in planning (leader only)
   */
  async cancelHeist(heistId: string): Promise<CancelHeistResponse> {
    const response = await api.post<{ data: CancelHeistResponse }>(
      `/heists/${heistId}/cancel`
    );
    return response.data.data;
  },

  // ===== Assign Role =====

  /**
   * Assign a role to a gang member
   */
  async assignRole(heistId: string, request: AssignRoleRequest): Promise<AssignRoleResponse> {
    const response = await api.post<{ data: AssignRoleResponse }>(
      `/heists/${heistId}/roles`,
      request
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if a heist is ready to execute
   */
  isReadyToExecute(heist: Heist): boolean {
    return heist.status === 'ready' ||
           (heist.status === 'planning' && heist.planningProgress >= heist.planningRequired);
  },

  /**
   * Calculate planning progress percentage
   */
  getPlanningProgressPercent(heist: Heist): number {
    if (heist.planningRequired === 0) return 100;
    return Math.min(100, Math.floor((heist.planningProgress / heist.planningRequired) * 100));
  },

  /**
   * Get unfilled required roles
   */
  getUnfilledRequiredRoles(heist: Heist, targetInfo: HeistTargetInfo): HeistRole[] {
    const assignedRoles = heist.roleAssignments.map(ra => ra.role);
    return targetInfo.requiredRoles.filter(role => !assignedRoles.includes(role));
  },

  /**
   * Check if character is assigned to heist
   */
  isCharacterAssigned(heist: Heist, characterId: string): boolean {
    return heist.participants.includes(characterId);
  },

  /**
   * Get character's assigned role in heist
   */
  getCharacterRole(heist: Heist, characterId: string): HeistRole | null {
    const assignment = heist.roleAssignments.find(ra => ra.characterId === characterId);
    return assignment ? assignment.role : null;
  },

  /**
   * Check if character is the heist leader
   */
  isLeader(heist: Heist, characterId: string): boolean {
    return heist.leaderId === characterId;
  },

  /**
   * Calculate estimated reward per participant
   */
  calculateEstimatedRewardPerParticipant(targetInfo: HeistTargetInfo, participantCount: number): {
    min: number;
    max: number;
  } {
    if (participantCount === 0) {
      return { min: 0, max: 0 };
    }
    return {
      min: Math.floor(targetInfo.estimatedReward.min / participantCount),
      max: Math.floor(targetInfo.estimatedReward.max / participantCount),
    };
  },

  /**
   * Get role display name
   */
  getRoleDisplayName(role: HeistRole): string {
    const roleNames: Record<HeistRole, string> = {
      leader: 'Leader',
      gunslinger: 'Gunslinger',
      explosives_expert: 'Explosives Expert',
      lockpicker: 'Lockpicker',
      lookout: 'Lookout',
      driver: 'Driver',
      distraction: 'Distraction',
    };
    return roleNames[role] || role;
  },

  /**
   * Get target display name
   */
  getTargetDisplayName(target: HeistTarget): string {
    const targetNames: Record<HeistTarget, string> = {
      bank_vault: 'Bank Vault',
      train_robbery: 'Train Robbery',
      stagecoach: 'Stagecoach',
      mine_payroll: 'Mine Payroll',
      ranch_estate: 'Ranch Estate',
      merchant_warehouse: 'Merchant Warehouse',
      casino_vault: 'Casino Vault',
      government_office: 'Government Office',
    };
    return targetNames[target] || target;
  },
};

export default heistService;
