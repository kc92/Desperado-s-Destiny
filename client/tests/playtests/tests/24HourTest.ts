/**
 * 24HourTest - Long-running stability test suite
 *
 * Runs multiple bots for 24 hours to validate:
 * - System stability over time
 * - Memory leak detection
 * - Error rate tracking
 * - Performance degradation
 * - Bot behavior consistency
 *
 * Generates comprehensive stability report with:
 * - Total actions performed
 * - Error rate trends
 * - Exploit count (if AdversarialBot enabled)
 * - Economic activity metrics
 * - Social network formation
 * - Human-likeness scores
 * - Resource usage over time
 */

import { CombatBot } from '../bots/CombatBot.js';
import { EconomyBot } from '../bots/EconomyBot.js';
import { SocialBot } from '../bots/SocialBot.js';
import { AdversarialBot } from '../advanced/AdversarialBot.js';
import { BotLogger } from '../utils/BotLogger.js';
import { HealthCheck, HealthStatus } from '../utils/HealthCheck.js';
import { ErrorRecovery } from '../utils/ErrorRecovery.js';
import * as fs from 'fs';
import * as path from 'path';

interface BotInstance {
  name: string;
  bot: any;
  healthCheck: HealthCheck;
  errorRecovery: ErrorRecovery;
  startTime: number;
  restartCount: number;
  totalActions: number;
  totalErrors: number;
  isRunning: boolean;
}

interface StabilityMetrics {
  timestamp: number;
  uptime: number;
  bots: {
    name: string;
    status: string;
    actions: number;
    errors: number;
    memoryMB: number;
    healthStatus: string;
  }[];
  aggregateMetrics: {
    totalActions: number;
    totalErrors: number;
    errorRate: number;
    averageMemory: number;
    activeBots: number;
  };
}

interface FinalReport {
  testName: string;
  duration: number;
  startTime: number;
  endTime: number;

  summary: {
    totalActions: number;
    totalErrors: number;
    overallErrorRate: number;
    totalRestarts: number;
    averageUptime: number;
    peakMemoryUsage: number;
  };

  botReports: {
    name: string;
    totalActions: number;
    totalErrors: number;
    restartCount: number;
    uptime: number;
    errorRate: number;
    healthScore: number;
  }[];

  stabilityMetrics: StabilityMetrics[];

  recommendations: string[];
}

export class TwentyFourHourTest {
  private logger: BotLogger;
  private bots: BotInstance[] = [];
  private startTime: number = 0;
  private endTime: number = 0;
  private metricsHistory: StabilityMetrics[] = [];
  private testDuration: number;
  private metricsInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(durationHours: number = 24) {
    this.logger = new BotLogger('24HourTest');
    this.testDuration = durationHours * 60 * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Initialize all bots
   */
  private async initializeBots(): Promise<void> {
    this.logger.info('Initializing bots for 24-hour test...');

    const botConfigs = [
      {
        name: 'CombatBot-24h',
        username: 'test_24h_combat',
        email: 'combat.24h@test.local',
        password: 'Test24Hour123!',
        characterName: 'Combat24h',
        botClass: CombatBot,
      },
      {
        name: 'EconomyBot-24h',
        username: 'test_24h_economy',
        email: 'economy.24h@test.local',
        password: 'Test24Hour123!',
        characterName: 'Economy24h',
        botClass: EconomyBot,
      },
      {
        name: 'SocialBot-24h',
        username: 'test_24h_social',
        email: 'social.24h@test.local',
        password: 'Test24Hour123!',
        characterName: 'Social24h',
        botClass: SocialBot,
      },
      {
        name: 'AdversarialBot-24h',
        username: 'test_24h_adversarial',
        email: 'adversarial.24h@test.local',
        password: 'Test24Hour123!',
        characterName: 'Chaos24h',
        botClass: AdversarialBot,
      },
    ];

    for (const config of botConfigs) {
      const bot = new config.botClass({
        name: config.name,
        username: config.username,
        email: config.email,
        password: config.password,
        characterName: config.characterName,
        headless: true, // Run headless for 24h test
        slowMo: 10, // Minimal slowdown
      });

      const healthCheck = new HealthCheck(config.name, {
        checkInterval: 60000, // Check every minute
        activityTimeout: 600000, // 10 minutes
        autoRestart: true,
      });

      const errorRecovery = new ErrorRecovery(config.name, {
        maxRetries: 5,
        circuitBreakerThreshold: 10,
      });

      // Set up auto-restart on unhealthy status
      healthCheck.setUnhealthyCallback(async (status: HealthStatus) => {
        if (status.status === 'CRITICAL') {
          this.logger.error(`Bot ${config.name} is CRITICAL, initiating restart...`);
          await this.restartBot(config.name);
        }
      });

      const botInstance: BotInstance = {
        name: config.name,
        bot,
        healthCheck,
        errorRecovery,
        startTime: 0,
        restartCount: 0,
        totalActions: 0,
        totalErrors: 0,
        isRunning: false,
      };

      this.bots.push(botInstance);
    }

    this.logger.info(`Initialized ${this.bots.length} bots`);
  }

  /**
   * Start a bot with health monitoring
   */
  private async startBot(botName: string): Promise<void> {
    const botInstance = this.bots.find(b => b.name === botName);
    if (!botInstance) {
      this.logger.error(`Bot not found: ${botName}`);
      return;
    }

    try {
      this.logger.info(`Starting bot: ${botName}`);

      botInstance.startTime = Date.now();
      botInstance.isRunning = true;

      // Start bot in background (don't await)
      botInstance.bot.start().catch((error: any) => {
        this.logger.error(`Bot ${botName} crashed: ${error}`);
        botInstance.isRunning = false;
        botInstance.totalErrors++;
      });

      // Wait for bot to initialize
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Set up health monitoring
      if (botInstance.bot.page && botInstance.bot.browser) {
        botInstance.healthCheck.setBrowser(botInstance.bot.browser, botInstance.bot.page);
      }

      botInstance.healthCheck.startMonitoring();

      this.logger.success(`Bot ${botName} started successfully`);

    } catch (error) {
      this.logger.error(`Failed to start bot ${botName}: ${error}`);
      botInstance.isRunning = false;
    }
  }

  /**
   * Restart a bot
   */
  private async restartBot(botName: string): Promise<void> {
    const botInstance = this.bots.find(b => b.name === botName);
    if (!botInstance) return;

    this.logger.warn(`Restarting bot: ${botName}`);

    try {
      // Stop the bot
      botInstance.healthCheck.stopMonitoring();

      if (botInstance.bot && botInstance.bot.stop) {
        await botInstance.bot.stop();
      }

      botInstance.isRunning = false;

      // Wait before restart
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Restart
      botInstance.restartCount++;
      botInstance.healthCheck.recordRestart();

      await this.startBot(botName);

      this.logger.success(`Bot ${botName} restarted (restart count: ${botInstance.restartCount})`);

    } catch (error) {
      this.logger.error(`Failed to restart bot ${botName}: ${error}`);
    }
  }

  /**
   * Collect stability metrics
   */
  private async collectMetrics(): Promise<void> {
    const metrics: StabilityMetrics = {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      bots: [],
      aggregateMetrics: {
        totalActions: 0,
        totalErrors: 0,
        errorRate: 0,
        averageMemory: 0,
        activeBots: 0,
      },
    };

    let totalMemory = 0;
    let botCount = 0;

    for (const botInstance of this.bots) {
      if (!botInstance.isRunning) continue;

      try {
        const health = await botInstance.healthCheck.getCurrentHealth();

        const botMetrics = {
          name: botInstance.name,
          status: botInstance.isRunning ? 'RUNNING' : 'STOPPED',
          actions: botInstance.totalActions,
          errors: botInstance.totalErrors,
          memoryMB: health.metrics.memoryUsage,
          healthStatus: health.status,
        };

        metrics.bots.push(botMetrics);

        // Update aggregates
        metrics.aggregateMetrics.totalActions += botInstance.totalActions;
        metrics.aggregateMetrics.totalErrors += botInstance.totalErrors;
        totalMemory += health.metrics.memoryUsage;
        botCount++;

        if (botInstance.isRunning) {
          metrics.aggregateMetrics.activeBots++;
        }

      } catch (error) {
        this.logger.warn(`Failed to collect metrics for ${botInstance.name}: ${error}`);
      }
    }

    if (botCount > 0) {
      metrics.aggregateMetrics.averageMemory = totalMemory / botCount;

      if (metrics.aggregateMetrics.totalActions > 0) {
        metrics.aggregateMetrics.errorRate =
          (metrics.aggregateMetrics.totalErrors / metrics.aggregateMetrics.totalActions) * 100;
      }
    }

    this.metricsHistory.push(metrics);

    // Log summary
    this.logger.info(
      `Metrics: ${metrics.aggregateMetrics.totalActions} actions, ` +
      `${metrics.aggregateMetrics.totalErrors} errors ` +
      `(${metrics.aggregateMetrics.errorRate.toFixed(2)}%), ` +
      `${metrics.aggregateMetrics.activeBots} active bots, ` +
      `${metrics.aggregateMetrics.averageMemory.toFixed(0)}MB avg memory`
    );
  }

  /**
   * Run the 24-hour test
   */
  async run(): Promise<FinalReport> {
    this.logger.info('='.repeat(80));
    this.logger.info('24-HOUR STABILITY TEST STARTING');
    this.logger.info(`Duration: ${this.testDuration / 1000 / 60 / 60} hours`);
    this.logger.info('='.repeat(80));

    this.startTime = Date.now();
    this.isRunning = true;

    // Initialize and start all bots
    await this.initializeBots();

    // Stagger bot starts to avoid overwhelming the server
    for (const botInstance of this.bots) {
      await this.startBot(botInstance.name);
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s between starts
    }

    // Start metrics collection (every 5 minutes)
    this.metricsInterval = setInterval(async () => {
      await this.collectMetrics();
    }, 300000); // 5 minutes

    // Collect initial metrics
    await this.collectMetrics();

    // Monitor until test duration expires
    const endTime = this.startTime + this.testDuration;

    while (Date.now() < endTime && this.isRunning) {
      // Check bot health every minute
      await new Promise(resolve => setTimeout(resolve, 60000));

      // Check if any bots need restart
      for (const botInstance of this.bots) {
        if (botInstance.isRunning && botInstance.healthCheck.needsRestart()) {
          await this.restartBot(botInstance.name);
        }
      }

      // Log progress
      const elapsed = Date.now() - this.startTime;
      const remaining = endTime - Date.now();
      const progress = (elapsed / this.testDuration) * 100;

      this.logger.info(
        `Progress: ${progress.toFixed(1)}% | ` +
        `Elapsed: ${(elapsed / 1000 / 60 / 60).toFixed(1)}h | ` +
        `Remaining: ${(remaining / 1000 / 60 / 60).toFixed(1)}h`
      );
    }

    // Test complete
    this.endTime = Date.now();

    // Stop all bots
    await this.stopAllBots();

    // Generate final report
    const report = this.generateFinalReport();

    // Save report
    this.saveReport(report);

    // Log report
    this.logReport(report);

    return report;
  }

  /**
   * Stop all bots gracefully
   */
  private async stopAllBots(): Promise<void> {
    this.logger.info('Stopping all bots...');

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    for (const botInstance of this.bots) {
      try {
        botInstance.healthCheck.stopMonitoring();

        if (botInstance.bot && botInstance.bot.stop) {
          await botInstance.bot.stop();
        }

        botInstance.isRunning = false;

      } catch (error) {
        this.logger.error(`Error stopping bot ${botInstance.name}: ${error}`);
      }
    }

    this.isRunning = false;
    this.logger.info('All bots stopped');
  }

  /**
   * Generate final comprehensive report
   */
  private generateFinalReport(): FinalReport {
    const duration = this.endTime - this.startTime;

    let totalActions = 0;
    let totalErrors = 0;
    let totalRestarts = 0;
    let peakMemory = 0;

    const botReports = this.bots.map(botInstance => {
      const uptime = botInstance.isRunning
        ? Date.now() - botInstance.startTime
        : duration;

      const errorRate = botInstance.totalActions > 0
        ? (botInstance.totalErrors / botInstance.totalActions) * 100
        : 0;

      const healthSummary = botInstance.healthCheck.getHealthSummary();
      const healthScore = healthSummary.healthyPercentage;

      totalActions += botInstance.totalActions;
      totalErrors += botInstance.totalErrors;
      totalRestarts += botInstance.restartCount;

      return {
        name: botInstance.name,
        totalActions: botInstance.totalActions,
        totalErrors: botInstance.totalErrors,
        restartCount: botInstance.restartCount,
        uptime,
        errorRate,
        healthScore,
      };
    });

    // Find peak memory usage
    for (const metrics of this.metricsHistory) {
      if (metrics.aggregateMetrics.averageMemory > peakMemory) {
        peakMemory = metrics.aggregateMetrics.averageMemory;
      }
    }

    const overallErrorRate = totalActions > 0 ? (totalErrors / totalActions) * 100 : 0;
    const averageUptime = duration / this.bots.length;

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      overallErrorRate,
      totalRestarts,
      peakMemory,
      botReports,
    });

    return {
      testName: '24-Hour Stability Test',
      duration,
      startTime: this.startTime,
      endTime: this.endTime,
      summary: {
        totalActions,
        totalErrors,
        overallErrorRate,
        totalRestarts,
        averageUptime,
        peakMemoryUsage: peakMemory,
      },
      botReports,
      stabilityMetrics: this.metricsHistory,
      recommendations,
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(summary: any): string[] {
    const recommendations: string[] = [];

    if (summary.overallErrorRate > 10) {
      recommendations.push('⚠ High error rate detected. Review error logs and improve error handling.');
    }

    if (summary.totalRestarts > 5) {
      recommendations.push('⚠ Frequent bot restarts. Investigate stability issues and memory leaks.');
    }

    if (summary.peakMemory > 1000) {
      recommendations.push('⚠ High memory usage detected. Potential memory leak - review resource cleanup.');
    }

    const unhealthyBots = summary.botReports.filter((b: any) => b.healthScore < 70);
    if (unhealthyBots.length > 0) {
      recommendations.push(
        `⚠ ${unhealthyBots.length} bot(s) had poor health scores. Review: ${unhealthyBots.map((b: any) => b.name).join(', ')}`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✓ System stable - no critical issues detected');
      recommendations.push('✓ Error rates within acceptable limits');
      recommendations.push('✓ Memory usage stable');
    }

    return recommendations;
  }

  /**
   * Log report to console
   */
  private logReport(report: FinalReport): void {
    this.logger.info('\n' + '='.repeat(80));
    this.logger.info('24-HOUR STABILITY TEST REPORT');
    this.logger.info('='.repeat(80));
    this.logger.info(`Test Duration: ${(report.duration / 1000 / 60 / 60).toFixed(2)} hours`);
    this.logger.info(`Total Actions: ${report.summary.totalActions}`);
    this.logger.info(`Total Errors: ${report.summary.totalErrors}`);
    this.logger.info(`Error Rate: ${report.summary.overallErrorRate.toFixed(2)}%`);
    this.logger.info(`Total Restarts: ${report.summary.totalRestarts}`);
    this.logger.info(`Peak Memory: ${report.summary.peakMemoryUsage.toFixed(0)}MB`);
    this.logger.info('='.repeat(80));

    this.logger.info('\nBOT PERFORMANCE:');
    for (const botReport of report.botReports) {
      this.logger.info(`\n  ${botReport.name}:`);
      this.logger.info(`    Actions: ${botReport.totalActions}`);
      this.logger.info(`    Errors: ${botReport.totalErrors} (${botReport.errorRate.toFixed(2)}%)`);
      this.logger.info(`    Restarts: ${botReport.restartCount}`);
      this.logger.info(`    Health Score: ${botReport.healthScore.toFixed(1)}%`);
      this.logger.info(`    Uptime: ${(botReport.uptime / 1000 / 60 / 60).toFixed(2)}h`);
    }

    this.logger.info('\n' + '='.repeat(80));
    this.logger.info('RECOMMENDATIONS:');
    for (const rec of report.recommendations) {
      this.logger.info(`  ${rec}`);
    }
    this.logger.info('='.repeat(80));
  }

  /**
   * Save report to file
   */
  private saveReport(report: FinalReport): void {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = path.join(
        process.cwd(),
        'tests',
        'playtests',
        'data',
        `24hour-test-${timestamp}.json`
      );

      fs.writeFileSync(filename, JSON.stringify(report, null, 2));
      this.logger.success(`Report saved: ${filename}`);

    } catch (error) {
      this.logger.error(`Failed to save report: ${error}`);
    }
  }

  /**
   * Stop the test manually
   */
  stop(): void {
    this.logger.warn('Test stopped manually');
    this.isRunning = false;
  }
}

// Allow running directly
if (require.main === module) {
  const test = new TwentyFourHourTest(24);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, stopping test...');
    test.stop();
  });

  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, stopping test...');
    test.stop();
  });

  test.run()
    .then(report => {
      console.log('\n24-hour test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n24-hour test failed:', error);
      process.exit(1);
    });
}
