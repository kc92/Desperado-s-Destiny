/**
 * Jail Service
 * API client for jail system operations
 */

import api from './api';
import {
  JailState,
  JailActivity,
  JailActivityResult,
  EscapeAttemptResult,
  BribeAttemptResult,
  BailPaymentResult,
  TurnInResult,
  JailStats,
} from '@desperados/shared';

// ===== Request Types =====

export interface AttemptBribeRequest {
  amount: number;
}

export interface PayBailRequest {
  characterId?: string;
}

export interface DoActivityRequest {
  activity: JailActivity;
}

// ===== Response Types =====

export interface JailStatusResponse {
  status: JailState;
}

export interface JailStatsResponse {
  stats: JailStats;
}

export interface ReleasePlayerRequest {
  reason?: string;
}

export interface ReleasePlayerResponse {
  characterId: string;
  name: string;
  released: boolean;
  reason: string;
}

// ===== Jail Service =====

export const jailService = {
  /**
   * Get current jail status for authenticated character
   * GET /api/jail/status
   */
  async getStatus(): Promise<JailState> {
    const response = await api.get<{ data: JailState }>('/jail/status');
    return response.data.data;
  },

  /**
   * Get jail statistics for authenticated character
   * GET /api/jail/stats
   */
  async getStats(): Promise<JailStats> {
    const response = await api.get<{ data: JailStats }>('/jail/stats');
    return response.data.data;
  },

  /**
   * Attempt to escape from jail
   * POST /api/jail/escape
   */
  async attemptEscape(): Promise<EscapeAttemptResult> {
    const response = await api.post<{ data: EscapeAttemptResult }>('/jail/escape');
    return response.data.data;
  },

  /**
   * Attempt to bribe a guard
   * POST /api/jail/bribe
   * @param amount - Gold amount to bribe with
   */
  async attemptBribe(amount: number): Promise<BribeAttemptResult> {
    const response = await api.post<{ data: BribeAttemptResult }>('/jail/bribe', { amount });
    return response.data.data;
  },

  /**
   * Pay bail for self or another character
   * POST /api/jail/bail
   * @param characterId - Optional character ID (defaults to self)
   */
  async payBail(characterId?: string): Promise<BailPaymentResult> {
    const response = await api.post<{ data: BailPaymentResult }>('/jail/bail', { characterId });
    return response.data.data;
  },

  /**
   * Perform a jail activity
   * POST /api/jail/activity
   * @param activity - The jail activity to perform
   */
  async doActivity(activity: JailActivity): Promise<JailActivityResult> {
    const response = await api.post<{ data: JailActivityResult }>('/jail/activity', { activity });
    return response.data.data;
  },

  /**
   * Turn in a wanted player for bounty
   * POST /api/jail/turn-in/:characterId
   * @param characterId - ID of the character to turn in
   */
  async turnInPlayer(characterId: string): Promise<TurnInResult> {
    const response = await api.post<{ data: TurnInResult }>(`/jail/turn-in/${characterId}`);
    return response.data.data;
  },

  /**
   * Release a player from jail (Admin only)
   * POST /api/jail/release/:characterId
   * @param characterId - ID of the character to release
   * @param reason - Optional reason for release
   */
  async releasePlayer(characterId: string, reason?: string): Promise<ReleasePlayerResponse> {
    const response = await api.post<{ data: ReleasePlayerResponse }>(
      `/jail/release/${characterId}`,
      { reason }
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if character is currently jailed
   */
  isJailed(status: JailState): boolean {
    return status.isJailed && status.releaseAt !== null;
  },

  /**
   * Get remaining jail time in minutes
   */
  getRemainingTime(status: JailState): number {
    if (!status.isJailed || !status.releaseAt) {
      return 0;
    }
    const now = Date.now();
    const releaseTime = new Date(status.releaseAt).getTime();
    const remainingMs = Math.max(0, releaseTime - now);
    return Math.ceil(remainingMs / 60000); // Convert to minutes
  },

  /**
   * Format remaining time as human-readable string
   */
  formatRemainingTime(minutes: number): string {
    if (minutes < 1) return 'Less than a minute';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${minutes} minutes`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 1 && mins === 0) return '1 hour';
    if (hours === 1) return `1 hour ${mins} minutes`;
    if (mins === 0) return `${hours} hours`;
    return `${hours} hours ${mins} minutes`;
  },

  /**
   * Check if character can afford bail
   */
  canAffordBail(status: JailState, currentGold: number): boolean {
    return status.canBail && currentGold >= status.bailAmount;
  },

  /**
   * Calculate bribe cost for full sentence reduction
   */
  calculateBribeCost(remainingMinutes: number, costPerMinute: number = 10): number {
    return remainingMinutes * costPerMinute;
  },

  /**
   * Get jail activity display name
   */
  getActivityDisplayName(activity: JailActivity): string {
    const names: Record<JailActivity, string> = {
      [JailActivity.WAIT]: 'Wait',
      [JailActivity.PRISON_LABOR]: 'Prison Labor',
      [JailActivity.SOCIALIZE]: 'Socialize',
      [JailActivity.ESCAPE_ATTEMPT]: 'Attempt Escape',
      [JailActivity.BRIBE_GUARD]: 'Bribe Guard',
    };
    return names[activity] || activity;
  },

  /**
   * Get jail activity description
   */
  getActivityDescription(activity: JailActivity): string {
    const descriptions: Record<JailActivity, string> = {
      [JailActivity.WAIT]: 'Pass time and wait for release',
      [JailActivity.PRISON_LABOR]: 'Work for gold and experience',
      [JailActivity.SOCIALIZE]: 'Talk with other inmates',
      [JailActivity.ESCAPE_ATTEMPT]: 'Try to break out (risky)',
      [JailActivity.BRIBE_GUARD]: 'Offer gold to reduce sentence',
    };
    return descriptions[activity] || 'Unknown activity';
  },

  /**
   * Format jail stats for display
   */
  formatStats(stats: JailStats): {
    totalArrests: string;
    totalJailTime: string;
    escapeRate: string;
    totalBailPaid: string;
    laborEarnings: string;
  } {
    const escapeAttempts = stats.successfulEscapes + stats.failedEscapes;
    const escapeRate = escapeAttempts > 0
      ? `${((stats.successfulEscapes / escapeAttempts) * 100).toFixed(1)}%`
      : 'N/A';

    const jailHours = Math.floor(stats.totalJailTime / 60);
    const jailMinutes = stats.totalJailTime % 60;
    const totalJailTime = jailHours > 0
      ? `${jailHours}h ${jailMinutes}m`
      : `${jailMinutes}m`;

    return {
      totalArrests: stats.totalArrests.toString(),
      totalJailTime,
      escapeRate,
      totalBailPaid: `${stats.totalBailPaid} gold`,
      laborEarnings: `${stats.prisonLaborGold} gold, ${stats.prisonLaborXP} XP`,
    };
  },

  /**
   * Check if should show bail option
   */
  shouldShowBailOption(status: JailState): boolean {
    return status.isJailed && status.canBail && status.bailAmount > 0;
  },

  /**
   * Check if should show escape option
   */
  shouldShowEscapeOption(status: JailState): boolean {
    return status.isJailed && status.remainingTime > 5; // Only if more than 5 minutes left
  },

  /**
   * Get jail status color for UI
   */
  getStatusColor(status: JailState): 'red' | 'yellow' | 'green' {
    if (!status.isJailed) return 'green';
    if (status.remainingTime > 30) return 'red';
    if (status.remainingTime > 10) return 'yellow';
    return 'green';
  },

  /**
   * Parse jail activity result message
   */
  parseActivityResult(result: JailActivityResult): {
    success: boolean;
    title: string;
    message: string;
    rewards?: string;
  } {
    const rewards: string[] = [];

    if (result.goldEarned) {
      rewards.push(`${result.goldEarned} gold`);
    }
    if (result.xpEarned) {
      rewards.push(`${result.xpEarned} XP`);
    }
    if (result.sentenceReduced) {
      rewards.push(`-${result.sentenceReduced} min sentence`);
    }

    return {
      success: result.success,
      title: result.success ? 'Success!' : 'Failed',
      message: result.message,
      rewards: rewards.length > 0 ? rewards.join(', ') : undefined,
    };
  },
};

export default jailService;
