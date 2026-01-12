/**
 * Gang Economy Controller
 *
 * Handles HTTP requests for gang economy operations
 */

import { Request, Response } from 'express';
import { GangEconomyService } from '../services/gangEconomy.service';
import { HeistService } from '../services/heist.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateCurrencyAmount, validateEnum } from '../utils/validation';
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

    // Validate account type
    const accountTypeResult = validateEnum(
      accountType,
      Object.values(GangBankAccountType) as GangBankAccountType[],
      'accountType'
    );
    if (!accountTypeResult.success) {
      res.status(400).json({ success: false, errors: accountTypeResult.errors });
      return;
    }

    // Validate amount (positive integer, within bounds)
    const amountResult = validateCurrencyAmount(amount, 'amount');
    if (!amountResult.success) {
      res.status(400).json({ success: false, errors: amountResult.errors });
      return;
    }

    const economy = await GangEconomyService.depositToAccount(
      gangId,
      characterId,
      accountTypeResult.data,
      amountResult.data
    );

    res.status(200).json({
      success: true,
      message: `Deposited $${amountResult.data.toLocaleString()} to ${accountTypeResult.data}`,
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

    // Validate account type
    const accountTypeResult = validateEnum(
      accountType,
      Object.values(GangBankAccountType) as GangBankAccountType[],
      'accountType'
    );
    if (!accountTypeResult.success) {
      res.status(400).json({ success: false, errors: accountTypeResult.errors });
      return;
    }

    // Validate amount (positive integer, within bounds)
    const amountResult = validateCurrencyAmount(amount, 'amount');
    if (!amountResult.success) {
      res.status(400).json({ success: false, errors: amountResult.errors });
      return;
    }

    const economy = await GangEconomyService.withdrawFromAccount(
      gangId,
      characterId,
      accountTypeResult.data,
      amountResult.data
    );

    res.status(200).json({
      success: true,
      message: `Withdrew $${amountResult.data.toLocaleString()} from ${accountTypeResult.data}`,
      data: economy,
    });
  });

  /**
   * POST /api/gangs/:gangId/bank/transfer
   * Transfer between gang bank accounts
   */
  static transfer = asyncHandler(async (req: Request, res: Response) => {
    const { gangId } = req.params;
    const { fromAccount, toAccount, amount } = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    // Validate fromAccount
    const fromAccountResult = validateEnum(
      fromAccount,
      Object.values(GangBankAccountType) as GangBankAccountType[],
      'fromAccount'
    );
    if (!fromAccountResult.success) {
      res.status(400).json({ success: false, errors: fromAccountResult.errors });
      return;
    }

    // Validate toAccount
    const toAccountResult = validateEnum(
      toAccount,
      Object.values(GangBankAccountType) as GangBankAccountType[],
      'toAccount'
    );
    if (!toAccountResult.success) {
      res.status(400).json({ success: false, errors: toAccountResult.errors });
      return;
    }

    // Validate amount (positive integer, within bounds)
    const amountResult = validateCurrencyAmount(amount, 'amount');
    if (!amountResult.success) {
      res.status(400).json({ success: false, errors: amountResult.errors });
      return;
    }

    const request: AccountTransferRequest = {
      fromAccount: fromAccountResult.data,
      toAccount: toAccountResult.data,
      amount: amountResult.data,
    };

    const economy = await GangEconomyService.transferBetweenAccounts(gangId, characterId, request);

    res.status(200).json({
      success: true,
      message: `Transferred $${amountResult.data.toLocaleString()} from ${fromAccountResult.data} to ${toAccountResult.data}`,
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
      message: `Purchased ${business.name} for $${business.startupCost}`,
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
      message: `Sold business for $${salePrice}`,
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
      message: `Payroll updated. Total weekly: $${economy.payroll.totalWeekly}`,
      data: economy.payroll,
    });
  });
}
