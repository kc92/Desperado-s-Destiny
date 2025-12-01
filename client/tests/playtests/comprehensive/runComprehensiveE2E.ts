/**
 * COMPREHENSIVE E2E TEST RUNNER
 * Runs all UI-based tests for locations and actions
 */

import { AllLocationsE2EBot } from './AllLocationsE2E.js';
import { AllActionsE2EBot } from './AllActionsE2E.js';
import { BotLogger } from '../utils/BotLogger.js';

const logger = new BotLogger('ComprehensiveE2E');

interface TestConfig {
  baseUrl: string;
  headless: boolean;
  slowMo: number;
  username: string;
  email: string;
  password: string;
  characterName: string;
}

/**
 * Main test runner
 */
async function runComprehensiveE2ETests() {
  const startTime = Date.now();

  logger.info('\n');
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info('🎮 DESPERADOS DESTINY - COMPREHENSIVE E2E TEST SUITE');
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info(`Started: ${new Date().toLocaleString()}\n`);

  // Configuration - Use the max-level test character
  const config: TestConfig = {
    baseUrl: process.env.BASE_URL || 'http://localhost:3001',
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOW_MO || '50'),
    username: process.env.TEST_USERNAME || 'QuickDrawMcGraw',
    email: process.env.TEST_EMAIL || 'test@example.com',  // Quick Draw McGraw's account
    password: process.env.TEST_PASSWORD || 'password123',
    characterName: process.env.TEST_CHARACTER || 'Quick Draw McGraw',
  };

  logger.info('Test Configuration:');
  logger.info(`  Base URL: ${config.baseUrl}`);
  logger.info(`  Headless: ${config.headless}`);
  logger.info(`  Test User: ${config.email}`);
  logger.info(`  Character: ${config.characterName}\n`);

  const results = {
    locations: { total: 0, passed: 0, failed: 0, duration: 0 },
    actions: { total: 0, passed: 0, failed: 0, duration: 0 },
  };

  try {
    // PHASE 1: Test all locations
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('PHASE 1: Testing All Locations');
    logger.info('═══════════════════════════════════════════════════════════\n');

    const locationsStart = Date.now();

    const locationBot = new AllLocationsE2EBot({
      name: 'LocationTester',
      username: config.username,
      email: config.email,
      password: config.password,
      characterName: config.characterName,
      baseUrl: config.baseUrl,
      headless: config.headless,
      slowMo: config.slowMo,
    });

    await locationBot.runTests();

    results.locations.duration = Date.now() - locationsStart;
    logger.info(`Phase 1 completed in ${(results.locations.duration / 1000).toFixed(2)}s\n`);

  } catch (error: any) {
    logger.error(`Location tests failed: ${error.message}`);
    results.locations.failed = 1;
  }

  try {
    // PHASE 2: Test all actions
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('PHASE 2: Testing All Actions');
    logger.info('═══════════════════════════════════════════════════════════\n');

    const actionsStart = Date.now();

    const actionBot = new AllActionsE2EBot({
      name: 'ActionTester',
      username: config.username,
      email: config.email,
      password: config.password,
      characterName: config.characterName,
      baseUrl: config.baseUrl,
      headless: config.headless,
      slowMo: config.slowMo,
    });

    await actionBot.runTests();

    results.actions.duration = Date.now() - actionsStart;
    logger.info(`Phase 2 completed in ${(results.actions.duration / 1000).toFixed(2)}s\n`);

  } catch (error: any) {
    logger.error(`Action tests failed: ${error.message}`);
    results.actions.failed = 1;
  }

  // FINAL REPORT
  const totalDuration = Date.now() - startTime;

  logger.info('\n');
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info('📊 COMPREHENSIVE E2E TEST REPORT');
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info(`Completed: ${new Date().toLocaleString()}`);
  logger.info(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n`);

  logger.info('Test Summary:');
  logger.info('─────────────────────────────────────────────────────────');
  logger.info(`Locations Test: ${results.locations.failed === 0 ? '✅ PASS' : '❌ FAIL'} (${(results.locations.duration / 1000).toFixed(2)}s)`);
  logger.info(`Actions Test:   ${results.actions.failed === 0 ? '✅ PASS' : '❌ FAIL'} (${(results.actions.duration / 1000).toFixed(2)}s)\n`);

  const totalFailed = results.locations.failed + results.actions.failed;

  if (totalFailed === 0) {
    logger.info('🎉 ALL COMPREHENSIVE E2E TESTS PASSED!');
  } else {
    logger.info(`⚠️  ${totalFailed} test phase(s) failed`);
  }

  logger.info('\n═══════════════════════════════════════════════════════════\n');

  // Exit with appropriate code
  process.exit(totalFailed === 0 ? 0 : 1);
}

// Run tests
runComprehensiveE2ETests().catch((error) => {
  logger.error(`Fatal error: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});
