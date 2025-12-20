/**
 * Tournament Manager Service
 * Manages poker tournament lifecycle and operations
 */

import mongoose from 'mongoose';
import type { PokerTournament, TournamentPlayer, PokerTable } from '@desperados/shared';
import { PokerTournament as PokerTournamentModel } from '../models/PokerTournament.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { PokerService } from './poker.service';
import {
  getTournamentTemplate,
  calculatePrizePool,
  calculatePrizeDistribution
} from '../data/pokerTournaments';
import { getBlindStructure, getNextBlindIncreaseTime } from '../data/blindStructures';
import { SecureRNG } from './base/SecureRNG';
import { withLock } from '../utils/distributedLock';

/**
 * Create tournament from template
 */
export async function createTournamentFromTemplate(
  templateId: string,
  scheduledStart: Date,
  locationId: string,
  locationName: string
): Promise<PokerTournament> {
  const template = getTournamentTemplate(templateId);

  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const blindStructure = getBlindStructure(template.blindScheduleId);

  // Calculate registration times
  const registrationOpens = new Date(scheduledStart.getTime() - 60 * 60 * 1000); // 1 hour before
  const registrationCloses = scheduledStart;

  const tournament = await PokerTournamentModel.create({
    name: template.name,
    description: template.description,
    variant: template.variant,
    tournamentType: template.tournamentType,
    bettingStructure: template.bettingStructure,

    buyIn: template.buyIn,
    entryFee: template.entryFee,
    rebuysAllowed: template.specialFeatures.rebuys || false,
    rebuyPeriod: template.specialFeatures.rebuys ? 60 : undefined,
    rebuyCost: template.specialFeatures.rebuys ? template.buyIn : undefined,
    addOnsAllowed: template.specialFeatures.addOns || false,
    addOnCost: template.specialFeatures.addOns ? template.buyIn / 2 : undefined,
    addOnChips: template.specialFeatures.addOns ? template.startingChips : undefined,

    startingChips: template.startingChips,
    blindLevels: blindStructure,
    currentBlindLevel: 0,
    blindDuration: blindStructure[0].duration,

    minPlayers: template.minPlayers,
    maxPlayers: template.maxPlayers,
    registeredPlayers: [],
    eliminatedPlayers: 0,

    registrationOpens,
    registrationCloses,
    scheduledStart,
    lateRegistrationMinutes: 30,
    status: 'registration',

    tables: [],
    seatingAlgorithm: 'random',
    playersPerTable: 9,

    prizePool: 0,
    prizeStructure: [],

    bountyTournament: template.specialFeatures.bounty || false,
    bountyAmount: template.specialFeatures.bounty ? template.buyIn / 4 : undefined,
    shootout: false,
    turbo: template.specialFeatures.turbo || false,
    hyperTurbo: false,

    isChampionship: template.tournamentType === 'championship',
    locationId,
    locationName
  });

  return tournament.toObject() as unknown as PokerTournament;
}

/**
 * Register player for tournament
 */
export async function registerPlayer(
  tournamentId: string,
  characterId: string
): Promise<PokerTournament> {
  return withLock(`lock:tournament:${tournamentId}`, async () => {
    const tournament = await PokerTournamentModel.findById(tournamentId);

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== 'registration' && tournament.status !== 'late_registration') {
      throw new Error('Registration is closed');
    }

    const character = await Character.findById(characterId);

    if (!character) {
      throw new Error('Character not found');
    }

    // Check if already registered
    if (tournament.registeredPlayers.some(p => p.characterId.toString() === characterId)) {
      throw new Error('Already registered for this tournament');
    }

    // Check if tournament is full
    if (tournament.registeredPlayers.length >= tournament.maxPlayers) {
      throw new Error('Tournament is full');
    }

    // Check level requirement
    if (tournament.minLevelRequired && character.level < tournament.minLevelRequired) {
      throw new Error(`Minimum level ${tournament.minLevelRequired} required`);
    }

    // Check dollars
    const totalCost = tournament.buyIn + tournament.entryFee;
    if (!character.hasDollars(totalCost)) {
      throw new Error('Insufficient dollars');
    }

    // Deduct buy-in
    await character.deductDollars(
      totalCost,
      TransactionSource.POKER_TOURNAMENT,
      { tournamentId: tournament._id.toString(), tournamentName: tournament.name }
    );
    await character.save();

    // Add to registered players
    const player: TournamentPlayer = {
      characterId: new mongoose.Types.ObjectId(characterId) as any,
      characterName: character.name,
      chips: tournament.startingChips,
      isEliminated: false
    };

    tournament.registeredPlayers.push(player);

    // Update prize pool
    tournament.prizePool += tournament.buyIn;

    await tournament.save();

    return tournament.toObject() as unknown as PokerTournament;
  }, { ttl: 30, retries: 3 });
}

/**
 * Start tournament
 */
export async function startTournament(tournamentId: string): Promise<PokerTournament> {
  const tournament = await PokerTournamentModel.findById(tournamentId);

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  if (tournament.status !== 'registration') {
    throw new Error('Tournament already started or completed');
  }

  if (tournament.registeredPlayers.length < tournament.minPlayers) {
    throw new Error(`Minimum ${tournament.minPlayers} players required`);
  }

  // Update status
  tournament.status = 'in_progress';
  tournament.startedAt = new Date();

  // Set late registration end time
  if (tournament.lateRegistrationMinutes > 0) {
    tournament.lateRegistrationEnds = new Date(
      Date.now() + tournament.lateRegistrationMinutes * 60 * 1000
    );
    tournament.status = 'late_registration';
  }

  // Calculate next blind increase
  tournament.nextBlindIncrease = getNextBlindIncreaseTime(
    'standard', // TODO: Get from template
    tournament.startedAt,
    tournament.currentBlindLevel
  );

  // Create tables and seat players
  const tables = createTables(tournament);
  tournament.tables = tables as any;

  await tournament.save();

  return tournament.toObject() as unknown as PokerTournament;
}

/**
 * Create tables and seat players
 */
function createTables(tournament: any): PokerTable[] {
  const tables: PokerTable[] = [];
  const playersPerTable = tournament.playersPerTable;
  const playerCount = tournament.registeredPlayers.length;
  const tableCount = Math.ceil(playerCount / playersPerTable);

  // Create tables
  for (let i = 0; i < tableCount; i++) {
    const table = PokerService.createTable(
      `${tournament._id}-table-${i + 1}`,
      `Table ${i + 1}`,
      playersPerTable
    );
    tables.push(table);
  }

  // Shuffle players for random seating
  const shuffledPlayers = SecureRNG.shuffle([...tournament.registeredPlayers]);

  // Seat players
  let tableIndex = 0;
  let seatNumber = 0;

  for (const player of shuffledPlayers) {
    const table = tables[tableIndex];

    PokerService.seatPlayer(
      table,
      player.characterId.toString(),
      player.characterName,
      player.chips,
      seatNumber
    );

    // Update player's table assignment
    player.tableId = table.tableId;
    player.seatNumber = seatNumber;

    seatNumber++;
    if (seatNumber >= playersPerTable) {
      seatNumber = 0;
      tableIndex++;
    }
  }

  return tables;
}

/**
 * Eliminate player from tournament
 */
export async function eliminatePlayer(
  tournamentId: string,
  characterId: string,
  eliminatedBy?: string
): Promise<void> {
  const tournament = await PokerTournamentModel.findById(tournamentId);

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  const player = tournament.registeredPlayers.find(
    p => p.characterId.toString() === characterId
  );

  if (!player) {
    throw new Error('Player not found in tournament');
  }

  if (player.isEliminated) {
    return; // Already eliminated
  }

  player.isEliminated = true;
  player.eliminatedAt = new Date();
  player.placement = tournament.registeredPlayers.filter(p => p.isEliminated).length;

  tournament.eliminatedPlayers++;

  // Handle bounty
  if (tournament.bountyTournament && eliminatedBy && tournament.bountyAmount) {
    const eliminator = tournament.registeredPlayers.find(
      p => p.characterId.toString() === eliminatedBy
    );

    if (eliminator) {
      eliminator.bountiesCollected = (eliminator.bountiesCollected || 0) + 1;

      // Award bounty
      const character = await Character.findById(eliminatedBy);
      if (character) {
        await character.addDollars(
          tournament.bountyAmount,
          TransactionSource.POKER_BOUNTY,
          { tournamentId: tournament._id.toString(), victimId: characterId }
        );
        await character.save();
      }
    }
  }

  await tournament.save();

  // Check if tournament is complete
  await checkTournamentComplete(tournamentId);
}

/**
 * Check if tournament is complete
 */
async function checkTournamentComplete(tournamentId: string): Promise<void> {
  const tournament = await PokerTournamentModel.findById(tournamentId);

  if (!tournament) {
    return;
  }

  const remainingPlayers = tournament.registeredPlayers.filter(p => !p.isEliminated);

  if (remainingPlayers.length === 1) {
    // Tournament complete!
    tournament.status = 'completed';
    tournament.completedAt = new Date();
    tournament.winnerId = remainingPlayers[0].characterId as any;
    tournament.winnerName = remainingPlayers[0].characterName;

    // Award prizes
    await awardPrizes(tournament);

    await tournament.save();
  } else if (remainingPlayers.length <= 9 && tournament.status !== 'final_table') {
    // Final table
    tournament.status = 'final_table';
    await tournament.save();
  }
}

/**
 * Award tournament prizes
 */
async function awardPrizes(tournament: any): Promise<void> {
  const prizeDistribution = calculatePrizeDistribution(
    tournament.prizePool,
    'championship' // TODO: Get from template
  );

  for (const [placement, amount] of prizeDistribution) {
    const player = tournament.registeredPlayers.find((p: any) => p.placement === placement);

    if (player) {
      const character = await Character.findById(player.characterId);

      if (character) {
        await character.addDollars(
          amount,
          TransactionSource.POKER_PRIZE,
          {
            tournamentId: tournament._id.toString(),
            tournamentName: tournament.name,
            placement
          }
        );
        await character.save();
      }
    }
  }
}

/**
 * Increase blind level
 */
export async function increaseBlindLevel(tournamentId: string): Promise<void> {
  const tournament = await PokerTournamentModel.findById(tournamentId);

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  if (tournament.currentBlindLevel >= tournament.blindLevels.length - 1) {
    return; // Already at max level
  }

  tournament.currentBlindLevel++;

  // Set next blind increase time
  if (tournament.startedAt) {
    tournament.nextBlindIncrease = getNextBlindIncreaseTime(
      'standard', // TODO: Get from template
      tournament.startedAt,
      tournament.currentBlindLevel
    );
  }

  await tournament.save();
}

/**
 * Get active tournaments
 */
export async function getActiveTournaments(filters?: {
  variant?: string;
  tournamentType?: string;
  minBuyIn?: number;
  maxBuyIn?: number;
}): Promise<PokerTournament[]> {
  const query: any = {
    status: { $in: ['registration', 'late_registration', 'in_progress'] }
  };

  if (filters?.variant) {
    query.variant = filters.variant;
  }

  if (filters?.tournamentType) {
    query.tournamentType = filters.tournamentType;
  }

  if (filters?.minBuyIn !== undefined) {
    query.buyIn = { ...query.buyIn, $gte: filters.minBuyIn };
  }

  if (filters?.maxBuyIn !== undefined) {
    query.buyIn = { ...query.buyIn, $lte: filters.maxBuyIn };
  }

  const tournaments = await PokerTournamentModel.find(query)
    .sort({ scheduledStart: 1 })
    .limit(50);

  return tournaments.map(t => t.toObject() as unknown as PokerTournament);
}

/**
 * Get player's tournaments
 */
export async function getPlayerTournaments(characterId: string): Promise<PokerTournament[]> {
  const tournaments = await PokerTournamentModel.find({
    'registeredPlayers.characterId': characterId
  })
    .sort({ scheduledStart: -1 })
    .limit(50);

  return tournaments.map(t => t.toObject() as unknown as PokerTournament);
}

export const TournamentManagerService = {
  createTournamentFromTemplate,
  registerPlayer,
  startTournament,
  eliminatePlayer,
  increaseBlindLevel,
  getActiveTournaments,
  getPlayerTournaments
};
