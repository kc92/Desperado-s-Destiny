/**
 * Gang Economy Service
 *
 * Handles gang economy operations: bank accounts, businesses, investments, heists, and payroll
 */

import mongoose from 'mongoose';
import { GangEconomy, IGangEconomy } from '../models/GangEconomy.model';
import { GangBusiness, IGangBusiness } from '../models/GangBusiness.model';
import { GangInvestment, IGangInvestment } from '../models/GangInvestment.model';
import { GangHeist, IGangHeist } from '../models/GangHeist.model';
import { Gang, IGang } from '../models/Gang.model';
import { Character } from '../models/Character.model';
import {
  GangBankAccountType,
  BusinessType,
  BusinessCategory,
  BUSINESS_CONFIGS,
  HeistTarget,
  HEIST_CONFIGS,
  InvestmentType,
  RiskLevel,
  InvestmentStatus,
  HeistStatus,
  HeistRole,
  BusinessStatus,
  PAYROLL_CONSTANTS,
  BANK_INTEREST,
  GangEconomyTransactionType,
  AccountTransferRequest,
  BusinessPurchaseRequest,
  HeistPlanningRequest,
  PayrollSettingsRequest,
} from '@desperados/shared';
import logger from '../utils/logger';

export class GangEconomyService {
  /**
   * Initialize economy for a new gang
   */
  static async initializeEconomy(gangId: string, gangName: string): Promise<IGangEconomy> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Check if economy already exists
      const existing = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) }).session(session);
      if (existing) {
        throw new Error('Economy already initialized for this gang');
      }

      // Create initial economy
      const economy = await GangEconomy.create(
        [
          {
            gangId: new mongoose.Types.ObjectId(gangId),
            gangName,
            bank: {
              operatingFund: 0,
              warChest: 0,
              investmentFund: 0,
              emergencyReserve: 0,
              totalBalance: 0,
            },
            payroll: {
              weeklyWages: [],
              officerBonuses: [],
              totalWeekly: 0,
              lastPaid: null,
              nextPayday: this.calculateNextPayday(),
            },
            totalAssets: 0,
            liquidAssets: 0,
            debtOwed: 0,
            creditRating: 50,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      logger.info(`Economy initialized for gang ${gangName} (${gangId})`);

      return economy[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error initializing gang economy:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get gang economy overview
   */
  static async getEconomy(gangId: string): Promise<IGangEconomy> {
    const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) });
    if (!economy) {
      throw new Error('Gang economy not found');
    }

    // Update total assets
    await economy.calculateTotalAssets();
    await economy.save();

    return economy;
  }

  /**
   * Deposit to gang bank account
   */
  static async depositToAccount(
    gangId: string,
    characterId: string,
    accountType: GangBankAccountType,
    amount: number
  ): Promise<IGangEconomy> {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) }).session(session);
      if (!economy) {
        throw new Error('Gang economy not found');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Deduct from character's dollars
      const { DollarService } = await import('./dollar.service');
      await DollarService.deductDollars(characterId, amount, 'gang_bank_deposit' as any, { gangId, accountType }, session);

      // Add to gang account
      economy.addToAccount(accountType, amount);
      await economy.save({ session });

      await session.commitTransaction();

      logger.info(`Character ${characterId} deposited ${amount} dollars to gang ${gangId} ${accountType}`);

      return economy;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error depositing to gang account:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Withdraw from gang bank account (officer+ only)
   * H9 SECURITY FIX: Re-verifies gang membership within transaction to prevent TOCTOU attacks
   */
  static async withdrawFromAccount(
    gangId: string,
    characterId: string,
    accountType: GangBankAccountType,
    amount: number
  ): Promise<IGangEconomy> {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    // Emergency reserve can only be withdrawn by leader
    if (accountType === GangBankAccountType.EMERGENCY_RESERVE) {
      throw new Error('Emergency Reserve can only be withdrawn by the leader');
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) }).session(session);
      if (!economy) {
        throw new Error('Gang economy not found');
      }

      // H9 SECURITY FIX: Re-verify gang membership and role WITHIN the transaction
      // This prevents Time-of-Check to Time-of-Use (TOCTOU) attacks where
      // a member could be demoted/removed after the initial check but before withdrawal
      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      // H9: Verify member still exists in gang and has officer+ role
      const member = gang.members.find(m => m.characterId.toString() === characterId);
      if (!member) {
        logger.warn(`[SECURITY] Withdrawal attempt by non-member: ${characterId} for gang ${gangId}`);
        throw new Error('You are no longer a member of this gang');
      }

      if (!gang.isOfficer(characterId)) {
        logger.warn(`[SECURITY] Withdrawal attempt by non-officer: ${characterId} (role: ${member.role}) for gang ${gangId}`);
        throw new Error('Only officers and leaders can withdraw from gang accounts');
      }

      // Deduct from gang account
      economy.deductFromAccount(accountType, amount);
      await economy.save({ session });

      // Add to character's dollars
      const { DollarService } = await import('./dollar.service');
      await DollarService.addDollars(characterId, amount, 'gang_bank_withdrawal' as any, { gangId, accountType }, session);

      await session.commitTransaction();

      logger.info(`Character ${characterId} withdrew ${amount} dollars from gang ${gangId} ${accountType}`);

      return economy;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error withdrawing from gang account:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Transfer between gang accounts
   * H9 SECURITY FIX: Re-verifies gang membership within transaction
   */
  static async transferBetweenAccounts(
    gangId: string,
    characterId: string,
    request: AccountTransferRequest
  ): Promise<IGangEconomy> {
    const { fromAccount, toAccount, amount } = request;

    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) }).session(session);
      if (!economy) {
        throw new Error('Gang economy not found');
      }

      // H9 SECURITY FIX: Re-verify gang membership and role WITHIN the transaction
      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      // H9: Verify member still exists in gang
      const member = gang.members.find(m => m.characterId.toString() === characterId);
      if (!member) {
        logger.warn(`[SECURITY] Transfer attempt by non-member: ${characterId} for gang ${gangId}`);
        throw new Error('You are no longer a member of this gang');
      }

      // Only officers can transfer funds
      if (!gang.isOfficer(characterId)) {
        logger.warn(`[SECURITY] Transfer attempt by non-officer: ${characterId} (role: ${member.role}) for gang ${gangId}`);
        throw new Error('Only officers and leaders can transfer funds');
      }

      // Emergency reserve requires leader
      if (
        fromAccount === GangBankAccountType.EMERGENCY_RESERVE &&
        !gang.isLeader(characterId)
      ) {
        throw new Error('Only the leader can transfer from Emergency Reserve');
      }

      economy.transferBetweenAccounts(fromAccount, toAccount, amount);
      await economy.save({ session });

      await session.commitTransaction();

      logger.info(
        `Gang ${gangId} transferred ${amount} dollars from ${fromAccount} to ${toAccount}`
      );

      return economy;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error transferring between gang accounts:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Purchase a business
   */
  static async purchaseBusiness(
    gangId: string,
    characterId: string,
    request: BusinessPurchaseRequest
  ): Promise<IGangBusiness> {
    const { businessType, customName, location } = request;

    const config = BUSINESS_CONFIGS[businessType];
    if (!config) {
      throw new Error('Invalid business type');
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) }).session(session);
      if (!economy) {
        throw new Error('Gang economy not found');
      }

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      // Only leader can purchase businesses
      if (!gang.isLeader(characterId)) {
        throw new Error('Only the leader can purchase businesses');
      }

      // Check requirements
      if (config.requirements?.gangLevel && gang.level < config.requirements.gangLevel) {
        throw new Error(`Gang must be level ${config.requirements.gangLevel} to purchase this business`);
      }

      if (config.requirements?.territoryControl) {
        if (gang.territories.length === 0) {
          throw new Error('Gang must control at least one territory to run a protection racket');
        }
      }

      // Check if gang can afford
      if (!economy.canAfford(GangBankAccountType.OPERATING_FUND, config.startupCost)) {
        throw new Error(
          `Insufficient funds in Operating Fund. Need ${config.startupCost}, have ${economy.bank.operatingFund}`
        );
      }

      // Deduct cost
      economy.deductFromAccount(GangBankAccountType.OPERATING_FUND, config.startupCost);
      await economy.save({ session });

      // Create business
      const business = await GangBusiness.create(
        [
          {
            gangId: new mongoose.Types.ObjectId(gangId),
            gangName: gang.name,
            name: customName || config.name,
            category: config.category,
            businessType,
            location,
            startupCost: config.startupCost,
            dailyIncome: config.dailyIncome,
            riskLevel: config.riskLevel,
            operatingCost: config.operatingCost,
            status: BusinessStatus.ACTIVE,
            purchasedAt: new Date(),
            lastIncomeDate: new Date(),
            totalEarnings: 0,
            raidCount: 0,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      logger.info(
        `Gang ${gang.name} purchased ${businessType} business for ${config.startupCost} dollars`
      );

      return business[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error purchasing business:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Sell a business
   */
  static async sellBusiness(gangId: string, characterId: string, businessId: string): Promise<number> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const business = await GangBusiness.findById(businessId).session(session);
      if (!business) {
        throw new Error('Business not found');
      }

      if (business.gangId.toString() !== gangId) {
        throw new Error('Business does not belong to this gang');
      }

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the leader can sell businesses');
      }

      const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) }).session(session);
      if (!economy) {
        throw new Error('Gang economy not found');
      }

      // Calculate sale price (50-70% of startup cost based on condition)
      const conditionMultiplier = business.status === BusinessStatus.ACTIVE ? 0.7 : 0.5;
      const salePrice = Math.floor(business.startupCost * conditionMultiplier);

      // Add sale proceeds to operating fund
      economy.addToAccount(GangBankAccountType.OPERATING_FUND, salePrice);
      await economy.save({ session });

      // Mark business as closed
      business.status = BusinessStatus.CLOSED;
      await business.save({ session });

      await session.commitTransaction();

      logger.info(`Gang ${gang.name} sold business ${business.name} for ${salePrice} dollars`);

      return salePrice;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error selling business:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get gang businesses
   */
  static async getBusinesses(gangId: string): Promise<IGangBusiness[]> {
    return GangBusiness.find({
      gangId: new mongoose.Types.ObjectId(gangId),
      status: { $ne: BusinessStatus.CLOSED },
    }).sort({ purchasedAt: -1 });
  }

  /**
   * Calculate next payroll day (next Sunday)
   */
  private static calculateNextPayday(): Date {
    const now = new Date();
    const nextPayday = new Date(now);
    const daysUntilSunday = (7 + PAYROLL_CONSTANTS.PAYROLL_DAY - now.getDay()) % 7 || 7;
    nextPayday.setDate(nextPayday.getDate() + daysUntilSunday);
    nextPayday.setHours(0, 0, 0, 0);
    return nextPayday;
  }

  /**
   * Set payroll settings
   */
  static async setPayroll(
    gangId: string,
    characterId: string,
    request: PayrollSettingsRequest
  ): Promise<IGangEconomy> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) }).session(session);
      if (!economy) {
        throw new Error('Gang economy not found');
      }

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the leader can set payroll');
      }

      // Build payroll entries
      const weeklyWages = request.wages.map((w) => {
        const member = gang.members.find((m) => m.characterId.toString() === w.memberId);
        if (!member) {
          throw new Error(`Member ${w.memberId} not found in gang`);
        }

        if (w.amount < 0 || w.amount > PAYROLL_CONSTANTS.MAX_WAGE) {
          throw new Error(`Wage must be between 0 and ${PAYROLL_CONSTANTS.MAX_WAGE}`);
        }

        return {
          memberId: w.memberId,
          memberName: member.characterId.toString(), // Will be populated with actual name
          role: member.role,
          amount: w.amount,
          bonuses: 0,
        };
      });

      const officerBonuses = (request.officerBonuses || []).map((b) => {
        const officer = gang.members.find((m) => m.characterId.toString() === b.officerId);
        if (!officer || !gang.isOfficer(b.officerId)) {
          throw new Error(`Officer ${b.officerId} not found or not an officer`);
        }

        return {
          memberId: b.officerId,
          memberName: officer.characterId.toString(),
          role: officer.role,
          amount: 0,
          bonuses: b.amount,
        };
      });

      const totalWeekly =
        weeklyWages.reduce((sum, w) => sum + w.amount, 0) +
        officerBonuses.reduce((sum, b) => sum + (b.bonuses || 0), 0);

      economy.payroll = {
        weeklyWages,
        officerBonuses,
        totalWeekly,
        lastPaid: economy.payroll.lastPaid,
        nextPayday: economy.payroll.nextPayday,
      };

      await economy.save({ session });
      await session.commitTransaction();

      logger.info(`Gang ${gang.name} updated payroll settings. Total weekly: ${totalWeekly}`);

      return economy;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error setting payroll:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Process weekly payroll (automated job)
   *
   * @param gangId - The gang ID to process payroll for
   * @param externalSession - Optional external session for transaction consistency.
   *                          When called from batch jobs, pass the job's session to ensure
   *                          all operations are part of the same transaction.
   *
   * SECURITY: Supports external session parameter for proper transaction rollback
   * when called from batch processing jobs. If external session is provided,
   * this method will NOT manage transaction lifecycle (no commit/abort/end).
   */
  static async processPayroll(
    gangId: string,
    externalSession?: mongoose.ClientSession
  ): Promise<number> {
    // Use external session if provided, otherwise create our own
    const useExternalSession = !!externalSession;
    const session = externalSession || await mongoose.startSession();

    try {
      // Only start transaction if we're managing our own session
      if (!useExternalSession) {
        await session.startTransaction();
      }

      const economy = await GangEconomy.findOne({ gangId: new mongoose.Types.ObjectId(gangId) }).session(session);
      if (!economy) {
        throw new Error('Gang economy not found');
      }

      const totalPayroll = economy.payroll.totalWeekly;

      if (totalPayroll === 0) {
        // No payroll set
        if (!useExternalSession) {
          await session.commitTransaction();
        }
        return 0;
      }

      if (!economy.canAfford(GangBankAccountType.OPERATING_FUND, totalPayroll)) {
        logger.warn(`Gang ${gangId} cannot afford payroll of ${totalPayroll}`);
        // Don't fail, just skip payroll this week
        if (!useExternalSession) {
          await session.commitTransaction();
        }
        return 0;
      }

      // Deduct from operating fund
      economy.deductFromAccount(GangBankAccountType.OPERATING_FUND, totalPayroll);

      // Pay each member
      const { DollarService } = await import('./dollar.service');
      for (const wage of economy.payroll.weeklyWages) {
        await DollarService.addDollars(
          wage.memberId,
          wage.amount,
          'gang_payroll' as any,
          { gangId },
          session
        );
      }

      for (const bonus of economy.payroll.officerBonuses) {
        if (bonus.bonuses && bonus.bonuses > 0) {
          await DollarService.addDollars(
            bonus.memberId,
            bonus.bonuses,
            'gang_payroll' as any,
            { gangId, type: 'bonus' },
            session
          );
        }
      }

      // Update payroll dates
      economy.payroll.lastPaid = new Date();
      economy.payroll.nextPayday = this.calculateNextPayday();

      await economy.save({ session });

      // Only commit if we're managing our own session
      if (!useExternalSession) {
        await session.commitTransaction();
      }

      logger.info(`Processed payroll for gang ${gangId}: ${totalPayroll} dollars`);

      return totalPayroll;
    } catch (error) {
      // Only abort if we're managing our own session
      if (!useExternalSession) {
        await session.abortTransaction();
      }
      logger.error('Error processing payroll:', error);
      throw error;
    } finally {
      // Only end session if we created it
      if (!useExternalSession) {
        session.endSession();
      }
    }
  }
}
