/**
 * Tournament Service
 * API client for PvP tournaments
 */

import api from './api';

// ===== Types =====

export type TournamentType = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
export type TournamentStatus = 'registration' | 'in_progress' | 'completed' | 'cancelled';
export type MatchStatus = 'pending' | 'in_progress' | 'completed' | 'forfeit';

export interface TournamentParticipant {
  characterId: string;
  characterName: string;
  level: number;
  wins: number;
  losses: number;
  seed?: number;
  eliminated: boolean;
  eliminatedRound?: number;
}

export interface TournamentMatch {
  _id: string;
  matchId: string;
  round: number;
  matchNumber: number;
  player1?: {
    characterId: string;
    characterName: string;
    score: number;
  };
  player2?: {
    characterId: string;
    characterName: string;
    score: number;
  };
  status: MatchStatus;
  winnerId?: string;
  winnerName?: string;
  startTime?: string;
  endTime?: string;
  isBye: boolean;
}

export interface TournamentBracket {
  rounds: Array<{
    roundNumber: number;
    name: string;
    matches: TournamentMatch[];
  }>;
  currentRound: number;
  totalRounds: number;
}

export interface Tournament {
  _id: string;
  name: string;
  description: string;
  type: TournamentType;
  status: TournamentStatus;
  entryFee: number;
  prizePool: number;
  minLevel: number;
  maxLevel?: number;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  participants: TournamentParticipant[];
  currentRound: number;
  totalRounds: number;
  registrationDeadline: string;
  startTime: string;
  endTime?: string;
  winnerId?: string;
  winnerName?: string;
  locationId?: string;
  locationName?: string;
  rules?: string[];
  prizeDistribution?: {
    first: number;
    second: number;
    third?: number;
    fourth?: number;
  };
}

export interface MatchState {
  match: TournamentMatch;
  playerHealth: number;
  opponentHealth: number;
  currentTurn: string;
  turnNumber: number;
  actions: MatchAction[];
  isPlayerTurn: boolean;
  availableActions: string[];
  timeRemaining?: number;
}

export interface MatchAction {
  actionType: 'attack' | 'defend' | 'special' | 'item';
  actorId: string;
  actorName: string;
  targetId?: string;
  damage?: number;
  blocked?: number;
  effect?: string;
  message: string;
  timestamp: string;
}

export interface TournamentHistoryEntry {
  _id: string;
  tournamentId: string;
  tournamentName: string;
  tournamentType: TournamentType;
  placement: number;
  totalParticipants: number;
  prize: number;
  wins: number;
  losses: number;
  date: string;
}

// ===== Request/Response Types =====

export interface CreateTournamentRequest {
  name: string;
  description: string;
  type: TournamentType;
  entryFee: number;
  prizePool?: number;
  minLevel?: number;
  maxLevel?: number;
  minParticipants: number;
  maxParticipants: number;
  registrationDeadline: string;
  startTime: string;
  locationId?: string;
  rules?: string[];
}

export interface CreateTournamentResponse {
  success: boolean;
  tournament: Tournament;
  message: string;
}

export interface JoinTournamentResponse {
  success: boolean;
  tournament: Tournament;
  participant: TournamentParticipant;
  message: string;
}

export interface LeaveTournamentResponse {
  success: boolean;
  refund?: number;
  message: string;
}

export interface StartTournamentResponse {
  success: boolean;
  tournament: Tournament;
  bracket: TournamentBracket;
  message: string;
}

export interface StartMatchResponse {
  success: boolean;
  matchState: MatchState;
  message: string;
}

export interface PlayMatchActionRequest {
  actionType: 'attack' | 'defend' | 'special' | 'item';
  itemId?: string;
  specialMoveId?: string;
}

export interface PlayMatchActionResponse {
  success: boolean;
  matchState: MatchState;
  action: MatchAction;
  opponentAction?: MatchAction;
  matchEnded: boolean;
  winner?: {
    characterId: string;
    characterName: string;
  };
  message: string;
}

// ===== Tournament Service =====

export const tournamentService = {
  // ===== Public Routes =====

  /**
   * Get tournaments open for registration
   */
  async getOpenTournaments(): Promise<Tournament[]> {
    const response = await api.get<{ data: { tournaments: Tournament[] } }>('/tournaments/open');
    return response.data.data?.tournaments || [];
  },

  /**
   * Get tournaments in progress
   */
  async getActiveTournaments(): Promise<Tournament[]> {
    const response = await api.get<{ data: { tournaments: Tournament[] } }>('/tournaments/active');
    return response.data.data?.tournaments || [];
  },

  /**
   * Get tournament bracket
   */
  async getTournamentBracket(tournamentId: string): Promise<TournamentBracket> {
    const response = await api.get<{ data: TournamentBracket }>(
      `/tournaments/${tournamentId}/bracket`
    );
    return response.data.data;
  },

  // ===== Authenticated Routes =====

  /**
   * Get tournament history for character
   */
  async getTournamentHistory(limit?: number): Promise<TournamentHistoryEntry[]> {
    const response = await api.get<{ data: { history: TournamentHistoryEntry[] } }>(
      '/tournaments/history',
      { params: limit ? { limit } : {} }
    );
    return response.data.data?.history || [];
  },

  /**
   * Create a new tournament
   */
  async createTournament(request: CreateTournamentRequest): Promise<CreateTournamentResponse> {
    const response = await api.post<{ data: CreateTournamentResponse }>('/tournaments', request);
    return response.data.data;
  },

  /**
   * Join a tournament
   */
  async joinTournament(tournamentId: string): Promise<JoinTournamentResponse> {
    const response = await api.post<{ data: JoinTournamentResponse }>(
      `/tournaments/${tournamentId}/join`
    );
    return response.data.data;
  },

  /**
   * Leave a tournament (before it starts)
   */
  async leaveTournament(tournamentId: string): Promise<LeaveTournamentResponse> {
    const response = await api.post<{ data: LeaveTournamentResponse }>(
      `/tournaments/${tournamentId}/leave`
    );
    return response.data.data;
  },

  /**
   * Start a tournament (admin/organizer)
   */
  async startTournament(tournamentId: string): Promise<StartTournamentResponse> {
    const response = await api.post<{ data: StartTournamentResponse }>(
      `/tournaments/${tournamentId}/start`
    );
    return response.data.data;
  },

  /**
   * Get current match for player
   */
  async getCurrentMatch(tournamentId: string): Promise<MatchState | null> {
    try {
      const response = await api.get<{ data: MatchState }>(
        `/tournaments/${tournamentId}/my-match`
      );
      return response.data.data;
    } catch {
      return null;
    }
  },

  /**
   * Start a tournament match
   */
  async startMatch(tournamentId: string, matchId: string): Promise<StartMatchResponse> {
    const response = await api.post<{ data: StartMatchResponse }>(
      `/tournaments/${tournamentId}/match/${matchId}/start`
    );
    return response.data.data;
  },

  /**
   * Play an action in a tournament match
   */
  async playMatchAction(
    tournamentId: string,
    matchId: string,
    action: PlayMatchActionRequest
  ): Promise<PlayMatchActionResponse> {
    const response = await api.post<{ data: PlayMatchActionResponse }>(
      `/tournaments/${tournamentId}/match/${matchId}/play`,
      action
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Attack in a match
   */
  async attack(tournamentId: string, matchId: string): Promise<PlayMatchActionResponse> {
    return this.playMatchAction(tournamentId, matchId, { actionType: 'attack' });
  },

  /**
   * Defend in a match
   */
  async defend(tournamentId: string, matchId: string): Promise<PlayMatchActionResponse> {
    return this.playMatchAction(tournamentId, matchId, { actionType: 'defend' });
  },

  /**
   * Use a special move in a match
   */
  async useSpecial(
    tournamentId: string,
    matchId: string,
    specialMoveId: string
  ): Promise<PlayMatchActionResponse> {
    return this.playMatchAction(tournamentId, matchId, {
      actionType: 'special',
      specialMoveId,
    });
  },

  /**
   * Use an item in a match
   */
  async useItem(
    tournamentId: string,
    matchId: string,
    itemId: string
  ): Promise<PlayMatchActionResponse> {
    return this.playMatchAction(tournamentId, matchId, {
      actionType: 'item',
      itemId,
    });
  },
};

export default tournamentService;
