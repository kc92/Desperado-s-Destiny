/**
 * Daily Contract Controller
 *
 * API endpoints for the daily contract system
 * Part of the Competitor Parity Plan - Phase B
 */

import { Request, Response, NextFunction } from 'express';
import { DailyContractService } from '../services/dailyContract.service';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Get today's contracts for the character
 * GET /api/contracts/daily
 */
export const getDailyContracts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const dailyContract = await DailyContractService.getContracts(characterId);
    const timeUntilReset = DailyContractService.getTimeUntilReset();

    res.status(200).json({
      success: true,
      data: {
        date: dailyContract.date,
        contracts: dailyContract.contracts,
        completedCount: dailyContract.completedCount,
        streak: dailyContract.streak,
        streakBonusClaimed: dailyContract.streakBonusClaimed,
        timeUntilReset
      }
    });
  }
);

/**
 * Accept a contract (start working on it)
 * POST /api/contracts/:contractId/accept
 */
export const acceptContract = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { contractId } = req.params;

    const contract = await DailyContractService.acceptContract(characterId, contractId);

    res.status(200).json({
      success: true,
      data: {
        message: `Contract accepted: ${contract.title}`,
        contract
      }
    });
  }
);

/**
 * Update contract progress
 * POST /api/contracts/:contractId/progress
 */
export const updateProgress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { contractId } = req.params;
    const { amount = 1 } = req.body;

    const contract = await DailyContractService.updateProgress(
      characterId,
      contractId,
      amount
    );

    const isComplete = contract.progress >= contract.progressMax;

    res.status(200).json({
      success: true,
      data: {
        message: isComplete
          ? 'Contract ready for completion!'
          : `Progress updated: ${contract.progress}/${contract.progressMax}`,
        contract,
        isComplete
      }
    });
  }
);

/**
 * Complete a contract and claim rewards
 * POST /api/contracts/:contractId/complete
 */
export const completeContract = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { contractId } = req.params;

    const result = await DailyContractService.completeContract(characterId, contractId);

    res.status(200).json({
      success: true,
      data: {
        message: `Contract completed: ${result.contract.title}`,
        contract: result.contract,
        rewards: result.rewards,
        streakUpdate: result.streakUpdate
      }
    });
  }
);

/**
 * Get streak information
 * GET /api/contracts/streak
 */
export const getStreak = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const streakInfo = await DailyContractService.getStreak(characterId);

    res.status(200).json({
      success: true,
      data: streakInfo
    });
  }
);

/**
 * Claim streak bonus
 * POST /api/contracts/streak/claim
 */
export const claimStreakBonus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const result = await DailyContractService.claimStreakBonus(characterId);

    res.status(200).json({
      success: true,
      data: {
        message: 'Streak bonus claimed!',
        rewards: result.rewards
      }
    });
  }
);

/**
 * Get streak leaderboard
 * GET /api/contracts/leaderboard
 */
export const getStreakLeaderboard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const leaderboard = await DailyContractService.getStreakLeaderboard(limit);

    res.status(200).json({
      success: true,
      data: {
        leaderboard
      }
    });
  }
);

/**
 * Get time until daily reset
 * GET /api/contracts/reset-timer
 */
export const getResetTimer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const timeUntilReset = DailyContractService.getTimeUntilReset();

    res.status(200).json({
      success: true,
      data: {
        timeUntilReset,
        resetAtUTC: '00:00:00'
      }
    });
  }
);

/**
 * Trigger contract progress from other game actions
 * This is called internally by other services, not directly via API
 * POST /api/contracts/trigger (Internal use)
 */
export const triggerContractProgress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { actionType, actionDetails } = req.body;

    if (!actionType) {
      return res.status(400).json({
        success: false,
        error: 'actionType is required'
      });
    }

    const updatedContracts = await DailyContractService.triggerProgress(
      characterId,
      actionType,
      actionDetails || {}
    );

    res.status(200).json({
      success: true,
      data: {
        message: updatedContracts.length > 0
          ? `Updated ${updatedContracts.length} contract(s)`
          : 'No contracts updated',
        updatedContracts
      }
    });
  }
);

// ============ Premium Contract Endpoints (Sprint 7) ============

/**
 * Get premium contracts for the character
 * GET /api/contracts/premium
 */
export const getPremiumContracts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const result = await DailyContractService.getPremiumContracts(characterId);

    res.status(200).json({
      success: true,
      data: {
        available: result.available,
        active: result.active,
        cooldowns: result.cooldowns,
        hasAccess: result.available.length > 0 || result.active.length > 0
      }
    });
  }
);

/**
 * Accept a premium contract
 * POST /api/contracts/premium/:templateId/accept
 */
export const acceptPremiumContract = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { templateId } = req.params;

    const result = await DailyContractService.acceptPremiumContract(characterId, templateId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: `Premium contract accepted: ${result.contract!.title}`,
        contract: result.contract
      }
    });
  }
);

/**
 * Progress a multi-phase premium contract
 * POST /api/contracts/premium/:contractId/progress
 */
export const progressPremiumContract = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { contractId } = req.params;

    const result = await DailyContractService.progressPremiumContract(characterId, contractId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    const isComplete = result.contract!.progress >= result.contract!.progressMax;

    res.status(200).json({
      success: true,
      data: {
        message: isComplete
          ? 'Contract ready for completion!'
          : `Phase ${result.phaseCompleted} of ${result.contract!.progressMax} complete`,
        contract: result.contract,
        phaseCompleted: result.phaseCompleted,
        isComplete
      }
    });
  }
);

/**
 * Complete a premium contract and claim rewards
 * POST /api/contracts/premium/:contractId/complete
 */
export const completePremiumContract = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { contractId } = req.params;

    const result = await DailyContractService.completePremiumContract(characterId, contractId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: `Premium contract completed: ${result.contract!.title}`,
        contract: result.contract,
        rewards: result.rewards,
        factionChanges: result.factionChanges
      }
    });
  }
);

/**
 * Abandon a premium contract
 * POST /api/contracts/premium/:contractId/abandon
 */
export const abandonPremiumContract = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { contractId } = req.params;

    const result = await DailyContractService.abandonPremiumContract(characterId, contractId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Premium contract abandoned. Partial cooldown applied.'
      }
    });
  }
);
