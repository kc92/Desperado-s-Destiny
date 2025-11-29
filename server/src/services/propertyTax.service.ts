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

/**
 * Property Tax Service
 */
export class PropertyTaxService {
  /**
   * Create or update tax record for a gang base
   */
  static async createGangBaseTaxRecord(gangBaseId: string): Promise<IPropertyTax> {
    const gangBase = await GangBase.findById(gangBaseId).populate('gangId');

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

    // Check for existing tax record
    const existingTax = await PropertyTax.findByPropertyId(gangBaseId);

    if (existingTax) {
      // Update existing record
      existingTax.propertySize = propertySize;
      existingTax.propertyValue = propertyValue;
      existingTax.propertyTier = gangBase.tier;
      existingTax.specialTaxType = specialTaxType;
      existingTax.location = gangBase.location.region;
      existingTax.condition = 100; // TODO: Track actual condition
      existingTax.workerCount = gangBase.defense.guards.length;
      existingTax.workerLevel = 1; // TODO: Calculate average guard level

      // Recalculate taxes
      const calculation = existingTax.calculateTotalTax();
      existingTax.taxCalculation = calculation;
      existingTax.dueDate = calculation.dueDate;

      await existingTax.save();
      return existingTax;
    }

    // Create new tax record
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
        weeklyIncome: 0, // TODO: Calculate from business income
        condition: 100,
        workerCount: gangBase.defense.guards.length,
        workerLevel: 1,
        specialTaxType,
        location: gangBase.location.region,
        insuranceEnabled: false,
      }
    );

    logger.info(
      `Created tax record for gang base ${gangBaseId}: ${taxRecord.taxCalculation.totalTax} gold due`
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
            `Delinquency resolved for property ${propertyId} with payment of ${amount} gold`
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

        if (!character.hasGold(amountToDeduct)) {
          throw new Error('Insufficient gold');
        }

        await character.deductGold(
          amountToDeduct,
          TransactionSource.GANG_DEPOSIT, // TODO: Add TAX_PAYMENT source
          { propertyId, taxType: 'property_tax' }
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
            : `Partial payment of ${amount} gold applied`,
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
            hasEnoughFunds = character.hasGold(totalTax);
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
            `Auto-paid ${totalTax} gold for property ${taxRecord.propertyId} (${taxRecord.ownerName})`
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
      `Created delinquency for property ${taxRecord.propertyId}: ${taxRecord.taxCalculation.totalTax} gold overdue`
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
      // TODO: Send notification via NotificationService
      remindersSent++;
    }

    logger.info(`Sent ${remindersSent} tax due reminders`);

    return remindersSent;
  }
}

export default PropertyTaxService;
