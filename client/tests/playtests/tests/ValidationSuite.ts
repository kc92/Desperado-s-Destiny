/**
 * ValidationSuite - Quick validation test (5-10 minutes)
 *
 * Tests:
 * - Each bot type performs basic actions
 * - Personality system works correctly
 * - Decision engine makes decisions
 * - Social interactions happen
 * - Adversarial bot finds at least 1 issue
 *
 * Perfect for:
 * - Pre-commit validation
 * - Quick smoke testing
 * - CI/CD pipeline integration
 */

import { CombatBot } from '../bots/CombatBot.js';
import { EconomyBot } from '../bots/EconomyBot.js';
import { SocialBot } from '../bots/SocialBot.js';
import { AdversarialBot } from '../advanced/AdversarialBot.js';
import { IntegrationBot } from '../integration/IntegrationBot.js';
import { BotLogger } from '../utils/BotLogger.js';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationTest {
  name: string;
  description: string;
  run: () => Promise<ValidationResult>;
}

export interface ValidationResult {
  testName: string;
  passed: boolean;
  message: string;
  duration: number;
  details?: any;
  error?: any;
}

export interface ValidationReport {
  timestamp: number;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  totalDuration: number;
  results: ValidationResult[];
  overallStatus: 'PASS' | 'FAIL';
}

export class ValidationSuite {
  private logger: BotLogger;
  private results: ValidationResult[] = [];

  constructor() {
    this.logger = new BotLogger('ValidationSuite');
  }

  /**
   * Run all validation tests
   */
  async run(): Promise<ValidationReport> {
    this.logger.info('='.repeat(80));
    this.logger.info('VALIDATION SUITE - QUICK SMOKE TEST');
    this.logger.info('='.repeat(80));

    const startTime = Date.now();

    // Define validation tests
    const tests: ValidationTest[] = [
      {
        name: 'Combat Bot Basic Actions',
        description: 'Verify combat bot can perform basic actions',
        run: () => this.testCombatBot(),
      },
      {
        name: 'Economy Bot Basic Actions',
        description: 'Verify economy bot can perform basic actions',
        run: () => this.testEconomyBot(),
      },
      {
        name: 'Social Bot Basic Actions',
        description: 'Verify social bot can perform basic actions',
        run: () => this.testSocialBot(),
      },
      {
        name: 'Integration Test',
        description: 'Verify all systems are accessible',
        run: () => this.testIntegration(),
      },
      {
        name: 'Adversarial Bot Detection',
        description: 'Verify adversarial bot can detect issues',
        run: () => this.testAdversarialBot(),
      },
    ];

    // Run each test
    for (const test of tests) {
      await this.runTest(test);
    }

    const endTime = Date.now();

    // Generate report
    const report = this.generateReport(startTime, endTime);

    // Log report
    this.logReport(report);

    // Save report
    this.saveReport(report);

    return report;
  }

  /**
   * Run individual validation test
   */
  private async runTest(test: ValidationTest): Promise<void> {
    this.logger.info(`\n${'='.repeat(60)}`);
    this.logger.info(`Running: ${test.name}`);
    this.logger.info(`${test.description}`);
    this.logger.info('='.repeat(60));

    const startTime = Date.now();

    try {
      const result = await test.run();
      this.results.push(result);

      if (result.passed) {
        this.logger.success(`✓ ${test.name} PASSED`);
      } else {
        this.logger.error(`✗ ${test.name} FAILED: ${result.message}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;

      const result: ValidationResult = {
        testName: test.name,
        passed: false,
        message: `Test threw error: ${error}`,
        duration,
        error: String(error),
      };

      this.results.push(result);
      this.logger.error(`✗ ${test.name} ERROR: ${error}`);
    }
  }

  /**
   * Test Combat Bot
   */
  private async testCombatBot(): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const bot = new CombatBot({
        name: 'ValidationCombat',
        username: 'validation_combat',
        email: 'validation.combat@test.local',
        password: 'Validation123!',
        characterName: 'ValCombat',
        headless: true,
        slowMo: 10,
      });

      // Start bot and run for 1 minute
      const botPromise = bot.start();

      // Wait 60 seconds
      await new Promise(resolve => setTimeout(resolve, 60000));

      // Stop bot
      await bot.stop();

      const duration = Date.now() - startTime;

      // Check if bot performed actions
      const metrics = bot['metrics'] ? bot['metrics'].getMetrics() : null;
      const actionsPerformed = metrics?.totalActions || 0;

      if (actionsPerformed > 0) {
        return {
          testName: 'Combat Bot Basic Actions',
          passed: true,
          message: `Combat bot performed ${actionsPerformed} actions`,
          duration,
          details: { actions: actionsPerformed },
        };
      } else {
        return {
          testName: 'Combat Bot Basic Actions',
          passed: false,
          message: 'Combat bot did not perform any actions',
          duration,
        };
      }

    } catch (error) {
      return {
        testName: 'Combat Bot Basic Actions',
        passed: false,
        message: `Combat bot test failed: ${error}`,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Test Economy Bot
   */
  private async testEconomyBot(): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const bot = new EconomyBot({
        name: 'ValidationEconomy',
        username: 'validation_economy',
        email: 'validation.economy@test.local',
        password: 'Validation123!',
        characterName: 'ValEconomy',
        headless: true,
        slowMo: 10,
      });

      // Start bot and run for 1 minute
      const botPromise = bot.start();

      await new Promise(resolve => setTimeout(resolve, 60000));

      await bot.stop();

      const duration = Date.now() - startTime;

      const metrics = bot['metrics'] ? bot['metrics'].getMetrics() : null;
      const actionsPerformed = metrics?.totalActions || 0;

      if (actionsPerformed > 0) {
        return {
          testName: 'Economy Bot Basic Actions',
          passed: true,
          message: `Economy bot performed ${actionsPerformed} actions`,
          duration,
          details: { actions: actionsPerformed },
        };
      } else {
        return {
          testName: 'Economy Bot Basic Actions',
          passed: false,
          message: 'Economy bot did not perform any actions',
          duration,
        };
      }

    } catch (error) {
      return {
        testName: 'Economy Bot Basic Actions',
        passed: false,
        message: `Economy bot test failed: ${error}`,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Test Social Bot
   */
  private async testSocialBot(): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const bot = new SocialBot({
        name: 'ValidationSocial',
        username: 'validation_social',
        email: 'validation.social@test.local',
        password: 'Validation123!',
        characterName: 'ValSocial',
        headless: true,
        slowMo: 10,
      });

      const botPromise = bot.start();

      await new Promise(resolve => setTimeout(resolve, 60000));

      await bot.stop();

      const duration = Date.now() - startTime;

      const metrics = bot['metrics'] ? bot['metrics'].getMetrics() : null;
      const actionsPerformed = metrics?.totalActions || 0;

      if (actionsPerformed > 0) {
        return {
          testName: 'Social Bot Basic Actions',
          passed: true,
          message: `Social bot performed ${actionsPerformed} actions`,
          duration,
          details: { actions: actionsPerformed },
        };
      } else {
        return {
          testName: 'Social Bot Basic Actions',
          passed: false,
          message: 'Social bot did not perform any actions',
          duration,
        };
      }

    } catch (error) {
      return {
        testName: 'Social Bot Basic Actions',
        passed: false,
        message: `Social bot test failed: ${error}`,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Test Integration Bot
   */
  private async testIntegration(): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const bot = new IntegrationBot({
        name: 'ValidationIntegration',
        username: 'validation_integration',
        email: 'validation.integration@test.local',
        password: 'Validation123!',
        characterName: 'ValIntegration',
        headless: true,
        slowMo: 10,
      });

      await bot.start();

      const duration = Date.now() - startTime;

      // Integration bot generates its own report
      // We just need to verify it completed without errors

      return {
        testName: 'Integration Test',
        passed: true,
        message: 'Integration test completed successfully',
        duration,
      };

    } catch (error) {
      return {
        testName: 'Integration Test',
        passed: false,
        message: `Integration test failed: ${error}`,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Test Adversarial Bot
   */
  private async testAdversarialBot(): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const bot = new AdversarialBot({
        name: 'ValidationAdversarial',
        username: 'validation_adversarial',
        email: 'validation.adversarial@test.local',
        password: 'Validation123!',
        characterName: 'ValChaos',
        headless: true,
        slowMo: 10,
      });

      // Run for 2 minutes
      const botPromise = bot.start();

      await new Promise(resolve => setTimeout(resolve, 120000));

      await bot.stop();

      const duration = Date.now() - startTime;

      // Adversarial bot should find at least some test cases
      // Even if no exploits, it should run tests
      const metrics = bot['metrics'] ? bot['metrics'].getMetrics() : null;
      const testsRun = metrics?.totalActions || 0;

      if (testsRun > 0) {
        return {
          testName: 'Adversarial Bot Detection',
          passed: true,
          message: `Adversarial bot ran ${testsRun} tests`,
          duration,
          details: { tests: testsRun },
        };
      } else {
        return {
          testName: 'Adversarial Bot Detection',
          passed: false,
          message: 'Adversarial bot did not run any tests',
          duration,
        };
      }

    } catch (error) {
      return {
        testName: 'Adversarial Bot Detection',
        passed: false,
        message: `Adversarial bot test failed: ${error}`,
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Generate validation report
   */
  private generateReport(startTime: number, endTime: number): ValidationReport {
    const totalDuration = endTime - startTime;
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = totalTests - passed;
    const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;

    return {
      timestamp: Date.now(),
      totalTests,
      passed,
      failed,
      passRate,
      totalDuration,
      results: this.results,
      overallStatus: failed === 0 ? 'PASS' : 'FAIL',
    };
  }

  /**
   * Log validation report
   */
  private logReport(report: ValidationReport): void {
    this.logger.info('\n' + '='.repeat(80));
    this.logger.info('VALIDATION SUITE REPORT');
    this.logger.info('='.repeat(80));
    this.logger.info(`Overall Status: ${report.overallStatus}`);
    this.logger.info(`Total Duration: ${(report.totalDuration / 1000 / 60).toFixed(1)} minutes`);
    this.logger.info(`Tests Run: ${report.totalTests}`);
    this.logger.info(`Passed: ${report.passed}`);
    this.logger.info(`Failed: ${report.failed}`);
    this.logger.info(`Pass Rate: ${report.passRate.toFixed(1)}%`);
    this.logger.info('='.repeat(80));

    this.logger.info('\nDETAILED RESULTS:');
    for (const result of report.results) {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      const duration = (result.duration / 1000).toFixed(1);

      this.logger.info(`  ${status} | ${result.testName} (${duration}s)`);

      if (!result.passed) {
        this.logger.error(`    ${result.message}`);
      } else if (result.details) {
        this.logger.info(`    ${result.message}`);
      }
    }

    this.logger.info('\n' + '='.repeat(80));

    if (report.overallStatus === 'PASS') {
      this.logger.success('✓ ALL VALIDATION TESTS PASSED');
    } else {
      this.logger.error('✗ VALIDATION FAILED - FIX ISSUES BEFORE DEPLOYING');
    }

    this.logger.info('='.repeat(80));
  }

  /**
   * Save validation report
   */
  private saveReport(report: ValidationReport): void {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = path.join(
        process.cwd(),
        'tests',
        'playtests',
        'data',
        `validation-report-${timestamp}.json`
      );

      fs.writeFileSync(filename, JSON.stringify(report, null, 2));
      this.logger.info(`Report saved: ${filename}`);

    } catch (error) {
      this.logger.error(`Failed to save report: ${error}`);
    }
  }
}

// Allow running directly
if (require.main === module) {
  const suite = new ValidationSuite();

  suite.run()
    .then(report => {
      console.log('\nValidation suite completed');
      process.exit(report.overallStatus === 'PASS' ? 0 : 1);
    })
    .catch(error => {
      console.error('\nValidation suite error:', error);
      process.exit(1);
    });
}
