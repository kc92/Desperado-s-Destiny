/**
 * Gold Service
 *
 * Handles all gold economy operations with transaction safety and audit trail
 */

import mongoose from 'mongoose';
import { GoldTransaction, TransactionType, TransactionSource, IGoldTransaction } from '../models/GoldTransaction.model';
import { Character } from '../models/Character.model';
import { WorldEvent } from '../models/WorldEvent.model';
import { Location } from '../models/Location.model';
import logger from '../utils/logger';
import { QuestService } from './quest.service';

// Re-export for convenience
export { TransactionSource, TransactionType };

export class GoldService {
  /**
   * Add gold to character (transaction-safe)
   * Creates audit trail record
   *
   * @param characterId - Character receiving gold
   * @param amount - Amount of gold to add (must be positive)
   * @param source - Source of the gold transaction
   * @param metadata - Additional context about the transaction
   * @param session - Optional MongoDB session for external transaction management
   * @returns New balance and transaction record
   */
  static async addGold(
    characterId: string | mongoose.Types.ObjectId,
    amount: number,
    source: TransactionSource,
    metadata?: any,
    session?: mongoose.ClientSession
  ): Promise<{ newBalance: number; transaction: IGoldTransaction }> {
    if (amount < 0) {
      throw new Error('Cannot add negative gold. Use deductGold instead.');
    }

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const useSession = disableTransactions ? null : (session || await mongoose.startSession());
    const isExternalSession = !!session;

    try {
      if (!isExternalSession && useSession) {
        await useSession.startTransaction();
      }

      // Fetch current balance
      const characterQuery = Character.findById(characterId);
      const character = useSession ? await characterQuery.session(useSession) : await characterQuery;
      if (!character) throw new Error('Character not found');

      // Apply world event modifiers to gold gained
      let modifiedAmount = amount;
      try {
        // Get character's current location to check regional events
        const location = await Location.findById(character.currentLocation);
        if (location) {
          const activeEvents = await WorldEvent.find({
            status: 'ACTIVE',
            $or: [
              { region: location.region },
              { isGlobal: true }
            ]
          });

          for (const event of activeEvents) {
            for (const effect of event.worldEffects) {
              // GOLD_RUSH event: increase gold earned
              if (effect.type === 'price_modifier' && effect.target === 'gold_earned') {
                modifiedAmount = Math.floor(modifiedAmount * effect.value);
                logger.info(`World event "${event.name}" modified gold gain by ${effect.value}x (${effect.description})`);
              }
            }
          }
        }
      } catch (eventError) {
        // Don't fail gold transaction if event check fails
        logger.error('Failed to check world events for gold modifiers:', eventError);
      }

      const balanceBefore = character.gold || 0;
      const balanceAfter = balanceBefore + modifiedAmount;

      // Update character gold
      character.gold = balanceAfter;
      await character.save(useSession ? { session: useSession } : undefined);

      // Create transaction record (using modified amount)
      const transaction = await GoldTransaction.create([{
        characterId: character._id,
        amount: modifiedAmount,
        type: TransactionType.EARNED,
        source,
        balanceBefore,
        balanceAfter,
        metadata,
        timestamp: new Date(),
      }], useSession ? { session: useSession } : {});

      if (!isExternalSession && useSession) await useSession.commitTransaction();

      logger.info(
        `Gold added: Character ${character.name} received ${modifiedAmount} gold from ${source}. ` +
        `Balance: ${balanceBefore} -> ${balanceAfter}`
      );

      // Trigger quest progress for gold earned (use modified amount)
      try {
        await QuestService.onGoldEarned(character._id.toString(), modifiedAmount);
      } catch (questError) {
        // Don't fail gold transaction if quest update fails
        logger.error('Failed to update quest progress for gold earned:', questError);
      }

      return {
        newBalance: balanceAfter,
        transaction: transaction[0],
      };
    } catch (error) {
      if (!isExternalSession && useSession) await useSession.abortTransaction();
      logger.error('Error adding gold:', error);
      throw error;
    } finally {
      if (!isExternalSession && useSession) useSession.endSession();
    }
  }

  /**
   * Deduct gold from character (transaction-safe, validates sufficient funds)
   * Creates audit trail record
   *
   * @param characterId - Character losing gold
   * @param amount - Amount of gold to deduct (must be positive)
   * @param source - Reason for the deduction
   * @param metadata - Additional context about the transaction
   * @param session - Optional MongoDB session for external transaction management
   * @returns New balance and transaction record
   */
  static async deductGold(
    characterId: string | mongoose.Types.ObjectId,
    amount: number,
    source: TransactionSource,
    metadata?: any,
    session?: mongoose.ClientSession
  ): Promise<{ newBalance: number; transaction: IGoldTransaction }> {
    if (amount < 0) {
      throw new Error('Cannot deduct negative gold. Use addGold instead.');
    }

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const useSession = disableTransactions ? null : (session || await mongoose.startSession());
    const isExternalSession = !!session;

    try {
      if (!isExternalSession && useSession) await useSession.startTransaction();

      const characterQuery = Character.findById(characterId);
      const character = useSession ? await characterQuery.session(useSession) : await characterQuery;
      if (!character) throw new Error('Character not found');

      const balanceBefore = character.gold || 0;

      // Validate sufficient funds
      if (balanceBefore < amount) {
        throw new Error(`Insufficient gold. Have ${balanceBefore}, need ${amount}`);
      }

      const balanceAfter = balanceBefore - amount;

      // Update character gold
      character.gold = balanceAfter;
      await character.save(useSession ? { session: useSession } : undefined);

      // Create transaction record (negative amount)
      const transaction = await GoldTransaction.create([{
        characterId: character._id,
        amount: -amount, // Negative for spent
        type: TransactionType.SPENT,
        source,
        balanceBefore,
        balanceAfter,
        metadata,
        timestamp: new Date(),
      }], useSession ? { session: useSession } : {});

      if (!isExternalSession && useSession) await useSession.commitTransaction();

      logger.info(
        `Gold deducted: Character ${character.name} spent ${amount} gold on ${source}. ` +
        `Balance: ${balanceBefore} -> ${balanceAfter}`
      );

      return {
        newBalance: balanceAfter,
        transaction: transaction[0],
      };
    } catch (error) {
      if (!isExternalSession && useSession) await useSession.abortTransaction();
      logger.error('Error deducting gold:', error);
      throw error;
    } finally {
      if (!isExternalSession && useSession) useSession.endSession();
    }
  }

  /**
   * Get current gold balance
   *
   * @param characterId - Character to check
   * @returns Current gold balance
   */
  static async getBalance(characterId: string | mongoose.Types.ObjectId): Promise<number> {
    const character = await Character.findById(characterId).select('gold');
    return character?.gold || 0;
  }

  /**
   * Check if character can afford amount
   *
   * @param characterId - Character to check
   * @param amount - Amount needed
   * @returns True if character has sufficient gold
   */
  static async canAfford(
    characterId: string | mongoose.Types.ObjectId,
    amount: number
  ): Promise<boolean> {
    const balance = await this.getBalance(characterId);
    return balance >= amount;
  }

  /**
   * Get transaction history (paginated)
   *
   * @param characterId - Character whose history to fetch
   * @param limit - Maximum transactions to return
   * @param offset - Number of transactions to skip
   * @returns Array of transaction records
   */
  static async getTransactionHistory(
    characterId: string | mongoose.Types.ObjectId,
    limit: number = 50,
    offset: number = 0
  ): Promise<IGoldTransaction[]> {
    return GoldTransaction.find({ characterId })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean() as unknown as Promise<IGoldTransaction[]>;
  }

  /**
   * Get transaction statistics
   *
   * @param characterId - Character whose stats to calculate
   * @returns Summary statistics
   */
  static async getStatistics(characterId: string | mongoose.Types.ObjectId): Promise<{
    totalEarned: number;
    totalSpent: number;
    netGold: number;
    transactionCount: number;
    largestEarning: number;
    largestExpense: number;
  }> {
    const transactions = await GoldTransaction.find({ characterId });

    const totalEarned = transactions
      .filter(t => t.type === TransactionType.EARNED)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = Math.abs(
      transactions
        .filter(t => t.type === TransactionType.SPENT)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const largestEarning = Math.max(
      ...transactions.filter(t => t.type === TransactionType.EARNED).map(t => t.amount),
      0
    );

    const largestExpense = Math.abs(
      Math.min(
        ...transactions.filter(t => t.type === TransactionType.SPENT).map(t => t.amount),
        0
      )
    );

    return {
      totalEarned,
      totalSpent,
      netGold: totalEarned - totalSpent,
      transactionCount: transactions.length,
      largestEarning,
      largestExpense,
    };
  }

  /**
   * Get transactions by source (for analytics)
   *
   * @param characterId - Character to analyze
   * @param source - Transaction source to filter by
   * @returns Array of matching transactions
   */
  static async getTransactionsBySource(
    characterId: string | mongoose.Types.ObjectId,
    source: TransactionSource
  ): Promise<IGoldTransaction[]> {
    return GoldTransaction.find({ characterId, source })
      .sort({ timestamp: -1 })
      .lean() as unknown as Promise<IGoldTransaction[]>;
  }

  /**
   * Get total gold earned from a specific source
   *
   * @param characterId - Character to analyze
   * @param source - Transaction source
   * @returns Total gold from that source
   */
  static async getTotalFromSource(
    characterId: string | mongoose.Types.ObjectId,
    source: TransactionSource
  ): Promise<number> {
    const transactions = await this.getTransactionsBySource(characterId, source);
    return transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  /**
   * Transfer gold between characters (atomic transaction-safe)
   *
   * This ensures both the deduction and addition happen atomically:
   * - Either both succeed or both fail
   * - Prevents mid-transfer failures leaving inconsistent state
   * - Validates sender has sufficient funds before starting
   *
   * @param fromCharacterId - Character sending gold
   * @param toCharacterId - Character receiving gold
   * @param amount - Amount to transfer (must be positive)
   * @param source - Source/reason for transfer
   * @param metadata - Additional context
   * @returns Both transaction records and new balances
   */
  static async transferGold(
    fromCharacterId: string | mongoose.Types.ObjectId,
    toCharacterId: string | mongoose.Types.ObjectId,
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

    // Prevent self-transfer
    if (fromCharacterId.toString() === toCharacterId.toString()) {
      throw new Error('Cannot transfer gold to yourself');
    }

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
      const fromCharQuery = Character.findById(fromCharacterId);
      const toCharQuery = Character.findById(toCharacterId);

      const fromChar = session ? await fromCharQuery.session(session) : await fromCharQuery;
      const toChar = session ? await toCharQuery.session(session) : await toCharQuery;

      if (!fromChar) throw new Error('Sender character not found');
      if (!toChar) throw new Error('Recipient character not found');

      const fromBalanceBefore = fromChar.gold || 0;
      const toBalanceBefore = toChar.gold || 0;

      // Validate sufficient funds
      if (fromBalanceBefore < amount) {
        throw new Error(
          `Insufficient gold to transfer. Have ${fromBalanceBefore}, need ${amount}`
        );
      }

      // Perform atomic updates
      const fromBalanceAfter = fromBalanceBefore - amount;
      const toBalanceAfter = toBalanceBefore + amount;

      fromChar.gold = fromBalanceAfter;
      toChar.gold = toBalanceAfter;

      await fromChar.save(session ? { session } : undefined);
      await toChar.save(session ? { session } : undefined);

      // Create transaction records for both characters
      const transactions = await GoldTransaction.create([
        {
          characterId: fromChar._id,
          amount: -amount,
          type: TransactionType.SPENT,
          source,
          balanceBefore: fromBalanceBefore,
          balanceAfter: fromBalanceAfter,
          metadata: {
            ...metadata,
            targetCharacterId: toChar._id,
            transferType: 'sent',
          },
          timestamp: new Date(),
        },
        {
          characterId: toChar._id,
          amount: amount,
          type: TransactionType.EARNED,
          source,
          balanceBefore: toBalanceBefore,
          balanceAfter: toBalanceAfter,
          metadata: {
            ...metadata,
            targetCharacterId: fromChar._id,
            transferType: 'received',
          },
          timestamp: new Date(),
        },
      ], session ? { session } : {});

      if (session) await session.commitTransaction();

      logger.info(
        `Gold transferred: ${fromChar.name} sent ${amount} gold to ${toChar.name}. ` +
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
      logger.error('Error transferring gold:', error);
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  /**
   * Batch transfer gold to multiple recipients (atomic transaction-safe)
   * All transfers succeed or all fail together
   *
   * @param fromCharacterId - Character sending gold
   * @param transfers - Array of {characterId, amount} for each recipient
   * @param source - Source/reason for transfers
   * @param metadata - Additional context
   * @returns Array of transfer results
   */
  static async batchTransferGold(
    fromCharacterId: string | mongoose.Types.ObjectId,
    transfers: Array<{ characterId: string | mongoose.Types.ObjectId; amount: number }>,
    source: TransactionSource,
    metadata?: any
  ): Promise<Array<{
    toCharacterId: mongoose.Types.ObjectId;
    amount: number;
    toBalance: number;
  }>> {
    if (!transfers || transfers.length === 0) {
      throw new Error('No transfers specified');
    }

    // Validate all amounts are positive
    for (const transfer of transfers) {
      if (transfer.amount <= 0) {
        throw new Error('All transfer amounts must be positive');
      }
    }

    const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);

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

      // Fetch sender
      const fromCharQuery = Character.findById(fromCharacterId);
      const fromChar = session ? await fromCharQuery.session(session) : await fromCharQuery;

      if (!fromChar) throw new Error('Sender character not found');

      const fromBalanceBefore = fromChar.gold || 0;

      // Validate sufficient funds for all transfers
      if (fromBalanceBefore < totalAmount) {
        throw new Error(
          `Insufficient gold for batch transfer. Have ${fromBalanceBefore}, need ${totalAmount}`
        );
      }

      // Deduct total from sender
      const fromBalanceAfter = fromBalanceBefore - totalAmount;
      fromChar.gold = fromBalanceAfter;
      await fromChar.save(session ? { session } : undefined);

      // Process each recipient
      const results: Array<{
        toCharacterId: mongoose.Types.ObjectId;
        amount: number;
        toBalance: number;
      }> = [];

      const transactionRecords: any[] = [];

      // Create sender's transaction record
      transactionRecords.push({
        characterId: fromChar._id,
        amount: -totalAmount,
        type: TransactionType.SPENT,
        source,
        balanceBefore: fromBalanceBefore,
        balanceAfter: fromBalanceAfter,
        metadata: {
          ...metadata,
          transferCount: transfers.length,
          transferType: 'batch_sent',
        },
        timestamp: new Date(),
      });

      for (const transfer of transfers) {
        const toCharQuery = Character.findById(transfer.characterId);
        const toChar = session ? await toCharQuery.session(session) : await toCharQuery;

        if (!toChar) {
          throw new Error(`Recipient character ${transfer.characterId} not found`);
        }

        const toBalanceBefore = toChar.gold || 0;
        const toBalanceAfter = toBalanceBefore + transfer.amount;

        toChar.gold = toBalanceAfter;
        await toChar.save(session ? { session } : undefined);

        // Create recipient's transaction record
        transactionRecords.push({
          characterId: toChar._id,
          amount: transfer.amount,
          type: TransactionType.EARNED,
          source,
          balanceBefore: toBalanceBefore,
          balanceAfter: toBalanceAfter,
          metadata: {
            ...metadata,
            targetCharacterId: fromChar._id,
            transferType: 'batch_received',
          },
          timestamp: new Date(),
        });

        results.push({
          toCharacterId: toChar._id as any,
          amount: transfer.amount,
          toBalance: toBalanceAfter,
        });
      }

      // Create all transaction records
      await GoldTransaction.create(transactionRecords, session ? { session } : {});

      if (session) await session.commitTransaction();

      logger.info(
        `Batch gold transfer: ${fromChar.name} sent ${totalAmount} gold to ${transfers.length} recipients. ` +
        `Balance: ${fromBalanceBefore} -> ${fromBalanceAfter}`
      );

      return results;
    } catch (error) {
      if (session) await session.abortTransaction();
      logger.error('Error in batch gold transfer:', error);
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }
}
