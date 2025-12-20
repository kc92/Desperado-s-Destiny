/**
 * Gang War Deck Service
 * Integrates deck games with gang war system
 * - Raid contributions (members play deck games to earn war points)
 * - Champion duels (selected members duel for bonus points)
 * - Final showdown (leaders play to determine close wars)
 */

import mongoose from 'mongoose';
import { GangWar, IGangWar } from '../models/GangWar.model';
import { GangWarStatus, SkillCategory } from '@desperados/shared';
import { Gang } from '../models/Gang.model';
import { UnlockEnforcementService } from './unlockEnforcement.service';
import { Character } from '../models/Character.model';
import { GangWarSession } from '../models/GangWarSession.model';
import {
  initGame,
  processAction,
  resolveGame,
  GameState,
  GameResult,
  PlayerAction
} from './deckGames';
import { EnergyService } from './energy.service';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { getSocketIO } from '../config/socket';

// Store active gang war deck games
interface WarRaidGame {
  warId: string;
  characterId: string;
  characterName: string;
  side: 'attacker' | 'defender';
  gameState: GameState;
}

interface ChampionDuel {
  warId: string;
  attackerChampionId: string;
  defenderChampionId: string;
  attackerState: GameState;
  defenderState: GameState;
  attackerResolved: boolean;
  defenderResolved: boolean;
  attackerResult?: GameResult;
  defenderResult?: GameResult;
}

interface LeaderShowdown {
  warId: string;
  attackerLeaderId: string;
  defenderLeaderId: string;
  attackerState: GameState;
  defenderState: GameState;
  attackerResolved: boolean;
  defenderResolved: boolean;
  attackerResult?: GameResult;
  defenderResult?: GameResult;
}

// Removed in-memory Maps - now using GangWarSession model for persistence

// Points awarded for raid wins
const RAID_WIN_POINTS = 5;
const RAID_LOSS_POINTS = 1;
const CHAMPION_WIN_POINTS = 25;
const SHOWDOWN_WIN_POINTS = 50;

/**
 * Start a raid mission for a character
 * Members can raid to contribute war points via deck games
 */
export async function startRaid(
  warId: string,
  characterId: string
): Promise<{ raidId: string; gameState: GameState }> {
  const war = await GangWar.findById(warId);
  if (!war || war.status !== GangWarStatus.ACTIVE) {
    throw new Error('War not found or not active');
  }

  const character = await Character.findById(characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  // Check energy
  character.regenerateEnergy();
  if (character.energy < 10) {
    throw new Error('Not enough energy for raid (need 10)');
  }

  // Determine which side
  const gang = await Gang.findByMember(new mongoose.Types.ObjectId(characterId));
  if (!gang) {
    throw new Error('Character is not in a gang');
  }

  let side: 'attacker' | 'defender';
  if (gang._id.toString() === war.attackerGangId.toString()) {
    side = 'attacker';
  } else if (war.defenderGangId && gang._id.toString() === war.defenderGangId.toString()) {
    side = 'defender';
  } else {
    throw new Error('Your gang is not involved in this war');
  }

  // Check raid cooldown (5 minute between raids per character)
  const existingRaid = await GangWarSession.findOne({
    type: 'raid',
    characterId: new mongoose.Types.ObjectId(characterId),
    warId: new mongoose.Types.ObjectId(warId)
  });
  if (existingRaid) {
    throw new Error('You already have an active raid');
  }

  // Initialize Press Your Luck game (crime-style for raids)
  const gameState = initGame({
    gameType: 'pressYourLuck',
    playerId: characterId,
    difficulty: 3,
    relevantSuit: 'spades', // Combat suit for war
    timeLimit: 60
  });

  const raidId = uuidv4();

  // Create database session
  await GangWarSession.create({
    sessionId: raidId,
    warId: new mongoose.Types.ObjectId(warId),
    type: 'raid',
    characterId: new mongoose.Types.ObjectId(characterId),
    characterName: character.name,
    side,
    gameState,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  });

  logger.info(`Raid started: ${character.name} (${side}) in war ${warId}`);

  return { raidId, gameState };
}

/**
 * Process raid game action
 */
export async function processRaidAction(
  raidId: string,
  action: PlayerAction
): Promise<{
  gameState: GameState;
  isResolved: boolean;
  raidResult?: {
    success: boolean;
    pointsEarned: number;
    newCapturePoints: number;
  };
}> {
  const session = await GangWarSession.findOne({ sessionId: raidId, type: 'raid' });
  if (!session) {
    throw new Error('Raid not found');
  }

  // Process action
  const newState = processAction(session.gameState, action);
  session.gameState = newState;
  await session.save();

  if (newState.status === 'resolved') {
    const result = resolveGame(newState);
    const raidResult = await resolveRaid(session, result);

    return {
      gameState: newState,
      isResolved: true,
      raidResult
    };
  }

  return {
    gameState: newState,
    isResolved: false
  };
}

/**
 * Resolve raid and award points
 */
async function resolveRaid(
  session: any,
  result: GameResult
): Promise<{
  success: boolean;
  pointsEarned: number;
  newCapturePoints: number;
}> {
  const war = await GangWar.findById(session.warId);
  if (!war) {
    throw new Error('War not found');
  }

  const character = await Character.findById(session.characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  // Deduct energy
  await EnergyService.spendEnergy(character._id.toString(), 10, 'gang_war_raid');
  await character.save();

  // Calculate points
  let pointsEarned = result.success ? RAID_WIN_POINTS : RAID_LOSS_POINTS;

  // Apply suit bonus
  pointsEarned = Math.round(pointsEarned * result.suitBonus.multiplier);

  // Award points based on side
  if (session.side === 'attacker') {
    war.capturePoints = Math.min(200, war.capturePoints + pointsEarned);
  } else {
    war.capturePoints = Math.max(0, war.capturePoints - pointsEarned);
  }

  // Log the raid
  war.warLog.push({
    timestamp: new Date(),
    event: 'RAID_COMPLETED',
    data: {
      character: session.characterName,
      side: session.side,
      success: result.success,
      pointsEarned,
      newCapturePoints: war.capturePoints
    }
  });

  await war.save();

  // Cleanup - delete session from database
  await GangWarSession.deleteOne({ _id: session._id });

  logger.info(
    `Raid completed: ${session.characterName} earned ${pointsEarned} points for ${session.side}`
  );

  // Emit event
  const io = getSocketIO();
  if (io) {
    io.emit('territory:raid_completed', {
      warId: session.warId.toString(),
      raider: session.characterName,
      side: session.side,
      success: result.success,
      pointsEarned,
      newCapturePoints: war.capturePoints
    });
  }

  return {
    success: result.success,
    pointsEarned,
    newCapturePoints: war.capturePoints
  };
}

/**
 * Start a champion duel between two selected gang members
 */
export async function startChampionDuel(
  warId: string,
  attackerChampionId: string,
  defenderChampionId: string
): Promise<ChampionDuel> {
  const war = await GangWar.findById(warId);
  if (!war || war.status !== GangWarStatus.ACTIVE) {
    throw new Error('War not found or not active');
  }

  // Validate champions
  const [attacker, defender] = await Promise.all([
    Character.findById(attackerChampionId),
    Character.findById(defenderChampionId)
  ]);

  if (!attacker || !defender) {
    throw new Error('Champion not found');
  }

  // Verify gang membership
  const attackerGang = await Gang.findByMember(new mongoose.Types.ObjectId(attackerChampionId));
  const defenderGang = await Gang.findByMember(new mongoose.Types.ObjectId(defenderChampionId));

  if (!attackerGang || attackerGang._id.toString() !== war.attackerGangId.toString()) {
    throw new Error('Attacker champion must be in attacking gang');
  }
  if (!defenderGang || defenderGang._id.toString() !== war.defenderGangId?.toString()) {
    throw new Error('Defender champion must be in defending gang');
  }

  // Check if duel already exists
  const existingDuel = await GangWarSession.findOne({
    type: 'champion_duel',
    warId: new mongoose.Types.ObjectId(warId)
  });
  if (existingDuel) {
    throw new Error('Champion duel already in progress for this war');
  }

  // Initialize poker games for both
  const attackerState = initGame({
    gameType: 'pokerHoldDraw',
    playerId: attackerChampionId,
    difficulty: 3,
    relevantSuit: 'clubs',
    timeLimit: 60
  });

  const defenderState = initGame({
    gameType: 'pokerHoldDraw',
    playerId: defenderChampionId,
    difficulty: 3,
    relevantSuit: 'clubs',
    timeLimit: 60
  });

  // Create database session
  const session = await GangWarSession.create({
    sessionId: uuidv4(),
    warId: new mongoose.Types.ObjectId(warId),
    type: 'champion_duel',
    attackerChampionId: new mongoose.Types.ObjectId(attackerChampionId),
    defenderChampionId: new mongoose.Types.ObjectId(defenderChampionId),
    attackerState,
    defenderState,
    attackerResolved: false,
    defenderResolved: false,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  });

  // Log
  war.warLog.push({
    timestamp: new Date(),
    event: 'CHAMPION_DUEL_STARTED',
    data: {
      attackerChampion: attacker.name,
      defenderChampion: defender.name
    }
  });
  await war.save();

  logger.info(`Champion duel started: ${attacker.name} vs ${defender.name}`);

  const duel: ChampionDuel = {
    warId,
    attackerChampionId,
    defenderChampionId,
    attackerState,
    defenderState,
    attackerResolved: false,
    defenderResolved: false
  };

  return duel;
}

/**
 * Process champion duel action
 */
export async function processChampionAction(
  warId: string,
  characterId: string,
  action: PlayerAction
): Promise<{
  gameState: GameState;
  isResolved: boolean;
  duelComplete: boolean;
  result?: {
    winnerId: string;
    winnerName: string;
    pointsAwarded: number;
  };
}> {
  const session = await GangWarSession.findOne({
    type: 'champion_duel',
    warId: new mongoose.Types.ObjectId(warId)
  });
  if (!session) {
    throw new Error('Champion duel not found');
  }

  const isAttacker = session.attackerChampionId?.toString() === characterId;
  const isDefender = session.defenderChampionId?.toString() === characterId;

  if (!isAttacker && !isDefender) {
    throw new Error('Not a participant in this duel');
  }

  // Process action
  let state: GameState;
  if (isAttacker) {
    if (session.attackerResolved) {
      throw new Error('Already completed your turn');
    }
    state = processAction(session.attackerState, action);
    session.attackerState = state;
  } else {
    if (session.defenderResolved) {
      throw new Error('Already completed your turn');
    }
    state = processAction(session.defenderState, action);
    session.defenderState = state;
  }

  // Check resolution
  if (state.status === 'resolved') {
    const result = resolveGame(state);
    if (isAttacker) {
      session.attackerResolved = true;
      session.attackerResult = result;
    } else {
      session.defenderResolved = true;
      session.defenderResult = result;
    }
  }

  await session.save();

  // Check if both resolved
  if (session.attackerResolved && session.defenderResolved) {
    const result = await resolveChampionDuel(session);
    return {
      gameState: state,
      isResolved: true,
      duelComplete: true,
      result
    };
  }

  return {
    gameState: state,
    isResolved: state.status === 'resolved',
    duelComplete: false
  };
}

/**
 * Resolve champion duel
 */
async function resolveChampionDuel(session: any): Promise<{
  winnerId: string;
  winnerName: string;
  pointsAwarded: number;
}> {
  if (!session.attackerResult || !session.defenderResult) {
    throw new Error('Duel not properly resolved');
  }

  const war = await GangWar.findById(session.warId);
  if (!war) {
    throw new Error('War not found');
  }

  const [attacker, defender] = await Promise.all([
    Character.findById(session.attackerChampionId),
    Character.findById(session.defenderChampionId)
  ]);

  if (!attacker || !defender) {
    throw new Error('Champion not found');
  }

  // Determine winner
  let winnerId: string;
  let winnerName: string;
  let winningSide: 'attacker' | 'defender';

  if (session.attackerResult.score >= session.defenderResult.score) {
    winnerId = session.attackerChampionId.toString();
    winnerName = attacker.name;
    winningSide = 'attacker';
    war.capturePoints = Math.min(200, war.capturePoints + CHAMPION_WIN_POINTS);
  } else {
    winnerId = session.defenderChampionId.toString();
    winnerName = defender.name;
    winningSide = 'defender';
    war.capturePoints = Math.max(0, war.capturePoints - CHAMPION_WIN_POINTS);
  }

  // Log
  war.warLog.push({
    timestamp: new Date(),
    event: 'CHAMPION_DUEL_RESOLVED',
    data: {
      winner: winnerName,
      winningSide,
      attackerScore: session.attackerResult.score,
      defenderScore: session.defenderResult.score,
      pointsAwarded: CHAMPION_WIN_POINTS,
      newCapturePoints: war.capturePoints
    }
  });

  await war.save();

  // Cleanup - delete session from database
  await GangWarSession.deleteOne({ _id: session._id });

  logger.info(`Champion duel resolved: ${winnerName} won for ${winningSide}`);

  const io = getSocketIO();
  if (io) {
    io.emit('territory:champion_duel_resolved', {
      warId: session.warId.toString(),
      winner: winnerName,
      winningSide,
      pointsAwarded: CHAMPION_WIN_POINTS,
      newCapturePoints: war.capturePoints
    });
  }

  return {
    winnerId,
    winnerName,
    pointsAwarded: CHAMPION_WIN_POINTS
  };
}

/**
 * Start final leader showdown (for close wars)
 */
export async function startLeaderShowdown(warId: string): Promise<LeaderShowdown> {
  const war = await GangWar.findById(warId);
  if (!war || war.status !== GangWarStatus.ACTIVE) {
    throw new Error('War not found or not active');
  }

  if (!war.defenderGangId) {
    throw new Error('Cannot have showdown against unclaimed territory');
  }

  // Check if war is close enough for showdown (within 30 points of 100)
  if (Math.abs(war.capturePoints - 100) > 30) {
    throw new Error('War is not close enough for leader showdown');
  }

  const [attackerGang, defenderGang] = await Promise.all([
    Gang.findById(war.attackerGangId),
    Gang.findById(war.defenderGangId)
  ]);

  if (!attackerGang || !defenderGang) {
    throw new Error('Gang not found');
  }

  const existingShowdown = await GangWarSession.findOne({
    type: 'leader_showdown',
    warId: new mongoose.Types.ObjectId(warId)
  });
  if (existingShowdown) {
    throw new Error('Leader showdown already in progress');
  }

  // Check COMBAT level 40 requirement for gang war leader showdown - both leaders must have it
  const [attackerLeader, defenderLeader] = await Promise.all([
    Character.findById(attackerGang.leaderId),
    Character.findById(defenderGang.leaderId)
  ]);

  if (attackerLeader) {
    const attackerCheck = UnlockEnforcementService.checkUnlockForCharacter(
      attackerLeader,
      SkillCategory.COMBAT,
      'Gang War Leader'
    );
    if (!attackerCheck.allowed) {
      throw new Error(`Your gang leader needs COMBAT level 40 for leader showdown (current: ${attackerCheck.currentLevel || 0})`);
    }
  }

  if (defenderLeader) {
    const defenderCheck = UnlockEnforcementService.checkUnlockForCharacter(
      defenderLeader,
      SkillCategory.COMBAT,
      'Gang War Leader'
    );
    if (!defenderCheck.allowed) {
      throw new Error(`Enemy gang leader has not unlocked leader showdown (requires COMBAT level 40)`);
    }
  }

  const attackerState = initGame({
    gameType: 'pokerHoldDraw',
    playerId: attackerGang.leaderId.toString(),
    difficulty: 4, // Higher difficulty for showdown
    relevantSuit: 'spades',
    timeLimit: 90 // More time for important match
  });

  const defenderState = initGame({
    gameType: 'pokerHoldDraw',
    playerId: defenderGang.leaderId.toString(),
    difficulty: 4,
    relevantSuit: 'spades',
    timeLimit: 90
  });

  // Create database session
  await GangWarSession.create({
    sessionId: uuidv4(),
    warId: new mongoose.Types.ObjectId(warId),
    type: 'leader_showdown',
    attackerChampionId: attackerGang.leaderId,
    defenderChampionId: defenderGang.leaderId,
    attackerState,
    defenderState,
    attackerResolved: false,
    defenderResolved: false,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours for showdown
  });

  war.warLog.push({
    timestamp: new Date(),
    event: 'LEADER_SHOWDOWN_STARTED',
    data: {
      attackerLeader: attackerGang.name,
      defenderLeader: defenderGang.name
    }
  });
  await war.save();

  logger.info(`Leader showdown started for war ${warId}`);

  const showdown: LeaderShowdown = {
    warId,
    attackerLeaderId: attackerGang.leaderId.toString(),
    defenderLeaderId: defenderGang.leaderId.toString(),
    attackerState,
    defenderState,
    attackerResolved: false,
    defenderResolved: false
  };

  return showdown;
}

/**
 * Process leader showdown action
 */
export async function processShowdownAction(
  warId: string,
  characterId: string,
  action: PlayerAction
): Promise<{
  gameState: GameState;
  isResolved: boolean;
  showdownComplete: boolean;
  result?: {
    winnerId: string;
    winnerGang: string;
    pointsAwarded: number;
    warOutcome: 'attacker' | 'defender';
  };
}> {
  const session = await GangWarSession.findOne({
    type: 'leader_showdown',
    warId: new mongoose.Types.ObjectId(warId)
  });
  if (!session) {
    throw new Error('Leader showdown not found');
  }

  const isAttacker = session.attackerChampionId?.toString() === characterId;
  const isDefender = session.defenderChampionId?.toString() === characterId;

  if (!isAttacker && !isDefender) {
    throw new Error('Not a leader in this showdown');
  }

  let state: GameState;
  if (isAttacker) {
    if (session.attackerResolved) {
      throw new Error('Already completed your turn');
    }
    state = processAction(session.attackerState, action);
    session.attackerState = state;
  } else {
    if (session.defenderResolved) {
      throw new Error('Already completed your turn');
    }
    state = processAction(session.defenderState, action);
    session.defenderState = state;
  }

  if (state.status === 'resolved') {
    const result = resolveGame(state);
    if (isAttacker) {
      session.attackerResolved = true;
      session.attackerResult = result;
    } else {
      session.defenderResolved = true;
      session.defenderResult = result;
    }
  }

  await session.save();

  if (session.attackerResolved && session.defenderResolved) {
    const result = await resolveLeaderShowdown(session);
    return {
      gameState: state,
      isResolved: true,
      showdownComplete: true,
      result
    };
  }

  return {
    gameState: state,
    isResolved: state.status === 'resolved',
    showdownComplete: false
  };
}

/**
 * Resolve leader showdown - this determines the war outcome
 */
async function resolveLeaderShowdown(session: any): Promise<{
  winnerId: string;
  winnerGang: string;
  pointsAwarded: number;
  warOutcome: 'attacker' | 'defender';
}> {
  if (!session.attackerResult || !session.defenderResult) {
    throw new Error('Showdown not properly resolved');
  }

  const war = await GangWar.findById(session.warId);
  if (!war) {
    throw new Error('War not found');
  }

  const [attackerGang, defenderGang] = await Promise.all([
    Gang.findById(war.attackerGangId),
    Gang.findById(war.defenderGangId)
  ]);

  if (!attackerGang || !defenderGang) {
    throw new Error('Gang not found');
  }

  let winnerId: string;
  let winnerGang: string;
  let warOutcome: 'attacker' | 'defender';

  if (session.attackerResult.score >= session.defenderResult.score) {
    winnerId = session.attackerChampionId.toString();
    winnerGang = attackerGang.name;
    warOutcome = 'attacker';
    war.capturePoints = Math.min(200, war.capturePoints + SHOWDOWN_WIN_POINTS);
  } else {
    winnerId = session.defenderChampionId.toString();
    winnerGang = defenderGang.name;
    warOutcome = 'defender';
    war.capturePoints = Math.max(0, war.capturePoints - SHOWDOWN_WIN_POINTS);
  }

  war.warLog.push({
    timestamp: new Date(),
    event: 'LEADER_SHOWDOWN_RESOLVED',
    data: {
      winner: winnerGang,
      warOutcome,
      attackerScore: session.attackerResult.score,
      defenderScore: session.defenderResult.score,
      pointsAwarded: SHOWDOWN_WIN_POINTS,
      finalCapturePoints: war.capturePoints
    }
  });

  await war.save();

  // Cleanup - delete session from database
  await GangWarSession.deleteOne({ _id: session._id });

  logger.info(`Leader showdown resolved: ${winnerGang} won`);

  const io = getSocketIO();
  if (io) {
    io.emit('territory:showdown_resolved', {
      warId: session.warId.toString(),
      winner: winnerGang,
      warOutcome,
      pointsAwarded: SHOWDOWN_WIN_POINTS,
      finalCapturePoints: war.capturePoints
    });
  }

  return {
    winnerId,
    winnerGang,
    pointsAwarded: SHOWDOWN_WIN_POINTS,
    warOutcome
  };
}

/**
 * Get raid game state
 */
export async function getRaidGameState(raidId: string): Promise<WarRaidGame | null> {
  const session = await GangWarSession.findOne({ sessionId: raidId, type: 'raid' });
  if (!session) return null;

  return {
    warId: session.warId.toString(),
    characterId: session.characterId!.toString(),
    characterName: session.characterName!,
    side: session.side!,
    gameState: session.gameState
  };
}

/**
 * Get champion duel state
 */
export async function getChampionDuelState(warId: string): Promise<ChampionDuel | null> {
  const session = await GangWarSession.findOne({
    type: 'champion_duel',
    warId: new mongoose.Types.ObjectId(warId)
  });
  if (!session) return null;

  return {
    warId,
    attackerChampionId: session.attackerChampionId!.toString(),
    defenderChampionId: session.defenderChampionId!.toString(),
    attackerState: session.attackerState,
    defenderState: session.defenderState,
    attackerResolved: session.attackerResolved || false,
    defenderResolved: session.defenderResolved || false,
    attackerResult: session.attackerResult,
    defenderResult: session.defenderResult
  };
}

/**
 * Get leader showdown state
 */
export async function getLeaderShowdownState(warId: string): Promise<LeaderShowdown | null> {
  const session = await GangWarSession.findOne({
    type: 'leader_showdown',
    warId: new mongoose.Types.ObjectId(warId)
  });
  if (!session) return null;

  return {
    warId,
    attackerLeaderId: session.attackerChampionId!.toString(),
    defenderLeaderId: session.defenderChampionId!.toString(),
    attackerState: session.attackerState,
    defenderState: session.defenderState,
    attackerResolved: session.attackerResolved || false,
    defenderResolved: session.defenderResolved || false,
    attackerResult: session.attackerResult,
    defenderResult: session.defenderResult
  };
}

export const GangWarDeckService = {
  startRaid,
  processRaidAction,
  startChampionDuel,
  processChampionAction,
  startLeaderShowdown,
  processShowdownAction,
  getRaidGameState,
  getChampionDuelState,
  getLeaderShowdownState
};
