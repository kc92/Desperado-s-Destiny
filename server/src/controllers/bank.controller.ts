/**
 * Bank Controller
 * Handles bank vault API endpoints for the Red Gulch Bank
 */

import { Request, Response, NextFunction } from 'express';
import { BankService, VAULT_TIERS, VaultTier } from '../services/bank.service';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Get vault information
 * GET /api/bank/vault
 */
export const getVaultInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const vaultInfo = await BankService.getVaultInfo(characterId);

    res.status(200).json({
      success: true,
      data: { vault: vaultInfo }
    });
  }
);

/**
 * Get vault tier options
 * GET /api/bank/tiers
 */
export const getVaultTiers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tiers = Object.entries(VAULT_TIERS).map(([key, value]) => ({
      tier: key,
      ...value,
      capacity: value.capacity === Infinity ? 'Unlimited' : value.capacity
    }));

    res.status(200).json({
      success: true,
      data: { tiers }
    });
  }
);

/**
 * Upgrade vault
 * POST /api/bank/upgrade
 */
export const upgradeVault = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { targetTier } = req.body;

    if (!targetTier) {
      return res.status(400).json({
        success: false,
        error: 'targetTier is required'
      });
    }

    // Validate tier
    if (!['bronze', 'silver', 'gold'].includes(targetTier)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vault tier. Must be bronze, silver, or gold.'
      });
    }

    const result = await BankService.upgradeVault(characterId, targetTier as VaultTier);
    const vaultInfo = await BankService.getVaultInfo(characterId);

    res.status(200).json({
      success: true,
      data: {
        message: result.message,
        vault: vaultInfo
      }
    });
  }
);

/**
 * Deposit gold into vault
 * POST /api/bank/deposit
 */
export const deposit = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'amount is required and must be a number'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'amount must be positive'
      });
    }

    if (!Number.isInteger(amount)) {
      return res.status(400).json({
        success: false,
        error: 'amount must be a whole number'
      });
    }

    const result = await BankService.deposit(characterId, amount);

    res.status(200).json({
      success: true,
      data: {
        message: `Deposited $${amount} into your vault`,
        vaultBalance: result.vaultBalance,
        walletBalance: result.walletBalance
      }
    });
  }
);

/**
 * Withdraw gold from vault
 * POST /api/bank/withdraw
 */
export const withdraw = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'amount is required and must be a number'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'amount must be positive'
      });
    }

    if (!Number.isInteger(amount)) {
      return res.status(400).json({
        success: false,
        error: 'amount must be a whole number'
      });
    }

    const result = await BankService.withdraw(characterId, amount);

    res.status(200).json({
      success: true,
      data: {
        message: `Withdrew $${amount} from your vault`,
        vaultBalance: result.vaultBalance,
        walletBalance: result.walletBalance
      }
    });
  }
);

/**
 * Get total vault deposits (admin/analytics)
 * GET /api/bank/stats/total
 */
export const getTotalDeposits = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const total = await BankService.getTotalVaultDeposits();

    res.status(200).json({
      success: true,
      data: { totalVaultDeposits: total }
    });
  }
);
