/**
 * Moral Reputation Service
 *
 * Phase 19.3: Frontier Justice - Marshal/Outlaw cross-cutting reputation system
 *
 * Handles:
 * - Reputation changes from player actions
 * - Tier calculations and transitions
 * - Bonus calculations for marshals and outlaws
 * - Daily decay toward neutral
 * - Cross-faction respect mechanics
 */

import { Character, ICharacter } from '../models/Character.model';
import {
  MoralReputationTier,
  MoralAction,
  MORAL_REPUTATION,
  MORAL_ACTION_VALUES,
  getMoralReputationTier,
  hasMarshalAccess,
  hasOutlawAccess,
  getBountyRewardBonus,
  getCrimePayoutBonus,
  calculateReputationChange,
  sharesMoralAlignment,
} from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Result of a reputation modification
 */
interface ReputationChangeResult {
  success: boolean;
  previousValue: number;
  newValue: number;
  change: number;
  previousTier: MoralReputationTier;
  newTier: MoralReputationTier;
  tierChanged: boolean;
  message: string;
  unlockedFeatures?: string[];
  lostFeatures?: string[];
}

/**
 * Moral Reputation Service
 */
export class MoralReputationService {
  /**
   * Get character's moral reputation state
   */
  static async getMoralReputation(characterId: string): Promise<{
    value: number;
    tier: MoralReputationTier;
    tierInfo: typeof MORAL_REPUTATION.TITLES[MoralReputationTier];
    hasMarshalAccess: boolean;
    hasOutlawAccess: boolean;
    bonuses: {
      bountyRewardBonus: number;
      crimePayoutBonus: number;
    };
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const value = character.moralReputation || 0;
    const tier = getMoralReputationTier(value);

    return {
      value,
      tier,
      tierInfo: MORAL_REPUTATION.TITLES[tier],
      hasMarshalAccess: hasMarshalAccess(value),
      hasOutlawAccess: hasOutlawAccess(value),
      bonuses: {
        bountyRewardBonus: getBountyRewardBonus(value),
        crimePayoutBonus: getCrimePayoutBonus(value),
      },
    };
  }

  /**
   * Modify character's moral reputation based on an action
   */
  static async modifyReputation(
    characterId: string,
    action: MoralAction,
    context?: {
      multiplier?: number;
      description?: string;
      locationId?: string;
    }
  ): Promise<ReputationChangeResult> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const baseChange = MORAL_ACTION_VALUES[action] || 0;
    const multiplier = context?.multiplier || 1.0;
    let change = Math.round(baseChange * multiplier);

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDecay = character.lastMoralDecay ? new Date(character.lastMoralDecay) : new Date();
    lastDecay.setHours(0, 0, 0, 0);

    // Reset daily change if it's a new day
    if (today > lastDecay) {
      character.moralReputationDailyChange = 0;
    }

    // Apply daily limit
    const remainingDailyChange = MORAL_REPUTATION.LIMITS.dailyChangeLimit -
      Math.abs(character.moralReputationDailyChange || 0);

    if (Math.abs(change) > remainingDailyChange) {
      change = change > 0 ? remainingDailyChange : -remainingDailyChange;
    }

    const previousValue = character.moralReputation || 0;
    const previousTier = getMoralReputationTier(previousValue);

    // Calculate new value with limits
    const newValue = calculateReputationChange(previousValue, change, character.level);
    const actualChange = newValue - previousValue;

    // Update character
    character.moralReputation = newValue;
    character.moralReputationDailyChange = (character.moralReputationDailyChange || 0) + actualChange;

    await character.save();

    const newTier = getMoralReputationTier(newValue);
    const tierChanged = previousTier !== newTier;

    // Determine unlocked/lost features
    const unlockedFeatures: string[] = [];
    const lostFeatures: string[] = [];

    if (tierChanged) {
      // Check marshal access
      if (hasMarshalAccess(newValue) && !hasMarshalAccess(previousValue)) {
        unlockedFeatures.push(...MORAL_REPUTATION.EFFECTS.marshalAccess.features);
      } else if (!hasMarshalAccess(newValue) && hasMarshalAccess(previousValue)) {
        lostFeatures.push(...MORAL_REPUTATION.EFFECTS.marshalAccess.features);
      }

      // Check outlaw access
      if (hasOutlawAccess(newValue) && !hasOutlawAccess(previousValue)) {
        unlockedFeatures.push(...MORAL_REPUTATION.EFFECTS.outlawAccess.features);
      } else if (!hasOutlawAccess(newValue) && hasOutlawAccess(previousValue)) {
        lostFeatures.push(...MORAL_REPUTATION.EFFECTS.outlawAccess.features);
      }

      // Check legendary tiers
      if (newValue >= MORAL_REPUTATION.EFFECTS.legendaryMarshal.threshold &&
          previousValue < MORAL_REPUTATION.EFFECTS.legendaryMarshal.threshold) {
        unlockedFeatures.push(...MORAL_REPUTATION.EFFECTS.legendaryMarshal.features);
      }
      if (newValue <= MORAL_REPUTATION.EFFECTS.notoriousOutlaw.threshold &&
          previousValue > MORAL_REPUTATION.EFFECTS.notoriousOutlaw.threshold) {
        unlockedFeatures.push(...MORAL_REPUTATION.EFFECTS.notoriousOutlaw.features);
      }
    }

    // Build message
    let message = `Moral reputation ${actualChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(actualChange)}`;
    if (tierChanged) {
      message += `. You are now ${MORAL_REPUTATION.TITLES[newTier].name}!`;
    }

    logger.info('Moral reputation modified', {
      characterId,
      action,
      previousValue,
      newValue,
      change: actualChange,
      tierChanged,
      previousTier,
      newTier,
    });

    return {
      success: true,
      previousValue,
      newValue,
      change: actualChange,
      previousTier,
      newTier,
      tierChanged,
      message,
      unlockedFeatures: unlockedFeatures.length > 0 ? unlockedFeatures : undefined,
      lostFeatures: lostFeatures.length > 0 ? lostFeatures : undefined,
    };
  }

  /**
   * Apply daily reputation decay toward neutral
   */
  static async applyDailyDecay(characterId: string): Promise<{
    decayed: boolean;
    previousValue: number;
    newValue: number;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const previousValue = character.moralReputation || 0;
    const now = new Date();
    const lastDecay = character.lastMoralDecay ? new Date(character.lastMoralDecay) : new Date(0);

    // Check if 24 hours have passed
    const hoursSinceDecay = (now.getTime() - lastDecay.getTime()) / (1000 * 60 * 60);
    if (hoursSinceDecay < 24) {
      return { decayed: false, previousValue, newValue: previousValue };
    }

    // Only decay if above minimum threshold
    if (Math.abs(previousValue) <= MORAL_REPUTATION.DECAY.minimumForDecay) {
      character.lastMoralDecay = now;
      character.moralReputationDailyChange = 0;
      await character.save();
      return { decayed: false, previousValue, newValue: previousValue };
    }

    // Calculate decay (move toward 0)
    const daysElapsed = Math.floor(hoursSinceDecay / 24);
    const totalDecay = Math.min(
      daysElapsed * MORAL_REPUTATION.DECAY.ratePerDay,
      MORAL_REPUTATION.DECAY.maxDecayPerDay
    );

    let newValue: number;
    if (previousValue > 0) {
      newValue = Math.max(0, previousValue - totalDecay);
    } else {
      newValue = Math.min(0, previousValue + totalDecay);
    }

    character.moralReputation = newValue;
    character.lastMoralDecay = now;
    character.moralReputationDailyChange = 0;
    await character.save();

    logger.info('Moral reputation decay applied', {
      characterId,
      previousValue,
      newValue,
      decayAmount: Math.abs(previousValue - newValue),
    });

    return { decayed: true, previousValue, newValue };
  }

  /**
   * Check cross-faction respect between two characters
   */
  static async checkCrossFactionRespect(
    characterId1: string,
    characterId2: string
  ): Promise<{
    sharesAlignment: boolean;
    alignmentType: 'lawful' | 'criminal' | 'none';
    respectBonus: number;
  }> {
    const [char1, char2] = await Promise.all([
      Character.findById(characterId1),
      Character.findById(characterId2),
    ]);

    if (!char1 || !char2) {
      throw new Error('One or both characters not found');
    }

    const rep1 = char1.moralReputation || 0;
    const rep2 = char2.moralReputation || 0;
    const threshold = MORAL_REPUTATION.EFFECTS.crossFactionRespect.threshold;

    const sharesAlignment = sharesMoralAlignment(rep1, rep2);

    let alignmentType: 'lawful' | 'criminal' | 'none' = 'none';
    if (rep1 >= threshold && rep2 >= threshold) {
      alignmentType = 'lawful';
    } else if (rep1 <= -threshold && rep2 <= -threshold) {
      alignmentType = 'criminal';
    }

    // 15% bonus to interactions when sharing strong alignment
    const respectBonus = sharesAlignment ? 0.15 : 0;

    return { sharesAlignment, alignmentType, respectBonus };
  }

  /**
   * Get bonuses for a character based on moral reputation
   */
  static getBonuses(moralReputation: number): {
    bountyRewardBonus: number;
    crimePayoutBonus: number;
    escortPayBonus: number;
    fenceRateBonus: number;
    intimidationBonus: number;
    townPriceDiscount: number;
  } {
    const isLegendaryMarshal = moralReputation >= MORAL_REPUTATION.EFFECTS.legendaryMarshal.threshold;
    const isMarshal = moralReputation >= MORAL_REPUTATION.EFFECTS.marshalBonuses.threshold;
    const isNotoriousOutlaw = moralReputation <= MORAL_REPUTATION.EFFECTS.notoriousOutlaw.threshold;
    const isWantedCriminal = moralReputation <= MORAL_REPUTATION.EFFECTS.outlawBonuses.threshold;

    return {
      bountyRewardBonus: isLegendaryMarshal
        ? MORAL_REPUTATION.EFFECTS.legendaryMarshal.bountyRewardBonus
        : isMarshal ? MORAL_REPUTATION.EFFECTS.marshalBonuses.bountyRewardBonus : 0,
      crimePayoutBonus: isNotoriousOutlaw
        ? MORAL_REPUTATION.EFFECTS.notoriousOutlaw.crimePayoutBonus
        : isWantedCriminal ? MORAL_REPUTATION.EFFECTS.outlawBonuses.crimePayoutBonus : 0,
      escortPayBonus: isMarshal ? MORAL_REPUTATION.EFFECTS.marshalBonuses.escortPayBonus : 0,
      fenceRateBonus: isWantedCriminal ? MORAL_REPUTATION.EFFECTS.outlawBonuses.fenceRateBonus : 0,
      intimidationBonus: isWantedCriminal ? MORAL_REPUTATION.EFFECTS.outlawBonuses.intimidationBonus : 0,
      townPriceDiscount: isMarshal ? MORAL_REPUTATION.EFFECTS.marshalBonuses.townPriceDiscount : 0,
    };
  }

  /**
   * Get available contract types based on moral reputation
   */
  static getAvailableContractTypes(moralReputation: number): {
    bountyContracts: boolean;
    escortContracts: boolean;
    assassinationContracts: boolean;
    sabotageContracts: boolean;
    factionWarfareContracts: boolean;
  } {
    return {
      bountyContracts: moralReputation >= MORAL_REPUTATION.EFFECTS.marshalAccess.threshold,
      escortContracts: moralReputation >= 1, // Respectable
      assassinationContracts: moralReputation <= -50, // Wanted Criminal
      sabotageContracts: moralReputation <= -20, // Petty Crook
      factionWarfareContracts: true, // Always available
    };
  }

  /**
   * Get the leaderboard for moral reputation
   */
  static async getLeaderboard(
    type: 'marshal' | 'outlaw',
    limit: number = 10
  ): Promise<Array<{
    characterId: string;
    characterName: string;
    faction: string;
    moralReputation: number;
    tier: MoralReputationTier;
  }>> {
    const sortDirection = type === 'marshal' ? -1 : 1;

    const characters = await Character.find({
      isActive: true,
      moralReputation: type === 'marshal' ? { $gt: 0 } : { $lt: 0 },
    })
      .sort({ moralReputation: sortDirection })
      .limit(limit)
      .select('name faction moralReputation');

    return characters.map(char => ({
      characterId: char._id.toString(),
      characterName: char.name,
      faction: char.faction,
      moralReputation: char.moralReputation || 0,
      tier: getMoralReputationTier(char.moralReputation || 0),
    }));
  }
}

export default MoralReputationService;
