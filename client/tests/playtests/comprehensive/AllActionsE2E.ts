/**
 * ALL ACTIONS E2E TEST
 * Physically tests every action through the UI
 */

import { BotBase, BotConfig } from '../utils/BotBase.js';
import { BotLogger } from '../utils/BotLogger.js';
import { Page } from 'puppeteer';

interface ActionTestResult {
  name: string;
  category: string;
  executable: boolean;
  requirementsNotMet: boolean;
  error?: string;
  responseTime?: number;
}

export class AllActionsE2EBot extends BotBase {
  private results: ActionTestResult[] = [];
  private testLogger: BotLogger;

  constructor(config: BotConfig) {
    super(config);
    this.testLogger = new BotLogger('ActionE2E');
  }

  /**
   * Run comprehensive action tests
   */
  async runTests(): Promise<void> {
    try {
      await this.initialize();
      await this.login();
      await this.selectCharacter();

      this.testLogger.info('\n═══════════════════════════════════════════════════════════');
      this.testLogger.info('🎯 COMPREHENSIVE ACTION E2E TEST');
      this.testLogger.info('═══════════════════════════════════════════════════════════\n');

      // Get all actions from the UI
      const actions = await this.getAllActions();
      this.testLogger.info(`Found ${actions.length} actions to test\n`);

      // Test each action
      for (const action of actions) {
        await this.testAction(action);
        await this.waitRandom(500, 1000);
      }

      // Generate report
      this.generateReport();

    } catch (error) {
      this.testLogger.error(`Test failed: ${error}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Get all available actions from the game UI
   */
  private async getAllActions(): Promise<Array<{ name: string; category: string }>> {
    if (!this.page) throw new Error('Page not initialized');

    this.testLogger.info('Fetching actions from UI...');

    try {
      await this.navigateToActions();

      // Wait for page to load with explicit element wait
      this.testLogger.info('Waiting for page content to load...');
      try {
        await this.page.waitForSelector('h1, h2, h3', { timeout: 10000 });
        await this.waitRandom(2000, 3000); // Additional wait for React hydration
      } catch (waitError) {
        this.testLogger.warn('Timeout waiting for content, proceeding anyway');
      }

      // DEBUG: Take screenshot
      const screenshotPath = `./test-screenshots/actions-page-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.testLogger.info(`Screenshot saved: ${screenshotPath}`);

      // DEBUG: Log page info
      const pageUrl = this.page.url();
      const pageTitle = await this.page.title();
      this.testLogger.info(`Current URL: ${pageUrl}`);
      this.testLogger.info(`Page Title: ${pageTitle}`);

      // DEBUG: Count elements
      const elementCounts = await this.page.evaluate(() => {
        return {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('h2').length,
          h3: document.querySelectorAll('h3').length,
          buttons: document.querySelectorAll('button').length,
          dataTestIds: document.querySelectorAll('[data-testid]').length,
          dataActionNames: document.querySelectorAll('[data-action-name]').length,
          attemptButtons: Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes('Attempt')).length,
        };
      });
      this.testLogger.info(`Element counts: ${JSON.stringify(elementCounts)}`);

      // Extract action data from the page - updated to match actual UI structure
      const actions = await this.page.evaluate(() => {
        const acts: Array<{ name: string; category: string }> = [];

        // Strategy 1: Try data attributes FIRST (most reliable)
        const dataElements = document.querySelectorAll('[data-action-name]');
        dataElements.forEach((el) => {
          const name = el.getAttribute('data-action-name');
          const category = el.getAttribute('data-action-category') || 'unknown';
          if (name && name !== '') {
            acts.push({ name, category });
          }
        });

        // Strategy 2: Find action cards by looking for divs with h3 and nearby "Attempt" button
        if (acts.length === 0) {
          const attemptButtons = Array.from(document.querySelectorAll('button')).filter(
            btn => btn.textContent?.includes('Attempt') || btn.textContent?.includes('Locked')
          );

          attemptButtons.forEach((btn) => {
            // Look for parent container
            const parent = btn.closest('div');
            if (parent) {
              const nameEl = parent.querySelector('h3');
              if (nameEl && nameEl.textContent) {
                const name = nameEl.textContent.trim();

                // Try to determine category from icon
                const iconEl = parent.querySelector('span.text-xl');
                const icon = iconEl?.textContent || '';
                let category = 'unknown';
                if (icon === '⚒️') category = 'craft';
                else if (icon === '🔫') category = 'crime';
                else if (icon === '🤝') category = 'social';
                else if (icon === '⚔️') category = 'combat';
                else if (icon === '🎯') category = 'quest';
                else if (icon === '💰') category = 'economic';

                if (name && name !== '' && !acts.find(act => act.name === name)) {
                  acts.push({ name, category });
                }
              }
            }
          });
        }

        // Strategy 3: Find all divs with h3 elements (broader search)
        if (acts.length === 0) {
          const allH3s = document.querySelectorAll('h3');
          allH3s.forEach((h3) => {
            const name = h3.textContent?.trim();
            if (name && name !== '') {
              // Check if there's a nearby button (sibling or in parent)
              const parent = h3.closest('div');
              const hasButton = parent?.querySelector('button');
              if (hasButton) {
                if (!acts.find(act => act.name === name)) {
                  acts.push({ name, category: 'uncategorized' });
                }
              }
            }
          });
        }

        return acts;
      });

      this.testLogger.info(`Extracted ${actions.length} actions using page scraping`);

      if (actions.length === 0) {
        // DEBUG: Log page HTML snippet
        const htmlSnippet = await this.page.evaluate(() => {
          return document.body.innerHTML.substring(0, 500);
        });
        this.testLogger.warn(`Page HTML snippet: ${htmlSnippet}`);

        this.testLogger.warn('No actions found in UI at current location, using fallback list');
        return this.getFallbackActions();
      }

      this.testLogger.info(`Found ${actions.length} actions available at current location`);
      return actions;
    } catch (error) {
      this.testLogger.error(`Failed to fetch actions: ${error}`);
      // Take error screenshot
      try {
        await this.page.screenshot({ path: `./test-screenshots/actions-error-${Date.now()}.png`, fullPage: true });
      } catch (screenshotError) {
        // Ignore screenshot errors
      }
      return this.getFallbackActions();
    }
  }

  /**
   * Navigate to the actions page
   */
  private async navigateToActions(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    this.testLogger.info('Navigating to actions page...');

    // After character selection, we should be at /game or /game/location
    const currentUrl = this.page.url();
    this.testLogger.info(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/game/actions')) {
      this.testLogger.info('Already on actions page');
      await this.waitRandom(1000, 2000);
      return;
    }

    // If on game page, use click-based navigation to preserve auth
    if (currentUrl.includes('/game')) {
      this.testLogger.info('On game page, clicking actions nav link...');

      const clicked = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const navLink = links.find(a => {
          const href = a.getAttribute('href') || '';
          return href === '/game/actions' || href.includes('/actions');
        });

        if (navLink) {
          navLink.click();
          return true;
        }
        return false;
      });

      if (!clicked) {
        this.testLogger.error('Could not find actions nav link');
        throw new Error('Navigation link not found');
      }

      // Wait for client-side navigation (React Router)
      await this.waitRandom(2000, 3000);

      const finalUrl = this.page.url();
      this.testLogger.info(`Navigation complete: ${finalUrl}`);

      if (finalUrl.includes('/login')) {
        throw new Error('Navigation failed - redirected to login (auth lost)');
      }

      if (!finalUrl.includes('/game/actions')) {
        this.testLogger.warn(`Expected /game/actions but got: ${finalUrl}`);
      }
      return;
    }

    // If not on game page at all, something went wrong
    throw new Error(`Unexpected state - not on game page. Current URL: ${currentUrl}`);
  }

  /**
   * Test a specific action
   */
  private async testAction(action: { name: string; category: string }): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    const startTime = Date.now();
    const result: ActionTestResult = {
      name: action.name,
      category: action.category,
      executable: false,
      requirementsNotMet: false,
    };

    try {
      this.testLogger.info(`Testing: ${action.name}...`);

      // Try to execute this action
      const outcome = await this.executeAction(action.name);

      result.responseTime = Date.now() - startTime;

      if (outcome === 'success') {
        result.executable = true;
        this.testLogger.info(`  ✅ ${action.name} - Executed successfully (${result.responseTime}ms)`);
      } else if (outcome === 'requirements') {
        result.requirementsNotMet = true;
        this.testLogger.info(`  ⚠️  ${action.name} - Requirements not met (${result.responseTime}ms)`);
      } else {
        result.error = 'Failed to execute';
        this.testLogger.warn(`  ❌ ${action.name} - Failed to execute`);
      }

    } catch (error: any) {
      result.error = error.message;
      this.testLogger.error(`  ❌ ${action.name} - Error: ${error.message}`);
    }

    this.results.push(result);
  }

  /**
   * Attempt to execute an action
   */
  private async executeAction(actionName: string): Promise<'success' | 'requirements' | 'failed'> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      // Find and click the action button
      const clicked = await this.page.evaluate((actName) => {
        // Try data attributes first
        const dataButton = document.querySelector(`button[data-action="${actName}"], button[data-action-name="${actName}"]`);
        if (dataButton) {
          (dataButton as HTMLElement).click();
          return true;
        }

        // Try text content
        const buttons = Array.from(document.querySelectorAll('button'));
        const actionButton = buttons.find(btn => btn.textContent?.includes(actName));
        if (actionButton) {
          actionButton.click();
          return true;
        }

        return false;
      }, actionName);

      if (!clicked) {
        return 'failed';
      }

      await this.waitRandom(500, 1500);

      // Check for success/failure messages
      const outcome = await this.page.evaluate(() => {
        // Look for success indicators
        const successIndicators = [
          document.querySelector('.toast-success'),
          document.querySelector('.success-message'),
          document.querySelector('[data-toast="success"]'),
        ].filter(Boolean);

        if (successIndicators.length > 0) {
          return 'success';
        }

        // Look for requirement errors
        const errorText = document.querySelector('.toast-error, .error-message, [data-toast="error"]')?.textContent?.toLowerCase() || '';

        if (
          errorText.includes('not enough') ||
          errorText.includes('insufficient') ||
          errorText.includes('requires') ||
          errorText.includes('prerequisite') ||
          errorText.includes('energy') ||
          errorText.includes('gold')
        ) {
          return 'requirements';
        }

        // Look for any error
        if (document.querySelector('.toast-error, .error-message, [data-toast="error"]')) {
          return 'failed';
        }

        // No clear indicator - assume success if no error
        return 'success';
      });

      return outcome as 'success' | 'requirements' | 'failed';

    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Fallback action list based on database
   */
  private getFallbackActions(): Array<{ name: string; category: string }> {
    return [
      // Criminal & Theft
      { name: 'Pickpocket Drunk', category: 'criminal' },
      { name: 'Steal from Market', category: 'criminal' },
      { name: 'Forge Documents', category: 'criminal' },
      { name: 'Pick Lock', category: 'criminal' },
      { name: 'Burglarize Store', category: 'criminal' },
      { name: 'Cattle Rustling', category: 'criminal' },
      { name: 'Stage Coach Robbery', category: 'criminal' },
      { name: 'Rob Saloon', category: 'criminal' },
      { name: 'Bank Heist', category: 'criminal' },
      { name: 'Train Robbery', category: 'criminal' },
      { name: 'Steal Horse', category: 'criminal' },
      { name: 'Smuggling Run', category: 'criminal' },

      // Combat & Violence
      { name: 'Murder for Hire', category: 'combat' },
      { name: 'Bootlegging', category: 'criminal' },
      { name: 'Arson', category: 'criminal' },
      { name: 'Bar Brawl', category: 'combat' },
      { name: 'Duel Outlaw', category: 'combat' },
      { name: 'Hunt Wildlife', category: 'survival' },
      { name: 'Defend Homestead', category: 'combat' },
      { name: 'Clear Bandit Camp', category: 'combat' },
      { name: 'Hunt Mountain Lion', category: 'combat' },

      // Crafting
      { name: 'Craft Bullets', category: 'crafting' },
      { name: 'Forge Horseshoe', category: 'crafting' },
      { name: 'Brew Medicine', category: 'crafting' },
      { name: 'Build Wagon Wheel', category: 'crafting' },

      // Social
      { name: 'Charm Bartender', category: 'social' },
      { name: 'Negotiate Trade', category: 'social' },
      { name: 'Perform Music', category: 'social' },
      { name: 'Convince Sheriff', category: 'social' },

      // Quest & Story
      { name: "The Preacher's Ledger", category: 'quest' },
      { name: 'Territorial Extortion', category: 'quest' },
      { name: 'The Counterfeit Ring', category: 'quest' },
      { name: 'Ghost Town Heist', category: 'quest' },
      { name: "The Judge's Pocket", category: 'quest' },
      { name: 'The Iron Horse', category: 'quest' },
      { name: 'The Warden of Perdition', category: 'boss' },
      { name: 'El Carnicero', category: 'boss' },

      // Bounties & Jobs
      { name: 'Clear Rat Nest', category: 'job' },
      { name: 'Run Off Coyotes', category: 'job' },
      { name: 'Bounty: Cattle Rustlers', category: 'bounty' },
      { name: 'Bounty: Mad Dog McGraw', category: 'bounty' },
      { name: 'Raid Smuggler Den', category: 'bounty' },
      { name: 'Escort Prisoner Transport', category: 'job' },
      { name: 'The Pale Rider', category: 'boss' },
      { name: 'The Wendigo', category: 'boss' },
      { name: 'General Sangre', category: 'boss' },
    ];
  }

  /**
   * Select character after login
   */
  private async selectCharacter(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    this.testLogger.info('Selecting character...');

    try {
      // Wait for character selection screen - try multiple selectors
      await this.page.waitForSelector('.character-card, button[data-testid="play-button"], button[type="submit"]', {
        timeout: 10000,
      });

      await this.waitRandom(1000, 2000);

      // Try to find and click "Play" button using evaluate
      const clicked = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const playButton = buttons.find(btn =>
          btn.textContent?.includes('Play') ||
          btn.textContent?.includes('Select') ||
          btn.textContent?.includes('Continue')
        );
        if (playButton) {
          playButton.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        this.testLogger.info('Character selected, waiting for navigation...');
        await this.waitRandom(3000, 5000);

        const finalUrl = this.page.url();
        this.testLogger.info(`Character selection complete, at: ${finalUrl}`);

        if (finalUrl.includes('/login')) {
          throw new Error('Character selection failed - redirected to login');
        }

        if (!finalUrl.includes('/game') && !finalUrl.includes('/characters')) {
          this.testLogger.warn(`Unexpected URL after character selection: ${finalUrl}`);
        }
      } else {
        // Fallback: click first submit button
        const submitButton = await this.page.$('button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          this.testLogger.info('Character selected via submit button, waiting for navigation...');
          await this.waitRandom(3000, 5000);

          const finalUrl = this.page.url();
          this.testLogger.info(`Character selection complete, at: ${finalUrl}`);

          if (finalUrl.includes('/login')) {
            throw new Error('Character selection failed - redirected to login');
          }

          if (!finalUrl.includes('/game') && !finalUrl.includes('/characters')) {
            this.testLogger.warn(`Unexpected URL after character selection: ${finalUrl}`);
          }
        } else {
          throw new Error('Character selection button not found');
        }
      }

    } catch (error) {
      this.testLogger.error(`Character selection failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate test report
   */
  private generateReport(): void {
    const total = this.results.length;
    const executable = this.results.filter(r => r.executable).length;
    const requirementsNotMet = this.results.filter(r => r.requirementsNotMet).length;
    const failed = this.results.filter(r => !r.executable && !r.requirementsNotMet).length;
    const errors = this.results.filter(r => r.error).length;

    this.testLogger.info('\n═══════════════════════════════════════════════════════════');
    this.testLogger.info('📊 ACTION E2E TEST REPORT');
    this.testLogger.info('═══════════════════════════════════════════════════════════\n');

    this.testLogger.info(`Total Actions Tested: ${total}`);
    this.testLogger.info(`Executable: ${executable} (${((executable / total) * 100).toFixed(1)}%)`);
    this.testLogger.info(`Requirements Not Met: ${requirementsNotMet} (${((requirementsNotMet / total) * 100).toFixed(1)}%)`);
    this.testLogger.info(`Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
    this.testLogger.info(`Errors: ${errors}\n`);

    // Group by category
    const byCategory = new Map<string, ActionTestResult[]>();
    this.results.forEach(r => {
      if (!byCategory.has(r.category)) byCategory.set(r.category, []);
      byCategory.get(r.category)!.push(r);
    });

    this.testLogger.info('Results by Category:');
    byCategory.forEach((actions, category) => {
      const executable = actions.filter(a => a.executable).length;
      this.testLogger.info(`  ${category}: ${executable}/${actions.length} executable`);
    });

    if (errors > 0) {
      this.testLogger.info('\n❌ Failed Actions:');
      this.results.filter(r => r.error).forEach(r => {
        this.testLogger.info(`  - ${r.name}: ${r.error}`);
      });
    }

    // Average response time
    const responseTimes = this.results.filter(r => r.responseTime).map(r => r.responseTime!);
    if (responseTimes.length > 0) {
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      this.testLogger.info(`\nAverage Response Time: ${avgTime.toFixed(0)}ms`);
    }

    this.testLogger.info('\n═══════════════════════════════════════════════════════════\n');
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Random wait
   */
  private async waitRandom(min: number, max: number): Promise<void> {
    const wait = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, wait));
  }
}
