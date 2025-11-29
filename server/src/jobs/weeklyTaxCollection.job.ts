/**
 * Weekly Tax Collection Job
 *
 * Automated jobs for property tax collection and management:
 * - Generate weekly tax bills
 * - Process auto-payments
 * - Update delinquency stages
 * - Create foreclosure auctions
 * - Complete ended auctions
 * - Send reminders and warnings
 */

import mongoose from 'mongoose';
import { PropertyTax, IPropertyTax } from '../models/PropertyTax.model';
import { TaxDelinquency, ITaxDelinquency } from '../models/TaxDelinquency.model';
import { PropertyAuction } from '../models/PropertyAuction.model';
import { GangBase } from '../models/GangBase.model';
import { PropertyTaxService } from '../services/propertyTax.service';
import { ForeclosureService } from '../services/foreclosure.service';
import { DelinquencyStage, TaxPaymentStatus, TAX_CONSTANTS } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Generate weekly tax bills for all properties
 * Run this at the start of each week (Sunday)
 */
export async function generateWeeklyTaxBills(): Promise<void> {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    logger.info('[TaxCollection] Generating weekly tax bills...');

    // Find all active gang bases (properties)
    const gangBases = await GangBase.find({ isActive: true }).session(session);

    logger.info(`[TaxCollection] Generating bills for ${gangBases.length} properties`);

    let generated = 0;
    let updated = 0;
    let errors = 0;

    for (const gangBase of gangBases) {
      try {
        // Create or update tax record
        const taxRecord = await PropertyTaxService.createGangBaseTaxRecord(
          gangBase._id.toString()
        );

        if (taxRecord) {
          if (taxRecord.isNew) {
            generated++;
          } else {
            updated++;
          }

          logger.info(
            `[TaxCollection] Tax bill for ${gangBase.location.region}: ${taxRecord.taxCalculation.totalTax} gold due ${taxRecord.dueDate.toISOString().split('T')[0]}`
          );
        }
      } catch (error) {
        errors++;
        logger.error(
          `[TaxCollection] Error generating tax bill for gang base ${gangBase._id}:`,
          error
        );
      }
    }

    await session.commitTransaction();

    logger.info(
      `[TaxCollection] Tax bill generation complete: ${generated} new, ${updated} updated, ${errors} errors`
    );
  } catch (error) {
    await session.abortTransaction();
    logger.error('[TaxCollection] Error generating weekly tax bills:', error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Process auto-payments for properties with auto-pay enabled
 * Run this daily or when tax is due
 */
export async function processAutoPayments(): Promise<void> {
  try {
    logger.info('[TaxCollection] Processing auto-payments...');

    const result = await PropertyTaxService.processAutoPayments();

    logger.info(
      `[TaxCollection] Auto-payment processing complete: ${result.processed} processed, ${result.successful} successful, ${result.failed} failed`
    );
  } catch (error) {
    logger.error('[TaxCollection] Error processing auto-payments:', error);
    throw error;
  }
}

/**
 * Update delinquency stages based on days overdue
 * Run this daily
 */
export async function updateDelinquencyStages(): Promise<void> {
  try {
    logger.info('[TaxCollection] Updating delinquency stages...');

    const activeDelinquencies = await TaxDelinquency.findActiveDelinquencies();

    logger.info(`[TaxCollection] Updating ${activeDelinquencies.length} delinquencies`);

    let updated = 0;
    let gracePeriod = 0;
    let latePayment = 0;
    let delinquent = 0;
    let foreclosure = 0;

    for (const delinquency of activeDelinquencies) {
      try {
        const oldStage = delinquency.delinquencyStage;
        const newStage = delinquency.updateDelinquencyStage();

        if (oldStage !== newStage) {
          updated++;
          logger.info(
            `[TaxCollection] Property ${delinquency.propertyId} moved from ${oldStage} to ${newStage} (${delinquency.daysOverdue} days overdue)`
          );
        }

        await delinquency.save();

        // Count by stage
        switch (newStage) {
          case DelinquencyStage.GRACE_PERIOD:
            gracePeriod++;
            break;
          case DelinquencyStage.LATE_PAYMENT:
            latePayment++;
            break;
          case DelinquencyStage.DELINQUENT:
            delinquent++;
            break;
          case DelinquencyStage.FORECLOSURE:
            foreclosure++;
            break;
        }
      } catch (error) {
        logger.error(
          `[TaxCollection] Error updating delinquency ${delinquency._id}:`,
          error
        );
      }
    }

    logger.info(
      `[TaxCollection] Delinquency stage update complete: ${updated} stage changes`
    );
    logger.info(
      `[TaxCollection] Current stages: ${gracePeriod} grace, ${latePayment} late, ${delinquent} delinquent, ${foreclosure} foreclosure`
    );
  } catch (error) {
    logger.error('[TaxCollection] Error updating delinquency stages:', error);
    throw error;
  }
}

/**
 * Create foreclosure auctions for properties in delinquent stage
 * Run this daily
 */
export async function createForeclosureAuctions(): Promise<void> {
  try {
    logger.info('[TaxCollection] Creating foreclosure auctions...');

    const readyForAuction = await TaxDelinquency.findReadyForAuction();

    logger.info(`[TaxCollection] ${readyForAuction.length} properties ready for auction`);

    let created = 0;

    for (const delinquency of readyForAuction) {
      try {
        const auction = await ForeclosureService.createAuction(delinquency._id.toString());

        created++;
        logger.info(
          `[TaxCollection] Created auction ${auction._id} for property ${delinquency.propertyId}: Minimum bid ${auction.minimumBid} gold`
        );
      } catch (error) {
        logger.error(
          `[TaxCollection] Error creating auction for delinquency ${delinquency._id}:`,
          error
        );
      }
    }

    logger.info(`[TaxCollection] Foreclosure auction creation complete: ${created} created`);
  } catch (error) {
    logger.error('[TaxCollection] Error creating foreclosure auctions:', error);
    throw error;
  }
}

/**
 * Complete ended auctions and transfer properties
 * Run this hourly or daily
 */
export async function completeEndedAuctions(): Promise<void> {
  try {
    logger.info('[TaxCollection] Completing ended auctions...');

    const result = await ForeclosureService.completeEndedAuctions();

    logger.info(
      `[TaxCollection] Auction completion: ${result.completed} completed, ${result.transferred} transferred, ${result.failed} failed`
    );
  } catch (error) {
    logger.error('[TaxCollection] Error completing ended auctions:', error);
    throw error;
  }
}

/**
 * Process bankruptcy expirations
 * Run this daily
 */
export async function processBankruptcyExpirations(): Promise<void> {
  try {
    logger.info('[TaxCollection] Processing bankruptcy expirations...');

    const processed = await ForeclosureService.processBankruptcyExpirations();

    logger.info(`[TaxCollection] Bankruptcy expiration processing complete: ${processed} processed`);
  } catch (error) {
    logger.error('[TaxCollection] Error processing bankruptcy expirations:', error);
    throw error;
  }
}

/**
 * Send tax due reminders (24 hours before due)
 * Run this daily
 */
export async function sendTaxDueReminders(): Promise<void> {
  try {
    logger.info('[TaxCollection] Sending tax due reminders...');

    const remindersSent = await PropertyTaxService.sendTaxDueReminders();

    logger.info(`[TaxCollection] Tax due reminders sent: ${remindersSent} reminders`);
  } catch (error) {
    logger.error('[TaxCollection] Error sending tax due reminders:', error);
    throw error;
  }
}

/**
 * Update bankruptcy cooldowns (reset after 30 days)
 * Run this daily
 */
export async function updateBankruptcyCooldowns(): Promise<void> {
  try {
    logger.info('[TaxCollection] Updating bankruptcy cooldowns...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - TAX_CONSTANTS.BANKRUPTCY_COOLDOWN_DAYS);

    const result = await TaxDelinquency.updateMany(
      {
        bankruptcyUsedInLast30Days: true,
        bankruptcyFiledDate: { $lte: thirtyDaysAgo },
      },
      {
        $set: { bankruptcyUsedInLast30Days: false },
      }
    );

    logger.info(
      `[TaxCollection] Bankruptcy cooldown update complete: ${result.modifiedCount} cooldowns reset`
    );
  } catch (error) {
    logger.error('[TaxCollection] Error updating bankruptcy cooldowns:', error);
    throw error;
  }
}

/**
 * Generate property tax statistics
 */
export async function generateTaxStatistics(): Promise<{
  totalProperties: number;
  totalTaxDue: number;
  totalPaid: number;
  totalOverdue: number;
  delinquencyCount: number;
  auctionCount: number;
  bankruptcyCount: number;
}> {
  try {
    const allTaxRecords = await PropertyTax.find({});
    const activeDelinquencies = await TaxDelinquency.findActiveDelinquencies();
    const activeAuctions = await PropertyAuction.findActiveAuctions();
    const activeBankruptcies = await TaxDelinquency.find({
      bankruptcyStatus: 'active',
      isResolved: false,
    });

    let totalTaxDue = 0;
    let totalPaid = 0;
    let totalOverdue = 0;

    for (const taxRecord of allTaxRecords) {
      if (taxRecord.paymentStatus === TaxPaymentStatus.PAID) {
        totalPaid += taxRecord.amountPaid || 0;
      } else {
        totalTaxDue += taxRecord.taxCalculation.totalTax;
        if (taxRecord.isOverdue()) {
          totalOverdue += taxRecord.taxCalculation.totalTax;
        }
      }
    }

    const stats = {
      totalProperties: allTaxRecords.length,
      totalTaxDue,
      totalPaid,
      totalOverdue,
      delinquencyCount: activeDelinquencies.length,
      auctionCount: activeAuctions.length,
      bankruptcyCount: activeBankruptcies.length,
    };

    logger.info('[TaxCollection] Tax Statistics:', stats);

    return stats;
  } catch (error) {
    logger.error('[TaxCollection] Error generating tax statistics:', error);
    throw error;
  }
}

/**
 * Main daily tax collection job
 * Combines all daily operations
 */
export async function runDailyTaxJobs(): Promise<void> {
  logger.info('[TaxCollection] ========== Starting Daily Tax Jobs ==========');

  try {
    await sendTaxDueReminders();
    await processAutoPayments();
    await updateDelinquencyStages();
    await createForeclosureAuctions();
    await completeEndedAuctions();
    await processBankruptcyExpirations();
    await updateBankruptcyCooldowns();
    await generateTaxStatistics();

    logger.info('[TaxCollection] ========== Daily Tax Jobs Complete ==========');
  } catch (error) {
    logger.error('[TaxCollection] Error in daily tax jobs:', error);
    throw error;
  }
}

/**
 * Main weekly tax collection job
 * Run every Sunday at midnight
 */
export async function runWeeklyTaxCollection(): Promise<void> {
  logger.info('[TaxCollection] ========== Starting Weekly Tax Collection ==========');

  try {
    await generateWeeklyTaxBills();
    await processAutoPayments();
    await generateTaxStatistics();

    logger.info('[TaxCollection] ========== Weekly Tax Collection Complete ==========');
  } catch (error) {
    logger.error('[TaxCollection] Error in weekly tax collection:', error);
    throw error;
  }
}

export default {
  runDailyTaxJobs,
  runWeeklyTaxCollection,
  generateWeeklyTaxBills,
  processAutoPayments,
  updateDelinquencyStages,
  createForeclosureAuctions,
  completeEndedAuctions,
  processBankruptcyExpirations,
  sendTaxDueReminders,
  updateBankruptcyCooldowns,
  generateTaxStatistics,
};
