/**
 * Property Income Service
 *
 * Phase 7: Property System Completion - Income Implementation
 * Handles property income accumulation, collection, and visit-to-collect mechanic
 */

import mongoose from 'mongoose';
import { Property, IProperty } from '../models/Property.model';
import { Character } from '../models/Character.model';
import { DollarService } from './dollar.service';
import { TerritoryBonusService } from './territoryBonus.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import logger from '../utils/logger';

/**
 * Property Income Service
 * Implements visit-to-collect mechanic with hourly accumulation and 7-day cap
 */
export class PropertyIncomeService {
  /**
   * Maximum hours of income that can accumulate (7 days)
   */
  private static readonly MAX_ACCUMULATION_HOURS = 168; // 7 days * 24 hours

  /**
   * Calculate accumulated income for a property
   * Income accumulates hourly, caps at 7 days (168 hours)
   *
   * @param propertyId - Property ID to calculate income for
   * @returns Income details including base, bonus, total, and hours accumulated
   */
  static async calculateAccumulatedIncome(propertyId: string): Promise<{
    baseIncome: number;
    bonusIncome: number;
    totalIncome: number;
    hoursAccumulated: number;
    cappedAt: number;
    // Phase 14: Condition impact info
    conditionMultiplier: number;
    conditionTier: string;
  }> {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Get last collection time (default to property purchase date or creation)
    const lastCollection = property.lastIncomeCollection || property.purchaseDate || property.createdAt;

    // Calculate hours since last collection
    const now = Date.now();
    const hoursSinceCollection = (now - lastCollection.getTime()) / (1000 * 60 * 60);

    // Cap at MAX_ACCUMULATION_HOURS (7 days)
    const hoursAccumulated = Math.min(this.MAX_ACCUMULATION_HOURS, hoursSinceCollection);

    // If less than 1 hour, no income to collect
    if (hoursAccumulated < 1) {
      return {
        baseIncome: 0,
        bonusIncome: 0,
        totalIncome: 0,
        hoursAccumulated,
        cappedAt: this.MAX_ACCUMULATION_HOURS,
        // Phase 14: Condition impact
        conditionMultiplier: property.getIncomeMultiplier(),
        conditionTier: property.getConditionTier(),
      };
    }

    // Calculate daily rate and convert to hourly
    const dailyRate = this.calculateDailyRate(property);
    const hourlyRate = dailyRate / 24;

    // Calculate base income (floor to prevent fractional cents)
    const baseIncome = Math.floor(hourlyRate * hoursAccumulated);

    // Calculate territory bonus if property has owner
    let bonusMultiplier = 1.0;
    if (property.ownerId) {
      try {
        // Get character's gang to check for territory bonuses
        const character = await Character.findById(property.ownerId).select('gangId');
        if (character && character.gangId) {
          const bonusResult = await TerritoryBonusService.getPropertyBonuses(
            property.locationId,
            character.gangId as mongoose.Types.ObjectId
          );

          // Apply property income bonus if it exists
          if (bonusResult.bonuses && bonusResult.bonuses.income) {
            bonusMultiplier = 1 + bonusResult.bonuses.income;
          }
        }
      } catch (error) {
        logger.error('Error fetching territory bonuses for property income:', error);
        // Continue with default multiplier
      }
    }

    // Calculate total income with bonuses
    const totalIncome = Math.floor(baseIncome * bonusMultiplier);
    const bonusIncome = totalIncome - baseIncome;

    return {
      baseIncome,
      bonusIncome,
      totalIncome,
      hoursAccumulated: Math.floor(hoursAccumulated),
      cappedAt: this.MAX_ACCUMULATION_HOURS,
      // Phase 14: Condition impact
      conditionMultiplier: property.getIncomeMultiplier(),
      conditionTier: property.getConditionTier(),
    };
  }

  /**
   * Collect income from property (visit-to-collect mechanic)
   * Requires character to be at property location
   *
   * @param characterId - Character collecting income
   * @param propertyId - Property to collect from
   * @returns Collection details including amount collected and next collection time
   */
  static async collectIncome(
    characterId: mongoose.Types.ObjectId,
    propertyId: string
  ): Promise<{
    collected: number;
    bonusApplied: number;
    nextCollection: Date;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Fetch property and character
      const property = await Property.findById(propertyId).session(session);
      if (!property) {
        throw new Error('Property not found');
      }

      // Verify ownership
      if (!property.ownerId || property.ownerId.toString() !== characterId.toString()) {
        throw new Error('You do not own this property');
      }

      // Verify property is active
      if (property.status !== 'active') {
        throw new Error('Property must be active to collect income');
      }

      // Get character to verify location
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Verify character is at property location (visit-to-collect)
      if (character.currentLocation !== property.locationId) {
        throw new Error('You must visit the property to collect income');
      }

      // Calculate accumulated income
      const incomeDetails = await this.calculateAccumulatedIncome(propertyId);

      // If no income to collect, return early
      if (incomeDetails.totalIncome === 0) {
        await session.abortTransaction();
        session.endSession();

        return {
          collected: 0,
          bonusApplied: 0,
          nextCollection: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        };
      }

      // Award income using DollarService
      await DollarService.addDollars(
        characterId,
        incomeDetails.totalIncome,
        TransactionSource.PROPERTY_INCOME,
        {
          propertyId: property._id.toString(),
          propertyName: property.name,
          propertyType: property.propertyType,
          hoursAccumulated: incomeDetails.hoursAccumulated,
          baseIncome: incomeDetails.baseIncome,
          bonusIncome: incomeDetails.bonusIncome,
          currencyType: 'DOLLAR',
        },
        session
      );

      // Update last collection time
      property.lastIncomeCollection = new Date();
      await property.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Property income collected: Character ${character.name} collected $${incomeDetails.totalIncome} ` +
        `from ${property.name} (${incomeDetails.hoursAccumulated} hours accumulated)`
      );

      return {
        collected: incomeDetails.totalIncome,
        bonusApplied: incomeDetails.bonusIncome,
        nextCollection: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error collecting property income:', error);
      throw error;
    }
  }

  /**
   * Get all properties with pending income for a character
   *
   * @param characterId - Character to check properties for
   * @returns Array of properties with pending income details
   */
  static async getPropertiesWithIncome(
    characterId: mongoose.Types.ObjectId
  ): Promise<Array<{
    propertyId: string;
    propertyName: string;
    propertyType: string;
    pendingIncome: number;
    location: string;
    hoursAccumulated: number;
    // Phase 14: Condition info for UI warnings
    condition: number;
    conditionTier: string;
    incomeMultiplier: number;
    needsWarning: boolean;
    isCritical: boolean;
  }>> {
    // Find all active properties owned by character
    const properties = await Property.find({
      ownerId: characterId,
      status: 'active',
    });

    const propertiesWithIncome = [];

    for (const property of properties) {
      try {
        const incomeDetails = await this.calculateAccumulatedIncome(property._id.toString());

        // Only include properties with income > 0
        if (incomeDetails.totalIncome > 0) {
          propertiesWithIncome.push({
            propertyId: property._id.toString(),
            propertyName: property.name,
            propertyType: property.propertyType,
            pendingIncome: incomeDetails.totalIncome,
            location: property.locationId,
            hoursAccumulated: incomeDetails.hoursAccumulated,
            // Phase 14: Condition info for UI warnings
            condition: property.condition,
            conditionTier: property.getConditionTier(),
            incomeMultiplier: property.getIncomeMultiplier(),
            needsWarning: property.shouldWarnAboutCondition(),
            isCritical: property.isConditionCritical(),
          });
        }
      } catch (error) {
        logger.error(`Error calculating income for property ${property._id}:`, error);
        // Continue with next property
      }
    }

    return propertiesWithIncome;
  }

  /**
   * Calculate daily income rate for a property
   * Based on property type, tier, condition, and upgrades
   *
   * @param property - Property to calculate income for
   * @returns Daily income rate in dollars
   */
  static calculateDailyRate(property: IProperty): number {
    // Use existing calculateWeeklyIncome method and convert to daily
    const weeklyIncome = property.calculateWeeklyIncome();
    const dailyIncome = weeklyIncome / 7;

    // Apply income modifiers if they exist
    let totalModifier = 1.0;
    if ((property as any).incomeModifiers && Array.isArray((property as any).incomeModifiers)) {
      const now = new Date();

      for (const modifier of (property as any).incomeModifiers) {
        // Skip expired modifiers
        if (modifier.expiresAt && new Date(modifier.expiresAt) < now) {
          continue;
        }

        totalModifier += modifier.modifier;
      }
    }

    return Math.floor(dailyIncome * totalModifier);
  }

  /**
   * Get total pending income across all properties for a character
   *
   * @param characterId - Character to check
   * @returns Total pending income in dollars
   */
  static async getTotalPendingIncome(characterId: mongoose.Types.ObjectId): Promise<number> {
    const properties = await this.getPropertiesWithIncome(characterId);
    return properties.reduce((sum, prop) => sum + prop.pendingIncome, 0);
  }

  /**
   * Add income modifier to property
   *
   * @param propertyId - Property to modify
   * @param source - Source of modifier (e.g., 'upgrade', 'event', 'territory')
   * @param modifier - Modifier value (e.g., 0.1 for +10%, -0.05 for -5%)
   * @param expiresAt - Optional expiration date
   */
  static async addIncomeModifier(
    propertyId: string,
    source: string,
    modifier: number,
    expiresAt?: Date
  ): Promise<void> {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Initialize incomeModifiers if it doesn't exist
    if (!(property as any).incomeModifiers) {
      (property as any).incomeModifiers = [];
    }

    // Add modifier
    (property as any).incomeModifiers.push({
      source,
      modifier,
      expiresAt,
    });

    await property.save();

    logger.info(
      `Income modifier added to property ${property.name}: ${source} ${modifier > 0 ? '+' : ''}${(modifier * 100).toFixed(1)}%`
    );
  }

  /**
   * Remove expired income modifiers from property
   *
   * @param propertyId - Property to clean up
   */
  static async removeExpiredModifiers(propertyId: string): Promise<void> {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if ((property as any).incomeModifiers && Array.isArray((property as any).incomeModifiers)) {
      const now = new Date();
      const beforeCount = (property as any).incomeModifiers.length;

      (property as any).incomeModifiers = (property as any).incomeModifiers.filter(
        (modifier: any) => !modifier.expiresAt || new Date(modifier.expiresAt) >= now
      );

      const removedCount = beforeCount - (property as any).incomeModifiers.length;

      if (removedCount > 0) {
        await property.save();
        logger.debug(`Removed ${removedCount} expired income modifiers from property ${property.name}`);
      }
    }
  }
}
