/**
 * Resource Service
 *
 * Handles Gold and Silver resource operations with transaction safety.
 * Resources are valuable materials that can be mined, found, crafted, and exchanged for Dollars.
 *
 * Currency System:
 * - Dollars ($) - Primary currency (handled by DollarService)
 * - Gold Resource - Valuable material (~$100 base value, this service)
 * - Silver Resource - Common material (~$10 base value, this service)
 */

import mongoose from 'mongoose';
import {
  GoldTransaction,
  TransactionType,
  TransactionSource,
  IGoldTransaction,
  CurrencyType
} from '../models/GoldTransaction.model';
import { Character } from '../models/Character.model';
import { CURRENCY_CONSTANTS } from '@desperados/shared';
import logger from '../utils/logger';
import { logEconomyEvent, EconomyEvent } from './base';

export type ResourceType = 'gold' | 'silver';

/**
 * Get CurrencyType enum value from resource type string
 */
function getCurrencyType(type: ResourceType): CurrencyType {
  return type === 'gold' ? CurrencyType.GOLD_RESOURCE : CurrencyType.SILVER_RESOURCE;
}

/**
 * Get the field name in Character model for a resource type
 */
function getFieldName(type: ResourceType): 'goldResource' | 'silverResource' {
  return type === 'gold' ? 'goldResource' : 'silverResource';
}

/**
 * Get max amount for a resource type
 */
function getMaxAmount(type: ResourceType): number {
  return type === 'gold'
    ? CURRENCY_CONSTANTS.MAX_GOLD_RESOURCE
    : CURRENCY_CONSTANTS.MAX_SILVER_RESOURCE;
}

export class ResourceService {
  /**
   * Add resource to character (transaction-safe)
   *
   * @param characterId - Character receiving resource
   * @param type - Resource type ('gold' or 'silver')
   * @param amount - Amount to add (must be positive)
   * @param source - Source of the resource
   * @param metadata - Additional context
   * @param session - Optional MongoDB session
   * @returns New balance and transaction record
   */
  static async addResource(
    characterId: string | mongoose.Types.ObjectId,
    type: ResourceType,
    amount: number,
    source: TransactionSource,
    metadata?: any,
    session?: mongoose.ClientSession
  ): Promise<{ newBalance: number; transaction: IGoldTransaction }> {
    if (amount < 0) {
      throw new Error(`Cannot add negative ${type}. Use deductResource instead.`);
    }

    const fieldName = getFieldName(type);
    const maxAmount = getMaxAmount(type);
    const currencyType = getCurrencyType(type);

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const useSession = disableTransactions ? null : (session || await mongoose.startSession());
    const isExternalSession = !!session;

    try {
      if (!isExternalSession && useSession) {
        await useSession.startTransaction();
      }

      // Get current balance
      const characterQuery = Character.findById(characterId).select(`${fieldName} name`);
      const character = useSession ? await characterQuery.session(useSession) : await characterQuery;
      if (!character) throw new Error('Character not found');

      const balanceBefore = (character as any)[fieldName] || 0;

      // Enforce resource cap
      if (balanceBefore + amount > maxAmount) {
        throw new Error(
          `${type.charAt(0).toUpperCase() + type.slice(1)} resource cap exceeded. ` +
          `Maximum is ${maxAmount.toLocaleString()}. ` +
          `Current: ${balanceBefore.toLocaleString()}, trying to add: ${amount.toLocaleString()}`
        );
      }

      // ATOMIC UPDATE
      const updateResult = await Character.findOneAndUpdate(
        {
          _id: characterId,
          [fieldName]: { $lte: maxAmount - amount }
        },
        {
          $inc: { [fieldName]: amount }
        },
        {
          new: true,
          session: useSession || undefined
        }
      );

      if (!updateResult) {
        throw new Error(`Failed to add ${type} resource. Character may not exist or cap would be exceeded.`);
      }

      const balanceAfter = (updateResult as any)[fieldName];

      // Create transaction record
      const transaction = await GoldTransaction.create([{
        characterId: updateResult._id,
        currencyType,
        amount,
        type: TransactionType.EARNED,
        source,
        balanceBefore,
        balanceAfter,
        metadata,
        timestamp: new Date(),
      }], useSession ? { session: useSession } : {});

      if (!isExternalSession && useSession) await useSession.commitTransaction();

      logger.info(
        `${type.charAt(0).toUpperCase() + type.slice(1)} added: Character ${character.name} received ${amount} ${type} from ${source}. ` +
        `Balance: ${balanceBefore} -> ${balanceAfter}`
      );

      // Audit log
      await logEconomyEvent({
        event: EconomyEvent.GOLD_GRANT,
        characterId: updateResult._id.toString(),
        amount,
        beforeBalance: balanceBefore,
        afterBalance: balanceAfter,
        metadata: {
          source,
          currencyType: currencyType,
          resourceType: type,
          ...metadata
        }
      });

      return {
        newBalance: balanceAfter,
        transaction: transaction[0],
      };
    } catch (error) {
      if (!isExternalSession && useSession) await useSession.abortTransaction();
      logger.error(`Error adding ${type} resource:`, error);
      throw error;
    } finally {
      if (!isExternalSession && useSession) useSession.endSession();
    }
  }

  /**
   * Deduct resource from character (transaction-safe)
   *
   * @param characterId - Character losing resource
   * @param type - Resource type ('gold' or 'silver')
   * @param amount - Amount to deduct (must be positive)
   * @param source - Reason for deduction
   * @param metadata - Additional context
   * @param session - Optional MongoDB session
   * @returns New balance and transaction record
   */
  static async deductResource(
    characterId: string | mongoose.Types.ObjectId,
    type: ResourceType,
    amount: number,
    source: TransactionSource,
    metadata?: any,
    session?: mongoose.ClientSession
  ): Promise<{ newBalance: number; transaction: IGoldTransaction }> {
    if (amount < 0) {
      throw new Error(`Cannot deduct negative ${type}. Use addResource instead.`);
    }

    const fieldName = getFieldName(type);
    const currencyType = getCurrencyType(type);

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const useSession = disableTransactions ? null : (session || await mongoose.startSession());
    const isExternalSession = !!session;

    try {
      if (!isExternalSession && useSession) await useSession.startTransaction();

      // Get current balance
      const characterQuery = Character.findById(characterId).select(`${fieldName} name`);
      const character = useSession ? await characterQuery.session(useSession) : await characterQuery;
      if (!character) throw new Error('Character not found');

      const balanceBefore = (character as any)[fieldName] || 0;

      if (balanceBefore < amount) {
        throw new Error(`Insufficient ${type}. Have ${balanceBefore}, need ${amount}`);
      }

      // ATOMIC UPDATE
      const updateResult = await Character.findOneAndUpdate(
        {
          _id: characterId,
          [fieldName]: { $gte: amount }
        },
        {
          $inc: { [fieldName]: -amount }
        },
        {
          new: true,
          session: useSession || undefined
        }
      );

      if (!updateResult) {
        throw new Error(`Insufficient ${type} (concurrent request). Have ${balanceBefore}, need ${amount}`);
      }

      const balanceAfter = (updateResult as any)[fieldName];

      // Create transaction record
      const transaction = await GoldTransaction.create([{
        characterId: updateResult._id,
        currencyType,
        amount: -amount,
        type: TransactionType.SPENT,
        source,
        balanceBefore,
        balanceAfter,
        metadata,
        timestamp: new Date(),
      }], useSession ? { session: useSession } : {});

      if (!isExternalSession && useSession) await useSession.commitTransaction();

      logger.info(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deducted: Character ${character.name} spent ${amount} ${type} on ${source}. ` +
        `Balance: ${balanceBefore} -> ${balanceAfter}`
      );

      // Audit log
      await logEconomyEvent({
        event: EconomyEvent.GOLD_DEDUCT,
        characterId: updateResult._id.toString(),
        amount: -amount,
        beforeBalance: balanceBefore,
        afterBalance: balanceAfter,
        metadata: {
          source,
          currencyType: currencyType,
          resourceType: type,
          ...metadata
        }
      });

      return {
        newBalance: balanceAfter,
        transaction: transaction[0],
      };
    } catch (error) {
      if (!isExternalSession && useSession) await useSession.abortTransaction();
      logger.error(`Error deducting ${type} resource:`, error);
      throw error;
    } finally {
      if (!isExternalSession && useSession) useSession.endSession();
    }
  }

  /**
   * Get resource balance for a character
   *
   * @param characterId - Character to check
   * @param type - Resource type ('gold' or 'silver')
   * @returns Current resource balance
   */
  static async getBalance(
    characterId: string | mongoose.Types.ObjectId,
    type: ResourceType
  ): Promise<number> {
    const fieldName = getFieldName(type);
    const character = await Character.findById(characterId).select(fieldName);
    return (character as any)?.[fieldName] || 0;
  }

  /**
   * Get all resource balances for a character
   *
   * @param characterId - Character to check
   * @returns Object with gold and silver balances
   */
  static async getAllBalances(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<{ gold: number; silver: number }> {
    const character = await Character.findById(characterId).select('goldResource silverResource');
    return {
      gold: character?.goldResource || 0,
      silver: character?.silverResource || 0
    };
  }

  /**
   * Check if character has enough of a resource
   *
   * @param characterId - Character to check
   * @param type - Resource type
   * @param amount - Amount needed
   * @returns True if sufficient
   */
  static async hasEnough(
    characterId: string | mongoose.Types.ObjectId,
    type: ResourceType,
    amount: number
  ): Promise<boolean> {
    const balance = await this.getBalance(characterId, type);
    return balance >= amount;
  }

  /**
   * Transfer resource between characters
   *
   * @param fromCharacterId - Sender
   * @param toCharacterId - Recipient
   * @param type - Resource type
   * @param amount - Amount to transfer
   * @param source - Transaction source
   * @param metadata - Additional context
   * @returns Transfer result
   */
  static async transferResource(
    fromCharacterId: string | mongoose.Types.ObjectId,
    toCharacterId: string | mongoose.Types.ObjectId,
    type: ResourceType,
    amount: number,
    source: TransactionSource,
    metadata?: any
  ): Promise<{
    fromBalance: number;
    toBalance: number;
    fromTransaction: IGoldTransaction;
    toTransaction: IGoldTransaction;
  }> {
    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    if (fromCharacterId.toString() === toCharacterId.toString()) {
      throw new Error('Cannot transfer resources to yourself');
    }

    const fieldName = getFieldName(type);
    const maxAmount = getMaxAmount(type);
    const currencyType = getCurrencyType(type);

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const session = disableTransactions ? null : await mongoose.startSession();

    try {
      if (session) {
        await session.startTransaction({
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          maxCommitTimeMS: 30000,
        });
      }

      // Fetch both characters
      const fromCharQuery = Character.findById(fromCharacterId).select(`${fieldName} name`);
      const toCharQuery = Character.findById(toCharacterId).select(`${fieldName} name`);

      const fromChar = session ? await fromCharQuery.session(session) : await fromCharQuery;
      const toChar = session ? await toCharQuery.session(session) : await toCharQuery;

      if (!fromChar) throw new Error('Sender character not found');
      if (!toChar) throw new Error('Recipient character not found');

      const fromBalanceBefore = (fromChar as any)[fieldName] || 0;
      const toBalanceBefore = (toChar as any)[fieldName] || 0;

      if (fromBalanceBefore < amount) {
        throw new Error(
          `Insufficient ${type} to transfer. Have ${fromBalanceBefore}, need ${amount}`
        );
      }

      if (toBalanceBefore + amount > maxAmount) {
        throw new Error(
          `Transfer would exceed recipient's ${type} cap. ` +
          `Maximum is ${maxAmount.toLocaleString()}. ` +
          `Recipient has: ${toBalanceBefore.toLocaleString()}, trying to add: ${amount.toLocaleString()}`
        );
      }

      // Atomic bulk update
      const bulkResult = await Character.bulkWrite([
        {
          updateOne: {
            filter: {
              _id: fromCharacterId,
              [fieldName]: { $gte: amount }
            },
            update: {
              $inc: { [fieldName]: -amount }
            }
          }
        },
        {
          updateOne: {
            filter: {
              _id: toCharacterId,
              [fieldName]: { $lte: maxAmount - amount }
            },
            update: {
              $inc: { [fieldName]: amount }
            }
          }
        }
      ], { session: session || undefined, ordered: true });

      if (bulkResult.modifiedCount !== 2) {
        throw new Error(
          `${type} transfer failed: concurrent modification detected. ` +
          `Only ${bulkResult.modifiedCount} of 2 updates succeeded.`
        );
      }

      const fromBalanceAfter = fromBalanceBefore - amount;
      const toBalanceAfter = toBalanceBefore + amount;

      // Create transaction records
      const transactions = await GoldTransaction.create([
        {
          characterId: fromChar._id,
          currencyType,
          amount: -amount,
          type: TransactionType.SPENT,
          source,
          balanceBefore: fromBalanceBefore,
          balanceAfter: fromBalanceAfter,
          metadata: {
            ...metadata,
            targetCharacterId: toChar._id,
            transferType: 'sent',
            resourceType: type,
          },
          timestamp: new Date(),
        },
        {
          characterId: toChar._id,
          currencyType,
          amount,
          type: TransactionType.EARNED,
          source,
          balanceBefore: toBalanceBefore,
          balanceAfter: toBalanceAfter,
          metadata: {
            ...metadata,
            targetCharacterId: fromChar._id,
            transferType: 'received',
            resourceType: type,
          },
          timestamp: new Date(),
        },
      ], session ? { session } : {});

      if (session) await session.commitTransaction();

      logger.info(
        `${type.charAt(0).toUpperCase() + type.slice(1)} transferred: ${fromChar.name} sent ${amount} ${type} to ${toChar.name}. ` +
        `Sender: ${fromBalanceBefore} -> ${fromBalanceAfter}, ` +
        `Recipient: ${toBalanceBefore} -> ${toBalanceAfter}`
      );

      return {
        fromBalance: fromBalanceAfter,
        toBalance: toBalanceAfter,
        fromTransaction: transactions[0],
        toTransaction: transactions[1],
      };
    } catch (error) {
      if (session) await session.abortTransaction();
      logger.error(`Error transferring ${type} resource:`, error);
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  /**
   * Get resource transaction history
   *
   * @param characterId - Character to query
   * @param type - Optional resource type filter
   * @param limit - Max results
   * @param offset - Skip count
   * @returns Transaction records
   */
  static async getTransactionHistory(
    characterId: string | mongoose.Types.ObjectId,
    type?: ResourceType,
    limit: number = 50,
    offset: number = 0
  ): Promise<IGoldTransaction[]> {
    const query: any = {
      characterId,
      currencyType: { $in: [CurrencyType.GOLD_RESOURCE, CurrencyType.SILVER_RESOURCE] }
    };

    if (type) {
      query.currencyType = getCurrencyType(type);
    }

    return GoldTransaction.find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean() as unknown as Promise<IGoldTransaction[]>;
  }

  /**
   * Get resource statistics
   */
  static async getStatistics(
    characterId: string | mongoose.Types.ObjectId,
    type: ResourceType
  ): Promise<{
    totalEarned: number;
    totalSpent: number;
    netAmount: number;
    transactionCount: number;
  }> {
    const currencyType = getCurrencyType(type);
    const transactions = await GoldTransaction.find({
      characterId,
      currencyType
    }).lean();

    const totalEarned = transactions
      .filter(t => t.type === TransactionType.EARNED)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = Math.abs(
      transactions
        .filter(t => t.type === TransactionType.SPENT)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    return {
      totalEarned,
      totalSpent,
      netAmount: totalEarned - totalSpent,
      transactionCount: transactions.length,
    };
  }
}
