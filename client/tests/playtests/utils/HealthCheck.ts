/**
 * HealthCheck - Bot health monitoring and auto-restart system
 *
 * Features:
 * - Real-time bot health monitoring
 * - Detect stuck bots (no actions for N minutes)
 * - Detect memory leaks and excessive resource usage
 * - Detect browser crashes
 * - Auto-restart unhealthy bots
 * - Health status API for external monitoring
 * - Performance metrics tracking
 */

import { BotLogger } from './BotLogger.js';
import { Page, Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

export interface HealthCheckConfig {
  checkInterval: number; // How often to check health (ms)
  activityTimeout: number; // Max time without activity (ms)
  memoryThreshold: number; // Max memory usage (MB)
  cpuThreshold: number; // Max CPU usage (%)
  autoRestart: boolean; // Auto-restart on failure
  healthReportDir: string;
}

export interface HealthStatus {
  botName: string;
  isHealthy: boolean;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'CRITICAL';
  checks: {
    activity: HealthCheckResult;
    memory: HealthCheckResult;
    browser: HealthCheckResult;
    responsiveness: HealthCheckResult;
  };
  metrics: {
    uptime: number;
    lastActivity: number;
    memoryUsage: number;
    actionsPerMinute: number;
    errorRate: number;
  };
  timestamp: number;
  restartCount: number;
}

export interface HealthCheckResult {
  passed: boolean;
  message: string;
  severity: 'OK' | 'WARNING' | 'ERROR' | 'CRITICAL';
  details?: any;
}

export class HealthCheck {
  private config: HealthCheckConfig;
  private logger: BotLogger;
  private botName: string;
  private startTime: number;
  private lastActivityTime: number;
  private lastActionCount: number = 0;
  private totalActions: number = 0;
  private errorCount: number = 0;
  private restartCount: number = 0;
  private checkInterval: NodeJS.Timeout | null = null;
  private healthHistory: HealthStatus[] = [];
  private isMonitoring: boolean = false;
  private onUnhealthy?: (status: HealthStatus) => Promise<void>;
  private page: Page | null = null;
  private browser: Browser | null = null;

  constructor(botName: string, config?: Partial<HealthCheckConfig>) {
    this.botName = botName;
    this.config = {
      checkInterval: 30000, // Check every 30 seconds
      activityTimeout: 300000, // 5 minutes without activity = unhealthy
      memoryThreshold: 500, // 500 MB
      cpuThreshold: 80, // 80%
      autoRestart: true,
      healthReportDir: path.join(process.cwd(), 'tests', 'playtests', 'health'),
      ...config,
    };

    this.logger = new BotLogger(`${botName}-HealthCheck`);
    this.startTime = Date.now();
    this.lastActivityTime = Date.now();

    // Ensure health report directory exists
    if (!fs.existsSync(this.config.healthReportDir)) {
      fs.mkdirSync(this.config.healthReportDir, { recursive: true });
    }

    this.logger.info('HealthCheck initialized');
  }

  /**
   * Set browser and page for monitoring
   */
  setBrowser(browser: Browser, page: Page): void {
    this.browser = browser;
    this.page = page;
  }

  /**
   * Set unhealthy callback
   */
  setUnhealthyCallback(callback: (status: HealthStatus) => Promise<void>): void {
    this.onUnhealthy = callback;
  }

  /**
   * Start health monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      this.logger.warn('Health monitoring already started');
      return;
    }

    this.isMonitoring = true;
    this.logger.info(`Starting health monitoring (interval: ${this.config.checkInterval}ms)`);

    this.checkInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.checkInterval);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    this.logger.info('Health monitoring stopped');

    // Save final report
    this.saveHealthReport();
  }

  /**
   * Record bot activity (action performed)
   */
  recordActivity(actionName?: string): void {
    this.lastActivityTime = Date.now();
    this.totalActions++;

    if (actionName) {
      this.logger.debug(`Activity recorded: ${actionName}`);
    }
  }

  /**
   * Record error
   */
  recordError(): void {
    this.errorCount++;
  }

  /**
   * Record restart
   */
  recordRestart(): void {
    this.restartCount++;
    this.lastActivityTime = Date.now();
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<HealthStatus> {
    const now = Date.now();

    // Run all health checks
    const activityCheck = this.checkActivity(now);
    const memoryCheck = await this.checkMemory();
    const browserCheck = await this.checkBrowser();
    const responsivenessCheck = await this.checkResponsiveness();

    // Calculate metrics
    const uptime = now - this.startTime;
    const actionsPerMinute = (this.totalActions / (uptime / 60000)) || 0;
    const errorRate = this.totalActions > 0 ? (this.errorCount / this.totalActions) * 100 : 0;

    // Determine overall health status
    const checks = {
      activity: activityCheck,
      memory: memoryCheck,
      browser: browserCheck,
      responsiveness: responsivenessCheck,
    };

    const status = this.determineOverallStatus(checks);

    const healthStatus: HealthStatus = {
      botName: this.botName,
      isHealthy: status === 'HEALTHY' || status === 'DEGRADED',
      status,
      checks,
      metrics: {
        uptime,
        lastActivity: now - this.lastActivityTime,
        memoryUsage: await this.getMemoryUsage(),
        actionsPerMinute: parseFloat(actionsPerMinute.toFixed(2)),
        errorRate: parseFloat(errorRate.toFixed(2)),
      },
      timestamp: now,
      restartCount: this.restartCount,
    };

    // Log health status
    this.logHealthStatus(healthStatus);

    // Store in history
    this.healthHistory.push(healthStatus);

    // Keep only last 100 checks
    if (this.healthHistory.length > 100) {
      this.healthHistory.shift();
    }

    // Handle unhealthy status
    if (!healthStatus.isHealthy && this.onUnhealthy) {
      this.logger.error('Bot is unhealthy, triggering callback');
      await this.onUnhealthy(healthStatus);
    }

    return healthStatus;
  }

  /**
   * Check if bot is active
   */
  private checkActivity(now: number): HealthCheckResult {
    const timeSinceActivity = now - this.lastActivityTime;

    if (timeSinceActivity > this.config.activityTimeout * 2) {
      return {
        passed: false,
        severity: 'CRITICAL',
        message: `Bot stuck - no activity for ${Math.floor(timeSinceActivity / 60000)} minutes`,
        details: { timeSinceActivity, threshold: this.config.activityTimeout },
      };
    }

    if (timeSinceActivity > this.config.activityTimeout) {
      return {
        passed: false,
        severity: 'ERROR',
        message: `Low activity - ${Math.floor(timeSinceActivity / 60000)} minutes since last action`,
        details: { timeSinceActivity, threshold: this.config.activityTimeout },
      };
    }

    if (timeSinceActivity > this.config.activityTimeout / 2) {
      return {
        passed: true,
        severity: 'WARNING',
        message: `Reduced activity detected`,
        details: { timeSinceActivity },
      };
    }

    return {
      passed: true,
      severity: 'OK',
      message: 'Activity normal',
      details: { timeSinceActivity },
    };
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<HealthCheckResult> {
    const memoryUsage = await this.getMemoryUsage();

    if (memoryUsage > this.config.memoryThreshold * 1.5) {
      return {
        passed: false,
        severity: 'CRITICAL',
        message: `Critical memory usage: ${memoryUsage.toFixed(0)}MB`,
        details: { usage: memoryUsage, threshold: this.config.memoryThreshold },
      };
    }

    if (memoryUsage > this.config.memoryThreshold) {
      return {
        passed: false,
        severity: 'ERROR',
        message: `High memory usage: ${memoryUsage.toFixed(0)}MB`,
        details: { usage: memoryUsage, threshold: this.config.memoryThreshold },
      };
    }

    if (memoryUsage > this.config.memoryThreshold * 0.8) {
      return {
        passed: true,
        severity: 'WARNING',
        message: `Elevated memory usage: ${memoryUsage.toFixed(0)}MB`,
        details: { usage: memoryUsage },
      };
    }

    return {
      passed: true,
      severity: 'OK',
      message: `Memory usage normal: ${memoryUsage.toFixed(0)}MB`,
      details: { usage: memoryUsage },
    };
  }

  /**
   * Check browser health
   */
  private async checkBrowser(): Promise<HealthCheckResult> {
    if (!this.browser || !this.page) {
      return {
        passed: false,
        severity: 'CRITICAL',
        message: 'Browser or page not initialized',
      };
    }

    try {
      // Check if browser is still connected
      const isConnected = this.browser.isConnected();

      if (!isConnected) {
        return {
          passed: false,
          severity: 'CRITICAL',
          message: 'Browser disconnected',
        };
      }

      // Check if page is still responsive
      const pages = await this.browser.pages();
      if (pages.length === 0) {
        return {
          passed: false,
          severity: 'CRITICAL',
          message: 'No active pages',
        };
      }

      return {
        passed: true,
        severity: 'OK',
        message: 'Browser healthy',
        details: { pageCount: pages.length },
      };

    } catch (error) {
      return {
        passed: false,
        severity: 'ERROR',
        message: `Browser check failed: ${error}`,
      };
    }
  }

  /**
   * Check page responsiveness
   */
  private async checkResponsiveness(): Promise<HealthCheckResult> {
    if (!this.page) {
      return {
        passed: false,
        severity: 'ERROR',
        message: 'Page not available for responsiveness check',
      };
    }

    try {
      const startTime = Date.now();

      // Try to evaluate a simple expression
      await Promise.race([
        this.page.evaluate(() => document.title),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        ),
      ]);

      const responseTime = Date.now() - startTime;

      if (responseTime > 3000) {
        return {
          passed: false,
          severity: 'ERROR',
          message: `Page slow to respond: ${responseTime}ms`,
          details: { responseTime },
        };
      }

      if (responseTime > 1000) {
        return {
          passed: true,
          severity: 'WARNING',
          message: `Page response time elevated: ${responseTime}ms`,
          details: { responseTime },
        };
      }

      return {
        passed: true,
        severity: 'OK',
        message: `Page responsive: ${responseTime}ms`,
        details: { responseTime },
      };

    } catch (error) {
      return {
        passed: false,
        severity: 'ERROR',
        message: `Responsiveness check failed: ${error}`,
      };
    }
  }

  /**
   * Get memory usage in MB
   */
  private async getMemoryUsage(): Promise<number> {
    try {
      if (!this.page) return 0;

      const metrics = await this.page.metrics();
      return (metrics.JSHeapUsedSize || 0) / 1024 / 1024;
    } catch (error) {
      this.logger.warn(`Failed to get memory usage: ${error}`);
      return 0;
    }
  }

  /**
   * Determine overall health status
   */
  private determineOverallStatus(checks: HealthStatus['checks']): HealthStatus['status'] {
    const severities = Object.values(checks).map(c => c.severity);

    if (severities.includes('CRITICAL')) {
      return 'CRITICAL';
    }

    if (severities.filter(s => s === 'ERROR').length >= 2) {
      return 'UNHEALTHY';
    }

    if (severities.includes('ERROR')) {
      return 'DEGRADED';
    }

    if (severities.includes('WARNING')) {
      return 'DEGRADED';
    }

    return 'HEALTHY';
  }

  /**
   * Log health status
   */
  private logHealthStatus(status: HealthStatus): void {
    const statusEmoji = {
      HEALTHY: '✓',
      DEGRADED: '⚠',
      UNHEALTHY: '✗',
      CRITICAL: '☠',
    };

    const emoji = statusEmoji[status.status];
    const level = status.isHealthy ? 'info' : 'error';

    this.logger[level](
      `${emoji} Health: ${status.status} | ` +
      `Activity: ${status.checks.activity.severity} | ` +
      `Memory: ${status.metrics.memoryUsage.toFixed(0)}MB | ` +
      `APM: ${status.metrics.actionsPerMinute.toFixed(1)} | ` +
      `Errors: ${status.metrics.errorRate.toFixed(1)}%`
    );

    // Log failed checks
    for (const [checkName, result] of Object.entries(status.checks)) {
      if (!result.passed) {
        this.logger.warn(`  ${checkName}: ${result.message}`);
      }
    }
  }

  /**
   * Save health report
   */
  private saveHealthReport(): void {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = path.join(
        this.config.healthReportDir,
        `${this.botName}-health-${timestamp}.json`
      );

      const report = {
        botName: this.botName,
        reportTime: new Date().toISOString(),
        summary: {
          totalUptime: Date.now() - this.startTime,
          totalActions: this.totalActions,
          totalErrors: this.errorCount,
          restartCount: this.restartCount,
          healthChecks: this.healthHistory.length,
        },
        healthHistory: this.healthHistory,
      };

      fs.writeFileSync(filename, JSON.stringify(report, null, 2));
      this.logger.info(`Health report saved: ${filename}`);

    } catch (error) {
      this.logger.error(`Failed to save health report: ${error}`);
    }
  }

  /**
   * Get current health status
   */
  async getCurrentHealth(): Promise<HealthStatus> {
    return await this.performHealthCheck();
  }

  /**
   * Get health history
   */
  getHealthHistory(): HealthStatus[] {
    return [...this.healthHistory];
  }

  /**
   * Get health summary
   */
  getHealthSummary(): {
    averageStatus: string;
    healthyPercentage: number;
    totalChecks: number;
    criticalIncidents: number;
  } {
    if (this.healthHistory.length === 0) {
      return {
        averageStatus: 'UNKNOWN',
        healthyPercentage: 0,
        totalChecks: 0,
        criticalIncidents: 0,
      };
    }

    const healthyCount = this.healthHistory.filter(h => h.isHealthy).length;
    const criticalCount = this.healthHistory.filter(h => h.status === 'CRITICAL').length;

    return {
      averageStatus: healthyCount > this.healthHistory.length / 2 ? 'MOSTLY_HEALTHY' : 'MOSTLY_UNHEALTHY',
      healthyPercentage: (healthyCount / this.healthHistory.length) * 100,
      totalChecks: this.healthHistory.length,
      criticalIncidents: criticalCount,
    };
  }

  /**
   * Check if bot needs restart
   */
  needsRestart(): boolean {
    if (this.healthHistory.length === 0) {
      return false;
    }

    const lastCheck = this.healthHistory[this.healthHistory.length - 1];

    // Restart if critical
    if (lastCheck.status === 'CRITICAL') {
      this.logger.error('Bot needs restart: CRITICAL status');
      return true;
    }

    // Restart if unhealthy for too long
    const recentChecks = this.healthHistory.slice(-5);
    const unhealthyCount = recentChecks.filter(h => !h.isHealthy).length;

    if (unhealthyCount >= 4) {
      this.logger.error('Bot needs restart: Consistently unhealthy');
      return true;
    }

    return false;
  }
}
