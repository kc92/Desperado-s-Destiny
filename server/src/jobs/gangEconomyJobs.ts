/**
 * Gang Economy Jobs
 *
 * Automated jobs for gang economy:
 * - Daily business income generation
 * - Weekly payroll processing
 * - Investment maturity processing
 * - Business raid checks
 */

import mongoose from 'mongoose';
import { GangBusiness, IGangBusiness } from '../models/GangBusiness.model';
import { GangInvestment } from '../models/GangInvestment.model';
import { GangEconomy } from '../models/GangEconomy.model';
import { GangEconomyService } from '../services/gangEconomy.service';
import {
  GangBankAccountType,
  BusinessStatus,
  InvestmentStatus,
  BANK_INTEREST,
} from '@desperados/shared';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Process daily business income for all active businesses
 * Run this job once per day (e.g., at midnight server time)
 *
 * SECURITY: Uses fail-fast pattern - if any business fails, entire transaction is rolled back
 * to ensure data consistency. Partial commits are prevented.
 */
export async function processDailyBusinessIncome(): Promise<void> {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    logger.info('[GangEconomy] Starting daily business income processing...');

    // Find all businesses that need income generation
    const businesses = await GangBusiness.findBusinessesNeedingIncome();

    logger.info(`[GangEconomy] Processing income for ${businesses.length} businesses`);

    let totalProcessed = 0;
    let totalIncome = 0;

    for (const business of businesses) {
      // FAIL-FAST: No try-catch here - any error aborts entire transaction
      // Calculate daily income
      const income = business.calculateDailyIncome();

      if (income > 0) {
        // Add income to gang operating fund
        const economy = await GangEconomy.findOne({
          gangId: business.gangId,
        }).session(session);

        if (economy) {
          economy.addToAccount(GangBankAccountType.OPERATING_FUND, income);
          await economy.save({ session });

          // Update business
          business.totalEarnings += income;
          business.lastIncomeDate = new Date();
          await business.save({ session });

          totalIncome += income;
          totalProcessed++;

          logger.debug(
            `[GangEconomy] Business ${business.name} generated ${income} gold for gang ${business.gangName}`
          );
        }
      } else {
        // Business lost money today
        logger.debug(
          `[GangEconomy] Business ${business.name} lost ${Math.abs(income)} gold due to operating costs`
        );
        business.lastIncomeDate = new Date();
        await business.save({ session });
      }
    }

    await session.commitTransaction();

    logger.info(
      `[GangEconomy] Daily business income complete: ${totalProcessed} businesses, ${totalIncome} total gold`
    );
  } catch (error) {
    await session.abortTransaction();
    logger.error('[GangEconomy] Error processing daily business income:', error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Process business raid checks for criminal businesses
 * Run this job once per day
 *
 * SECURITY: Uses fail-fast pattern - if any raid check fails, entire transaction is rolled back
 * to ensure data consistency. Partial commits are prevented.
 */
export async function processBusinessRaids(): Promise<void> {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    logger.info('[GangEconomy] Starting business raid checks...');

    // Reopen businesses that have served their closure time
    const reopenedCount = await GangBusiness.reopenRaidedBusinesses();
    logger.info(`[GangEconomy] Reopened ${reopenedCount} businesses after raid closure`);

    // Find businesses needing raid checks
    const businesses = await GangBusiness.findBusinessesNeedingRaidCheck();

    logger.info(`[GangEconomy] Checking ${businesses.length} businesses for raids`);

    let totalRaids = 0;
    let totalFines = 0;

    for (const business of businesses) {
      // FAIL-FAST: No try-catch here - any error aborts entire transaction
      const result = business.performRaid();

      if (result.raided && result.fine) {
        logger.warn(
          `[GangEconomy] Business ${business.name} was raided! Fine: ${result.fine} gold`
        );

        // Try to deduct fine from operating fund
        const economy = await GangEconomy.findOne({
          gangId: business.gangId,
        }).session(session);

        if (economy) {
          if (economy.canAfford(GangBankAccountType.OPERATING_FUND, result.fine)) {
            economy.deductFromAccount(GangBankAccountType.OPERATING_FUND, result.fine);
            await economy.save({ session });
          } else {
            // Gang can't afford fine - business stays raided longer
            const extendedClosure = new Date();
            extendedClosure.setDate(extendedClosure.getDate() + 7);
            business.nextRaidCheck = extendedClosure;
            logger.warn(
              `[GangEconomy] Gang ${business.gangName} cannot afford raid fine. Business closed for extra week.`
            );
          }
        }

        totalRaids++;
        totalFines += result.fine;
      }

      await business.save({ session });
    }

    await session.commitTransaction();

    logger.info(
      `[GangEconomy] Raid checks complete: ${totalRaids} businesses raided, ${totalFines} total fines`
    );
  } catch (error) {
    await session.abortTransaction();
    logger.error('[GangEconomy] Error processing business raids:', error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Process weekly payroll for all gangs
 * Run this job once per week (e.g., Sunday at midnight)
 *
 * SECURITY: Uses fail-fast pattern and passes session to child service calls
 * to ensure all operations are within a single transaction. If any payroll fails,
 * entire transaction is rolled back.
 */
export async function processWeeklyPayroll(): Promise<void> {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    logger.info('[GangEconomy] Starting weekly payroll processing...');

    // Find all gang economies
    const economies = await GangEconomy.find({}).session(session);

    logger.info(`[GangEconomy] Processing payroll for ${economies.length} gangs`);

    let totalProcessed = 0;
    let totalPaid = 0;

    for (const economy of economies) {
      // FAIL-FAST: No try-catch here - any error aborts entire transaction
      const today = new Date();

      // Check if payroll is due
      if (economy.payroll.nextPayday <= today) {
        // SECURITY FIX: Pass session to processPayroll to maintain transaction integrity
        const amountPaid = await GangEconomyService.processPayroll(
          economy.gangId.toString(),
          session
        );

        if (amountPaid > 0) {
          totalPaid += amountPaid;
          totalProcessed++;

          logger.debug(
            `[GangEconomy] Paid ${amountPaid} gold in payroll to gang ${economy.gangName}`
          );
        }
      }
    }

    await session.commitTransaction();

    logger.info(
      `[GangEconomy] Weekly payroll complete: ${totalProcessed} gangs paid, ${totalPaid} total gold`
    );
  } catch (error) {
    await session.abortTransaction();
    logger.error('[GangEconomy] Error processing weekly payroll:', error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Process matured investments
 * Run this job once per day
 *
 * SECURITY: Uses fail-fast pattern - if any investment fails to process, entire transaction
 * is rolled back to ensure data consistency. Partial commits are prevented.
 */
export async function processMaturedInvestments(): Promise<void> {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    logger.info('[GangEconomy] Starting matured investment processing...');

    const investments = await GangInvestment.findMaturedInvestments();

    logger.info(`[GangEconomy] Processing ${investments.length} matured investments`);

    let totalProcessed = 0;
    let totalReturns = 0;

    for (const investment of investments) {
      // FAIL-FAST: No try-catch here - any error aborts entire transaction
      // Calculate actual return
      const actualReturn = investment.calculateActualReturn();

      const economy = await GangEconomy.findOne({
        gangId: investment.gangId,
      }).session(session);

      if (economy) {
        if (actualReturn > 0) {
          // Add return to investment fund
          economy.addToAccount(GangBankAccountType.INVESTMENT_FUND, actualReturn);
          await economy.save({ session });

          investment.status = InvestmentStatus.MATURED;
          investment.completedAt = new Date();
          await investment.save({ session });

          totalReturns += actualReturn;
          totalProcessed++;

          logger.debug(
            `[GangEconomy] Investment ${investment.name} matured with return of ${actualReturn} gold`
          );
        } else {
          // Investment failed
          investment.status = InvestmentStatus.FAILED;
          investment.completedAt = new Date();
          await investment.save({ session });

          logger.warn(`[GangEconomy] Investment ${investment.name} failed - no return`);
        }
      }
    }

    await session.commitTransaction();

    logger.info(
      `[GangEconomy] Investment processing complete: ${totalProcessed} matured, ${totalReturns} total returns`
    );
  } catch (error) {
    await session.abortTransaction();
    logger.error('[GangEconomy] Error processing matured investments:', error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Process weekly interest on bank accounts
 * Run this job once per week
 *
 * SECURITY: Uses fail-fast pattern - if any interest calculation fails, entire transaction
 * is rolled back to ensure data consistency. Partial commits are prevented.
 */
export async function processWeeklyInterest(): Promise<void> {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    logger.info('[GangEconomy] Starting weekly interest processing...');

    const economies = await GangEconomy.find({}).session(session);

    logger.info(`[GangEconomy] Processing interest for ${economies.length} gang economies`);

    let totalProcessed = 0;
    let totalInterest = 0;

    for (const economy of economies) {
      // FAIL-FAST: No try-catch here - any error aborts entire transaction
      const totalBalance = economy.getTotalBalance();

      // Only pay interest if balance meets minimum
      if (totalBalance >= BANK_INTEREST.MINIMUM_BALANCE) {
        let interestRate: number = BANK_INTEREST.WEEKLY_RATE;

        // Bonus rate for large balances
        if (totalBalance >= BANK_INTEREST.BONUS_THRESHOLD) {
          interestRate = BANK_INTEREST.BONUS_RATE;
        }

        const interest = Math.floor(totalBalance * interestRate);

        if (interest > 0) {
          // Add interest proportionally to all accounts
          const operatingShare = economy.bank.operatingFund / totalBalance;
          const warShare = economy.bank.warChest / totalBalance;
          const investmentShare = economy.bank.investmentFund / totalBalance;
          const emergencyShare = economy.bank.emergencyReserve / totalBalance;

          if (operatingShare > 0) {
            economy.addToAccount(
              GangBankAccountType.OPERATING_FUND,
              Math.floor(interest * operatingShare)
            );
          }
          if (warShare > 0) {
            economy.addToAccount(
              GangBankAccountType.WAR_CHEST,
              Math.floor(interest * warShare)
            );
          }
          if (investmentShare > 0) {
            economy.addToAccount(
              GangBankAccountType.INVESTMENT_FUND,
              Math.floor(interest * investmentShare)
            );
          }
          if (emergencyShare > 0) {
            economy.addToAccount(
              GangBankAccountType.EMERGENCY_RESERVE,
              Math.floor(interest * emergencyShare)
            );
          }

          await economy.save({ session });

          totalInterest += interest;
          totalProcessed++;

          logger.debug(
            `[GangEconomy] Gang ${economy.gangName} earned ${interest} gold in interest (${(interestRate * 100).toFixed(1)}%)`
          );
        }
      }
    }

    await session.commitTransaction();

    logger.info(
      `[GangEconomy] Interest processing complete: ${totalProcessed} gangs, ${totalInterest} total interest`
    );
  } catch (error) {
    await session.abortTransaction();
    logger.error('[GangEconomy] Error processing weekly interest:', error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Main daily job - combines all daily operations
 */
export async function runDailyEconomyJobs(): Promise<void> {
  const lockKey = 'job:daily-economy';

  try {
    await withLock(lockKey, async () => {
      logger.info('[GangEconomy] ========== Starting Daily Economy Jobs ==========');

      await processDailyBusinessIncome();
      await processBusinessRaids();
      await processMaturedInvestments();

      logger.info('[GangEconomy] ========== Daily Economy Jobs Complete ==========');
    }, {
      ttl: 3600, // 60 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[GangEconomy] Daily economy jobs already running on another instance, skipping');
      return;
    }
    logger.error('[GangEconomy] Error in daily economy jobs:', error);
    throw error;
  }
}

/**
 * Main weekly job - combines all weekly operations
 */
export async function runWeeklyEconomyJobs(): Promise<void> {
  const lockKey = 'job:weekly-economy';

  try {
    await withLock(lockKey, async () => {
      logger.info('[GangEconomy] ========== Starting Weekly Economy Jobs ==========');

      await processWeeklyPayroll();
      await processWeeklyInterest();

      logger.info('[GangEconomy] ========== Weekly Economy Jobs Complete ==========');
    }, {
      ttl: 3600, // 60 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[GangEconomy] Weekly economy jobs already running on another instance, skipping');
      return;
    }
    logger.error('[GangEconomy] Error in weekly economy jobs:', error);
    throw error;
  }
}

export default {
  runDailyEconomyJobs,
  runWeeklyEconomyJobs,
  processDailyBusinessIncome,
  processBusinessRaids,
  processWeeklyPayroll,
  processMaturedInvestments,
  processWeeklyInterest,
};
