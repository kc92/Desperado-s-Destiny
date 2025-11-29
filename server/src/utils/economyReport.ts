/**
 * Economy Report Generator
 *
 * Generates comprehensive reports on economic activity.
 * Used for monitoring, analytics, and balance adjustments.
 */

import { Character } from '../models/Character.model';
import { GoldTransaction, TransactionSource, TransactionType } from '../models/GoldTransaction.model';
import { getLevelTier, LevelTier, BALANCE_TARGETS } from '../config/economy.config';
import { BalanceValidationService } from '../services/balanceValidation.service';

/**
 * Gold source breakdown
 */
export interface GoldSourceBreakdown {
  source: TransactionSource;
  totalGold: number;
  transactionCount: number;
  averagePerTransaction: number;
  percentOfTotal: number;
}

/**
 * Gold sink breakdown
 */
export interface GoldSinkBreakdown {
  source: TransactionSource;
  totalGold: number;
  transactionCount: number;
  averagePerTransaction: number;
  percentOfTotal: number;
}

/**
 * Player wealth distribution
 */
export interface WealthDistribution {
  tier: LevelTier;
  playerCount: number;
  averageGold: number;
  medianGold: number;
  totalGold: number;
  percentOfTotalWealth: number;
}

/**
 * Daily economic activity report
 */
export interface DailyEconomyReport {
  date: Date;

  // Overall metrics
  totalGoldEarned: number;
  totalGoldSpent: number;
  netGoldChange: number;
  goldFlowRatio: number;

  // Player activity
  activePlayers: number;
  newCharacters: number;

  // Top sources and sinks
  topGoldSources: GoldSourceBreakdown[];
  topGoldSinks: GoldSinkBreakdown[];

  // Wealth distribution
  wealthDistribution: WealthDistribution[];

  // Economic health
  giniCoefficient: number;
  goldVelocity: number;
  inflationRate: number;
}

/**
 * Weekly economic summary
 */
export interface WeeklyEconomyReport {
  weekStartDate: Date;
  weekEndDate: Date;

  dailyReports: DailyEconomyReport[];

  // Weekly aggregates
  weeklyGoldEarned: number;
  weeklyGoldSpent: number;
  averageDailyPlayers: number;

  // Trends
  goldEarningTrend: 'increasing' | 'stable' | 'decreasing';
  playerActivityTrend: 'increasing' | 'stable' | 'decreasing';

  // Balance assessment
  balanceIssuesDetected: number;
  recommendedActions: string[];
}

export class EconomyReportGenerator {
  /**
   * Generate daily economy report
   */
  static async generateDailyReport(date: Date = new Date()): Promise<DailyEconomyReport> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all transactions for the day
    const transactions = await GoldTransaction.find({
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    });

    // Calculate total earned and spent
    const earnedTransactions = transactions.filter(t => t.type === TransactionType.EARNED);
    const spentTransactions = transactions.filter(t => t.type === TransactionType.SPENT);

    const totalGoldEarned = earnedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalGoldSpent = Math.abs(spentTransactions.reduce((sum, t) => sum + t.amount, 0));
    const netGoldChange = totalGoldEarned - totalGoldSpent;
    const goldFlowRatio = totalGoldSpent > 0 ? totalGoldEarned / totalGoldSpent : 1.0;

    // Get active players
    const activePlayers = await Character.countDocuments({
      isActive: true,
      lastActive: { $gte: startOfDay, $lte: endOfDay }
    });

    // Get new characters
    const newCharacters = await Character.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Calculate top gold sources
    const topGoldSources = await this.calculateTopGoldSources(earnedTransactions, totalGoldEarned);

    // Calculate top gold sinks
    const topGoldSinks = await this.calculateTopGoldSinks(spentTransactions, totalGoldSpent);

    // Calculate wealth distribution
    const wealthDistribution = await this.calculateWealthDistribution();

    // Get economic health metrics
    const health = await BalanceValidationService.validateEconomicHealth();

    return {
      date,
      totalGoldEarned,
      totalGoldSpent,
      netGoldChange,
      goldFlowRatio,
      activePlayers,
      newCharacters,
      topGoldSources,
      topGoldSinks,
      wealthDistribution,
      giniCoefficient: health.giniCoefficient,
      goldVelocity: health.goldVelocity,
      inflationRate: health.inflationRate
    };
  }

  /**
   * Generate weekly economy report
   */
  static async generateWeeklyReport(weekStartDate: Date): Promise<WeeklyEconomyReport> {
    const dailyReports: DailyEconomyReport[] = [];

    // Generate reports for each day of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);

      const dailyReport = await this.generateDailyReport(date);
      dailyReports.push(dailyReport);
    }

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Calculate weekly aggregates
    const weeklyGoldEarned = dailyReports.reduce((sum, r) => sum + r.totalGoldEarned, 0);
    const weeklyGoldSpent = dailyReports.reduce((sum, r) => sum + r.totalGoldSpent, 0);
    const averageDailyPlayers = dailyReports.reduce((sum, r) => sum + r.activePlayers, 0) / 7;

    // Determine trends
    const goldEarningTrend = this.determineTrend(dailyReports.map(r => r.totalGoldEarned));
    const playerActivityTrend = this.determineTrend(dailyReports.map(r => r.activePlayers));

    // Assess balance issues
    const health = await BalanceValidationService.validateEconomicHealth();
    const balanceIssuesDetected = health.issues.length;

    // Generate recommendations
    const recommendedActions = this.generateRecommendations(dailyReports, health);

    return {
      weekStartDate,
      weekEndDate,
      dailyReports,
      weeklyGoldEarned,
      weeklyGoldSpent,
      averageDailyPlayers,
      goldEarningTrend,
      playerActivityTrend,
      balanceIssuesDetected,
      recommendedActions
    };
  }

  /**
   * Calculate top gold sources
   */
  private static calculateTopGoldSources(
    transactions: any[],
    totalGold: number
  ): GoldSourceBreakdown[] {
    const sourceMap = new Map<TransactionSource, { total: number; count: number }>();

    for (const tx of transactions) {
      const existing = sourceMap.get(tx.source) || { total: 0, count: 0 };
      existing.total += tx.amount;
      existing.count += 1;
      sourceMap.set(tx.source, existing);
    }

    const breakdown: GoldSourceBreakdown[] = [];
    for (const [source, data] of sourceMap.entries()) {
      breakdown.push({
        source,
        totalGold: data.total,
        transactionCount: data.count,
        averagePerTransaction: data.count > 0 ? data.total / data.count : 0,
        percentOfTotal: totalGold > 0 ? (data.total / totalGold) * 100 : 0
      });
    }

    return breakdown.sort((a, b) => b.totalGold - a.totalGold).slice(0, 10);
  }

  /**
   * Calculate top gold sinks
   */
  private static calculateTopGoldSinks(
    transactions: any[],
    totalGold: number
  ): GoldSinkBreakdown[] {
    const sinkMap = new Map<TransactionSource, { total: number; count: number }>();

    for (const tx of transactions) {
      const existing = sinkMap.get(tx.source) || { total: 0, count: 0 };
      existing.total += Math.abs(tx.amount);
      existing.count += 1;
      sinkMap.set(tx.source, existing);
    }

    const breakdown: GoldSinkBreakdown[] = [];
    for (const [source, data] of sinkMap.entries()) {
      breakdown.push({
        source,
        totalGold: data.total,
        transactionCount: data.count,
        averagePerTransaction: data.count > 0 ? data.total / data.count : 0,
        percentOfTotal: totalGold > 0 ? (data.total / totalGold) * 100 : 0
      });
    }

    return breakdown.sort((a, b) => b.totalGold - a.totalGold).slice(0, 10);
  }

  /**
   * Calculate wealth distribution by tier
   */
  private static async calculateWealthDistribution(): Promise<WealthDistribution[]> {
    const characters = await Character.find({ isActive: true }).select('level gold').lean();

    const tierData = new Map<LevelTier, number[]>();

    for (const char of characters) {
      const tier = getLevelTier(char.level);
      if (!tierData.has(tier)) {
        tierData.set(tier, []);
      }
      tierData.get(tier)!.push(char.gold);
    }

    const totalWealth = characters.reduce((sum, c) => sum + c.gold, 0);
    const distribution: WealthDistribution[] = [];

    for (const [tier, goldValues] of tierData.entries()) {
      goldValues.sort((a, b) => a - b);

      const totalGold = goldValues.reduce((sum, g) => sum + g, 0);
      const averageGold = goldValues.length > 0 ? totalGold / goldValues.length : 0;
      const medianGold = goldValues.length > 0
        ? goldValues[Math.floor(goldValues.length / 2)]
        : 0;

      distribution.push({
        tier,
        playerCount: goldValues.length,
        averageGold,
        medianGold,
        totalGold,
        percentOfTotalWealth: totalWealth > 0 ? (totalGold / totalWealth) * 100 : 0
      });
    }

    return distribution.sort((a, b) => {
      const tierOrder = [LevelTier.NOVICE, LevelTier.JOURNEYMAN, LevelTier.VETERAN, LevelTier.EXPERT, LevelTier.MASTER];
      return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
    });
  }

  /**
   * Determine trend from data series
   */
  private static determineTrend(values: number[]): 'increasing' | 'stable' | 'decreasing' {
    if (values.length < 2) return 'stable';

    // Simple linear regression
    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Threshold: 5% change considered significant
    const avgValue = sumY / n;
    const threshold = avgValue * 0.05;

    if (slope > threshold) return 'increasing';
    if (slope < -threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Generate recommendations based on report data
   */
  private static generateRecommendations(
    dailyReports: DailyEconomyReport[],
    health: any
  ): string[] {
    const recommendations: string[] = [];

    // Check average gold flow ratio
    const avgFlowRatio = dailyReports.reduce((sum, r) => sum + r.goldFlowRatio, 0) / dailyReports.length;

    if (avgFlowRatio < BALANCE_TARGETS.goldFlowRatio.minimum) {
      recommendations.push('Gold flow ratio below target. Consider increasing rewards or reducing costs.');
    } else if (avgFlowRatio > BALANCE_TARGETS.goldFlowRatio.maximum) {
      recommendations.push('Gold flow ratio above target. Consider reducing rewards or adding gold sinks.');
    }

    // Check player activity trend
    const playerCounts = dailyReports.map(r => r.activePlayers);
    const playerTrend = this.determineTrend(playerCounts);

    if (playerTrend === 'decreasing') {
      recommendations.push('Player activity is decreasing. Review recent balance changes and player feedback.');
    }

    // Check for critical issues
    const criticalIssues = health.issues.filter((i: any) => i.severity === 'CRITICAL');
    if (criticalIssues.length > 0) {
      recommendations.push(`URGENT: ${criticalIssues.length} critical balance issues detected. Review immediately.`);
    }

    // Check wealth inequality
    if (health.giniCoefficient > BALANCE_TARGETS.wealthInequality.maximum) {
      recommendations.push('Wealth inequality too high. Check for exploits or balance issues favoring veterans.');
    }

    return recommendations;
  }

  /**
   * Format report as text
   */
  static formatDailyReportAsText(report: DailyEconomyReport): string {
    let text = `=== DAILY ECONOMY REPORT ===\n`;
    text += `Date: ${report.date.toISOString().split('T')[0]}\n\n`;

    text += `OVERALL METRICS:\n`;
    text += `  Gold Earned: ${report.totalGoldEarned.toLocaleString()}\n`;
    text += `  Gold Spent: ${report.totalGoldSpent.toLocaleString()}\n`;
    text += `  Net Change: ${report.netGoldChange.toLocaleString()}\n`;
    text += `  Flow Ratio: ${report.goldFlowRatio.toFixed(2)} (Target: ${BALANCE_TARGETS.goldFlowRatio.target})\n`;
    text += `  Active Players: ${report.activePlayers}\n`;
    text += `  New Characters: ${report.newCharacters}\n\n`;

    text += `TOP GOLD SOURCES:\n`;
    for (const source of report.topGoldSources.slice(0, 5)) {
      text += `  ${source.source}: ${source.totalGold.toLocaleString()} (${source.percentOfTotal.toFixed(1)}%)\n`;
    }
    text += `\n`;

    text += `TOP GOLD SINKS:\n`;
    for (const sink of report.topGoldSinks.slice(0, 5)) {
      text += `  ${sink.source}: ${sink.totalGold.toLocaleString()} (${sink.percentOfTotal.toFixed(1)}%)\n`;
    }
    text += `\n`;

    text += `WEALTH DISTRIBUTION:\n`;
    for (const dist of report.wealthDistribution) {
      text += `  ${dist.tier}: ${dist.playerCount} players, avg ${dist.averageGold.toLocaleString()} gold\n`;
    }
    text += `\n`;

    text += `ECONOMIC HEALTH:\n`;
    text += `  Gini Coefficient: ${report.giniCoefficient.toFixed(3)}\n`;
    text += `  Gold Velocity: ${report.goldVelocity.toFixed(1)} tx/player/day\n`;
    text += `  Inflation Rate: ${report.inflationRate.toFixed(2)}%\n`;

    return text;
  }

  /**
   * Format weekly report as text
   */
  static formatWeeklyReportAsText(report: WeeklyEconomyReport): string {
    let text = `=== WEEKLY ECONOMY REPORT ===\n`;
    text += `Week: ${report.weekStartDate.toISOString().split('T')[0]} to ${report.weekEndDate.toISOString().split('T')[0]}\n\n`;

    text += `WEEKLY SUMMARY:\n`;
    text += `  Total Gold Earned: ${report.weeklyGoldEarned.toLocaleString()}\n`;
    text += `  Total Gold Spent: ${report.weeklyGoldSpent.toLocaleString()}\n`;
    text += `  Average Daily Players: ${Math.round(report.averageDailyPlayers)}\n`;
    text += `  Gold Earning Trend: ${report.goldEarningTrend}\n`;
    text += `  Player Activity Trend: ${report.playerActivityTrend}\n`;
    text += `  Balance Issues: ${report.balanceIssuesDetected}\n\n`;

    if (report.recommendedActions.length > 0) {
      text += `RECOMMENDATIONS:\n`;
      for (const action of report.recommendedActions) {
        text += `  - ${action}\n`;
      }
    }

    return text;
  }
}

export default EconomyReportGenerator;
