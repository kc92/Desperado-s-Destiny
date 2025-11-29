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
import logger from '../utils/logger';

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

    // Check if crime is available at current time
    const crimeAvailability = TimeService.checkCrimeAvailability(
      action.name,
      baseWitnessChance
    );

    // Roll for witness (0-100) using time and weather modified chance
    const witnessRoll = Math.random() * 100;
    const wasWitnessed = witnessRoll < effectiveWitnessChance;

    let wasJailed = false;
    let jailTimeMinutes = 0;
    let wantedLevelIncreased = 0;

    // If witnessed OR failed, apply consequences
    if (wasWitnessed || !actionSuccess) {
      // Jail the character
      if (props.jailTimeOnFailure && props.jailTimeOnFailure > 0) {
        jailTimeMinutes = props.jailTimeOnFailure;
        // Pass bailCost from action if available
        const bailCost = props.bailCost || undefined;
        character.sendToJail(jailTimeMinutes, bailCost);
        wasJailed = true;
      }

      // Increase wanted level
      if (props.wantedLevelIncrease && props.wantedLevelIncrease > 0) {
        wantedLevelIncreased = props.wantedLevelIncrease;
        character.increaseWantedLevel(wantedLevelIncreased);
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
        console.error('Failed to update reputation from crime:', repError);
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
        console.error('Failed to update reputation from witnessed crime:', repError);
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
        console.error('Failed to update reputation from failed crime:', repError);
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
   * Costs gold based on wanted level
   */
  static async payBail(characterId: string): Promise<{
    success: boolean;
    error?: string;
    goldSpent?: number;
    message?: string;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);

      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character not found' };
      }

      // Check if actually jailed
      if (!character.isCurrentlyJailed()) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character is not jailed' };
      }

      // Calculate bail cost - use stored bailCost from last crime, otherwise formula
      const bailCost = character.lastBailCost > 0
        ? character.lastBailCost
        : character.wantedLevel * 50;

      // Check if character has enough gold
      if (!character.hasGold(bailCost)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: `Insufficient gold. Need ${bailCost} gold, have ${character.gold}.`
        };
      }

      // Deduct gold using GoldService (transaction-safe)
      const { GoldService } = await import('./gold.service');
      await GoldService.deductGold(
        character._id as any,
        bailCost,
        TransactionSource.BAIL_PAYMENT,
        {
          wantedLevel: character.wantedLevel,
          description: `Paid ${bailCost} gold bail to escape jail (Wanted Level: ${character.wantedLevel})`,
        },
        session
      );

      // Release from jail
      character.releaseFromJail();
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} paid ${bailCost} gold bail and was released`);

      return {
        success: true,
        goldSpent: bailCost,
        message: `You paid ${bailCost} gold and walked free. The sheriff tips his hat as you leave.`
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error paying bail:', error);
      throw error;
    }
  }

  /**
   * Lay low to reduce wanted level
   * Costs time OR gold
   */
  static async layLow(
    characterId: string,
    useGold: boolean
  ): Promise<{
    success: boolean;
    error?: string;
    newWantedLevel?: number;
    costPaid?: string;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);

      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character not found' };
      }

      // Check if has wanted level
      if (character.wantedLevel === 0) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'No wanted level to reduce' };
      }

      if (useGold) {
        const goldCost = 50;

        // Check if character has enough gold
        if (!character.hasGold(goldCost)) {
          await session.abortTransaction();
          session.endSession();
          return {
            success: false,
            error: `Insufficient gold. Need ${goldCost} gold, have ${character.gold}.`
          };
        }

        // Deduct gold using GoldService (transaction-safe)
        const { GoldService } = await import('./gold.service');
        await GoldService.deductGold(
          character._id as any,
          goldCost,
          TransactionSource.LAY_LOW_PAYMENT,
          {
            wantedLevel: character.wantedLevel,
            description: `Paid ${goldCost} gold to lay low and reduce wanted level`,
          },
          session
        );
      } else {
        // Time cost: 30 minutes (could implement actual waiting time)
        // For MVP, we'll just apply the reduction immediately
        // In production, this could work like skill training
      }

      // Reduce wanted level by 1
      character.decreaseWantedLevel(1);
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} laid low, wanted level reduced to ${character.wantedLevel}`);

      return {
        success: true,
        newWantedLevel: character.wantedLevel,
        costPaid: useGold ? '50 gold' : '30 minutes'
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
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
      target.sendToJail(jailTimeMinutes);
      target.wantedLevel = 0;
      target.bountyAmount = 0;
      target.lastArrestTime = new Date();

      // Award bounty to arrester using GoldService (transaction-safe)
      if (bountyAmount > 0) {
        const { GoldService } = await import('./gold.service');
        await GoldService.addGold(
          arrester._id as any,
          bountyAmount,
          TransactionSource.BOUNTY_REWARD,
          {
            targetCharacterId: target._id,
            targetName: target.name,
            targetWantedLevel: target.wantedLevel,
            description: `Arrested ${target.name} and earned ${bountyAmount} gold bounty reward`,
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

      logger.info(
        `Character ${arresterCharacterId} arrested ${targetCharacterId}. ` +
        `Bounty: ${bountyAmount} gold, Jail: ${jailTimeMinutes}m`
      );

      return {
        success: true,
        bountyEarned: bountyAmount,
        targetJailTime: jailTimeMinutes,
        message: `You brought ${target.name} to justice! Earned ${bountyAmount} gold bounty.`
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
   */
  static async decayWantedLevels(): Promise<{
    charactersDecayed: number;
    totalReduced: number;
  }> {
    try {
      // Find all characters with wanted level > 0
      const characters = await Character.find({
        wantedLevel: { $gt: 0 },
        isActive: true
      });

      let charactersDecayed = 0;
      let totalReduced = 0;

      for (const character of characters) {
        const decayed = character.decayWantedLevel();
        if (decayed) {
          charactersDecayed++;
          totalReduced++;
          await character.save();
        }
      }

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
