/**
 * Gang Economy Controller
 *
 * Handles HTTP requests for gang economy operations
 */

import { Request, Response } from 'express';
import { GangEconomyService } from '../services/gangEconomy.service';
import { HeistService } from '../services/heist.service';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  AccountTransferRequest,
  BusinessPurchaseRequest,
  HeistPlanningRequest,
  PayrollSettingsRequest,
  GangBankAccountType,
} from '@desperados/shared';

export class GangEconomyController {
  /**
   * GET /api/gangs/:gangId/economy
   * Get gang economy overview
   */
  static getEconomy = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;

    const economy = await GangEconomyService.getEconomy(gangId);

    res.status(200).json({
      success: true,
      data: economy,
    });
  });

  /**
   * GET /api/gangs/:gangId/bank
   * Get bank accounts
   */
  static getBank = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;

    const economy = await GangEconomyService.getEconomy(gangId);

    res.status(200).json({
      success: true,
      data: {
        accounts: economy.bank,
        totalBalance: economy.bank.totalBalance,
        liquidAssets: economy.liquidAssets,
      },
    });
  });

  /**
   * POST /api/gangs/:gangId/bank/deposit
   * Deposit to gang bank account
   */
  static deposit = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;
    const { accountType, amount } = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!accountType || !amount) {
      res.status(400).json({ success: false, error: 'Account type and amount are required' });
      return;
    }

    if (!Object.values(GangBankAccountType).includes(accountType)) {
      res.status(400).json({ success: false, error: 'Invalid account type' });
      return;
    }

    const economy = await GangEconomyService.depositToAccount(gangId, characterId, accountType, amount);

    res.status(200).json({
      success: true,
      message: `Deposited ${amount} gold to ${accountType}`,
      data: economy,
    });
  });

  /**
   * POST /api/gangs/:gangId/bank/withdraw
   * Withdraw from gang bank account
   */
  static withdraw = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;
    const { accountType, amount } = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!accountType || !amount) {
      res.status(400).json({ success: false, error: 'Account type and amount are required' });
      return;
    }

    if (!Object.values(GangBankAccountType).includes(accountType)) {
      res.status(400).json({ success: false, error: 'Invalid account type' });
      return;
    }

    const economy = await GangEconomyService.withdrawFromAccount(gangId, characterId, accountType, amount);

    res.status(200).json({
      success: true,
      message: `Withdrew ${amount} gold from ${accountType}`,
      data: economy,
    });
  });

  /**
   * POST /api/gangs/:gangId/bank/transfer
   * Transfer between gang bank accounts
   */
  static transfer = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;
    const request: AccountTransferRequest = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!request.fromAccount || !request.toAccount || !request.amount) {
      res.status(400).json({ success: false, error: 'From account, to account, and amount are required' });
      return;
    }

    const economy = await GangEconomyService.transferBetweenAccounts(gangId, characterId, request);

    res.status(200).json({
      success: true,
      message: `Transferred ${request.amount} gold from ${request.fromAccount} to ${request.toAccount}`,
      data: economy,
    });
  });

  /**
   * GET /api/gangs/:gangId/businesses
   * Get gang businesses
   */
  static getBusinesses = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;

    const businesses = await GangEconomyService.getBusinesses(gangId);

    res.status(200).json({
      success: true,
      data: businesses,
    });
  });

  /**
   * POST /api/gangs/:gangId/businesses/buy
   * Purchase a business
   */
  static buyBusiness = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;
    const request: BusinessPurchaseRequest = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!request.businessType || !request.location) {
      res.status(400).json({ success: false, error: 'Business type and location are required' });
      return;
    }

    const business = await GangEconomyService.purchaseBusiness(gangId, characterId, request);

    res.status(201).json({
      success: true,
      message: `Purchased ${business.name} for ${business.startupCost} gold`,
      data: business,
    });
  });

  /**
   * POST /api/gangs/:gangId/businesses/:businessId/sell
   * Sell a business
   */
  static sellBusiness = asyncHandler(async (req: Request, res: Response) => {
    const { gangId, businessId } = req.params;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const salePrice = await GangEconomyService.sellBusiness(gangId, characterId, businessId);

    res.status(200).json({
      success: true,
      message: `Sold business for ${salePrice} gold`,
      data: { salePrice },
    });
  });

  /**
   * GET /api/gangs/:gangId/heists/available
   * Get available heist targets
   */
  static getAvailableHeists = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;

    const heists = await HeistService.getAvailableHeists(gangId);

    res.status(200).json({
      success: true,
      data: heists,
    });
  });

  /**
   * GET /api/gangs/:gangId/heists
   * Get gang heists
   */
  static getHeists = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;
    const includeCompleted = req.query.includeCompleted === 'true';

    const heists = await HeistService.getGangHeists(gangId, includeCompleted);

    res.status(200).json({
      success: true,
      data: heists,
    });
  });

  /**
   * POST /api/gangs/:gangId/heists/plan
   * Start planning a heist
   */
  static planHeist = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;
    const request: HeistPlanningRequest = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!request.target || !request.roleAssignments) {
      res.status(400).json({ success: false, error: 'Target and role assignments are required' });
      return;
    }

    const heist = await HeistService.planHeist(gangId, characterId, request);

    res.status(201).json({
      success: true,
      message: `Started planning heist: ${heist.targetName}`,
      data: heist,
    });
  });

  /**
   * POST /api/gangs/:gangId/heists/:heistId/plan
   * Increase planning progress
   */
  static increasePlanning = asyncHandler(async (req: Request, res: Response) => {
    const { gangId, heistId } = req.params;
    const { amount } = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const heist = await HeistService.increasePlanning(gangId, heistId, characterId, amount || 10);

    res.status(200).json({
      success: true,
      message: `Planning progress: ${heist.planningProgress}%`,
      data: heist,
    });
  });

  /**
   * POST /api/gangs/:gangId/heists/:heistId/execute
   * Execute a heist
   */
  static executeHeist = asyncHandler(async (req: Request, res: Response) => {
    const { gangId, heistId } = req.params;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const heist = await HeistService.executeHeist(gangId, heistId, characterId);

    res.status(200).json({
      success: true,
      message: `Heist executed: ${heist.outcome}`,
      data: {
        heist,
        outcome: heist.outcome,
        payout: heist.actualPayout,
        arrested: heist.arrested,
        casualties: heist.casualties,
      },
    });
  });

  /**
   * POST /api/gangs/:gangId/heists/:heistId/cancel
   * Cancel a heist
   */
  static cancelHeist = asyncHandler(async (req: Request, res: Response) => {
    const { gangId, heistId } = req.params;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    await HeistService.cancelHeist(gangId, heistId, characterId);

    res.status(200).json({
      success: true,
      message: 'Heist cancelled',
    });
  });

  /**
   * GET /api/gangs/:gangId/payroll
   * Get payroll settings
   */
  static getPayroll = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;

    const economy = await GangEconomyService.getEconomy(gangId);

    res.status(200).json({
      success: true,
      data: economy.payroll,
    });
  });

  /**
   * POST /api/gangs/:gangId/payroll
   * Set payroll settings
   */
  static setPayroll = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;
    const request: PayrollSettingsRequest = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!request.wages) {
      res.status(400).json({ success: false, error: 'Wages are required' });
      return;
    }

    const economy = await GangEconomyService.setPayroll(gangId, characterId, request);

    res.status(200).json({
      success: true,
      message: `Payroll updated. Total weekly: ${economy.payroll.totalWeekly} gold`,
      data: economy.payroll,
    });
  });
}
