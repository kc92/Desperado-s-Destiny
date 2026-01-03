/**
 * Gang Banking Service
 * Handles all gang bank operations with transaction safety
 *
 * REFACTOR: Extracted from gang.service.ts to follow single responsibility principle
 * The GangService facade delegates banking operations to this service
 */

import mongoose from 'mongoose';
import { Gang, IGang } from '../models/Gang.model';
import { GangBankTransaction, IGangBankTransaction } from '../models/GangBankTransaction.model';
import { Character } from '../models/Character.model';
import { GangBankTransactionType } from '@desperados/shared';
import { TransactionSource } from '../models/GoldTransaction.model';
import logger from '../utils/logger';
import karmaService from './karma.service';
import {
  ServiceResult,
  success,
  failure,
  ServiceErrorCode,
} from '../types/serviceResult';

// Result types for banking operations
export interface DepositResult {
  gang: IGang;
  transaction: IGangBankTransaction;
  newBalance: number;
}

export interface WithdrawalResult {
  gang: IGang;
  transaction: IGangBankTransaction;
  newBalance: number;
}

export interface TransactionsResult {
  transactions: IGangBankTransaction[];
  total: number;
}

export class GangBankingService {
  /**
   * Deposit dollars to gang bank
   *
   * @param gangId - Gang ID
   * @param characterId - Character depositing
   * @param amount - Amount to deposit
   * @returns ServiceResult with deposit details or error
   */
  static async deposit(
    gangId: string,
    characterId: string,
    amount: number
  ): Promise<ServiceResult<DepositResult>> {
    if (amount <= 0) {
      return failure(
        ServiceErrorCode.VALIDATION_FAILED,
        'Deposit amount must be positive',
        { amount }
      );
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        await session.abortTransaction();
        return failure(ServiceErrorCode.NOT_FOUND, 'Gang not found', { gangId });
      }

      if (!gang.isMember(characterId)) {
        await session.abortTransaction();
        return failure(
          ServiceErrorCode.FORBIDDEN,
          'Character is not a member of this gang',
          { gangId, characterId }
        );
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        return failure(ServiceErrorCode.NOT_FOUND, 'Character not found', { characterId });
      }

      // Deduct from character's dollars
      const { DollarService } = await import('./dollar.service');
      await DollarService.deductDollars(
        characterId,
        amount,
        TransactionSource.GANG_DEPOSIT,
        { gangId: gang._id, gangName: gang.name },
        session
      );

      // ATOMIC OPERATION: Add to gang bank and update contribution
      const updateResult = await Gang.findOneAndUpdate(
        {
          _id: gangId,
          'members.characterId': new mongoose.Types.ObjectId(characterId)
        },
        {
          $inc: {
            bank: amount,
            'stats.totalRevenue': amount,
            'members.$.contribution': amount
          }
        },
        {
          new: true,
          session
        }
      );

      if (!updateResult) {
        await session.abortTransaction();
        return failure(
          ServiceErrorCode.DATABASE_ERROR,
          'Failed to deposit to gang bank',
          { gangId, amount }
        );
      }

      const balanceAfter = updateResult.bank;
      const balanceBefore = balanceAfter - amount;

      const transaction = await GangBankTransaction.create([{
        gangId: gang._id,
        characterId: character._id,
        type: GangBankTransactionType.DEPOSIT,
        amount,
        balanceBefore,
        balanceAfter,
        timestamp: new Date(),
      }], { session });

      await session.commitTransaction();

      // Record karma for generous contributions (fire-and-forget)
      this.recordDepositKarma(characterId, character.dollars, amount, gang.name).catch(err => {
        logger.warn('Failed to record karma for gang deposit:', err);
      });

      logger.info(
        `Character ${character.name} deposited ${amount} dollars to gang ${gang.name} bank`
      );

      return success({
        gang: updateResult,
        transaction: transaction[0],
        newBalance: balanceAfter,
      });
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error depositing to gang bank:', error);
      return failure(
        ServiceErrorCode.DATABASE_ERROR,
        error instanceof Error ? error.message : 'Unknown error',
        { gangId, characterId, amount }
      );
    } finally {
      session.endSession();
    }
  }

  /**
   * Withdraw dollars from gang bank
   *
   * @param gangId - Gang ID
   * @param characterId - Character withdrawing (must be officer+)
   * @param amount - Amount to withdraw
   * @returns ServiceResult with withdrawal details or error
   */
  static async withdraw(
    gangId: string,
    characterId: string,
    amount: number
  ): Promise<ServiceResult<WithdrawalResult>> {
    if (amount <= 0) {
      return failure(
        ServiceErrorCode.VALIDATION_FAILED,
        'Withdrawal amount must be positive',
        { amount }
      );
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        await session.abortTransaction();
        return failure(ServiceErrorCode.NOT_FOUND, 'Gang not found', { gangId });
      }

      if (!gang.isOfficer(characterId)) {
        await session.abortTransaction();
        return failure(
          ServiceErrorCode.FORBIDDEN,
          'Only officers and leaders can withdraw from gang bank',
          { gangId, characterId }
        );
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        return failure(ServiceErrorCode.NOT_FOUND, 'Character not found', { characterId });
      }

      // ATOMIC OPERATION: Deduct from gang bank only if sufficient funds
      const updateResult = await Gang.findOneAndUpdate(
        {
          _id: gangId,
          bank: { $gte: amount }  // Atomic check: must have enough funds
        },
        {
          $inc: { bank: -amount }
        },
        {
          new: true,
          session
        }
      );

      if (!updateResult) {
        const currentGang = await Gang.findById(gangId).session(session);
        await session.abortTransaction();
        return failure(
          ServiceErrorCode.INSUFFICIENT_FUNDS,
          `Insufficient gang bank funds. Have ${currentGang?.bank || 0}, need ${amount}`,
          { currentBalance: currentGang?.bank || 0, required: amount }
        );
      }

      const balanceAfter = updateResult.bank;
      const balanceBefore = balanceAfter + amount;

      // Add to character's dollars
      const { DollarService: DollarServiceWithdraw } = await import('./dollar.service');
      await DollarServiceWithdraw.addDollars(
        characterId,
        amount,
        TransactionSource.GANG_WITHDRAWAL,
        { gangId: gang._id, gangName: gang.name },
        session
      );

      const transaction = await GangBankTransaction.create([{
        gangId: gang._id,
        characterId: character._id,
        type: GangBankTransactionType.WITHDRAWAL,
        amount: -amount,
        balanceBefore,
        balanceAfter,
        timestamp: new Date(),
      }], { session });

      await session.commitTransaction();

      // Record karma for hoarding (fire-and-forget)
      const member = gang.members.find(m => m.characterId.toString() === characterId);
      const contribution = member?.contribution || 0;
      this.recordWithdrawalKarma(characterId, contribution, amount, gang.name).catch(err => {
        logger.warn('Failed to record karma for gang withdrawal:', err);
      });

      logger.info(
        `Character ${character.name} withdrew ${amount} dollars from gang ${gang.name} bank`
      );

      return success({
        gang: updateResult,
        transaction: transaction[0],
        newBalance: balanceAfter,
      });
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error withdrawing from gang bank:', error);
      return failure(
        ServiceErrorCode.DATABASE_ERROR,
        error instanceof Error ? error.message : 'Unknown error',
        { gangId, characterId, amount }
      );
    } finally {
      session.endSession();
    }
  }

  /**
   * Get gang transaction history
   *
   * @param gangId - Gang ID
   * @param limit - Maximum transactions to return
   * @param offset - Number of transactions to skip
   * @returns Transactions and total count
   */
  static async getTransactions(
    gangId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ServiceResult<TransactionsResult>> {
    try {
      const transactions = await GangBankTransaction.find({ gangId })
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .populate('characterId', 'name')
        .lean() as unknown as IGangBankTransaction[];

      const total = await GangBankTransaction.countDocuments({ gangId });

      return success({ transactions, total });
    } catch (error) {
      logger.error('Error fetching gang transactions:', error);
      return failure(
        ServiceErrorCode.DATABASE_ERROR,
        'Failed to fetch gang transactions',
        { gangId }
      );
    }
  }

  /**
   * Get gang bank balance
   *
   * @param gangId - Gang ID
   * @returns Current bank balance
   */
  static async getBalance(gangId: string): Promise<ServiceResult<number>> {
    try {
      const gang = await Gang.findById(gangId).select('bank').lean();
      if (!gang) {
        return failure(ServiceErrorCode.NOT_FOUND, 'Gang not found', { gangId });
      }
      return success(gang.bank);
    } catch (error) {
      logger.error('Error fetching gang balance:', error);
      return failure(
        ServiceErrorCode.DATABASE_ERROR,
        'Failed to fetch gang balance',
        { gangId }
      );
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Record karma for generous gang deposits
   */
  private static async recordDepositKarma(
    characterId: string,
    dollarsBeforeDeposit: number,
    amount: number,
    gangName: string
  ): Promise<void> {
    // Large deposits (>10% of dollars) show loyalty and generosity
    const depositRatio = amount / (dollarsBeforeDeposit + amount);
    if (depositRatio > 0.1) {
      await karmaService.recordAction(
        characterId,
        'GANG_SHARED_LOOT',
        `Donated ${amount} dollars to gang ${gangName} (${Math.round(depositRatio * 100)}% of wealth)`
      );
      logger.debug(`Karma recorded for generous deposit: GANG_SHARED_LOOT`);
    }
  }

  /**
   * Record karma for hoarding withdrawals
   */
  private static async recordWithdrawalKarma(
    characterId: string,
    contribution: number,
    amount: number,
    gangName: string
  ): Promise<void> {
    // If withdrawing more than they ever contributed, it's seen as hoarding
    if (amount > contribution) {
      await karmaService.recordAction(
        characterId,
        'GANG_HOARDED_LOOT',
        `Withdrew ${amount} dollars from gang ${gangName} (contribution: ${contribution})`
      );
      logger.debug(`Karma recorded for hoarding: GANG_HOARDED_LOOT`);
    }
  }
}

export default GangBankingService;
