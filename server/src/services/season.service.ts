/**
 * Season Service
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Manages seasonal effects and their application to gameplay
 */

import { GameCalendarModel } from '../models/GameCalendar.model';
import {
  Season,
  SeasonalEffects,
  ItemCategory,
  Month,
  MoonPhase,
  MoonPhaseEffects,
  MonthlyTheme,
} from '@desperados/shared';
import {
  getSeasonalEffects,
  getSeasonDescription,
  getSeasonalPriceModifier,
} from '../data/seasonalEffects';
import { getMonthlyTheme, getRandomFlavorEvent } from '../data/monthlyThemes';
import {
  getMoonPhaseEffects,
  getDaysUntilFullMoon,
  getDaysUntilNewMoon,
  getMoonPhaseDescription,
} from '../data/moonPhases';
import { SecureRNG } from './base/SecureRNG';
import { calendarService } from './calendar.service';

class SeasonService {
  /**
   * Get current season
   */
  async getCurrentSeason(): Promise<Season> {
    const calendar = await GameCalendarModel.findOne();
    if (!calendar) {
      return Season.SUMMER;
    }
    return calendar.currentSeason;
  }

  /**
   * Get seasonal effects for current season
   */
  async getCurrentSeasonalEffects(): Promise<SeasonalEffects> {
    const season = await this.getCurrentSeason();
    return getSeasonalEffects(season);
  }

  /**
   * Get seasonal effects for a specific season
   */
  getSeasonalEffects(season: Season): SeasonalEffects {
    return getSeasonalEffects(season);
  }

  /**
   * Get season description
   */
  getSeasonDescription(season: Season): string {
    return getSeasonDescription(season);
  }

  /**
   * Get current monthly theme
   */
  async getCurrentMonthlyTheme(): Promise<MonthlyTheme> {
    const calendar = await GameCalendarModel.findOne();
    if (!calendar) {
      return getMonthlyTheme(Month.JUNE);
    }
    return getMonthlyTheme(calendar.currentMonth);
  }

  /**
   * Get a random flavor event for the current month
   */
  async getRandomFlavorEvent(): Promise<string> {
    const calendar = await GameCalendarModel.findOne();
    if (!calendar) {
      return 'A tumbleweed rolls across the dusty street.';
    }
    return getRandomFlavorEvent(calendar.currentMonth);
  }

  /**
   * Apply seasonal modifier to a price
   */
  async applySeasonalPricing(
    basePrice: number,
    category: ItemCategory
  ): Promise<number> {
    const season = await this.getCurrentSeason();
    const modifier = getSeasonalPriceModifier(season, category);
    return Math.round(basePrice * modifier);
  }

  /**
   * Get price modifier for an item category in current season
   */
  async getPriceModifier(category: ItemCategory): Promise<number> {
    const season = await this.getCurrentSeason();
    return getSeasonalPriceModifier(season, category);
  }

  /**
   * Calculate travel time with seasonal modifiers
   */
  async calculateTravelTime(baseTravelTime: number): Promise<number> {
    const effects = await this.getCurrentSeasonalEffects();
    return Math.round(baseTravelTime * effects.travelSpeedModifier);
  }

  /**
   * Calculate energy cost with seasonal modifiers
   */
  async calculateEnergyCost(baseEnergyCost: number): Promise<number> {
    const effects = await this.getCurrentSeasonalEffects();
    return Math.round(baseEnergyCost * effects.energyCostModifier);
  }

  /**
   * Get hunting bonus for current season
   */
  async getHuntingBonus(): Promise<number> {
    const effects = await this.getCurrentSeasonalEffects();
    return effects.huntingBonus;
  }

  /**
   * Get fishing bonus for current season and moon phase
   */
  async getFishingBonus(): Promise<number> {
    const effects = await this.getCurrentSeasonalEffects();
    const moonEffects = await this.getCurrentMoonPhaseEffects();

    return effects.fishingBonus + moonEffects.fishingBonus;
  }

  /**
   * Get current moon phase
   */
  async getCurrentMoonPhase(): Promise<MoonPhase> {
    const calendar = await GameCalendarModel.findOne();
    if (!calendar) {
      return MoonPhase.FULL_MOON;
    }
    return calendar.currentMoonPhase;
  }

  /**
   * Get moon phase effects for current phase
   */
  async getCurrentMoonPhaseEffects(): Promise<MoonPhaseEffects> {
    const phase = await this.getCurrentMoonPhase();
    return getMoonPhaseEffects(phase);
  }

  /**
   * Get moon phase description
   */
  async getMoonPhaseDescription(): Promise<string> {
    const phase = await this.getCurrentMoonPhase();
    return getMoonPhaseDescription(phase);
  }

  /**
   * Get days until full moon
   */
  async getDaysUntilFullMoon(): Promise<number> {
    const calendar = await GameCalendarModel.findOne();
    if (!calendar) return 14;

    const dayOfYear = calendar.getDayOfYear();
    return getDaysUntilFullMoon(dayOfYear);
  }

  /**
   * Get days until new moon
   */
  async getDaysUntilNewMoon(): Promise<number> {
    const calendar = await GameCalendarModel.findOne();
    if (!calendar) return 14;

    const dayOfYear = calendar.getDayOfYear();
    return getDaysUntilNewMoon(dayOfYear);
  }

  /**
   * Apply moon phase modifier to crime detection
   */
  async applyCrimeDetectionModifier(baseDetectionChance: number): Promise<number> {
    const moonEffects = await this.getCurrentMoonPhaseEffects();
    return baseDetectionChance * moonEffects.crimeDetectionModifier;
  }

  /**
   * Get crime bonus gold from moon phase
   */
  async getCrimeBonusGold(baseGold: number): Promise<number> {
    const moonEffects = await this.getCurrentMoonPhaseEffects();
    const bonusPercent = moonEffects.crimeBonusGold / 100;
    return Math.round(baseGold * (1 + bonusPercent));
  }

  /**
   * Check if supernatural encounter should occur
   */
  async shouldTriggerSupernaturalEncounter(): Promise<boolean> {
    const moonEffects = await this.getCurrentMoonPhaseEffects();
    return SecureRNG.chance(moonEffects.supernaturalEncounterChance);
  }

  /**
   * Get weird west power bonus
   */
  async getWeirdWestPowerBonus(): Promise<number> {
    const moonEffects = await this.getCurrentMoonPhaseEffects();
    return moonEffects.weirdWestPowerBonus;
  }

  /**
   * Apply seasonal crop yield modifier
   */
  async applyCropYieldModifier(baseYield: number): Promise<number> {
    const effects = await this.getCurrentSeasonalEffects();
    return Math.round(baseYield * effects.cropYieldModifier);
  }

  /**
   * Apply seasonal animal spawn modifier
   */
  async applyAnimalSpawnModifier(baseSpawnChance: number): Promise<number> {
    const effects = await this.getCurrentSeasonalEffects();
    return baseSpawnChance * effects.animalSpawnModifier;
  }

  /**
   * Check if health drain should occur due to weather
   */
  async getHealthDrainRate(): Promise<number> {
    const effects = await this.getCurrentSeasonalEffects();
    return effects.healthDrainRate;
  }

  /**
   * Get NPC activity modifier
   */
  async getNpcActivityModifier(): Promise<number> {
    const effects = await this.getCurrentSeasonalEffects();
    return effects.npcActivityModifier;
  }

  /**
   * Get complete seasonal info for display
   */
  async getSeasonInfo(): Promise<{
    currentSeason: Season;
    effects: SeasonalEffects;
    description: string;
    monthlyTheme: MonthlyTheme;
    daysUntilNextSeason: number;
  }> {
    const season = await this.getCurrentSeason();
    const effects = getSeasonalEffects(season);
    const description = getSeasonDescription(season);
    const monthlyTheme = await this.getCurrentMonthlyTheme();
    const daysUntilNextSeason = await calendarService.getDaysUntilNextSeason();

    return {
      currentSeason: season,
      effects,
      description,
      monthlyTheme,
      daysUntilNextSeason,
    };
  }

  /**
   * Get complete moon phase info for display
   */
  async getMoonPhaseInfo(): Promise<{
    phase: MoonPhase;
    illumination: number;
    effects: MoonPhaseEffects;
    description: string;
    daysUntilFullMoon: number;
    daysUntilNewMoon: number;
  }> {
    const phase = await this.getCurrentMoonPhase();
    const effects = getMoonPhaseEffects(phase);
    const description = getMoonPhaseDescription(phase);
    const daysUntilFullMoon = await this.getDaysUntilFullMoon();
    const daysUntilNewMoon = await this.getDaysUntilNewMoon();

    return {
      phase,
      illumination: effects.illumination,
      effects,
      description,
      daysUntilFullMoon,
      daysUntilNewMoon,
    };
  }

  /**
   * Check if it's a good time for a specific activity
   */
  async isGoodTimeFor(activity: 'hunting' | 'fishing' | 'crime' | 'trading'): Promise<{
    isGood: boolean;
    reason: string;
    bonus: number;
  }> {
    const seasonalEffects = await this.getCurrentSeasonalEffects();
    const moonEffects = await this.getCurrentMoonPhaseEffects();
    const monthlyTheme = await this.getCurrentMonthlyTheme();

    switch (activity) {
      case 'hunting': {
        const bonus = seasonalEffects.huntingBonus;
        return {
          isGood: bonus > 10,
          reason:
            bonus > 10
              ? `${monthlyTheme.name} is prime hunting season!`
              : `Hunting is difficult in ${monthlyTheme.name}.`,
          bonus,
        };
      }

      case 'fishing': {
        const totalBonus = seasonalEffects.fishingBonus + moonEffects.fishingBonus;
        return {
          isGood: totalBonus > 5,
          reason:
            totalBonus > 5
              ? `The ${moonEffects.phase.toLowerCase().replace('_', ' ')} makes fish very active!`
              : `Fish are less active right now.`,
          bonus: totalBonus,
        };
      }

      case 'crime': {
        const detectionMod = moonEffects.crimeDetectionModifier;
        const goldBonus = moonEffects.crimeBonusGold;
        return {
          isGood: detectionMod < 1.0,
          reason:
            detectionMod < 1.0
              ? 'The darkness provides excellent cover for criminal activity.'
              : 'The bright moon makes it risky to commit crimes.',
          bonus: goldBonus,
        };
      }

      case 'trading': {
        const roadCondition = seasonalEffects.roadCondition;
        const isGood = roadCondition === 'excellent' || roadCondition === 'good';
        return {
          isGood,
          reason: isGood
            ? `${monthlyTheme.name} has perfect conditions for trade routes.`
            : `${roadCondition} roads make trading difficult.`,
          bonus: isGood ? 10 : -10,
        };
      }

      default:
        return {
          isGood: true,
          reason: 'Normal conditions.',
          bonus: 0,
        };
    }
  }
}

export const seasonService = new SeasonService();
export default seasonService;
