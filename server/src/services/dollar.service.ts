/**
 * Dollar Service
 *
 * Handles all dollar (primary currency) economy operations with transaction safety and audit trail.
 * This is the refactored version of GoldService - Dollars are now the primary currency.
 *
 * Currency System:
 * - Dollars ($) - Primary currency for all transactions (this service)
 * - Gold Resource - Valuable material, handled by ResourceService
 * - Silver Resource - Common material, handled by ResourceService
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
import { WorldEvent } from '../models/WorldEvent.model';
import { Location } from '../models/Location.model';
import { WEALTH_TAX, CURRENCY_CONSTANTS, NEWCOMER_STAKE } from '@desperados/shared';
import logger from '../utils/logger';
import { QuestService } from './quest.service';
import { logEconomyEvent, EconomyEvent } from './base';
import { ProgressionService } from './progression.service';

// Re-export for convenience
export { TransactionSource, TransactionType, CurrencyType };

/**
 * Maximum dollars a character can hold
 * Using max safe 32-bit signed integer to prevent overflow issues
 */
export const MAX_DOLLARS = CURRENCY_CONSTANTS.MAX_DOLLARS;

/** @deprecated Use MAX_DOLLARS instead */
export const MAX_GOLD = MAX_DOLLARS;

export class DollarService {
  /**
   * Add dollars to character (transaction-safe)
   * Creates audit trail record
   *
   * @param characterId - Character receiving dollars
   * @param amount - Amount of dollars to add (must be positive)
   * @param source - Source of the dollar transaction
   * @param metadata - Additional context about the transaction
   * @param session - Optional MongoDB session for external transaction management
   * @returns New balance and transaction record
   */
  static async addDollars(
    characterId: string | mongoose.Types.ObjectId,
    amount: number,
    source: TransactionSource,
    metadata?: any,
    session?: mongoose.ClientSession
  ): Promise<{ newBalance: number; transaction: IGoldTransaction }> {
    if (amount < 0) {
      throw new Error('Cannot add negative dollars. Use deductDollars instead.');
    }

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const useSession = disableTransactions ? null : (session || await mongoose.startSession());
    const isExternalSession = !!session;

    try {
      if (!isExternalSession && useSession) {
        await useSession.startTransaction();
      }

      // First, get character info for world event modifiers (read-only)
      const characterQuery = Character.findById(characterId).select('currentLocation name dollars gold');
      const character = useSession ? await characterQuery.session(useSession) : await characterQuery;
      if (!character) throw new Error('Character not found');

      // Apply world event modifiers to dollars gained
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
              // ECONOMIC_BOOM event: increase dollars earned
              if (effect.type === 'price_modifier' && (effect.target === 'gold_earned' || effect.target === 'dollars_earned')) {
                modifiedAmount = Math.floor(modifiedAmount * effect.value);
                logger.info(`World event "${event.name}" modified dollar gain by ${effect.value}x (${effect.description})`);
              }
            }
          }
        }
      } catch (eventError) {
        // Don't fail dollar transaction if event check fails
        logger.error('Failed to check world events for dollar modifiers:', eventError);
      }

      // Apply prestige gold multiplier if character has prestige bonuses
      const prestige = (character as any).prestige;
      if (prestige?.permanentBonuses && prestige.permanentBonuses.length > 0) {
        const prestigeModifiedAmount = ProgressionService.applyPrestigeBonuses(
          modifiedAmount,
          'gold_multiplier',
          prestige
        );
        if (prestigeModifiedAmount !== modifiedAmount) {
          logger.debug(
            `Prestige gold bonus applied: ${modifiedAmount} → ${prestigeModifiedAmount} for character ${characterId}`
          );
          modifiedAmount = prestigeModifiedAmount;
        }
      }

      // PHASE 19: Apply newcomer stake bonus (+50% for first 2 hours)
      if (character.createdAt) {
        const newcomerBonus = this.applyNewcomerBonus(modifiedAmount, character.createdAt);
        if (newcomerBonus.bonusApplied) {
          logger.info(
            `Newcomer stake bonus applied: ${modifiedAmount} → ${newcomerBonus.adjustedAmount} ` +
            `(+${newcomerBonus.bonusAmount}) for character ${characterId}`
          );
          modifiedAmount = newcomerBonus.adjustedAmount;
        }
      }

      // Use dollars field, fallback to gold for migration
      const balanceBefore = character.dollars ?? character.gold ?? 0;

      // Enforce dollar cap to prevent overflow (check before atomic update)
      if (balanceBefore + modifiedAmount > MAX_DOLLARS) {
        throw new Error(`Dollar cap exceeded. Maximum dollars is ${MAX_DOLLARS.toLocaleString()}. Current: ${balanceBefore.toLocaleString()}, trying to add: ${modifiedAmount.toLocaleString()}`);
      }

      // ATOMIC UPDATE: Use findOneAndUpdate with $inc to prevent race conditions
      // Update both dollars and gold fields for backward compatibility during migration
      const updateResult = await Character.findOneAndUpdate(
        {
          _id: characterId,
          $or: [
            { dollars: { $lte: MAX_DOLLARS - modifiedAmount } },
            { dollars: { $exists: false }, gold: { $lte: MAX_DOLLARS - modifiedAmount } }
          ]
        },
        {
          $inc: { dollars: modifiedAmount, gold: modifiedAmount }
        },
        {
          new: true,
          session: useSession || undefined
        }
      );

      if (!updateResult) {
        // Either character doesn't exist or dollar cap would be exceeded
        throw new Error(`Failed to add dollars. Character may not exist or dollar cap would be exceeded.`);
      }

      const balanceAfter = updateResult.dollars ?? updateResult.gold;

      // Create transaction record with currencyType
      const transaction = await GoldTransaction.create([{
        characterId: updateResult._id,
        currencyType: CurrencyType.DOLLAR,
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
        `Dollars added: Character ${character.name} received $${modifiedAmount} from ${source}. ` +
        `Balance: $${balanceBefore} -> $${balanceAfter}`
      );

      // Audit log the dollar grant
      await logEconomyEvent({
        event: EconomyEvent.GOLD_GRANT,
        characterId: updateResult._id.toString(),
        amount: modifiedAmount,
        beforeBalance: balanceBefore,
        afterBalance: balanceAfter,
        metadata: {
          source,
          currencyType: 'DOLLAR',
          originalAmount: amount,
          modifiedAmount,
          ...metadata
        }
      });

      // Trigger quest progress for dollars earned (use modified amount)
      try {
        await QuestService.onDollarsEarned(updateResult._id.toString(), modifiedAmount);
      } catch (questError) {
        // Don't fail dollar transaction if quest update fails
        logger.error('Failed to update quest progress for dollars earned:', questError);
      }

      return {
        newBalance: balanceAfter,
        transaction: transaction[0],
      };
    } catch (error) {
      if (!isExternalSession && useSession) await useSession.abortTransaction();
      logger.error('Error adding dollars:', error);
      throw error;
    } finally {
      if (!isExternalSession && useSession) useSession.endSession();
    }
  }

  /**
   * Deduct dollars from character (transaction-safe, validates sufficient funds)
   * Creates audit trail record
   *
   * @param characterId - Character losing dollars
   * @param amount - Amount of dollars to deduct (must be positive)
   * @param source - Reason for the deduction
   * @param metadata - Additional context about the transaction
   * @param session - Optional MongoDB session for external transaction management
   * @returns New balance and transaction record
   */
  static async deductDollars(
    characterId: string | mongoose.Types.ObjectId,
    amount: number,
    source: TransactionSource,
    metadata?: any,
    session?: mongoose.ClientSession
  ): Promise<{ newBalance: number; transaction: IGoldTransaction }> {
    if (amount < 0) {
      throw new Error('Cannot deduct negative dollars. Use addDollars instead.');
    }

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const useSession = disableTransactions ? null : (session || await mongoose.startSession());
    const isExternalSession = !!session;

    try {
      if (!isExternalSession && useSession) await useSession.startTransaction();

      // First get current balance for transaction record (read-only)
      const characterQuery = Character.findById(characterId).select('dollars gold name');
      const character = useSession ? await characterQuery.session(useSession) : await characterQuery;
      if (!character) throw new Error('Character not found');

      const balanceBefore = character.dollars ?? character.gold ?? 0;

      // Pre-check for better error message (not security-critical, atomic op handles it)
      if (balanceBefore < amount) {
        throw new Error(`Insufficient dollars. Have $${balanceBefore}, need $${amount}`);
      }

      // ATOMIC UPDATE: Use findOneAndUpdate with $gte check to prevent double-spending
      // Update both dollars and gold fields for backward compatibility
      const updateResult = await Character.findOneAndUpdate(
        {
          _id: characterId,
          $or: [
            { dollars: { $gte: amount } },
            { dollars: { $exists: false }, gold: { $gte: amount } }
          ]
        },
        {
          $inc: { dollars: -amount, gold: -amount }
        },
        {
          new: true,
          session: useSession || undefined
        }
      );

      if (!updateResult) {
        // Race condition: another request already spent the dollars
        throw new Error(`Insufficient dollars (concurrent request). Have $${balanceBefore}, need $${amount}`);
      }

      const balanceAfter = updateResult.dollars ?? updateResult.gold;

      // Create transaction record (negative amount)
      const transaction = await GoldTransaction.create([{
        characterId: updateResult._id,
        currencyType: CurrencyType.DOLLAR,
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
        `Dollars deducted: Character ${character.name} spent $${amount} on ${source}. ` +
        `Balance: $${balanceBefore} -> $${balanceAfter}`
      );

      // Audit log the dollar deduction
      await logEconomyEvent({
        event: EconomyEvent.GOLD_DEDUCT,
        characterId: updateResult._id.toString(),
        amount: -amount,
        beforeBalance: balanceBefore,
        afterBalance: balanceAfter,
        metadata: {
          source,
          currencyType: 'DOLLAR',
          ...metadata
        }
      });

      return {
        newBalance: balanceAfter,
        transaction: transaction[0],
      };
    } catch (error) {
      if (!isExternalSession && useSession) await useSession.abortTransaction();
      logger.error('Error deducting dollars:', error);
      throw error;
    } finally {
      if (!isExternalSession && useSession) useSession.endSession();
    }
  }

  /**
   * Get current dollar balance
   *
   * @param characterId - Character to check
   * @returns Current dollar balance
   */
  static async getBalance(characterId: string | mongoose.Types.ObjectId): Promise<number> {
    const character = await Character.findById(characterId).select('dollars gold');
    return character?.dollars ?? character?.gold ?? 0;
  }

  /**
   * Check if character can afford amount
   *
   * @param characterId - Character to check
   * @param amount - Amount needed
   * @returns True if character has sufficient dollars
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
   * @param currencyType - Optional filter by currency type
   * @returns Array of transaction records
   */
  static async getTransactionHistory(
    characterId: string | mongoose.Types.ObjectId,
    limit: number = 50,
    offset: number = 0,
    currencyType?: CurrencyType
  ): Promise<IGoldTransaction[]> {
    const query: any = { characterId };
    if (currencyType) {
      query.currencyType = currencyType;
    }

    return GoldTransaction.find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean() as unknown as Promise<IGoldTransaction[]>;
  }

  /**
   * Get transaction statistics
   *
   * @param characterId - Character whose stats to calculate
   * @param currencyType - Optional filter by currency type
   * @returns Summary statistics
   */
  static async getStatistics(
    characterId: string | mongoose.Types.ObjectId,
    currencyType: CurrencyType = CurrencyType.DOLLAR
  ): Promise<{
    totalEarned: number;
    totalSpent: number;
    netAmount: number;
    transactionCount: number;
    largestEarning: number;
    largestExpense: number;
  }> {
    const query: any = { characterId };
    if (currencyType) {
      query.$or = [
        { currencyType },
        { currencyType: { $exists: false } } // Include legacy records without currencyType
      ];
    }

    const transactions = await GoldTransaction.find(query).lean();

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
      netAmount: totalEarned - totalSpent,
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
   * Get total dollars earned from a specific source
   *
   * @param characterId - Character to analyze
   * @param source - Transaction source
   * @returns Total dollars from that source
   */
  static async getTotalFromSource(
    characterId: string | mongoose.Types.ObjectId,
    source: TransactionSource
  ): Promise<number> {
    const transactions = await this.getTransactionsBySource(characterId, source);
    return transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  /**
   * Transfer dollars between characters (atomic transaction-safe)
   *
   * @param fromCharacterId - Character sending dollars
   * @param toCharacterId - Character receiving dollars
   * @param amount - Amount to transfer (must be positive)
   * @param source - Source/reason for transfer
   * @param metadata - Additional context
   * @returns Both transaction records and new balances
   */
  static async transferDollars(
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
      throw new Error('Cannot transfer dollars to yourself');
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

      // Fetch both characters for validation and transaction records
      const fromCharQuery = Character.findById(fromCharacterId).select('dollars gold name');
      const toCharQuery = Character.findById(toCharacterId).select('dollars gold name');

      const fromChar = session ? await fromCharQuery.session(session) : await fromCharQuery;
      const toChar = session ? await toCharQuery.session(session) : await toCharQuery;

      if (!fromChar) throw new Error('Sender character not found');
      if (!toChar) throw new Error('Recipient character not found');

      const fromBalanceBefore = fromChar.dollars ?? fromChar.gold ?? 0;
      const toBalanceBefore = toChar.dollars ?? toChar.gold ?? 0;

      // Pre-validation for better error messages
      if (fromBalanceBefore < amount) {
        throw new Error(
          `Insufficient dollars to transfer. Have $${fromBalanceBefore}, need $${amount}`
        );
      }

      // Enforce dollar cap for recipient
      if (toBalanceBefore + amount > MAX_DOLLARS) {
        throw new Error(`Transfer would exceed recipient's dollar cap. Maximum is $${MAX_DOLLARS.toLocaleString()}. Recipient has: $${toBalanceBefore.toLocaleString()}, trying to add: $${amount.toLocaleString()}`);
      }

      // ATOMIC UPDATE: Use bulkWrite to update both characters in a single atomic operation
      const bulkResult = await Character.bulkWrite([
        {
          updateOne: {
            filter: {
              _id: fromCharacterId,
              $or: [
                { dollars: { $gte: amount } },
                { dollars: { $exists: false }, gold: { $gte: amount } }
              ]
            },
            update: {
              $inc: { dollars: -amount, gold: -amount }
            }
          }
        },
        {
          updateOne: {
            filter: {
              _id: toCharacterId,
              $or: [
                { dollars: { $lte: MAX_DOLLARS - amount } },
                { dollars: { $exists: false }, gold: { $lte: MAX_DOLLARS - amount } }
              ]
            },
            update: {
              $inc: { dollars: amount, gold: amount }
            }
          }
        }
      ], { session: session || undefined, ordered: true });

      // Verify both updates succeeded
      if (bulkResult.modifiedCount !== 2) {
        throw new Error(
          `Transfer failed: concurrent modification detected. ` +
          `Only ${bulkResult.modifiedCount} of 2 updates succeeded. ` +
          `This may indicate insufficient funds or dollar cap exceeded.`
        );
      }

      // Calculate final balances
      const fromBalanceAfter = fromBalanceBefore - amount;
      const toBalanceAfter = toBalanceBefore + amount;

      // Create transaction records for both characters
      const transactions = await GoldTransaction.create([
        {
          characterId: fromChar._id,
          currencyType: CurrencyType.DOLLAR,
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
          currencyType: CurrencyType.DOLLAR,
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
        `Dollars transferred: ${fromChar.name} sent $${amount} to ${toChar.name}. ` +
        `Sender: $${fromBalanceBefore} -> $${fromBalanceAfter}, ` +
        `Recipient: $${toBalanceBefore} -> $${toBalanceAfter}`
      );

      // Audit log the dollar transfer
      await logEconomyEvent({
        event: EconomyEvent.GOLD_TRANSFER,
        characterId: fromChar._id.toString(),
        amount: amount,
        beforeBalance: fromBalanceBefore,
        afterBalance: fromBalanceAfter,
        metadata: {
          source,
          currencyType: 'DOLLAR',
          toCharacterId: toChar._id.toString(),
          toCharacterName: toChar.name,
          recipientBeforeBalance: toBalanceBefore,
          recipientAfterBalance: toBalanceAfter,
          ...metadata
        }
      });

      return {
        fromBalance: fromBalanceAfter,
        toBalance: toBalanceAfter,
        fromTransaction: transactions[0],
        toTransaction: transactions[1],
      };
    } catch (error) {
      if (session) await session.abortTransaction();
      logger.error('Error transferring dollars:', error);
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  /**
   * Batch transfer dollars to multiple recipients (atomic transaction-safe)
   * All transfers succeed or all fail together
   */
  static async batchTransferDollars(
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

      // Fetch sender and all recipients for validation
      const fromCharQuery = Character.findById(fromCharacterId).select('dollars gold name');
      const fromChar = session ? await fromCharQuery.session(session) : await fromCharQuery;

      if (!fromChar) throw new Error('Sender character not found');

      const fromBalanceBefore = fromChar.dollars ?? fromChar.gold ?? 0;

      // Validate sufficient funds for all transfers
      if (fromBalanceBefore < totalAmount) {
        throw new Error(
          `Insufficient dollars for batch transfer. Have $${fromBalanceBefore}, need $${totalAmount}`
        );
      }

      // Fetch all recipients and validate
      const recipientIds = transfers.map(t => t.characterId);
      const recipientsQuery = Character.find({ _id: { $in: recipientIds } }).select('dollars gold name');
      const recipients = session ? await recipientsQuery.session(session) : await recipientsQuery;

      if (recipients.length !== transfers.length) {
        const foundIds = new Set(recipients.map(r => r._id.toString()));
        const missingIds = recipientIds.filter(id => !foundIds.has(id.toString()));
        throw new Error(`Recipient characters not found: ${missingIds.join(', ')}`);
      }

      // Create a map of recipient ID to character for quick lookup
      const recipientMap = new Map(recipients.map(r => [r._id.toString(), r]));

      // Validate dollar caps for all recipients
      const recipientBalances: Map<string, { before: number; after: number; name: string }> = new Map();
      for (const transfer of transfers) {
        const recipient = recipientMap.get(transfer.characterId.toString())!;
        const balanceBefore = recipient.dollars ?? recipient.gold ?? 0;
        const balanceAfter = balanceBefore + transfer.amount;

        if (balanceAfter > MAX_DOLLARS) {
          throw new Error(
            `Batch transfer would exceed recipient's dollar cap. ` +
            `Character ${recipient.name} has: $${balanceBefore.toLocaleString()}, ` +
            `trying to add: $${transfer.amount.toLocaleString()}`
          );
        }

        recipientBalances.set(transfer.characterId.toString(), {
          before: balanceBefore,
          after: balanceAfter,
          name: recipient.name
        });
      }

      // PRODUCTION FIX: Build bulk operations with optimistic locking
      // Use exact balance check to prevent race conditions where balance changes between read and write
      const bulkOperations: any[] = [
        {
          updateOne: {
            filter: {
              _id: fromCharacterId,
              // Optimistic lock: check exact balance we read earlier
              $or: [
                { dollars: fromBalanceBefore },
                { dollars: { $exists: false }, gold: fromBalanceBefore }
              ]
            },
            update: {
              $inc: { dollars: -totalAmount, gold: -totalAmount }
            }
          }
        }
      ];

      for (const transfer of transfers) {
        const recipientBalance = recipientBalances.get(transfer.characterId.toString())!;
        bulkOperations.push({
          updateOne: {
            filter: {
              _id: transfer.characterId,
              // Optimistic lock: check exact balance we read earlier
              $or: [
                { dollars: recipientBalance.before },
                { dollars: { $exists: false }, gold: recipientBalance.before }
              ]
            },
            update: {
              $inc: { dollars: transfer.amount, gold: transfer.amount }
            }
          }
        });
      }

      const bulkResult = await Character.bulkWrite(bulkOperations, {
        session: session || undefined,
        ordered: true
      });

      const expectedModifications = 1 + transfers.length;
      if (bulkResult.modifiedCount !== expectedModifications) {
        throw new Error(
          `Batch transfer failed: concurrent modification detected. ` +
          `Only ${bulkResult.modifiedCount} of ${expectedModifications} updates succeeded.`
        );
      }

      const fromBalanceAfter = fromBalanceBefore - totalAmount;

      // Build results and transaction records
      const results: Array<{
        toCharacterId: mongoose.Types.ObjectId;
        amount: number;
        toBalance: number;
      }> = [];

      const transactionRecords: any[] = [{
        characterId: fromChar._id,
        currencyType: CurrencyType.DOLLAR,
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
      }];

      for (const transfer of transfers) {
        const balanceInfo = recipientBalances.get(transfer.characterId.toString())!;
        const recipient = recipientMap.get(transfer.characterId.toString())!;

        transactionRecords.push({
          characterId: recipient._id,
          currencyType: CurrencyType.DOLLAR,
          amount: transfer.amount,
          type: TransactionType.EARNED,
          source,
          balanceBefore: balanceInfo.before,
          balanceAfter: balanceInfo.after,
          metadata: {
            ...metadata,
            targetCharacterId: fromChar._id,
            transferType: 'batch_received',
          },
          timestamp: new Date(),
        });

        results.push({
          toCharacterId: recipient._id as any,
          amount: transfer.amount,
          toBalance: balanceInfo.after,
        });
      }

      await GoldTransaction.create(transactionRecords, session ? { session } : {});

      if (session) await session.commitTransaction();

      logger.info(
        `Batch dollar transfer: ${fromChar.name} sent $${totalAmount} to ${transfers.length} recipients. ` +
        `Balance: $${fromBalanceBefore} -> $${fromBalanceAfter}`
      );

      return results;
    } catch (error) {
      if (session) await session.abortTransaction();
      logger.error('Error in batch dollar transfer:', error);
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  /**
   * Batch refund dollars to multiple characters (optimized for marketplace bid refunds)
   */
  static async batchRefundDollars(
    refunds: Array<{ characterId: string; amount: number }>,
    source: TransactionSource,
    metadata: any,
    session: mongoose.ClientSession
  ): Promise<void> {
    if (!refunds || refunds.length === 0) {
      return;
    }

    for (const refund of refunds) {
      if (refund.amount <= 0) {
        throw new Error('All refund amounts must be positive');
      }
    }

    const characterIds = refunds.map(r => new mongoose.Types.ObjectId(r.characterId));

    const characters = await Character.find({ _id: { $in: characterIds } })
      .select('dollars gold name')
      .session(session)
      .lean();

    const characterMap = new Map(characters.map(c => [c._id.toString(), c]));

    const missingIds = refunds.filter(r => !characterMap.has(r.characterId));
    if (missingIds.length > 0) {
      throw new Error(`Characters not found for refund: ${missingIds.map(r => r.characterId).join(', ')}`);
    }

    // PHASE 4 FIX: Validate each refund won't exceed MAX_DOLLARS cap
    // Cap refunds that would exceed the maximum balance
    const cappedRefunds = refunds.map(refund => {
      const character = characterMap.get(refund.characterId)!;
      const currentBalance = (character as any).dollars ?? (character as any).gold ?? 0;
      const newBalance = currentBalance + refund.amount;

      if (newBalance > MAX_DOLLARS) {
        // Cap the refund to reach exactly MAX_DOLLARS
        const cappedAmount = Math.max(0, MAX_DOLLARS - currentBalance);

        if (cappedAmount < refund.amount) {
          logger.warn('Batch refund capped to MAX_DOLLARS', {
            characterId: refund.characterId,
            characterName: (character as any).name,
            originalAmount: refund.amount,
            cappedAmount,
            currentBalance,
            maxDollars: MAX_DOLLARS
          });
        }

        return {
          characterId: refund.characterId,
          amount: cappedAmount,
          originalAmount: refund.amount,
          wasCapped: cappedAmount < refund.amount
        };
      }

      return {
        characterId: refund.characterId,
        amount: refund.amount,
        originalAmount: refund.amount,
        wasCapped: false
      };
    });

    // Filter out zero-amount refunds (those already at cap)
    const validRefunds = cappedRefunds.filter(r => r.amount > 0);

    if (validRefunds.length === 0) {
      logger.info('All batch refunds capped to zero - all characters at MAX_DOLLARS');
      return;
    }

    const bulkOps = validRefunds.map(refund => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(refund.characterId) },
        update: { $inc: { dollars: refund.amount, gold: refund.amount } }
      }
    }));

    await Character.bulkWrite(bulkOps, { session });

    // PHASE 4 FIX: Use capped refund amounts for transaction records
    const transactionRecords = validRefunds.map(refund => {
      const character = characterMap.get(refund.characterId)!;
      const balanceBefore = (character as any).dollars ?? (character as any).gold ?? 0;
      const balanceAfter = balanceBefore + refund.amount;

      return {
        characterId: new mongoose.Types.ObjectId(refund.characterId),
        currencyType: CurrencyType.DOLLAR,
        amount: refund.amount,
        type: TransactionType.EARNED,
        source,
        balanceBefore,
        balanceAfter,
        metadata: {
          ...metadata,
          refundType: 'batch_refund',
          originalAmount: refund.originalAmount,
          wasCapped: refund.wasCapped,
        },
        timestamp: new Date(),
      };
    });

    if (transactionRecords.length > 0) {
      await GoldTransaction.create(transactionRecords, { session });
    }

    const cappedCount = cappedRefunds.filter(r => r.wasCapped).length;
    logger.info(
      `Batch dollar refund: ${validRefunds.length} characters refunded, ` +
      `total: $${validRefunds.reduce((sum, r) => sum + r.amount, 0)}` +
      (cappedCount > 0 ? ` (${cappedCount} capped to MAX_DOLLARS)` : '')
    );
  }

  // ============================================
  // WEALTH TAX SYSTEM (Phase 3.3 Balance Fix)
  // ============================================

  /**
   * Calculate progressive wealth tax for a dollar balance
   */
  static calculateWealthTax(dollarBalance: number): number {
    if (dollarBalance <= WEALTH_TAX.EXEMPT_THRESHOLD) {
      return 0;
    }

    let totalTax = 0;

    for (const tier of WEALTH_TAX.TIERS) {
      if (dollarBalance <= tier.min) {
        break;
      }

      const taxableInTier = Math.min(dollarBalance, tier.max) - tier.min;

      if (taxableInTier > 0) {
        totalTax += Math.floor(taxableInTier * tier.rate);
      }
    }

    if (totalTax < WEALTH_TAX.MIN_COLLECTION_AMOUNT) {
      return 0;
    }

    return Math.min(totalTax, WEALTH_TAX.MAX_DAILY_TAX);
  }

  /**
   * Check if character is exempt from wealth tax (new player grace period)
   */
  static isInWealthTaxGracePeriod(createdAt: Date): boolean {
    const gracePeriodMs = WEALTH_TAX.NEW_PLAYER_GRACE_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return (now - createdAt.getTime()) < gracePeriodMs;
  }

  /**
   * Collect wealth tax from a character (transaction-safe)
   */
  static async collectWealthTax(
    characterId: string | mongoose.Types.ObjectId,
    session?: mongoose.ClientSession
  ): Promise<{ taxCollected: number; newBalance: number } | null> {
    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const useSession = disableTransactions ? null : (session || await mongoose.startSession());
    const isExternalSession = !!session;

    try {
      if (!isExternalSession && useSession) {
        await useSession.startTransaction();
      }

      const characterQuery = Character.findById(characterId).select('dollars gold name createdAt');
      const character = useSession
        ? await characterQuery.session(useSession)
        : await characterQuery;

      if (!character) {
        logger.warn(`Wealth tax: Character ${characterId} not found`);
        return null;
      }

      if (this.isInWealthTaxGracePeriod(character.createdAt)) {
        logger.debug(
          `Wealth tax: Character ${character.name} is in grace period, skipping`
        );
        return null;
      }

      const balanceBefore = character.dollars ?? character.gold ?? 0;
      const taxAmount = this.calculateWealthTax(balanceBefore);

      if (taxAmount <= 0) {
        if (!isExternalSession && useSession) {
          await useSession.abortTransaction();
        }
        return null;
      }

      const updateResult = await Character.findOneAndUpdate(
        {
          _id: characterId,
          $or: [
            { dollars: { $gte: taxAmount } },
            { dollars: { $exists: false }, gold: { $gte: taxAmount } }
          ]
        },
        {
          $inc: { dollars: -taxAmount, gold: -taxAmount }
        },
        {
          new: true,
          session: useSession || undefined
        }
      );

      if (!updateResult) {
        logger.error(
          `Wealth tax: Failed to collect $${taxAmount} from ${character.name} (balance: $${balanceBefore})`
        );
        if (!isExternalSession && useSession) {
          await useSession.abortTransaction();
        }
        return null;
      }

      const balanceAfter = updateResult.dollars ?? updateResult.gold;

      await GoldTransaction.create([{
        characterId: updateResult._id,
        currencyType: CurrencyType.DOLLAR,
        amount: -taxAmount,
        type: TransactionType.SPENT,
        source: TransactionSource.WEALTH_TAX,
        balanceBefore,
        balanceAfter,
        metadata: {
          taxType: 'wealth_tax',
          taxRate: 'progressive',
          balanceAtTax: balanceBefore
        },
        timestamp: new Date()
      }], useSession ? { session: useSession } : {});

      if (!isExternalSession && useSession) {
        await useSession.commitTransaction();
      }

      logger.info(
        `Wealth tax collected: ${character.name} paid $${taxAmount}. ` +
        `Balance: $${balanceBefore} -> $${balanceAfter}`
      );

      await logEconomyEvent({
        event: EconomyEvent.GOLD_DEDUCT,
        characterId: updateResult._id.toString(),
        amount: -taxAmount,
        beforeBalance: balanceBefore,
        afterBalance: balanceAfter,
        metadata: {
          source: TransactionSource.WEALTH_TAX,
          currencyType: 'DOLLAR',
          taxType: 'wealth_tax'
        }
      });

      return {
        taxCollected: taxAmount,
        newBalance: balanceAfter
      };
    } catch (error) {
      if (!isExternalSession && useSession) {
        await useSession.abortTransaction();
      }
      logger.error('Error collecting wealth tax:', error);
      throw error;
    } finally {
      if (!isExternalSession && useSession) {
        useSession.endSession();
      }
    }
  }

  /**
   * Batch collect wealth tax from multiple characters
   */
  static async batchCollectWealthTax(): Promise<{
    processed: number;
    collected: number;
    totalTax: number;
    skipped: number;
    errors: number;
  }> {
    const stats = {
      processed: 0,
      collected: 0,
      totalTax: 0,
      skipped: 0,
      errors: 0
    };

    try {
      // Find characters above threshold (check both dollars and gold for migration)
      const wealthyCharacters = await Character.find({
        $or: [
          { dollars: { $gt: WEALTH_TAX.EXEMPT_THRESHOLD } },
          { gold: { $gt: WEALTH_TAX.EXEMPT_THRESHOLD } }
        ]
      }).select('_id dollars gold name createdAt');

      logger.info(
        `[WealthTax] Found ${wealthyCharacters.length} characters above $${WEALTH_TAX.EXEMPT_THRESHOLD.toLocaleString()} threshold`
      );

      for (const character of wealthyCharacters) {
        stats.processed++;

        try {
          const result = await this.collectWealthTax(character._id.toString());

          if (result) {
            stats.collected++;
            stats.totalTax += result.taxCollected;
          } else {
            stats.skipped++;
          }
        } catch (error) {
          stats.errors++;
          logger.error(
            `[WealthTax] Error collecting from character ${character.name}:`,
            error
          );
        }
      }

      logger.info(
        `[WealthTax] Collection complete: ` +
        `${stats.collected}/${stats.processed} characters taxed, ` +
        `$${stats.totalTax.toLocaleString()} collected, ` +
        `${stats.skipped} skipped, ${stats.errors} errors`
      );

      return stats;
    } catch (error) {
      logger.error('[WealthTax] Batch collection failed:', error);
      throw error;
    }
  }

  // ============================================
  // PHASE 19: NEWCOMER STAKE SYSTEM
  // ============================================

  /**
   * Check if a character is eligible for the newcomer stake bonus
   *
   * @param createdAt - Character creation timestamp
   * @param totalPlayTime - Optional: cumulative play time in ms (for future anti-abuse)
   * @returns True if character is still in newcomer period
   */
  static isInNewcomerPeriod(createdAt: Date, totalPlayTime?: number): boolean {
    const timeSinceCreation = Date.now() - createdAt.getTime();
    return timeSinceCreation < NEWCOMER_STAKE.DURATION_MS;
  }

  /**
   * Get the newcomer stake multiplier for a character
   *
   * @param createdAt - Character creation timestamp
   * @returns Gold multiplier (1.5 for newcomers, 1.0 for veterans)
   */
  static getNewcomerMultiplier(createdAt: Date): number {
    if (this.isInNewcomerPeriod(createdAt)) {
      return NEWCOMER_STAKE.GOLD_MULTIPLIER;
    }
    return 1.0;
  }

  /**
   * Get newcomer stake status for a character
   * Returns details for UI display
   */
  static getNewcomerStakeStatus(createdAt: Date): {
    isActive: boolean;
    multiplier: number;
    message: string;
    timeRemainingMs: number;
  } {
    const timeSinceCreation = Date.now() - createdAt.getTime();
    const isActive = timeSinceCreation < NEWCOMER_STAKE.DURATION_MS;

    if (isActive) {
      return {
        isActive: true,
        multiplier: NEWCOMER_STAKE.GOLD_MULTIPLIER,
        message: NEWCOMER_STAKE.ACTIVE_MESSAGE,
        timeRemainingMs: NEWCOMER_STAKE.DURATION_MS - timeSinceCreation
      };
    }

    return {
      isActive: false,
      multiplier: 1.0,
      message: NEWCOMER_STAKE.EXPIRED_MESSAGE,
      timeRemainingMs: 0
    };
  }

  /**
   * Apply newcomer stake bonus to a dollar amount
   * This is called internally by addDollars but can also be called directly
   * for preview/calculation purposes
   *
   * @param amount - Base dollar amount
   * @param createdAt - Character creation timestamp
   * @returns Adjusted amount with newcomer bonus if applicable
   */
  static applyNewcomerBonus(amount: number, createdAt: Date): {
    originalAmount: number;
    adjustedAmount: number;
    bonusApplied: boolean;
    bonusAmount: number;
  } {
    const multiplier = this.getNewcomerMultiplier(createdAt);
    const adjustedAmount = Math.floor(amount * multiplier);
    const bonusAmount = adjustedAmount - amount;

    return {
      originalAmount: amount,
      adjustedAmount,
      bonusApplied: multiplier > 1.0,
      bonusAmount
    };
  }

  // ============================================
  // BACKWARD COMPATIBILITY ALIASES
  // ============================================

  /** @deprecated Use addDollars instead */
  static async addGold(
    characterId: string | mongoose.Types.ObjectId,
    amount: number,
    source: TransactionSource,
    metadata?: any,
    session?: mongoose.ClientSession
  ): Promise<{ newBalance: number; transaction: IGoldTransaction }> {
    return this.addDollars(characterId, amount, source, metadata, session);
  }

  /** @deprecated Use deductDollars instead */
  static async deductGold(
    characterId: string | mongoose.Types.ObjectId,
    amount: number,
    source: TransactionSource,
    metadata?: any,
    session?: mongoose.ClientSession
  ): Promise<{ newBalance: number; transaction: IGoldTransaction }> {
    return this.deductDollars(characterId, amount, source, metadata, session);
  }

  /** @deprecated Use transferDollars instead */
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
    return this.transferDollars(fromCharacterId, toCharacterId, amount, source, metadata);
  }

  /** @deprecated Use batchTransferDollars instead */
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
    return this.batchTransferDollars(fromCharacterId, transfers, source, metadata);
  }

  /** @deprecated Use batchRefundDollars instead */
  static async batchRefundGold(
    refunds: Array<{ characterId: string; amount: number }>,
    source: TransactionSource,
    metadata: any,
    session: mongoose.ClientSession
  ): Promise<void> {
    return this.batchRefundDollars(refunds, source, metadata, session);
  }
}

// Also export as GoldService for backward compatibility
export { DollarService as GoldService };
