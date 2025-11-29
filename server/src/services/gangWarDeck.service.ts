/**
 * Gang War Deck Service
 * Integrates deck games with gang war system
 * - Raid contributions (members play deck games to earn war points)
 * - Champion duels (selected members duel for bonus points)
 * - Final showdown (leaders play to determine close wars)
 */

import mongoose from 'mongoose';
import { GangWar, IGangWar } from '../models/GangWar.model';
import { GangWarStatus } from '@desperados/shared';
import { Gang } from '../models/Gang.model';
import { Character } from '../models/Character.model';
import {
  initGame,
  processAction,
  resolveGame,
  GameState,
  GameResult,
  PlayerAction
} from './deckGames';
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

const activeRaids = new Map<string, WarRaidGame>();
const championDuels = new Map<string, ChampionDuel>();
const leaderShowdowns = new Map<string, LeaderShowdown>();

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
  const existingRaid = Array.from(activeRaids.values()).find(
    r => r.characterId === characterId && r.warId === warId
  );
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

  activeRaids.set(raidId, {
    warId,
    characterId,
    characterName: character.name,
    side,
    gameState
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
  const raid = activeRaids.get(raidId);
  if (!raid) {
    throw new Error('Raid not found');
  }

  // Process action
  const newState = processAction(raid.gameState, action);
  raid.gameState = newState;

  if (newState.status === 'resolved') {
    const result = resolveGame(newState);
    const raidResult = await resolveRaid(raidId, result);

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
  raidId: string,
  result: GameResult
): Promise<{
  success: boolean;
  pointsEarned: number;
  newCapturePoints: number;
}> {
  const raid = activeRaids.get(raidId);
  if (!raid) {
    throw new Error('Raid not found');
  }

  const war = await GangWar.findById(raid.warId);
  if (!war) {
    throw new Error('War not found');
  }

  const character = await Character.findById(raid.characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  // Deduct energy
  character.spendEnergy(10);
  await character.save();

  // Calculate points
  let pointsEarned = result.success ? RAID_WIN_POINTS : RAID_LOSS_POINTS;

  // Apply suit bonus
  pointsEarned = Math.round(pointsEarned * result.suitBonus.multiplier);

  // Award points based on side
  if (raid.side === 'attacker') {
    war.capturePoints = Math.min(200, war.capturePoints + pointsEarned);
  } else {
    war.capturePoints = Math.max(0, war.capturePoints - pointsEarned);
  }

  // Log the raid
  war.warLog.push({
    timestamp: new Date(),
    event: 'RAID_COMPLETED',
    data: {
      character: raid.characterName,
      side: raid.side,
      success: result.success,
      pointsEarned,
      newCapturePoints: war.capturePoints
    }
  });

  await war.save();

  // Cleanup
  activeRaids.delete(raidId);

  logger.info(
    `Raid completed: ${raid.characterName} earned ${pointsEarned} points for ${raid.side}`
  );

  // Emit event
  const io = getSocketIO();
  if (io) {
    io.emit('territory:raid_completed', {
      warId: raid.warId,
      raider: raid.characterName,
      side: raid.side,
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
  if (championDuels.has(warId)) {
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

  const duel: ChampionDuel = {
    warId,
    attackerChampionId,
    defenderChampionId,
    attackerState,
    defenderState,
    attackerResolved: false,
    defenderResolved: false
  };

  championDuels.set(warId, duel);

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
  const duel = championDuels.get(warId);
  if (!duel) {
    throw new Error('Champion duel not found');
  }

  const isAttacker = duel.attackerChampionId === characterId;
  const isDefender = duel.defenderChampionId === characterId;

  if (!isAttacker && !isDefender) {
    throw new Error('Not a participant in this duel');
  }

  // Process action
  let state: GameState;
  if (isAttacker) {
    if (duel.attackerResolved) {
      throw new Error('Already completed your turn');
    }
    state = processAction(duel.attackerState, action);
    duel.attackerState = state;
  } else {
    if (duel.defenderResolved) {
      throw new Error('Already completed your turn');
    }
    state = processAction(duel.defenderState, action);
    duel.defenderState = state;
  }

  // Check resolution
  if (state.status === 'resolved') {
    const result = resolveGame(state);
    if (isAttacker) {
      duel.attackerResolved = true;
      duel.attackerResult = result;
    } else {
      duel.defenderResolved = true;
      duel.defenderResult = result;
    }
  }

  // Check if both resolved
  if (duel.attackerResolved && duel.defenderResolved) {
    const result = await resolveChampionDuel(warId);
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
async function resolveChampionDuel(warId: string): Promise<{
  winnerId: string;
  winnerName: string;
  pointsAwarded: number;
}> {
  const duel = championDuels.get(warId);
  if (!duel || !duel.attackerResult || !duel.defenderResult) {
    throw new Error('Duel not properly resolved');
  }

  const war = await GangWar.findById(warId);
  if (!war) {
    throw new Error('War not found');
  }

  const [attacker, defender] = await Promise.all([
    Character.findById(duel.attackerChampionId),
    Character.findById(duel.defenderChampionId)
  ]);

  if (!attacker || !defender) {
    throw new Error('Champion not found');
  }

  // Determine winner
  let winnerId: string;
  let winnerName: string;
  let winningSide: 'attacker' | 'defender';

  if (duel.attackerResult.score >= duel.defenderResult.score) {
    winnerId = duel.attackerChampionId;
    winnerName = attacker.name;
    winningSide = 'attacker';
    war.capturePoints = Math.min(200, war.capturePoints + CHAMPION_WIN_POINTS);
  } else {
    winnerId = duel.defenderChampionId;
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
      attackerScore: duel.attackerResult.score,
      defenderScore: duel.defenderResult.score,
      pointsAwarded: CHAMPION_WIN_POINTS,
      newCapturePoints: war.capturePoints
    }
  });

  await war.save();
  championDuels.delete(warId);

  logger.info(`Champion duel resolved: ${winnerName} won for ${winningSide}`);

  const io = getSocketIO();
  if (io) {
    io.emit('territory:champion_duel_resolved', {
      warId,
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

  if (leaderShowdowns.has(warId)) {
    throw new Error('Leader showdown already in progress');
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

  const showdown: LeaderShowdown = {
    warId,
    attackerLeaderId: attackerGang.leaderId.toString(),
    defenderLeaderId: defenderGang.leaderId.toString(),
    attackerState,
    defenderState,
    attackerResolved: false,
    defenderResolved: false
  };

  leaderShowdowns.set(warId, showdown);

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
  const showdown = leaderShowdowns.get(warId);
  if (!showdown) {
    throw new Error('Leader showdown not found');
  }

  const isAttacker = showdown.attackerLeaderId === characterId;
  const isDefender = showdown.defenderLeaderId === characterId;

  if (!isAttacker && !isDefender) {
    throw new Error('Not a leader in this showdown');
  }

  let state: GameState;
  if (isAttacker) {
    if (showdown.attackerResolved) {
      throw new Error('Already completed your turn');
    }
    state = processAction(showdown.attackerState, action);
    showdown.attackerState = state;
  } else {
    if (showdown.defenderResolved) {
      throw new Error('Already completed your turn');
    }
    state = processAction(showdown.defenderState, action);
    showdown.defenderState = state;
  }

  if (state.status === 'resolved') {
    const result = resolveGame(state);
    if (isAttacker) {
      showdown.attackerResolved = true;
      showdown.attackerResult = result;
    } else {
      showdown.defenderResolved = true;
      showdown.defenderResult = result;
    }
  }

  if (showdown.attackerResolved && showdown.defenderResolved) {
    const result = await resolveLeaderShowdown(warId);
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
async function resolveLeaderShowdown(warId: string): Promise<{
  winnerId: string;
  winnerGang: string;
  pointsAwarded: number;
  warOutcome: 'attacker' | 'defender';
}> {
  const showdown = leaderShowdowns.get(warId);
  if (!showdown || !showdown.attackerResult || !showdown.defenderResult) {
    throw new Error('Showdown not properly resolved');
  }

  const war = await GangWar.findById(warId);
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

  if (showdown.attackerResult.score >= showdown.defenderResult.score) {
    winnerId = showdown.attackerLeaderId;
    winnerGang = attackerGang.name;
    warOutcome = 'attacker';
    war.capturePoints = Math.min(200, war.capturePoints + SHOWDOWN_WIN_POINTS);
  } else {
    winnerId = showdown.defenderLeaderId;
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
      attackerScore: showdown.attackerResult.score,
      defenderScore: showdown.defenderResult.score,
      pointsAwarded: SHOWDOWN_WIN_POINTS,
      finalCapturePoints: war.capturePoints
    }
  });

  await war.save();
  leaderShowdowns.delete(warId);

  logger.info(`Leader showdown resolved: ${winnerGang} won`);

  const io = getSocketIO();
  if (io) {
    io.emit('territory:showdown_resolved', {
      warId,
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
export function getRaidGameState(raidId: string): WarRaidGame | undefined {
  return activeRaids.get(raidId);
}

/**
 * Get champion duel state
 */
export function getChampionDuelState(warId: string): ChampionDuel | undefined {
  return championDuels.get(warId);
}

/**
 * Get leader showdown state
 */
export function getLeaderShowdownState(warId: string): LeaderShowdown | undefined {
  return leaderShowdowns.get(warId);
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
