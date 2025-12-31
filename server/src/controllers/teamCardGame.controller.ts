/**
 * Team Card Game Controller
 *
 * REST API endpoints for team card game operations
 * Handles session management, lobby browsing, and state queries
 */

import { Request, Response, NextFunction } from 'express';
import { TeamCardGameSession } from '../models/TeamCardGameSession.model';
import { TeamCardGameType, TeamCardGamePhase, NPCDifficulty } from '@desperados/shared';
import * as TeamCardGameService from '../services/teamCardGame.service';
import { TEAM_CARD_LOCATIONS, getAccessibleLocations, checkLocationAccess, getLocationById } from '../data/teamCardLocations';
import { RAID_BOSSES, getBossById, getBossesForGameType } from '../data/teamCardBosses';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';

// =============================================================================
// LOBBY ENDPOINTS
// =============================================================================

/**
 * Get available lobbies
 * GET /api/team-card/lobbies
 */
export async function getLobbies(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { gameType, locationId } = req.query;

    const query: any = {
      phase: TeamCardGamePhase.WAITING,
      isPrivate: false
    };

    if (gameType) {
      query.gameType = gameType;
    }

    if (locationId) {
      query.locationId = locationId;
    }

    const lobbies = await TeamCardGameSession.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const lobbyData = lobbies.map(lobby => ({
      sessionId: lobby.sessionId,
      gameType: lobby.gameType,
      playerCount: lobby.players.filter(p => !p.isNPC).length,
      npcCount: lobby.players.filter(p => p.isNPC).length,
      maxPlayers: 4,
      locationId: lobby.locationId,
      raidMode: lobby.raidMode,
      raidBossId: lobby.raidBossId,
      raidBossName: lobby.raidBossId ? getBossById(lobby.raidBossId)?.name : undefined,
      createdAt: lobby.createdAt,
      averageSkill: (lobby as any).averageTeamSkill
    }));

    res.json({
      success: true,
      data: {
        lobbies: lobbyData,
        total: lobbyData.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get active session for current player
 * GET /api/team-card/session
 */
export async function getActiveSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const characterId = req.character?._id.toString();

    if (!characterId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    const session = await TeamCardGameSession.findByPlayer(characterId);

    if (!session) {
      res.json({
        success: true,
        data: { session: null }
      });
      return;
    }

    // Build client state
    const clientState = TeamCardGameService.buildClientState(session, characterId);

    res.json({
      success: true,
      data: {
        session: clientState
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get session by ID
 * GET /api/team-card/session/:sessionId
 */
export async function getSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { sessionId } = req.params;
    const characterId = req.character?._id.toString();

    if (!characterId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    const session = await TeamCardGameSession.findBySessionId(sessionId);

    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
      return;
    }

    // Check if player is in session
    const isInSession = session.players.some(p => p.characterId === characterId);
    if (!isInSession) {
      // Return limited info for non-participants
      res.json({
        success: true,
        data: {
          session: {
            sessionId: session.sessionId,
            gameType: session.gameType,
            phase: session.phase,
            playerCount: session.players.filter(p => !p.isNPC).length,
            raidMode: session.raidMode
          }
        }
      });
      return;
    }

    // Build full client state for participant
    const clientState = TeamCardGameService.buildClientState(session, characterId);

    res.json({
      success: true,
      data: {
        session: clientState
      }
    });
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// LOCATION ENDPOINTS
// =============================================================================

/**
 * Get all locations
 * GET /api/team-card/locations
 */
export async function getLocations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const characterId = req.character?._id.toString();
    const character = req.character;

    const locations = Object.values(TEAM_CARD_LOCATIONS).map(location => {
      let access = { canAccess: false, missingRequirements: ['Not authenticated'] as string[] };

      if (character) {
        const characterData = {
          level: character.level || 1,
          skills: {
            gambling: character.getSkillLevel?.('gambling') || 1
          },
          reputation: (character as any).reputation || {},
          cosmicProgress: (character as any).cosmicProgress,
          completedQuests: (character as any).completedQuests || []
        };
        access = checkLocationAccess(location.unlockRequirements, characterData);
      }

      return {
        id: location.id,
        name: location.name,
        description: location.description,
        locationId: location.locationId,
        availableGames: location.availableGames,
        raidBosses: location.raidBosses,
        unlockRequirements: location.unlockRequirements,
        atmosphere: location.atmosphere,
        canAccess: access.canAccess,
        missingRequirements: access.missingRequirements
      };
    });

    res.json({
      success: true,
      data: { locations }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get location details
 * GET /api/team-card/locations/:locationId
 */
export async function getLocation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { locationId } = req.params;
    const location = getLocationById(locationId);

    if (!location) {
      res.status(404).json({
        success: false,
        error: 'Location not found'
      });
      return;
    }

    // Get active sessions at this location
    const activeSessions = await TeamCardGameSession.find({
      locationId,
      phase: { $ne: TeamCardGamePhase.GAME_COMPLETE }
    }).countDocuments();

    // Get bosses available at this location
    const bosses = location.raidBosses.map(bossId => {
      const boss = getBossById(bossId);
      if (!boss) return null;
      return {
        id: boss.id,
        name: boss.name,
        title: boss.title,
        difficulty: boss.difficulty,
        gameTypes: boss.gameTypes
      };
    }).filter(Boolean);

    res.json({
      success: true,
      data: {
        location: {
          ...location,
          activeSessions,
          bosses
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// BOSS ENDPOINTS
// =============================================================================

/**
 * Get all raid bosses
 * GET /api/team-card/bosses
 */
export async function getBosses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { gameType } = req.query;

    let bosses = Object.values(RAID_BOSSES);

    if (gameType) {
      bosses = getBossesForGameType(gameType as TeamCardGameType);
    }

    const bossData = bosses.map(boss => ({
      id: boss.id,
      name: boss.name,
      title: boss.title,
      description: boss.description,
      gameTypes: boss.gameTypes,
      difficulty: boss.difficulty,
      health: boss.health,
      phaseCount: boss.phases.length,
      rewards: boss.rewards,
      lore: boss.lore
    }));

    res.json({
      success: true,
      data: { bosses: bossData }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get boss details
 * GET /api/team-card/bosses/:bossId
 */
export async function getBoss(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { bossId } = req.params;
    const boss = getBossById(bossId);

    if (!boss) {
      res.status(404).json({
        success: false,
        error: 'Boss not found'
      });
      return;
    }

    // Get active raids against this boss
    const activeRaids = await TeamCardGameSession.find({
      raidBossId: bossId,
      raidMode: true,
      phase: { $nin: [TeamCardGamePhase.WAITING, TeamCardGamePhase.GAME_COMPLETE] }
    }).countDocuments();

    // Find locations where this boss is available
    const locations = Object.values(TEAM_CARD_LOCATIONS)
      .filter(loc => loc.raidBosses.includes(bossId))
      .map(loc => ({
        id: loc.id,
        name: loc.name
      }));

    res.json({
      success: true,
      data: {
        boss: {
          ...boss,
          activeRaids,
          locations
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// GAME TYPE ENDPOINTS
// =============================================================================

/**
 * Get game type info
 * GET /api/team-card/games
 */
export async function getGameTypes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const gameTypes = [
      {
        type: TeamCardGameType.EUCHRE,
        name: 'Euchre',
        description: 'Fast-paced trick-taking game with 24 cards. Call trump and try to take at least 3 tricks.',
        minPlayers: 4,
        tricksPerRound: 5,
        deckSize: 24,
        hasNilBid: false,
        hasMelds: false,
        features: ['Trump calling', 'Going alone', 'Quick rounds']
      },
      {
        type: TeamCardGameType.SPADES,
        name: 'Spades',
        description: 'Bid the number of tricks you expect to take. Spades are always trump.',
        minPlayers: 4,
        tricksPerRound: 13,
        deckSize: 52,
        hasNilBid: true,
        hasMelds: false,
        features: ['Bidding', 'Nil bids', 'Bag penalties']
      },
      {
        type: TeamCardGameType.HEARTS,
        name: 'Hearts',
        description: 'Avoid taking hearts and the Queen of Spades. Lowest score wins!',
        minPlayers: 4,
        tricksPerRound: 13,
        deckSize: 52,
        hasNilBid: false,
        hasMelds: false,
        features: ['Point avoidance', 'Shoot the moon', 'Card passing']
      },
      {
        type: TeamCardGameType.BRIDGE,
        name: 'Bridge',
        description: 'The king of card games. Bid contracts and play with a dummy hand.',
        minPlayers: 4,
        tricksPerRound: 13,
        deckSize: 52,
        hasNilBid: false,
        hasMelds: false,
        features: ['Complex bidding', 'Declarer play', 'Contract scoring']
      },
      {
        type: TeamCardGameType.PINOCHLE,
        name: 'Pinochle',
        description: 'Meld combinations for points, then win tricks with counters.',
        minPlayers: 4,
        tricksPerRound: 12,
        deckSize: 48,
        hasNilBid: false,
        hasMelds: true,
        features: ['Melding phase', 'Counter cards', 'Trump bidding']
      }
    ];

    res.json({
      success: true,
      data: { gameTypes }
    });
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// STATS ENDPOINTS
// =============================================================================

/**
 * Get player's team card game stats
 * GET /api/team-card/stats
 */
export async function getPlayerStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const characterId = req.character?._id.toString();

    if (!characterId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    // Get completed sessions
    const completedSessions = await TeamCardGameSession.find({
      'players.characterId': characterId,
      phase: TeamCardGamePhase.GAME_COMPLETE
    });

    // Calculate stats
    const stats = {
      gamesPlayed: completedSessions.length,
      gamesWon: 0,
      raidBossesDefeated: 0,
      totalTricksWon: 0,
      mechanicsCountered: 0,
      perfectTricks: 0,
      byGameType: {} as Record<string, { played: number; won: number }>
    };

    for (const session of completedSessions) {
      const player = session.players.find(p => p.characterId === characterId);
      if (!player) continue;

      // Determine if player's team won
      const winningTeam = session.teamScores[0] > session.teamScores[1] ? 0 : 1;
      const playerWon = player.teamIndex === winningTeam;

      if (playerWon) stats.gamesWon++;
      if (session.raidMode && (session.bossHealth || 0) <= 0) {
        stats.raidBossesDefeated++;
      }

      stats.totalTricksWon += player.tricksWonTotal;
      stats.mechanicsCountered += player.mechanicsCountered;
      stats.perfectTricks += player.perfectTricks;

      // Track by game type
      const gameType = session.gameType;
      if (!stats.byGameType[gameType]) {
        stats.byGameType[gameType] = { played: 0, won: 0 };
      }
      stats.byGameType[gameType].played++;
      if (playerWon) stats.byGameType[gameType].won++;
    }

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export default {
  getLobbies,
  getActiveSession,
  getSession,
  getLocations,
  getLocation,
  getBosses,
  getBoss,
  getGameTypes,
  getPlayerStats
};
