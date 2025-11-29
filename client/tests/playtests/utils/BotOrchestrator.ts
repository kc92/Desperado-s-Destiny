/**
 * BotOrchestrator - Master control system for managing multiple bots
 *
 * Features:
 * - Start/stop/restart individual bots
 * - Load balancing (stagger bot starts)
 * - Resource management (limit concurrent bots)
 * - Centralized logging aggregation
 * - Health monitoring integration
 * - Error recovery management
 * - Status API for external monitoring
 */

import { BotLogger } from './BotLogger.js';
import { HealthCheck } from './HealthCheck.js';
import { ErrorRecovery } from './ErrorRecovery.js';
import * as fs from 'fs';
import * as path from 'path';

export interface BotConfig {
  name: string;
  username: string;
  email: string;
  password: string;
  characterName: string;
  botClass: any;
  headless?: boolean;
  slowMo?: number;
  autoRestart?: boolean;
}

export interface OrchestratorConfig {
  maxConcurrentBots: number;
  startStaggerDelay: number;
  healthCheckInterval: number;
  autoRestartOnFailure: boolean;
  logAggregationEnabled: boolean;
}

export interface BotStatus {
  name: string;
  state: 'STOPPED' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'CRASHED' | 'RESTARTING';
  uptime: number;
  restartCount: number;
  healthStatus?: string;
  lastError?: string;
  metrics?: {
    actions: number;
    errors: number;
    memoryMB: number;
  };
}

export interface OrchestratorStatus {
  totalBots: number;
  runningBots: number;
  stoppedBots: number;
  crashedBots: number;
  uptime: number;
  bots: BotStatus[];
}

interface ManagedBot {
  name: string;
  config: BotConfig;
  instance: any;
  healthCheck: HealthCheck;
  errorRecovery: ErrorRecovery;
  state: BotStatus['state'];
  startTime: number;
  restartCount: number;
  lastError?: string;
}

export class BotOrchestrator {
  private config: OrchestratorConfig;
  private logger: BotLogger;
  private bots: Map<string, ManagedBot>;
  private startTime: number;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      maxConcurrentBots: 10,
      startStaggerDelay: 5000, // 5 seconds between bot starts
      healthCheckInterval: 60000, // Check health every minute
      autoRestartOnFailure: true,
      logAggregationEnabled: true,
      ...config,
    };

    this.logger = new BotLogger('BotOrchestrator');
    this.bots = new Map();
    this.startTime = Date.now();

    this.logger.info('BotOrchestrator initialized');
  }

  /**
   * Register a bot with the orchestrator
   */
  registerBot(config: BotConfig): void {
    if (this.bots.has(config.name)) {
      this.logger.warn(`Bot ${config.name} already registered, skipping`);
      return;
    }

    this.logger.info(`Registering bot: ${config.name}`);

    const botInstance = new config.botClass({
      name: config.name,
      username: config.username,
      email: config.email,
      password: config.password,
      characterName: config.characterName,
      headless: config.headless ?? false,
      slowMo: config.slowMo ?? 30,
    });

    const healthCheck = new HealthCheck(config.name, {
      checkInterval: 30000,
      activityTimeout: 300000,
      autoRestart: config.autoRestart ?? this.config.autoRestartOnFailure,
    });

    const errorRecovery = new ErrorRecovery(config.name, {
      maxRetries: 3,
      circuitBreakerThreshold: 5,
    });

    // Set up auto-restart on critical health
    healthCheck.setUnhealthyCallback(async (status) => {
      if (status.status === 'CRITICAL' && this.config.autoRestartOnFailure) {
        this.logger.error(`Bot ${config.name} is CRITICAL, auto-restarting...`);
        await this.restartBot(config.name);
      }
    });

    const managedBot: ManagedBot = {
      name: config.name,
      config,
      instance: botInstance,
      healthCheck,
      errorRecovery,
      state: 'STOPPED',
      startTime: 0,
      restartCount: 0,
    };

    this.bots.set(config.name, managedBot);
    this.logger.success(`Bot ${config.name} registered successfully`);
  }

  /**
   * Start a specific bot
   */
  async startBot(botName: string): Promise<boolean> {
    const bot = this.bots.get(botName);
    if (!bot) {
      this.logger.error(`Bot ${botName} not found`);
      return false;
    }

    if (bot.state === 'RUNNING' || bot.state === 'STARTING') {
      this.logger.warn(`Bot ${botName} is already ${bot.state}`);
      return false;
    }

    // Check concurrent bot limit
    const runningBots = Array.from(this.bots.values()).filter(
      b => b.state === 'RUNNING' || b.state === 'STARTING'
    ).length;

    if (runningBots >= this.config.maxConcurrentBots) {
      this.logger.error(
        `Cannot start ${botName}: concurrent bot limit reached (${this.config.maxConcurrentBots})`
      );
      return false;
    }

    try {
      this.logger.info(`Starting bot: ${botName}`);
      bot.state = 'STARTING';
      bot.startTime = Date.now();

      // Start bot (don't await - let it run in background)
      bot.instance.start().catch((error: any) => {
        this.logger.error(`Bot ${botName} crashed: ${error}`);
        bot.state = 'CRASHED';
        bot.lastError = String(error);

        // Auto-restart if enabled
        if (this.config.autoRestartOnFailure) {
          setTimeout(() => this.restartBot(botName), 10000);
        }
      });

      // Give bot time to initialize
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Set up health monitoring
      if (bot.instance.page && bot.instance.browser) {
        bot.healthCheck.setBrowser(bot.instance.browser, bot.instance.page);
      }

      bot.healthCheck.startMonitoring();

      bot.state = 'RUNNING';
      this.logger.success(`Bot ${botName} started successfully`);

      return true;

    } catch (error) {
      this.logger.error(`Failed to start bot ${botName}: ${error}`);
      bot.state = 'CRASHED';
      bot.lastError = String(error);
      return false;
    }
  }

  /**
   * Stop a specific bot
   */
  async stopBot(botName: string): Promise<boolean> {
    const bot = this.bots.get(botName);
    if (!bot) {
      this.logger.error(`Bot ${botName} not found`);
      return false;
    }

    if (bot.state === 'STOPPED' || bot.state === 'STOPPING') {
      this.logger.warn(`Bot ${botName} is already ${bot.state}`);
      return false;
    }

    try {
      this.logger.info(`Stopping bot: ${botName}`);
      bot.state = 'STOPPING';

      bot.healthCheck.stopMonitoring();

      if (bot.instance && bot.instance.stop) {
        await bot.instance.stop();
      }

      bot.state = 'STOPPED';
      this.logger.success(`Bot ${botName} stopped successfully`);

      return true;

    } catch (error) {
      this.logger.error(`Failed to stop bot ${botName}: ${error}`);
      bot.state = 'CRASHED';
      bot.lastError = String(error);
      return false;
    }
  }

  /**
   * Restart a specific bot
   */
  async restartBot(botName: string): Promise<boolean> {
    const bot = this.bots.get(botName);
    if (!bot) {
      this.logger.error(`Bot ${botName} not found`);
      return false;
    }

    this.logger.info(`Restarting bot: ${botName}`);
    bot.state = 'RESTARTING';
    bot.restartCount++;

    // Stop the bot
    await this.stopBot(botName);

    // Wait before restart
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Start the bot
    const success = await this.startBot(botName);

    if (success) {
      bot.healthCheck.recordRestart();
      this.logger.success(`Bot ${botName} restarted (count: ${bot.restartCount})`);
    }

    return success;
  }

  /**
   * Start all registered bots with staggered timing
   */
  async startAll(): Promise<void> {
    this.logger.info(`Starting all bots (${this.bots.size} total)`);
    this.isRunning = true;

    const botNames = Array.from(this.bots.keys());

    for (const botName of botNames) {
      await this.startBot(botName);

      // Stagger starts to avoid overwhelming the system
      if (this.config.startStaggerDelay > 0) {
        this.logger.info(`Waiting ${this.config.startStaggerDelay}ms before next bot...`);
        await new Promise(resolve => setTimeout(resolve, this.config.startStaggerDelay));
      }
    }

    // Start health monitoring
    this.startHealthMonitoring();

    this.logger.success('All bots started');
  }

  /**
   * Stop all running bots
   */
  async stopAll(): Promise<void> {
    this.logger.info('Stopping all bots...');
    this.isRunning = false;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    const botNames = Array.from(this.bots.keys());

    for (const botName of botNames) {
      const bot = this.bots.get(botName);
      if (bot && (bot.state === 'RUNNING' || bot.state === 'STARTING')) {
        await this.stopBot(botName);
      }
    }

    this.logger.success('All bots stopped');
  }

  /**
   * Start health monitoring for all bots
   */
  private startHealthMonitoring(): void {
    this.logger.info('Starting health monitoring...');

    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllBotsHealth();
    }, this.config.healthCheckInterval);
  }

  /**
   * Check health of all bots
   */
  private async checkAllBotsHealth(): Promise<void> {
    for (const [botName, bot] of this.bots.entries()) {
      if (bot.state !== 'RUNNING') continue;

      try {
        const needsRestart = bot.healthCheck.needsRestart();

        if (needsRestart && this.config.autoRestartOnFailure) {
          this.logger.warn(`Bot ${botName} health check failed, restarting...`);
          await this.restartBot(botName);
        }

      } catch (error) {
        this.logger.error(`Health check failed for ${botName}: ${error}`);
      }
    }
  }

  /**
   * Get status of a specific bot
   */
  getBotStatus(botName: string): BotStatus | null {
    const bot = this.bots.get(botName);
    if (!bot) return null;

    const uptime = bot.state === 'RUNNING' ? Date.now() - bot.startTime : 0;

    const healthSummary = bot.healthCheck.getHealthSummary();

    return {
      name: bot.name,
      state: bot.state,
      uptime,
      restartCount: bot.restartCount,
      healthStatus: healthSummary.averageStatus,
      lastError: bot.lastError,
    };
  }

  /**
   * Get orchestrator status
   */
  getStatus(): OrchestratorStatus {
    const botStatuses: BotStatus[] = [];
    let runningBots = 0;
    let stoppedBots = 0;
    let crashedBots = 0;

    for (const [botName, bot] of this.bots.entries()) {
      const status = this.getBotStatus(botName);
      if (status) {
        botStatuses.push(status);

        switch (status.state) {
          case 'RUNNING':
          case 'STARTING':
            runningBots++;
            break;
          case 'STOPPED':
          case 'STOPPING':
            stoppedBots++;
            break;
          case 'CRASHED':
            crashedBots++;
            break;
        }
      }
    }

    return {
      totalBots: this.bots.size,
      runningBots,
      stoppedBots,
      crashedBots,
      uptime: Date.now() - this.startTime,
      bots: botStatuses,
    };
  }

  /**
   * Log orchestrator status
   */
  logStatus(): void {
    const status = this.getStatus();

    this.logger.info('\n' + '='.repeat(60));
    this.logger.info('BOT ORCHESTRATOR STATUS');
    this.logger.info('='.repeat(60));
    this.logger.info(`Total Bots: ${status.totalBots}`);
    this.logger.info(`Running: ${status.runningBots}`);
    this.logger.info(`Stopped: ${status.stoppedBots}`);
    this.logger.info(`Crashed: ${status.crashedBots}`);
    this.logger.info(`Uptime: ${(status.uptime / 1000 / 60).toFixed(1)} minutes`);
    this.logger.info('='.repeat(60));

    for (const bot of status.bots) {
      const statusIcon = {
        RUNNING: '✓',
        STARTING: '⟳',
        STOPPING: '⟳',
        STOPPED: '○',
        CRASHED: '✗',
        RESTARTING: '⟳',
      }[bot.state];

      this.logger.info(
        `${statusIcon} ${bot.name}: ${bot.state} ` +
        `(uptime: ${(bot.uptime / 1000 / 60).toFixed(1)}m, restarts: ${bot.restartCount})`
      );

      if (bot.lastError) {
        this.logger.warn(`  Last error: ${bot.lastError}`);
      }
    }

    this.logger.info('='.repeat(60));
  }

  /**
   * Save status report to file
   */
  saveStatusReport(): void {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = path.join(
        process.cwd(),
        'tests',
        'playtests',
        'data',
        `orchestrator-status-${timestamp}.json`
      );

      const status = this.getStatus();
      fs.writeFileSync(filename, JSON.stringify(status, null, 2));

      this.logger.info(`Status report saved: ${filename}`);

    } catch (error) {
      this.logger.error(`Failed to save status report: ${error}`);
    }
  }

  /**
   * Get list of all registered bot names
   */
  getBotNames(): string[] {
    return Array.from(this.bots.keys());
  }

  /**
   * Check if orchestrator is running
   */
  isOrchestratorRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Initiating graceful shutdown...');

    await this.stopAll();

    // Save final status report
    this.saveStatusReport();

    this.logger.success('Shutdown complete');
  }
}
