/**
 * Team Card Game Socket Event Handlers
 *
 * Handle real-time Socket.io events for team-based card games
 * Manages game lobbies, player actions, and state synchronization
 */

import { Socket } from 'socket.io';
import { AuthenticatedSocket, requireSocketAuth, verifyCharacterOwnership } from '../middleware/socketAuth';
import { emitToRoom, getSocketIO, broadcastToUser } from '../config/socket';
import { Character } from '../models/Character.model';
import { TeamCardGameSession, ITeamCardGameSession } from '../models/TeamCardGameSession.model';
import {
  TeamCardGameType,
  TeamCardGamePhase,
  NPCDifficulty,
  TeamCardGameClientState,
  TeamCardGameServerEvents,
  TeamCardGameClientEvents,
  CardSuit
} from '@desperados/shared';
import * as TeamCardGameService from '../services/teamCardGame.service';
import { NPCPartnerService } from '../services/npcPartner.service';
import { checkLocationAccess, getLocationById } from '../data/teamCardLocations';
import logger from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

interface CreateSessionPayload {
  gameType: TeamCardGameType;
  locationId?: string;
  raidBossId?: string;
  isPrivate?: boolean;
  password?: string;
}

interface JoinSessionPayload {
  sessionId: string;
  password?: string;
}

interface ReadyPayload {
  sessionId: string;
}

interface PlayCardPayload {
  sessionId: string;
  cardIndex: number;
}

interface BidPayload {
  sessionId: string;
  bid: any;
}

interface TrumpCallPayload {
  sessionId: string;
  action: 'order_up' | 'pass' | 'call' | 'pick_up';
  suit?: CardSuit;
  alone?: boolean;
}

interface DiscardPayload {
  sessionId: string;
  cardIndex: number;
}

interface RequestNPCPayload {
  sessionId: string;
  seatIndex: 0 | 1 | 2 | 3;
  difficulty?: NPCDifficulty;
}

interface LeavePayload {
  sessionId: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DISCONNECT_GRACE_PERIOD_MS = 60 * 1000; // 60 seconds to reconnect

// Track disconnect timers (in-memory, would use Redis in production for horizontal scaling)
const disconnectTimers = new Map<string, NodeJS.Timeout>();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get room name for a session
 */
function getSessionRoomName(sessionId: string): string {
  return `teamCard:${sessionId}`;
}

/**
 * Validate socket has proper authentication data
 * Returns character info if valid, null if invalid (and emits error)
 */
function validateSocketData(socket: AuthenticatedSocket): { characterId: string; characterName: string } | null {
  if (!socket.data || !socket.data.characterId || !socket.data.characterName) {
    socket.emit('teamCard:error', {
      message: 'Socket not properly authenticated',
      code: 'SOCKET_NOT_AUTHENTICATED'
    });
    return null;
  }
  return {
    characterId: socket.data.characterId,
    characterName: socket.data.characterName
  };
}

/**
 * Get character's gambling skill
 */
async function getCharacterSkills(characterId: string): Promise<{
  gambling: number;
  perception: number;
  deception: number;
  sleightOfHand: number;
}> {
  const character = await Character.findById(characterId);
  if (!character) {
    return { gambling: 1, perception: 1, deception: 1, sleightOfHand: 1 };
  }

  const getSkillLevel = (skillName: string): number => {
    if (Array.isArray(character.skills)) {
      const skill = character.skills.find((s: any) => s.name === skillName);
      return skill?.level ?? 1;
    }
    return (character.skills as any)?.[skillName] ?? 1;
  };

  return {
    gambling: getSkillLevel('gambling'),
    perception: getSkillLevel('perception'),
    deception: getSkillLevel('deception'),
    sleightOfHand: getSkillLevel('sleight_of_hand')
  };
}

/**
 * Check if character can access a location
 */
async function canAccessLocation(characterId: string, locationId: string): Promise<{
  canAccess: boolean;
  missingRequirements: string[];
}> {
  const location = getLocationById(locationId);
  if (!location) {
    return { canAccess: false, missingRequirements: ['Location not found'] };
  }

  const character = await Character.findById(characterId);
  if (!character) {
    return { canAccess: false, missingRequirements: ['Character not found'] };
  }

  // Build character data for access check
  const getSkillLevel = (skillName: string): number => {
    if (Array.isArray(character.skills)) {
      const skill = character.skills.find((s: any) => s.name === skillName);
      return skill?.level ?? 0;
    }
    return (character.skills as any)?.[skillName] ?? 0;
  };

  const characterData = {
    level: character.level || 1,
    skills: {
      gambling: getSkillLevel('gambling')
    },
    reputation: (character as any).reputation || {},
    cosmicProgress: (character as any).cosmicProgress,
    completedQuests: (character as any).completedQuests || []
  };

  return checkLocationAccess(location.unlockRequirements, characterData);
}

/**
 * Build and emit state update to all players in session
 */
async function broadcastStateUpdate(session: ITeamCardGameSession): Promise<void> {
  const roomName = getSessionRoomName(session.sessionId);

  // Build state for each player and emit individually
  for (const player of session.players) {
    if (player.isNPC) continue;

    const clientState = TeamCardGameService.buildClientState(session, player.characterId);
    if (player.socketId) {
      const io = getSocketIO();
      io.to(player.socketId).emit('teamCard:session_update', clientState);
    }
  }
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handle session creation
 */
async function handleCreateSession(
  socket: AuthenticatedSocket,
  payload: CreateSessionPayload
): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;
    const { gameType, locationId, raidBossId, isPrivate, password } = payload;

    // Verify character ownership
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('teamCard:error', {
        message: 'Character verification failed',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      return;
    }

    // Check location access if specified
    if (locationId) {
      const access = await canAccessLocation(characterId, locationId);
      if (!access.canAccess) {
        socket.emit('teamCard:error', {
          message: `Cannot access location: ${access.missingRequirements.join(', ')}`,
          code: 'LOCATION_LOCKED'
        });
        return;
      }
    }

    // Create session
    const session = await TeamCardGameService.createSession(
      characterId,
      gameType,
      {
        locationId,
        raidBossId,
        isPrivate,
        password
      }
    );

    // Join socket room
    const roomName = getSessionRoomName(session.sessionId);
    await socket.join(roomName);

    // Update socket ID in session
    await TeamCardGameService.updatePlayerConnection(
      session.sessionId,
      characterId,
      true,
      socket.id
    );

    logger.info(`Character ${characterName} created team card session ${session.sessionId} (${gameType})`);

    // Send initial state
    const clientState = TeamCardGameService.buildClientState(session, characterId);
    socket.emit('teamCard:session_created', {
      sessionId: session.sessionId,
      state: clientState
    });

  } catch (error) {
    logger.error(`Error in handleCreateSession:`, error);
    socket.emit('teamCard:error', {
      message: error instanceof Error ? error.message : 'Failed to create session',
      code: 'CREATE_FAILED'
    });
  }
}

/**
 * Handle joining a session
 */
async function handleJoinSession(
  socket: AuthenticatedSocket,
  payload: JoinSessionPayload
): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;
    const { sessionId, password } = payload;

    // Verify character ownership
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('teamCard:error', {
        message: 'Character verification failed',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      return;
    }

    // Attempt to join
    const session = await TeamCardGameService.joinSession(
      sessionId,
      characterId,
      password
    );

    // Join socket room
    const roomName = getSessionRoomName(sessionId);
    await socket.join(roomName);

    // Update socket ID in session
    await TeamCardGameService.updatePlayerConnection(
      sessionId,
      characterId,
      true,
      socket.id
    );

    // Clear any disconnect timer
    const timerKey = `${sessionId}:${characterId}`;
    const existingTimer = disconnectTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      disconnectTimers.delete(timerKey);
    }

    logger.info(`Character ${characterName} joined team card session ${sessionId}`);

    // Notify other players
    socket.to(roomName).emit('teamCard:player_joined', {
      characterId,
      characterName,
      seatIndex: session.players.find(p => p.characterId === characterId)?.seatIndex
    });

    // Send state to joining player
    const clientState = TeamCardGameService.buildClientState(session, characterId);
    socket.emit('teamCard:session_joined', {
      sessionId,
      state: clientState
    });

    // Broadcast updated state to all
    await broadcastStateUpdate(session);

  } catch (error) {
    logger.error(`Error in handleJoinSession:`, error);
    socket.emit('teamCard:error', {
      message: error instanceof Error ? error.message : 'Failed to join session',
      code: 'JOIN_FAILED'
    });
  }
}

/**
 * Handle player ready
 */
async function handleReady(
  socket: AuthenticatedSocket,
  payload: ReadyPayload
): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;
    const { sessionId } = payload;

    // Verify character ownership
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('teamCard:error', {
        message: 'Character verification failed',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      return;
    }

    const session = await TeamCardGameService.setPlayerReady(sessionId, characterId, true);

    const roomName = getSessionRoomName(sessionId);

    // Notify room
    emitToRoom(roomName, 'teamCard:player_ready', {
      characterId,
      characterName
    });

    logger.info(`Character ${characterName} is ready in session ${sessionId}`);

    // Check if game has started (setPlayerReady auto-starts when all ready)
    if (session.phase !== TeamCardGamePhase.WAITING) {
      emitToRoom(roomName, 'teamCard:game_started', {
        gameType: session.gameType,
        dealer: session.dealer,
        firstPlayer: session.currentPlayer
      });

      // Broadcast initial game state
      await broadcastStateUpdate(session);
    }

  } catch (error) {
    logger.error(`Error in handleReady:`, error);
    socket.emit('teamCard:error', {
      message: error instanceof Error ? error.message : 'Failed to ready up',
      code: 'READY_FAILED'
    });
  }
}

/**
 * Handle playing a card
 */
async function handlePlayCard(
  socket: AuthenticatedSocket,
  payload: PlayCardPayload
): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;
    const { sessionId, cardIndex } = payload;

    // Verify character ownership
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('teamCard:error', {
        message: 'Character verification failed',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      return;
    }

    const result = await TeamCardGameService.playCard(sessionId, characterId, cardIndex);
    const { session, trickComplete } = result;

    const roomName = getSessionRoomName(sessionId);

    // Get the last played card (either from current trick or last trick in history)
    const lastTrick = trickComplete
      ? session.trickHistory[session.trickHistory.length - 1]
      : null;
    const playedCard = trickComplete && lastTrick
      ? lastTrick.cards[lastTrick.cards.length - 1]?.card
      : session.currentTrick[session.currentTrick.length - 1]?.card;

    // Get player's seat for animation
    const player = session.players.find(p => p.characterId === characterId);

    // Notify room of card played (service already broadcasts, but we include extra info)
    emitToRoom(roomName, 'teamCard:card_played', {
      characterId,
      characterName,
      seatIndex: player?.seatIndex,
      card: playedCard,
      trickPosition: session.currentTrick.length
    });

    // Check if trick complete
    if (trickComplete && lastTrick) {
      const winnerId = lastTrick.winnerId;
      emitToRoom(roomName, 'teamCard:trick_complete', {
        winnerId,
        winnerSeat: session.players.find(p => p.characterId === winnerId)?.seatIndex,
        trick: lastTrick
      });
    }

    // Check if round complete (all tricks played - typically 13 for most games)
    const roundComplete = session.phase === TeamCardGamePhase.ROUND_SCORING ||
      session.phase === TeamCardGamePhase.GAME_COMPLETE;

    if (roundComplete) {
      emitToRoom(roomName, 'teamCard:round_complete', {
        roundNumber: session.currentRound - 1,
        teamScores: session.teamScores,
        roundScore: session.roundScores[session.roundScores.length - 1]
      });
    }

    // Check if game complete
    const gameComplete = session.phase === TeamCardGamePhase.GAME_COMPLETE;

    if (gameComplete) {
      emitToRoom(roomName, 'teamCard:game_complete', {
        winningTeam: session.teamScores[0] > session.teamScores[1] ? 0 : 1,
        finalScores: session.teamScores,
        raidSuccess: session.raidMode ? (session.bossHealth || 0) <= 0 : undefined
      });

      // Cleanup after delay
      setTimeout(async () => {
        await TeamCardGameService.leaveSession(sessionId, characterId);
      }, 30000);
    } else {
      // Broadcast updated state
      await broadcastStateUpdate(session);
    }

  } catch (error) {
    logger.error(`Error in handlePlayCard:`, error);
    socket.emit('teamCard:error', {
      message: error instanceof Error ? error.message : 'Failed to play card',
      code: 'PLAY_FAILED'
    });
  }
}

/**
 * Handle bidding
 */
async function handleBid(
  socket: AuthenticatedSocket,
  payload: BidPayload
): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;
    const { sessionId, bid } = payload;

    // Verify character ownership
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('teamCard:error', {
        message: 'Character verification failed',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      return;
    }

    const session = await TeamCardGameService.processBid(sessionId, characterId, bid);

    const roomName = getSessionRoomName(sessionId);

    // Notify room of bid
    emitToRoom(roomName, 'teamCard:bid_made', {
      characterId,
      characterName,
      bid
    });

    // Check if bidding complete
    if (session.phase === TeamCardGamePhase.PLAYING) {
      emitToRoom(roomName, 'teamCard:bidding_complete', {
        contract: session.contract,
        declarer: session.declarer
      });
    }

    // Broadcast updated state
    await broadcastStateUpdate(session);

  } catch (error) {
    logger.error(`Error in handleBid:`, error);
    socket.emit('teamCard:error', {
      message: error instanceof Error ? error.message : 'Failed to submit bid',
      code: 'BID_FAILED'
    });
  }
}

/**
 * Handle Euchre trump call
 */
async function handleTrumpCall(
  socket: AuthenticatedSocket,
  payload: TrumpCallPayload
): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;
    const { sessionId, action, suit, alone } = payload;

    // Verify character ownership
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('teamCard:error', {
        message: 'Character verification failed',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      return;
    }

    const session = await TeamCardGameService.processEuchreTrumpCall(
      sessionId,
      characterId,
      action,
      { suit, goingAlone: alone }
    );

    const roomName = getSessionRoomName(sessionId);

    // Notify room of trump decision
    emitToRoom(roomName, 'teamCard:trump_called', {
      characterId,
      characterName,
      action,
      suit: session.trump,
      alone: session.goingAlone
    });

    // If trump was called, notify of maker
    if (session.maker !== undefined) {
      const maker = session.players[session.maker];
      emitToRoom(roomName, 'teamCard:maker_set', {
        makerId: maker.characterId,
        makerName: maker.characterName,
        trump: session.trump,
        alone: session.goingAlone
      });
    }

    // Broadcast updated state
    await broadcastStateUpdate(session);

  } catch (error) {
    logger.error(`Error in handleTrumpCall:`, error);
    socket.emit('teamCard:error', {
      message: error instanceof Error ? error.message : 'Failed to process trump call',
      code: 'TRUMP_CALL_FAILED'
    });
  }
}

/**
 * Handle Euchre dealer discard
 */
async function handleDiscard(
  socket: AuthenticatedSocket,
  payload: DiscardPayload
): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;
    const { sessionId, cardIndex } = payload;

    // Verify character ownership
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('teamCard:error', {
        message: 'Character verification failed',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      return;
    }

    const session = await TeamCardGameService.processEuchreDealerDiscard(
      sessionId,
      characterId,
      cardIndex
    );

    const roomName = getSessionRoomName(sessionId);

    // Notify room
    emitToRoom(roomName, 'teamCard:dealer_discarded', {
      characterId,
      characterName
    });

    // Broadcast updated state
    await broadcastStateUpdate(session);

  } catch (error) {
    logger.error(`Error in handleDiscard:`, error);
    socket.emit('teamCard:error', {
      message: error instanceof Error ? error.message : 'Failed to discard',
      code: 'DISCARD_FAILED'
    });
  }
}

/**
 * Handle requesting an NPC partner
 */
async function handleRequestNPC(
  socket: AuthenticatedSocket,
  payload: RequestNPCPayload
): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;
    const { sessionId, seatIndex, difficulty = NPCDifficulty.MEDIUM } = payload;

    // Verify character ownership
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('teamCard:error', {
        message: 'Character verification failed',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      return;
    }

    const session = await TeamCardGameService.requestNPC(
      sessionId,
      characterId,
      seatIndex,
      difficulty
    );

    // Find the NPC player that was just added
    const npcPlayer = session.players.find(p => p.seatIndex === seatIndex && p.isNPC);

    const roomName = getSessionRoomName(sessionId);

    // Notify room of NPC joining
    if (npcPlayer) {
      emitToRoom(roomName, 'teamCard:npc_joined', {
        npcName: npcPlayer.characterName,
        difficulty,
        seatIndex: npcPlayer.seatIndex,
        teamIndex: npcPlayer.teamIndex
      });

      logger.info(`NPC ${npcPlayer.characterName} joined session ${sessionId} at request of ${characterName}`);
    }

    // Broadcast updated state
    await broadcastStateUpdate(session);

  } catch (error) {
    logger.error(`Error in handleRequestNPC:`, error);
    socket.emit('teamCard:error', {
      message: error instanceof Error ? error.message : 'Failed to request NPC',
      code: 'NPC_REQUEST_FAILED'
    });
  }
}

/**
 * Handle leaving a session
 */
async function handleLeaveSession(
  socket: AuthenticatedSocket,
  payload: LeavePayload
): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;
    const { sessionId } = payload;

    const roomName = getSessionRoomName(sessionId);

    // Leave socket room
    await socket.leave(roomName);

    // Leave session in service
    await TeamCardGameService.leaveSession(sessionId, characterId);

    // Notify room
    emitToRoom(roomName, 'teamCard:player_left', {
      characterId,
      characterName
    });

    logger.info(`Character ${characterName} left team card session ${sessionId}`);

    // Confirm to player
    socket.emit('teamCard:session_left', { sessionId });

  } catch (error) {
    logger.error(`Error in handleLeaveSession:`, error);
    socket.emit('teamCard:error', {
      message: error instanceof Error ? error.message : 'Failed to leave session',
      code: 'LEAVE_FAILED'
    });
  }
}

/**
 * Handle listing available lobbies
 */
async function handleListLobbies(
  socket: AuthenticatedSocket,
  payload: { gameType?: TeamCardGameType }
): Promise<void> {
  try {
    const lobbies = await TeamCardGameSession.findOpenLobbies(payload.gameType);

    socket.emit('teamCard:lobby_list', {
      lobbies: lobbies.map(lobby => ({
        sessionId: lobby.sessionId,
        gameType: lobby.gameType,
        playerCount: lobby.players.filter(p => !p.isNPC).length,
        npcCount: lobby.players.filter(p => p.isNPC).length,
        locationId: lobby.locationId,
        raidMode: lobby.raidMode,
        raidBossId: lobby.raidBossId,
        createdAt: lobby.createdAt
      }))
    });

  } catch (error) {
    logger.error(`Error in handleListLobbies:`, error);
    socket.emit('teamCard:error', {
      message: 'Failed to list lobbies',
      code: 'LIST_FAILED'
    });
  }
}

/**
 * Handle socket disconnect
 */
async function handleSocketDisconnect(socket: AuthenticatedSocket): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;

    // Find any active session for this character
    const session = await TeamCardGameSession.findByPlayer(characterId);
    if (!session) {
      return;
    }

    const sessionId = session.sessionId;
    const roomName = getSessionRoomName(sessionId);

    logger.info(`Character ${characterName} disconnected from team card session ${sessionId}`);

    // Update connection status
    await TeamCardGameService.updatePlayerConnection(sessionId, characterId, false);

    // Notify other players
    emitToRoom(roomName, 'teamCard:player_disconnected', {
      characterId,
      characterName,
      graceSeconds: DISCONNECT_GRACE_PERIOD_MS / 1000
    });

    // Start grace period timer
    const timerKey = `${sessionId}:${characterId}`;
    const timer = setTimeout(async () => {
      await handleDisconnectTimeout(sessionId, characterId, characterName);
    }, DISCONNECT_GRACE_PERIOD_MS);

    disconnectTimers.set(timerKey, timer);

  } catch (error) {
    logger.error(`Error handling team card disconnect:`, error);
  }
}

/**
 * Handle disconnect timeout - replace player with NPC
 */
async function handleDisconnectTimeout(
  sessionId: string,
  characterId: string,
  characterName: string
): Promise<void> {
  try {
    // Check if player reconnected
    const session = await TeamCardGameSession.findBySessionId(sessionId);
    if (!session) return;

    const player = session.players.find(p => p.characterId === characterId);
    if (!player) return;

    // If player reconnected, don't replace
    if (player.isConnected) {
      logger.info(`Character ${characterName} reconnected before timeout in session ${sessionId}`);
      return;
    }

    const roomName = getSessionRoomName(sessionId);

    // If game hasn't started, just remove the player
    if (session.phase === TeamCardGamePhase.WAITING) {
      await TeamCardGameService.leaveSession(sessionId, characterId);

      emitToRoom(roomName, 'teamCard:player_left', {
        characterId,
        characterName,
        reason: 'disconnect_timeout'
      });
    } else {
      // Game in progress - replace with NPC
      const npcPartner = NPCPartnerService.createNPCPartner(
        player.gamblingSkill,
        NPCDifficulty.MEDIUM,
        player.teamIndex,
        player.seatIndex
      );

      // Update session to replace player with NPC
      // Note: This would need to be implemented in the service
      logger.warn(`Player ${characterName} timed out - NPC replacement would go here`);

      emitToRoom(roomName, 'teamCard:player_replaced_npc', {
        characterId,
        characterName,
        npcName: npcPartner.characterName,
        seatIndex: player.seatIndex
      });
    }

    // Clear timer
    disconnectTimers.delete(`${sessionId}:${characterId}`);

  } catch (error) {
    logger.error(`Error in disconnect timeout handler:`, error);
  }
}

/**
 * Handle reconnection
 */
async function handleReconnect(
  socket: AuthenticatedSocket,
  payload: { sessionId: string }
): Promise<void> {
  try {
    const socketData = validateSocketData(socket);
    if (!socketData) return;

    const { characterId, characterName } = socketData;
    const { sessionId } = payload;

    // Verify character ownership
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('teamCard:error', {
        message: 'Character verification failed',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      return;
    }

    // Check if session exists and player was in it
    const session = await TeamCardGameSession.findBySessionId(sessionId);
    if (!session) {
      socket.emit('teamCard:error', {
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
      return;
    }

    const player = session.players.find(p => p.characterId === characterId);
    if (!player) {
      socket.emit('teamCard:error', {
        message: 'You are not in this session',
        code: 'NOT_IN_SESSION'
      });
      return;
    }

    // Clear disconnect timer
    const timerKey = `${sessionId}:${characterId}`;
    const existingTimer = disconnectTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      disconnectTimers.delete(timerKey);
    }

    // Join socket room
    const roomName = getSessionRoomName(sessionId);
    await socket.join(roomName);

    // Update connection status
    await TeamCardGameService.updatePlayerConnection(sessionId, characterId, true, socket.id);

    logger.info(`Character ${characterName} reconnected to team card session ${sessionId}`);

    // Notify room
    emitToRoom(roomName, 'teamCard:player_reconnected', {
      characterId,
      characterName
    });

    // Send current state
    const clientState = TeamCardGameService.buildClientState(session, characterId);
    socket.emit('teamCard:reconnected', {
      sessionId,
      state: clientState
    });

  } catch (error) {
    logger.error(`Error in handleReconnect:`, error);
    socket.emit('teamCard:error', {
      message: error instanceof Error ? error.message : 'Failed to reconnect',
      code: 'RECONNECT_FAILED'
    });
  }
}

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

function handleGracefulShutdown(): void {
  logger.info('Team Card Game handlers: Starting graceful shutdown...');

  // Clear all disconnect timers
  let timerCount = 0;
  for (const timer of disconnectTimers.values()) {
    clearTimeout(timer);
    timerCount++;
  }
  disconnectTimers.clear();

  logger.info(`Team Card Game handlers: Cleared ${timerCount} disconnect timer(s)`);
}

process.on('SIGTERM', handleGracefulShutdown);
process.on('SIGINT', handleGracefulShutdown);

// =============================================================================
// PUBLIC EXPORT
// =============================================================================

/**
 * Register all team card game event handlers on a socket
 */
export function registerTeamCardGameHandlers(socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;

  // Verify authentication
  try {
    requireSocketAuth(authSocket);
  } catch (error) {
    logger.error(`Socket ${socket.id} is not authenticated, cannot register team card game handlers`);
    return;
  }

  // Register event handlers
  authSocket.on('teamCard:create_session', (payload: CreateSessionPayload) => {
    void handleCreateSession(authSocket, payload);
  });

  authSocket.on('teamCard:join_session', (payload: JoinSessionPayload) => {
    void handleJoinSession(authSocket, payload);
  });

  authSocket.on('teamCard:ready', (payload: ReadyPayload) => {
    void handleReady(authSocket, payload);
  });

  authSocket.on('teamCard:play_card', (payload: PlayCardPayload) => {
    void handlePlayCard(authSocket, payload);
  });

  authSocket.on('teamCard:bid', (payload: BidPayload) => {
    void handleBid(authSocket, payload);
  });

  authSocket.on('teamCard:trump_call', (payload: TrumpCallPayload) => {
    void handleTrumpCall(authSocket, payload);
  });

  authSocket.on('teamCard:discard', (payload: DiscardPayload) => {
    void handleDiscard(authSocket, payload);
  });

  authSocket.on('teamCard:request_npc', (payload: RequestNPCPayload) => {
    void handleRequestNPC(authSocket, payload);
  });

  authSocket.on('teamCard:leave_session', (payload: LeavePayload) => {
    void handleLeaveSession(authSocket, payload);
  });

  authSocket.on('teamCard:list_lobbies', (payload: { gameType?: TeamCardGameType }) => {
    void handleListLobbies(authSocket, payload);
  });

  authSocket.on('teamCard:reconnect', (payload: { sessionId: string }) => {
    void handleReconnect(authSocket, payload);
  });

  // Handle disconnect
  authSocket.on('disconnect', () => {
    void handleSocketDisconnect(authSocket);
  });

  logger.debug(`Team card game handlers registered for socket ${socket.id}`);
}

export default {
  registerTeamCardGameHandlers
};
