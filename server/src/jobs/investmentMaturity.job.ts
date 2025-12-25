/**
 * Investment Maturity Job
 *
 * Phase 10 - Banking System Investment Products
 *
 * This job runs daily and:
 * 1. Finds all investments that have reached maturity
 * 2. Marks them as MATURED (players must manually cash out)
 * 3. Logs statistics for economy monitoring
 */

import { InvestmentService } from '../services/investment.service';
import logger from '../utils/logger';

/**
 * Process matured investments
 * Runs daily to mark investments that have reached maturity
 */
export async function processMaturedInvestments(): Promise<{
  processed: number;
}> {
  logger.info('[InvestmentMaturity] ========== Starting Investment Maturity Processing ==========');

  const processed = await InvestmentService.processMaturedInvestments();

  logger.info('[InvestmentMaturity] ========== Investment Maturity Processing Complete ==========');
  logger.info(`[InvestmentMaturity] Summary: ${processed} investments marked as matured`);

  return { processed };
}

export default {
  processMaturedInvestments
};
