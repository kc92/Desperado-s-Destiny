/**
 * Bank Service
 *
 * Handles bank vault operations for the Red Gulch Bank
 * Simple vault system for secure gold storage
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { GoldTransaction, TransactionType, TransactionSource } from '../models/GoldTransaction.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Vault tier configuration
 */
export const VAULT_TIERS = {
  none: {
    capacity: 0,
    upgradeCost: 0,
    name: 'No Vault',
    description: 'Open a Bronze Vault to start storing gold securely.'
  },
  bronze: {
    capacity: 500,
    upgradeCost: 0,
    name: 'Bronze Vault',
    description: 'Basic vault storage. Capacity: 500 gold.'
  },
  silver: {
    capacity: 2000,
    upgradeCost: 100,
    name: 'Silver Vault',
    description: 'Enhanced vault storage. Capacity: 2,000 gold.'
  },
  gold: {
    capacity: Infinity,
    upgradeCost: 500,
    name: 'Gold Vault',
    description: 'Premium vault storage. Unlimited capacity.'
  }
} as const;

export type VaultTier = keyof typeof VAULT_TIERS;

/**
 * Bank vault information interface
 */
export interface VaultInfo {
  tier: VaultTier;
  tierName: string;
  balance: number;
  capacity: number;
  availableSpace: number;
  nextTier: VaultTier | null;
  upgradeCost: number;
}

export class BankService {
  /**
   * Get vault information for a character
   */
  static async getVaultInfo(characterId: string): Promise<VaultInfo> {
    const character = await Character.findById(characterId)
      .select('bankVaultBalance bankVaultTier');

    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const tier = (character.bankVaultTier || 'none') as VaultTier;
    const tierConfig = VAULT_TIERS[tier];
    const balance = character.bankVaultBalance || 0;
    const capacity = tierConfig.capacity;
    const availableSpace = capacity === Infinity ? Infinity : capacity - balance;

    // Determine next tier
    const tierOrder: VaultTier[] = ['none', 'bronze', 'silver', 'gold'];
    const currentIndex = tierOrder.indexOf(tier);
    const nextTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
    const upgradeCost = nextTier ? VAULT_TIERS[nextTier].upgradeCost : 0;

    return {
      tier,
      tierName: tierConfig.name,
      balance,
      capacity: capacity === Infinity ? -1 : capacity, // -1 represents unlimited
      availableSpace: availableSpace === Infinity ? -1 : availableSpace,
      nextTier,
      upgradeCost
    };
  }

  /**
   * Open or upgrade vault tier
   * Uses atomic operations to prevent race conditions
   */
  static async upgradeVault(
    characterId: string,
    targetTier: VaultTier
  ): Promise<{ success: boolean; newTier: VaultTier; message: string }> {
    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const session = disableTransactions ? null : await mongoose.startSession();

    try {
      if (session) {
        await session.startTransaction();
      }

      // First, get character info for validation
      const characterQuery = Character.findById(characterId)
        .select('name gold bankVaultTier');
      const character = session ? await characterQuery.session(session) : await characterQuery;

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const currentTier = (character.bankVaultTier || 'none') as VaultTier;
      const tierOrder: VaultTier[] = ['none', 'bronze', 'silver', 'gold'];
      const currentIndex = tierOrder.indexOf(currentTier);
      const targetIndex = tierOrder.indexOf(targetTier);

      // Validate upgrade path
      if (targetIndex <= currentIndex) {
        throw new AppError('Cannot downgrade vault or upgrade to same tier', 400);
      }

      if (targetIndex !== currentIndex + 1) {
        throw new AppError('Must upgrade vault one tier at a time', 400);
      }

      const upgradeCost = VAULT_TIERS[targetTier].upgradeCost;
      const balanceBefore = character.gold;

      // ATOMIC OPERATION: Check gold and upgrade vault in one operation
      const updateOperation: Record<string, unknown> = {
        $set: { bankVaultTier: targetTier }
      };

      // Build query with gold check if there's a cost
      const query: Record<string, unknown> = {
        _id: characterId,
        bankVaultTier: currentTier  // Ensure tier hasn't changed
      };

      if (upgradeCost > 0) {
        query.gold = { $gte: upgradeCost };
        updateOperation.$inc = { gold: -upgradeCost };
      }

      const result = await Character.findOneAndUpdate(
        query,
        updateOperation,
        {
          new: true,
          session: session || undefined
        }
      );

      if (!result) {
        // The atomic check failed - check why
        const currentChar = await Character.findById(characterId).select('gold bankVaultTier');
        if (currentChar?.bankVaultTier !== currentTier) {
          throw new AppError('Vault tier has already changed. Please refresh and try again.', 400);
        }
        if (upgradeCost > 0 && currentChar && currentChar.gold < upgradeCost) {
          throw new AppError(`Insufficient gold. Need ${upgradeCost} gold to upgrade.`, 400);
        }
        throw new AppError('Upgrade failed. Please try again.', 400);
      }

      // Record transaction if there was a cost
      if (upgradeCost > 0) {
        await GoldTransaction.create([{
          characterId: result._id,
          amount: -upgradeCost,
          type: TransactionType.SPENT,
          source: TransactionSource.BANK_VAULT_UPGRADE,
          balanceBefore,
          balanceAfter: result.gold,
          metadata: {
            fromTier: currentTier,
            toTier: targetTier,
            description: `Upgraded vault from ${VAULT_TIERS[currentTier].name} to ${VAULT_TIERS[targetTier].name}`
          },
          timestamp: new Date()
        }], session ? { session } : {});
      }

      if (session) {
        await session.commitTransaction();
      }

      logger.info(
        `Vault upgraded: ${result.name} upgraded from ${currentTier} to ${targetTier} ` +
        `(cost: ${upgradeCost} gold)`
      );

      return {
        success: true,
        newTier: targetTier,
        message: `Successfully upgraded to ${VAULT_TIERS[targetTier].name}!`
      };
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  /**
   * Deposit gold into vault
   * Uses atomic $inc operations to prevent race conditions
   */
  static async deposit(
    characterId: string,
    amount: number
  ): Promise<{ success: boolean; vaultBalance: number; walletBalance: number }> {
    if (amount <= 0) {
      throw new AppError('Deposit amount must be positive', 400);
    }

    if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
      throw new AppError('Deposit amount must be a valid integer', 400);
    }

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const session = disableTransactions ? null : await mongoose.startSession();

    try {
      if (session) {
        await session.startTransaction();
      }

      // First, get character info for validation (non-atomic checks)
      const characterQuery = Character.findById(characterId)
        .select('name gold bankVaultBalance bankVaultTier');
      const character = session ? await characterQuery.session(session) : await characterQuery;

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const tier = (character.bankVaultTier || 'none') as VaultTier;

      // Check if character has a vault
      if (tier === 'none') {
        throw new AppError('You need to open a Bronze Vault first', 400);
      }

      const tierConfig = VAULT_TIERS[tier];
      const currentVaultBalance = character.bankVaultBalance || 0;
      const capacity = tierConfig.capacity;

      // Check capacity (this is a soft check - the atomic update will do the final validation)
      if (capacity !== Infinity && currentVaultBalance + amount > capacity) {
        const available = capacity - currentVaultBalance;
        throw new AppError(
          `Vault capacity exceeded. Available space: ${available} gold. ` +
          `Upgrade to ${tier === 'bronze' ? 'Silver' : 'Gold'} Vault for more capacity.`,
          400
        );
      }

      // Store values before for transaction record
      const walletBefore = character.gold;
      const vaultBefore = currentVaultBalance;

      // ATOMIC OPERATION: Check gold availability and perform transfer in one operation
      // This prevents race conditions where two deposits could both pass the check
      const updateQuery: Record<string, unknown> = {
        _id: characterId,
        gold: { $gte: amount }  // Atomic check: must have enough gold
      };

      // For non-infinite capacity, also check vault space atomically
      if (capacity !== Infinity) {
        updateQuery.bankVaultBalance = { $lte: capacity - amount };
      }

      const result = await Character.findOneAndUpdate(
        updateQuery,
        {
          $inc: {
            gold: -amount,
            bankVaultBalance: amount
          }
        },
        {
          new: true,
          session: session || undefined
        }
      );

      if (!result) {
        // The atomic check failed - either insufficient gold or vault full
        // Re-check to provide accurate error message
        const currentChar = await Character.findById(characterId).select('gold bankVaultBalance');
        if (currentChar && currentChar.gold < amount) {
          throw new AppError(`Insufficient gold. You have ${currentChar.gold} gold in your wallet.`, 400);
        }
        if (capacity !== Infinity && currentChar && (currentChar.bankVaultBalance || 0) + amount > capacity) {
          const available = capacity - (currentChar.bankVaultBalance || 0);
          throw new AppError(
            `Vault capacity exceeded. Available space: ${available} gold.`,
            400
          );
        }
        throw new AppError('Deposit failed. Please try again.', 400);
      }

      // Record transaction
      await GoldTransaction.create([{
        characterId: result._id,
        amount: -amount,
        type: TransactionType.TRANSFERRED,
        source: TransactionSource.BANK_DEPOSIT,
        balanceBefore: walletBefore,
        balanceAfter: result.gold,
        metadata: {
          vaultBalanceBefore: vaultBefore,
          vaultBalanceAfter: result.bankVaultBalance,
          description: `Deposited ${amount} gold into ${tierConfig.name}`
        },
        timestamp: new Date()
      }], session ? { session } : {});

      if (session) {
        await session.commitTransaction();
      }

      logger.info(
        `Bank deposit: ${result.name} deposited ${amount} gold. ` +
        `Wallet: ${walletBefore} -> ${result.gold}, Vault: ${vaultBefore} -> ${result.bankVaultBalance}`
      );

      return {
        success: true,
        vaultBalance: result.bankVaultBalance || 0,
        walletBalance: result.gold
      };
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  /**
   * Withdraw gold from vault
   * Uses atomic $inc operations to prevent race conditions
   */
  static async withdraw(
    characterId: string,
    amount: number
  ): Promise<{ success: boolean; vaultBalance: number; walletBalance: number }> {
    if (amount <= 0) {
      throw new AppError('Withdrawal amount must be positive', 400);
    }

    if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
      throw new AppError('Withdrawal amount must be a valid integer', 400);
    }

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const session = disableTransactions ? null : await mongoose.startSession();

    try {
      if (session) {
        await session.startTransaction();
      }

      // First, get character info for validation (non-atomic checks)
      const characterQuery = Character.findById(characterId)
        .select('name gold bankVaultBalance bankVaultTier');
      const character = session ? await characterQuery.session(session) : await characterQuery;

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const tier = (character.bankVaultTier || 'none') as VaultTier;

      // Check if character has a vault
      if (tier === 'none') {
        throw new AppError('You don\'t have a vault account', 400);
      }

      const currentVaultBalance = character.bankVaultBalance || 0;

      // Store values before for transaction record
      const walletBefore = character.gold;
      const vaultBefore = currentVaultBalance;

      // ATOMIC OPERATION: Check vault balance and perform transfer in one operation
      // This prevents race conditions where two withdrawals could both pass the check
      const result = await Character.findOneAndUpdate(
        {
          _id: characterId,
          bankVaultBalance: { $gte: amount }  // Atomic check: must have enough in vault
        },
        {
          $inc: {
            gold: amount,
            bankVaultBalance: -amount
          }
        },
        {
          new: true,
          session: session || undefined
        }
      );

      if (!result) {
        // The atomic check failed - insufficient vault balance
        const currentChar = await Character.findById(characterId).select('bankVaultBalance');
        const currentBalance = currentChar?.bankVaultBalance || 0;
        throw new AppError(
          `Insufficient vault balance. You have ${currentBalance} gold in your vault.`,
          400
        );
      }

      // Record transaction
      await GoldTransaction.create([{
        characterId: result._id,
        amount: amount,
        type: TransactionType.TRANSFERRED,
        source: TransactionSource.BANK_WITHDRAWAL,
        balanceBefore: walletBefore,
        balanceAfter: result.gold,
        metadata: {
          vaultBalanceBefore: vaultBefore,
          vaultBalanceAfter: result.bankVaultBalance,
          description: `Withdrew ${amount} gold from vault`
        },
        timestamp: new Date()
      }], session ? { session } : {});

      if (session) {
        await session.commitTransaction();
      }

      logger.info(
        `Bank withdrawal: ${result.name} withdrew ${amount} gold. ` +
        `Wallet: ${walletBefore} -> ${result.gold}, Vault: ${vaultBefore} -> ${result.bankVaultBalance}`
      );

      return {
        success: true,
        vaultBalance: result.bankVaultBalance || 0,
        walletBalance: result.gold
      };
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  /**
   * Get total gold stored across all player vaults (for bank heist scaling)
   */
  static async getTotalVaultDeposits(): Promise<number> {
    const result = await Character.aggregate([
      {
        $match: {
          bankVaultBalance: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalDeposits: { $sum: '$bankVaultBalance' }
        }
      }
    ]);

    return result[0]?.totalDeposits || 0;
  }

  /**
   * Check if character's location is the Red Gulch Bank
   */
  static async isAtBank(characterId: string): Promise<boolean> {
    const character = await Character.findById(characterId).select('currentLocation');
    if (!character) {
      return false;
    }
    // Check if at Red Gulch Bank building
    return character.currentLocation === '6502b0000000000000000004' ||
           character.currentLocation.includes('red-gulch-bank');
  }
}
