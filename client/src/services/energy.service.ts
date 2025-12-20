/**
 * Energy Service
 * API client for energy management system operations
 */

import api from './api';

// ===== Types =====

export interface EnergyStatus {
  current: number;
  max: number;
  regenerationRate: number;
  lastRegeneration: string;
  nextRegeneration: string;
  regenTimeRemaining: number;
  percentFull: number;
}

export interface CanAffordResponse {
  canAfford: boolean;
  current: number;
  cost: number;
  remaining: number;
}

export interface SpendEnergyRequest {
  amount: number;
}

export interface SpendEnergyResponse {
  success: boolean;
  spent: number;
  remaining: number;
  message: string;
}

export interface GrantEnergyRequest {
  amount: number;
  allowOverMax?: boolean;
}

export interface GrantEnergyResponse {
  success: boolean;
  granted: number;
  newEnergy: number;
  message: string;
}

export interface RegenerateEnergyResponse {
  regenerated: number;
  current: number;
  max: number;
  nextRegeneration: string;
}

// ===== Energy Service =====

export const energyService = {
  /**
   * Get current energy status
   * GET /api/energy/status
   */
  async getStatus(): Promise<EnergyStatus> {
    const response = await api.get<{ data: EnergyStatus }>('/energy/status');
    return response.data.data;
  },

  /**
   * Check if character can afford an action with given energy cost
   * GET /api/energy/can-afford/:cost
   */
  async canAfford(cost: number): Promise<CanAffordResponse> {
    const response = await api.get<{ data: CanAffordResponse }>(`/energy/can-afford/${cost}`);
    return response.data.data;
  },

  /**
   * Spend energy for an action
   * POST /api/energy/spend
   */
  async spend(amount: number): Promise<SpendEnergyResponse> {
    const response = await api.post<{ data: SpendEnergyResponse }>('/energy/spend', { amount });
    return response.data.data;
  },

  /**
   * Grant energy to a character (admin only)
   * POST /api/energy/grant
   */
  async grant(amount: number, allowOverMax: boolean = false): Promise<GrantEnergyResponse> {
    const response = await api.post<{ data: GrantEnergyResponse }>('/energy/grant', {
      amount,
      allowOverMax,
    });
    return response.data.data;
  },

  /**
   * Force regeneration calculation and return updated energy
   * POST /api/energy/regenerate
   */
  async regenerate(): Promise<RegenerateEnergyResponse> {
    const response = await api.post<{ data: RegenerateEnergyResponse }>('/energy/regenerate');
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if energy is full
   */
  isFull(status: EnergyStatus): boolean {
    return status.current >= status.max;
  },

  /**
   * Check if energy is low (below 20%)
   */
  isLow(status: EnergyStatus): boolean {
    return status.percentFull < 20;
  },

  /**
   * Check if energy is critically low (below 10%)
   */
  isCritical(status: EnergyStatus): boolean {
    return status.percentFull < 10;
  },

  /**
   * Calculate time until full energy
   */
  calculateTimeUntilFull(status: EnergyStatus): number {
    if (status.current >= status.max) return 0;
    const energyNeeded = status.max - status.current;
    const regenTime = (energyNeeded / status.regenerationRate) * 60 * 60 * 1000; // Convert to ms
    return Math.ceil(regenTime);
  },

  /**
   * Format time remaining as human-readable string
   */
  formatTimeRemaining(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  },

  /**
   * Format energy display (e.g., "50/100")
   */
  formatEnergy(status: EnergyStatus): string {
    return `${status.current}/${status.max}`;
  },

  /**
   * Get energy status color based on percentage
   */
  getEnergyColor(status: EnergyStatus): 'green' | 'yellow' | 'orange' | 'red' {
    if (status.percentFull >= 75) return 'green';
    if (status.percentFull >= 50) return 'yellow';
    if (status.percentFull >= 25) return 'orange';
    return 'red';
  },

  /**
   * Validate if an action can be performed
   */
  async validateAction(cost: number): Promise<boolean> {
    try {
      const result = await this.canAfford(cost);
      return result.canAfford;
    } catch {
      return false;
    }
  },

  /**
   * Get energy status with auto-regeneration check
   */
  async getUpdatedStatus(): Promise<EnergyStatus> {
    // Force regeneration check before returning status
    await this.regenerate();
    return this.getStatus();
  },
};

export default energyService;
