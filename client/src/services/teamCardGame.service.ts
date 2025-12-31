/**
 * Team Card Game Client Service
 *
 * Handles REST API calls for team-based trick-taking card games.
 * Socket events are handled by the useTeamCardGame hook.
 */

import { api } from './api';

// =============================================================================
// LOCAL TYPES (to avoid shared package runtime issues)
// =============================================================================

export type TeamCardGameType = 'euchre' | 'spades' | 'hearts' | 'bridge' | 'pinochle';

export interface TeamCardLocation {
  id: string;
  name: string;
  description: string;
  availableGames: TeamCardGameType[];
  requirements?: {
    gambling?: number;
    reputation?: number;
    gold?: number;
  };
  atmosphere: {
    theme: string;
    ambience: string;
  };
}

export interface RaidBoss {
  id: string;
  name: string;
  title: string;
  description: string;
  difficulty: 'hard' | 'very_hard' | 'nightmare';
  gameTypes: TeamCardGameType[];
  baseHealth: number;
  phases: {
    healthThreshold: number;
    name: string;
    mechanics: string[];
  }[];
  rewards: {
    baseGold: number;
    baseXP: number;
    lootTable: string[];
  };
}

export interface TeamCardGameSession {
  sessionId: string;
  gameType: TeamCardGameType;
  phase: string;
  players: any[];
  teamScores: [number, number];
  raidMode: boolean;
  raidBossId?: string;
}

export interface GameTypeConfig {
  gameType: TeamCardGameType;
  displayName: string;
  description: string;
  cardsPerPlayer: number;
  winningScore: number;
  hasBidding: boolean;
  hasTrump: boolean;
  hasMelding: boolean;
  minimumGamblingSkill: number;
}

// =============================================================================
// LOBBY ENDPOINTS
// =============================================================================

export interface LobbySession {
  sessionId: string;
  gameType: TeamCardGameType;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  raidMode: boolean;
  raidBossId?: string;
  isPrivate: boolean;
  locationId?: string;
}

export interface GetLobbiesParams {
  gameType?: TeamCardGameType;
  locationId?: string;
}

/**
 * Get list of available lobbies to join
 */
export async function getLobbies(params?: GetLobbiesParams): Promise<LobbySession[]> {
  const queryParams = new URLSearchParams();
  if (params?.gameType) queryParams.set('gameType', params.gameType);
  if (params?.locationId) queryParams.set('locationId', params.locationId);

  const query = queryParams.toString();
  const response = await api.get<{ data: { lobbies: LobbySession[] } }>(
    `/team-card/lobbies${query ? `?${query}` : ''}`
  );
  return response.data.data?.lobbies || [];
}

// =============================================================================
// SESSION ENDPOINTS
// =============================================================================

/**
 * Get current player's active session (if any)
 */
export async function getActiveSession(): Promise<TeamCardGameSession | null> {
  const response = await api.get<{ data: { session: TeamCardGameSession | null } }>(
    '/team-card/session'
  );
  return response.data.data?.session ?? null;
}

/**
 * Get specific session details
 */
export async function getSession(sessionId: string): Promise<TeamCardGameSession> {
  const response = await api.get<{ data: { session: TeamCardGameSession } }>(
    `/team-card/session/${sessionId}`
  );
  return response.data.data.session;
}

// =============================================================================
// LOCATION ENDPOINTS
// =============================================================================

export interface LocationWithAccess extends TeamCardLocation {
  hasAccess: boolean;
  missingRequirements?: string[];
}

/**
 * Get all team card game locations with access status
 */
export async function getLocations(): Promise<LocationWithAccess[]> {
  const response = await api.get<{ data: { locations: LocationWithAccess[] } }>(
    '/team-card/locations'
  );
  return response.data.data?.locations || [];
}

/**
 * Get specific location details
 */
export async function getLocation(locationId: string): Promise<LocationWithAccess> {
  const response = await api.get<{ data: { location: LocationWithAccess } }>(
    `/team-card/locations/${locationId}`
  );
  return response.data.data.location;
}

// =============================================================================
// BOSS ENDPOINTS
// =============================================================================

export interface GetBossesParams {
  gameType?: TeamCardGameType;
}

/**
 * Get all raid bosses
 */
export async function getBosses(params?: GetBossesParams): Promise<RaidBoss[]> {
  const queryParams = new URLSearchParams();
  if (params?.gameType) queryParams.set('gameType', params.gameType);

  const query = queryParams.toString();
  const response = await api.get<{ data: { bosses: RaidBoss[] } }>(
    `/team-card/bosses${query ? `?${query}` : ''}`
  );
  return response.data.data?.bosses || [];
}

/**
 * Get specific boss details
 */
export async function getBoss(bossId: string): Promise<RaidBoss> {
  const response = await api.get<{ data: { boss: RaidBoss } }>(
    `/team-card/bosses/${bossId}`
  );
  return response.data.data.boss;
}

// =============================================================================
// GAME TYPE ENDPOINTS
// =============================================================================

/**
 * Get info about all available game types
 */
export async function getGameTypes(): Promise<GameTypeConfig[]> {
  const response = await api.get<{ data: { gameTypes: GameTypeConfig[] } }>(
    '/team-card/games'
  );
  return response.data.data?.gameTypes || [];
}

// =============================================================================
// STATS ENDPOINTS
// =============================================================================

export interface TeamCardPlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  tricksWon: number;
  raidsCompleted: number;
  bossesDefeated: number;
  highestContribution: number;
  favoriteGameType?: TeamCardGameType;
  byGameType: Record<TeamCardGameType, {
    played: number;
    won: number;
    winRate: number;
  }>;
}

/**
 * Get player's team card game statistics
 */
export async function getPlayerStats(): Promise<TeamCardPlayerStats> {
  const response = await api.get<{ data: { stats: TeamCardPlayerStats } }>(
    '/team-card/stats'
  );
  return response.data.data.stats;
}

// =============================================================================
// EXPORT
// =============================================================================

export const teamCardGameService = {
  getLobbies,
  getActiveSession,
  getSession,
  getLocations,
  getLocation,
  getBosses,
  getBoss,
  getGameTypes,
  getPlayerStats,
};

export default teamCardGameService;
