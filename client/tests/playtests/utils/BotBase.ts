/**
 * BotBase - Base class for all automated playtest bots
 * Provides common functionality for player simulation
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { BotLogger } from './BotLogger.js';
import { BotMetrics } from './BotMetrics.js';
import { clickLinkByText, clickButtonByText } from './BotSelectors.js';

export interface BotConfig {
  name: string;
  username: string;
  email: string;
  password: string;
  characterName: string;
  baseUrl?: string;
  headless?: boolean;
  slowMo?: number;
}

export abstract class BotBase {
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  protected config: BotConfig;
  protected logger: BotLogger;
  protected metrics: BotMetrics;
  protected isRunning: boolean = false;
  protected shouldStop: boolean = false;

  constructor(config: BotConfig) {
    this.config = {
      baseUrl: 'http://localhost:3002',
      headless: false,
      slowMo: 50,
      ...config,
    };
    this.logger = new BotLogger(this.config.name);
    this.metrics = new BotMetrics(this.config.name);
  }

  /**
   * Initialize the browser and page
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing browser...');

    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      slowMo: this.config.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });

    this.page = await this.browser.newPage();

    // Set up console monitoring
    this.page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('ERROR') || text.includes('Error')) {
        this.logger.error(`Browser console: ${text}`);
      }
    });

    // Set up error monitoring
    this.page.on('pageerror', (error) => {
      this.logger.error(`Page error: ${error.message}`);
    });

    this.logger.info('Browser initialized');
  }

  /**
   * Navigate to the game and log in
   */
  async login(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    this.logger.info('Navigating to game...');
    await this.page.goto(this.config.baseUrl!);
    await this.waitRandom(1000, 2000);

    // Click login button using helper
    this.logger.info('Going to login page...');
    const loginClicked = await clickLinkByText(this.page, 'Returning Player', 'Login', 'Log In', 'Sign In');

    if (!loginClicked) {
      this.logger.error('Failed to find login link');
      throw new Error('Login link not found on landing page');
    }

    await this.waitRandom(1000, 2000);

    // Fill in login form
    this.logger.info('Logging in...');

    try {
      await this.page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await this.page.type('input[type="email"]', this.config.email, { delay: 50 });
      await this.waitRandom(300, 500);

      await this.page.waitForSelector('input[type="password"]', { timeout: 5000 });
      await this.page.type('input[type="password"]', this.config.password, { delay: 50 });
      await this.waitRandom(500, 1000);
    } catch (error) {
      this.logger.error('Failed to find login form inputs');
      throw new Error('Login form inputs not found');
    }

    // Submit login using helper
    const submitClicked = await clickButtonByText(this.page, 'Enter the Territory', 'Login', 'Log In', 'Sign In', 'Submit');

    if (!submitClicked) {
      this.logger.error('Failed to find login submit button');
      throw new Error('Login submit button not found');
    }

    await this.waitRandom(2000, 3000);

    this.logger.info('Login complete');
    this.metrics.recordAction('login');
  }

  /**
   * Select or create character
   */
  async selectCharacter(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    this.logger.info('Selecting character...');

    try {
      // Try to find existing character by waiting for any button
      await this.page.waitForSelector('button', { timeout: 10000 });

      // Wait a bit for the page to fully load
      await this.waitRandom(1000, 2000);

      // Try to click "Play" button using helper
      const playClicked = await clickButtonByText(this.page, 'Play');

      if (playClicked) {
        this.logger.info(`Selected existing character: ${this.config.characterName}`);
        await this.waitRandom(3000, 5000); // Wait for navigation to game
        await this.waitRandom(2000, 3000);
        this.metrics.recordAction('character_select');
        return; // Exit early - no need to create character
      } else {
        throw new Error('No play button found');
      }
    } catch (error) {
      this.logger.info('No existing character found, will create new one');
      // Create new character
      await this.createNewCharacter();
    }
  }

  /**
   * Create a new character
   */
  private async createNewCharacter(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    this.logger.info('Creating new character...');

    // Find and click "Create Character" button using helper
    const createClicked = await clickButtonByText(
      this.page,
      'Create Your First Character',
      'Create New Character',
      'Create Character'
    );

    if (!createClicked) {
      // Try clicking the dashed card (for existing characters case)
      const dashedCardClicked = await this.page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[class*="border-dashed"]'));
        if (cards.length > 0) {
          const parentButton = (cards[0] as HTMLElement).closest('button');
          if (parentButton) {
            parentButton.click();
            return true;
          }
        }
        return false;
      });

      if (!dashedCardClicked) {
        this.logger.error('Could not find create character button or dashed card');
        throw new Error('Create character button not found');
      }
    }

    this.logger.info('Clicked create character button');
    await this.waitRandom(2000, 3000);

    // Wait for character name input to appear in the modal
    try {
      await this.page.waitForSelector('#character-name', { timeout: 10000 });
      this.logger.info('Character creation form loaded');
    } catch (error) {
      this.logger.error('Character creation form failed to load');
      throw new Error('Character name input not found');
    }

    // Fill in character name
    await this.page.type('#character-name', this.config.characterName, { delay: 50 });
    await this.waitRandom(500, 1000);
    this.logger.info(`Entered character name: ${this.config.characterName}`);

    // Select random faction using radio buttons
    const factionSelected = await this.page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('[role="radio"]'));
      if (radios.length > 0) {
        const randomIndex = Math.floor(Math.random() * radios.length);
        (radios[randomIndex] as HTMLElement).click();
        return true;
      }
      return false;
    });

    if (!factionSelected) {
      this.logger.error('Failed to select faction - no radio buttons found');
      throw new Error('Faction selection failed');
    }

    this.logger.info('Selected faction');
    await this.waitRandom(500, 1000);

    // Click "Next Step" button using helper
    const nextClicked = await clickButtonByText(this.page, 'Next Step', 'Next');

    if (!nextClicked) {
      this.logger.error('Failed to find Next Step button');
      throw new Error('Next Step button not found');
    }

    this.logger.info('Clicked Next Step');
    await this.waitRandom(2000, 3000);

    // Click final "Create" button on confirmation page using helper
    const finalCreateClicked = await clickButtonByText(
      this.page,
      'Create Character'
    );

    if (!finalCreateClicked) {
      this.logger.error('Failed to find final Create Character button');
      throw new Error('Final Create Character button not found');
    }

    this.logger.info(`Created new character: ${this.config.characterName}`);
    await this.waitRandom(3000, 5000); // Wait for character creation to complete
    this.metrics.recordAction('character_select');
  }

  /**
   * Wait for a random amount of time to simulate human behavior
   */
  protected async waitRandom(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Navigate to a page by clicking a navigation link
   */
  protected async navigateTo(linkText: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    this.logger.info(`Navigating to: ${linkText}`);

    const clicked = await clickLinkByText(this.page, linkText);

    if (!clicked) {
      this.logger.warn(`Could not find navigation link: ${linkText}`);
      throw new Error(`Navigation link not found: ${linkText}`);
    }

    await this.waitRandom(1000, 2000);
    this.metrics.recordAction('navigation', { destination: linkText });
  }

  /**
   * Get current gold amount
   */
  protected async getGold(): Promise<number> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      const goldText = await this.page.$eval('[data-testid="gold-amount"], .gold-display',
        el => el.textContent);
      return parseInt(goldText?.replace(/[^0-9]/g, '') || '0');
    } catch (error) {
      this.logger.warn('Failed to get gold amount');
      return 0;
    }
  }

  /**
   * Get current energy
   */
  protected async getEnergy(): Promise<number> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      const energyText = await this.page.$eval('[data-testid="energy-amount"], .energy-display',
        el => el.textContent);
      const match = energyText?.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      this.logger.warn('Failed to get energy amount');
      return 0;
    }
  }

  /**
   * Take a screenshot
   */
  protected async screenshot(name: string): Promise<void> {
    if (!this.page) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshots/${this.config.name}-${name}-${timestamp}.png`;

    try {
      await this.page.screenshot({ path: filename, fullPage: true });
      this.logger.info(`Screenshot saved: ${filename}`);
    } catch (error) {
      this.logger.error(`Failed to take screenshot: ${error}`);
    }
  }

  /**
   * Abstract method: Main bot behavior loop
   */
  abstract runBehaviorLoop(): Promise<void>;

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    try {
      this.isRunning = true;
      this.shouldStop = false;

      await this.initialize();
      await this.login();
      await this.selectCharacter();

      this.logger.info('Starting behavior loop...');
      await this.runBehaviorLoop();

    } catch (error) {
      this.logger.error(`Bot error: ${error}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Stop the bot gracefully
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping bot...');
    this.shouldStop = true;
    await this.waitRandom(2000, 3000);
    await this.cleanup();
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    this.isRunning = false;

    if (this.metrics) {
      this.metrics.saveSummary();
    }

    if (this.browser) {
      await this.browser.close();
      this.logger.info('Browser closed');
    }
  }

  /**
   * Check if the bot should continue running
   */
  protected shouldContinue(): boolean {
    return this.isRunning && !this.shouldStop;
  }
}
