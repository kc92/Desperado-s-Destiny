/**
 * Poker Tournament Model
 * Tracks poker tournaments and their state
 */

import mongoose, { Schema, Document } from 'mongoose';
import type {
  PokerVariant,
  TournamentType,
  TournamentStatus,
  SeatingAlgorithm,
  BettingStructure,
  BlindLevel,
  PrizeStructure,
  TournamentPlayer,
  PokerTable
} from '@desperados/shared';

export interface IPokerTournament extends Document {
  name: string;
  description: string;
  variant: PokerVariant;
  tournamentType: TournamentType;
  bettingStructure: BettingStructure;

  // Entry
  buyIn: number;
  entryFee: number;
  rebuysAllowed: boolean;
  rebuyPeriod?: number;
  rebuyCost?: number;
  addOnsAllowed: boolean;
  addOnCost?: number;
  addOnChips?: number;

  // Structure
  startingChips: number;
  blindLevels: BlindLevel[];
  currentBlindLevel: number;
  blindDuration: number;
  nextBlindIncrease?: Date;
  blindScheduleId: string;
  prizeStructureId: string;

  // Players
  minPlayers: number;
  maxPlayers: number;
  registeredPlayers: TournamentPlayer[];
  eliminatedPlayers: number;

  // Timing
  registrationOpens: Date;
  registrationCloses: Date;
  scheduledStart: Date;
  lateRegistrationMinutes: number;
  lateRegistrationEnds?: Date;
  status: TournamentStatus;
  startedAt?: Date;
  completedAt?: Date;

  // Tables
  tables: PokerTable[];
  seatingAlgorithm: SeatingAlgorithm;
  playersPerTable: number;

  // Prizes
  prizePool: number;
  guaranteedPrizePool?: number;
  prizeStructure: PrizeStructure[];

  // Special Features
  bountyTournament: boolean;
  bountyAmount?: number;
  shootout: boolean;
  turbo: boolean;
  hyperTurbo: boolean;

  // Championship features
  isChampionship: boolean;
  championshipTier?: 'monthly' | 'quarterly' | 'annual';
  minLevelRequired?: number;

  // Location
  locationId: string;
  locationName: string;

  // Winner
  winnerId?: mongoose.Types.ObjectId;
  winnerName?: string;

  createdAt: Date;
  updatedAt: Date;
}

const BlindLevelSchema = new Schema<BlindLevel>(
  {
    level: { type: Number, required: true },
    smallBlind: { type: Number, required: true },
    bigBlind: { type: Number, required: true },
    ante: { type: Number },
    duration: { type: Number, required: true }
  },
  { _id: false }
);

const PrizeStructureSchema = new Schema<PrizeStructure>(
  {
    placement: { type: Number, required: true },
    percentage: { type: Number, required: true },
    guaranteed: { type: Number },
    title: { type: String },
    item: { type: String }
  },
  { _id: false }
);

const TournamentPlayerSchema = new Schema<TournamentPlayer>(
  {
    characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    characterName: { type: String, required: true },
    tableId: { type: String },
    seatNumber: { type: Number },
    chips: { type: Number, required: true },
    isEliminated: { type: Boolean, default: false },
    eliminatedAt: { type: Date },
    placement: { type: Number },
    bountyValue: { type: Number },
    bountiesCollected: { type: Number, default: 0 }
  },
  { _id: false }
);

// Simplified PokerTable schema (full logic in service)
const PokerTableSchema = new Schema(
  {
    tableId: { type: String, required: true },
    tableName: { type: String, required: true },
    maxSeats: { type: Number, required: true },
    players: [
      {
        characterId: { type: String, required: true },
        characterName: { type: String, required: true },
        seatNumber: { type: Number, required: true },
        chips: { type: Number, required: true },
        holeCards: [{ suit: String, rank: String }],
        currentBet: { type: Number, default: 0 },
        folded: { type: Boolean, default: false },
        allIn: { type: Boolean, default: false },
        lastAction: { type: String },
        isActive: { type: Boolean, default: true }
      }
    ],
    dealerPosition: { type: Number, default: 0 },
    smallBlindPosition: { type: Number, default: 0 },
    bigBlindPosition: { type: Number, default: 0 },
    currentPlayerPosition: { type: Number, default: 0 },
    pot: { type: Number, default: 0 },
    sidePots: [
      {
        amount: { type: Number },
        eligiblePlayers: [{ type: String }]
      }
    ],
    communityCards: [{ suit: String, rank: String }],
    deck: [{ suit: String, rank: String }],
    currentRound: {
      type: String,
      enum: ['preflop', 'flop', 'turn', 'river', 'showdown'],
      default: 'preflop'
    },
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const PokerTournamentSchema = new Schema<IPokerTournament>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    variant: {
      type: String,
      required: true,
      enum: ['texas_holdem', 'five_card_draw', 'seven_card_stud']
    },
    tournamentType: {
      type: String,
      required: true,
      enum: ['sit_n_go', 'scheduled', 'multi_table', 'satellite', 'championship']
    },
    bettingStructure: {
      type: String,
      required: true,
      enum: ['no_limit', 'pot_limit', 'fixed_limit']
    },

    // Entry
    buyIn: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },
    rebuysAllowed: { type: Boolean, default: false },
    rebuyPeriod: { type: Number },
    rebuyCost: { type: Number },
    addOnsAllowed: { type: Boolean, default: false },
    addOnCost: { type: Number },
    addOnChips: { type: Number },

    // Structure
    startingChips: { type: Number, required: true },
    blindLevels: [BlindLevelSchema],
    currentBlindLevel: { type: Number, default: 0 },
    blindDuration: { type: Number, required: true },
    nextBlindIncrease: { type: Date },
    blindScheduleId: { type: String, default: 'standard' },
    prizeStructureId: { type: String, default: 'medium' },

    // Players
    minPlayers: { type: Number, required: true },
    maxPlayers: { type: Number, required: true },
    registeredPlayers: [TournamentPlayerSchema],
    eliminatedPlayers: { type: Number, default: 0 },

    // Timing
    registrationOpens: { type: Date, required: true },
    registrationCloses: { type: Date, required: true },
    scheduledStart: { type: Date, required: true },
    lateRegistrationMinutes: { type: Number, default: 0 },
    lateRegistrationEnds: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ['registration', 'late_registration', 'in_progress', 'final_table', 'completed', 'cancelled'],
      default: 'registration'
    },
    startedAt: { type: Date },
    completedAt: { type: Date },

    // Tables
    tables: [PokerTableSchema],
    seatingAlgorithm: {
      type: String,
      enum: ['random', 'balanced', 'seeded'],
      default: 'random'
    },
    playersPerTable: { type: Number, default: 9 },

    // Prizes
    prizePool: { type: Number, default: 0 },
    guaranteedPrizePool: { type: Number },
    prizeStructure: [PrizeStructureSchema],

    // Special Features
    bountyTournament: { type: Boolean, default: false },
    bountyAmount: { type: Number },
    shootout: { type: Boolean, default: false },
    turbo: { type: Boolean, default: false },
    hyperTurbo: { type: Boolean, default: false },

    // Championship features
    isChampionship: { type: Boolean, default: false },
    championshipTier: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual']
    },
    minLevelRequired: { type: Number },

    // Location
    locationId: { type: String, required: true },
    locationName: { type: String, required: true },

    // Winner
    winnerId: { type: Schema.Types.ObjectId, ref: 'Character' },
    winnerName: { type: String }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
PokerTournamentSchema.index({ status: 1, scheduledStart: 1 });
PokerTournamentSchema.index({ tournamentType: 1, status: 1 });
PokerTournamentSchema.index({ variant: 1, status: 1 });
PokerTournamentSchema.index({ buyIn: 1, status: 1 });
PokerTournamentSchema.index({ 'registeredPlayers.characterId': 1 });
PokerTournamentSchema.index({ locationId: 1, status: 1 });
PokerTournamentSchema.index({ registrationOpens: 1, registrationCloses: 1 });

export const PokerTournament = mongoose.model<IPokerTournament>(
  'PokerTournament',
  PokerTournamentSchema
);
