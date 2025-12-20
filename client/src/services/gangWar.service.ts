/**
 * Gang War Service
 * API client for gang war management operations
 */

import api from './api';
import { GangWarStatus } from '@shared/types/gangWar.types';
import type {
  GangWar,
  GangWarType,
  WarMission,
  WarStatistics,
  WarSpoils,
  WarOutcome,
} from '@shared/types/gangWar.types';

// ===== Types =====

export interface GangWarListResponse {
  wars: GangWar[];
  active: number;
  total: number;
}

export interface GangWarsResponse {
  wars: GangWar[];
  asAttacker: number;
  asDefender: number;
  total: number;
}

export interface GangWarByIdResponse {
  war: GangWar;
  statistics: WarStatistics;
}

export interface ContributeRequest {
  amount: number;
}

export interface ContributeResponse {
  success: boolean;
  contributed: number;
  newWarChest: number;
  newCharacterGold: number;
  message: string;
}

export interface ResolveWarResponse {
  success: boolean;
  war: GangWar;
  outcome: WarOutcome;
  spoils: WarSpoils;
  message: string;
}

// Deck game types
export interface RaidGameState {
  raidId: string;
  warId: string;
  status: 'active' | 'completed' | 'failed';
  currentRound: number;
  totalRounds: number;
  playerHand: any[];
  opponentHand: any[];
  playerHealth: number;
  opponentHealth: number;
  loot: number;
}

export interface ChampionDuelState {
  gameId: string;
  warId: string;
  status: 'active' | 'completed';
  champion: string;
  opponent: string;
  currentRound: number;
  playerHand: any[];
  opponentHand: any[];
  playerHealth: number;
  opponentHealth: number;
}

export interface ShowdownState {
  gameId: string;
  warId: string;
  status: 'active' | 'completed';
  attackerLeader: string;
  defenderLeader: string;
  currentRound: number;
  playerHand: any[];
  opponentHand: any[];
  playerHealth: number;
  opponentHealth: number;
}

export interface PlayActionRequest {
  cardId: string;
  targetId?: string;
}

export interface PlayActionResponse {
  success: boolean;
  gameState: RaidGameState | ChampionDuelState | ShowdownState;
  message: string;
}

// ===== Gang War Service =====

export const gangWarService = {
  // ===== War Management Routes =====

  /**
   * Get all active wars
   */
  async list(): Promise<GangWarListResponse> {
    const response = await api.get<{ data: GangWarListResponse }>('/wars');
    return response.data.data;
  },

  /**
   * Get all active wars involving a gang
   */
  async getGangWars(gangId: string): Promise<GangWarsResponse> {
    const response = await api.get<{ data: GangWarsResponse }>(`/wars/gang/${gangId}`);
    return response.data.data;
  },

  /**
   * Get single war by ID
   */
  async getById(warId: string): Promise<GangWarByIdResponse> {
    const response = await api.get<{ data: GangWarByIdResponse }>(`/wars/${warId}`);
    return response.data.data;
  },

  /**
   * Contribute gold to a war
   */
  async contribute(warId: string, amount: number): Promise<ContributeResponse> {
    const response = await api.post<{ data: ContributeResponse }>(
      `/wars/${warId}/contribute`,
      { amount }
    );
    return response.data.data;
  },

  /**
   * Manually resolve a war (admin only, for testing)
   */
  async resolve(warId: string): Promise<ResolveWarResponse> {
    const response = await api.post<{ data: ResolveWarResponse }>(`/wars/${warId}/resolve`);
    return response.data.data;
  },

  // ===== Deck Game Integration Routes =====

  /**
   * Start a raid mission
   */
  async startRaid(warId: string): Promise<RaidGameState> {
    const response = await api.post<{ data: { gameState: RaidGameState } }>(
      `/wars/${warId}/raid/start`
    );
    return response.data.data.gameState;
  },

  /**
   * Play a raid action
   */
  async playRaidAction(
    warId: string,
    raidId: string,
    cardId: string,
    targetId?: string
  ): Promise<RaidGameState> {
    const response = await api.post<{ data: { gameState: RaidGameState } }>(
      `/wars/${warId}/raid/${raidId}/play`,
      { cardId, targetId }
    );
    return response.data.data.gameState;
  },

  /**
   * Get raid state
   */
  async getRaidState(warId: string, raidId: string): Promise<RaidGameState> {
    const response = await api.get<{ data: { gameState: RaidGameState } }>(
      `/wars/${warId}/raid/${raidId}`
    );
    return response.data.data.gameState;
  },

  /**
   * Start a champion duel
   */
  async startChampionDuel(warId: string): Promise<ChampionDuelState> {
    const response = await api.post<{ data: { gameState: ChampionDuelState } }>(
      `/wars/${warId}/champion/start`
    );
    return response.data.data.gameState;
  },

  /**
   * Get champion duel state
   */
  async getChampionDuelState(warId: string): Promise<ChampionDuelState> {
    const response = await api.get<{ data: { gameState: ChampionDuelState } }>(
      `/wars/${warId}/champion/game`
    );
    return response.data.data.gameState;
  },

  /**
   * Play a champion duel action
   */
  async playChampionAction(
    warId: string,
    cardId: string,
    targetId?: string
  ): Promise<ChampionDuelState> {
    const response = await api.post<{ data: { gameState: ChampionDuelState } }>(
      `/wars/${warId}/champion/play`,
      { cardId, targetId }
    );
    return response.data.data.gameState;
  },

  /**
   * Start a leader showdown
   */
  async startShowdown(warId: string): Promise<ShowdownState> {
    const response = await api.post<{ data: { gameState: ShowdownState } }>(
      `/wars/${warId}/showdown/start`
    );
    return response.data.data.gameState;
  },

  /**
   * Get showdown state
   */
  async getShowdownState(warId: string): Promise<ShowdownState> {
    const response = await api.get<{ data: { gameState: ShowdownState } }>(
      `/wars/${warId}/showdown/game`
    );
    return response.data.data.gameState;
  },

  /**
   * Play a showdown action
   */
  async playShowdownAction(
    warId: string,
    cardId: string,
    targetId?: string
  ): Promise<ShowdownState> {
    const response = await api.post<{ data: { gameState: ShowdownState } }>(
      `/wars/${warId}/showdown/play`,
      { cardId, targetId }
    );
    return response.data.data.gameState;
  },

  // ===== Convenience Methods =====

  /**
   * Get active wars for a gang
   */
  async getActiveWarsForGang(gangId: string): Promise<GangWar[]> {
    const { wars } = await this.getGangWars(gangId);
    return wars.filter(w => w.status === GangWarStatus.ACTIVE);
  },

  /**
   * Get wars by status
   */
  async getWarsByStatus(gangId: string, status: GangWarStatus): Promise<GangWar[]> {
    const { wars } = await this.getGangWars(gangId);
    return wars.filter(w => w.status === status);
  },

  /**
   * Check if gang is at war
   */
  async isGangAtWar(gangId: string): Promise<boolean> {
    const activeWars = await this.getActiveWarsForGang(gangId);
    return activeWars.length > 0;
  },

  /**
   * Get war progress percentage
   */
  calculateWarProgress(war: GangWar): number {
    const maxScore = war.targetScore;
    const currentScore = Math.max(war.attackerScore, war.defenderScore);
    return Math.min(100, Math.round((currentScore / maxScore) * 100));
  },

  /**
   * Get leading gang in war
   */
  getLeadingGang(war: GangWar): {
    gangId: string;
    gangName: string;
    score: number;
    lead: number;
  } {
    const isAttackerLeading = war.attackerScore > war.defenderScore;
    return {
      gangId: isAttackerLeading ? war.attackerGangId : war.defenderGangId,
      gangName: isAttackerLeading ? war.attackerGangName : war.defenderGangName,
      score: isAttackerLeading ? war.attackerScore : war.defenderScore,
      lead: Math.abs(war.attackerScore - war.defenderScore),
    };
  },

  /**
   * Check if war is close
   */
  isWarClose(war: GangWar): boolean {
    const scoreDiff = Math.abs(war.attackerScore - war.defenderScore);
    return scoreDiff <= war.targetScore * 0.1; // Within 10% of target
  },

  /**
   * Get time remaining in war
   */
  getTimeRemaining(war: GangWar): {
    days: number;
    hours: number;
    minutes: number;
    expired: boolean;
  } {
    if (!war.endsAt) {
      const maxDurationMs = war.maxDuration * 24 * 60 * 60 * 1000;
      const startTime = new Date(war.startsAt).getTime();
      const endTime = startTime + maxDurationMs;
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);

      return {
        days: Math.floor(remaining / (24 * 60 * 60 * 1000)),
        hours: Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
        minutes: Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)),
        expired: remaining === 0,
      };
    }

    return { days: 0, hours: 0, minutes: 0, expired: true };
  },

  /**
   * Get available missions for a gang
   */
  getAvailableMissions(war: GangWar, gangId: string): WarMission[] {
    return war.missions.filter(
      m => m.assignedTo === gangId && m.status === 'available'
    );
  },

  /**
   * Get completed missions for a gang
   */
  getCompletedMissions(war: GangWar, gangId: string): WarMission[] {
    return war.missions.filter(
      m => m.assignedTo === gangId && m.status === 'completed'
    );
  },

  /**
   * Calculate total war chest
   */
  calculateTotalWarChest(war: GangWar): number {
    return war.warChest.attacker + war.warChest.defender;
  },

  /**
   * Get gang's war chest amount
   */
  getGangWarChest(war: GangWar, gangId: string): number {
    if (gangId === war.attackerGangId) return war.warChest.attacker;
    if (gangId === war.defenderGangId) return war.warChest.defender;
    return 0;
  },

  /**
   * Get battles won by gang
   */
  getBattlesWon(war: GangWar, gangId: string): number {
    const isAttacker = gangId === war.attackerGangId;
    return war.battles.filter(b =>
      (isAttacker && b.outcome === 'attacker_victory') ||
      (!isAttacker && b.outcome === 'defender_victory')
    ).length;
  },

  /**
   * Get total casualties for gang
   */
  getCasualties(war: GangWar, gangId: string): number {
    return war.casualties.filter(c => c.gangId === gangId).length;
  },

  /**
   * Get prisoners held by gang
   */
  getPrisonersHeld(war: GangWar, gangId: string): number {
    return war.prisoners.filter(p => p.capturedBy === gangId && !p.released).length;
  },

  /**
   * Check if gang can declare war
   */
  canDeclareWar(
    gangSize: number,
    gangGold: number,
    minFunding: number = 500
  ): { canDeclare: boolean; reason?: string } {
    if (gangSize < 5) {
      return { canDeclare: false, reason: 'Gang must have at least 5 members' };
    }

    if (gangGold < minFunding) {
      return { canDeclare: false, reason: `Gang must have at least ${minFunding} gold` };
    }

    return { canDeclare: true };
  },

  /**
   * Sort wars by activity (most recent first)
   */
  sortByActivity(wars: GangWar[]): GangWar[] {
    return [...wars].sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return bTime - aTime;
    });
  },

  /**
   * Filter wars by type
   */
  filterByType(wars: GangWar[], type: GangWarType): GangWar[] {
    return wars.filter(w => w.warType === type);
  },

  /**
   * Get war by contested zone
   */
  getWarByZone(wars: GangWar[], zoneId: string): GangWar | undefined {
    return wars.find(w => w.contestedZones.includes(zoneId));
  },

  /**
   * Check if in preparation phase
   */
  isInPreparation(war: GangWar): boolean {
    return war.status === GangWarStatus.PREPARATION;
  },

  /**
   * Get preparation time remaining
   */
  getPreparationTimeRemaining(war: GangWar): {
    hours: number;
    minutes: number;
    expired: boolean;
  } {
    if (war.status !== GangWarStatus.PREPARATION) {
      return { hours: 0, minutes: 0, expired: true };
    }

    const startTime = new Date(war.startsAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, startTime - now);

    return {
      hours: Math.floor(remaining / (60 * 60 * 1000)),
      minutes: Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)),
      expired: remaining === 0,
    };
  },
};

export default gangWarService;
