/**
 * Gambling System Types
 * Phase 13, Wave 13.1 - High Stakes Gambling Events
 *
 * Types for various gambling games, high stakes events, cheating mechanics,
 * and gambling addiction system in the Old West
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Types of gambling games available
 */
export enum GamblingGameType {
  BLACKJACK = 'BLACKJACK',
  FARO = 'FARO',
  THREE_CARD_MONTE = 'THREE_CARD_MONTE',
  CRAPS = 'CRAPS',
  ROULETTE = 'ROULETTE',
  WHEEL_OF_FORTUNE = 'WHEEL_OF_FORTUNE',
  POKER = 'POKER', // Traditional poker games
  FIVE_CARD_DRAW = 'FIVE_CARD_DRAW',
  SEVEN_CARD_STUD = 'SEVEN_CARD_STUD'
}

/**
 * High stakes event types
 */
export enum HighStakesEventType {
  LEGENDARY_POKER_NIGHT = 'LEGENDARY_POKER_NIGHT',
  FRONTERA_UNDERGROUND = 'FRONTERA_UNDERGROUND',
  RIVERBOAT_CRUISE = 'RIVERBOAT_CRUISE',
  GENTLEMAN_GAME = 'GENTLEMAN_GAME',
  DEVILS_GAME = 'DEVILS_GAME'
}

/**
 * Gambling session status
 */
export enum GamblingSessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  CAUGHT_CHEATING = 'CAUGHT_CHEATING',
  KICKED_OUT = 'KICKED_OUT'
}

/**
 * Cheating methods available
 */
export enum CheatMethod {
  CARD_MANIPULATION = 'CARD_MANIPULATION',      // Sleight of hand
  MARKED_CARDS = 'MARKED_CARDS',                // Pre-prepared deck
  LOADED_DICE = 'LOADED_DICE',                  // Weighted dice
  COLLUSION = 'COLLUSION',                      // Work with another player
  CARD_COUNTING = 'CARD_COUNTING',              // Legal but frowned upon
  MIRROR_SIGNAL = 'MIRROR_SIGNAL',              // Use reflective surface
  DEALER_COLLUSION = 'DEALER_COLLUSION'         // Bribe the dealer
}

/**
 * Result of cheating attempt
 */
export enum CheatResult {
  SUCCESS = 'SUCCESS',
  FAILED_UNDETECTED = 'FAILED_UNDETECTED',
  CAUGHT_BY_DEALER = 'CAUGHT_BY_DEALER',
  CAUGHT_BY_PLAYER = 'CAUGHT_BY_PLAYER',
  CAUGHT_BY_SECURITY = 'CAUGHT_BY_SECURITY'
}

/**
 * Gambling addiction stages
 */
export enum AddictionLevel {
  NONE = 'NONE',
  CASUAL = 'CASUAL',           // 0-20 sessions
  REGULAR = 'REGULAR',         // 21-50 sessions
  PROBLEM = 'PROBLEM',         // 51-100 sessions, debuffs start
  COMPULSIVE = 'COMPULSIVE',   // 101-200 sessions, strong debuffs
  ADDICTED = 'ADDICTED'        // 201+ sessions, severe debuffs
}

/**
 * Roulette bet types
 */
export enum RouletteBetType {
  STRAIGHT_UP = 'STRAIGHT_UP',         // Single number (35:1)
  SPLIT = 'SPLIT',                     // Two numbers (17:1)
  STREET = 'STREET',                   // Three numbers (11:1)
  CORNER = 'CORNER',                   // Four numbers (8:1)
  DOUBLE_STREET = 'DOUBLE_STREET',     // Six numbers (5:1)
  DOZEN = 'DOZEN',                     // 1-12, 13-24, 25-36 (2:1)
  COLUMN = 'COLUMN',                   // Column of 12 (2:1)
  RED_BLACK = 'RED_BLACK',             // Red or Black (1:1)
  EVEN_ODD = 'EVEN_ODD',               // Even or Odd (1:1)
  HIGH_LOW = 'HIGH_LOW'                // 1-18 or 19-36 (1:1)
}

/**
 * Craps bet types
 */
export enum CrapsBetType {
  PASS_LINE = 'PASS_LINE',
  DONT_PASS = 'DONT_PASS',
  COME = 'COME',
  DONT_COME = 'DONT_COME',
  FIELD = 'FIELD',
  PLACE_BET = 'PLACE_BET',
  HARDWAYS = 'HARDWAYS',
  ANY_SEVEN = 'ANY_SEVEN',
  ANY_CRAPS = 'ANY_CRAPS'
}

/**
 * Blackjack actions
 */
export enum BlackjackAction {
  HIT = 'HIT',
  STAND = 'STAND',
  DOUBLE_DOWN = 'DOUBLE_DOWN',
  SPLIT = 'SPLIT',
  SURRENDER = 'SURRENDER',
  INSURANCE = 'INSURANCE'
}

// ============================================================================
// SKILL REQUIREMENTS
// ============================================================================

/**
 * Skill check for gambling actions
 */
export interface SkillCheck {
  skillId: string;
  minimumLevel: number;
  bonusPerLevel: number;
  description: string;
}

// ============================================================================
// GAMBLING GAME DEFINITIONS
// ============================================================================

/**
 * Base gambling game definition
 */
export interface GamblingGame {
  id: string;
  name: string;
  description: string;
  gameType: GamblingGameType;

  // Stakes
  minimumBet: number;
  maximumBet: number;

  // House edge and rules
  houseEdge: number; // Percentage (0-100)
  dealerNPC?: string; // NPC ID of dealer

  // Player skills that provide bonuses
  skillChecks: SkillCheck[];

  // Cheating mechanics
  cheatDifficulty: number; // 0-100, higher = harder to cheat
  cheatDetectionBase: number; // Base % to get caught (0-100)
  cheatPenalty: string; // Description of what happens if caught

  // Availability
  availableLocations: string[];
  minimumLevel: number;
  factionRestriction?: string; // Optional faction requirement

  // Session mechanics
  sessionDuration: number; // Minutes per session
  maxPlayersPerTable: number;
  allowSpectators: boolean;

  // Rewards and progression
  experiencePerSession: number;
  reputationGain: number; // Reputation gain for winning
  reputationLoss: number; // Reputation loss for losing badly

  // Special rules
  rules: string[];
  tips: string[];
}

/**
 * Blackjack specific game state
 */
export interface BlackjackGameState {
  playerHand: number[];
  dealerHand: number[];
  dealerUpCard: number;
  playerTotal: number;
  dealerTotal: number;
  canDoubleDown: boolean;
  canSplit: boolean;
  insuranceOffered: boolean;
  bet: number;
  sideBets?: Map<string, number>;
}

/**
 * Faro specific game state
 */
export interface FaroGameState {
  currentCard: number;
  bets: Map<number, number>; // Card value -> bet amount
  dealerWins: number[];
  playerWins: number[];
  copperBets: number[]; // Betting against the card
}

/**
 * Three Card Monte game state
 */
export interface MonteGameState {
  queenPosition: number; // 0, 1, or 2
  shuffleSpeed: number; // Affects difficulty
  playerGuess?: number;
  bet: number;
}

/**
 * Craps game state
 */
export interface CrapsGameState {
  point?: number; // Point number if established
  comeOutRoll: boolean;
  bets: Map<CrapsBetType, number>;
  lastRoll?: [number, number];
}

/**
 * Roulette game state
 */
export interface RouletteGameState {
  wheelType: 'EUROPEAN' | 'AMERICAN'; // European has single zero, American has double zero
  bets: Map<RouletteBetType, any>; // Bet type -> bet details
  lastNumber?: number;
  history: number[]; // Last 10 spins
}

// ============================================================================
// HIGH STAKES EVENTS
// ============================================================================

/**
 * Event schedule definition
 */
export interface EventSchedule {
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dayOfWeek?: number; // 0-6 for weekly events
  dayOfMonth?: number; // 1-31 for monthly events
  hour: number; // 0-23
  duration: number; // Duration in minutes
}

/**
 * Entry requirement for events
 */
export interface EventRequirement {
  type: 'LEVEL' | 'REPUTATION' | 'ITEM' | 'ACHIEVEMENT' | 'FACTION' | 'CRIMINAL_REP';
  value: any;
  description: string;
}

/**
 * Gambling prize definition
 */
export interface GamblingPrize {
  type: 'GOLD' | 'ITEM' | 'TITLE' | 'REPUTATION' | 'UNIQUE_ITEM';
  amount?: number;
  itemId?: string;
  title?: string;
  description: string;
}

/**
 * High stakes event definition
 */
export interface HighStakesEvent {
  id: string;
  name: string;
  description: string;
  lore: string;
  eventType: HighStakesEventType;

  // Scheduling
  schedule: EventSchedule;
  duration: number; // Duration in minutes

  // Entry
  entryFee: number;
  entryRequirements: EventRequirement[];
  maxParticipants: number;
  minimumParticipants: number;

  // Games available at event
  availableGames: string[]; // Game IDs
  mainGame: string; // Primary game for the event

  // Rewards
  prizePool: number; // Total prize pool
  guaranteedPrizes: GamblingPrize[]; // Everyone gets these
  leaderboardPrizes: GamblingPrize[]; // Top performers get these

  // Atmosphere and NPCs
  location: string;
  ambiance: string;
  specialNPCs: string[]; // Famous NPC players
  npcDialogue: Map<string, string[]>;

  // Special rules
  specialRules: string[];
  cheatDetectionModifier: number; // Modifier to detection chance
  supernaturalElement?: boolean; // For Devil's Game

  // Buffs/Debuffs
  eventBuffs?: EventBuff[];
  eventDebuffs?: EventDebuff[];
}

/**
 * Event buff
 */
export interface EventBuff {
  id: string;
  name: string;
  description: string;
  effect: string;
  duration: number; // Minutes
}

/**
 * Event debuff
 */
export interface EventDebuff {
  id: string;
  name: string;
  description: string;
  effect: string;
  duration: number; // Minutes
}

// ============================================================================
// GAMBLING SESSIONS
// ============================================================================

/**
 * Active gambling session
 */
export interface GamblingSession {
  id: string;
  characterId: string;
  gameId: string;
  gameType: GamblingGameType;
  eventId?: string; // If part of high stakes event

  // Session details
  startTime: Date;
  endTime?: Date;
  status: GamblingSessionStatus;
  location: string;

  // Financial tracking
  startingGold: number;
  currentGold: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  netProfit: number;

  // Gameplay
  handsPlayed: number;
  handsWon: number;
  handsLost: number;
  handsPushed: number;
  biggestWin: number;
  biggestLoss: number;

  // Cheating tracking
  cheatAttempts: number;
  successfulCheats: number;
  caughtCheating: boolean;
  cheatMethods: CheatMethod[];

  // Dealer info
  dealerNPC?: string;
  dealerSkillLevel: number;

  // Other players at table
  otherPlayers: string[]; // Character IDs

  // Game state (varies by game type)
  gameState?: any;
}

/**
 * Historical gambling record
 */
export interface GamblingHistory {
  characterId: string;

  // Overall statistics
  totalSessions: number;
  totalGoldWagered: number;
  totalGoldWon: number;
  totalGoldLost: number;
  netLifetimeProfit: number;

  // Session breakdown by game
  sessionsByGame: Map<GamblingGameType, number>;
  profitByGame: Map<GamblingGameType, number>;

  // Achievements
  biggestSingleWin: number;
  biggestSingleLoss: number;
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
  streakType: 'WIN' | 'LOSS' | 'NONE';

  // High stakes events
  eventsParticipated: number;
  eventsWon: number;
  eventPrizesEarned: GamblingPrize[];

  // Cheating history
  timesCaughtCheating: number;
  successfulCheats: number;
  cheatSuccessRate: number;

  // Addiction tracking
  addictionLevel: AddictionLevel;
  sessionsWithoutGambling: number;
  lastGamblingSession?: Date;
  addictionDebuffs: AddictionDebuff[];

  // Reputation
  gamblerReputation: number; // 0-100
  knownCheater: boolean;
  bannedLocations: string[];

  // Notable wins/losses
  memorableMoments: GamblingMoment[];

  // Timestamps
  firstSession?: Date;
  lastSession?: Date;
}

/**
 * Addiction debuff
 */
export interface AddictionDebuff {
  id: string;
  name: string;
  description: string;
  effects: {
    statModifier?: Map<string, number>;
    goldDrain?: number; // Gold lost per hour due to compulsion
    actionEnergyCost?: number; // Extra energy cost modifier
  };
  severity: number; // 1-5
}

/**
 * Memorable gambling moment
 */
export interface GamblingMoment {
  id: string;
  timestamp: Date;
  gameType: GamblingGameType;
  description: string;
  goldAmount: number;
  wasWin: boolean;
  location: string;
  witnesses: string[]; // Other player names
  screenshot?: string; // For future feature
}

// ============================================================================
// CHEATING MECHANICS
// ============================================================================

/**
 * Cheating attempt
 */
export interface CheatAttempt {
  characterId: string;
  sessionId: string;
  method: CheatMethod;
  skillLevel: number; // Player's relevant skill
  itemBonus: number; // Bonus from items like marked cards

  // Detection chances
  baseDetectionChance: number;
  dealerSkillModifier: number;
  locationSecurityModifier: number;
  reputationModifier: number; // Known cheaters watched closely

  // Result
  success: boolean;
  detected: boolean;
  detectedBy: 'DEALER' | 'PLAYER' | 'SECURITY' | 'NONE';
  goldBonus: number; // Extra gold if successful

  // Consequences
  ejected: boolean;
  reputationLoss: number;
  bannedFromLocation: boolean;
  jailTime?: number;
  fine?: number;
}

/**
 * Anti-cheat item (for dealers/security)
 */
export interface AntiCheatItem {
  id: string;
  name: string;
  description: string;
  detectionBonus: number; // Bonus to catching cheaters
  visibleToPlayers: boolean;
  price: number;
}

// ============================================================================
// LEGENDARY GAMBLING ITEMS
// ============================================================================

/**
 * Gambling-specific items
 */
export interface GamblingItem {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY' | 'CURSED';

  // Effects
  winRateBonus?: number; // Percentage increase
  cheatBonus?: number; // Bonus to cheating attempts
  detectionPenalty?: number; // Reduces chance of being caught
  goldMultiplier?: number; // Multiplies winnings

  // Special abilities
  specialAbility?: string;
  abilityDescription?: string;
  usesPerSession?: number;

  // Acquisition
  howToObtain: string;
  price?: number;
  questRequired?: string;

  // Cursed items have drawbacks
  curse?: {
    description: string;
    effect: string;
  };
}

// ============================================================================
// GAMBLING LOCATIONS
// ============================================================================

/**
 * Gambling location details
 */
export interface GamblingLocation {
  id: string;
  name: string;
  description: string;
  type: 'LEGAL' | 'UNDERGROUND' | 'EXCLUSIVE';

  // Games available
  availableGames: string[];

  // Atmosphere
  crowdLevel: number; // 0-100
  securityLevel: number; // 0-100 (affects cheat detection)
  luxuryLevel: number; // 0-100 (affects atmosphere)

  // Requirements
  minimumBet: number;
  entryFee?: number;
  membershipRequired?: boolean;
  reputationRequired?: number;

  // NPCs
  dealers: string[];
  securityNPCs: string[];
  regularPatrons: string[];

  // Special features
  features: string[];
  amenities: string[];
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Start gambling session request
 */
export interface StartGamblingSessionRequest {
  gameId: string;
  location: string;
  initialBet: number;
  eventId?: string;
}

/**
 * Start gambling session response
 */
export interface StartGamblingSessionResponse {
  session: GamblingSession;
  gameState: any;
  message: string;
}

/**
 * Make gambling bet request
 */
export interface MakeGamblingBetRequest {
  sessionId: string;
  betAmount: number;
  betType?: string; // For games with multiple bet types
  betDetails?: any; // Game-specific bet details
}

/**
 * Make gambling bet response
 */
export interface MakeGamblingBetResponse {
  result: 'WIN' | 'LOSS' | 'PUSH' | 'IN_PROGRESS';
  amountWon: number;
  amountLost: number;
  newBalance: number;
  gameState: any;
  message: string;
  handsPlayed: number;
}

/**
 * Attempt cheat request
 */
export interface AttemptCheatRequest {
  sessionId: string;
  method: CheatMethod;
  targetAmount?: number; // How much trying to steal
}

/**
 * Attempt cheat response
 */
export interface AttemptCheatResponse {
  attempt: CheatAttempt;
  message: string;
  sessionEnded: boolean;
}

/**
 * Join event request
 */
export interface JoinHighStakesEventRequest {
  eventId: string;
  characterId: string;
}

/**
 * Join event response
 */
export interface JoinHighStakesEventResponse {
  success: boolean;
  event: HighStakesEvent;
  position: number; // Position in queue
  message: string;
}

/**
 * Get gambling statistics request
 */
export interface GetGamblingStatsRequest {
  characterId: string;
  gameType?: GamblingGameType;
}

/**
 * Get gambling statistics response
 */
export interface GetGamblingStatsResponse {
  history: GamblingHistory;
  currentSession?: GamblingSession;
  recentSessions: GamblingSession[];
  leaderboard?: LeaderboardEntry[];
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  characterName: string;
  characterId: string;
  metric: number; // Depends on leaderboard type
  metricType: 'PROFIT' | 'WINS' | 'SESSIONS' | 'BIGGEST_WIN';
}

/**
 * Recovery from addiction request
 */
export interface RecoverFromAddictionRequest {
  characterId: string;
  method: 'SPIRIT_SPRINGS' | 'TIME' | 'COUNSELING';
}

/**
 * Recovery from addiction response
 */
export interface RecoverFromAddictionResponse {
  success: boolean;
  newAddictionLevel: AddictionLevel;
  debuffsRemoved: AddictionDebuff[];
  message: string;
  cost?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Note: GAMBLING_CONSTANTS is exported from game.constants.ts
// Below are additional gambling system configuration constants

/**
 * Extended gambling system constants (session/addiction details)
 */
export const GAMBLING_SYSTEM_DETAILS = {
  // Session limits
  MIN_SESSION_DURATION: 5, // Minutes
  MAX_SESSION_DURATION: 120, // Minutes

  // Addiction thresholds
  ADDICTION_SESSION_THRESHOLDS: {
    CASUAL: 20,
    REGULAR: 50,
    PROBLEM: 100,
    COMPULSIVE: 200
  },

  // Reputation
  MIN_GAMBLER_REPUTATION: 0,
  MAX_GAMBLER_REPUTATION: 100,
  KNOWN_CHEATER_THRESHOLD: 3, // Times caught

  // Cheating
  BASE_CHEAT_DETECTION: 40, // 40% base chance
  SKILL_DETECTION_REDUCTION: 2, // -2% per skill level
  MAX_CHEAT_ATTEMPTS_PER_SESSION: 3,

  // Recovery
  ADDICTION_RECOVERY_COST: 500,
  SESSIONS_FOR_NATURAL_RECOVERY: 30, // Sessions without gambling

  // House edges (typical percentages)
  HOUSE_EDGES: {
    BLACKJACK: 0.5, // With perfect play
    FARO: 2.0,
    ROULETTE_EUROPEAN: 2.7,
    ROULETTE_AMERICAN: 5.26,
    CRAPS_PASS_LINE: 1.41,
    THREE_CARD_MONTE: 25.0, // Very bad odds
    WHEEL_OF_FORTUNE: 11.1
  }
};
