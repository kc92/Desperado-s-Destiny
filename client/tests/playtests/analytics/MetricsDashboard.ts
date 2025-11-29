/**
 * MetricsDashboard.ts - Real-time monitoring and analytics for playtest bots
 *
 * Provides comprehensive tracking and aggregation of bot performance metrics,
 * including status monitoring, success rates, economic metrics, social engagement,
 * and exploit detection alerts.
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Real-time status of a single bot
 */
export interface BotStatus {
  botId: string;
  botName: string;
  botType: 'combat' | 'economy' | 'social' | 'adversarial';
  status: 'running' | 'paused' | 'stopped' | 'error';
  uptime: number; // milliseconds
  lastActivity: Date;
  currentAction?: string;
  health: 'healthy' | 'degraded' | 'critical';
  errorCount: number;
  memoryUsageMB: number;
}

/**
 * Aggregated metrics across all bots
 */
export interface AggregatedMetrics {
  totalBots: number;
  activeBots: number;
  totalActions: number;
  actionsPerMinute: number;
  avgSuccessRate: number;
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalEnergyConsumed: number;
  socialInteractions: number;
  friendshipsMade: number;
  messagesSent: number;
  exploitsFound: number;
  criticalExploits: number;
  avgHumanLikenessScore: number;
}

/**
 * Performance metrics for a single bot
 */
export interface BotPerformanceMetrics {
  botId: string;

  // Action metrics
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsPerMinute: number;

  // Success rates
  successRate: number;
  successRateByAction: Record<string, { successes: number; failures: number; rate: number }>;

  // Economic metrics
  goldEarned: number;
  goldSpent: number;
  goldBalance: number;
  goldEfficiency: number; // gold earned per action

  // Resource metrics
  energyConsumed: number;
  energyEfficiency: number; // actions per energy

  // Social metrics
  friendshipsFormed: number;
  messagesSent: number;
  messagesReceived: number;
  socialEngagement: number; // 0-100 score

  // Timing metrics
  avgActionDuration: number;
  timingVariance: number; // standard deviation

  // Quality metrics
  errorRate: number;
  breaksTaken: number;
  avgBreakDuration: number;

  // Human-likeness
  humanLikenessScore: number;
}

/**
 * Real-time dashboard snapshot
 */
export interface DashboardSnapshot {
  timestamp: Date;
  botStatuses: BotStatus[];
  aggregatedMetrics: AggregatedMetrics;
  performanceMetrics: Map<string, BotPerformanceMetrics>;
  recentExploits: ExploitAlert[];
  alerts: DashboardAlert[];
}

/**
 * Alert types for dashboard notifications
 */
export interface DashboardAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  botId?: string;
  category: 'performance' | 'exploit' | 'health' | 'social' | 'economic';
  title: string;
  message: string;
  actionRequired?: string;
}

/**
 * Exploit alert from adversarial bot
 */
export interface ExploitAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  timestamp: Date;
  botId: string;
  status: 'new' | 'acknowledged' | 'fixed' | 'wont-fix';
}

/**
 * Historical metric data point
 */
export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  botId?: string;
}

/**
 * Time series data for charting
 */
export interface TimeSeriesData {
  metric: string;
  dataPoints: MetricDataPoint[];
  aggregation: 'sum' | 'avg' | 'min' | 'max';
}

// ============================================================================
// METRICS DASHBOARD CLASS
// ============================================================================

/**
 * Central metrics dashboard that aggregates and monitors all bot activity
 */
export class MetricsDashboard {
  private botStatuses: Map<string, BotStatus> = new Map();
  private performanceMetrics: Map<string, BotPerformanceMetrics> = new Map();
  private timeSeriesData: Map<string, TimeSeriesData> = new Map();
  private alerts: DashboardAlert[] = [];
  private exploitAlerts: ExploitAlert[] = [];

  private dataDir: string;
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(dataDir: string = './tests/playtests/dashboard-data') {
    this.dataDir = dataDir;
    this.ensureDataDirectory();
    this.initializeTimeSeries();
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Initialize time series data collectors
   */
  private initializeTimeSeries(): void {
    const metrics = [
      'actions_per_minute',
      'success_rate',
      'gold_balance',
      'active_bots',
      'error_rate',
      'human_likeness',
      'social_engagement',
      'exploits_found',
    ];

    for (const metric of metrics) {
      this.timeSeriesData.set(metric, {
        metric,
        dataPoints: [],
        aggregation: 'avg',
      });
    }
  }

  // ============================================================================
  // BOT REGISTRATION & STATUS
  // ============================================================================

  /**
   * Register a new bot with the dashboard
   */
  registerBot(
    botId: string,
    botName: string,
    botType: 'combat' | 'economy' | 'social' | 'adversarial'
  ): void {
    const status: BotStatus = {
      botId,
      botName,
      botType,
      status: 'running',
      uptime: 0,
      lastActivity: new Date(),
      health: 'healthy',
      errorCount: 0,
      memoryUsageMB: 0,
    };

    this.botStatuses.set(botId, status);

    // Initialize performance metrics
    const metrics: BotPerformanceMetrics = {
      botId,
      totalActions: 0,
      actionsByType: {},
      actionsPerMinute: 0,
      successRate: 0,
      successRateByAction: {},
      goldEarned: 0,
      goldSpent: 0,
      goldBalance: 0,
      goldEfficiency: 0,
      energyConsumed: 0,
      energyEfficiency: 0,
      friendshipsFormed: 0,
      messagesSent: 0,
      messagesReceived: 0,
      socialEngagement: 0,
      avgActionDuration: 0,
      timingVariance: 0,
      errorRate: 0,
      breaksTaken: 0,
      avgBreakDuration: 0,
      humanLikenessScore: 0,
    };

    this.performanceMetrics.set(botId, metrics);

    console.log(`[Dashboard] Registered bot: ${botName} (${botType})`);
  }

  /**
   * Update bot status
   */
  updateBotStatus(botId: string, updates: Partial<BotStatus>): void {
    const status = this.botStatuses.get(botId);
    if (!status) {
      console.warn(`[Dashboard] Bot not found: ${botId}`);
      return;
    }

    Object.assign(status, updates);
    status.lastActivity = new Date();

    // Check for health issues
    if (status.errorCount > 10) {
      status.health = 'critical';
      this.createAlert({
        severity: 'error',
        botId,
        category: 'health',
        title: 'High Error Rate',
        message: `Bot ${status.botName} has ${status.errorCount} errors`,
        actionRequired: 'Review bot logs and restart if needed',
      });
    } else if (status.errorCount > 5) {
      status.health = 'degraded';
    }
  }

  /**
   * Update bot uptime
   */
  updateUptime(botId: string, uptimeMs: number): void {
    const status = this.botStatuses.get(botId);
    if (status) {
      status.uptime = uptimeMs;
    }
  }

  // ============================================================================
  // METRICS RECORDING
  // ============================================================================

  /**
   * Record an action performed by a bot
   */
  recordAction(
    botId: string,
    actionType: string,
    success: boolean,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const metrics = this.performanceMetrics.get(botId);
    if (!metrics) return;

    // Update action counts
    metrics.totalActions++;
    metrics.actionsByType[actionType] = (metrics.actionsByType[actionType] || 0) + 1;

    // Update success rates
    if (!metrics.successRateByAction[actionType]) {
      metrics.successRateByAction[actionType] = { successes: 0, failures: 0, rate: 0 };
    }

    const actionStats = metrics.successRateByAction[actionType];
    if (success) {
      actionStats.successes++;
    } else {
      actionStats.failures++;
    }
    actionStats.rate = actionStats.successes / (actionStats.successes + actionStats.failures);

    // Update overall success rate
    const totalSuccesses = Object.values(metrics.successRateByAction).reduce(
      (sum, stat) => sum + stat.successes,
      0
    );
    const totalAttempts = Object.values(metrics.successRateByAction).reduce(
      (sum, stat) => sum + stat.successes + stat.failures,
      0
    );
    metrics.successRate = totalAttempts > 0 ? totalSuccesses / totalAttempts : 0;

    // Update timing metrics
    const currentAvg = metrics.avgActionDuration;
    const n = metrics.totalActions;
    metrics.avgActionDuration = (currentAvg * (n - 1) + duration) / n;

    // Calculate timing variance (running standard deviation approximation)
    if (metrics.totalActions > 1) {
      const variance =
        ((n - 2) * Math.pow(metrics.timingVariance, 2) + Math.pow(duration - currentAvg, 2)) / (n - 1);
      metrics.timingVariance = Math.sqrt(variance);
    }

    // Update bot status
    this.updateBotStatus(botId, { currentAction: actionType });

    // Handle metadata
    if (metadata) {
      if (metadata.goldEarned) metrics.goldEarned += metadata.goldEarned;
      if (metadata.goldSpent) metrics.goldSpent += metadata.goldSpent;
      if (metadata.energyConsumed) metrics.energyConsumed += metadata.energyConsumed;
      if (metadata.messagesSent) metrics.messagesSent += metadata.messagesSent;
      if (metadata.friendshipFormed) metrics.friendshipsFormed++;
    }

    // Update derived metrics
    metrics.goldBalance = metrics.goldEarned - metrics.goldSpent;
    metrics.goldEfficiency = metrics.totalActions > 0 ? metrics.goldEarned / metrics.totalActions : 0;
    metrics.energyEfficiency = metrics.energyConsumed > 0 ? metrics.totalActions / metrics.energyConsumed : 0;
  }

  /**
   * Record economic activity
   */
  recordEconomicActivity(
    botId: string,
    type: 'earn' | 'spend',
    amount: number,
    source: string
  ): void {
    const metrics = this.performanceMetrics.get(botId);
    if (!metrics) return;

    if (type === 'earn') {
      metrics.goldEarned += amount;
    } else {
      metrics.goldSpent += amount;
    }

    metrics.goldBalance = metrics.goldEarned - metrics.goldSpent;
    metrics.goldEfficiency = metrics.totalActions > 0 ? metrics.goldEarned / metrics.totalActions : 0;

    // Record time series data
    this.recordTimeSeriesPoint('gold_balance', metrics.goldBalance, botId);
  }

  /**
   * Record social interaction
   */
  recordSocialInteraction(
    botId: string,
    type: 'message' | 'friendship' | 'trade' | 'combat',
    targetBotId?: string
  ): void {
    const metrics = this.performanceMetrics.get(botId);
    if (!metrics) return;

    switch (type) {
      case 'message':
        metrics.messagesSent++;
        break;
      case 'friendship':
        metrics.friendshipsFormed++;
        break;
    }

    // Calculate social engagement score (0-100)
    // Based on: messages, friendships, and variety of interactions
    const messageScore = Math.min(50, metrics.messagesSent);
    const friendshipScore = Math.min(30, metrics.friendshipsFormed * 5);
    const varietyScore = 20; // Could be more sophisticated

    metrics.socialEngagement = messageScore + friendshipScore + varietyScore;

    // Record time series
    this.recordTimeSeriesPoint('social_engagement', metrics.socialEngagement, botId);
  }

  /**
   * Record bot error
   */
  recordError(botId: string, error: string, severity: 'low' | 'medium' | 'high'): void {
    const status = this.botStatuses.get(botId);
    if (status) {
      status.errorCount++;
    }

    const metrics = this.performanceMetrics.get(botId);
    if (metrics) {
      metrics.errorRate = metrics.totalActions > 0 ? status!.errorCount / metrics.totalActions : 0;
    }

    if (severity === 'high') {
      this.createAlert({
        severity: 'error',
        botId,
        category: 'performance',
        title: 'Bot Error',
        message: error,
      });
    }
  }

  /**
   * Record break taken by bot
   */
  recordBreak(botId: string, duration: number, reason: string): void {
    const metrics = this.performanceMetrics.get(botId);
    if (!metrics) return;

    metrics.breaksTaken++;

    // Update average break duration
    const n = metrics.breaksTaken;
    metrics.avgBreakDuration = (metrics.avgBreakDuration * (n - 1) + duration) / n;

    console.log(`[Dashboard] Bot ${botId} took break: ${reason} (${duration}ms)`);
  }

  /**
   * Update human-likeness score for a bot
   */
  updateHumanLikenessScore(botId: string, score: number): void {
    const metrics = this.performanceMetrics.get(botId);
    if (!metrics) return;

    metrics.humanLikenessScore = score;

    // Record time series
    this.recordTimeSeriesPoint('human_likeness', score, botId);

    // Alert if score is too low (too robotic)
    if (score < 40) {
      this.createAlert({
        severity: 'warning',
        botId,
        category: 'performance',
        title: 'Low Human-Likeness Score',
        message: `Bot appears too robotic (score: ${score.toFixed(1)})`,
        actionRequired: 'Review timing variance and break patterns',
      });
    }
  }

  // ============================================================================
  // EXPLOIT TRACKING
  // ============================================================================

  /**
   * Record exploit found by adversarial bot
   */
  recordExploit(
    botId: string,
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    category: string,
    title: string,
    details: any
  ): void {
    const exploit: ExploitAlert = {
      id: `exploit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      category,
      title,
      timestamp: new Date(),
      botId,
      status: 'new',
    };

    this.exploitAlerts.push(exploit);

    // Create dashboard alert
    const alertSeverity = severity === 'CRITICAL' ? 'critical' : severity === 'HIGH' ? 'error' : 'warning';
    this.createAlert({
      severity: alertSeverity,
      botId,
      category: 'exploit',
      title: `Exploit Found: ${title}`,
      message: `${severity} severity ${category} exploit detected`,
      actionRequired: 'Review exploit details and implement fix',
    });

    // Record time series
    this.recordTimeSeriesPoint('exploits_found', this.exploitAlerts.length);

    // Save exploit to file
    this.saveExploitReport(exploit, details);

    console.log(`[Dashboard] EXPLOIT FOUND: ${title} (${severity})`);
  }

  /**
   * Save exploit report to file
   */
  private saveExploitReport(exploit: ExploitAlert, details: any): void {
    const reportPath = path.join(this.dataDir, 'exploits', `${exploit.id}.json`);
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
      ...exploit,
      details,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }

  // ============================================================================
  // TIME SERIES DATA
  // ============================================================================

  /**
   * Record a time series data point
   */
  private recordTimeSeriesPoint(metric: string, value: number, botId?: string): void {
    const series = this.timeSeriesData.get(metric);
    if (!series) return;

    series.dataPoints.push({
      timestamp: new Date(),
      value,
      botId,
    });

    // Keep only last 1000 points
    if (series.dataPoints.length > 1000) {
      series.dataPoints.shift();
    }
  }

  /**
   * Get time series data for charting
   */
  getTimeSeriesData(metric: string, timeRangeMinutes?: number): TimeSeriesData | null {
    const series = this.timeSeriesData.get(metric);
    if (!series) return null;

    if (!timeRangeMinutes) {
      return series;
    }

    // Filter to time range
    const cutoff = new Date(Date.now() - timeRangeMinutes * 60 * 1000);
    const filtered = {
      ...series,
      dataPoints: series.dataPoints.filter(dp => dp.timestamp >= cutoff),
    };

    return filtered;
  }

  // ============================================================================
  // ALERTS
  // ============================================================================

  /**
   * Create a dashboard alert
   */
  private createAlert(alert: Omit<DashboardAlert, 'id' | 'timestamp'>): void {
    const fullAlert: DashboardAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...alert,
    };

    this.alerts.push(fullAlert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    console.log(`[Dashboard Alert] ${fullAlert.severity.toUpperCase()}: ${fullAlert.title}`);
  }

  /**
   * Get recent alerts
   */
  getAlerts(count: number = 50, severity?: DashboardAlert['severity'][]): DashboardAlert[] {
    let filtered = this.alerts;

    if (severity) {
      filtered = filtered.filter(a => severity.includes(a.severity));
    }

    return filtered.slice(-count);
  }

  /**
   * Clear alerts
   */
  clearAlerts(alertIds?: string[]): void {
    if (alertIds) {
      this.alerts = this.alerts.filter(a => !alertIds.includes(a.id));
    } else {
      this.alerts = [];
    }
  }

  // ============================================================================
  // AGGREGATIONS & SNAPSHOTS
  // ============================================================================

  /**
   * Get aggregated metrics across all bots
   */
  getAggregatedMetrics(): AggregatedMetrics {
    const bots = Array.from(this.botStatuses.values());
    const metrics = Array.from(this.performanceMetrics.values());

    const activeBots = bots.filter(b => b.status === 'running').length;
    const totalActions = metrics.reduce((sum, m) => sum + m.totalActions, 0);

    // Calculate total uptime in minutes
    const totalUptimeMinutes = bots.reduce((sum, b) => sum + b.uptime / 60000, 0);
    const actionsPerMinute = totalUptimeMinutes > 0 ? totalActions / totalUptimeMinutes : 0;

    const avgSuccessRate = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
      : 0;

    const totalGoldEarned = metrics.reduce((sum, m) => sum + m.goldEarned, 0);
    const totalGoldSpent = metrics.reduce((sum, m) => sum + m.goldSpent, 0);
    const totalEnergyConsumed = metrics.reduce((sum, m) => sum + m.energyConsumed, 0);
    const friendshipsMade = metrics.reduce((sum, m) => sum + m.friendshipsFormed, 0);
    const messagesSent = metrics.reduce((sum, m) => sum + m.messagesSent, 0);

    const exploitsFound = this.exploitAlerts.length;
    const criticalExploits = this.exploitAlerts.filter(e => e.severity === 'CRITICAL').length;

    const avgHumanLikenessScore = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.humanLikenessScore, 0) / metrics.length
      : 0;

    return {
      totalBots: bots.length,
      activeBots,
      totalActions,
      actionsPerMinute,
      avgSuccessRate,
      totalGoldEarned,
      totalGoldSpent,
      totalEnergyConsumed,
      socialInteractions: messagesSent + friendshipsMade,
      friendshipsMade,
      messagesSent,
      exploitsFound,
      criticalExploits,
      avgHumanLikenessScore,
    };
  }

  /**
   * Get complete dashboard snapshot
   */
  getSnapshot(): DashboardSnapshot {
    return {
      timestamp: new Date(),
      botStatuses: Array.from(this.botStatuses.values()),
      aggregatedMetrics: this.getAggregatedMetrics(),
      performanceMetrics: this.performanceMetrics,
      recentExploits: this.exploitAlerts.slice(-10),
      alerts: this.getAlerts(20),
    };
  }

  // ============================================================================
  // DATA EXPORT & PERSISTENCE
  // ============================================================================

  /**
   * Export dashboard data as JSON
   */
  exportData(): string {
    const snapshot = this.getSnapshot();

    const exportData = {
      snapshot,
      timeSeries: Array.from(this.timeSeriesData.entries()).map(([metric, data]) => ({
        metric,
        data,
      })),
      allAlerts: this.alerts,
      allExploits: this.exploitAlerts,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Save dashboard snapshot to file
   */
  saveSnapshot(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(this.dataDir, `snapshot-${timestamp}.json`);

    const data = this.exportData();
    fs.writeFileSync(filename, data);

    console.log(`[Dashboard] Snapshot saved: ${filename}`);
    return filename;
  }

  /**
   * Export metrics to CSV
   */
  exportToCSV(): string {
    const metrics = Array.from(this.performanceMetrics.values());

    const headers = [
      'BotID',
      'TotalActions',
      'ActionsPerMin',
      'SuccessRate',
      'GoldEarned',
      'GoldSpent',
      'GoldBalance',
      'EnergyConsumed',
      'SocialEngagement',
      'HumanLikenessScore',
      'ErrorRate',
    ];

    const rows = metrics.map(m => [
      m.botId,
      m.totalActions,
      m.actionsPerMinute.toFixed(2),
      (m.successRate * 100).toFixed(1),
      m.goldEarned,
      m.goldSpent,
      m.goldBalance,
      m.energyConsumed,
      m.socialEngagement.toFixed(1),
      m.humanLikenessScore.toFixed(1),
      (m.errorRate * 100).toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(this.dataDir, `metrics-${timestamp}.csv`);
    fs.writeFileSync(filename, csv);

    console.log(`[Dashboard] CSV exported: ${filename}`);
    return filename;
  }

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  /**
   * Start real-time monitoring with periodic updates
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isRunning) {
      console.log('[Dashboard] Monitoring already running');
      return;
    }

    this.isRunning = true;
    console.log(`[Dashboard] Starting monitoring (interval: ${intervalMs}ms)`);

    this.updateInterval = setInterval(() => {
      this.updateRealTimeMetrics();
    }, intervalMs);
  }

  /**
   * Stop real-time monitoring
   */
  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isRunning = false;
    console.log('[Dashboard] Monitoring stopped');
  }

  /**
   * Update real-time metrics
   */
  private updateRealTimeMetrics(): void {
    const aggregated = this.getAggregatedMetrics();

    // Record time series for key metrics
    this.recordTimeSeriesPoint('active_bots', aggregated.activeBots);
    this.recordTimeSeriesPoint('actions_per_minute', aggregated.actionsPerMinute);
    this.recordTimeSeriesPoint('success_rate', aggregated.avgSuccessRate * 100);

    // Calculate actions per minute for each bot
    for (const [botId, metrics] of this.performanceMetrics.entries()) {
      const status = this.botStatuses.get(botId);
      if (status && status.uptime > 0) {
        metrics.actionsPerMinute = (metrics.totalActions / (status.uptime / 60000));
      }
    }

    // Save periodic snapshot
    if (Math.random() < 0.1) { // 10% chance per update
      this.saveSnapshot();
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get bot status by ID
   */
  getBotStatus(botId: string): BotStatus | null {
    return this.botStatuses.get(botId) || null;
  }

  /**
   * Get bot performance metrics by ID
   */
  getBotMetrics(botId: string): BotPerformanceMetrics | null {
    return this.performanceMetrics.get(botId) || null;
  }

  /**
   * Get all bot IDs
   */
  getAllBotIds(): string[] {
    return Array.from(this.botStatuses.keys());
  }

  /**
   * Get bots by type
   */
  getBotsByType(type: BotStatus['botType']): BotStatus[] {
    return Array.from(this.botStatuses.values()).filter(b => b.botType === type);
  }

  /**
   * Get bots by status
   */
  getBotsByStatus(status: BotStatus['status']): BotStatus[] {
    return Array.from(this.botStatuses.values()).filter(b => b.status === status);
  }

  /**
   * Get top performing bots
   */
  getTopPerformers(metric: keyof BotPerformanceMetrics, count: number = 10): Array<{
    botId: string;
    value: number;
  }> {
    const metrics = Array.from(this.performanceMetrics.values());

    return metrics
      .map(m => ({ botId: m.botId, value: m[metric] as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, count);
  }

  /**
   * Print summary to console
   */
  printSummary(): void {
    const aggregated = this.getAggregatedMetrics();

    console.log('\n' + '='.repeat(80));
    console.log('METRICS DASHBOARD SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Bots: ${aggregated.totalBots} | Active: ${aggregated.activeBots}`);
    console.log(`Total Actions: ${aggregated.totalActions} | Actions/Min: ${aggregated.actionsPerMinute.toFixed(2)}`);
    console.log(`Success Rate: ${(aggregated.avgSuccessRate * 100).toFixed(1)}%`);
    console.log(`Gold: Earned=${aggregated.totalGoldEarned} | Spent=${aggregated.totalGoldSpent} | Net=${aggregated.totalGoldEarned - aggregated.totalGoldSpent}`);
    console.log(`Energy Consumed: ${aggregated.totalEnergyConsumed}`);
    console.log(`Social: ${aggregated.friendshipsMade} friendships | ${aggregated.messagesSent} messages`);
    console.log(`Exploits: ${aggregated.exploitsFound} total (${aggregated.criticalExploits} critical)`);
    console.log(`Avg Human-Likeness: ${aggregated.avgHumanLikenessScore.toFixed(1)}/100`);
    console.log('='.repeat(80));

    // Top performers
    console.log('\nTop Performers (by actions):');
    const topPerformers = this.getTopPerformers('totalActions', 5);
    topPerformers.forEach((p, i) => {
      const status = this.botStatuses.get(p.botId);
      console.log(`  ${i + 1}. ${status?.botName || p.botId}: ${p.value} actions`);
    });

    // Recent alerts
    const recentAlerts = this.getAlerts(5);
    if (recentAlerts.length > 0) {
      console.log('\nRecent Alerts:');
      recentAlerts.forEach(alert => {
        console.log(`  [${alert.severity.toUpperCase()}] ${alert.title}`);
      });
    }

    console.log('='.repeat(80) + '\n');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default MetricsDashboard;
