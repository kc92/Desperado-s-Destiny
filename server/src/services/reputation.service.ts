/**
 * Reputation Service
 * Handles faction reputation changes and standing calculations
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { ReputationHistory, IReputationHistory } from '../models/ReputationHistory.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { WorldEventService } from './worldEvent.service';

export type Faction = 'settlerAlliance' | 'nahiCoalition' | 'frontera';
export type Standing = 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'honored';

export interface ReputationChange {
  newRep: number;
  standing: Standing;
  changed: boolean;
  standingChanged?: boolean;
  previousStanding?: Standing;
}

export interface FactionStanding {
  rep: number;
  standing: Standing;
}

export class ReputationService {
  /**
   * Modify faction reputation for a character
   */
  static async modifyReputation(
    characterId: string,
    faction: Faction,
    amount: number,
    reason: string
  ): Promise<ReputationChange> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Apply world event reputation_modifier
      let modifiedAmount = amount;
      if (character.currentLocation) {
        try {
          const activeEvents = await WorldEventService.getActiveEventsForLocation(character.currentLocation);
          for (const event of activeEvents) {
            const repMod = event.worldEffects.find(e => e.type === 'reputation_modifier');
            if (repMod && (repMod.target === 'all' || repMod.target === faction)) {
              const oldAmount = modifiedAmount;
              modifiedAmount = Math.floor(modifiedAmount * repMod.value);
              logger.info(
                `World event "${event.name}" modified reputation change from ${oldAmount} to ${modifiedAmount} ` +
                `(${repMod.value}x modifier: ${repMod.description})`
              );
            }
          }
        } catch (eventError) {
          // Don't fail reputation change if event check fails
          logger.error('Failed to check world events for reputation modifiers:', eventError);
        }
      }

      // Get current reputation
      const previousValue = character.factionReputation[faction];
      const previousStanding = this.getStanding(previousValue);

      // Calculate new reputation (capped at -100 to 100)
      const newRep = Math.max(-100, Math.min(100, previousValue + modifiedAmount));
      const newStanding = this.getStanding(newRep);

      // Check if anything actually changed
      const changed = previousValue !== newRep;
      const standingChanged = previousStanding !== newStanding;

      if (changed) {
        // Update character reputation
        character.factionReputation[faction] = newRep;
        await character.save({ session });

        // Create history record (using modifiedAmount for actual change applied)
        await ReputationHistory.create([{
          characterId,
          faction,
          change: modifiedAmount,
          reason,
          previousValue,
          newValue: newRep,
          timestamp: new Date()
        }], { session });

        logger.info(
          `Reputation changed: Character ${characterId}, Faction ${faction}, ` +
          `${previousValue} -> ${newRep} (${modifiedAmount > 0 ? '+' : ''}${modifiedAmount}), ` +
          `Standing: ${previousStanding} -> ${newStanding}, Reason: ${reason}`
        );
      }

      await session.commitTransaction();

      return {
        newRep,
        standing: newStanding,
        changed,
        standingChanged,
        previousStanding: standingChanged ? previousStanding : undefined
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error modifying reputation:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get standing from reputation number
   */
  static getStanding(reputation: number): Standing {
    if (reputation >= 75) return 'honored';
    if (reputation >= 25) return 'friendly';
    if (reputation >= 0) return 'neutral';
    if (reputation >= -50) return 'unfriendly';
    return 'hostile';
  }

  /**
   * Get minimum reputation value for a standing
   */
  static getStandingThreshold(standing: Standing): number {
    switch (standing) {
      case 'hostile':
        return -100;
      case 'unfriendly':
        return -50;
      case 'neutral':
        return 0;
      case 'friendly':
        return 25;
      case 'honored':
        return 75;
    }
  }

  /**
   * Get all faction standings for a character
   */
  static async getAllStandings(characterId: string): Promise<Record<Faction, FactionStanding>> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    return {
      settlerAlliance: {
        rep: character.factionReputation.settlerAlliance,
        standing: this.getStanding(character.factionReputation.settlerAlliance)
      },
      nahiCoalition: {
        rep: character.factionReputation.nahiCoalition,
        standing: this.getStanding(character.factionReputation.nahiCoalition)
      },
      frontera: {
        rep: character.factionReputation.frontera,
        standing: this.getStanding(character.factionReputation.frontera)
      }
    };
  }

  /**
   * Check if character meets faction requirement
   */
  static async meetsRequirement(
    characterId: string,
    faction: Faction,
    minStanding: Standing
  ): Promise<boolean> {
    const standings = await this.getAllStandings(characterId);
    const currentRep = standings[faction].rep;
    const requiredRep = this.getStandingThreshold(minStanding);

    return currentRep >= requiredRep;
  }

  /**
   * Calculate price modifier based on faction standing
   * hostile = 1.3 (30% markup)
   * unfriendly = 1.15 (15% markup)
   * neutral = 1.0 (normal price)
   * friendly = 0.9 (10% discount)
   * honored = 0.8 (20% discount)
   */
  static getPriceModifier(standing: Standing): number {
    switch (standing) {
      case 'hostile':
        return 1.3;
      case 'unfriendly':
        return 1.15;
      case 'neutral':
        return 1.0;
      case 'friendly':
        return 0.9;
      case 'honored':
        return 0.8;
    }
  }

  /**
   * Get reputation change for action type
   */
  static getReputationChange(
    actionType: 'quest_complete' | 'crime' | 'kill_npc' | 'help_faction' | 'betray_faction',
    targetFaction: Faction,
    magnitude: 'minor' | 'major' = 'minor'
  ): number {
    const multiplier = magnitude === 'major' ? 2 : 1;

    switch (actionType) {
      case 'quest_complete':
        return 10 * multiplier; // +10 or +20
      case 'help_faction':
        return 5 * multiplier; // +5 or +10
      case 'crime':
        return -5 * multiplier; // -5 or -10
      case 'kill_npc':
        return -15 * multiplier; // -15 or -30
      case 'betray_faction':
        return -25 * multiplier; // -25 or -50
    }
  }

  /**
   * Get reputation history for a character
   */
  static async getReputationHistory(
    characterId: string,
    faction?: Faction,
    limit: number = 50
  ): Promise<IReputationHistory[]> {
    const query: any = { characterId };
    if (faction) {
      query.faction = faction;
    }

    return ReputationHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean() as any as IReputationHistory[];
  }

  /**
   * Apply rival faction penalties
   * Helping one faction may hurt another
   */
  static async applyRivalPenalties(
    characterId: string,
    helpedFaction: Faction,
    amount: number,
    reason: string
  ): Promise<void> {
    // Only apply penalties for significant positive gains
    if (amount <= 0) return;

    const rivalPenalty = Math.floor(amount * 0.3); // 30% of gain becomes penalty to rivals

    // Define rival relationships
    const rivals: Record<Faction, Faction[]> = {
      settlerAlliance: ['frontera'], // Settlers vs Frontera
      nahiCoalition: [], // Nahi are neutral-ish
      frontera: ['settlerAlliance'] // Frontera vs Settlers
    };

    const rivalFactions = rivals[helpedFaction];
    for (const rivalFaction of rivalFactions) {
      await this.modifyReputation(
        characterId,
        rivalFaction,
        -rivalPenalty,
        `${reason} (rival penalty)`
      );
    }
  }

  /**
   * Get faction-specific benefits description
   */
  static getFactionBenefits(faction: Faction, standing: Standing): string[] {
    const benefits: string[] = [];

    // Common benefits based on standing
    switch (standing) {
      case 'hostile':
        benefits.push('30% price increase', 'May be attacked on sight', 'Denied faction services');
        break;
      case 'unfriendly':
        benefits.push('15% price increase', 'Limited access to services');
        break;
      case 'neutral':
        benefits.push('Normal prices', 'Standard access');
        break;
      case 'friendly':
        benefits.push('10% price discount', 'Access to special quests');
        break;
      case 'honored':
        benefits.push('20% price discount', 'Access to exclusive items', 'Faction champion status');
        break;
    }

    // Faction-specific benefits
    if (standing === 'friendly' || standing === 'honored') {
      switch (faction) {
        case 'settlerAlliance':
          benefits.push('Railroad fast travel', 'Bank vault access');
          break;
        case 'nahiCoalition':
          benefits.push('Spirit guide assistance', 'Sacred site access');
          break;
        case 'frontera':
          benefits.push('Black market access', 'Cantina rumors');
          break;
      }
    }

    return benefits;
  }

  /**
   * Bulk update reputation (for admin/testing)
   */
  static async bulkUpdateReputation(
    characterId: string,
    updates: Partial<Record<Faction, number>>,
    reason: string = 'Admin action'
  ): Promise<Record<Faction, ReputationChange>> {
    const results: Partial<Record<Faction, ReputationChange>> = {};

    for (const [faction, amount] of Object.entries(updates)) {
      if (amount !== undefined) {
        results[faction as Faction] = await this.modifyReputation(
          characterId,
          faction as Faction,
          amount,
          reason
        );
      }
    }

    return results as Record<Faction, ReputationChange>;
  }
}
