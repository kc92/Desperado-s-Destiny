/**
 * Frontier Zodiac Types
 * Type definitions for the Western Zodiac calendar system
 */

/** Zodiac sign identifiers */
export type ZodiacSignId =
  | 'prospector'
  | 'coyote'
  | 'stallion'
  | 'rattlesnake'
  | 'eagle'
  | 'longhorn'
  | 'gunslinger'
  | 'cactus-flower'
  | 'vulture'
  | 'tumbleweed'
  | 'wolf'
  | 'north-star';

/** Sign bonus types */
export type BonusType =
  | 'gold_multiplier'
  | 'xp_multiplier'
  | 'energy_regen'
  | 'skill_boost'
  | 'crime_success'
  | 'combat_power'
  | 'reputation_gain'
  | 'crafting_bonus'
  | 'luck_increase'
  | 'travel_speed'
  | 'stealth_bonus'
  | 'special';

/** Individual sign bonus */
export interface SignBonus {
  id: string;
  type: BonusType;
  name: string;
  description: string;
  value: number;
  isActive: boolean;
  isPeakBonus?: boolean;
}

/** Star in a constellation */
export interface ConstellationStar {
  id: string;
  name: string;
  x: number; // Position 0-100
  y: number; // Position 0-100
  size: 'small' | 'medium' | 'large' | 'major';
  isEarned: boolean;
  earnedAt?: Date;
  requirement?: string;
}

/** Connection line between stars */
export interface StarConnection {
  from: string; // Star ID
  to: string;   // Star ID
}

/** Full constellation data */
export interface Constellation {
  signId: ZodiacSignId;
  stars: ConstellationStar[];
  connections: StarConnection[];
  totalStars: number;
  earnedStars: number;
  isComplete: boolean;
  completedAt?: Date;
  reward?: ConstellationRewardData;
}

/** Reward for completing a constellation */
export interface ConstellationRewardData {
  id: string;
  name: string;
  description: string;
  type: 'item' | 'title' | 'ability' | 'cosmetic' | 'permanent_bonus';
  iconEmoji: string;
  claimed: boolean;
  claimedAt?: Date;
  value?: {
    itemId?: string;
    title?: string;
    abilityId?: string;
    bonusType?: BonusType;
    bonusValue?: number;
  };
}

/** Frontier Zodiac Sign */
export interface FrontierSign {
  id: ZodiacSignId;
  name: string;
  symbol: string;
  iconEmoji: string;
  theme: string;
  description: string;
  lore: string;

  // Date range
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;

  // Peak day
  peakMonth: number;
  peakDay: number;

  // Styling
  colors: {
    primary: string;   // Tailwind color class
    secondary: string; // Tailwind color class
    gradient: string;  // Tailwind gradient class
    glow: string;      // CSS glow color
  };

  // Bonuses
  bonuses: SignBonus[];
  peakBonuses: SignBonus[];

  // Associated content
  exclusiveNPCs: string[];
  exclusiveBounties: string[];
  specialQuests: string[];
}

/** Peak day event */
export interface PeakDayEvent {
  signId: ZodiacSignId;
  signName: string;
  date: Date;
  isActive: boolean;
  hoursRemaining: number;
  activeBonuses: SignBonus[];
  specialContent: {
    npcs: PeakDayNPC[];
    bounties: PeakDayBounty[];
    events: PeakDaySpecialEvent[];
  };
}

/** NPC available during peak day */
export interface PeakDayNPC {
  id: string;
  name: string;
  title: string;
  description: string;
  location: string;
  iconEmoji: string;
  signExclusive: boolean;
}

/** Bounty available during peak day */
export interface PeakDayBounty {
  id: string;
  name: string;
  description: string;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  signExclusive: boolean;
}

/** Special event during peak day */
export interface PeakDaySpecialEvent {
  id: string;
  name: string;
  description: string;
  type: 'competition' | 'gathering' | 'raid' | 'celebration';
  startsAt: Date;
  endsAt: Date;
}

/** Player's zodiac progress */
export interface ZodiacProgress {
  characterId: string;
  birthSign: ZodiacSignId | null;
  birthSignSelectedAt?: Date;

  // Constellation progress for all signs
  constellations: Record<ZodiacSignId, Constellation>;

  // Total stars earned
  totalStarsEarned: number;
  totalConstellationsComplete: number;

  // Claimed rewards
  claimedRewards: string[];

  // Statistics
  peakDaysAttended: number;
  signBonusesUsed: number;
}

/** Zodiac calendar state */
export interface ZodiacCalendar {
  currentSign: FrontierSign;
  currentDayInSign: number;
  daysRemainingInSign: number;
  nextSign: FrontierSign;
  isPeakDay: boolean;
  peakDayEvent: PeakDayEvent | null;
  daysUntilPeakDay: number;

  // Full year
  allSigns: FrontierSign[];
}

/** API response types */
export interface ZodiacCurrentResponse {
  sign: FrontierSign;
  dayInSign: number;
  daysRemaining: number;
  isPeakDay: boolean;
}

export interface ZodiacCalendarResponse {
  calendar: ZodiacCalendar;
}

export interface ZodiacProgressResponse {
  progress: ZodiacProgress;
}

export interface SetBirthSignResponse {
  success: boolean;
  message: string;
  birthSign: ZodiacSignId;
  bonuses: SignBonus[];
}

export interface ClaimConstellationResponse {
  success: boolean;
  message: string;
  reward: ConstellationRewardData;
}
