/**
 * Team Card Game Service
 * Core orchestration for team-based trick-taking card games
 *
 * Handles:
 * - Session creation and management
 * - Player joining/leaving
 * - Game flow coordination
 * - NPC partner integration
 * - Raid boss integration
 * - State synchronization
 */

import mongoose from 'mongoose';
import { SecureRNG } from './base/SecureRNG';
import { v4 as uuidv4 } from 'uuid';
import {
  TeamCardGameType,
  TeamCardGamePhase,
  TeamCardGameSession,
  TeamCardPlayer,
  TrickCard,
  PlayedCard,
  NPCDifficulty,
  TeamCardGameClientState,
  PartnerVisibleState,
  OpponentTeamVisibleState,
  TeamCardRoundScore,
  GameHint,
  Suit,
  GAME_TYPE_CONFIGS
} from '@desperados/shared';

import {
  TeamCardGameSession as SessionModel,
  ITeamCardGameSession,
  ITeamCardPlayer
} from '../models/TeamCardGameSession.model';
import { Character } from '../models/Character.model';
import { CharacterQuest } from '../models/Quest.model';
import { DollarService } from './dollar.service';
import { CharacterProgressionService } from './characterProgression.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { getSocketIO } from '../config/socket';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

// Import game-specific services
import { EuchreService } from './games/euchre.service';
import {
  TrickTakingService,
  getPlayableCards,
  determineTrickWinner,
  createTrickResult,
  getTeamIndex,
  getPartnerIndex
} from './trickTaking.service';

// Import data
import { getBossById, getCurrentBossPhase } from '../data/teamCardBosses';
import { getLocationById, checkLocationAccess } from '../data/teamCardLocations';

// =============================================================================
// CONSTANTS
// =============================================================================

const SESSION_EXPIRY_HOURS = 2;
const TURN_TIME_DEFAULT = 30;
const TURN_TIME_RAID = 20;
const NPC_THINK_DELAY_MS = 1500; // Simulate NPC "thinking"
const DISCONNECT_GRACE_PERIOD_MS = 60000; // 1 minute before NPC takes over

// Lock key generators
const sessionLockKey = (sessionId: string) => `teamcard:session:${sessionId}`;
const playerSessionLockKey = (characterId: string) => `teamcard:player:${characterId}`;

// =============================================================================
// SESSION CREATION
// =============================================================================

/**
 * Create a new team card game session
 */
export async function createSession(
  creatorId: string,
  gameType: TeamCardGameType,
  options: {
    raidBossId?: string;
    locationId?: string;
    isPrivate?: boolean;
    password?: string;
    turnTimeLimit?: number;
  } = {}
): Promise<ITeamCardGameSession> {
  return withLock(playerSessionLockKey(creatorId), async () => {
    // Check if player is already in a session
    const existingSession = await SessionModel.findByPlayer(creatorId);
    if (existingSession) {
      throw new Error('You are already in a team card game session');
    }

    // Get character
    const character = await Character.findById(creatorId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get game config
    const config = GAME_TYPE_CONFIGS[gameType];
    if (!config) {
      throw new Error(`Unknown game type: ${gameType}`);
    }

    // Check skill requirements
    const gamblingSkill = character.getSkillLevel?.('gambling') || 1;
    const minSkill = options.raidBossId
      ? config.raidMinimumGamblingSkill
      : config.minimumGamblingSkill;

    if (gamblingSkill < minSkill) {
      throw new Error(`Gambling skill ${minSkill} required for this game (you have ${gamblingSkill})`);
    }

    // Check location access if specified
    if (options.locationId) {
      const location = getLocationById(options.locationId);
      if (!location) {
        throw new Error('Invalid location');
      }

      // Get completed quests for this character
      const completedQuests = await CharacterQuest.find({
        characterId: creatorId,
        status: 'completed'
      }).select('questId').lean();
      const completedQuestIds = completedQuests.map(q => q.questId);

      // Build character access check object
      const accessCheck = checkLocationAccess(location.unlockRequirements, {
        level: character.level,
        skills: { gambling: gamblingSkill },
        reputation: character.factionReputation || {},
        completedQuests: completedQuestIds
      });

      if (!accessCheck.canAccess) {
        throw new Error(`Cannot access this location: ${accessCheck.missingRequirements.join(', ')}`);
      }
    }

    // Check boss exists if raid mode
    let bossMaxHealth: number | undefined;
    if (options.raidBossId) {
      const boss = getBossById(options.raidBossId);
      if (!boss) {
        throw new Error('Invalid raid boss');
      }
      if (!boss.gameTypes.includes(gameType)) {
        throw new Error(`${boss.name} does not play ${gameType}`);
      }
      bossMaxHealth = boss.health;
    }

    // Create session
    const sessionId = uuidv4();
    const turnTimeLimit = options.turnTimeLimit ||
      (options.raidBossId ? TURN_TIME_RAID : TURN_TIME_DEFAULT);

    // Create creator as first player
    const creatorPlayer: ITeamCardPlayer = {
      characterId: creatorId,
      characterName: character.name,
      isNPC: false,
      teamIndex: 0,
      seatIndex: 0,
      hand: [],
      tricksWonRound: 0,
      tricksWonTotal: 0,
      isConnected: true,
      lastActionAt: Date.now(),
      isReady: false,
      gamblingSkill,
      duelInstinctSkill: character.getSkillLevel?.('duel_instinct') || 1,
      deceptionSkill: character.getSkillLevel?.('deception') || 1,
      sleightOfHandSkill: character.getSkillLevel?.('sleight_of_hand') || 1,
      contributionScore: 0,
      mechanicsCountered: 0,
      perfectTricks: 0,
      clutchPlays: 0
    };

    const session = new SessionModel({
      sessionId,
      gameType,
      raidMode: !!options.raidBossId,
      raidBossId: options.raidBossId,
      players: [creatorPlayer],
      phase: TeamCardGamePhase.WAITING,
      currentRound: 1,
      maxRounds: config.winningScore,
      tricksPerRound: config.cardsPerPlayer,
      dealer: 0,
      currentPlayer: 0,
      currentTrick: [],
      trickNumber: 0,
      tricksWon: [0, 0],
      trickHistory: [],
      teamScores: [0, 0],
      roundScores: [],
      bossHealth: bossMaxHealth,
      bossMaxHealth,
      bossPhase: 1,
      activeBossMechanics: [],
      turnTimeLimit,
      turnStartedAt: Date.now(),
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000),
      locationId: options.locationId,
      isPrivate: options.isPrivate || false,
      password: options.password
    });

    await session.save();

    logger.info(`Team card game session created: ${sessionId} (${gameType}) by ${character.name}`);

    return session;
  });
}

// =============================================================================
// JOINING & LEAVING
// =============================================================================

/**
 * Join an existing session
 */
export async function joinSession(
  sessionId: string,
  characterId: string,
  password?: string
): Promise<ITeamCardGameSession> {
  return withLock(sessionLockKey(sessionId), async () => {
    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.phase !== TeamCardGamePhase.WAITING) {
      throw new Error('Game has already started');
    }

    // Check password if private
    if (session.isPrivate && session.password !== password) {
      throw new Error('Incorrect password');
    }

    // Check if already in session
    if (session.hasPlayer(characterId)) {
      throw new Error('You are already in this session');
    }

    // Check if already in another session
    const existingSession = await SessionModel.findByPlayer(characterId);
    if (existingSession && existingSession.sessionId !== sessionId) {
      throw new Error('You are already in another session');
    }

    // Get character
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Check skill requirements
    const config = GAME_TYPE_CONFIGS[session.gameType];
    const gamblingSkill = character.getSkillLevel?.('gambling') || 1;
    const minSkill = session.raidMode
      ? config.raidMinimumGamblingSkill
      : config.minimumGamblingSkill;

    if (gamblingSkill < minSkill) {
      throw new Error(`Gambling skill ${minSkill} required (you have ${gamblingSkill})`);
    }

    // Find next available seat
    const emptySeats = session.getEmptySeats();
    if (emptySeats.length === 0) {
      throw new Error('Session is full');
    }

    // Assign seat (prefer replacing NPC if any)
    let seatIndex = emptySeats[0];
    const npcPlayer = session.players.find(p => p.isNPC);
    if (npcPlayer) {
      seatIndex = npcPlayer.seatIndex;
      // Remove NPC
      session.players = session.players.filter(p => p.seatIndex !== seatIndex);
    }

    // Determine team (seats 0&2 = team 0, seats 1&3 = team 1)
    const teamIndex = getTeamIndex(seatIndex);

    const newPlayer: ITeamCardPlayer = {
      characterId,
      characterName: character.name,
      isNPC: false,
      teamIndex,
      seatIndex: seatIndex as 0 | 1 | 2 | 3,
      hand: [],
      tricksWonRound: 0,
      tricksWonTotal: 0,
      isConnected: true,
      lastActionAt: Date.now(),
      isReady: false,
      gamblingSkill,
      duelInstinctSkill: character.getSkillLevel?.('duel_instinct') || 1,
      deceptionSkill: character.getSkillLevel?.('deception') || 1,
      sleightOfHandSkill: character.getSkillLevel?.('sleight_of_hand') || 1,
      contributionScore: 0,
      mechanicsCountered: 0,
      perfectTricks: 0,
      clutchPlays: 0
    };

    session.players.push(newPlayer);
    await session.save();

    // Broadcast player joined
    broadcastToSession(session, 'teamCard:player_joined', {
      playerName: character.name,
      seatIndex,
      teamIndex,
      isNPC: false
    });

    logger.info(`${character.name} joined session ${sessionId} at seat ${seatIndex}`);

    return session;
  });
}

/**
 * Leave a session
 */
export async function leaveSession(
  sessionId: string,
  characterId: string
): Promise<void> {
  return withLock(sessionLockKey(sessionId), async () => {
    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    const playerIndex = session.getPlayerIndex(characterId);
    if (playerIndex === -1) {
      throw new Error('You are not in this session');
    }

    const player = session.players[playerIndex];

    if (session.phase === TeamCardGamePhase.WAITING) {
      // Game hasn't started - just remove player
      session.players.splice(playerIndex, 1);

      // If no players left, delete session
      if (session.players.length === 0) {
        await SessionModel.deleteOne({ sessionId });
        logger.info(`Session ${sessionId} deleted (no players)`);
        return;
      }

      await session.save();

      broadcastToSession(session, 'teamCard:player_left', {
        playerName: player.characterName,
        seatIndex: player.seatIndex,
        replacedByNPC: false
      });
    } else {
      // Game in progress - replace with NPC
      await replaceWithNPC(session, playerIndex, NPCDifficulty.MEDIUM);

      broadcastToSession(session, 'teamCard:player_left', {
        playerName: player.characterName,
        seatIndex: player.seatIndex,
        replacedByNPC: true,
        npcDifficulty: NPCDifficulty.MEDIUM
      });
    }

    logger.info(`${player.characterName} left session ${sessionId}`);
  });
}

// =============================================================================
// READY & START
// =============================================================================

/**
 * Mark player as ready
 */
export async function setPlayerReady(
  sessionId: string,
  characterId: string,
  isReady: boolean
): Promise<ITeamCardGameSession> {
  return withLock(sessionLockKey(sessionId), async () => {
    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.phase !== TeamCardGamePhase.WAITING) {
      throw new Error('Game has already started');
    }

    const player = session.getPlayer(characterId);
    if (!player) {
      throw new Error('You are not in this session');
    }

    player.isReady = isReady;
    player.lastActionAt = Date.now();
    await session.save();

    broadcastToSession(session, 'teamCard:ready_status', {
      playerIndex: session.getPlayerIndex(characterId),
      isReady
    });

    // Check if game can start
    if (session.canStart()) {
      return startGame(session);
    }

    return session;
  });
}

/**
 * Request NPC to fill an empty seat
 */
export async function requestNPC(
  sessionId: string,
  requesterId: string,
  seatIndex: 0 | 1 | 2 | 3,
  difficulty: NPCDifficulty = NPCDifficulty.MEDIUM
): Promise<ITeamCardGameSession> {
  return withLock(sessionLockKey(sessionId), async () => {
    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.phase !== TeamCardGamePhase.WAITING) {
      throw new Error('Cannot add NPC after game started');
    }

    // Verify requester is in session
    if (!session.hasPlayer(requesterId)) {
      throw new Error('You are not in this session');
    }

    // Check seat is empty
    if (session.players.some(p => p.seatIndex === seatIndex)) {
      throw new Error('That seat is already taken');
    }

    // Check expert NPC unlock (gambling skill 35+)
    if (difficulty === NPCDifficulty.EXPERT) {
      const requester = session.getPlayer(requesterId);
      if (requester && requester.gamblingSkill < 35) {
        throw new Error('Expert NPC partners require Gambling skill 35+');
      }
    }

    // Create NPC
    const teamIndex = getTeamIndex(seatIndex);
    const npcNames = ['Dusty Pete', 'Whiskey Jane', 'One-Eye Jack', 'Lucky Lou'];
    const npcName = npcNames[seatIndex] || 'NPC Partner';

    // Calculate NPC skill based on average player skill
    const humanPlayers = session.players.filter(p => !p.isNPC);
    const avgSkill = humanPlayers.reduce((sum, p) => sum + p.gamblingSkill, 0) / humanPlayers.length;
    const npcSkill = Math.floor(avgSkill * SecureRNG.float(0.9, 1.1, 2)); // ±10% of average

    const npcPlayer: ITeamCardPlayer = {
      characterId: `npc_${uuidv4()}`,
      characterName: npcName,
      isNPC: true,
      npcDifficulty: difficulty,
      teamIndex,
      seatIndex,
      hand: [],
      tricksWonRound: 0,
      tricksWonTotal: 0,
      isConnected: true,
      lastActionAt: Date.now(),
      isReady: true, // NPCs are always ready
      gamblingSkill: npcSkill,
      duelInstinctSkill: Math.floor(npcSkill * 0.8),
      deceptionSkill: Math.floor(npcSkill * 0.7),
      sleightOfHandSkill: Math.floor(npcSkill * 0.6),
      contributionScore: 0,
      mechanicsCountered: 0,
      perfectTricks: 0,
      clutchPlays: 0
    };

    session.players.push(npcPlayer);
    await session.save();

    broadcastToSession(session, 'teamCard:player_joined', {
      playerName: npcName,
      seatIndex,
      teamIndex,
      isNPC: true
    });

    // Check if game can start
    if (session.canStart()) {
      return startGame(session);
    }

    return session;
  });
}

/**
 * Start the game (internal)
 */
async function startGame(session: ITeamCardGameSession): Promise<ITeamCardGameSession> {
  session.phase = TeamCardGamePhase.DEALING;
  session.dealer = SecureRNG.range(0, 3);
  session.turnStartedAt = Date.now();

  // Initialize game based on type
  switch (session.gameType) {
    case TeamCardGameType.EUCHRE:
      initializeEuchreGame(session);
      break;
    case TeamCardGameType.SPADES:
      initializeSpadesGame(session);
      break;
    case TeamCardGameType.HEARTS:
      initializeHeartsGame(session);
      break;
    case TeamCardGameType.BRIDGE:
      initializeBridgeGame(session);
      break;
    case TeamCardGameType.PINOCHLE:
      initializePinochleGame(session);
      break;
  }

  await session.save();

  // Broadcast game start to each player with their hand
  for (const player of session.players) {
    if (!player.isNPC) {
      const clientState = buildClientState(session, player.characterId);
      emitToPlayer(player, 'teamCard:game_start', clientState);
    }
  }

  // Broadcast cards dealt
  broadcastToSession(session, 'teamCard:cards_dealt', {
    dealer: session.dealer,
    dealerName: session.players[session.dealer]?.characterName,
    upCard: session.upCard // Euchre only
  });

  logger.info(`Game started in session ${session.sessionId}`);

  // If first player is NPC, process their turn
  if (session.players[session.currentPlayer]?.isNPC) {
    scheduleNPCAction(session);
  }

  return session;
}

// =============================================================================
// GAME INITIALIZATION BY TYPE
// =============================================================================

function initializeEuchreGame(session: ITeamCardGameSession): void {
  const { hands, kitty, upCard } = TrickTakingService.dealEuchre();

  // Assign hands (sorted)
  for (let i = 0; i < 4; i++) {
    session.players[i].hand = TrickTakingService.sortHand(hands[i]);
    session.players[i].tricksWonRound = 0;
  }

  session.kitty = kitty;
  session.upCard = upCard;
  session.tricksPerRound = 5;
  session.phase = TeamCardGamePhase.BIDDING;
  session.currentPlayer = (session.dealer + 1) % 4;
}

function initializeSpadesGame(session: ITeamCardGameSession): void {
  const { hands } = TrickTakingService.dealStandard();

  for (let i = 0; i < 4; i++) {
    session.players[i].hand = TrickTakingService.sortHand(hands[i], Suit.SPADES);
    session.players[i].tricksWonRound = 0;
    session.players[i].bid = undefined;
  }

  session.trump = Suit.SPADES;
  session.tricksPerRound = 13;
  session.bags = [0, 0];
  session.phase = TeamCardGamePhase.BIDDING;
  session.currentPlayer = (session.dealer + 1) % 4;
}

function initializeHeartsGame(session: ITeamCardGameSession): void {
  const { hands } = TrickTakingService.dealStandard();

  for (let i = 0; i < 4; i++) {
    session.players[i].hand = TrickTakingService.sortHand(hands[i]);
    session.players[i].tricksWonRound = 0;
  }

  session.tricksPerRound = 13;
  session.heartsBroken = false;
  session.pointsTaken = [0, 0, 0, 0];
  session.phase = TeamCardGamePhase.PLAYING;

  // Player with 2 of clubs leads
  const twoOfClubs = { suit: Suit.CLUBS, rank: 2 };
  for (let i = 0; i < 4; i++) {
    if (session.players[i].hand.some(c => c.suit === Suit.CLUBS && c.rank === 2)) {
      session.currentPlayer = i;
      break;
    }
  }
}

function initializeBridgeGame(session: ITeamCardGameSession): void {
  const { hands } = TrickTakingService.dealStandard();

  for (let i = 0; i < 4; i++) {
    session.players[i].hand = TrickTakingService.sortHand(hands[i]);
    session.players[i].tricksWonRound = 0;
    session.players[i].bid = undefined;
  }

  session.tricksPerRound = 13;
  session.phase = TeamCardGamePhase.BIDDING;
  session.currentPlayer = (session.dealer + 1) % 4;
}

function initializePinochleGame(session: ITeamCardGameSession): void {
  const { hands } = TrickTakingService.dealPinochle();

  for (let i = 0; i < 4; i++) {
    session.players[i].hand = TrickTakingService.sortHand(hands[i]);
    session.players[i].tricksWonRound = 0;
    session.players[i].bid = undefined;
    session.players[i].melds = [];
  }

  session.tricksPerRound = 12;
  session.phase = TeamCardGamePhase.BIDDING;
  session.currentPlayer = (session.dealer + 1) % 4;
}

// =============================================================================
// GAME ACTIONS
// =============================================================================

/**
 * Process a card play
 */
export async function playCard(
  sessionId: string,
  characterId: string,
  cardIndex: number
): Promise<{ session: ITeamCardGameSession; trickComplete: boolean }> {
  return withLock(sessionLockKey(sessionId), async () => {
    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.phase !== TeamCardGamePhase.PLAYING) {
      throw new Error('Not in playing phase');
    }

    const playerIndex = session.getPlayerIndex(characterId);
    if (playerIndex === -1) {
      throw new Error('You are not in this session');
    }

    if (playerIndex !== session.currentPlayer) {
      throw new Error('Not your turn');
    }

    const player = session.players[playerIndex];

    if (cardIndex < 0 || cardIndex >= player.hand.length) {
      throw new Error('Invalid card index');
    }

    // Validate play
    const playable = getPlayableCards(
      player.hand,
      session.currentTrick,
      session.trump as Suit || null,
      session.gameType,
      session.heartsBroken
    );

    const cardToPlay = player.hand[cardIndex];
    const isValid = playable.some(c =>
      c.suit === cardToPlay.suit && c.rank === cardToPlay.rank
    );

    if (!isValid) {
      throw new Error('Must follow suit if possible');
    }

    // Play the card
    const card = player.hand.splice(cardIndex, 1)[0];
    session.currentTrick.push({
      card,
      playerIndex,
      timestamp: Date.now()
    });

    player.lastActionAt = Date.now();

    // Hearts: check if hearts broken
    if (session.gameType === TeamCardGameType.HEARTS &&
        card.suit === Suit.HEARTS &&
        !session.heartsBroken) {
      session.heartsBroken = true;
    }

    // Broadcast card played
    broadcastToSession(session, 'teamCard:card_played', {
      playerIndex,
      playerName: player.characterName,
      card,
      trickPosition: session.currentTrick.length
    });

    // Check if trick complete
    const playersInTrick = session.goingAlone ? 3 : 4;
    let trickComplete = false;

    if (session.currentTrick.length >= playersInTrick) {
      trickComplete = true;
      await resolveTrick(session);
    } else {
      // Move to next player
      session.currentPlayer = getNextPlayer(session, playerIndex);
      session.turnStartedAt = Date.now();

      broadcastToSession(session, 'teamCard:turn_start', {
        playerIndex: session.currentPlayer,
        playerName: session.players[session.currentPlayer]?.characterName,
        phase: session.phase,
        timeLimit: session.turnTimeLimit,
        availableActions: ['play_card'],
        isNPC: session.players[session.currentPlayer]?.isNPC
      });

      // Schedule NPC action if needed
      if (session.players[session.currentPlayer]?.isNPC) {
        scheduleNPCAction(session);
      }
    }

    await session.save();

    return { session, trickComplete };
  });
}

/**
 * Process a bid (Spades, Bridge, Pinochle)
 */
export async function processBid(
  sessionId: string,
  characterId: string,
  bidValue: number | string,
  options: {
    isNil?: boolean;
    isBlindNil?: boolean;
    suit?: Suit;
    isPass?: boolean;
    isDouble?: boolean;
  } = {}
): Promise<ITeamCardGameSession> {
  return withLock(sessionLockKey(sessionId), async () => {
    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.phase !== TeamCardGamePhase.BIDDING) {
      throw new Error('Not in bidding phase');
    }

    const playerIndex = session.getPlayerIndex(characterId);
    if (playerIndex === -1) {
      throw new Error('You are not in this session');
    }

    if (playerIndex !== session.currentPlayer) {
      throw new Error('Not your turn to bid');
    }

    const player = session.players[playerIndex];

    // Store bid
    player.bid = {
      value: bidValue,
      isNil: options.isNil,
      isBlindNil: options.isBlindNil,
      suit: options.suit,
      isPass: options.isPass,
      isDouble: options.isDouble
    };
    player.lastActionAt = Date.now();

    // Broadcast bid
    broadcastToSession(session, 'teamCard:bid_made', {
      playerIndex,
      playerName: player.characterName,
      bid: bidValue,
      isNil: options.isNil,
      isBlindNil: options.isBlindNil,
      suit: options.suit
    });

    // Check if all players have bid
    const allBid = session.players.every(p => p.bid !== undefined);

    if (allBid) {
      // Move to playing phase
      session.phase = TeamCardGamePhase.PLAYING;
      session.currentPlayer = (session.dealer + 1) % 4;
      session.turnStartedAt = Date.now();

      broadcastToSession(session, 'teamCard:turn_start', {
        playerIndex: session.currentPlayer,
        playerName: session.players[session.currentPlayer]?.characterName,
        phase: session.phase,
        timeLimit: session.turnTimeLimit,
        availableActions: ['play_card'],
        isNPC: session.players[session.currentPlayer]?.isNPC
      });

      if (session.players[session.currentPlayer]?.isNPC) {
        scheduleNPCAction(session);
      }
    } else {
      // Next bidder
      session.currentPlayer = (session.currentPlayer + 1) % 4;
      session.turnStartedAt = Date.now();

      broadcastToSession(session, 'teamCard:turn_start', {
        playerIndex: session.currentPlayer,
        playerName: session.players[session.currentPlayer]?.characterName,
        phase: session.phase,
        timeLimit: session.turnTimeLimit,
        availableActions: ['bid'],
        isNPC: session.players[session.currentPlayer]?.isNPC
      });

      if (session.players[session.currentPlayer]?.isNPC) {
        scheduleNPCAction(session);
      }
    }

    await session.save();
    return session;
  });
}

/**
 * Process Euchre trump call
 */
export async function processEuchreTrumpCall(
  sessionId: string,
  characterId: string,
  action: 'pass' | 'order_up' | 'pick_up' | 'call',
  options: { suit?: Suit; goingAlone?: boolean } = {}
): Promise<ITeamCardGameSession> {
  return withLock(sessionLockKey(sessionId), async () => {
    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.gameType !== TeamCardGameType.EUCHRE) {
      throw new Error('Not a Euchre game');
    }

    const playerIndex = session.getPlayerIndex(characterId);
    if (playerIndex === -1) {
      throw new Error('You are not in this session');
    }

    // Use Euchre service
    const result = EuchreService.processTrumpCall(
      session as any, // Type coercion for Euchre-specific fields
      playerIndex,
      {
        playerIndex,
        action,
        suit: options.suit,
        goingAlone: options.goingAlone || false
      }
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    // Update session from result
    Object.assign(session, result.session);
    await session.save();

    // Broadcast trump called if trump was set
    if (session.trump) {
      broadcastToSession(session, 'teamCard:trump_called', {
        playerIndex: session.maker!,
        playerName: session.players[session.maker!]?.characterName,
        trump: session.trump,
        goingAlone: session.goingAlone || false,
        maker: session.maker!
      });

      // If phase changed to playing, start play
      if (session.phase === TeamCardGamePhase.PLAYING) {
        broadcastToSession(session, 'teamCard:turn_start', {
          playerIndex: session.currentPlayer,
          playerName: session.players[session.currentPlayer]?.characterName,
          phase: session.phase,
          timeLimit: session.turnTimeLimit,
          availableActions: ['play_card'],
          isNPC: session.players[session.currentPlayer]?.isNPC
        });

        if (session.players[session.currentPlayer]?.isNPC) {
          scheduleNPCAction(session);
        }
      }
    }

    return session;
  });
}

// =============================================================================
// TRICK RESOLUTION
// =============================================================================

async function resolveTrick(session: ITeamCardGameSession): Promise<void> {
  const winnerIndex = determineTrickWinner(
    session.currentTrick,
    session.trump as Suit || null,
    session.gameType
  );

  const winner = session.players[winnerIndex];
  const winningTeam = winner.teamIndex;

  // Update trick counts
  session.tricksWon[winningTeam]++;
  winner.tricksWonRound++;
  winner.tricksWonTotal++;
  session.trickNumber++;

  // Calculate points for Hearts
  if (session.gameType === TeamCardGameType.HEARTS) {
    const points = TrickTakingService.calculateTrickPoints(
      session.currentTrick,
      session.gameType
    );
    session.pointsTaken![winnerIndex] += points;
  }

  // Record trick history
  const trickResult = createTrickResult(
    session.currentTrick,
    session.trickNumber,
    session.trump as Suit || null,
    session.gameType,
    session.players.map(p => ({
      characterName: p.characterName,
      teamIndex: p.teamIndex
    }))
  );
  session.trickHistory.push(trickResult);

  // Broadcast trick complete
  broadcastToSession(session, 'teamCard:trick_complete', {
    trickResult,
    teamTricks: session.tricksWon,
    nextLeader: winnerIndex,
    nextLeaderName: winner.characterName
  });

  // Clear trick
  session.currentTrick = [];

  // Check if round complete
  const maxTricks = session.tricksPerRound;
  if (session.trickNumber >= maxTricks) {
    await resolveRound(session);
  } else {
    // Winner leads next trick
    session.currentPlayer = winnerIndex;
    session.turnStartedAt = Date.now();

    broadcastToSession(session, 'teamCard:turn_start', {
      playerIndex: session.currentPlayer,
      playerName: session.players[session.currentPlayer]?.characterName,
      phase: session.phase,
      timeLimit: session.turnTimeLimit,
      availableActions: ['play_card'],
      isNPC: session.players[session.currentPlayer]?.isNPC
    });

    if (session.players[session.currentPlayer]?.isNPC) {
      scheduleNPCAction(session);
    }
  }
}

// =============================================================================
// ROUND RESOLUTION
// =============================================================================

async function resolveRound(session: ITeamCardGameSession): Promise<void> {
  session.phase = TeamCardGamePhase.ROUND_SCORING;

  let roundScore: TeamCardRoundScore;
  let bossDamage = 0;

  switch (session.gameType) {
    case TeamCardGameType.EUCHRE:
      roundScore = calculateEuchreRoundScore(session);
      break;
    case TeamCardGameType.SPADES:
      roundScore = calculateSpadesRoundScore(session);
      break;
    case TeamCardGameType.HEARTS:
      roundScore = calculateHeartsRoundScore(session);
      break;
    case TeamCardGameType.BRIDGE:
      roundScore = calculateBridgeRoundScore(session);
      break;
    case TeamCardGameType.PINOCHLE:
      roundScore = calculatePinochleRoundScore(session);
      break;
    default:
      roundScore = {
        roundNumber: session.currentRound,
        team0Score: 0,
        team1Score: 0,
        tricksWon: [...session.tricksWon] as [number, number]
      };
  }

  // Apply scores
  session.teamScores[0] += roundScore.team0Score;
  session.teamScores[1] += roundScore.team1Score;
  session.roundScores.push(roundScore);

  // Calculate boss damage if raid mode
  if (session.raidMode && session.bossHealth) {
    bossDamage = calculateBossDamage(session, roundScore);
    session.bossHealth = Math.max(0, session.bossHealth - bossDamage);
    roundScore.bossDamageDealt = bossDamage;

    // Check boss phase transition
    if (session.raidBossId) {
      const boss = getBossById(session.raidBossId);
      if (boss) {
        const newPhase = getCurrentBossPhase(boss, session.bossHealth);
        if (newPhase.healthThreshold < (session.bossPhase || 100)) {
          session.bossPhase = newPhase.healthThreshold;
          session.activeBossMechanics = newPhase.mechanics;

          broadcastToSession(session, 'teamCard:boss_phase_change', {
            newPhase: session.bossPhase,
            phaseName: newPhase.name,
            bossHealth: session.bossHealth,
            bossMaxHealth: session.bossMaxHealth,
            newMechanics: newPhase.mechanics.map(m => m.name)
          });
        }
      }
    }
  }

  // Broadcast round complete
  broadcastToSession(session, 'teamCard:round_complete', {
    roundScore,
    teamScores: session.teamScores,
    outcome: roundScore.outcome,
    bossDamageDealt: bossDamage,
    newBossHealth: session.bossHealth
  });

  // Check for game over
  if (checkGameOver(session)) {
    await resolveGame(session);
  } else {
    // Start next round
    session.currentRound++;
    session.trickNumber = 0;
    session.tricksWon = [0, 0];
    session.trickHistory = [];
    session.currentTrick = [];

    // Rotate dealer
    session.dealer = (session.dealer + 1) % 4;

    // Reset for game type
    switch (session.gameType) {
      case TeamCardGameType.EUCHRE:
        initializeEuchreGame(session);
        break;
      case TeamCardGameType.SPADES:
        initializeSpadesGame(session);
        break;
      case TeamCardGameType.HEARTS:
        initializeHeartsGame(session);
        break;
      case TeamCardGameType.BRIDGE:
        initializeBridgeGame(session);
        break;
      case TeamCardGameType.PINOCHLE:
        initializePinochleGame(session);
        break;
    }

    // Send new hands to players
    for (const player of session.players) {
      if (!player.isNPC) {
        const clientState = buildClientState(session, player.characterId);
        emitToPlayer(player, 'teamCard:session_update', clientState);
      }
    }

    if (session.players[session.currentPlayer]?.isNPC) {
      scheduleNPCAction(session);
    }
  }

  await session.save();
}

// =============================================================================
// SCORE CALCULATIONS
// =============================================================================

function calculateEuchreRoundScore(session: ITeamCardGameSession): TeamCardRoundScore {
  const makerTeam = session.maker !== undefined ? getTeamIndex(session.maker) : 0;
  const defenderTeam = makerTeam === 0 ? 1 : 0;
  const makerTricks = session.tricksWon[makerTeam];

  let points = 0;
  let outcome: string = 'normal';
  let winningTeam: 0 | 1;

  if (makerTricks >= 3) {
    winningTeam = makerTeam;
    if (makerTricks === 5) {
      points = session.goingAlone ? 4 : 2;
      outcome = session.goingAlone ? 'alone_march' : 'march';
    } else {
      points = 1;
      outcome = 'made';
    }
  } else {
    winningTeam = defenderTeam;
    points = 2;
    outcome = 'euchre';
  }

  return {
    roundNumber: session.currentRound,
    team0Score: winningTeam === 0 ? points : 0,
    team1Score: winningTeam === 1 ? points : 0,
    tricksWon: [...session.tricksWon] as [number, number],
    outcome: outcome as any
  };
}

function calculateSpadesRoundScore(session: ITeamCardGameSession): TeamCardRoundScore {
  const scores = [0, 0];

  for (let team = 0; team < 2; team++) {
    const teamPlayers = session.players.filter(p => p.teamIndex === team);
    let teamBid = 0;
    let teamTricks = 0;
    let hasNil = false;
    let nilMade = false;

    for (const player of teamPlayers) {
      const bid = player.bid as any;
      if (bid?.isNil || bid?.isBlindNil) {
        hasNil = true;
        if (player.tricksWonRound === 0) {
          nilMade = true;
          scores[team] += bid.isBlindNil ? 200 : 100;
        } else {
          scores[team] -= bid.isBlindNil ? 200 : 100;
        }
      } else {
        teamBid += (bid?.value as number) || 0;
      }
      teamTricks += player.tricksWonRound;
    }

    // Regular bid scoring
    if (teamTricks >= teamBid) {
      scores[team] += teamBid * 10;
      const bags = teamTricks - teamBid;
      scores[team] += bags;
      session.bags![team] = (session.bags![team] || 0) + bags;

      // Bag penalty (10 bags = -100)
      if (session.bags![team] >= 10) {
        scores[team] -= 100;
        session.bags![team] -= 10;
      }
    } else {
      // Set
      scores[team] -= teamBid * 10;
    }
  }

  return {
    roundNumber: session.currentRound,
    team0Score: scores[0],
    team1Score: scores[1],
    tricksWon: [...session.tricksWon] as [number, number],
    bidsTeam0: session.players.filter(p => p.teamIndex === 0)
      .reduce((sum, p) => sum + ((p.bid as any)?.value || 0), 0),
    bidsTeam1: session.players.filter(p => p.teamIndex === 1)
      .reduce((sum, p) => sum + ((p.bid as any)?.value || 0), 0),
    outcome: 'normal'
  };
}

function calculateHeartsRoundScore(session: ITeamCardGameSession): TeamCardRoundScore {
  const points = session.pointsTaken || [0, 0, 0, 0];

  // Check shoot the moon
  const moonCheck = TrickTakingService.checkShootTheMoon(points);
  const adjustedPoints = TrickTakingService.calculateHeartsRoundScores(points);

  // Apply to team scores (Hearts is FFA but we track as teams)
  // Seats 0&2 = team 0, seats 1&3 = team 1
  const team0Points = adjustedPoints[0] + adjustedPoints[2];
  const team1Points = adjustedPoints[1] + adjustedPoints[3];

  return {
    roundNumber: session.currentRound,
    team0Score: team0Points,
    team1Score: team1Points,
    tricksWon: [...session.tricksWon] as [number, number],
    outcome: moonCheck.shotMoon ? 'shoot_moon' : 'normal'
  };
}

function calculateBridgeRoundScore(session: ITeamCardGameSession): TeamCardRoundScore {
  // Simplified Bridge scoring
  const contract = session.contract;
  if (!contract) {
    return {
      roundNumber: session.currentRound,
      team0Score: 0,
      team1Score: 0,
      tricksWon: [...session.tricksWon] as [number, number]
    };
  }

  const declarerTeam = session.declarer !== undefined
    ? getTeamIndex(session.declarer)
    : 0;
  const tricksMade = session.tricksWon[declarerTeam];
  const tricksNeeded = (contract.level || 1) + 6;

  const points = TrickTakingService.calculateBridgeContractPoints(
    contract.level || 1,
    contract.strain || 'NT',
    tricksMade,
    tricksNeeded,
    contract.isDoubled || false,
    contract.isRedoubled || false
  );

  return {
    roundNumber: session.currentRound,
    team0Score: declarerTeam === 0 ? points : -points,
    team1Score: declarerTeam === 1 ? points : -points,
    tricksWon: [...session.tricksWon] as [number, number],
    outcome: tricksMade >= tricksNeeded ? 'made' : 'set'
  };
}

function calculatePinochleRoundScore(session: ITeamCardGameSession): TeamCardRoundScore {
  // Simplified Pinochle scoring (meld + tricks)
  const meldPoints = [0, 0];
  const trickPoints = [0, 0];

  for (const player of session.players) {
    const melds = player.melds || [];
    const meldScore = melds.reduce((sum, m: any) => sum + (m.points || 0), 0);
    meldPoints[player.teamIndex] += meldScore;

    // Trick points (A=11, 10=10, K=4, Q=3, J=2)
    trickPoints[player.teamIndex] += player.tricksWonRound * 10; // Simplified
  }

  return {
    roundNumber: session.currentRound,
    team0Score: meldPoints[0] + trickPoints[0],
    team1Score: meldPoints[1] + trickPoints[1],
    tricksWon: [...session.tricksWon] as [number, number]
  };
}

// =============================================================================
// GAME OVER
// =============================================================================

function checkGameOver(session: ITeamCardGameSession): boolean {
  const config = GAME_TYPE_CONFIGS[session.gameType];

  // Hearts: first team to 100 loses
  if (config.losingScoreTarget) {
    return session.teamScores[0] >= config.winningScore ||
           session.teamScores[1] >= config.winningScore;
  }

  // Boss raid: boss defeated
  if (session.raidMode && session.bossHealth !== undefined && session.bossHealth <= 0) {
    return true;
  }

  // Standard: first to winning score
  return session.teamScores[0] >= config.winningScore ||
         session.teamScores[1] >= config.winningScore;
}

async function resolveGame(session: ITeamCardGameSession): Promise<void> {
  session.phase = TeamCardGamePhase.GAME_COMPLETE;

  const config = GAME_TYPE_CONFIGS[session.gameType];
  let winningTeam: 0 | 1;

  if (config.losingScoreTarget) {
    // Hearts: lowest score wins
    winningTeam = session.teamScores[0] < session.teamScores[1] ? 0 : 1;
  } else {
    winningTeam = session.teamScores[0] > session.teamScores[1] ? 0 : 1;
  }

  // Calculate rewards
  const rewards = {
    gold: 100 + (session.currentRound * 10),
    experience: 50 + (session.currentRound * 5)
  };

  // Raid bonus
  const raidVictory = session.raidMode && session.bossHealth !== undefined && session.bossHealth <= 0;
  if (raidVictory && session.raidBossId) {
    const boss = getBossById(session.raidBossId);
    if (boss) {
      rewards.gold += boss.rewards.goldBase;
      rewards.experience += boss.rewards.experienceBase;
    }
  }

  // Player stats
  const playerStats = session.players.map(p => ({
    characterId: p.characterId,
    characterName: p.characterName,
    tricksWon: p.tricksWonTotal,
    contributionScore: p.contributionScore
  }));

  broadcastToSession(session, 'teamCard:game_complete', {
    winningTeam,
    finalScores: session.teamScores,
    rewards,
    playerStats,
    raidVictory,
    bossDefeated: raidVictory
  });

  // Award rewards to human players
  for (const player of session.players) {
    if (!player.isNPC) {
      const onWinningTeam = player.teamIndex === winningTeam;
      const playerReward = {
        gold: Math.floor(rewards.gold * (onWinningTeam ? 1 : 0.5)),
        experience: Math.floor(rewards.experience * (onWinningTeam ? 1 : 0.5))
      };

      // Apply rewards via services
      try {
        if (playerReward.gold > 0) {
          await DollarService.addDollars(
            player.characterId,
            playerReward.gold,
            onWinningTeam ? TransactionSource.GAMBLING_WIN : TransactionSource.GAMBLING_LOSS,
            { game: 'team_card_game', session: session.sessionId, won: onWinningTeam }
          );
        }
        if (playerReward.experience > 0) {
          await CharacterProgressionService.addExperience(
            player.characterId,
            playerReward.experience,
            'TEAM_CARD_GAME'
          );
        }
        logger.info(`Rewards applied for ${player.characterName}: ${playerReward.gold} dollars, ${playerReward.experience} XP`);
      } catch (rewardError) {
        logger.error(`Failed to apply rewards for ${player.characterName}`, {
          error: rewardError instanceof Error ? rewardError.message : rewardError
        });
      }
    }
  }

  await session.save();

  logger.info(`Game complete in session ${session.sessionId}. Team ${winningTeam + 1} wins!`);
}

// =============================================================================
// BOSS DAMAGE
// =============================================================================

function calculateBossDamage(session: ITeamCardGameSession, roundScore: TeamCardRoundScore): number {
  // Player team is team 0
  const playerTeamScore = roundScore.team0Score;

  if (playerTeamScore <= 0) return 0;

  let damage = playerTeamScore * 50;

  // Bonus for special outcomes
  switch (roundScore.outcome) {
    case 'march':
    case 'slam':
      damage *= 1.5;
      break;
    case 'alone_march':
      damage *= 2;
      break;
    case 'shoot_moon':
      damage *= 3;
      break;
  }

  // Skill multiplier (average team gambling skill)
  const team0Players = session.players.filter(p => p.teamIndex === 0);
  const avgSkill = team0Players.reduce((sum, p) => sum + p.gamblingSkill, 0) / team0Players.length;
  damage *= (1 + avgSkill / 100);

  return Math.floor(damage);
}

// =============================================================================
// NPC ACTIONS
// =============================================================================

function scheduleNPCAction(session: ITeamCardGameSession): void {
  // Schedule NPC action after a delay to simulate thinking
  setTimeout(async () => {
    try {
      await processNPCAction(session.sessionId);
    } catch (error) {
      logger.error(`NPC action error in session ${session.sessionId}:`, error);
    }
  }, NPC_THINK_DELAY_MS);
}

async function processNPCAction(sessionId: string): Promise<void> {
  const session = await SessionModel.findOne({ sessionId });
  if (!session) return;

  const npcIndex = session.currentPlayer;
  const player = session.players[npcIndex];
  if (!player || !player.isNPC) return;

  // Import NPC service dynamically to avoid circular deps
  const { NPCPartnerService } = await import('./npcPartner.service');

  // Create decision context for NPC service
  const context = {
    session: session as ITeamCardGameSession,
    npcPlayer: player,
    npcIndex
  };

  switch (session.phase) {
    case TeamCardGamePhase.BIDDING:
      if (session.gameType === TeamCardGameType.EUCHRE) {
        const call = NPCPartnerService.chooseEuchreTrumpCall(context);
        await processEuchreTrumpCall(sessionId, player.characterId, call.action, call);
      } else {
        const bid = NPCPartnerService.chooseBid(context);
        await processBid(sessionId, player.characterId, bid.value, bid);
      }
      break;

    case TeamCardGamePhase.PLAYING:
      const cardIndex = NPCPartnerService.chooseCard(context);
      await playCard(sessionId, player.characterId, cardIndex);
      break;

    case TeamCardGamePhase.TRUMP_SELECTION:
      // Euchre dealer discard
      if (session.gameType === TeamCardGameType.EUCHRE) {
        const discardIndex = NPCPartnerService.chooseDiscard(context);
        await processEuchreDealerDiscard(sessionId, player.characterId, discardIndex);
      }
      break;
  }
}

/**
 * Process Euchre dealer discard
 */
export async function processEuchreDealerDiscard(
  sessionId: string,
  characterId: string,
  cardIndex: number
): Promise<ITeamCardGameSession> {
  return withLock(sessionLockKey(sessionId), async () => {
    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    const result = EuchreService.processDealerDiscard(session as any, cardIndex);
    if (!result.success) {
      throw new Error(result.message);
    }

    Object.assign(session, result.session);
    await session.save();

    // Start play
    if (session.phase === TeamCardGamePhase.PLAYING) {
      broadcastToSession(session, 'teamCard:turn_start', {
        playerIndex: session.currentPlayer,
        playerName: session.players[session.currentPlayer]?.characterName,
        phase: session.phase,
        timeLimit: session.turnTimeLimit,
        availableActions: ['play_card'],
        isNPC: session.players[session.currentPlayer]?.isNPC
      });

      if (session.players[session.currentPlayer]?.isNPC) {
        scheduleNPCAction(session);
      }
    }

    return session;
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getNextPlayer(session: ITeamCardGameSession, currentPlayer: number): number {
  let next = (currentPlayer + 1) % 4;

  // Skip partner if going alone (Euchre)
  if (session.goingAlone && session.maker !== undefined) {
    const partnerIndex = getPartnerIndex(session.maker);
    if (next === partnerIndex) {
      next = (next + 1) % 4;
    }
  }

  return next;
}

async function replaceWithNPC(
  session: ITeamCardGameSession,
  playerIndex: number,
  difficulty: NPCDifficulty
): Promise<void> {
  const player = session.players[playerIndex];

  player.isNPC = true;
  player.npcDifficulty = difficulty;
  player.characterId = `npc_replaced_${uuidv4()}`;
  player.characterName = `${player.characterName} (NPC)`;
  player.isReady = true;
  player.isConnected = true;

  // If it's their turn, schedule NPC action
  if (session.currentPlayer === playerIndex && session.isActive()) {
    scheduleNPCAction(session);
  }

  await session.save();
}

// =============================================================================
// CLIENT STATE BUILDING
// =============================================================================

export function buildClientState(
  session: ITeamCardGameSession,
  characterId: string
): TeamCardGameClientState {
  const playerIndex = session.getPlayerIndex(characterId);
  const player = session.players[playerIndex];

  if (!player) {
    throw new Error('Player not in session');
  }

  const partnerIndex = getPartnerIndex(playerIndex);
  const partner = session.players[partnerIndex];

  // Build partner visible state
  const partnerState: PartnerVisibleState = {
    characterId: partner.characterId,
    characterName: partner.characterName,
    isNPC: partner.isNPC,
    cardCount: partner.hand.length,
    tricksWonRound: partner.tricksWonRound,
    bid: partner.bid as any,
    isConnected: partner.isConnected
  };

  // Skill-based partner insight
  if (player.gamblingSkill >= 25) {
    const avgRank = partner.hand.reduce((sum, c) => sum + c.rank, 0) / partner.hand.length;
    partnerState.handQualityHint = avgRank > 10 ? 'strong' : avgRank > 7 ? 'moderate' : 'weak';
  }

  // Build opponent visible state
  const opponentIndices = [1, 3].map(offset => (playerIndex + offset) % 4);
  const opponents: OpponentTeamVisibleState = {
    players: opponentIndices.map(idx => {
      const opp = session.players[idx];
      return {
        characterId: opp.characterId,
        characterName: opp.characterName,
        isNPC: opp.isNPC,
        cardCount: opp.hand.length,
        tricksWonRound: opp.tricksWonRound,
        bid: opp.bid as any,
        isConnected: opp.isConnected
      };
    }),
    teamTricksWon: session.tricksWon[partner.teamIndex === 0 ? 1 : 0],
    teamScore: session.teamScores[partner.teamIndex === 0 ? 1 : 0]
  };

  // Get playable cards
  const playableIndices: number[] = [];
  if (session.phase === TeamCardGamePhase.PLAYING && session.currentPlayer === playerIndex) {
    const playable = getPlayableCards(
      player.hand,
      session.currentTrick,
      session.trump as Suit || null,
      session.gameType,
      session.heartsBroken
    );

    for (let i = 0; i < player.hand.length; i++) {
      const card = player.hand[i];
      if (playable.some(p => p.suit === card.suit && p.rank === card.rank)) {
        playableIndices.push(i);
      }
    }
  }

  // Available actions
  const availableActions: string[] = [];
  if (session.currentPlayer === playerIndex) {
    switch (session.phase) {
      case TeamCardGamePhase.BIDDING:
        if (session.gameType === TeamCardGameType.EUCHRE) {
          availableActions.push(...EuchreService.getAvailableTrumpCalls(session as any, playerIndex));
        } else {
          availableActions.push('bid', 'pass');
        }
        break;
      case TeamCardGamePhase.PLAYING:
        availableActions.push('play_card');
        break;
      case TeamCardGamePhase.TRUMP_SELECTION:
        availableActions.push('discard');
        break;
    }
  }

  // Build hints based on skill
  const hints: GameHint[] = [];
  if (player.gamblingSkill >= 15 && session.phase === TeamCardGamePhase.PLAYING && playableIndices.length > 0) {
    // Suggest best play based on gambling skill
    // Higher skill = better suggestions
    if (session.currentTrick.length === 0) {
      // Leading the trick - suggest trump if available, otherwise highest card
      const trumpCards = playableIndices.filter(i => player.hand[i]?.suit === session.trump);
      if (trumpCards.length > 0 && player.gamblingSkill >= 30) {
        hints.push({
          type: 'suggested_play',
          message: 'Consider leading with a trump card to control the trick',
          confidence: Math.min(100, 50 + player.gamblingSkill)
        });
      }
    } else if (session.currentTrick.length > 0) {
      // Following - suggest playing to win if possible, or ducking
      const leadSuit = session.currentTrick[0]?.card.suit;
      const mustFollow = player.hand.some(c => c.suit === leadSuit);
      if (mustFollow && player.gamblingSkill >= 25) {
        hints.push({
          type: 'suggested_play',
          message: `Follow suit with ${leadSuit}. Play high to win or low to save.`,
          confidence: Math.min(100, 40 + player.gamblingSkill)
        });
      } else if (!mustFollow && player.gamblingSkill >= 35) {
        hints.push({
          type: 'suggested_play',
          message: 'You can trump or discard. Consider trumping only for valuable tricks.',
          confidence: Math.min(100, 60 + player.gamblingSkill)
        });
      }
    }
  }

  // Build active mechanics for UI
  const activeMechanics = session.activeBossMechanics.map((m: any) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    canCounter: !!m.counterplay && canCounterMechanic(m, player),
    counterSkill: m.counterplay?.skill,
    counterThreshold: m.counterplay?.threshold
  }));

  return {
    sessionId: session.sessionId,
    gameType: session.gameType,
    raidMode: session.raidMode,
    me: player,
    partner: partnerState,
    opponents,
    phase: session.phase,
    currentRound: session.currentRound,
    isMyTurn: session.currentPlayer === playerIndex,
    currentPlayerName: session.players[session.currentPlayer]?.characterName,
    turnTimeRemaining: Math.max(0,
      session.turnTimeLimit - Math.floor((Date.now() - session.turnStartedAt) / 1000)
    ),
    trump: session.trump as Suit,
    contract: session.contract as any,
    currentTrick: session.currentTrick,
    trickNumber: session.trickNumber,
    tricksWon: session.tricksWon as [number, number],
    playableCardIndices: playableIndices,
    teamScores: session.teamScores as [number, number],
    bossName: session.raidBossId ? getBossById(session.raidBossId)?.name : undefined,
    bossHealth: session.bossHealth,
    bossMaxHealth: session.bossMaxHealth,
    bossPhase: session.bossPhase,
    activeMechanics,
    availableActions,
    hints
  };
}

function canCounterMechanic(mechanic: any, player: ITeamCardPlayer): boolean {
  if (!mechanic.counterplay) return false;

  const skill = mechanic.counterplay.skill;
  const threshold = mechanic.counterplay.threshold || 0;

  switch (skill) {
    case 'gambling':
      return player.gamblingSkill >= threshold;
    case 'duel_instinct':
      return player.duelInstinctSkill >= threshold;
    case 'deception':
      return player.deceptionSkill >= threshold;
    case 'sleight_of_hand':
      return player.sleightOfHandSkill >= threshold;
    default:
      return false;
  }
}

// =============================================================================
// SOCKET UTILITIES
// =============================================================================

function broadcastToSession(session: ITeamCardGameSession, event: string, data: any): void {
  const io = getSocketIO();
  if (!io) return;

  for (const player of session.players) {
    if (!player.isNPC && player.socketId) {
      io.to(player.socketId).emit(event, data);
    }
  }
}

function emitToPlayer(player: ITeamCardPlayer, event: string, data: any): void {
  if (player.isNPC || !player.socketId) return;

  const io = getSocketIO();
  if (!io) return;

  io.to(player.socketId).emit(event, data);
}

// =============================================================================
// CONNECTION MANAGEMENT
// =============================================================================

/**
 * Update player connection status
 */
export async function updatePlayerConnection(
  sessionId: string,
  characterId: string,
  isConnected: boolean,
  socketId?: string
): Promise<void> {
  const session = await SessionModel.findOne({ sessionId });
  if (!session) return;

  session.updatePlayerConnection(characterId, isConnected, socketId);
  await session.save();

  if (!isConnected) {
    // Start disconnect timer
    setTimeout(async () => {
      const currentSession = await SessionModel.findOne({ sessionId });
      if (!currentSession) return;

      const player = currentSession.getPlayer(characterId);
      if (player && !player.isConnected && !player.isNPC) {
        // Replace with NPC
        const playerIndex = currentSession.getPlayerIndex(characterId);
        await replaceWithNPC(currentSession, playerIndex, NPCDifficulty.MEDIUM);

        broadcastToSession(currentSession, 'teamCard:player_left', {
          playerName: player.characterName,
          seatIndex: player.seatIndex,
          replacedByNPC: true,
          npcDifficulty: NPCDifficulty.MEDIUM
        });
      }
    }, DISCONNECT_GRACE_PERIOD_MS);
  } else {
    // Reconnection - send full state
    const player = session.getPlayer(characterId);
    if (player) {
      const clientState = buildClientState(session, characterId);
      emitToPlayer(player, 'teamCard:reconnected', clientState);

      broadcastToSession(session, 'teamCard:player_reconnected', {
        playerName: player.characterName,
        seatIndex: player.seatIndex
      });
    }
  }
}

// =============================================================================
// QUERY FUNCTIONS
// =============================================================================

/**
 * Get open lobbies
 */
export async function getOpenLobbies(
  gameType?: TeamCardGameType
): Promise<ITeamCardGameSession[]> {
  return SessionModel.findOpenLobbies(gameType);
}

/**
 * Get player's current session
 */
export async function getPlayerSession(
  characterId: string
): Promise<ITeamCardGameSession | null> {
  return SessionModel.findByPlayer(characterId);
}

/**
 * Get session by ID
 */
export async function getSession(
  sessionId: string
): Promise<ITeamCardGameSession | null> {
  return SessionModel.findOne({ sessionId });
}

// =============================================================================
// EXPORTS
// =============================================================================

export const TeamCardGameService = {
  createSession,
  joinSession,
  leaveSession,
  setPlayerReady,
  requestNPC,
  playCard,
  processBid,
  processEuchreTrumpCall,
  processEuchreDealerDiscard,
  updatePlayerConnection,
  buildClientState,
  getOpenLobbies,
  getPlayerSession,
  getSession
};
