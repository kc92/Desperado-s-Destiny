/**
 * Racing Service
 * API client for horse racing and betting
 */

import api from './api';
import type { Horse } from './horse.service';

// ===== Types =====

export type RaceType = 'sprint' | 'standard' | 'marathon' | 'steeplechase';
export type RaceStatus = 'upcoming' | 'registration' | 'in_progress' | 'finished' | 'cancelled';
export type BetType = 'win' | 'place' | 'show' | 'exacta' | 'trifecta';

export interface RaceHorse {
  horseId: string;
  horseName: string;
  ownerName: string;
  ownerId: string;
  odds: number;
  position?: number;
  finishTime?: number;
  stats: {
    speed: number;
    stamina: number;
    handling: number;
  };
}

export interface Race {
  _id: string;
  name: string;
  type: RaceType;
  status: RaceStatus;
  trackId: string;
  trackName: string;
  distance: number;
  minLevel: number;
  entryFee: number;
  purse: number;
  maxEntrants: number;
  currentEntrants: number;
  entries: RaceHorse[];
  startTime: string;
  registrationDeadline: string;
  results?: RaceResult[];
}

export interface RaceResult {
  position: number;
  horseId: string;
  horseName: string;
  ownerName: string;
  finishTime: number;
  prize: number;
}

export interface PrestigiousEvent {
  _id: string;
  name: string;
  description: string;
  type: RaceType;
  scheduledDate: string;
  entryFee: number;
  purse: number;
  minLevel: number;
  requirements: string[];
  isChampionship: boolean;
}

export interface RaceOdds {
  horseId: string;
  horseName: string;
  winOdds: number;
  placeOdds: number;
  showOdds: number;
  bettingVolume: number;
}

export interface RaceHistoryEntry {
  _id: string;
  raceId: string;
  raceName: string;
  raceType: RaceType;
  horseId: string;
  horseName: string;
  position: number;
  totalEntrants: number;
  prize: number;
  raceDate: string;
}

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  wins: number;
  races: number;
  winRate: number;
  earnings: number;
  bestHorse?: string;
}

export interface EligibleHorse {
  horse: Horse;
  isEligible: boolean;
  reasons?: string[];
}

// ===== Request/Response Types =====

export interface EnterRaceRequest {
  horseId: string;
}

export interface EnterRaceResponse {
  success: boolean;
  race: Race;
  entry: RaceHorse;
  message: string;
}

export interface PlaceBetRequest {
  betType: BetType;
  amount: number;
  horseIds: string[]; // Single horse for win/place/show, multiple for exacta/trifecta
}

export interface PlaceBetResponse {
  success: boolean;
  betId: string;
  betType: BetType;
  amount: number;
  potentialPayout: number;
  message: string;
}

export interface BetResult {
  betId: string;
  won: boolean;
  payout: number;
  race: Race;
}

// ===== Racing Service =====

export const racingService = {
  // ===== Public Routes =====

  /**
   * Get all upcoming and active races
   */
  async getRaces(filters?: {
    type?: RaceType;
    status?: RaceStatus;
    minPurse?: number;
  }): Promise<Race[]> {
    const response = await api.get<{ data: { races: Race[] } }>('/racing/races', {
      params: filters,
    });
    return response.data.data?.races || [];
  },

  /**
   * Get details for a specific race
   */
  async getRaceDetails(raceId: string): Promise<Race> {
    const response = await api.get<{ data: Race }>(`/racing/races/${raceId}`);
    return response.data.data;
  },

  /**
   * Get odds for all horses in a race
   */
  async getRaceOdds(raceId: string): Promise<RaceOdds[]> {
    const response = await api.get<{ data: { odds: RaceOdds[] } }>(
      `/racing/races/${raceId}/odds`
    );
    return response.data.data?.odds || [];
  },

  /**
   * Get prestigious racing events (championships, derbies, etc.)
   */
  async getPrestigiousEvents(): Promise<PrestigiousEvent[]> {
    const response = await api.get<{ data: { events: PrestigiousEvent[] } }>('/racing/events');
    return response.data.data?.events || [];
  },

  /**
   * Get racing leaderboard
   */
  async getLeaderboard(period?: 'daily' | 'weekly' | 'monthly' | 'alltime'): Promise<LeaderboardEntry[]> {
    const response = await api.get<{ data: { leaderboard: LeaderboardEntry[] } }>(
      '/racing/leaderboard',
      { params: period ? { period } : {} }
    );
    return response.data.data?.leaderboard || [];
  },

  // ===== Authenticated Routes =====

  /**
   * Get character's horses eligible for racing
   */
  async getMyRaceHorses(): Promise<EligibleHorse[]> {
    const response = await api.get<{ data: { horses: EligibleHorse[] } }>('/racing/my-horses');
    return response.data.data?.horses || [];
  },

  /**
   * Get character's race history
   */
  async getRaceHistory(limit?: number): Promise<RaceHistoryEntry[]> {
    const response = await api.get<{ data: { history: RaceHistoryEntry[] } }>(
      '/racing/history',
      { params: limit ? { limit } : {} }
    );
    return response.data.data?.history || [];
  },

  /**
   * Enter a horse in a race
   */
  async enterRace(raceId: string, horseId: string): Promise<EnterRaceResponse> {
    const response = await api.post<{ data: EnterRaceResponse }>(
      `/racing/races/${raceId}/enter`,
      { horseId }
    );
    return response.data.data;
  },

  /**
   * Place a bet on a race
   */
  async placeBet(
    raceId: string,
    betType: BetType,
    amount: number,
    horseIds: string[]
  ): Promise<PlaceBetResponse> {
    const response = await api.post<{ data: PlaceBetResponse }>(
      `/racing/races/${raceId}/bet`,
      { betType, amount, horseIds }
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Place a win bet (single horse to win)
   */
  async betToWin(raceId: string, horseId: string, amount: number): Promise<PlaceBetResponse> {
    return this.placeBet(raceId, 'win', amount, [horseId]);
  },

  /**
   * Place a place bet (horse to finish 1st or 2nd)
   */
  async betToPlace(raceId: string, horseId: string, amount: number): Promise<PlaceBetResponse> {
    return this.placeBet(raceId, 'place', amount, [horseId]);
  },

  /**
   * Place a show bet (horse to finish 1st, 2nd, or 3rd)
   */
  async betToShow(raceId: string, horseId: string, amount: number): Promise<PlaceBetResponse> {
    return this.placeBet(raceId, 'show', amount, [horseId]);
  },

  /**
   * Place an exacta bet (predict 1st and 2nd in order)
   */
  async betExacta(
    raceId: string,
    firstHorseId: string,
    secondHorseId: string,
    amount: number
  ): Promise<PlaceBetResponse> {
    return this.placeBet(raceId, 'exacta', amount, [firstHorseId, secondHorseId]);
  },

  /**
   * Place a trifecta bet (predict 1st, 2nd, and 3rd in order)
   */
  async betTrifecta(
    raceId: string,
    firstHorseId: string,
    secondHorseId: string,
    thirdHorseId: string,
    amount: number
  ): Promise<PlaceBetResponse> {
    return this.placeBet(raceId, 'trifecta', amount, [firstHorseId, secondHorseId, thirdHorseId]);
  },
};

export default racingService;
