/**
 * Crime Service
 *
 * Handles crime resolution, jail mechanics, wanted levels, and player arrests
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { IAction, ActionType } from '../models/Action.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { TimeService } from './time.service';
import { WeatherService } from './weather.service';
import { CrowdService } from './crowd.service';
import {
  calculateCategoryMultiplier,
  SkillCategory,
  SKILLS,
  CriminalSkillType,
  CRIMINAL_SKILLS,
  calculateCriminalSkillXP
} from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import { withLock } from '../utils/distributedLock';
import karmaService from './karma.service';
import karmaEffectsService from './karmaEffects.service';
import { safeAchievementUpdate, safeAchievementSet } from '../utils/achievementUtils';
import { TerritoryBonusService } from './territoryBonus.service';
import { SkillService } from './skill.service';
import { CharacterProgressionService } from './characterProgression.service';

/**
 * Crime resolution result
 */
export interface CrimeResolutionResult {
  wasWitnessed: boolean;
  wasJailed: boolean;
  jailTimeMinutes: number;
  wantedLevelIncreased: number;
  newWantedLevel: number;
  newBounty: number;
  message: string;
}

/**
 * Arrest result
 */
export interface ArrestResult {
  success: boolean;
  bountyEarned: number;
  targetJailTime: number;
  message: string;
}

export class CrimeService {
  /**
   * Get the highest cunning skill level for a character
   * Used to determine the cunning category multiplier
   *
   * BALANCE FIX (Phase 4.1): Skill unlock bonuses are now multiplicative
   */
  static getHighestCunningSkillLevel(character: ICharacter): number {
    let highestLevel = 0;

    for (const skill of character.skills) {
      // Check if this is a CUNNING category skill
      const skillDef = SKILLS[skill.skillId.toUpperCase()];
      if (skillDef && skillDef.category === SkillCategory.CUNNING) {
        highestLevel = Math.max(highestLevel, skill.level);
      }
    }

    return highestLevel;
  }

  /**
   * Get the cunning category multiplier for a character
   * Higher multiplier = better at avoiding detection
   *
   * BALANCE FIX (Phase 4.1): Multiplicative bonuses
   * - Level 15: ×1.05 (Quick Fingers)
   * - Level 30: ×1.10 (Shadow Walker)
   * - Level 48: ×1.15 (Ghost)
   * - Combined: ×1.328 at level 48+
   */
  static getCunningCategoryMultiplier(character: ICharacter): number {
    const highestLevel = this.getHighestCunningSkillLevel(character);
    return calculateCategoryMultiplier(highestLevel, 'CUNNING');
  }

  /**
   * Get character's criminal skill level
   */
  static getCriminalSkillLevel(character: ICharacter, skillType: CriminalSkillType): number {
    // Criminal skills are stored as regular skills with the criminal skill ID
    const skill = character.skills.find(
      s => s.skillId.toLowerCase() === skillType.toLowerCase()
    );
    return skill?.level || 1; // Default to level 1 if not found
  }

  /**
   * Check if character can attempt a crime based on criminal skill requirements
   */
  static canAttemptCrime(
    action: IAction,
    character: ICharacter
  ): { canAttempt: boolean; reason?: string } {
    // Check for required criminal skill
    if (action.requiredCriminalSkill && action.requiredCriminalSkillLevel) {
      const skillType = action.requiredCriminalSkill as CriminalSkillType;
      const requiredLevel = action.requiredCriminalSkillLevel;
      const characterLevel = this.getCriminalSkillLevel(character, skillType);

      if (characterLevel < requiredLevel) {
        const skillDef = CRIMINAL_SKILLS[skillType];
        return {
          canAttempt: false,
          reason: `Requires ${skillDef?.name || skillType} level ${requiredLevel} (you have ${characterLevel})`
        };
      }
    }

    return { canAttempt: true };
  }

  /**
   * Award criminal skill XP after completing a crime
   * Formula: crimeXP * 0.5
   */
  static async awardCriminalSkillXP(
    character: ICharacter,
    action: IAction,
    crimeXP: number
  ): Promise<{ skillId: string; xpGained: number; levelUp?: { newLevel: number } } | null> {
    if (!action.requiredCriminalSkill) {
      return null;
    }

    const skillType = action.requiredCriminalSkill as CriminalSkillType;
    const xpGained = calculateCriminalSkillXP(crimeXP);

    // Find or create the skill entry
    let skillIndex = character.skills.findIndex(
      s => s.skillId.toLowerCase() === skillType.toLowerCase()
    );

    if (skillIndex < 0) {
      // Initialize the criminal skill at level 1
      character.skills.push({
        skillId: skillType,
        level: 1,
        experience: 0,
        totalXpEarned: 0,
        trainingStarted: undefined as any,
        trainingCompletes: undefined as any
      });
      skillIndex = character.skills.length - 1;
    }

    const skill = character.skills[skillIndex];
    skill.experience = (skill.experience || 0) + xpGained;

    // Check for level up using shared formula
    const xpForNextLevel = SkillService.calculateXPForNextLevel(skill.level);
    let levelUp: { newLevel: number } | undefined;

    if (skill.experience >= xpForNextLevel && xpForNextLevel > 0 && skill.level < 50) {
      skill.level += 1;
      skill.experience -= xpForNextLevel;
      levelUp = { newLevel: skill.level };

      logger.info(
        `Criminal skill level up: ${character.name} ${skillType} is now level ${skill.level}`
      );
    }

    // Mark skills as modified for Mongoose
    character.markModified('skills');

    // Update Total Level if criminal skill leveled up
    if (levelUp) {
      SkillService.updateTotalLevel(character);

      // Check Total Level milestones (consistent pattern with other services)
      try {
        await CharacterProgressionService.checkTotalLevelMilestones(
          character._id.toString(),
          character.totalLevel
        );
      } catch (milestoneError) {
        logger.error('Failed to check Total Level milestones for criminal skill:', milestoneError);
      }
    }

    logger.info(
      `Criminal skill XP: ${character.name} gained ${xpGained} ${skillType} XP (${skill.experience}/${xpForNextLevel})`
    );

    return {
      skillId: skillType,
      xpGained,
      levelUp
    };
  }

  /**
   * Resolve a crime attempt after action challenge completes
   * Determines if crime was witnessed and applies consequences
   */
  static async resolveCrimeAttempt(
    action: IAction,
    character: ICharacter,
    actionSuccess: boolean
  ): Promise<CrimeResolutionResult> {
    // Only process CRIME type actions
    if (action.type !== ActionType.CRIME || !action.crimeProperties) {
      return {
        wasWitnessed: false,
        wasJailed: false,
        jailTimeMinutes: 0,
        wantedLevelIncreased: 0,
        newWantedLevel: character.wantedLevel,
        newBounty: character.bountyAmount,
        message: 'Not a crime action'
      };
    }

    const props = action.crimeProperties;
    const baseWitnessChance = props.witnessChance || 0;

    // Apply time-based modifiers to witness chance
    const timeModifier = TimeService.getCrimeDetectionModifier();
    let effectiveWitnessChance = baseWitnessChance * timeModifier;

    // Apply weather-based modifiers to detection chance
    try {
      const weather = await WeatherService.getLocationWeather(character.currentLocation);
      if (weather) {
        const weatherModifier = weather.effects.crimeDetectionModifier;
        effectiveWitnessChance *= weatherModifier;

        if (weatherModifier !== 1.0) {
          logger.info(
            `Weather "${weather.weather}" (intensity: ${weather.intensity}) modified crime detection by ${weatherModifier}x`
          );
        }
      }
    } catch (weatherError) {
      logger.error('Failed to check weather for crime detection modifiers:', weatherError);
    }

    // Apply crowd-based modifiers to detection chance
    try {
      const crowdState = await CrowdService.getCrowdLevel(character.currentLocation);
      if (crowdState) {
        const crowdEffects = CrowdService.getCrimeModifier(crowdState.currentLevel);
        const crowdModifier = crowdEffects.crimeDetectionModifier;
        effectiveWitnessChance *= crowdModifier;

        logger.info(
          `Crowd level "${crowdState.currentLevel}" (${crowdState.estimatedCount}/${crowdState.baseCapacity}) ` +
          `modified crime detection by ${crowdModifier}x. ${crowdEffects.atmosphereBonus}`
        );
      }
    } catch (crowdError) {
      logger.error('Failed to check crowd for crime detection modifiers:', crowdError);
    }

    // BALANCE FIX (Phase 4.1): Apply cunning skill multiplier to reduce detection
    // Higher cunning = lower chance of being witnessed
    // Multiplier increases with skill, so divide to reduce detection chance
    const cunningMultiplier = this.getCunningCategoryMultiplier(character);
    if (cunningMultiplier > 1.0) {
      effectiveWitnessChance /= cunningMultiplier;
      logger.info(
        `Cunning skill multiplier ${cunningMultiplier.toFixed(3)}x reduced witness chance ` +
        `to ${effectiveWitnessChance.toFixed(1)}%`
      );
    }

    // DEITY SYSTEM: Apply karma effects to detection chance
    // Divine blessings/curses can affect luck and detection
    try {
      const karmaEffects = await karmaEffectsService.getActiveEffects(character._id.toString());
      if (karmaEffects.blessingCount > 0 || karmaEffects.curseCount > 0) {
        // Luck bonus reduces detection, luck penalty increases it
        // We invert the modifier since lower detection is better for the criminal
        const luckModifier = karmaEffects.luck_bonus + karmaEffects.deception_bonus;
        if (luckModifier !== 0) {
          // Convert bonus to percentage reduction (e.g., +20 luck = 20% less detection)
          const adjustedChance = effectiveWitnessChance * (1 - luckModifier / 100);
          logger.info(
            `Karma effects (luck: ${luckModifier}) adjusted witness chance from ` +
            `${effectiveWitnessChance.toFixed(1)}% to ${adjustedChance.toFixed(1)}%`
          );
          effectiveWitnessChance = adjustedChance;
        }
      }
    } catch (karmaError) {
      logger.warn('Failed to apply karma effects to crime detection:', karmaError);
    }

    // TERRITORY BONUS: Apply gang territory crime bonuses (Phase 2.2)
    let territoryJailReduction = 1.0; // Store for later use with jail time
    try {
      const crimeBonuses = await TerritoryBonusService.getCrimeBonuses(
        character._id as mongoose.Types.ObjectId
      );
      if (crimeBonuses.hasBonuses) {
        // Apply detection reduction (lower is better for criminal)
        effectiveWitnessChance *= crimeBonuses.bonuses.detection;
        territoryJailReduction = crimeBonuses.bonuses.jail;
        logger.debug(
          `Territory crime bonuses: detection ${crimeBonuses.bonuses.detection}x, jail ${crimeBonuses.bonuses.jail}x`
        );
      }
    } catch (territoryError) {
      logger.warn('Failed to apply territory crime bonus:', territoryError);
    }

    // Check if crime is available at current time
    const crimeAvailability = TimeService.checkCrimeAvailability(
      action.name,
      baseWitnessChance
    );

    // Roll for witness (0-100) using time and weather modified chance
    const witnessRoll = SecureRNG.d100();
    const wasWitnessed = witnessRoll < effectiveWitnessChance;

    let wasJailed = false;
    let jailTimeMinutes = 0;
    let wantedLevelIncreased = 0;

    // If witnessed OR failed, apply consequences
    if (wasWitnessed || !actionSuccess) {
      // Use distributed lock to prevent race conditions when updating wanted level
      await withLock(`lock:wanted:${character._id}`, async () => {
        // Jail the character (with territory jail reduction bonus - Phase 2.2)
        if (props.jailTimeOnFailure && props.jailTimeOnFailure > 0) {
          jailTimeMinutes = Math.max(1, Math.floor(props.jailTimeOnFailure * territoryJailReduction));
          // Pass bailCost from action if available
          const bailCost = props.bailCost || undefined;
          character.sendToJail(jailTimeMinutes, bailCost, action.name);
          wasJailed = true;
        }

        // Increase wanted level
        if (props.wantedLevelIncrease && props.wantedLevelIncrease > 0) {
          wantedLevelIncreased = props.wantedLevelIncrease;
          character.increaseWantedLevel(wantedLevelIncreased);

          // Achievement tracking: Track wanted level for "Most Wanted"
          safeAchievementSet(character._id.toString(), 'bounty_legend', character.wantedLevel, 'crime:wantedLevel');
        }

        // Add bounty when crime is witnessed
        if (wasWitnessed) {
          try {
            const { BountyService } = await import('./bounty.service');
            const { BountyFaction } = await import('@desperados/shared');

            // Determine which faction to add bounty for
            // Most crimes go against Settler Alliance
            let faction = BountyFaction.SETTLER_ALLIANCE;

            // Some crimes might be against other factions
            // (can be customized per crime type later)
            const crimeName = action.name;

            await BountyService.addCrimeBounty(
              character._id.toString(),
              crimeName,
              faction,
              character.currentLocation
            );

            logger.info(`Bounty added for witnessed crime: ${crimeName} by ${character.name}`);
          } catch (bountyError) {
            // Don't fail the crime if bounty system fails
            logger.error('Failed to add bounty for crime:', bountyError);
          }
        }

        await character.save();
      }, { ttl: 30, retries: 3 });

      const timeState = TimeService.getCurrentTimeState();
      logger.info(
        `Crime detected: ${action.name} by character ${character._id}. ` +
        `Witnessed: ${wasWitnessed}, Failed: ${!actionSuccess}, ` +
        `Jail: ${jailTimeMinutes}m, Wanted: +${wantedLevelIncreased}. ` +
        `Time: ${timeState.currentPeriod} (modifier: ${timeModifier.toFixed(2)}x, ` +
        `base witness: ${baseWitnessChance}%, effective: ${effectiveWitnessChance.toFixed(1)}%)`
      );
    }

    // Generate message
    let message = '';
    if (actionSuccess && !wasWitnessed) {
      message = 'You pulled it off! No witnesses, no problems.';

      // DEITY SYSTEM: Record karma action for successful crime
      try {
        const crimeNameLower = action.name.toLowerCase();
        let karmaActionType = 'CRIME_ROBBERY'; // Default

        // Map crime types to karma actions
        if (crimeNameLower.includes('murder') || crimeNameLower.includes('kill')) {
          karmaActionType = 'CRIME_MURDER';
        } else if (crimeNameLower.includes('theft') || crimeNameLower.includes('steal') || crimeNameLower.includes('pickpocket')) {
          // Determine target wealth for karma distinction
          // For now, treat most theft as from the wealthy (less severe karma)
          karmaActionType = 'CRIME_THEFT_RICH';
        } else if (crimeNameLower.includes('assault') || crimeNameLower.includes('beat')) {
          karmaActionType = 'CRIME_ASSAULT';
        } else if (crimeNameLower.includes('arson') || crimeNameLower.includes('fire') || crimeNameLower.includes('burn')) {
          karmaActionType = 'CRIME_ARSON';
        } else if (crimeNameLower.includes('rob')) {
          karmaActionType = 'CRIME_ROBBERY';
        }

        await karmaService.recordAction(
          character._id.toString(),
          karmaActionType,
          `Successful crime: ${action.name} at ${character.currentLocation}`
        );
        logger.debug(`Karma recorded for crime: ${karmaActionType}`);
      } catch (karmaError) {
        logger.warn('Failed to record karma for crime:', karmaError);
      }

      // Achievement tracking: Crime achievements
      safeAchievementUpdate(character._id.toString(), 'petty_thief', 1, 'crime:success');
      safeAchievementUpdate(character._id.toString(), 'criminal_10', 1, 'crime:success');
      safeAchievementUpdate(character._id.toString(), 'criminal_50', 1, 'crime:success');
      safeAchievementUpdate(character._id.toString(), 'criminal_100', 1, 'crime:success');

      // Update quest progress for successful crime
      const crimeType = action.name.toLowerCase().replace(/\s+/g, '_');
      const { QuestService } = await import('./quest.service');
      await QuestService.onCrimeCompleted(character._id.toString(), crimeType);

      // Update reputation - successful crimes hurt settler reputation
      try {
        const { ReputationService } = await import('./reputation.service');
        // Minor crime penalty to Settler Alliance
        await ReputationService.modifyReputation(
          character._id.toString(),
          'settlerAlliance',
          -5,
          `Crime: ${action.name}`
        );
        // Small boost to Frontera for successful outlawry
        await ReputationService.modifyReputation(
          character._id.toString(),
          'frontera',
          2,
          `Crime: ${action.name}`
        );
      } catch (repError) {
        // Don't fail crime if reputation update fails
        logger.error('Failed to update reputation from crime', { error: repError instanceof Error ? repError.message : repError, stack: repError instanceof Error ? repError.stack : undefined });
      }

      // Create reputation spreading event (unwitnessed crime spreads as rumor)
      try {
        const { ReputationSpreadingService } = await import('./reputationSpreading.service');
        const { ReputationEventType } = await import('@desperados/shared');

        await ReputationSpreadingService.createReputationEvent(
          character._id.toString(),
          ReputationEventType.CRIME_COMMITTED,
          character.currentLocation,
          {
            magnitude: 40, // Lower magnitude for unwitnessed
            sentiment: -40,
            faction: 'settlerAlliance',
            description: `${character.name} committed ${action.name}`
          }
        );
      } catch (spreadError) {
        logger.error('Failed to create reputation spreading event for crime:', spreadError);
      }
    } else if (actionSuccess && wasWitnessed) {
      message = 'You succeeded, but someone saw you! The law is coming.';

      // DEITY SYSTEM: Record karma for witnessed crime (higher witness chance)
      // Being witnessed means deities are more likely to notice
      try {
        const crimeNameLower = action.name.toLowerCase();
        let karmaActionType = 'CRIME_ROBBERY';

        if (crimeNameLower.includes('murder') || crimeNameLower.includes('kill')) {
          karmaActionType = 'CRIME_MURDER';
        } else if (crimeNameLower.includes('theft') || crimeNameLower.includes('steal')) {
          karmaActionType = 'CRIME_THEFT_RICH';
        } else if (crimeNameLower.includes('assault') || crimeNameLower.includes('beat')) {
          karmaActionType = 'CRIME_ASSAULT';
        } else if (crimeNameLower.includes('arson') || crimeNameLower.includes('fire')) {
          karmaActionType = 'CRIME_ARSON';
        }

        await karmaService.recordAction(
          character._id.toString(),
          karmaActionType,
          `Witnessed crime: ${action.name} at ${character.currentLocation}`
        );
      } catch (karmaError) {
        logger.warn('Failed to record karma for witnessed crime:', karmaError);
      }

      // Witnessed crimes hurt settler reputation more
      try {
        const { ReputationService } = await import('./reputation.service');
        await ReputationService.modifyReputation(
          character._id.toString(),
          'settlerAlliance',
          -10,
          `Witnessed crime: ${action.name}`
        );
      } catch (repError) {
        logger.error('Failed to update reputation from witnessed crime', { error: repError instanceof Error ? repError.message : repError, stack: repError instanceof Error ? repError.stack : undefined });
      }

      // Create reputation spreading event (witnessed crime spreads widely)
      try {
        const { ReputationSpreadingService } = await import('./reputationSpreading.service');
        const { ReputationEventType } = await import('@desperados/shared');

        // Find a witnessing NPC (simplified - could be enhanced)
        const originNpcId = 'red-gulch-sheriff'; // Default witness

        await ReputationSpreadingService.createReputationEvent(
          character._id.toString(),
          ReputationEventType.CRIME_WITNESSED,
          character.currentLocation,
          {
            magnitude: 80, // High magnitude for witnessed crime
            sentiment: -70,
            faction: 'settlerAlliance',
            originNpcId,
            description: `${character.name} was caught committing ${action.name}`
          }
        );
      } catch (spreadError) {
        logger.error('Failed to create reputation spreading event for witnessed crime:', spreadError);
      }
    } else if (!actionSuccess && wasWitnessed) {
      message = 'You failed AND got caught red-handed! The sheriff is not pleased.';

      // DEITY SYSTEM: Record karma for failed witnessed crime
      // Failed crimes still show intent and attract divine attention
      try {
        const crimeNameLower = action.name.toLowerCase();
        let karmaActionType = 'CRIME_ROBBERY';

        if (crimeNameLower.includes('murder') || crimeNameLower.includes('kill')) {
          karmaActionType = 'CRIME_MURDER';
        } else if (crimeNameLower.includes('theft') || crimeNameLower.includes('steal')) {
          karmaActionType = 'CRIME_THEFT_RICH';
        } else if (crimeNameLower.includes('assault') || crimeNameLower.includes('beat')) {
          karmaActionType = 'CRIME_ASSAULT';
        } else if (crimeNameLower.includes('arson') || crimeNameLower.includes('fire')) {
          karmaActionType = 'CRIME_ARSON';
        }

        await karmaService.recordAction(
          character._id.toString(),
          karmaActionType,
          `Failed crime attempt: ${action.name} at ${character.currentLocation}`
        );
      } catch (karmaError) {
        logger.warn('Failed to record karma for failed crime:', karmaError);
      }

      // Failed and caught hurts settler rep significantly
      try {
        const { ReputationService } = await import('./reputation.service');
        await ReputationService.modifyReputation(
          character._id.toString(),
          'settlerAlliance',
          -15,
          `Failed and caught: ${action.name}`
        );
      } catch (repError) {
        logger.error('Failed to update reputation from failed crime', { error: repError instanceof Error ? repError.message : repError, stack: repError instanceof Error ? repError.stack : undefined });
      }

      // Create reputation spreading event (failed crime witnessed - spreads with mockery)
      try {
        const { ReputationSpreadingService } = await import('./reputationSpreading.service');
        const { ReputationEventType } = await import('@desperados/shared');

        const originNpcId = 'red-gulch-sheriff';

        await ReputationSpreadingService.createReputationEvent(
          character._id.toString(),
          ReputationEventType.CRIME_WITNESSED,
          character.currentLocation,
          {
            magnitude: 70,
            sentiment: -85, // Very negative
            faction: 'settlerAlliance',
            originNpcId,
            description: `${character.name} was caught and failed at ${action.name}`
          }
        );
      } catch (spreadError) {
        logger.error('Failed to create reputation spreading event for failed crime:', spreadError);
      }
    } else {
      message = 'You failed, but at least nobody saw you mess up.';
    }

    return {
      wasWitnessed,
      wasJailed,
      jailTimeMinutes,
      wantedLevelIncreased,
      newWantedLevel: character.wantedLevel,
      newBounty: character.bountyAmount,
      message
    };
  }

  /**
   * Pay bail to escape jail early
   * Costs dollars based on wanted level
   * Uses a single atomic findOneAndUpdate to avoid WriteConflict issues
   */
  static async payBail(characterId: string): Promise<{
    success: boolean;
    error?: string;
    dollarsSpent?: number;
    message?: string;
  }> {
    try {
      // First, get character to calculate bail cost and validate
      const character = await Character.findById(characterId);

      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      // Check if actually jailed
      if (!character.isCurrentlyJailed()) {
        return { success: false, error: 'Character is not jailed' };
      }

      // Calculate bail cost - use stored bailCost from last crime, otherwise formula
      const bailCost = character.lastBailCost > 0
        ? character.lastBailCost
        : character.wantedLevel * 50;

      // Single atomic update: deduct dollars AND release from jail
      // The $gte check ensures we have enough dollars (prevents double-spending)
      const result = await Character.findOneAndUpdate(
        {
          _id: characterId,
          $or: [
            { dollars: { $gte: bailCost } },
            { dollars: { $exists: false }, gold: { $gte: bailCost } }
          ]
        },
        {
          $inc: { dollars: -bailCost, gold: -bailCost },
          $set: { isJailed: false, jailedUntil: null }
        },
        { new: true }
      );

      if (!result) {
        // Either character not found or insufficient funds
        return {
          success: false,
          error: `Insufficient dollars. Need ${bailCost} dollars, have ${character.dollars ?? character.gold ?? 0}.`
        };
      }

      logger.info(`Character ${characterId} paid ${bailCost} dollars bail and was released`);

      return {
        success: true,
        dollarsSpent: bailCost,
        message: `You paid ${bailCost} dollars and walked free. The sheriff tips his hat as you leave.`
      };
    } catch (error) {
      logger.error('Error paying bail:', error);
      throw error;
    }
  }

  /**
   * Lay low to reduce wanted level
   * Costs time OR dollars
   * Uses a single atomic findOneAndUpdate to avoid WriteConflict issues
   */
  static async layLow(
    characterId: string,
    useDollars: boolean
  ): Promise<{
    success: boolean;
    error?: string;
    newWantedLevel?: number;
    costPaid?: string;
  }> {
    try {
      // First, get character to validate
      const character = await Character.findById(characterId);

      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      // Check if has wanted level
      if (character.wantedLevel === 0) {
        return { success: false, error: 'No wanted level to reduce' };
      }

      const dollarsCost = 50;
      let updateResult;

      if (useDollars) {
        // Single atomic update: deduct dollars AND reduce wanted level
        // The $gte check ensures we have enough dollars
        updateResult = await Character.findOneAndUpdate(
          {
            _id: characterId,
            wantedLevel: { $gt: 0 },
            $or: [
              { dollars: { $gte: dollarsCost } },
              { dollars: { $exists: false }, gold: { $gte: dollarsCost } }
            ]
          },
          [
            { $set: {
              dollars: { $subtract: ['$dollars', dollarsCost] },
              gold: { $subtract: ['$gold', dollarsCost] },
              wantedLevel: { $max: [0, { $subtract: ['$wantedLevel', 1] }] }
            }},
            { $set: {
              bountyAmount: { $multiply: ['$wantedLevel', 100] }
            }}
          ],
          { new: true }
        );

        if (!updateResult) {
          return {
            success: false,
            error: `Insufficient dollars. Need ${dollarsCost} dollars, have ${character.dollars ?? character.gold ?? 0}.`
          };
        }
      } else {
        // Time cost only - just reduce wanted level (no dollars involved)
        updateResult = await Character.findOneAndUpdate(
          { _id: characterId, wantedLevel: { $gt: 0 } },
          [
            { $set: {
              wantedLevel: { $max: [0, { $subtract: ['$wantedLevel', 1] }] }
            }},
            { $set: {
              bountyAmount: { $multiply: ['$wantedLevel', 100] }
            }}
          ],
          { new: true }
        );

        if (!updateResult) {
          return { success: false, error: 'Failed to reduce wanted level' };
        }
      }

      logger.info(`Character ${characterId} laid low, wanted level reduced to ${updateResult.wantedLevel}`);

      return {
        success: true,
        newWantedLevel: updateResult.wantedLevel,
        costPaid: useDollars ? '50 dollars' : '30 minutes'
      };
    } catch (error) {
      logger.error('Error laying low:', error);
      throw error;
    }
  }

  /**
   * Player arrests another player
   * Bounty hunter mechanic
   */
  static async arrestPlayer(
    arresterCharacterId: string,
    targetCharacterId: string
  ): Promise<ArrestResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const arrester = await Character.findById(arresterCharacterId).session(session);
      const target = await Character.findById(targetCharacterId).session(session);

      if (!arrester) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          bountyEarned: 0,
          targetJailTime: 0,
          message: 'Arrester character not found'
        };
      }

      if (!target) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          bountyEarned: 0,
          targetJailTime: 0,
          message: 'Target character not found'
        };
      }

      // Can't arrest yourself
      if (arresterCharacterId === targetCharacterId) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          bountyEarned: 0,
          targetJailTime: 0,
          message: 'You cannot arrest yourself'
        };
      }

      // Check if arrester can arrest (not jailed, cooldown check)
      if (!arrester.canArrestTarget(targetCharacterId)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          bountyEarned: 0,
          targetJailTime: 0,
          message: 'You cannot arrest this target yet (cooldown or you are jailed)'
        };
      }

      // Check if target can be arrested (wanted >= 3, not already jailed)
      if (!target.canBeArrested()) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          bountyEarned: 0,
          targetJailTime: 0,
          message: 'Target cannot be arrested (not wanted enough or already in jail)'
        };
      }

      // Calculate jail time based on wanted level (30 minutes per level)
      const jailTimeMinutes = target.wantedLevel * 30;
      const bountyAmount = target.bountyAmount;

      // Jail the target
      target.sendToJail(jailTimeMinutes, undefined, 'Arrested by Bounty Hunter');
      target.wantedLevel = 0;
      target.bountyAmount = 0;
      target.lastArrestTime = new Date();

      // Award bounty to arrester using DollarService (transaction-safe)
      if (bountyAmount > 0) {
        const { DollarService } = await import('./dollar.service');
        await DollarService.addDollars(
          arrester._id as any,
          bountyAmount,
          TransactionSource.BOUNTY_REWARD,
          {
            targetCharacterId: target._id,
            targetName: target.name,
            targetWantedLevel: target.wantedLevel,
            description: `Arrested ${target.name} and earned ${bountyAmount} dollars bounty reward`,
          },
          session
        );
      }

      // Record arrest cooldown
      arrester.recordArrest(targetCharacterId);

      await target.save({ session });
      await arrester.save({ session });

      await session.commitTransaction();
      session.endSession();

      // DEITY SYSTEM: Record karma for bringing criminal to justice
      try {
        await karmaService.recordAction(
          arresterCharacterId,
          'TURNED_IN_CRIMINAL',
          `Arrested ${target.name} (Wanted Level: ${jailTimeMinutes / 30})`
        );
        logger.debug('Karma recorded for arrest: TURNED_IN_CRIMINAL');
      } catch (karmaError) {
        logger.warn('Failed to record karma for arrest:', karmaError);
      }

      logger.info(
        `Character ${arresterCharacterId} arrested ${targetCharacterId}. ` +
        `Bounty: ${bountyAmount} dollars, Jail: ${jailTimeMinutes}m`
      );

      return {
        success: true,
        bountyEarned: bountyAmount,
        targetJailTime: jailTimeMinutes,
        message: `You brought ${target.name} to justice! Earned ${bountyAmount} dollars bounty.`
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error arresting player:', error);
      throw error;
    }
  }

  /**
   * Decay wanted levels for all characters (background job)
   * Reduces wanted level by 1 if 24h has elapsed
   *
   * PERFORMANCE FIX: Uses updateMany instead of individual saves to avoid N+1 query problem
   * Previous implementation: 500+ individual save() calls per batch
   * Current implementation: Single updateMany() per batch
   */
  static async decayWantedLevels(): Promise<{
    charactersDecayed: number;
    totalReduced: number;
  }> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const now = new Date();

      // Use updateMany with aggregation pipeline for atomic update
      // This replaces the N+1 pattern of: find -> loop -> save each
      const result = await Character.updateMany(
        {
          wantedLevel: { $gt: 0 },
          isActive: true,
          lastWantedDecay: { $lte: twentyFourHoursAgo }
        },
        [
          {
            $set: {
              // Decrease wanted level by 1, minimum 0
              wantedLevel: { $max: [0, { $subtract: ['$wantedLevel', 1] }] },
              // Recalculate bounty: (wantedLevel - 1) * 100
              bountyAmount: { $multiply: [{ $max: [0, { $subtract: ['$wantedLevel', 1] }] }, 100] },
              // Update last decay timestamp
              lastWantedDecay: now
            }
          }
        ]
      );

      const charactersDecayed = result.modifiedCount;
      const totalReduced = charactersDecayed; // Each character decreases by 1

      logger.info(`Wanted level decay: ${charactersDecayed} characters, ${totalReduced} levels reduced`);

      return {
        charactersDecayed,
        totalReduced
      };
    } catch (error) {
      logger.error('Error decaying wanted levels:', error);
      throw error;
    }
  }

  /**
   * Get all characters with bounties (wanted >= 3)
   */
  static async getBountyList(): Promise<Array<{
    characterId: string;
    name: string;
    level: number;
    wantedLevel: number;
    bountyAmount: number;
    location: string;
    lastActive: Date;
  }>> {
    try {
      const wanted = await Character.find({
        wantedLevel: { $gte: 3 },
        isJailed: false,
        isActive: true
      }).select('name level wantedLevel bountyAmount currentLocation lastActive');

      return wanted.map(char => ({
        characterId: (char._id as any).toString(),
        name: char.name,
        level: char.level,
        wantedLevel: char.wantedLevel,
        bountyAmount: char.bountyAmount,
        location: char.currentLocation,
        lastActive: char.lastActive
      }));
    } catch (error) {
      logger.error('Error fetching bounty list:', error);
      throw error;
    }
  }
}
