/**
 * Playtest Orchestrator - Production-Ready Edition
 * Runs multiple bots simultaneously with comprehensive error handling,
 * health monitoring, and automatic recovery
 *
 * Usage:
 *   npm run playtest               - Run all 3 bots with full monitoring
 *   npm run playtest:combat        - Run only combat bot
 *   npm run playtest:economy       - Run only economy bot
 *   npm run playtest:social        - Run only social bot
 *   npm run playtest:validation    - Run quick validation suite
 *   npm run playtest:integration   - Run integration test
 *   npm run playtest:24hour        - Run 24-hour stability test
 */

import { CombatBot } from './bots/CombatBot.js';
import { EconomyBot } from './bots/EconomyBot.js';
import { SocialBot } from './bots/SocialBot.js';
import { BotOrchestrator } from './utils/BotOrchestrator.js';
import { BotLogger } from './utils/BotLogger.js';

// Bot configurations
const botConfigs = {
  combat: {
    name: 'CombatBot-Gunslinger',
    username: 'playtest_combat',
    email: 'combat.bot@playtest.local',
    password: 'TestBot123!',
    characterName: 'GunslingerBot',
    botClass: CombatBot,
    baseUrl: 'http://localhost:3001',
    headless: false,
    slowMo: 30,
    autoRestart: true,
  },
  economy: {
    name: 'EconomyBot-Merchant',
    username: 'playtest_economy',
    email: 'economy.bot@playtest.local',
    password: 'TestBot123!',
    characterName: 'MerchantBot',
    botClass: EconomyBot,
    baseUrl: 'http://localhost:3001',
    headless: false,
    slowMo: 30,
    autoRestart: true,
  },
  social: {
    name: 'SocialBot-Storyteller',
    username: 'playtest_social',
    email: 'social.bot@playtest.local',
    password: 'TestBot123!',
    characterName: 'StorytellerBot',
    botClass: SocialBot,
    baseUrl: 'http://localhost:3001',
    headless: false,
    slowMo: 30,
    autoRestart: true,
  },
};

/**
 * Run all bots with orchestrator
 */
async function runAllBots(): Promise<void> {
  const logger = new BotLogger('MainOrchestrator');

  logger.info('='.repeat(80));
  logger.info('DESPERADOS DESTINY - PRODUCTION PLAYTEST SUITE');
  logger.info('='.repeat(80));
  logger.info('\nStarting all playtest bots with health monitoring...\n');

  // Create orchestrator
  const orchestrator = new BotOrchestrator({
    maxConcurrentBots: 10,
    startStaggerDelay: 5000,
    autoRestartOnFailure: true,
  });

  // Register all bots
  orchestrator.registerBot(botConfigs.combat);
  orchestrator.registerBot(botConfigs.economy);
  orchestrator.registerBot(botConfigs.social);

  // Handle graceful shutdown
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`\n\nReceived ${signal}, shutting down gracefully...\n`);

    try {
      await orchestrator.shutdown();
      logger.success('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error(`Shutdown error: ${error}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Log status periodically
  const statusInterval = setInterval(() => {
    orchestrator.logStatus();
  }, 60000); // Every minute

  try {
    // Start all bots
    await orchestrator.startAll();

    logger.success('\nAll bots running! Press Ctrl+C to stop.\n');

    // Keep process alive
    await new Promise(() => {}); // Wait forever

  } catch (error) {
    logger.error(`\n\nError running bots: ${error}`);

    clearInterval(statusInterval);
    await orchestrator.shutdown();

    process.exit(1);
  }
}

/**
 * Run single bot with monitoring
 */
async function runSingleBot(
  botConfig: typeof botConfigs.combat,
  botType: string
): Promise<void> {
  const logger = new BotLogger(`Single-${botType}`);

  logger.info('='.repeat(80));
  logger.info(`RUNNING: ${botType} Bot (Production Mode)`);
  logger.info('='.repeat(80));

  const orchestrator = new BotOrchestrator({
    maxConcurrentBots: 1,
    autoRestartOnFailure: true,
  });

  orchestrator.registerBot(botConfig);

  // Handle graceful shutdown
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`\n\nShutting down ${botType} Bot...\n`);

    try {
      await orchestrator.shutdown();
      process.exit(0);
    } catch (error) {
      logger.error(`Shutdown error: ${error}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Log status periodically
  const statusInterval = setInterval(() => {
    orchestrator.logStatus();
  }, 60000);

  try {
    await orchestrator.startBot(botConfig.name);

    logger.success(`\n${botType} Bot running! Press Ctrl+C to stop.\n`);

    // Keep process alive
    await new Promise(() => {});

  } catch (error) {
    logger.error(`\n${botType} Bot error: ${error}`);

    clearInterval(statusInterval);
    await orchestrator.shutdown();

    process.exit(1);
  }
}

async function runCombatBot(): Promise<void> {
  await runSingleBot(botConfigs.combat, 'Combat');
}

async function runEconomyBot(): Promise<void> {
  await runSingleBot(botConfigs.economy, 'Economy');
}

async function runSocialBot(): Promise<void> {
  await runSingleBot(botConfigs.social, 'Social');
}

async function runValidation(): Promise<void> {
  const logger = new BotLogger('Validation');

  logger.info('='.repeat(80));
  logger.info('RUNNING: Validation Suite');
  logger.info('='.repeat(80));

  try {
    const { ValidationSuite } = await import('./tests/ValidationSuite.js');
    const suite = new ValidationSuite();

    const report = await suite.run();

    if (report.overallStatus === 'PASS') {
      logger.success('\n✓ Validation PASSED\n');
      process.exit(0);
    } else {
      logger.error('\n✗ Validation FAILED\n');
      process.exit(1);
    }

  } catch (error) {
    logger.error(`\nValidation error: ${error}`);
    process.exit(1);
  }
}

async function runIntegration(): Promise<void> {
  const logger = new BotLogger('Integration');

  logger.info('='.repeat(80));
  logger.info('RUNNING: Integration Test');
  logger.info('='.repeat(80));

  try {
    const { IntegrationBot } = await import('./integration/IntegrationBot.js');

    const bot = new IntegrationBot({
      name: 'IntegrationTest',
      username: 'integration_test',
      email: 'integration@test.local',
      password: 'Integration123!',
      characterName: 'IntegrationBot',
      baseUrl: 'http://localhost:3001',
      headless: true,
      slowMo: 10,
    });

    await bot.start();

    logger.success('\n✓ Integration test completed\n');
    process.exit(0);

  } catch (error) {
    logger.error(`\nIntegration test error: ${error}`);
    process.exit(1);
  }
}

async function run24HourTest(): Promise<void> {
  const logger = new BotLogger('24HourTest');

  logger.info('='.repeat(80));
  logger.info('RUNNING: 24-Hour Stability Test');
  logger.info('='.repeat(80));

  try {
    const { TwentyFourHourTest } = await import('./tests/24HourTest.js');

    const test = new TwentyFourHourTest(24);

    // Handle graceful shutdown
    let isShuttingDown = false;

    const shutdown = (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.warn(`\nReceived ${signal}, stopping test...\n`);
      test.stop();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    const report = await test.run();

    logger.success('\n✓ 24-hour test completed\n');
    process.exit(0);

  } catch (error) {
    logger.error(`\n24-hour test error: ${error}`);
    process.exit(1);
  }
}

// Main entry point
const command = process.argv[2];

switch (command) {
  case 'combat':
    runCombatBot();
    break;
  case 'economy':
    runEconomyBot();
    break;
  case 'social':
    runSocialBot();
    break;
  case 'validation':
    runValidation();
    break;
  case 'integration':
    runIntegration();
    break;
  case '24hour':
  case '24h':
    run24HourTest();
    break;
  case 'all':
  default:
    runAllBots();
    break;
}
