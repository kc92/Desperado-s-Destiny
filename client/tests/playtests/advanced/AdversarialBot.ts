/**
 * AdversarialBot - Chaos Agent for finding exploits and edge cases
 *
 * This bot deliberately tries to break the game by:
 * - Testing race conditions with rapid-fire duplicate actions
 * - Testing negative values (negative gold, negative items, negative stats)
 * - Testing boundary values (max gold, max items, overflow conditions)
 * - Testing validation bypasses (malformed inputs, injection attempts)
 * - Testing impossible state transitions
 * - Testing concurrent actions (multiple tabs/sessions)
 * - Exploiting timing vulnerabilities
 * - Testing authentication edge cases
 * - Testing rate limiting bypasses
 *
 * All exploits found are logged with detailed reproduction steps.
 */

import { BotBase, BotConfig } from '../utils/BotBase.js';
import { BotLogger } from '../utils/BotLogger.js';
import { Page } from 'puppeteer';

interface ExploitReport {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  description: string;
  reproductionSteps: string[];
  actualBehavior: string;
  expectedBehavior: string;
  timestamp: number;
  evidence: {
    screenshots?: string[];
    logs?: string[];
    networkRequests?: any[];
  };
  impact: string;
  recommendation: string;
}

export class AdversarialBot extends BotBase {
  private exploitsFound: ExploitReport[] = 0;
  private testsRun: number = 0;
  private exploitLogger: BotLogger;
  private exploitReports: ExploitReport[] = [];
  private requestLog: any[] = [];

  constructor(config: BotConfig) {
    super(config);
    this.exploitLogger = new BotLogger(`${config.name}-EXPLOITS`);
  }

  async initialize(): Promise<void> {
    await super.initialize();

    // Set up request interception for exploit detection
    if (this.page) {
      await this.page.setRequestInterception(true);

      this.page.on('request', (request) => {
        // Log all requests for analysis
        this.requestLog.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData(),
          timestamp: Date.now(),
        });

        request.continue();
      });

      this.page.on('response', async (response) => {
        const request = response.request();
        const url = request.url();

        // Log errors and suspicious responses
        if (response.status() >= 400) {
          this.logger.warn(`HTTP ${response.status()} on ${url}`);
        }
      });
    }
  }

  async runBehaviorLoop(): Promise<void> {
    this.exploitLogger.info('=== ADVERSARIAL BOT ACTIVATED - CHAOS MODE ENGAGED ===');
    this.logger.warn('Running in exploit-hunting mode - expect failures!');

    const testSuites = [
      () => this.testRaceConditions(),
      () => this.testNegativeValues(),
      () => this.testBoundaryValues(),
      () => this.testInputValidation(),
      () => this.testStateManipulation(),
      () => this.testAuthenticationExploits(),
      () => this.testRateLimiting(),
      () => this.testConcurrentSessions(),
      () => this.testEnergyExploits(),
      () => this.testGoldExploits(),
      () => this.testInventoryExploits(),
      () => this.testCombatExploits(),
      () => this.testGangExploits(),
      () => this.testAPIEndpointFuzzing(),
      () => this.testClientSideValidationBypass(),
    ];

    // Run all test suites
    for (let i = 0; i < testSuites.length && this.shouldContinue(); i++) {
      const suite = testSuites[i];

      try {
        this.logger.info(`\n${'='.repeat(60)}`);
        this.logger.info(`Running test suite ${i + 1}/${testSuites.length}: ${suite.name}`);
        this.logger.info('='.repeat(60));

        await suite();

        // Wait between test suites to avoid overwhelming the server
        await this.waitRandom(3000, 5000);

      } catch (error) {
        this.logger.error(`Test suite ${suite.name} encountered error: ${error}`);
        this.metrics.recordError();
      }
    }

    // Generate final exploit report
    await this.generateExploitReport();
  }

  /**
   * Test for race conditions by sending rapid duplicate requests
   */
  private async testRaceConditions(): Promise<void> {
    this.logger.action('Testing race conditions');
    this.testsRun++;

    if (!this.page) return;

    try {
      // Test 1: Rapid-fire gold transactions
      this.logger.info('Test: Rapid duplicate gold transactions');

      await this.navigateTo('Shop');
      await this.waitRandom(1000, 2000);

      // Get initial gold
      const initialGold = await this.getGold();
      this.logger.info(`Initial gold: ${initialGold}`);

      // Try to buy the same item multiple times rapidly
      const purchased = await this.page.evaluate(() => {
        const buyButtons = Array.from(document.querySelectorAll('button'))
          .filter(btn => btn.textContent?.includes('Buy'));

        if (buyButtons.length > 0) {
          // Click the same button 10 times as fast as possible
          for (let i = 0; i < 10; i++) {
            buyButtons[0].click();
          }
          return true;
        }
        return false;
      });

      if (purchased) {
        await this.waitRandom(2000, 3000);

        const finalGold = await this.getGold();
        const goldSpent = initialGold - finalGold;

        this.logger.info(`Final gold: ${finalGold}, Gold spent: ${goldSpent}`);

        // Check if we got duplicate purchases or gold duplication
        if (goldSpent < 0) {
          await this.reportExploit({
            severity: 'CRITICAL',
            category: 'Race Condition',
            title: 'Gold Duplication via Rapid Purchase',
            description: 'Rapidly clicking purchase button resulted in negative gold spent (gold increased)',
            reproductionSteps: [
              'Navigate to shop',
              'Click buy button on any item 10 times rapidly',
              'Observe gold balance',
            ],
            actualBehavior: `Gold increased from ${initialGold} to ${finalGold}`,
            expectedBehavior: 'Gold should decrease or stay the same',
            impact: 'Players can duplicate gold infinitely',
            recommendation: 'Implement server-side transaction locking and request deduplication',
          });
        }
      }

      // Test 2: Rapid action submissions
      this.logger.info('Test: Rapid duplicate action submissions');

      await this.navigateTo('Actions');
      await this.waitRandom(1000, 2000);

      const initialEnergy = await this.getEnergy();

      // Try to perform the same action multiple times
      await this.page.evaluate(() => {
        const actionButtons = Array.from(document.querySelectorAll('button'))
          .filter(btn => btn.textContent?.match(/Perform|Execute|Start/i));

        if (actionButtons.length > 0) {
          for (let i = 0; i < 5; i++) {
            actionButtons[0].click();
          }
        }
      });

      await this.waitRandom(2000, 3000);
      const finalEnergy = await this.getEnergy();

      // Check if energy was deducted multiple times or if action executed multiple times
      this.logger.info(`Energy change: ${initialEnergy} -> ${finalEnergy}`);

      this.metrics.recordAction('race_condition_test');

    } catch (error) {
      this.logger.error(`Race condition test error: ${error}`);
    }
  }

  /**
   * Test negative value handling
   */
  private async testNegativeValues(): Promise<void> {
    this.logger.action('Testing negative value handling');
    this.testsRun++;

    if (!this.page) return;

    try {
      // Test 1: Negative gold input
      this.logger.info('Test: Negative gold values');

      const negativeValueAttempted = await this.page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="number"]'));

        for (const input of inputs) {
          const htmlInput = input as HTMLInputElement;
          // Try to set negative values
          htmlInput.value = '-9999';

          // Trigger change event
          const event = new Event('change', { bubbles: true });
          htmlInput.dispatchEvent(event);

          const submitButton = htmlInput.closest('form')?.querySelector('button[type="submit"]');
          if (submitButton) {
            (submitButton as HTMLButtonElement).click();
            return true;
          }
        }
        return false;
      });

      if (negativeValueAttempted) {
        await this.waitRandom(1000, 2000);
        this.logger.info('Attempted negative value submission');

        // Check for any error messages or if it went through
        const hasError = await this.page.evaluate(() => {
          const errorTexts = document.body.textContent || '';
          return errorTexts.includes('error') || errorTexts.includes('invalid');
        });

        if (!hasError) {
          await this.reportExploit({
            severity: 'HIGH',
            category: 'Input Validation',
            title: 'Negative Value Accepted Without Validation',
            description: 'System accepts negative numeric inputs without proper validation',
            reproductionSteps: [
              'Find any number input field',
              'Enter -9999',
              'Submit the form',
            ],
            actualBehavior: 'Negative value accepted without error',
            expectedBehavior: 'System should reject negative values with clear error message',
            impact: 'Could lead to negative gold, items, or stats exploitation',
            recommendation: 'Add server-side validation for all numeric inputs',
          });
        }
      }

      // Test 2: Attempt to sell more items than owned
      this.logger.info('Test: Selling negative inventory');

      await this.page.evaluate(() => {
        // Try to manipulate DOM to sell items we don't have
        const sellButtons = Array.from(document.querySelectorAll('button'))
          .filter(btn => btn.textContent?.includes('Sell'));

        // Click sell button many times
        sellButtons.forEach(btn => {
          for (let i = 0; i < 10; i++) {
            btn.click();
          }
        });
      });

      await this.waitRandom(1000, 2000);

      this.metrics.recordAction('negative_value_test');

    } catch (error) {
      this.logger.error(`Negative value test error: ${error}`);
    }
  }

  /**
   * Test boundary and overflow conditions
   */
  private async testBoundaryValues(): Promise<void> {
    this.logger.action('Testing boundary values and overflows');
    this.testsRun++;

    if (!this.page) return;

    try {
      // Test maximum values
      const boundaryTests = [
        { value: '2147483647', name: 'MAX_INT32' },
        { value: '9999999999', name: 'Large Number' },
        { value: '999999999999999999', name: 'Very Large Number' },
        { value: '0', name: 'Zero' },
        { value: '1', name: 'Minimum Positive' },
      ];

      for (const test of boundaryTests) {
        this.logger.info(`Test: Boundary value ${test.name} (${test.value})`);

        await this.page.evaluate((val) => {
          const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
          if (inputs.length > 0) {
            const input = inputs[0] as HTMLInputElement;
            input.value = val;

            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
          }
        }, test.value);

        await this.waitRandom(500, 1000);
      }

      // Test string length boundaries
      const longString = 'A'.repeat(10000);
      await this.page.evaluate((str) => {
        const textInputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
        if (textInputs.length > 0) {
          const input = textInputs[0] as HTMLInputElement;
          input.value = str;

          const event = new Event('change', { bubbles: true });
          input.dispatchEvent(event);
        }
      }, longString);

      this.metrics.recordAction('boundary_value_test');

    } catch (error) {
      this.logger.error(`Boundary value test error: ${error}`);
    }
  }

  /**
   * Test input validation and injection attempts
   */
  private async testInputValidation(): Promise<void> {
    this.logger.action('Testing input validation and injection');
    this.testsRun++;

    if (!this.page) return;

    try {
      const injectionPayloads = [
        { payload: '<script>alert("XSS")</script>', type: 'XSS' },
        { payload: '"><script>alert("XSS")</script>', type: 'XSS with quote break' },
        { payload: "'; DROP TABLE users; --", type: 'SQL Injection' },
        { payload: "' OR '1'='1", type: 'SQL Auth Bypass' },
        { payload: '../../../etc/passwd', type: 'Path Traversal' },
        { payload: '${7*7}', type: 'Template Injection' },
        { payload: '{{7*7}}', type: 'Template Injection (Angular)' },
        { payload: '%00', type: 'Null Byte' },
        { payload: '../', type: 'Directory Traversal' },
        { payload: '<?php echo "test"; ?>', type: 'PHP Injection' },
      ];

      for (const { payload, type } of injectionPayloads) {
        this.logger.info(`Test: ${type} - "${payload.substring(0, 30)}..."`);

        const wasInjected = await this.page.evaluate((testPayload) => {
          const allInputs = Array.from(document.querySelectorAll('input, textarea'));

          for (const input of allInputs) {
            const htmlInput = input as HTMLInputElement;
            htmlInput.value = testPayload;

            const event = new Event('input', { bubbles: true });
            htmlInput.dispatchEvent(event);
          }

          return allInputs.length > 0;
        }, payload);

        if (wasInjected) {
          await this.waitRandom(500, 1000);

          // Check if payload is reflected in DOM
          const isReflected = await this.page.evaluate((testPayload) => {
            return document.body.innerHTML.includes(testPayload);
          }, payload);

          if (isReflected && payload.includes('<script>')) {
            await this.reportExploit({
              severity: 'CRITICAL',
              category: 'XSS',
              title: `Reflected XSS Vulnerability - ${type}`,
              description: 'User input is reflected in page without proper sanitization',
              reproductionSteps: [
                'Navigate to any page with input fields',
                `Enter: ${payload}`,
                'Submit or observe page content',
              ],
              actualBehavior: 'Malicious script tags reflected in HTML',
              expectedBehavior: 'Input should be sanitized before rendering',
              impact: 'Attackers can execute arbitrary JavaScript in victims\' browsers',
              recommendation: 'Implement proper HTML escaping and Content Security Policy',
            });
          }
        }

        await this.waitRandom(300, 500);
      }

      this.metrics.recordAction('injection_test');

    } catch (error) {
      this.logger.error(`Injection test error: ${error}`);
    }
  }

  /**
   * Test impossible state transitions
   */
  private async testStateManipulation(): Promise<void> {
    this.logger.action('Testing state manipulation');
    this.testsRun++;

    if (!this.page) return;

    try {
      // Test 1: Manipulate local storage
      this.logger.info('Test: Local storage manipulation');

      const originalGold = await this.getGold();

      await this.page.evaluate(() => {
        // Try to manipulate client-side state
        try {
          localStorage.setItem('gold', '999999');
          localStorage.setItem('energy', '999999');
          localStorage.setItem('level', '999');

          // Try to trigger re-render
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.log('LocalStorage manipulation failed:', e);
        }
      });

      await this.waitRandom(1000, 2000);

      const newGold = await this.getGold();

      if (newGold !== originalGold) {
        await this.reportExploit({
          severity: 'CRITICAL',
          category: 'State Manipulation',
          title: 'Client-Side State Trust Vulnerability',
          description: 'Application trusts client-side storage for critical game state',
          reproductionSteps: [
            'Open browser console',
            'Run: localStorage.setItem("gold", "999999")',
            'Observe gold balance',
          ],
          actualBehavior: 'Client-side modifications affect game state',
          expectedBehavior: 'All game state should be server-authoritative',
          impact: 'Players can modify gold, energy, and other stats arbitrarily',
          recommendation: 'Never trust client-side state for critical values',
        });
      }

      // Test 2: Skip action energy costs
      this.logger.info('Test: Energy requirement bypass');

      await this.page.evaluate(() => {
        // Try to enable all buttons regardless of energy
        const buttons = Array.from(document.querySelectorAll('button:disabled'));
        buttons.forEach(btn => {
          btn.removeAttribute('disabled');
        });
      });

      this.metrics.recordAction('state_manipulation_test');

    } catch (error) {
      this.logger.error(`State manipulation test error: ${error}`);
    }
  }

  /**
   * Test authentication and session exploits
   */
  private async testAuthenticationExploits(): Promise<void> {
    this.logger.action('Testing authentication exploits');
    this.testsRun++;

    if (!this.page) return;

    try {
      // Test 1: Cookie manipulation
      this.logger.info('Test: Cookie/token manipulation');

      const cookies = await this.page.cookies();
      this.logger.info(`Found ${cookies.length} cookies`);

      // Try to modify auth tokens
      for (const cookie of cookies) {
        if (cookie.name.toLowerCase().includes('token') ||
            cookie.name.toLowerCase().includes('auth') ||
            cookie.name.toLowerCase().includes('session')) {

          this.logger.info(`Found auth cookie: ${cookie.name}`);

          // Try to set an invalid token
          await this.page.setCookie({
            ...cookie,
            value: 'invalid_token_12345',
          });

          await this.waitRandom(500, 1000);

          // Try to make a request
          await this.page.reload();
          await this.waitRandom(1000, 2000);

          // Check if we're still authenticated or if we got an error
          const currentUrl = this.page.url();
          if (!currentUrl.includes('login')) {
            this.logger.warn('Still authenticated with invalid token');
          }
        }
      }

      // Test 2: Direct API access without auth
      this.logger.info('Test: Unauthenticated API access');

      const apiEndpoints = [
        '/api/gold/balance',
        '/api/character/stats',
        '/api/user/profile',
        '/api/gang/info',
      ];

      for (const endpoint of apiEndpoints) {
        try {
          const response = await this.page.evaluate(async (url) => {
            const res = await fetch(url, {
              method: 'GET',
              credentials: 'omit', // Don't send cookies
            });
            return {
              status: res.status,
              statusText: res.statusText,
            };
          }, `${this.config.baseUrl}${endpoint}`);

          if (response.status === 200) {
            await this.reportExploit({
              severity: 'HIGH',
              category: 'Authentication',
              title: `Unauthenticated Access to ${endpoint}`,
              description: 'API endpoint accessible without authentication',
              reproductionSteps: [
                `Send GET request to ${endpoint} without auth headers`,
                'Observe response',
              ],
              actualBehavior: 'Endpoint returns data without authentication',
              expectedBehavior: 'Should return 401 Unauthorized',
              impact: 'Sensitive data exposed to unauthenticated users',
              recommendation: 'Enforce authentication on all protected endpoints',
            });
          }
        } catch (e) {
          // Expected for properly secured endpoints
        }
      }

      this.metrics.recordAction('auth_exploit_test');

    } catch (error) {
      this.logger.error(`Authentication test error: ${error}`);
    }
  }

  /**
   * Test rate limiting and throttling
   */
  private async testRateLimiting(): Promise<void> {
    this.logger.action('Testing rate limiting');
    this.testsRun++;

    if (!this.page) return;

    try {
      this.logger.info('Test: Rapid API requests');

      const endpoint = '/api/gold/balance';
      const requestCount = 100;
      const startTime = Date.now();

      const responses = await this.page.evaluate(async (url, count) => {
        const results = [];
        const promises = [];

        for (let i = 0; i < count; i++) {
          promises.push(
            fetch(url)
              .then(res => ({ status: res.status, ok: res.ok }))
              .catch(err => ({ status: 0, error: err.message }))
          );
        }

        return Promise.all(promises);
      }, `${this.config.baseUrl}${endpoint}`, requestCount);

      const endTime = Date.now();
      const duration = endTime - startTime;

      const successCount = responses.filter((r: any) => r.ok).length;
      const rateLimitedCount = responses.filter((r: any) => r.status === 429).length;

      this.logger.info(`Sent ${requestCount} requests in ${duration}ms`);
      this.logger.info(`Success: ${successCount}, Rate limited: ${rateLimitedCount}`);

      if (rateLimitedCount === 0) {
        await this.reportExploit({
          severity: 'MEDIUM',
          category: 'Rate Limiting',
          title: 'No Rate Limiting on API Endpoints',
          description: `Successfully sent ${requestCount} requests in ${duration}ms with no rate limiting`,
          reproductionSteps: [
            `Send ${requestCount} rapid requests to ${endpoint}`,
            'All requests succeed',
          ],
          actualBehavior: 'All requests processed without throttling',
          expectedBehavior: 'Requests should be rate limited',
          impact: 'API can be abused for DoS or data scraping',
          recommendation: 'Implement rate limiting on all API endpoints',
        });
      }

      this.metrics.recordAction('rate_limit_test');

    } catch (error) {
      this.logger.error(`Rate limiting test error: ${error}`);
    }
  }

  /**
   * Test concurrent sessions
   */
  private async testConcurrentSessions(): Promise<void> {
    this.logger.action('Testing concurrent sessions');
    this.testsRun++;

    if (!this.page || !this.browser) return;

    try {
      this.logger.info('Test: Multiple simultaneous sessions');

      // Open a second tab/page with the same account
      const secondPage = await this.browser.newPage();

      // Copy cookies to second page
      const cookies = await this.page.cookies();
      await secondPage.setCookie(...cookies);

      await secondPage.goto(this.config.baseUrl!);
      await this.waitRandom(2000, 3000);

      // Get gold in both pages
      const gold1 = await this.getGold();
      const gold2 = await secondPage.evaluate(() => {
        const goldEl = document.querySelector('[data-testid="gold-amount"], .gold-display');
        return parseInt(goldEl?.textContent?.replace(/[^0-9]/g, '') || '0');
      });

      this.logger.info(`Tab 1 gold: ${gold1}, Tab 2 gold: ${gold2}`);

      // Try to perform actions in both tabs simultaneously
      const action1 = this.page.evaluate(() => {
        const actionBtn = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent?.includes('Action') || btn.textContent?.includes('Work'));
        if (actionBtn) {
          (actionBtn as HTMLButtonElement).click();
          return true;
        }
        return false;
      });

      const action2 = secondPage.evaluate(() => {
        const actionBtn = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent?.includes('Action') || btn.textContent?.includes('Work'));
        if (actionBtn) {
          (actionBtn as HTMLButtonElement).click();
          return true;
        }
        return false;
      });

      await Promise.all([action1, action2]);
      await this.waitRandom(2000, 3000);

      this.logger.info('Executed actions in both tabs simultaneously');

      await secondPage.close();

      this.metrics.recordAction('concurrent_session_test');

    } catch (error) {
      this.logger.error(`Concurrent session test error: ${error}`);
    }
  }

  /**
   * Test energy system exploits
   */
  private async testEnergyExploits(): Promise<void> {
    this.logger.action('Testing energy exploits');
    this.testsRun++;

    if (!this.page) return;

    try {
      const initialEnergy = await this.getEnergy();
      this.logger.info(`Initial energy: ${initialEnergy}`);

      // Test 1: Perform action without sufficient energy
      this.logger.info('Test: Action without sufficient energy');

      // Try to deplete all energy
      while (await this.getEnergy() > 0) {
        const clicked = await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'))
            .filter(btn => !btn.disabled);
          if (buttons.length > 0) {
            (buttons[0] as HTMLButtonElement).click();
            return true;
          }
          return false;
        });

        if (!clicked) break;
        await this.waitRandom(500, 1000);
      }

      const depletedEnergy = await this.getEnergy();
      this.logger.info(`Energy after depletion: ${depletedEnergy}`);

      // Try to perform action with 0 energy
      const actionPerformed = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const actionBtn = buttons.find(btn =>
          btn.textContent?.match(/Perform|Execute|Work|Action/i)
        );

        if (actionBtn) {
          // Remove disabled attribute if present
          actionBtn.removeAttribute('disabled');
          (actionBtn as HTMLButtonElement).click();
          return true;
        }
        return false;
      });

      if (actionPerformed) {
        await this.waitRandom(1000, 2000);

        const newEnergy = await this.getEnergy();
        if (newEnergy < 0) {
          await this.reportExploit({
            severity: 'HIGH',
            category: 'Energy System',
            title: 'Negative Energy Possible',
            description: 'Energy can go below zero',
            reproductionSteps: [
              'Deplete energy to 0',
              'Remove disabled attribute from action button',
              'Click action button',
            ],
            actualBehavior: 'Energy goes negative',
            expectedBehavior: 'Energy should never go below 0',
            impact: 'Breaks energy economy',
            recommendation: 'Server-side energy validation before action execution',
          });
        }
      }

      this.metrics.recordAction('energy_exploit_test');

    } catch (error) {
      this.logger.error(`Energy exploit test error: ${error}`);
    }
  }

  /**
   * Test gold duplication and economy exploits
   */
  private async testGoldExploits(): Promise<void> {
    this.logger.action('Testing gold exploits');
    this.testsRun++;

    if (!this.page) return;

    try {
      const initialGold = await this.getGold();
      this.logger.info(`Initial gold: ${initialGold}`);

      // Test 1: Integer overflow
      this.logger.info('Test: Gold integer overflow');

      await this.page.evaluate(() => {
        // Try to manipulate gold via client-side
        const goldInputs = Array.from(document.querySelectorAll('input'))
          .filter(input =>
            input.placeholder?.toLowerCase().includes('gold') ||
            input.name?.toLowerCase().includes('gold') ||
            input.id?.toLowerCase().includes('gold')
          );

        goldInputs.forEach(input => {
          (input as HTMLInputElement).value = '2147483647'; // MAX_INT
        });
      });

      // Test 2: Sell items repeatedly
      this.logger.info('Test: Item duplication via rapid sell');

      await this.navigateTo('Inventory');
      await this.waitRandom(1000, 2000);

      await this.page.evaluate(() => {
        const sellButtons = Array.from(document.querySelectorAll('button'))
          .filter(btn => btn.textContent?.includes('Sell'));

        if (sellButtons.length > 0) {
          // Click sell button 20 times rapidly
          for (let i = 0; i < 20; i++) {
            sellButtons[0].click();
          }
        }
      });

      await this.waitRandom(2000, 3000);

      const finalGold = await this.getGold();
      const goldGained = finalGold - initialGold;

      this.logger.info(`Final gold: ${finalGold}, Gained: ${goldGained}`);

      this.metrics.recordAction('gold_exploit_test');

    } catch (error) {
      this.logger.error(`Gold exploit test error: ${error}`);
    }
  }

  /**
   * Test inventory exploits
   */
  private async testInventoryExploits(): Promise<void> {
    this.logger.action('Testing inventory exploits');
    this.testsRun++;

    if (!this.page) return;

    try {
      await this.navigateTo('Inventory');
      await this.waitRandom(1000, 2000);

      // Test 1: Exceed inventory limits
      this.logger.info('Test: Inventory overflow');

      // Try to pick up more items than inventory can hold
      await this.page.evaluate(() => {
        // Look for "equip" or "use" buttons
        const useButtons = Array.from(document.querySelectorAll('button'))
          .filter(btn => btn.textContent?.match(/Use|Equip|Consume/i));

        // Try to use items rapidly
        useButtons.forEach(btn => {
          for (let i = 0; i < 10; i++) {
            btn.click();
          }
        });
      });

      await this.waitRandom(1000, 2000);

      // Test 2: Item duplication
      this.logger.info('Test: Item duplication via rapid actions');

      this.metrics.recordAction('inventory_exploit_test');

    } catch (error) {
      this.logger.error(`Inventory exploit test error: ${error}`);
    }
  }

  /**
   * Test combat exploits
   */
  private async testCombatExploits(): Promise<void> {
    this.logger.action('Testing combat exploits');
    this.testsRun++;

    if (!this.page) return;

    try {
      await this.navigateTo('Combat');
      await this.waitRandom(1000, 2000);

      // Test 1: Attack before combat starts
      this.logger.info('Test: Premature combat actions');

      await this.page.evaluate(() => {
        const attackButtons = Array.from(document.querySelectorAll('button'))
          .filter(btn => btn.textContent?.match(/Attack|Strike|Hit/i));

        attackButtons.forEach(btn => {
          btn.removeAttribute('disabled');
          btn.click();
        });
      });

      // Test 2: Multiple simultaneous attacks
      this.logger.info('Test: Simultaneous combat actions');

      await this.page.evaluate(() => {
        const combatButtons = Array.from(document.querySelectorAll('button'))
          .filter(btn => btn.textContent?.match(/Attack|Defend|Skill/i));

        // Click all combat buttons simultaneously
        combatButtons.forEach(btn => btn.click());
      });

      this.metrics.recordAction('combat_exploit_test');

    } catch (error) {
      this.logger.error(`Combat exploit test error: ${error}`);
    }
  }

  /**
   * Test gang exploits
   */
  private async testGangExploits(): Promise<void> {
    this.logger.action('Testing gang exploits');
    this.testsRun++;

    if (!this.page) return;

    try {
      await this.navigateTo('Gang');
      await this.waitRandom(1000, 2000);

      // Test 1: Withdraw more than balance
      this.logger.info('Test: Gang bank overdraft');

      await this.page.evaluate(() => {
        const withdrawInputs = Array.from(document.querySelectorAll('input'))
          .filter(input =>
            input.placeholder?.toLowerCase().includes('amount') ||
            input.placeholder?.toLowerCase().includes('withdraw')
          );

        withdrawInputs.forEach(input => {
          (input as HTMLInputElement).value = '999999999';
        });

        const withdrawBtn = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent?.includes('Withdraw'));

        if (withdrawBtn) {
          withdrawBtn.click();
        }
      });

      await this.waitRandom(1000, 2000);

      // Test 2: Join multiple gangs
      this.logger.info('Test: Multiple gang membership');

      this.metrics.recordAction('gang_exploit_test');

    } catch (error) {
      this.logger.error(`Gang exploit test error: ${error}`);
    }
  }

  /**
   * Fuzz API endpoints with malformed data
   */
  private async testAPIEndpointFuzzing(): Promise<void> {
    this.logger.action('Testing API endpoint fuzzing');
    this.testsRun++;

    if (!this.page) return;

    try {
      const endpoints = [
        { method: 'GET', path: '/api/character/stats' },
        { method: 'POST', path: '/api/action/perform' },
        { method: 'PUT', path: '/api/character/update' },
        { method: 'DELETE', path: '/api/item/delete' },
      ];

      const malformedBodies = [
        null,
        undefined,
        '',
        '{}',
        '[]',
        'null',
        '{"invalid"}',
        '<xml>test</xml>',
        'true',
        '12345',
        '{"nested": {"very": {"deep": {"object": {"chain": {"test": "value"}}}}}}}',
      ];

      for (const endpoint of endpoints) {
        for (const body of malformedBodies) {
          try {
            const response = await this.page.evaluate(async (url, method, data) => {
              try {
                const res = await fetch(url, {
                  method: method,
                  headers: { 'Content-Type': 'application/json' },
                  body: data === null || data === undefined ? undefined : String(data),
                });
                return { status: res.status, ok: res.ok };
              } catch (e: any) {
                return { status: 0, error: e.message };
              }
            }, `${this.config.baseUrl}${endpoint.path}`, endpoint.method, body);

            if (response.status === 500) {
              this.logger.warn(`500 error on ${endpoint.method} ${endpoint.path} with body: ${body}`);

              await this.reportExploit({
                severity: 'MEDIUM',
                category: 'Error Handling',
                title: `Unhandled Error on ${endpoint.path}`,
                description: 'API endpoint returns 500 error with malformed input',
                reproductionSteps: [
                  `Send ${endpoint.method} request to ${endpoint.path}`,
                  `With body: ${body}`,
                ],
                actualBehavior: '500 Internal Server Error',
                expectedBehavior: '400 Bad Request with error message',
                impact: 'Poor error handling, potential information disclosure',
                recommendation: 'Add proper input validation and error handling',
              });
            }
          } catch (e) {
            // Continue testing
          }

          await this.waitRandom(100, 200);
        }
      }

      this.metrics.recordAction('api_fuzzing_test');

    } catch (error) {
      this.logger.error(`API fuzzing test error: ${error}`);
    }
  }

  /**
   * Test client-side validation bypasses
   */
  private async testClientSideValidationBypass(): Promise<void> {
    this.logger.action('Testing client-side validation bypass');
    this.testsRun++;

    if (!this.page) return;

    try {
      // Remove all validation attributes
      await this.page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));

        inputs.forEach(input => {
          input.removeAttribute('required');
          input.removeAttribute('min');
          input.removeAttribute('max');
          input.removeAttribute('pattern');
          input.removeAttribute('minlength');
          input.removeAttribute('maxlength');
          input.removeAttribute('disabled');
          input.removeAttribute('readonly');
        });
      });

      // Try to submit forms with invalid data
      await this.page.evaluate(() => {
        const forms = Array.from(document.querySelectorAll('form'));

        forms.forEach(form => {
          const inputs = form.querySelectorAll('input, textarea');

          // Fill with invalid data
          inputs.forEach(input => {
            if (input.getAttribute('type') === 'email') {
              (input as HTMLInputElement).value = 'not-an-email';
            } else if (input.getAttribute('type') === 'number') {
              (input as HTMLInputElement).value = 'not-a-number';
            } else {
              (input as HTMLInputElement).value = '<script>alert(1)</script>';
            }
          });

          // Try to submit
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            (submitBtn as HTMLButtonElement).click();
          }
        });
      });

      await this.waitRandom(2000, 3000);

      this.metrics.recordAction('validation_bypass_test');

    } catch (error) {
      this.logger.error(`Validation bypass test error: ${error}`);
    }
  }

  /**
   * Report an exploit finding
   */
  private async reportExploit(report: Omit<ExploitReport, 'id' | 'timestamp' | 'evidence'>): Promise<void> {
    const exploitId = `EXPLOIT-${Date.now()}-${this.exploitsFound}`;

    const fullReport: ExploitReport = {
      ...report,
      id: exploitId,
      timestamp: Date.now(),
      evidence: {
        screenshots: [],
        logs: [],
        networkRequests: this.requestLog.slice(-10), // Last 10 requests
      },
    };

    // Take screenshot
    const screenshotPath = `exploit-${exploitId}`;
    await this.screenshot(screenshotPath);
    fullReport.evidence.screenshots = [screenshotPath];

    this.exploitReports.push(fullReport);
    this.exploitsFound++;

    // Log to exploit logger
    this.exploitLogger.error(`\n${'='.repeat(80)}`);
    this.exploitLogger.error(`EXPLOIT FOUND #${this.exploitsFound}: ${report.title}`);
    this.exploitLogger.error(`Severity: ${report.severity}`);
    this.exploitLogger.error(`Category: ${report.category}`);
    this.exploitLogger.error(`ID: ${exploitId}`);
    this.exploitLogger.error('-'.repeat(80));
    this.exploitLogger.error(`Description: ${report.description}`);
    this.exploitLogger.error(`\nReproduction Steps:`);
    report.reproductionSteps.forEach((step, i) => {
      this.exploitLogger.error(`  ${i + 1}. ${step}`);
    });
    this.exploitLogger.error(`\nActual Behavior: ${report.actualBehavior}`);
    this.exploitLogger.error(`Expected Behavior: ${report.expectedBehavior}`);
    this.exploitLogger.error(`\nImpact: ${report.impact}`);
    this.exploitLogger.error(`Recommendation: ${report.recommendation}`);
    this.exploitLogger.error('='.repeat(80));

    this.metrics.recordAction('exploit_found', { severity: report.severity, category: report.category });
  }

  /**
   * Generate comprehensive exploit report
   */
  private async generateExploitReport(): Promise<void> {
    this.logger.info('\n' + '='.repeat(80));
    this.logger.info('ADVERSARIAL BOT TESTING COMPLETE');
    this.logger.info('='.repeat(80));
    this.logger.info(`Tests Run: ${this.testsRun}`);
    this.logger.info(`Exploits Found: ${this.exploitsFound}`);
    this.logger.info('='.repeat(80));

    if (this.exploitReports.length === 0) {
      this.logger.success('No exploits found - system appears secure!');
      return;
    }

    // Group by severity
    const critical = this.exploitReports.filter(e => e.severity === 'CRITICAL');
    const high = this.exploitReports.filter(e => e.severity === 'HIGH');
    const medium = this.exploitReports.filter(e => e.severity === 'MEDIUM');
    const low = this.exploitReports.filter(e => e.severity === 'LOW');

    this.exploitLogger.error('\n\nEXPLOIT SUMMARY:');
    this.exploitLogger.error(`  CRITICAL: ${critical.length}`);
    this.exploitLogger.error(`  HIGH:     ${high.length}`);
    this.exploitLogger.error(`  MEDIUM:   ${medium.length}`);
    this.exploitLogger.error(`  LOW:      ${low.length}`);

    // Save detailed report to file
    const fs = await import('fs');
    const path = await import('path');

    const reportDir = path.join(process.cwd(), 'tests', 'playtests', 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `adversarial-bot-report-${timestamp}.json`);

    const report = {
      metadata: {
        botName: this.config.name,
        timestamp: Date.now(),
        testsRun: this.testsRun,
        exploitsFound: this.exploitsFound,
      },
      summary: {
        critical: critical.length,
        high: high.length,
        medium: medium.length,
        low: low.length,
      },
      exploits: this.exploitReports,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.logger.success(`Detailed report saved to: ${reportPath}`);

    // Take final screenshot
    await this.screenshot('adversarial-bot-final');
  }
}
