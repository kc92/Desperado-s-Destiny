/**
 * Frontier Zodiac Service
 * Manages zodiac signs, constellation progress, bonuses, and star fragment awards
 */

import { Types } from 'mongoose';
import { CharacterZodiac, ICharacterZodiacDocument } from '../models/FrontierZodiac.model';
import {
  FRONTIER_SIGNS,
  FrontierSign,
  getSignById,
  getSignForDate,
  getCurrentSign,
  isPeakDayForSign,
  isPeakDay,
  getAllSigns,
  getOppositeSign,
  getSignCompatibility
} from '../data/frontierZodiac';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Active bonus structure
 */
export interface ActiveBonus {
  type: string;
  baseValue: number;
  currentValue: number;
  source: 'current_sign' | 'birth_sign' | 'peak_day';
  isBirthSign: boolean;
  isPeakDay: boolean;
}

/**
 * Constellation reward structure
 */
export interface ConstellationReward {
  signId: string;
  signName: string;
  constellationName: string;
  rewards: {
    experience: number;
    gold: number;
    starFragmentBonus: number;
    specialItem?: string;
    titleUnlocked?: string;
  };
}

/**
 * Star Walker reward structure
 */
export interface StarWalkerReward {
  title: string;
  permanentBonuses: {
    allActivities: number;
    starFragmentEarning: number;
    constellationBonus: number;
  };
  cosmetics: string[];
}

class FrontierZodiacService {
  /**
   * Get current zodiac sign based on real-world date
   */
  getCurrentSign(): FrontierSign | null {
    const sign = getCurrentSign();
    return sign || null;
  }

  /**
   * Get sign by ID
   */
  getSignById(signId: string): FrontierSign | null {
    const sign = getSignById(signId);
    return sign || null;
  }

  /**
   * Get all zodiac signs
   */
  getAllSigns(): FrontierSign[] {
    return getAllSigns();
  }

  /**
   * Get sign for a specific date
   */
  getSignForDate(month: number, day: number): FrontierSign | null {
    const sign = getSignForDate(month, day);
    return sign || null;
  }

  /**
   * Get character's zodiac progress
   */
  async getCharacterProgress(characterId: string | Types.ObjectId): Promise<{
    birthSign: FrontierSign | null;
    birthSignSetAt: Date | null;
    constellations: Map<string, {
      sign: FrontierSign;
      fragmentsEarned: number;
      fragmentsRequired: number;
      percentComplete: number;
      completed: boolean;
      completedAt?: Date;
      rewardClaimed: boolean;
    }>;
    totalFragments: number;
    isStarWalker: boolean;
    starWalkerAt?: Date;
    completionPercentage: number;
    peakDaysAttended: number;
    stats: {
      totalBonusesApplied: number;
      totalPeakDayBonuses: number;
      constellationsCompleted: number;
    };
  }> {
    const zodiac = await CharacterZodiac.findOrCreate(characterId);

    // Build constellation progress with sign details
    const constellationProgress = new Map();
    for (const sign of FRONTIER_SIGNS) {
      const progress = zodiac.constellations.get(sign.id) || {
        fragmentsEarned: 0,
        completed: false,
        rewardClaimed: false
      };

      constellationProgress.set(sign.id, {
        sign,
        fragmentsEarned: progress.fragmentsEarned,
        fragmentsRequired: sign.constellation.fragmentsRequired,
        percentComplete: Math.min(100, Math.round((progress.fragmentsEarned / sign.constellation.fragmentsRequired) * 100)),
        completed: progress.completed,
        completedAt: progress.completedAt,
        rewardClaimed: progress.rewardClaimed
      });
    }

    const birthSign = zodiac.birthSign ? getSignById(zodiac.birthSign) : null;

    return {
      birthSign: birthSign || null,
      birthSignSetAt: zodiac.birthSignSetAt || null,
      constellations: constellationProgress,
      totalFragments: zodiac.totalFragments,
      isStarWalker: zodiac.isStarWalker,
      starWalkerAt: zodiac.starWalkerAt,
      completionPercentage: Math.round((zodiac.stats.constellationsCompleted / 12) * 100),
      peakDaysAttended: zodiac.peakDaysAttended.length,
      stats: zodiac.stats
    };
  }

  /**
   * Set character's birth sign (one-time selection)
   */
  async setBirthSign(
    characterId: string | Types.ObjectId,
    signId: string
  ): Promise<{
    success: boolean;
    sign: FrontierSign;
    message: string;
  }> {
    const sign = getSignById(signId);
    if (!sign) {
      throw new AppError('Invalid zodiac sign', 400);
    }

    const zodiac = await CharacterZodiac.findOrCreate(characterId);

    // Check if birth sign is already set
    if (zodiac.birthSign) {
      throw new AppError('Birth sign has already been chosen. This selection is permanent.', 400);
    }

    zodiac.birthSign = signId;
    zodiac.birthSignSetAt = new Date();
    await zodiac.save();

    logger.info(`Character ${characterId} set birth sign to ${sign.name}`);

    return {
      success: true,
      sign,
      message: `Your birth sign has been set to ${sign.name}. May the ${sign.constellation.name} guide your path!`
    };
  }

  /**
   * Award star fragments to a character
   */
  async addStarFragments(
    characterId: string | Types.ObjectId,
    signId: string,
    amount: number
  ): Promise<{
    fragmentsAdded: number;
    totalFragments: number;
    constellationProgress: {
      fragmentsEarned: number;
      fragmentsRequired: number;
      percentComplete: number;
      completed: boolean;
      justCompleted: boolean;
    };
    becameStarWalker: boolean;
  }> {
    if (amount <= 0) {
      throw new AppError('Fragment amount must be positive', 400);
    }

    const sign = getSignById(signId);
    if (!sign) {
      throw new AppError('Invalid zodiac sign', 400);
    }

    const zodiac = await CharacterZodiac.findOrCreate(characterId);
    const wasCompleted = zodiac.hasCompletedConstellation(signId);

    const added = zodiac.addFragments(signId, amount, sign.constellation.fragmentsRequired);

    if (!added && wasCompleted) {
      // Constellation was already completed
      const progress = zodiac.getProgress(signId);
      return {
        fragmentsAdded: 0,
        totalFragments: zodiac.totalFragments,
        constellationProgress: {
          fragmentsEarned: progress?.fragmentsEarned || 0,
          fragmentsRequired: sign.constellation.fragmentsRequired,
          percentComplete: 100,
          completed: true,
          justCompleted: false
        },
        becameStarWalker: zodiac.isStarWalker
      };
    }

    const progress = zodiac.getProgress(signId)!;
    const justCompleted = progress.completed && !wasCompleted;
    const wasStarWalker = zodiac.isStarWalker;
    const becameStarWalker = zodiac.checkStarWalker() && !wasStarWalker;

    await zodiac.save();

    if (justCompleted) {
      logger.info(`Character ${characterId} completed the ${sign.constellation.name} constellation!`);
    }

    if (becameStarWalker) {
      logger.info(`Character ${characterId} became a Star Walker!`);
    }

    return {
      fragmentsAdded: amount,
      totalFragments: zodiac.totalFragments,
      constellationProgress: {
        fragmentsEarned: progress.fragmentsEarned,
        fragmentsRequired: sign.constellation.fragmentsRequired,
        percentComplete: Math.min(100, Math.round((progress.fragmentsEarned / sign.constellation.fragmentsRequired) * 100)),
        completed: progress.completed,
        justCompleted
      },
      becameStarWalker
    };
  }

  /**
   * Claim constellation completion reward
   */
  async claimConstellationReward(
    characterId: string | Types.ObjectId,
    signId: string
  ): Promise<ConstellationReward> {
    const sign = getSignById(signId);
    if (!sign) {
      throw new AppError('Invalid zodiac sign', 400);
    }

    const zodiac = await CharacterZodiac.findOrCreate(characterId);

    if (!zodiac.canClaimReward(signId)) {
      if (!zodiac.hasCompletedConstellation(signId)) {
        throw new AppError(`The ${sign.constellation.name} constellation is not yet complete`, 400);
      }
      throw new AppError('Reward has already been claimed for this constellation', 400);
    }

    zodiac.claimReward(signId);
    await zodiac.save();

    // Calculate rewards based on constellation difficulty
    const baseXp = 500;
    const baseGold = 100;
    const rewards: ConstellationReward = {
      signId,
      signName: sign.name,
      constellationName: sign.constellation.name,
      rewards: {
        experience: baseXp + (sign.constellation.stars * 50),
        gold: baseGold + (sign.constellation.fragmentsRequired * 5),
        starFragmentBonus: Math.floor(sign.constellation.fragmentsRequired * 0.2),
        specialItem: this.getConstellationSpecialItem(sign),
        titleUnlocked: this.getConstellationTitle(sign)
      }
    };

    logger.info(`Character ${characterId} claimed reward for ${sign.constellation.name}`);

    return rewards;
  }

  /**
   * Get active bonuses for a character
   */
  async getActiveBonuses(characterId: string | Types.ObjectId): Promise<{
    currentSign: FrontierSign | null;
    isPeakDay: boolean;
    birthSign: FrontierSign | null;
    activeBonuses: ActiveBonus[];
    totalActivityBonuses: Map<string, number>;
    totalSkillBonuses: Map<string, number>;
    totalSpecialBonuses: Map<string, number>;
  }> {
    const currentSign = this.getCurrentSign();
    const peakDayInfo = isPeakDay();
    const zodiac = await CharacterZodiac.findOrCreate(characterId);

    const birthSign = zodiac.birthSign ? getSignById(zodiac.birthSign) : null;
    const activeBonuses: ActiveBonus[] = [];

    const totalActivityBonuses = new Map<string, number>();
    const totalSkillBonuses = new Map<string, number>();
    const totalSpecialBonuses = new Map<string, number>();

    if (currentSign) {
      const isBirthSign = zodiac.birthSign === currentSign.id;
      const isPeak = peakDayInfo.isPeak && peakDayInfo.sign?.id === currentSign.id;
      const multiplier = this.calculateBonusMultiplier(isBirthSign, isPeak);

      // Activity bonuses
      for (const activity of currentSign.bonuses.activities) {
        const currentValue = activity.value * multiplier;
        activeBonuses.push({
          type: activity.type,
          baseValue: activity.value,
          currentValue,
          source: isPeak ? 'peak_day' : (isBirthSign ? 'birth_sign' : 'current_sign'),
          isBirthSign,
          isPeakDay: isPeak
        });

        const existing = totalActivityBonuses.get(activity.type) || 0;
        totalActivityBonuses.set(activity.type, existing + currentValue);
      }

      // Skill bonuses
      for (const skill of currentSign.bonuses.skills) {
        const currentValue = skill.value * multiplier;
        const existing = totalSkillBonuses.get(skill.skill) || 0;
        totalSkillBonuses.set(skill.skill, existing + currentValue);
      }

      // Special bonuses
      for (const special of currentSign.bonuses.special) {
        const currentValue = special.value * multiplier;
        const existing = totalSpecialBonuses.get(special.effect) || 0;
        totalSpecialBonuses.set(special.effect, existing + currentValue);
      }
    }

    return {
      currentSign,
      isPeakDay: peakDayInfo.isPeak,
      birthSign,
      activeBonuses,
      totalActivityBonuses,
      totalSkillBonuses,
      totalSpecialBonuses
    };
  }

  /**
   * Check if today is a peak day
   */
  isPeakDay(): { isPeak: boolean; sign: FrontierSign | null; bonusMultiplier: number } {
    const peakInfo = isPeakDay();
    return {
      isPeak: peakInfo.isPeak,
      sign: peakInfo.sign || null,
      bonusMultiplier: peakInfo.isPeak ? 2.0 : 1.0
    };
  }

  /**
   * Apply sign bonus to a base value for an activity
   */
  async applySignBonus(
    baseValue: number,
    activityType: string,
    characterId: string | Types.ObjectId
  ): Promise<{
    originalValue: number;
    bonusValue: number;
    finalValue: number;
    bonusPercent: number;
    source: string;
  }> {
    const bonuses = await this.getActiveBonuses(characterId);

    const activityBonus = bonuses.totalActivityBonuses.get(activityType) || 0;

    if (activityBonus === 0) {
      return {
        originalValue: baseValue,
        bonusValue: 0,
        finalValue: baseValue,
        bonusPercent: 0,
        source: 'none'
      };
    }

    const bonusValue = Math.round(baseValue * activityBonus);
    const finalValue = baseValue + bonusValue;

    // Track bonus application
    const zodiac = await CharacterZodiac.findOrCreate(characterId);
    zodiac.stats.totalBonusesApplied += 1;

    // Update favorite activity
    if (!zodiac.stats.favoriteActivity) {
      zodiac.stats.favoriteActivity = activityType;
    }
    await zodiac.save();

    let source = 'current_sign';
    if (bonuses.isPeakDay) {
      source = 'peak_day (2x bonus)';
    } else if (bonuses.birthSign && bonuses.currentSign?.id === bonuses.birthSign.id) {
      source = 'birth_sign (2x bonus)';
    }

    return {
      originalValue: baseValue,
      bonusValue,
      finalValue,
      bonusPercent: Math.round(activityBonus * 100),
      source
    };
  }

  /**
   * Get sign compatibility between two signs
   */
  getCompatibility(signId1: string, signId2: string): {
    compatible: boolean;
    level: 'excellent' | 'good' | 'neutral' | 'challenging';
    reason: string;
  } {
    return getSignCompatibility(signId1, signId2);
  }

  /**
   * Get opposite sign for a given sign
   */
  getOppositeSign(signId: string): FrontierSign | null {
    const opposite = getOppositeSign(signId);
    return opposite || null;
  }

  /**
   * Record peak day attendance for a character
   */
  async recordPeakDayAttendance(characterId: string | Types.ObjectId): Promise<{
    recorded: boolean;
    sign: FrontierSign | null;
    message: string;
  }> {
    const peakInfo = isPeakDay();

    if (!peakInfo.isPeak || !peakInfo.sign) {
      return {
        recorded: false,
        sign: null,
        message: 'Today is not a peak day for any sign'
      };
    }

    const zodiac = await CharacterZodiac.findOrCreate(characterId);
    const recorded = zodiac.attendPeakDay(peakInfo.sign.id);

    if (!recorded) {
      return {
        recorded: false,
        sign: peakInfo.sign,
        message: `You have already attended the ${peakInfo.sign.name} peak day today`
      };
    }

    await zodiac.save();

    return {
      recorded: true,
      sign: peakInfo.sign,
      message: `Peak day attendance recorded for ${peakInfo.sign.name}! All ${peakInfo.sign.name} bonuses are doubled today.`
    };
  }

  /**
   * Get zodiac leaderboard
   */
  async getLeaderboard(
    metric: 'totalFragments' | 'constellationsCompleted' = 'totalFragments',
    limit: number = 100
  ): Promise<{
    leaderboard: Array<{
      rank: number;
      characterId: string;
      characterName?: string;
      birthSign?: string;
      totalFragments: number;
      constellationsCompleted: number;
      isStarWalker: boolean;
    }>;
    metric: string;
  }> {
    const results = await CharacterZodiac.getLeaderboard(metric, limit);

    const leaderboard = results.map((zodiac, index) => ({
      rank: index + 1,
      characterId: zodiac.characterId.toString(),
      characterName: (zodiac.characterId as any)?.name,
      birthSign: zodiac.birthSign,
      totalFragments: zodiac.totalFragments,
      constellationsCompleted: zodiac.stats.constellationsCompleted,
      isStarWalker: zodiac.isStarWalker
    }));

    return { leaderboard, metric };
  }

  /**
   * Get all Star Walkers
   */
  async getStarWalkers(): Promise<Array<{
    characterId: string;
    characterName?: string;
    birthSign?: string;
    starWalkerAt: Date;
    totalFragments: number;
  }>> {
    const walkers = await CharacterZodiac.getStarWalkers();

    return walkers.map(zodiac => ({
      characterId: zodiac.characterId.toString(),
      characterName: (zodiac.characterId as any)?.name,
      birthSign: zodiac.birthSign,
      starWalkerAt: zodiac.starWalkerAt!,
      totalFragments: zodiac.totalFragments
    }));
  }

  /**
   * Get Star Walker rewards
   */
  getStarWalkerRewards(): StarWalkerReward {
    return {
      title: 'Star Walker',
      permanentBonuses: {
        allActivities: 0.05, // 5% bonus to all activities
        starFragmentEarning: 0.25, // 25% more star fragments
        constellationBonus: 0.10 // 10% bonus during any constellation period
      },
      cosmetics: [
        'starwalker_trail',
        'zodiac_master_frame',
        'constellation_emote'
      ]
    };
  }

  /**
   * Calculate fragment reward for an action
   */
  calculateFragmentReward(
    actionType: string,
    actionSuccess: boolean,
    isCurrentSign: boolean,
    isBirthSign: boolean,
    isPeakDay: boolean,
    isStarWalker: boolean
  ): number {
    if (!actionSuccess) return 0;

    // Base fragments by action type
    const baseFragments: Record<string, number> = {
      mining: 2,
      gambling: 1,
      horse_racing: 2,
      crime: 1,
      hunting: 2,
      ranching: 2,
      combat: 3,
      crafting: 2,
      bounty_hunting: 3,
      trading: 1,
      gang_activities: 2,
      questing: 3,
      default: 1
    };

    let fragments = baseFragments[actionType] || baseFragments.default;

    // Multipliers
    if (isCurrentSign) fragments = Math.ceil(fragments * 1.5);
    if (isBirthSign) fragments = Math.ceil(fragments * 1.5);
    if (isPeakDay) fragments = Math.ceil(fragments * 2);
    if (isStarWalker) fragments = Math.ceil(fragments * 1.25);

    return fragments;
  }

  /**
   * Helper: Calculate bonus multiplier
   */
  private calculateBonusMultiplier(isBirthSign: boolean, isPeakDay: boolean): number {
    let multiplier = 1.0;
    if (isBirthSign) multiplier *= 2.0;
    if (isPeakDay) multiplier *= 2.0;
    return multiplier;
  }

  /**
   * Helper: Get special item for constellation completion
   */
  private getConstellationSpecialItem(sign: FrontierSign): string {
    const items: Record<string, string> = {
      prospector: 'Golden Pickaxe Charm',
      coyote: 'Tricksters Loaded Dice',
      stallion: 'Horseshoe of Swift Winds',
      rattlesnake: 'Serpent Fang Lockpick',
      eagle: 'Eagles Eye Scope',
      longhorn: 'Ranchers Lucky Brand',
      gunslinger: 'Silver Bullet Pendant',
      cactus_flower: 'Desert Bloom Hammer',
      vulture: 'Bounty Hunters Badge',
      tumbleweed: 'Wanderers Compass',
      wolf: 'Pack Leaders Howl',
      north_star: 'Guiding Star Lantern'
    };
    return items[sign.id] || 'Zodiac Token';
  }

  /**
   * Helper: Get title for constellation completion
   */
  private getConstellationTitle(sign: FrontierSign): string {
    const titles: Record<string, string> = {
      prospector: 'Child of the Pickaxe',
      coyote: 'Trickster of the Jaw',
      stallion: 'Rider of the Hooves',
      rattlesnake: 'Shadow of the Coil',
      eagle: 'Soarer of the Wing',
      longhorn: 'Guardian of the Horns',
      gunslinger: 'Hand of the Barrel',
      cactus_flower: 'Bloom of the Thorn',
      vulture: 'Circler of Shadows',
      tumbleweed: 'Wanderer of the Path',
      wolf: 'Voice of the Pack',
      north_star: 'Seeker of the Light'
    };
    return titles[sign.id] || `${sign.constellation.name} Adept`;
  }
}

export const frontierZodiacService = new FrontierZodiacService();
export default frontierZodiacService;
