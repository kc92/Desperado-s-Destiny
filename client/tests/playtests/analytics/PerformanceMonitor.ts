/**
 * PerformanceMonitor.ts - Real-time performance tracking and health monitoring
 *
 * Tracks bot performance metrics over time, monitors resource usage,
 * detects performance degradation, and provides auto-recovery mechanisms.
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Performance snapshot at a point in time
 */
export interface PerformanceSnapshot {
  timestamp: Date;
  botId: string;

  // Execution metrics
  actionsPerSecond: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;

  // Resource metrics
  memoryUsageMB: number;
  cpuUsagePercent: number;

  // Health metrics
  errorRate: number;
  consecutiveErrors: number;
  lastError?: string;
  healthStatus: 'healthy' | 'degraded' | 'critical' | 'crashed';
}

/**
 * Performance trend over time
 */
export interface PerformanceTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'degrading' | 'critical';
  changePercent: number;
  dataPoints: Array<{ timestamp: Date; value: number }>;
}

/**
 * Health check result
 */
export interface HealthCheck {
  botId: string;
  timestamp: Date;
  healthy: boolean;
  checks: {
    responsive: boolean;
    lowErrorRate: boolean;
    normalMemory: boolean;
    normalCpu: boolean;
  };
  issues: string[];
  score: number; // 0-100
}

/**
 * Recovery action
 */
export interface RecoveryAction {
  type: 'restart' | 'throttle' | 'pause' | 'kill';
  reason: string;
  timestamp: Date;
  success?: boolean;
}

/**
 * Performance alert
 */
export interface PerformanceAlert {
  id: string;
  botId: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'performance' | 'memory' | 'cpu' | 'errors' | 'health';
  message: string;
  timestamp: Date;
  metric?: string;
  value?: number;
  threshold?: number;
}

// ============================================================================
// PERFORMANCE THRESHOLDS
// ============================================================================

export const PERFORMANCE_THRESHOLDS = {
  memory: {
    warning: 200, // MB
    critical: 500, // MB
  },
  cpu: {
    warning: 70, // %
    critical: 90, // %
  },
  errorRate: {
    warning: 0.1, // 10%
    critical: 0.25, // 25%
  },
  consecutiveErrors: {
    warning: 3,
    critical: 5,
  },
  responseTime: {
    warning: 5000, // ms
    critical: 10000, // ms
  },
  actionsPerSecond: {
    minimum: 0.1, // Actions slower than 10s is concerning
  },
};

// ============================================================================
// PERFORMANCE MONITOR CLASS
// ============================================================================

/**
 * Monitors bot performance and provides health checks
 */
export class PerformanceMonitor {
  private snapshots: Map<string, PerformanceSnapshot[]> = new Map();
  private healthChecks: Map<string, HealthCheck[]> = new Map();
  private recoveryActions: Map<string, RecoveryAction[]> = new Map();
  private alerts: PerformanceAlert[] = [];

  private responseTimings: Map<string, number[]> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private consecutiveErrorCounts: Map<string, number> = new Map();

  private dataDir: string;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;

  constructor(dataDir: string = './tests/playtests/performance-data') {
    this.dataDir = dataDir;
    this.ensureDataDirectory();
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // ============================================================================
  // PERFORMANCE TRACKING
  // ============================================================================

  /**
   * Record a performance snapshot
   */
  recordSnapshot(botId: string, data: Partial<PerformanceSnapshot>): void {
    const snapshot: PerformanceSnapshot = {
      timestamp: new Date(),
      botId,
      actionsPerSecond: data.actionsPerSecond || 0,
      avgResponseTime: data.avgResponseTime || 0,
      p95ResponseTime: data.p95ResponseTime || 0,
      p99ResponseTime: data.p99ResponseTime || 0,
      memoryUsageMB: data.memoryUsageMB || 0,
      cpuUsagePercent: data.cpuUsagePercent || 0,
      errorRate: data.errorRate || 0,
      consecutiveErrors: data.consecutiveErrors || 0,
      lastError: data.lastError,
      healthStatus: data.healthStatus || 'healthy',
    };

    if (!this.snapshots.has(botId)) {
      this.snapshots.set(botId, []);
    }

    const botSnapshots = this.snapshots.get(botId)!;
    botSnapshots.push(snapshot);

    // Keep only last 1000 snapshots
    if (botSnapshots.length > 1000) {
      botSnapshots.shift();
    }

    // Check for performance issues
    this.checkPerformanceThresholds(snapshot);
  }

  /**
   * Record action timing
   */
  recordActionTiming(botId: string, durationMs: number, success: boolean): void {
    // Track response timings
    if (!this.responseTimings.has(botId)) {
      this.responseTimings.set(botId, []);
    }

    const timings = this.responseTimings.get(botId)!;
    timings.push(durationMs);

    // Keep only last 100 timings
    if (timings.length > 100) {
      timings.shift();
    }

    // Track errors
    if (!success) {
      const errorCount = this.errorCounts.get(botId) || 0;
      this.errorCounts.set(botId, errorCount + 1);

      const consecutiveErrors = this.consecutiveErrorCounts.get(botId) || 0;
      this.consecutiveErrorCounts.set(botId, consecutiveErrors + 1);

      // Alert on consecutive errors
      if (consecutiveErrors + 1 >= PERFORMANCE_THRESHOLDS.consecutiveErrors.critical) {
        this.createAlert({
          botId,
          severity: 'critical',
          category: 'errors',
          message: `${consecutiveErrors + 1} consecutive errors detected`,
          metric: 'consecutiveErrors',
          value: consecutiveErrors + 1,
          threshold: PERFORMANCE_THRESHOLDS.consecutiveErrors.critical,
        });
      }
    } else {
      // Reset consecutive errors on success
      this.consecutiveErrorCounts.set(botId, 0);
    }

    // Calculate and record performance metrics
    if (timings.length >= 10) {
      const avgResponseTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      const p95ResponseTime = this.calculatePercentile(timings, 0.95);
      const p99ResponseTime = this.calculatePercentile(timings, 0.99);

      const totalActions = timings.length;
      const errors = this.errorCounts.get(botId) || 0;
      const errorRate = errors / totalActions;

      this.recordSnapshot(botId, {
        avgResponseTime,
        p95ResponseTime,
        p99ResponseTime,
        errorRate,
        consecutiveErrors: this.consecutiveErrorCounts.get(botId) || 0,
      });
    }
  }

  /**
   * Record resource usage
   */
  recordResourceUsage(botId: string, memoryMB: number, cpuPercent: number): void {
    this.recordSnapshot(botId, {
      memoryUsageMB: memoryMB,
      cpuUsagePercent: cpuPercent,
    });
  }

  // ============================================================================
  // HEALTH MONITORING
  // ============================================================================

  /**
   * Perform health check on a bot
   */
  performHealthCheck(botId: string): HealthCheck {
    const snapshots = this.snapshots.get(botId);
    if (!snapshots || snapshots.length === 0) {
      return {
        botId,
        timestamp: new Date(),
        healthy: false,
        checks: {
          responsive: false,
          lowErrorRate: false,
          normalMemory: false,
          normalCpu: false,
        },
        issues: ['No performance data available'],
        score: 0,
      };
    }

    const latestSnapshot = snapshots[snapshots.length - 1];
    const issues: string[] = [];
    let score = 100;

    // Check responsiveness
    const responsive = latestSnapshot.avgResponseTime < PERFORMANCE_THRESHOLDS.responseTime.warning;
    if (!responsive) {
      issues.push(`Slow response time: ${latestSnapshot.avgResponseTime.toFixed(0)}ms`);
      score -= 25;
    }

    // Check error rate
    const lowErrorRate = latestSnapshot.errorRate < PERFORMANCE_THRESHOLDS.errorRate.warning;
    if (!lowErrorRate) {
      issues.push(`High error rate: ${(latestSnapshot.errorRate * 100).toFixed(1)}%`);
      score -= 30;
    }

    // Check memory
    const normalMemory = latestSnapshot.memoryUsageMB < PERFORMANCE_THRESHOLDS.memory.warning;
    if (!normalMemory) {
      issues.push(`High memory usage: ${latestSnapshot.memoryUsageMB.toFixed(0)}MB`);
      score -= 20;
    }

    // Check CPU
    const normalCpu = latestSnapshot.cpuUsagePercent < PERFORMANCE_THRESHOLDS.cpu.warning;
    if (!normalCpu) {
      issues.push(`High CPU usage: ${latestSnapshot.cpuUsagePercent.toFixed(1)}%`);
      score -= 15;
    }

    // Check for consecutive errors
    if (latestSnapshot.consecutiveErrors >= PERFORMANCE_THRESHOLDS.consecutiveErrors.warning) {
      issues.push(`${latestSnapshot.consecutiveErrors} consecutive errors`);
      score -= 10;
    }

    const healthCheck: HealthCheck = {
      botId,
      timestamp: new Date(),
      healthy: score >= 70,
      checks: {
        responsive,
        lowErrorRate,
        normalMemory,
        normalCpu,
      },
      issues,
      score: Math.max(0, score),
    };

    // Store health check
    if (!this.healthChecks.has(botId)) {
      this.healthChecks.set(botId, []);
    }
    this.healthChecks.get(botId)!.push(healthCheck);

    return healthCheck;
  }

  /**
   * Get health status for a bot
   */
  getHealthStatus(botId: string): 'healthy' | 'degraded' | 'critical' | 'unknown' {
    const healthCheck = this.performHealthCheck(botId);

    if (healthCheck.score >= 80) return 'healthy';
    if (healthCheck.score >= 60) return 'degraded';
    if (healthCheck.score > 0) return 'critical';
    return 'unknown';
  }

  // ============================================================================
  // PERFORMANCE ANALYSIS
  // ============================================================================

  /**
   * Analyze performance trend for a metric
   */
  analyzePerformanceTrend(
    botId: string,
    metric: keyof PerformanceSnapshot,
    windowMinutes: number = 15
  ): PerformanceTrend | null {
    const snapshots = this.snapshots.get(botId);
    if (!snapshots || snapshots.length < 2) return null;

    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
    const recentSnapshots = snapshots.filter(s => s.timestamp >= cutoff);

    if (recentSnapshots.length < 2) return null;

    const dataPoints = recentSnapshots.map(s => ({
      timestamp: s.timestamp,
      value: s[metric] as number,
    }));

    // Calculate trend using linear regression
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, _, i) => sum + i, 0);
    const sumY = dataPoints.reduce((sum, p) => sum + p.value, 0);
    const sumXY = dataPoints.reduce((sum, p, i) => sum + i * p.value, 0);
    const sumX2 = dataPoints.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Calculate percent change
    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;
    const changePercent = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    // Determine trend
    let trend: PerformanceTrend['trend'];
    if (Math.abs(changePercent) < 5) {
      trend = 'stable';
    } else if (metric === 'errorRate' || metric === 'memoryUsageMB' || metric === 'avgResponseTime') {
      // For these metrics, increasing is bad
      if (changePercent > 20) trend = 'critical';
      else if (changePercent > 5) trend = 'degrading';
      else if (changePercent < -5) trend = 'improving';
      else trend = 'stable';
    } else {
      // For metrics like actionsPerSecond, increasing is good
      if (changePercent < -20) trend = 'critical';
      else if (changePercent < -5) trend = 'degrading';
      else if (changePercent > 5) trend = 'improving';
      else trend = 'stable';
    }

    return {
      metric: metric as string,
      trend,
      changePercent,
      dataPoints,
    };
  }

  /**
   * Get performance summary for a bot
   */
  getPerformanceSummary(botId: string): {
    current: PerformanceSnapshot | null;
    trends: PerformanceTrend[];
    healthCheck: HealthCheck;
    avgMetrics: Partial<PerformanceSnapshot>;
  } | null {
    const snapshots = this.snapshots.get(botId);
    if (!snapshots || snapshots.length === 0) return null;

    const current = snapshots[snapshots.length - 1];
    const healthCheck = this.performHealthCheck(botId);

    // Calculate trends for key metrics
    const metrics: Array<keyof PerformanceSnapshot> = [
      'actionsPerSecond',
      'avgResponseTime',
      'memoryUsageMB',
      'errorRate',
    ];

    const trends = metrics
      .map(m => this.analyzePerformanceTrend(botId, m, 15))
      .filter((t): t is PerformanceTrend => t !== null);

    // Calculate average metrics
    const avgMetrics: Partial<PerformanceSnapshot> = {
      actionsPerSecond: this.average(snapshots.map(s => s.actionsPerSecond)),
      avgResponseTime: this.average(snapshots.map(s => s.avgResponseTime)),
      memoryUsageMB: this.average(snapshots.map(s => s.memoryUsageMB)),
      cpuUsagePercent: this.average(snapshots.map(s => s.cpuUsagePercent)),
      errorRate: this.average(snapshots.map(s => s.errorRate)),
    };

    return {
      current,
      trends,
      healthCheck,
      avgMetrics,
    };
  }

  // ============================================================================
  // AUTOMATED RECOVERY
  // ============================================================================

  /**
   * Check performance thresholds and trigger alerts
   */
  private checkPerformanceThresholds(snapshot: PerformanceSnapshot): void {
    const { botId } = snapshot;

    // Memory threshold
    if (snapshot.memoryUsageMB >= PERFORMANCE_THRESHOLDS.memory.critical) {
      this.createAlert({
        botId,
        severity: 'critical',
        category: 'memory',
        message: `Critical memory usage: ${snapshot.memoryUsageMB.toFixed(0)}MB`,
        metric: 'memoryUsageMB',
        value: snapshot.memoryUsageMB,
        threshold: PERFORMANCE_THRESHOLDS.memory.critical,
      });

      this.attemptRecovery(botId, 'restart', 'Critical memory usage');
    } else if (snapshot.memoryUsageMB >= PERFORMANCE_THRESHOLDS.memory.warning) {
      this.createAlert({
        botId,
        severity: 'warning',
        category: 'memory',
        message: `High memory usage: ${snapshot.memoryUsageMB.toFixed(0)}MB`,
        metric: 'memoryUsageMB',
        value: snapshot.memoryUsageMB,
        threshold: PERFORMANCE_THRESHOLDS.memory.warning,
      });
    }

    // CPU threshold
    if (snapshot.cpuUsagePercent >= PERFORMANCE_THRESHOLDS.cpu.critical) {
      this.createAlert({
        botId,
        severity: 'critical',
        category: 'cpu',
        message: `Critical CPU usage: ${snapshot.cpuUsagePercent.toFixed(1)}%`,
        metric: 'cpuUsagePercent',
        value: snapshot.cpuUsagePercent,
        threshold: PERFORMANCE_THRESHOLDS.cpu.critical,
      });

      this.attemptRecovery(botId, 'throttle', 'Critical CPU usage');
    }

    // Error rate threshold
    if (snapshot.errorRate >= PERFORMANCE_THRESHOLDS.errorRate.critical) {
      this.createAlert({
        botId,
        severity: 'critical',
        category: 'errors',
        message: `Critical error rate: ${(snapshot.errorRate * 100).toFixed(1)}%`,
        metric: 'errorRate',
        value: snapshot.errorRate,
        threshold: PERFORMANCE_THRESHOLDS.errorRate.critical,
      });

      this.attemptRecovery(botId, 'pause', 'Critical error rate');
    }

    // Response time threshold
    if (snapshot.p95ResponseTime >= PERFORMANCE_THRESHOLDS.responseTime.critical) {
      this.createAlert({
        botId,
        severity: 'critical',
        category: 'performance',
        message: `Critical response time: ${snapshot.p95ResponseTime.toFixed(0)}ms`,
        metric: 'p95ResponseTime',
        value: snapshot.p95ResponseTime,
        threshold: PERFORMANCE_THRESHOLDS.responseTime.critical,
      });
    }
  }

  /**
   * Attempt automated recovery
   */
  private attemptRecovery(
    botId: string,
    type: RecoveryAction['type'],
    reason: string
  ): void {
    const action: RecoveryAction = {
      type,
      reason,
      timestamp: new Date(),
    };

    console.log(`[PerformanceMonitor] Attempting recovery: ${type} for ${botId} - ${reason}`);

    // Store recovery action
    if (!this.recoveryActions.has(botId)) {
      this.recoveryActions.set(botId, []);
    }
    this.recoveryActions.get(botId)!.push(action);

    // In a real implementation, this would trigger actual recovery actions
    // For now, we just log it
  }

  // ============================================================================
  // ALERTS
  // ============================================================================

  /**
   * Create performance alert
   */
  private createAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const fullAlert: PerformanceAlert = {
      id: `perf-alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...alert,
    };

    this.alerts.push(fullAlert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    console.log(`[PerformanceMonitor] ${fullAlert.severity.toUpperCase()}: ${fullAlert.message}`);
  }

  /**
   * Get recent alerts
   */
  getAlerts(
    botId?: string,
    severity?: PerformanceAlert['severity'][],
    count: number = 50
  ): PerformanceAlert[] {
    let filtered = this.alerts;

    if (botId) {
      filtered = filtered.filter(a => a.botId === botId);
    }

    if (severity) {
      filtered = filtered.filter(a => severity.includes(a.severity));
    }

    return filtered.slice(-count);
  }

  // ============================================================================
  // MONITORING & REPORTING
  // ============================================================================

  /**
   * Start automated monitoring
   */
  startMonitoring(intervalMs: number = 10000): void {
    if (this.isMonitoring) {
      console.log('[PerformanceMonitor] Monitoring already running');
      return;
    }

    this.isMonitoring = true;
    console.log(`[PerformanceMonitor] Starting monitoring (interval: ${intervalMs}ms)`);

    this.monitoringInterval = setInterval(() => {
      this.performPeriodicChecks();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    console.log('[PerformanceMonitor] Monitoring stopped');
  }

  /**
   * Perform periodic health checks
   */
  private performPeriodicChecks(): void {
    for (const botId of this.snapshots.keys()) {
      const healthCheck = this.performHealthCheck(botId);

      if (!healthCheck.healthy) {
        console.log(`[PerformanceMonitor] Bot ${botId} health score: ${healthCheck.score}/100`);
        healthCheck.issues.forEach(issue => {
          console.log(`  - ${issue}`);
        });
      }
    }
  }

  /**
   * Generate performance report
   */
  generateReport(botId: string): string {
    const summary = this.getPerformanceSummary(botId);
    if (!summary) {
      return `No performance data available for bot: ${botId}`;
    }

    const lines = [
      '='.repeat(80),
      `PERFORMANCE REPORT: ${botId}`,
      '='.repeat(80),
      '',
      'Current Metrics:',
      `  Actions/Second:  ${summary.current.actionsPerSecond.toFixed(2)}`,
      `  Avg Response:    ${summary.current.avgResponseTime.toFixed(0)}ms`,
      `  P95 Response:    ${summary.current.p95ResponseTime.toFixed(0)}ms`,
      `  Memory Usage:    ${summary.current.memoryUsageMB.toFixed(0)}MB`,
      `  CPU Usage:       ${summary.current.cpuUsagePercent.toFixed(1)}%`,
      `  Error Rate:      ${(summary.current.errorRate * 100).toFixed(1)}%`,
      '',
      'Average Metrics:',
      `  Actions/Second:  ${summary.avgMetrics.actionsPerSecond?.toFixed(2)}`,
      `  Avg Response:    ${summary.avgMetrics.avgResponseTime?.toFixed(0)}ms`,
      `  Memory Usage:    ${summary.avgMetrics.memoryUsageMB?.toFixed(0)}MB`,
      '',
      'Performance Trends:',
    ];

    summary.trends.forEach(trend => {
      const arrow = trend.trend === 'improving' ? '↑' : trend.trend === 'degrading' ? '↓' : '→';
      lines.push(
        `  ${trend.metric}: ${arrow} ${trend.changePercent >= 0 ? '+' : ''}${trend.changePercent.toFixed(1)}% (${trend.trend})`
      );
    });

    lines.push('');
    lines.push('Health Check:');
    lines.push(`  Score: ${summary.healthCheck.score}/100 (${summary.healthCheck.healthy ? 'HEALTHY' : 'UNHEALTHY'})`);
    lines.push(`  Responsive: ${summary.healthCheck.checks.responsive ? '✓' : '✗'}`);
    lines.push(`  Low Errors: ${summary.healthCheck.checks.lowErrorRate ? '✓' : '✗'}`);
    lines.push(`  Normal Memory: ${summary.healthCheck.checks.normalMemory ? '✓' : '✗'}`);
    lines.push(`  Normal CPU: ${summary.healthCheck.checks.normalCpu ? '✓' : '✗'}`);

    if (summary.healthCheck.issues.length > 0) {
      lines.push('');
      lines.push('Issues:');
      summary.healthCheck.issues.forEach(issue => {
        lines.push(`  - ${issue}`);
      });
    }

    lines.push('='.repeat(80));

    return lines.join('\n');
  }

  /**
   * Export performance data to file
   */
  exportData(botId: string): string {
    const snapshots = this.snapshots.get(botId) || [];
    const healthChecks = this.healthChecks.get(botId) || [];
    const recoveryActions = this.recoveryActions.get(botId) || [];

    const data = {
      botId,
      snapshots,
      healthChecks,
      recoveryActions,
      summary: this.getPerformanceSummary(botId),
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(this.dataDir, `performance-${botId}-${timestamp}.json`);

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));

    console.log(`[PerformanceMonitor] Data exported: ${filename}`);
    return filename;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate percentile value
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Calculate average
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get all monitored bot IDs
   */
  getAllBotIds(): string[] {
    return Array.from(this.snapshots.keys());
  }

  /**
   * Clear data for a bot
   */
  clearBotData(botId: string): void {
    this.snapshots.delete(botId);
    this.healthChecks.delete(botId);
    this.recoveryActions.delete(botId);
    this.responseTimings.delete(botId);
    this.errorCounts.delete(botId);
    this.consecutiveErrorCounts.delete(botId);
  }

  /**
   * Reset all data
   */
  reset(): void {
    this.snapshots.clear();
    this.healthChecks.clear();
    this.recoveryActions.clear();
    this.responseTimings.clear();
    this.errorCounts.clear();
    this.consecutiveErrorCounts.clear();
    this.alerts = [];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PerformanceMonitor;
