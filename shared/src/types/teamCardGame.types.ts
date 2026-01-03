/**
 * Team Card Game Types - Hard Raid Expansion
 *
 * Types for team-based trick-taking card games (Euchre, Spades, Hearts, Bridge, Pinochle)
 * Used as "Hard Raid" end-game content with boss mechanics
 */

import { Card, Suit, Rank } from './destinyDeck.types';

// Re-export with Card prefix for consistency in services
export { Suit as CardSuit, Rank as CardRank };

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Supported team card game types
 */
export enum TeamCardGameType {
  EUCHRE = 'euchre',
  SPADES = 'spades',
  HEARTS = 'hearts',
  BRIDGE = 'bridge',
  PINOCHLE = 'pinochle'
}

/**
 * Game phase progression
 */
export enum TeamCardGamePhase {
  WAITING = 'waiting',           // Waiting for players to join
  READY_CHECK = 'ready_check',   // All players confirm ready
  DEALING = 'dealing',           // Cards being dealt
  BIDDING = 'bidding',           // Trump/contract bidding phase
  MELDING = 'melding',           // Pinochle meld declaration phase
  TRUMP_SELECTION = 'trump_selection', // Euchre: dealer picks up or calls
  PLAYING = 'playing',           // Trick-taking in progress
  TRICK_RESOLVE = 'trick_resolve', // Determining trick winner
  ROUND_SCORING = 'round_scoring', // Scoring completed round
  BOSS_PHASE = 'boss_phase',     // Boss mechanic activation
  GAME_COMPLETE = 'complete'     // Game finished
}

/**
 * NPC partner difficulty levels
 */
export enum NPCDifficulty {
  EASY = 'easy',       // 60% optimal play
  MEDIUM = 'medium',   // 75% optimal play
  HARD = 'hard',       // 90% optimal play
  EXPERT = 'expert'    // 98% optimal play
}

/**
 * Raid boss difficulty tiers
 */
export enum RaidDifficulty {
  HARD = 'hard',
  VERY_HARD = 'very_hard',
  NIGHTMARE = 'nightmare'
}

/**
 * Boss mechanic categories
 */
export enum BossMechanicType {
  // Generic categories
  CARD_MANIPULATION = 'card_manipulation',   // Affects cards directly
  TRICK_MODIFIER = 'trick_modifier',         // Changes trick rules
  TEAM_DEBUFF = 'team_debuff',               // Weakens player team
  HAND_CURSE = 'hand_curse',                 // Corrupts dealt hands
  SCORE_MODIFIER = 'score_modifier',         // Changes point values
  TIME_PRESSURE = 'time_pressure',           // Reduces turn time
  INFORMATION = 'information',               // Reveals hidden info

  // Specific boss mechanics
  MARKED_DECK = 'marked_deck',               // Boss can see player cards
  COLD_DECK = 'cold_deck',                   // Pre-arranged bad cards
  CURSED_HAND = 'cursed_hand',               // Random card corruption
  FORCED_LEAD = 'forced_lead',               // Must lead specific suit
  HAND_CORRUPTION = 'hand_corruption',       // Cards become random
  TRUMP_OVERRIDE = 'trump_override',         // Boss can change trump
  DOUBLE_OR_NOTHING = 'double_or_nothing'    // Double stakes
}

/**
 * Mechanic duration
 */
export enum MechanicDuration {
  TRICK = 'trick',     // Lasts one trick
  ROUND = 'round',     // Lasts entire round
  GAME = 'game'        // Permanent for rest of game
}

// =============================================================================
// CARD TYPES (Extended for trick-taking)
// =============================================================================

/**
 * Extended card with trick-taking context
 */
export interface TrickCard extends Card {
  /** Original position in hand before play */
  originalIndex?: number;
  /** Whether this is a bower (Euchre) */
  isBower?: boolean;
  /** Bower type if applicable */
  bowerType?: 'right' | 'left';
}

/**
 * A card played to the current trick
 */
export interface PlayedCard {
  card: TrickCard;
  playerIndex: number;
  timestamp: number;
}

/**
 * Result of a completed trick
 */
export interface TrickResult {
  trickNumber: number;
  cards: PlayedCard[];
  winnerIndex: number;
  winnerId?: string;       // Character ID of winner
  winnerName?: string;
  winnerTeam?: 0 | 1;      // Alias for winningTeam
  winningCard?: TrickCard;
  winningTeam?: 0 | 1;
  pointsWorth?: number;    // For Hearts (each heart = 1, QS = 13)
  points?: number;         // Generic points for bid-based games
}

// =============================================================================
// BIDDING TYPES
// =============================================================================

/**
 * Generic bid for trick-taking games
 */
export interface Bid {
  playerIndex: number;
  value: number | string;  // Number for spades/bridge, string for special bids
  suit?: Suit;             // Trump suit for bridge/pinochle
  isPass?: boolean;
  isDouble?: boolean;      // Bridge doubling
  isRedouble?: boolean;
}

/**
 * Euchre-specific trump calling
 */
export interface EuchreTrumpCall {
  playerIndex: number;
  action: 'pass' | 'order_up' | 'pick_up' | 'call';
  suit?: Suit;
  goingAlone: boolean;
}

/**
 * Spades bid with nil options
 */
export interface SpadesBid {
  playerIndex: number;
  tricks: number;        // 0-13
  isNil: boolean;
  isBlindNil: boolean;
}

/**
 * Bridge contract
 */
export interface BridgeContract {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  strain: Suit | 'NT';   // Trump suit or No Trump
  declarer: number;
  isDoubled: boolean;
  isRedoubled: boolean;
}

/**
 * Pinochle meld set
 */
export interface PinochleMeld {
  type: PinochleMeldType;
  cards: Card[];
  points: number;
}

export enum PinochleMeldType {
  // Marriages & Runs
  MARRIAGE = 'marriage',           // K+Q same suit (2pts, 4pts in trump)
  FAMILY = 'family',               // A+10+K+Q+J in trump (15pts)

  // Around sets
  ACES_AROUND = 'aces_around',     // Ace each suit (10pts)
  KINGS_AROUND = 'kings_around',   // King each suit (8pts)
  QUEENS_AROUND = 'queens_around', // Queen each suit (6pts)
  JACKS_AROUND = 'jacks_around',   // Jack each suit (4pts)

  // Special
  PINOCHLE = 'pinochle',           // J diamonds + Q spades (4pts)
  DOUBLE_PINOCHLE = 'double_pinochle', // Both (30pts)

  // Runs
  RUN = 'run',                     // A+10+K+Q+J in trump (15pts)
  DOUBLE_RUN = 'double_run'        // Two runs in trump (150pts)
}

// =============================================================================
// PLAYER TYPES
// =============================================================================

/**
 * Player in a team card game session
 */
export interface TeamCardPlayer {
  characterId: string;
  characterName: string;
  isNPC: boolean;
  npcDifficulty?: NPCDifficulty;

  /** Team assignment (0 or 1) */
  teamIndex: 0 | 1;
  /** Seat position (0-3, clockwise from dealer) */
  seatIndex: 0 | 1 | 2 | 3;

  /** Current hand */
  hand: TrickCard[];
  /** Submitted bid */
  bid?: Bid | SpadesBid | EuchreTrumpCall;
  /** Declared melds (Pinochle) */
  melds?: PinochleMeld[];
  /** Tricks won this round */
  tricksWonRound: number;
  /** Total tricks won all rounds */
  tricksWonTotal: number;

  /** Connection state */
  isConnected: boolean;
  socketId?: string;
  lastActionAt: number;
  isReady: boolean;

  /** Skills affecting gameplay */
  gamblingSkill: number;
  duelInstinctSkill: number;
  deceptionSkill: number;
  sleightOfHandSkill: number;

  /** Contribution tracking for rewards */
  contributionScore: number;
  mechanicsCountered: number;
  perfectTricks: number;      // Tricks won that prevented loss
  clutchPlays: number;        // Critical plays at key moments
}

/**
 * What a player can see of their partner
 */
export interface PartnerVisibleState {
  characterId: string;
  characterName: string;
  isNPC: boolean;
  cardCount: number;
  tricksWonRound: number;
  bid?: Bid | SpadesBid;
  isConnected: boolean;
  /** Skill-based hints about partner's hand */
  handQualityHint?: 'weak' | 'moderate' | 'strong';
}

/**
 * What a player can see of opponents
 */
export interface OpponentTeamVisibleState {
  players: Array<{
    characterId: string;
    characterName: string;
    isNPC: boolean;
    cardCount: number;
    tricksWonRound: number;
    bid?: Bid | SpadesBid;
    isConnected: boolean;
  }>;
  teamTricksWon: number;
  teamScore: number;
}

// =============================================================================
// BOSS & RAID TYPES
// =============================================================================

/**
 * Raid boss definition
 */
export interface RaidBoss {
  id: string;
  name: string;
  title: string;
  description: string;
  lore: string;
  difficulty: RaidDifficulty;

  /** Base health for damage calculation */
  health: number;

  /** Which games this boss appears in */
  gameTypes: TeamCardGameType[];

  /** Minimum combined team gambling skill */
  minimumGamblingSkill: number;

  /** Boss phases with mechanics */
  phases: TeamCardBossPhase[];

  /** Rewards for defeating */
  rewards: RaidRewards;

  /** Location where boss can be challenged */
  locationId: string;
}

/**
 * Boss phase with health threshold and mechanics
 */
export interface TeamCardBossPhase {
  /** Health percentage to trigger (100, 75, 50, 25) */
  healthThreshold: number;
  name: string;
  description: string;
  mechanics: BossMechanic[];
}

/**
 * A boss mechanic that affects gameplay
 */
export interface BossMechanic {
  id: string;
  name: string;
  description: string;
  type: BossMechanicType;
  duration: MechanicDuration;

  /** The effect applied */
  effect: MechanicEffect;

  /** How to counter this mechanic */
  counterplay?: CounterplayOption;

  /** Visual/audio cues */
  announcement?: string;
  iconId?: string;
}

/**
 * Effect of a boss mechanic
 */
export interface MechanicEffect {
  // Card manipulation
  revealRandomCard?: boolean;        // Boss sees a random card per player
  swapCards?: boolean;               // Swap cards between opponents
  corruptCard?: boolean;             // Replace card with random
  manipulateKitty?: boolean;         // Euchre: boss controls kitty

  // Trick modifiers
  randomTrumpPerTrick?: boolean;     // Trump changes each trick
  forceSuitLead?: Suit;              // Must lead this suit
  invertTrickWinner?: boolean;       // Lowest card wins

  // Score modifiers
  scoreMultiplier?: number;          // Multiply round score
  pointPenalty?: number;             // Flat point penalty

  // Time pressure
  turnTimeOverride?: number;         // Override turn timer (seconds)

  // Team debuffs
  targetLowestSkill?: boolean;       // Effect targets weakest player
  disableSkillBonus?: boolean;       // No skill bonuses this phase

  // Hearts specific
  queenSpadesPenalty?: number;       // Change QS point value

  // Information
  revealPartnerHand?: boolean;       // Partner hand visible to boss
}

/**
 * How players can counter a boss mechanic
 */
export interface CounterplayOption {
  /** Skill required to counter */
  skill?: 'gambling' | 'duel_instinct' | 'deception' | 'sleight_of_hand';
  /** Minimum skill level needed */
  threshold?: number;
  /** Whether team can pool skill levels */
  teamwork?: boolean;
  /** Number of cards players can share */
  shareCards?: number;
  /** Result of successful counter */
  effect: 'negate' | 'reverse' | 'reduce';
}

/**
 * Rewards for completing a raid
 */
export interface RaidRewards {
  goldBase: number;
  experienceBase: number;
  lootTable: string;
  uniqueReward?: string;  // Unique cosmetic/item ID
  skillXP?: {
    gambling?: number;
    duel_instinct?: number;
  };
}

// =============================================================================
// SESSION STATE TYPES
// =============================================================================

/**
 * Complete team card game session state
 */
export interface TeamCardGameSession {
  sessionId: string;
  gameType: TeamCardGameType;

  /** Raid mode configuration */
  raidMode: boolean;
  raidBossId?: string;

  /** Players (4 slots: 0&2 are team 0, 1&3 are team 1) */
  players: TeamCardPlayer[];

  /** Current game phase */
  phase: TeamCardGamePhase;

  /** Round tracking */
  currentRound: number;
  maxRounds: number;        // Hearts: until 100pts, others: configurable
  tricksPerRound: number;   // 5 for Euchre, 13 for others

  /** Dealer and turn tracking */
  dealer: number;           // Player index 0-3
  currentPlayer: number;    // Whose turn

  /** Trump/Contract state */
  trump?: Suit;
  contract?: BridgeContract;
  declarer?: number;        // Bridge: who plays both hands
  dummy?: number;           // Bridge: declarer's partner (visible hand)

  /** Euchre specific */
  kitty?: TrickCard[];      // 4 cards left after dealing
  upCard?: TrickCard;       // Top of kitty, offered for trump
  maker?: number;           // Who called trump
  goingAlone?: boolean;     // Maker's partner sits out

  /** Current trick */
  currentTrick: PlayedCard[];
  trickNumber: number;
  /** Tricks won this round [team0, team1] */
  tricksWon: [number, number];
  /** Trick history for current round */
  trickHistory: TrickResult[];

  /** Hearts specific */
  heartsBroken?: boolean;
  pointsTaken?: [number, number, number, number];  // Per-player

  /** Spades specific */
  bags?: [number, number];  // Overtrick count per team

  /** Scoring */
  teamScores: [number, number];
  roundScores: TeamCardRoundScore[];

  /** Boss raid state */
  bossHealth?: number;
  bossMaxHealth?: number;
  bossPhase?: number;
  activeBossMechanics: BossMechanic[];

  /** Timing */
  turnTimeLimit: number;
  turnStartedAt: number;
  createdAt: number;
  expiresAt: Date;

  /** Location where game is being played */
  locationId?: string;
}

/**
 * Score for a completed round
 */
export interface TeamCardRoundScore {
  roundNumber: number;

  /** Team scores this round */
  team0Score: number;
  team1Score: number;

  /** Tricks won */
  tricksWon: [number, number];

  /** Round wins (for tracking) */
  team0RoundWins?: number;
  team1RoundWins?: number;

  /** Bids made vs achieved (Spades/Bridge) */
  bidsTeam0?: number;
  bidsTeam1?: number;
  bidsMadeTeam0?: number;
  bidsMadeTeam1?: number;

  /** Special outcomes */
  outcome?: RoundOutcome;

  /** Boss damage dealt */
  bossDamageDealt?: number;

  /** Game-specific details (melds, bids, etc.) */
  details?: Record<string, unknown>;
}

export type RoundOutcome =
  | 'made'           // Euchre: makers got 3-4
  | 'march'          // Euchre: makers got all 5
  | 'alone_march'    // Euchre: alone got all 5
  | 'euchre'         // Euchre: defenders stopped makers
  | 'set'            // Spades: team didn't make bid
  | 'nil_made'       // Spades: nil bid succeeded
  | 'nil_broken'     // Spades: nil bid failed
  | 'slam'           // Bridge: won all tricks
  | 'shoot_moon'     // Hearts: one player took all points
  | 'normal';        // Standard round completion

// =============================================================================
// CLIENT STATE TYPES
// =============================================================================

/**
 * Game state as seen by a specific player
 */
export interface TeamCardGameClientState {
  sessionId: string;
  gameType: TeamCardGameType;
  raidMode: boolean;

  /** My player state */
  me: TeamCardPlayer;

  /** My partner's visible state */
  partner: PartnerVisibleState;

  /** Opponent team state */
  opponents: OpponentTeamVisibleState;

  /** Game phase */
  phase: TeamCardGamePhase;
  currentRound: number;

  /** Turn info */
  isMyTurn: boolean;
  currentPlayerName: string;
  turnTimeRemaining: number;

  /** Trump/Contract */
  trump?: Suit;
  contract?: BridgeContract;

  /** Current trick */
  currentTrick: PlayedCard[];
  trickNumber: number;
  tricksWon: [number, number];

  /** Playable cards (highlighted in UI) */
  playableCardIndices: number[];

  /** Scores */
  teamScores: [number, number];

  /** Boss state */
  bossName?: string;
  bossHealth?: number;
  bossMaxHealth?: number;
  bossPhase?: number;
  activeMechanics: Array<{
    id: string;
    name: string;
    description: string;
    canCounter: boolean;
    counterSkill?: string;
    counterThreshold?: number;
  }>;

  /** Available actions */
  availableActions: string[];

  /** Skill-based hints */
  hints: GameHint[];
}

/**
 * Skill-based gameplay hints
 */
export interface GameHint {
  type: 'hand_strength' | 'suggested_play' | 'partner_quality' | 'opponent_confidence' | 'bid_suggestion' | 'boss_warning';
  message: string;
  confidence: number;  // 0-100
  suggestedCardIndex?: number;
  suggestedBid?: number;
}

// =============================================================================
// SOCKET EVENTS - CLIENT TO SERVER
// =============================================================================

export interface TeamCardGameClientEvents {
  'teamCard:join_lobby': { gameType: TeamCardGameType; raidBossId?: string };
  'teamCard:create_session': CreateSessionPayload;
  'teamCard:join_session': { sessionId: string };
  'teamCard:leave_session': { sessionId: string };
  'teamCard:ready': { sessionId: string };
  'teamCard:unready': { sessionId: string };
  'teamCard:bid': BidPayload;
  'teamCard:call_trump': CallTrumpPayload;
  'teamCard:play_card': PlayCardPayload;
  'teamCard:declare_meld': DeclareMeldPayload;
  'teamCard:request_npc': RequestNPCPayload;
  'teamCard:counter_mechanic': CounterMechanicPayload;
  'teamCard:chat': { sessionId: string; message: string };
}

export interface CreateSessionPayload {
  gameType: TeamCardGameType;
  raidBossId?: string;
  isPrivate?: boolean;
  password?: string;
  turnTimeLimit?: number;
}

export interface BidPayload {
  sessionId: string;
  bid: number | string;
  isNil?: boolean;
  isBlindNil?: boolean;
  suit?: Suit;
  isPass?: boolean;
  isDouble?: boolean;
}

export interface CallTrumpPayload {
  sessionId: string;
  action: 'pass' | 'order_up' | 'pick_up' | 'call';
  suit?: Suit;
  goingAlone?: boolean;
}

export interface PlayCardPayload {
  sessionId: string;
  cardIndex: number;
}

export interface DeclareMeldPayload {
  sessionId: string;
  meldCards: number[];  // Indices of cards in meld
  meldType: PinochleMeldType;
}

export interface RequestNPCPayload {
  sessionId: string;
  seatIndex: 0 | 1 | 2 | 3;
  difficulty: NPCDifficulty;
}

export interface CounterMechanicPayload {
  sessionId: string;
  mechanicId: string;
}

// =============================================================================
// SOCKET EVENTS - SERVER TO CLIENT
// =============================================================================

export interface TeamCardGameServerEvents {
  'teamCard:session_created': { sessionId: string; gameType: TeamCardGameType };
  'teamCard:session_update': TeamCardGameClientState;
  'teamCard:player_joined': PlayerJoinedEvent;
  'teamCard:player_left': PlayerLeftEvent;
  'teamCard:player_reconnected': { playerName: string; seatIndex: number };
  'teamCard:player_replaced_npc': { npcName: string; playerName: string; seatIndex: number };
  'teamCard:ready_status': { playerIndex: number; isReady: boolean };
  'teamCard:game_start': TeamCardGameClientState;
  'teamCard:cards_dealt': CardsDealtEvent;
  'teamCard:bid_made': BidMadeEvent;
  'teamCard:trump_called': TrumpCalledEvent;
  'teamCard:card_played': CardPlayedEvent;
  'teamCard:trick_complete': TrickCompleteEvent;
  'teamCard:round_complete': RoundCompleteEvent;
  'teamCard:boss_mechanic': BossMechanicEvent;
  'teamCard:mechanic_countered': MechanicCounteredEvent;
  'teamCard:boss_phase_change': BossPhaseChangeEvent;
  'teamCard:boss_defeated': BossDefeatedEvent;
  'teamCard:game_complete': TeamCardGameCompleteEvent;
  'teamCard:turn_start': TeamCardTurnStartEvent;
  'teamCard:time_warning': { secondsRemaining: number };
  'teamCard:hint': GameHint;
  'teamCard:chat': { playerName: string; message: string; isNPC: boolean };
  'teamCard:error': { code: string; message: string };
}

export interface PlayerJoinedEvent {
  playerName: string;
  seatIndex: number;
  teamIndex: 0 | 1;
  isNPC: boolean;
}

export interface PlayerLeftEvent {
  playerName: string;
  seatIndex: number;
  replacedByNPC: boolean;
  npcDifficulty?: NPCDifficulty;
}

export interface CardsDealtEvent {
  hand: TrickCard[];
  dealer: number;
  dealerName: string;
  upCard?: TrickCard;  // Euchre
}

export interface BidMadeEvent {
  playerIndex: number;
  playerName: string;
  bid: number | string;
  isNil?: boolean;
  isBlindNil?: boolean;
  suit?: Suit;
}

export interface TrumpCalledEvent {
  playerIndex: number;
  playerName: string;
  trump: Suit;
  goingAlone: boolean;
  maker: number;
}

export interface CardPlayedEvent {
  playerIndex: number;
  playerName: string;
  card: TrickCard;
  trickPosition: number;  // 1-4
}

export interface TrickCompleteEvent {
  trickResult: TrickResult;
  teamTricks: [number, number];
  nextLeader: number;
  nextLeaderName: string;
}

export interface RoundCompleteEvent {
  roundScore: TeamCardRoundScore;
  teamScores: [number, number];
  outcome: RoundOutcome;
  bossDamageDealt?: number;
  newBossHealth?: number;
}

export interface BossMechanicEvent {
  mechanic: {
    id: string;
    name: string;
    description: string;
    type: BossMechanicType;
    duration: MechanicDuration;
  };
  announcement: string;
  canCounter: boolean;
  counterRequirement?: {
    skill: string;
    threshold: number;
  };
}

export interface MechanicCounteredEvent {
  mechanicId: string;
  mechanicName: string;
  counteredBy: string;
  counterSkill: string;
}

export interface BossPhaseChangeEvent {
  newPhase: number;
  phaseName: string;
  bossHealth: number;
  bossMaxHealth: number;
  newMechanics: string[];
}

export interface BossDefeatedEvent {
  bossName: string;
  rewards: RaidRewards;
  playerContributions: Array<{
    characterId: string;
    characterName: string;
    contributionPercent: number;
    lootRolls: number;
  }>;
}

export interface TeamCardGameCompleteEvent {
  winningTeam: 0 | 1;
  finalScores: [number, number];
  rewards: {
    gold: number;
    experience: number;
    items?: Array<{ itemId: string; name: string; quantity: number }>;
  };
  playerStats: Array<{
    characterId: string;
    characterName: string;
    tricksWon: number;
    contributionScore: number;
  }>;
  raidVictory?: boolean;
  bossDefeated?: boolean;
}

export interface TeamCardTurnStartEvent {
  playerIndex: number;
  playerName: string;
  phase: TeamCardGamePhase;
  timeLimit: number;
  availableActions: string[];
  isNPC: boolean;
}

// =============================================================================
// LOCATION TYPES
// =============================================================================

/**
 * Location where team card games can be played
 */
export interface TeamCardLocation {
  id: string;
  name: string;
  description: string;
  locationId: string;  // Reference to main location system

  /** Available game types at this location */
  availableGames: TeamCardGameType[];

  /** Raid bosses that can be challenged here */
  raidBosses: string[];  // Boss IDs

  /** Requirements to access */
  unlockRequirements: LocationUnlockRequirements;

  /** Atmosphere modifiers */
  atmosphere: {
    theme: 'saloon' | 'railroad' | 'ghost_town' | 'fancy' | 'wilderness';
    ambience?: string;
    backgroundMusic?: string;
  };
}

export interface LocationUnlockRequirements {
  level?: number;
  gamblingSkill?: number;
  reputation?: { faction: string; minimum: number };
  questComplete?: string;
  cosmicProgress?: { corruptionLevel?: number; storyProgress?: string };
}

// =============================================================================
// SKILL INTEGRATION TYPES
// =============================================================================

/**
 * Skill modifiers for team card games
 */
export interface TeamCardSkillModifiers {
  /** Level of hand insight (0-3) */
  handInsightLevel: number;

  /** Chance to read opponent confidence */
  opponentReadChance: number;

  /** Bonus to hide own tells */
  tellHidingBonus: number;

  /** Resistance to boss mechanics */
  mechanicResistance: number;

  /** Accuracy of bid suggestions */
  bidHintAccuracy: number;

  /** Chance to see partner hand quality */
  partnerInsightChance: number;
}

/**
 * Skill unlock thresholds
 */
export const TEAM_CARD_SKILL_UNLOCKS = {
  // Gambling skill
  HINT_HAND_STRENGTH: 5,
  HINT_SUGGESTED_PLAY: 15,
  HINT_PARTNER_QUALITY: 25,
  UNLOCK_EXPERT_NPC: 35,
  HINT_OPTIMAL_BID: 45,

  // Perception skill
  READ_OPPONENT_CONFIDENCE: 10,
  READ_BLUFF_DETECTION: 25,
  READ_HAND_RANGE: 40,

  // Deception skill
  FAKE_TELL: 15,
  BID_MISDIRECTION: 30,

  // Combined requirements
  COUNTER_BOSS_MECHANICS_GAMBLING: 30,
  COUNTER_BOSS_MECHANICS_PERCEPTION: 20
} as const;

// =============================================================================
// CONTRIBUTION & REWARDS
// =============================================================================

/**
 * Player contribution tracking for fair rewards
 */
export interface PlayerContribution {
  characterId: string;

  /** Tricks won vs possible */
  tricksWon: number;
  tricksPossible: number;

  /** Special achievements */
  bossPhaseContributions: number;  // Damage during phase transitions
  mechanicsCountered: number;       // Boss abilities countered
  perfectRounds: number;            // Rounds with no mistakes
  clutchPlays: number;              // Critical plays at key moments

  /** Calculated contribution percent (0-1) */
  contributionPercent: number;

  /** Reward multiplier */
  rewardMultiplier: number;

  /** Loot roll count */
  lootRolls: number;
}

/**
 * Final rewards calculation
 */
export interface TeamCardRewardCalculation {
  /** Base rewards for completion */
  baseGold: number;
  baseExperience: number;

  /** Per-player contributions */
  playerContributions: PlayerContribution[];

  /** Loot rolls */
  lootRolls: Array<{
    characterId: string;
    lootTable: string;
    bonusRarity: number;
  }>;

  /** Victory bonus */
  victoryMultiplier: number;

  /** Raid completion bonus */
  raidBonus?: {
    goldBonus: number;
    experienceBonus: number;
    uniqueItem?: string;
  };
}

// =============================================================================
// GAME CONFIGURATION
// =============================================================================

/**
 * Configuration per game type
 */
export interface GameTypeConfig {
  gameType: TeamCardGameType;
  displayName: string;
  description: string;

  /** Deck configuration */
  deckSize: 24 | 48 | 52;  // 24 for Euchre, 48 for Pinochle, 52 for others
  cardsPerPlayer: 5 | 12 | 13;  // 5 for Euchre, 12 for Pinochle, 13 for others

  /** Scoring */
  winningScore: number;  // Points to win (10 for Euchre, 500 for Spades, 100 for Hearts)
  losingScoreTarget?: boolean;  // Hearts: first to 100 LOSES

  /** Features */
  hasBidding: boolean;
  hasMelding: boolean;
  hasTrump: boolean;
  trumpAlwaysSpades?: boolean;  // Spades

  /** Team configuration */
  isTeamGame: boolean;  // Hearts is FFA

  /** Turn timing */
  defaultTurnTime: number;
  raidTurnTime: number;  // Faster in raids

  /** Minimum skill requirements */
  minimumGamblingSkill: number;
  raidMinimumGamblingSkill: number;
}

export const GAME_TYPE_CONFIGS: Record<TeamCardGameType, GameTypeConfig> = {
  [TeamCardGameType.EUCHRE]: {
    gameType: TeamCardGameType.EUCHRE,
    displayName: 'Euchre',
    description: 'Fast-paced trick-taking with trump calling and going alone.',
    deckSize: 24,
    cardsPerPlayer: 5,
    winningScore: 10,
    hasBidding: false,
    hasMelding: false,
    hasTrump: true,
    isTeamGame: true,
    defaultTurnTime: 30,
    raidTurnTime: 20,
    minimumGamblingSkill: 1,
    raidMinimumGamblingSkill: 30
  },
  [TeamCardGameType.SPADES]: {
    gameType: TeamCardGameType.SPADES,
    displayName: 'Spades',
    description: 'Strategic bidding with nil bids and bag penalties.',
    deckSize: 52,
    cardsPerPlayer: 13,
    winningScore: 500,
    hasBidding: true,
    hasMelding: false,
    hasTrump: true,
    trumpAlwaysSpades: true,
    isTeamGame: true,
    defaultTurnTime: 30,
    raidTurnTime: 20,
    minimumGamblingSkill: 5,
    raidMinimumGamblingSkill: 35
  },
  [TeamCardGameType.HEARTS]: {
    gameType: TeamCardGameType.HEARTS,
    displayName: 'Hearts',
    description: 'Avoid points or shoot the moon. Queen of Spades is deadly.',
    deckSize: 52,
    cardsPerPlayer: 13,
    winningScore: 100,
    losingScoreTarget: true,
    hasBidding: false,
    hasMelding: false,
    hasTrump: false,
    isTeamGame: false,  // FFA
    defaultTurnTime: 30,
    raidTurnTime: 20,
    minimumGamblingSkill: 5,
    raidMinimumGamblingSkill: 30
  },
  [TeamCardGameType.BRIDGE]: {
    gameType: TeamCardGameType.BRIDGE,
    displayName: 'Bridge',
    description: 'Complex bidding and declarer play. The ultimate card game.',
    deckSize: 52,
    cardsPerPlayer: 13,
    winningScore: 100,  // Rubber scoring
    hasBidding: true,
    hasMelding: false,
    hasTrump: true,
    isTeamGame: true,
    defaultTurnTime: 45,  // More time for complex decisions
    raidTurnTime: 30,
    minimumGamblingSkill: 15,
    raidMinimumGamblingSkill: 45
  },
  [TeamCardGameType.PINOCHLE]: {
    gameType: TeamCardGameType.PINOCHLE,
    displayName: 'Pinochle',
    description: 'Melding combinations plus trick-taking with a double deck.',
    deckSize: 48,
    cardsPerPlayer: 12,
    winningScore: 150,
    hasBidding: true,
    hasMelding: true,
    hasTrump: true,
    isTeamGame: true,
    defaultTurnTime: 45,
    raidTurnTime: 30,
    minimumGamblingSkill: 10,
    raidMinimumGamblingSkill: 40
  }
};
