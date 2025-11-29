/**
 * Tournament Service
 * Handles tournament creation, bracket generation, and progression
 */

import mongoose from 'mongoose';
import {
  Tournament,
  TournamentStatus,
  TournamentType,
  TournamentMatch,
  ITournament
} from '../models/Tournament.model';
import { Character } from '../models/Character.model';
import { GoldService } from './gold.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  initGame,
  processAction,
  resolveGame,
  GameState,
  PlayerAction
} from './deckGames';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Active tournament matches (in production, use Redis)
interface TournamentGameState {
  tournamentId: string;
  matchId: string;
  player1State: GameState;
  player2State: GameState;
  player1Resolved: boolean;
  player2Resolved: boolean;
  player1Result?: any;
  player2Result?: any;
}

const activeTournamentGames = new Map<string, TournamentGameState>();

/**
 * Create a new tournament
 */
export async function createTournament(options: {
  name: string;
  type?: TournamentType;
  entryFee?: number;
  maxParticipants: number;
  minParticipants?: number;
  registrationMinutes?: number;
}): Promise<ITournament> {
  const {
    name,
    type = TournamentType.SINGLE_ELIMINATION,
    entryFee = 0,
    maxParticipants,
    minParticipants = 2,
    registrationMinutes = 30
  } = options;

  // Validate participant count (must be power of 2 for single elim)
  const validSizes = [2, 4, 8, 16, 32, 64];
  if (!validSizes.includes(maxParticipants)) {
    throw new Error('Max participants must be 2, 4, 8, 16, 32, or 64');
  }

  // Calculate total rounds
  const totalRounds = Math.log2(maxParticipants);

  const tournament = new Tournament({
    name,
    type,
    entryFee,
    prizePool: 0, // Calculated from entry fees
    maxParticipants,
    minParticipants,
    totalRounds,
    registrationEndsAt: new Date(Date.now() + registrationMinutes * 60 * 1000)
  });

  await tournament.save();

  logger.info(`Tournament created: ${name} (${maxParticipants} players)`);

  return tournament;
}

/**
 * Join a tournament
 */
export async function joinTournament(
  tournamentId: string,
  characterId: string
): Promise<ITournament> {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  if (tournament.status !== TournamentStatus.REGISTRATION) {
    throw new Error('Tournament is not accepting registrations');
  }

  if (tournament.registrationEndsAt < new Date()) {
    throw new Error('Registration period has ended');
  }

  if (tournament.participants.length >= tournament.maxParticipants) {
    throw new Error('Tournament is full');
  }

  // Check if already joined
  const alreadyJoined = tournament.participants.some(
    p => p.characterId.toString() === characterId
  );
  if (alreadyJoined) {
    throw new Error('Already registered for this tournament');
  }

  // Get character
  const character = await Character.findById(characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  // Handle entry fee
  if (tournament.entryFee > 0) {
    if (character.gold < tournament.entryFee) {
      throw new Error(`Insufficient gold. Need ${tournament.entryFee}, have ${character.gold}`);
    }

    await GoldService.deductGold(
      characterId as any,
      tournament.entryFee,
      TransactionSource.TOURNAMENT_ENTRY,
      {
        tournamentId: tournament._id,
        tournamentName: tournament.name,
        description: `Entry fee for ${tournament.name}`
      }
    );

    tournament.prizePool += tournament.entryFee;
  }

  // Add participant
  tournament.participants.push({
    characterId: new mongoose.Types.ObjectId(characterId),
    characterName: character.name,
    joinedAt: new Date(),
    eliminated: false
  });

  await tournament.save();

  logger.info(`${character.name} joined tournament: ${tournament.name}`);

  return tournament;
}

/**
 * Leave a tournament (only during registration)
 */
export async function leaveTournament(
  tournamentId: string,
  characterId: string
): Promise<ITournament> {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  if (tournament.status !== TournamentStatus.REGISTRATION) {
    throw new Error('Cannot leave tournament after it has started');
  }

  const participantIndex = tournament.participants.findIndex(
    p => p.characterId.toString() === characterId
  );

  if (participantIndex === -1) {
    throw new Error('Not registered for this tournament');
  }

  // Refund entry fee
  if (tournament.entryFee > 0) {
    await GoldService.addGold(
      characterId as any,
      tournament.entryFee,
      TransactionSource.TOURNAMENT_WIN, // Refund
      {
        tournamentId: tournament._id,
        description: `Refund for leaving ${tournament.name}`
      }
    );

    tournament.prizePool -= tournament.entryFee;
  }

  tournament.participants.splice(participantIndex, 1);
  await tournament.save();

  return tournament;
}

/**
 * Start a tournament (generate brackets)
 */
export async function startTournament(tournamentId: string): Promise<ITournament> {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  if (tournament.status !== TournamentStatus.REGISTRATION) {
    throw new Error('Tournament has already started');
  }

  if (tournament.participants.length < tournament.minParticipants) {
    throw new Error(`Need at least ${tournament.minParticipants} participants`);
  }

  // Shuffle participants
  const shuffled = [...tournament.participants].sort(() => Math.random() - 0.5);

  // Generate bracket matches
  const matches: TournamentMatch[] = [];
  const numParticipants = shuffled.length;

  // Calculate bracket size (next power of 2)
  let bracketSize = 2;
  while (bracketSize < numParticipants) {
    bracketSize *= 2;
  }

  // Number of byes needed
  const numByes = bracketSize - numParticipants;

  // Generate first round matches
  let position = 0;
  let participantIndex = 0;
  let byesAssigned = 0;

  for (let i = 0; i < bracketSize / 2; i++) {
    const match: TournamentMatch = {
      matchId: uuidv4(),
      round: 1,
      position: position++,
      status: 'pending'
    };

    // Assign first player
    if (participantIndex < shuffled.length) {
      match.player1Id = shuffled[participantIndex].characterId;
      match.player1Name = shuffled[participantIndex].characterName;
      participantIndex++;
    }

    // Assign second player or bye
    if (byesAssigned < numByes) {
      // This player gets a bye
      match.status = 'bye';
      match.winnerId = match.player1Id;
      byesAssigned++;
    } else if (participantIndex < shuffled.length) {
      match.player2Id = shuffled[participantIndex].characterId;
      match.player2Name = shuffled[participantIndex].characterName;
      participantIndex++;
      match.status = 'ready';
    }

    matches.push(match);
  }

  // Generate subsequent round placeholder matches
  let matchesInRound = bracketSize / 4;
  for (let round = 2; round <= tournament.totalRounds; round++) {
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        matchId: uuidv4(),
        round,
        position: position++,
        status: 'pending'
      });
    }
    matchesInRound = matchesInRound / 2;
  }

  tournament.matches = matches;
  tournament.status = TournamentStatus.IN_PROGRESS;
  tournament.currentRound = 1;
  tournament.startedAt = new Date();

  await tournament.save();

  logger.info(`Tournament started: ${tournament.name} with ${numParticipants} participants`);

  return tournament;
}

/**
 * Get a player's current match in a tournament
 */
export async function getCurrentMatch(
  tournamentId: string,
  characterId: string
): Promise<TournamentMatch | null> {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament || tournament.status !== TournamentStatus.IN_PROGRESS) {
    return null;
  }

  // Find match in current round where player is assigned
  return tournament.matches.find(
    m =>
      m.round === tournament.currentRound &&
      (m.status === 'ready' || m.status === 'in_progress') &&
      (m.player1Id?.toString() === characterId ||
        m.player2Id?.toString() === characterId)
  ) || null;
}

/**
 * Start a tournament match game
 */
export async function startTournamentMatch(
  tournamentId: string,
  matchId: string
): Promise<TournamentGameState> {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  const match = tournament.matches.find(m => m.matchId === matchId);
  if (!match) {
    throw new Error('Match not found');
  }

  if (match.status !== 'ready') {
    throw new Error(`Match is not ready (status: ${match.status})`);
  }

  if (!match.player1Id || !match.player2Id) {
    throw new Error('Match players not assigned');
  }

  // Initialize game states
  const gameConfig = {
    gameType: 'pokerHoldDraw' as const,
    difficulty: 3,
    relevantSuit: undefined,
    timeLimit: 60
  };

  const player1State = initGame({
    ...gameConfig,
    playerId: match.player1Id.toString()
  });

  const player2State = initGame({
    ...gameConfig,
    playerId: match.player2Id.toString()
  });

  const gameState: TournamentGameState = {
    tournamentId,
    matchId,
    player1State,
    player2State,
    player1Resolved: false,
    player2Resolved: false
  };

  activeTournamentGames.set(matchId, gameState);

  // Update match status
  match.status = 'in_progress';
  match.gameId = matchId;
  await tournament.save();

  return gameState;
}

/**
 * Process player action in tournament match
 */
export async function processTournamentAction(
  matchId: string,
  characterId: string,
  action: PlayerAction
): Promise<{
  gameState: GameState;
  isResolved: boolean;
  matchComplete: boolean;
  result?: any;
}> {
  const gameState = activeTournamentGames.get(matchId);
  if (!gameState) {
    throw new Error('Tournament match game not found');
  }

  const isPlayer1 = gameState.player1State.playerId === characterId;
  const isPlayer2 = gameState.player2State.playerId === characterId;

  if (!isPlayer1 && !isPlayer2) {
    throw new Error('Not a participant in this match');
  }

  // Check if already resolved
  if (isPlayer1 && gameState.player1Resolved) {
    throw new Error('You have already completed your turn');
  }
  if (isPlayer2 && gameState.player2Resolved) {
    throw new Error('You have already completed your turn');
  }

  // Process action
  let state: GameState;
  if (isPlayer1) {
    state = processAction(gameState.player1State, action);
    gameState.player1State = state;
  } else {
    state = processAction(gameState.player2State, action);
    gameState.player2State = state;
  }

  // Check resolution
  const isResolved = state.status === 'resolved';
  if (isResolved) {
    const result = resolveGame(state);
    if (isPlayer1) {
      gameState.player1Resolved = true;
      gameState.player1Result = result;
    } else {
      gameState.player2Resolved = true;
      gameState.player2Result = result;
    }
  }

  // Check if match complete
  const matchComplete = gameState.player1Resolved && gameState.player2Resolved;

  if (matchComplete) {
    const result = await resolveTournamentMatch(matchId);
    return {
      gameState: state,
      isResolved,
      matchComplete: true,
      result
    };
  }

  return {
    gameState: state,
    isResolved,
    matchComplete: false
  };
}

/**
 * Resolve a tournament match and advance winner
 */
async function resolveTournamentMatch(matchId: string): Promise<{
  winnerId: string;
  winnerName: string;
  player1Score: number;
  player2Score: number;
}> {
  const gameState = activeTournamentGames.get(matchId);
  if (!gameState || !gameState.player1Result || !gameState.player2Result) {
    throw new Error('Match game not properly resolved');
  }

  const tournament = await Tournament.findById(gameState.tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  const match = tournament.matches.find(m => m.matchId === matchId);
  if (!match) {
    throw new Error('Match not found');
  }

  const player1Score = gameState.player1Result.score;
  const player2Score = gameState.player2Result.score;

  // Determine winner
  let winnerId: mongoose.Types.ObjectId;
  let winnerName: string;
  let loserId: mongoose.Types.ObjectId;

  if (player1Score >= player2Score) {
    winnerId = match.player1Id!;
    winnerName = match.player1Name!;
    loserId = match.player2Id!;
  } else {
    winnerId = match.player2Id!;
    winnerName = match.player2Name!;
    loserId = match.player1Id!;
  }

  // Update match
  match.winnerId = winnerId;
  match.player1Score = player1Score;
  match.player2Score = player2Score;
  match.player1Hand = gameState.player1Result.handName || 'Unknown';
  match.player2Hand = gameState.player2Result.handName || 'Unknown';
  match.status = 'completed';
  match.completedAt = new Date();

  // Mark loser as eliminated
  const loserParticipant = tournament.participants.find(
    p => p.characterId.toString() === loserId.toString()
  );
  if (loserParticipant) {
    loserParticipant.eliminated = true;
    loserParticipant.placement = tournament.participants.filter(p => !p.eliminated).length + 1;
  }

  // Advance winner to next round
  if (match.round < tournament.totalRounds) {
    const nextRoundMatches = tournament.matches.filter(m => m.round === match.round + 1);
    const nextMatchIndex = Math.floor(match.position / 2);
    const nextMatch = nextRoundMatches[nextMatchIndex];

    if (nextMatch) {
      const isTopBracket = match.position % 2 === 0;
      if (isTopBracket) {
        nextMatch.player1Id = winnerId;
        nextMatch.player1Name = winnerName;
      } else {
        nextMatch.player2Id = winnerId;
        nextMatch.player2Name = winnerName;
      }

      // Check if next match is ready
      if (nextMatch.player1Id && nextMatch.player2Id) {
        nextMatch.status = 'ready';
      }
    }
  }

  // Check if round is complete
  const currentRoundMatches = tournament.matches.filter(m => m.round === tournament.currentRound);
  const roundComplete = currentRoundMatches.every(
    m => m.status === 'completed' || m.status === 'bye'
  );

  if (roundComplete) {
    if (tournament.currentRound < tournament.totalRounds) {
      tournament.currentRound++;

      // Process byes for next round
      const nextRoundMatches = tournament.matches.filter(m => m.round === tournament.currentRound);
      for (const nextMatch of nextRoundMatches) {
        if (nextMatch.player1Id && !nextMatch.player2Id) {
          nextMatch.status = 'bye';
          nextMatch.winnerId = nextMatch.player1Id;
        } else if (!nextMatch.player1Id && nextMatch.player2Id) {
          nextMatch.status = 'bye';
          nextMatch.winnerId = nextMatch.player2Id;
        }
      }
    } else {
      // Tournament complete
      tournament.status = TournamentStatus.COMPLETED;
      tournament.winnerId = winnerId;
      tournament.winnerName = winnerName;
      tournament.completedAt = new Date();

      // Award prize pool
      if (tournament.prizePool > 0) {
        await GoldService.addGold(
          winnerId as any,
          tournament.prizePool,
          TransactionSource.TOURNAMENT_WIN,
          {
            tournamentId: tournament._id,
            tournamentName: tournament.name,
            description: `Won ${tournament.name}`
          }
        );
      }

      // Set winner placement
      const winnerParticipant = tournament.participants.find(
        p => p.characterId.toString() === winnerId.toString()
      );
      if (winnerParticipant) {
        winnerParticipant.placement = 1;
      }

      logger.info(`Tournament completed: ${tournament.name} - Winner: ${winnerName}`);
    }
  }

  await tournament.save();

  // Clean up game state
  activeTournamentGames.delete(matchId);

  return {
    winnerId: winnerId.toString(),
    winnerName,
    player1Score,
    player2Score
  };
}

/**
 * Get tournament bracket
 */
export async function getTournamentBracket(tournamentId: string): Promise<{
  tournament: ITournament;
  bracket: TournamentMatch[][];
}> {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  // Organize matches by round
  const bracket: TournamentMatch[][] = [];
  for (let round = 1; round <= tournament.totalRounds; round++) {
    bracket.push(
      tournament.matches
        .filter(m => m.round === round)
        .sort((a, b) => a.position - b.position)
    );
  }

  return { tournament, bracket };
}

/**
 * Get open tournaments
 */
export async function getOpenTournaments(): Promise<ITournament[]> {
  return Tournament.find({
    status: TournamentStatus.REGISTRATION,
    registrationEndsAt: { $gt: new Date() }
  }).sort({ registrationEndsAt: 1 });
}

/**
 * Get active tournaments
 */
export async function getActiveTournaments(): Promise<ITournament[]> {
  return Tournament.find({
    status: TournamentStatus.IN_PROGRESS
  }).sort({ startedAt: -1 });
}

/**
 * Get tournament history for a character
 */
export async function getTournamentHistory(
  characterId: string,
  limit: number = 10
): Promise<ITournament[]> {
  return Tournament.find({
    'participants.characterId': characterId,
    status: TournamentStatus.COMPLETED
  })
    .sort({ completedAt: -1 })
    .limit(limit);
}

export const TournamentService = {
  createTournament,
  joinTournament,
  leaveTournament,
  startTournament,
  getCurrentMatch,
  startTournamentMatch,
  processTournamentAction,
  getTournamentBracket,
  getOpenTournaments,
  getActiveTournaments,
  getTournamentHistory
};
