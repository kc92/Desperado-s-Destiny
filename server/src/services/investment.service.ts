import mongoose from 'mongoose';
import { Investment, IInvestment, InvestmentType, InvestmentStatus } from '../models/Investment.model';
import { DollarService } from './dollar.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';

const INVESTMENT_CONFIG = {
  [InvestmentType.TREASURY_BOND]: {
    minReturn: 0.02,
    maxReturn: 0.04,
    maturityDays: 7,
    minInvestment: 100,
    maxInvestment: 10000,
    earlyPenalty: 0.05, // 5% penalty
    riskLevel: 'low' as const,
  },
  [InvestmentType.RAILROAD_SHARE]: {
    minReturn: 0.05,
    maxReturn: 0.10,
    maturityDays: 14,
    minInvestment: 500,
    maxInvestment: 50000,
    earlyPenalty: 0.15, // 15% penalty
    riskLevel: 'medium' as const,
  },
  [InvestmentType.MINING_SHARE]: {
    minReturn: 0.00,
    maxReturn: 0.20,
    maturityDays: 21,
    minInvestment: 1000,
    maxInvestment: 100000,
    earlyPenalty: 0.25, // 25% penalty
    defaultChance: 0.10, // 10% chance to lose investment
    riskLevel: 'high' as const,
  },
};

export class InvestmentService {
  /**
   * Purchase an investment
   */
  static async invest(
    characterId: mongoose.Types.ObjectId,
    type: InvestmentType,
    amount: number,
    linkedEntityId?: string
  ): Promise<IInvestment> {
    const config = INVESTMENT_CONFIG[type];

    // Validate amount
    if (amount < config.minInvestment || amount > config.maxInvestment) {
      throw new Error(`Investment must be between $${config.minInvestment} and $${config.maxInvestment}`);
    }

    // Deduct funds
    await DollarService.deductDollars(
      characterId,
      amount,
      TransactionSource.INVESTMENT,
      `Invested in ${type}`
    );

    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + config.maturityDays);

    // Create investment
    const investment = new Investment({
      characterId,
      type,
      principalAmount: amount,
      currentValue: amount,
      maturityDate,
      riskLevel: config.riskLevel,
      earlyWithdrawalPenalty: config.earlyPenalty,
      linkedEntityId,
    });

    await investment.save();
    logger.info(`Character ${characterId} invested $${amount} in ${type}`);

    return investment;
  }

  /**
   * Cash out an investment (early or at maturity)
   */
  static async cashOut(
    characterId: mongoose.Types.ObjectId,
    investmentId: string
  ): Promise<{ payout: number; returnRate: number; penalty: number }> {
    const investment = await Investment.findOne({
      _id: investmentId,
      characterId,
      status: InvestmentStatus.ACTIVE,
    });

    if (!investment) {
      throw new Error('Investment not found or already cashed out');
    }

    const now = new Date();
    const isEarly = now < investment.maturityDate;
    const config = INVESTMENT_CONFIG[investment.type];

    // Calculate return
    let returnRate: number;
    let payout: number;
    let penalty = 0;

    if (investment.type === InvestmentType.MINING_SHARE) {
      // Check for default (only at maturity)
      const miningConfig = INVESTMENT_CONFIG[InvestmentType.MINING_SHARE];
      if (!isEarly && SecureRNG.chance(miningConfig.defaultChance || 0)) {
        investment.status = InvestmentStatus.DEFAULTED;
        await investment.save();
        logger.info(`Mining investment ${investmentId} defaulted for character ${characterId}`);
        return { payout: 0, returnRate: -1, penalty: investment.principalAmount };
      }
    }

    // Calculate return rate
    if (isEarly) {
      // Partial return based on time elapsed
      const totalDays = config.maturityDays;
      const daysElapsed = (now.getTime() - investment.investedAt.getTime()) / (1000 * 60 * 60 * 24);
      const progressRatio = daysElapsed / totalDays;

      // Generate random return between min and max, scaled by progress
      returnRate = config.minReturn + (config.maxReturn - config.minReturn) * SecureRNG.float(0, 1, 4) * progressRatio;
      penalty = investment.principalAmount * investment.earlyWithdrawalPenalty;
    } else {
      // Full return at maturity
      returnRate = config.minReturn + (config.maxReturn - config.minReturn) * SecureRNG.float(0, 1, 4);
    }

    payout = Math.floor(investment.principalAmount * (1 + returnRate) - penalty);

    // Update investment
    investment.status = InvestmentStatus.CASHED_OUT;
    investment.returnRate = returnRate;
    investment.currentValue = payout;
    investment.cashedOutAt = now;
    await investment.save();

    // Pay out
    await DollarService.addDollars(
      characterId,
      payout,
      TransactionSource.INVESTMENT_RETURN,
      `${investment.type} payout`
    );

    logger.info(
      `Character ${characterId} cashed out investment ${investmentId}. ` +
      `Principal: $${investment.principalAmount}, Payout: $${payout}, Return: ${(returnRate * 100).toFixed(2)}%`
    );

    return { payout, returnRate, penalty };
  }

  /**
   * Get all active investments for a character
   */
  static async getActiveInvestments(
    characterId: mongoose.Types.ObjectId
  ): Promise<IInvestment[]> {
    return Investment.find({
      characterId,
      status: InvestmentStatus.ACTIVE,
    }).sort({ maturityDate: 1 });
  }

  /**
   * Get investment portfolio summary
   */
  static async getPortfolioSummary(
    characterId: mongoose.Types.ObjectId
  ): Promise<{
    totalInvested: number;
    expectedReturns: { min: number; max: number };
    investments: { type: InvestmentType; count: number; value: number }[];
  }> {
    const activeInvestments = await this.getActiveInvestments(characterId);

    let totalInvested = 0;
    let minExpectedReturn = 0;
    let maxExpectedReturn = 0;

    const investmentsByType = new Map<InvestmentType, { count: number; value: number }>();

    for (const investment of activeInvestments) {
      totalInvested += investment.principalAmount;

      const config = INVESTMENT_CONFIG[investment.type];
      minExpectedReturn += investment.principalAmount * config.minReturn;
      maxExpectedReturn += investment.principalAmount * config.maxReturn;

      const existing = investmentsByType.get(investment.type) || { count: 0, value: 0 };
      existing.count++;
      existing.value += investment.principalAmount;
      investmentsByType.set(investment.type, existing);
    }

    const investments = Array.from(investmentsByType.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      value: data.value,
    }));

    return {
      totalInvested,
      expectedReturns: {
        min: Math.floor(minExpectedReturn),
        max: Math.floor(maxExpectedReturn),
      },
      investments,
    };
  }

  /**
   * Get investment history for a character
   */
  static async getInvestmentHistory(
    characterId: mongoose.Types.ObjectId,
    limit: number = 50,
    offset: number = 0
  ): Promise<IInvestment[]> {
    return Investment.find({ characterId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
  }

  /**
   * Process matured investments (called by job)
   * Automatically cashes out matured investments
   */
  static async processMaturedInvestments(): Promise<number> {
    const now = new Date();

    // Find all investments that have matured but not yet cashed out
    const maturedInvestments = await Investment.find({
      status: InvestmentStatus.ACTIVE,
      maturityDate: { $lte: now },
    });

    logger.info(`[InvestmentMaturity] Found ${maturedInvestments.length} matured investments to process`);

    let processed = 0;
    let errors = 0;

    for (const investment of maturedInvestments) {
      try {
        // Mark as matured (but not cashed out)
        // Players must manually cash out to receive their funds
        investment.status = InvestmentStatus.MATURED;
        await investment.save();
        processed++;

        logger.debug(
          `Investment ${investment._id} for character ${investment.characterId} has matured. ` +
          `Type: ${investment.type}, Principal: $${investment.principalAmount}`
        );
      } catch (error) {
        errors++;
        logger.error(`Error processing matured investment ${investment._id}:`, error);
      }
    }

    logger.info(
      `[InvestmentMaturity] Processed ${processed} investments, ${errors} errors`
    );

    return processed;
  }

  /**
   * Get available investment products with their configurations
   */
  static getInvestmentProducts(): Array<{
    type: InvestmentType;
    name: string;
    description: string;
    minReturn: number;
    maxReturn: number;
    maturityDays: number;
    minInvestment: number;
    maxInvestment: number;
    earlyPenalty: number;
    riskLevel: string;
    defaultChance?: number;
  }> {
    return [
      {
        type: InvestmentType.TREASURY_BOND,
        name: 'Treasury Bond',
        description: 'Safe government-backed bonds with guaranteed low returns. Ideal for risk-averse investors.',
        ...INVESTMENT_CONFIG[InvestmentType.TREASURY_BOND],
      },
      {
        type: InvestmentType.RAILROAD_SHARE,
        name: 'Railroad Shares',
        description: 'Invest in expanding railroad companies. Moderate risk with decent returns.',
        ...INVESTMENT_CONFIG[InvestmentType.RAILROAD_SHARE],
      },
      {
        type: InvestmentType.MINING_SHARE,
        name: 'Mining Shares',
        description: 'High-risk mining ventures with potential for big payouts. 10% chance of total loss.',
        ...INVESTMENT_CONFIG[InvestmentType.MINING_SHARE],
      },
    ];
  }

  /**
   * Calculate current estimated value of an investment
   */
  static estimateCurrentValue(investment: IInvestment): number {
    const config = INVESTMENT_CONFIG[investment.type];
    const now = new Date();

    if (investment.status !== InvestmentStatus.ACTIVE) {
      return investment.currentValue;
    }

    const isMatured = now >= investment.maturityDate;

    if (isMatured) {
      // Use average return rate at maturity
      const avgReturn = (config.minReturn + config.maxReturn) / 2;
      return Math.floor(investment.principalAmount * (1 + avgReturn));
    }

    // For active investments, estimate based on time elapsed
    const totalDays = config.maturityDays;
    const daysElapsed = (now.getTime() - investment.investedAt.getTime()) / (1000 * 60 * 60 * 24);
    const progressRatio = Math.min(daysElapsed / totalDays, 1);

    const avgReturn = (config.minReturn + config.maxReturn) / 2;
    const estimatedReturn = avgReturn * progressRatio;

    return Math.floor(investment.principalAmount * (1 + estimatedReturn));
  }
}
