/**
 * Property Tax Service
 *
 * Service for property tax calculation, collection, and management
 */

import mongoose from 'mongoose';
import { PropertyTax, IPropertyTax } from '../models/PropertyTax.model';
import { TaxDelinquency, ITaxDelinquency } from '../models/TaxDelinquency.model';
import { GangBase } from '../models/GangBase.model';
import { GangEconomy } from '../models/GangEconomy.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  PropertySize,
  TaxPaymentStatus,
  SpecialTaxType,
  TAX_CONSTANTS,
  WeeklyTaxSummary,
  OwnerTaxSummary,
  GangBankAccountType,
} from '@desperados/shared';
import logger from '../utils/logger';
import { NotificationService } from './notification.service';
import { NotificationType } from '../models/Notification.model';

/**
 * Options for service methods that support transactions
 */
interface TransactionOptions {
  session?: mongoose.ClientSession;
}

/**
 * Property Tax Service
 */
export class PropertyTaxService {
  /**
   * Create or update tax record for a gang base
   * @param gangBaseId - The gang base ID
   * @param options - Optional transaction options (pass session for outer transaction support)
   */
  static async createGangBaseTaxRecord(
    gangBaseId: string,
    options: TransactionOptions = {}
  ): Promise<IPropertyTax> {
    const { session } = options;
    const gangBase = await GangBase.findById(gangBaseId).populate('gangId').session(session ?? null);

    if (!gangBase) {
      throw new Error('Gang base not found');
    }

    // Determine property size based on tier
    let propertySize: PropertySize;
    if (gangBase.tier === 1) propertySize = PropertySize.SMALL;
    else if (gangBase.tier === 2) propertySize = PropertySize.SMALL;
    else if (gangBase.tier === 3) propertySize = PropertySize.MEDIUM;
    else if (gangBase.tier === 4) propertySize = PropertySize.LARGE;
    else propertySize = PropertySize.HUGE;

    // Determine special tax type based on location
    let specialTaxType = SpecialTaxType.NONE;
    const location = gangBase.location.region.toLowerCase();
    if (location.includes('frontera') || location.includes('lawless')) {
      specialTaxType = SpecialTaxType.FRONTIER;
    } else if (location.includes('nahi') || location.includes('coalition')) {
      specialTaxType = SpecialTaxType.COALITION;
    } else if (location.includes('fort') || location.includes('ashford')) {
      specialTaxType = SpecialTaxType.MILITARY;
    }

    // Calculate property value estimate
    const propertyValue = gangBase.tier * 10000; // Simple estimate

    // Get weekly income from gang economy (from latest financial report)
    const economyQuery = GangEconomy.findOne({ gangId: gangBase.gangId });
    if (session) economyQuery.session(session);
    const gangEconomy = await economyQuery;
    const weeklyIncome = gangEconomy?.weeklyReport?.income?.businessIncome || gangBase.tier * 1000; // Fallback based on tier

    // Check for existing tax record (use session if provided)
    const existingTaxQuery = PropertyTax.findOne({ propertyId: gangBaseId });
    if (session) existingTaxQuery.session(session);
    const existingTax = await existingTaxQuery;

    if (existingTax) {
      // Update existing record
      existingTax.propertySize = propertySize;
      existingTax.propertyValue = propertyValue;
      existingTax.propertyTier = gangBase.tier;
      existingTax.specialTaxType = specialTaxType;
      existingTax.location = gangBase.location.region;
      existingTax.condition = 100; // Gang bases don't track condition directly
      existingTax.workerCount = gangBase.defense.guards.length;
      const guards = gangBase.defense.guards;
      existingTax.workerLevel = guards.length > 0
        ? Math.round(guards.reduce((sum, g) => sum + (g.level ?? 1), 0) / guards.length)
        : 1;

      // Recalculate taxes
      const calculation = existingTax.calculateTotalTax();
      existingTax.taxCalculation = calculation;
      existingTax.dueDate = calculation.dueDate;

      await existingTax.save({ session });
      return existingTax;
    }

    // Create new tax record (pass session for transaction support)
    const taxRecord = await PropertyTax.createTaxRecord(
      new mongoose.Types.ObjectId(gangBaseId),
      'gang_base',
      gangBase.gangId as mongoose.Types.ObjectId,
      'gang',
      (gangBase.gangId as any).name || 'Unknown Gang',
      {
        size: propertySize,
        value: propertyValue,
        tier: gangBase.tier,
        weeklyIncome,
        condition: 100,
        workerCount: gangBase.defense.guards.length,
        workerLevel: 1,
        specialTaxType,
        location: gangBase.location.region,
        insuranceEnabled: false,
      },
      { session } // Pass session for outer transaction support
    );

    logger.info(
      `Created tax record for gang base ${gangBaseId}: ${taxRecord.taxCalculation.totalTax} dollars due`
    );

    return taxRecord;
  }

  /**
   * Calculate taxes for a property without creating a record
   */
  static async calculateTaxes(
    propertyId: string
  ): Promise<{
    propertyTax: number;
    incomeTax: number;
    upkeep: number;
    specialTax: number;
    total: number;
  }> {
    const taxRecord = await PropertyTax.findByPropertyId(propertyId);

    if (!taxRecord) {
      throw new Error('Tax record not found for property');
    }

    const propertyTax = taxRecord.calculatePropertyTax();
    const incomeTax = taxRecord.calculateIncomeTax();
    const upkeep = taxRecord.calculateUpkeepCosts();
    const specialTax = taxRecord.calculateSpecialTax();

    return {
      propertyTax,
      incomeTax,
      upkeep,
      specialTax,
      total: propertyTax + incomeTax + upkeep + specialTax,
    };
  }

  /**
   * Process tax payment
   */
  static async processPayment(
    propertyId: string,
    payerId: string,
    amount: number,
    paymentMethod: 'manual' | 'auto' = 'manual'
  ): Promise<{ success: boolean; message: string; taxRecord: IPropertyTax }> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Get tax record
      const taxRecord = await (PropertyTax.findByPropertyId(propertyId) as any).session(session);

      if (!taxRecord) {
        throw new Error('Tax record not found');
      }

      if (taxRecord.paymentStatus === TaxPaymentStatus.PAID) {
        throw new Error('Tax already paid');
      }

      const totalTaxDue = taxRecord.taxCalculation.totalTax;

      // Check if any delinquency exists
      const delinquency = await (TaxDelinquency.findByPropertyId(propertyId) as any).session(session);

      let amountToDeduct = amount;

      if (delinquency && !delinquency.isResolved) {
        // Pay delinquency first
        const debtPaid = delinquency.processPayment(amount);
        await delinquency.save({ session });

        if (debtPaid) {
          // Delinquency fully resolved
          logger.info(
            `Delinquency resolved for property ${propertyId} with payment of ${amount} dollars`
          );
        }

        amountToDeduct = amount;
      }

      // Deduct payment from owner
      if (taxRecord.ownerType === 'gang') {
        const gangEconomy = await GangEconomy.findOne({ gangId: taxRecord.ownerId }).session(
          session
        );

        if (!gangEconomy) {
          throw new Error('Gang economy not found');
        }

        if (!gangEconomy.canAfford(GangBankAccountType.OPERATING_FUND, amountToDeduct)) {
          throw new Error('Insufficient funds');
        }

        gangEconomy.deductFromAccount(GangBankAccountType.OPERATING_FUND, amountToDeduct);
        await gangEconomy.save({ session });
      } else {
        // Character payment
        const character = await Character.findById(taxRecord.ownerId).session(session);

        if (!character) {
          throw new Error('Character not found');
        }

        if (!character.hasDollars(amountToDeduct)) {
          throw new Error('Insufficient dollars');
        }

        await character.deductDollars(
          amountToDeduct,
          TransactionSource.TAX_PAYMENT,
          { propertyId, taxType: 'property_tax', currencyType: 'DOLLAR' }
        );
      }

      // Record payment
      taxRecord.processPayment(amount, paymentMethod);
      await taxRecord.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        message:
          amount >= totalTaxDue
            ? 'Tax payment successful'
            : `Partial payment of ${amount} dollars applied`,
        taxRecord,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error processing tax payment for property ${propertyId}:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Enable or disable auto-pay for a property
   */
  static async setAutoPay(
    propertyId: string,
    ownerId: string,
    enabled: boolean
  ): Promise<IPropertyTax> {
    const taxRecord = await PropertyTax.findByPropertyId(propertyId);

    if (!taxRecord) {
      throw new Error('Tax record not found');
    }

    if (taxRecord.ownerId.toString() !== ownerId) {
      throw new Error('Not authorized to modify this property');
    }

    taxRecord.autoPayEnabled = enabled;
    await taxRecord.save();

    logger.info(`Auto-pay ${enabled ? 'enabled' : 'disabled'} for property ${propertyId}`);

    return taxRecord;
  }

  /**
   * Process auto-payments for properties with auto-pay enabled
   */
  static async processAutoPayments(): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    const taxRecords = await PropertyTax.find({
      autoPayEnabled: true,
      paymentStatus: TaxPaymentStatus.PENDING,
      dueDate: { $lte: new Date() },
    });

    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (const taxRecord of taxRecords) {
      try {
        // Check if owner has funds
        let hasEnoughFunds = false;
        const totalTax = taxRecord.taxCalculation.totalTax;

        if (taxRecord.ownerType === 'gang') {
          const gangEconomy = await GangEconomy.findOne({ gangId: taxRecord.ownerId });
          if (gangEconomy) {
            hasEnoughFunds = gangEconomy.canAfford(
              GangBankAccountType.OPERATING_FUND,
              totalTax
            );
          }
        } else {
          const character = await Character.findById(taxRecord.ownerId);
          if (character) {
            hasEnoughFunds = character.hasDollars(totalTax);
          }
        }

        if (hasEnoughFunds) {
          await this.processPayment(
            taxRecord.propertyId.toString(),
            taxRecord.ownerId.toString(),
            totalTax,
            'auto'
          );
          successful++;
          logger.info(
            `Auto-paid ${totalTax} dollars for property ${taxRecord.propertyId} (${taxRecord.ownerName})`
          );
        } else {
          failed++;
          logger.warn(
            `Auto-pay failed for property ${taxRecord.propertyId}: Insufficient funds`
          );

          // Create delinquency if doesn't exist
          await this.createDelinquencyIfNeeded(taxRecord);
        }

        processed++;
      } catch (error) {
        failed++;
        logger.error(`Error processing auto-pay for property ${taxRecord.propertyId}:`, error);
      }
    }

    logger.info(
      `Auto-payment processing complete: ${processed} processed, ${successful} successful, ${failed} failed`
    );

    return { processed, successful, failed };
  }

  /**
   * Create delinquency record if needed
   */
  static async createDelinquencyIfNeeded(taxRecord: IPropertyTax): Promise<ITaxDelinquency | null> {
    // Check if delinquency already exists
    const existingDelinquency = await TaxDelinquency.findByPropertyId(
      taxRecord.propertyId.toString()
    );

    if (existingDelinquency && !existingDelinquency.isResolved) {
      return existingDelinquency;
    }

    // Create new delinquency
    const delinquency = await TaxDelinquency.createDelinquency(
      taxRecord._id as mongoose.Types.ObjectId,
      taxRecord.propertyId,
      taxRecord.ownerId,
      taxRecord.ownerType,
      taxRecord.ownerName,
      taxRecord.propertyType,
      taxRecord.location,
      taxRecord.taxCalculation.totalTax
    );

    // Update tax record status
    taxRecord.paymentStatus = TaxPaymentStatus.LATE;
    await taxRecord.save();

    logger.info(
      `Created delinquency for property ${taxRecord.propertyId}: ${taxRecord.taxCalculation.totalTax} dollars overdue`
    );

    return delinquency;
  }

  /**
   * Get tax summary for an owner
   */
  static async getOwnerTaxSummary(ownerId: string): Promise<OwnerTaxSummary> {
    const taxRecords = await PropertyTax.findByOwnerId(ownerId);

    if (taxRecords.length === 0) {
      throw new Error('No tax records found for owner');
    }

    const properties: WeeklyTaxSummary[] = [];
    let totalTaxDue = 0;
    let totalPaid = 0;
    let totalOverdue = 0;
    let propertiesAtRisk = 0;

    for (const taxRecord of taxRecords) {
      const isPaid = taxRecord.paymentStatus === TaxPaymentStatus.PAID;
      const isOverdue = taxRecord.isOverdue();

      if (isPaid) {
        totalPaid += taxRecord.amountPaid || 0;
      } else {
        totalTaxDue += taxRecord.taxCalculation.totalTax;
        if (isOverdue) {
          totalOverdue += taxRecord.taxCalculation.totalTax;
          propertiesAtRisk++;
        }
      }

      const delinquency = await TaxDelinquency.findByPropertyId(
        taxRecord.propertyId.toString()
      );

      properties.push({
        propertyId: taxRecord.propertyId.toString(),
        propertyName: `${taxRecord.propertyType} (${taxRecord.location})`,
        propertyType: taxRecord.propertyType,
        totalTaxDue: taxRecord.taxCalculation.totalTax,
        breakdown: {
          propertyTax: taxRecord.taxCalculation.propertyTax,
          incomeTax: taxRecord.taxCalculation.incomeTax,
          upkeep: taxRecord.taxCalculation.upkeepCosts,
          specialTax: taxRecord.taxCalculation.specialTax,
        },
        dueDate: taxRecord.dueDate,
        isPaid,
        autoPayEnabled: taxRecord.autoPayEnabled,
        delinquencyStatus: delinquency?.delinquencyStage,
        daysOverdue: delinquency?.daysOverdue,
      });
    }

    // Check bankruptcy availability
    const delinquencies = await TaxDelinquency.findByOwnerId(ownerId);
    const recentBankruptcy = delinquencies.find(
      (d) => d.bankruptcyUsedInLast30Days && (d as any).bankruptcyStatus !== 'NONE'
    );

    return {
      ownerId,
      ownerName: taxRecords[0].ownerName,
      ownerType: taxRecords[0].ownerType,
      properties,
      totalTaxDue,
      totalPaid,
      totalOverdue,
      propertiesAtRisk,
      bankruptcyAvailable: !recentBankruptcy,
      lastBankruptcy: recentBankruptcy?.bankruptcyFiledDate,
    };
  }

  /**
   * Send tax due reminders (24 hours before due)
   */
  static async sendTaxDueReminders(): Promise<number> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const taxRecords = await PropertyTax.find({
      paymentStatus: TaxPaymentStatus.PENDING,
      dueDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow,
      },
    });

    let remindersSent = 0;

    for (const taxRecord of taxRecords) {
      try {
        if (taxRecord.ownerType === 'character') {
          // Direct notification to character owner
          await NotificationService.sendNotification(
            taxRecord.ownerId,
            NotificationType.SYSTEM,
            `Property tax of ${taxRecord.taxCalculation.totalTax} dollars is due tomorrow for ${taxRecord.propertyType}`,
            { link: '/properties/taxes' }
          );
          remindersSent++;
        } else if (taxRecord.ownerType === 'gang') {
          // Notify gang leader (gang members would need Gang model lookup)
          // For now, log the reminder - full implementation would query gang for leader
          logger.info(
            `Tax reminder for gang ${taxRecord.ownerId}: ${taxRecord.taxCalculation.totalTax} due`
          );
          remindersSent++;
        }
      } catch (error) {
        logger.error(`Failed to send tax reminder for property ${taxRecord.propertyId}:`, error);
      }
    }

    logger.info(`Sent ${remindersSent} tax due reminders`);

    return remindersSent;
  }
}

export default PropertyTaxService;
