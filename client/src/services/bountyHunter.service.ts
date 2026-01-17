/**
 * Bounty Hunter Service
 * API client for bounty hunter system operations
 */

import api from './api';

// ===== Types =====

export interface BountyHunter {
  _id: string;
  name: string;
  description: string;
  level: number;
  difficulty: 'common' | 'uncommon' | 'rare' | 'legendary';
  stats: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  };
  skills: string[];
  specialAbilities: string[];
  baseReward: number;
  hireCost: number;
  successRate: number;
  reputation: number;
  availability: 'available' | 'hired' | 'on_mission' | 'retired';
  image?: string;
  flavor?: string;
}

export interface BountyHunterEncounter {
  _id: string;
  hunterId: string;
  hunterName: string;
  hunterLevel: number;
  targetCharacterId: string;
  targetCharacterName: string;
  encounterType: 'random_spawn' | 'hired';
  status: 'active' | 'resolved' | 'paid_off' | 'escaped';
  location: string;
  spawnTime: string;
  resolveTime?: string;
  payoffAmount?: number;
  battleResult?: 'hunter_won' | 'target_won' | 'escaped';
  rewardClaimed?: number;
}

export interface ActiveEncounter {
  encounter: BountyHunterEncounter;
  hunter: BountyHunter;
  canPayOff: boolean;
  payoffAmount: number;
  canEscape: boolean;
  escapeChance: number;
}

export interface HireableHunter {
  hunter: BountyHunter;
  estimatedSuccessRate: number;
  estimatedReward: number;
  canAfford: boolean;
}

// ===== Request/Response Types =====

export interface CheckHunterSpawnRequest {
  characterId?: string;
}

export interface CheckHunterSpawnResponse {
  shouldSpawn: boolean;
  hunterId?: string;
  hunterName?: string;
  hunterLevel?: number;
  spawnChance: number;
  wantedLevel: number;
  message?: string;
}

export interface HireHunterRequest {
  hunterId: string;
  targetCharacterId: string;
  bountyAmount?: number;
}

export interface HireHunterResponse {
  success: boolean;
  encounter: BountyHunterEncounter;
  hunter: BountyHunter;
  cost: number;
  newCharacterGold: number;
  message: string;
}

export interface PayOffHunterRequest {
  encounterId: string;
}

export interface PayOffHunterResponse {
  success: boolean;
  encounter: BountyHunterEncounter;
  amountPaid: number;
  newCharacterGold: number;
  reputationLoss?: number;
  message: string;
}

export interface ResolveEncounterRequest {
  encounterId: string;
  action: 'fight' | 'escape' | 'surrender';
}

export interface ResolveEncounterResponse {
  success: boolean;
  encounter: BountyHunterEncounter;
  result: 'hunter_won' | 'target_won' | 'escaped' | 'surrendered';
  reward?: number;
  penalty?: number;
  newCharacterGold?: number;
  reputationChange?: number;
  message: string;
}

// ===== Bounty Hunter Service =====

export const bountyHunterService = {
  // ===== Public Routes =====

  /**
   * Get all hunters (public info)
   */
  async getAllHunters(): Promise<BountyHunter[]> {
    const response = await api.get<{ data: { hunters: BountyHunter[] } }>('/bounty-hunters');
    return response.data.data?.hunters || [];
  },

  /**
   * Get specific hunter details
   */
  async getHunterDetails(hunterId: string): Promise<BountyHunter> {
    const response = await api.get<{ data: BountyHunter }>(`/bounty-hunters/${hunterId}`);
    return response.data.data;
  },

  // ===== Protected Routes =====

  /**
   * Check if hunter should spawn
   */
  async checkHunterSpawn(request?: CheckHunterSpawnRequest): Promise<CheckHunterSpawnResponse> {
    const response = await api.post<{ data: CheckHunterSpawnResponse }>(
      '/bounty-hunters/check-spawn',
      request || {}
    );
    return response.data.data;
  },

  /**
   * Get available hunters for hire
   */
  async getAvailableHunters(): Promise<HireableHunter[]> {
    const response = await api.get<{ data: { hunters: HireableHunter[] } }>(
      '/bounty-hunters/available/list'
    );
    return response.data.data?.hunters || [];
  },

  /**
   * Hire a hunter
   */
  async hireHunter(request: HireHunterRequest): Promise<HireHunterResponse> {
    const response = await api.post<{ data: HireHunterResponse }>(
      '/bounty-hunters/hire',
      request
    );
    return response.data.data;
  },

  /**
   * Get active encounters
   */
  async getActiveEncounters(): Promise<ActiveEncounter[]> {
    const response = await api.get<{ data: { encounters: ActiveEncounter[] } }>(
      '/bounty-hunters/encounters/active'
    );
    return response.data.data?.encounters || [];
  },

  /**
   * Pay off a hunter
   */
  async payOffHunter(request: PayOffHunterRequest): Promise<PayOffHunterResponse> {
    const response = await api.post<{ data: PayOffHunterResponse }>(
      '/bounty-hunters/payoff',
      request
    );
    return response.data.data;
  },

  /**
   * Resolve encounter
   */
  async resolveEncounter(request: ResolveEncounterRequest): Promise<ResolveEncounterResponse> {
    const response = await api.post<{ data: ResolveEncounterResponse }>(
      '/bounty-hunters/resolve',
      request
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Filter hunters by difficulty
   */
  filterByDifficulty(
    hunters: BountyHunter[],
    difficulty: 'common' | 'uncommon' | 'rare' | 'legendary'
  ): BountyHunter[] {
    return hunters.filter(hunter => hunter.difficulty === difficulty);
  },

  /**
   * Filter hunters by availability
   */
  filterByAvailability(
    hunters: BountyHunter[],
    availability: 'available' | 'hired' | 'on_mission' | 'retired'
  ): BountyHunter[] {
    return hunters.filter(hunter => hunter.availability === availability);
  },

  /**
   * Sort hunters by level
   */
  sortByLevel(hunters: BountyHunter[], descending: boolean = true): BountyHunter[] {
    return [...hunters].sort((a, b) =>
      descending ? b.level - a.level : a.level - b.level
    );
  },

  /**
   * Sort hunters by hire cost
   */
  sortByCost(hunters: BountyHunter[], descending: boolean = false): BountyHunter[] {
    return [...hunters].sort((a, b) =>
      descending ? b.hireCost - a.hireCost : a.hireCost - b.hireCost
    );
  },

  /**
   * Sort hunters by success rate
   */
  sortBySuccessRate(hunters: BountyHunter[], descending: boolean = true): BountyHunter[] {
    return [...hunters].sort((a, b) =>
      descending ? b.successRate - a.successRate : a.successRate - b.successRate
    );
  },

  /**
   * Calculate payoff amount based on wanted level
   */
  calculatePayoffAmount(baseReward: number, wantedLevel: number): number {
    // Payoff is typically 150% of the reward + wanted level multiplier
    return Math.floor(baseReward * 1.5 * (1 + wantedLevel * 0.1));
  },

  /**
   * Calculate escape chance based on stats
   */
  calculateEscapeChance(
    characterSpeed: number,
    hunterSpeed: number,
    characterLevel: number
  ): number {
    const speedDiff = characterSpeed - hunterSpeed;
    const baseChance = 30; // 30% base escape chance
    const speedBonus = speedDiff * 2; // +2% per speed point difference
    const levelBonus = characterLevel * 0.5; // +0.5% per level
    return Math.max(5, Math.min(75, baseChance + speedBonus + levelBonus));
  },

  /**
   * Calculate combat odds
   */
  calculateCombatOdds(
    characterStats: { attack: number; defense: number; health: number },
    hunter: BountyHunter
  ): number {
    const characterPower = characterStats.attack + characterStats.defense + characterStats.health;
    const hunterPower = hunter.stats.attack + hunter.stats.defense + hunter.stats.health;
    const ratio = characterPower / (characterPower + hunterPower);
    return Math.round(ratio * 100);
  },

  /**
   * Get difficulty color for UI
   */
  getDifficultyColor(difficulty: 'common' | 'uncommon' | 'rare' | 'legendary'): string {
    const colors = {
      common: '#808080',
      uncommon: '#1eff00',
      rare: '#0070dd',
      legendary: '#ff8000',
    };
    return colors[difficulty];
  },

  /**
   * Get difficulty label
   */
  getDifficultyLabel(difficulty: 'common' | 'uncommon' | 'rare' | 'legendary'): string {
    const labels = {
      common: 'Common',
      uncommon: 'Uncommon',
      rare: 'Rare',
      legendary: 'Legendary',
    };
    return labels[difficulty];
  },

  /**
   * Check if character can afford to hire hunter
   */
  canAffordHire(characterGold: number, hireCost: number): boolean {
    return characterGold >= hireCost;
  },

  /**
   * Check if character can afford payoff
   */
  canAffordPayoff(characterGold: number, payoffAmount: number): boolean {
    return characterGold >= payoffAmount;
  },

  /**
   * Format hunter stats for display
   */
  formatHunterStats(hunter: BountyHunter): string {
    const { health, attack, defense, speed } = hunter.stats;
    return `HP: ${health} | ATK: ${attack} | DEF: ${defense} | SPD: ${speed}`;
  },

  /**
   * Get recommended action based on odds
   */
  getRecommendedAction(
    combatOdds: number,
    escapeChance: number,
    canPayOff: boolean,
    characterGold: number,
    payoffAmount: number
  ): 'fight' | 'escape' | 'payoff' | 'surrender' {
    if (canPayOff && characterGold >= payoffAmount && combatOdds < 30) {
      return 'payoff';
    }
    if (combatOdds >= 60) {
      return 'fight';
    }
    if (escapeChance >= 50) {
      return 'escape';
    }
    if (combatOdds >= 40) {
      return 'fight';
    }
    return 'surrender';
  },
};

export default bountyHunterService;
