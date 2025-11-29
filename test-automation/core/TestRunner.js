/**
 * TestRunner - Core testing utility for Desperados Destiny
 * The foundation for all autonomous testing agents
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class TestRunner {
  constructor(agentName = 'TestAgent') {
    this.agentName = agentName;
    this.browser = null;
    this.page = null;
    this.errors = [];
    this.bugs = [];
    this.screenshots = [];
    this.startTime = null;
    this.config = {
      baseUrl: 'http://localhost:3001',
      apiUrl: 'http://localhost:3000/api',
      headless: false,
      slowMo: 50, // Slow down actions for visibility
      devtools: true,
      defaultTimeout: 30000,
      viewport: { width: 1280, height: 720 }
    };
  }

  /**
   * Initialize the browser and page
   */
  async initialize() {
    console.log(`🤠 ${this.agentName} - Initializing...`);
    this.startTime = Date.now();

    try {
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        devtools: this.config.devtools,
        slowMo: this.config.slowMo,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
    } catch (error) {
      console.error(`❌ Failed to launch browser: ${error.message}`);
      throw error;
    }

    this.page = await this.browser.newPage();
    await this.page.setViewport(this.config.viewport);

    // Set up error tracking
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.trackError('Console Error', msg.text(), msg.location());
      }
    });

    this.page.on('pageerror', error => {
      this.trackError('Page Error', error.message, error.stack);
    });

    this.page.on('requestfailed', request => {
      this.trackError('Request Failed', `${request.url()} - ${request.failure().errorText}`);
    });

    // Track responses
    this.page.on('response', response => {
      if (response.status() >= 400) {
        this.trackError('HTTP Error', `${response.status()} - ${response.url()}`);
      }
    });

    console.log(`✅ ${this.agentName} - Initialized successfully`);
  }

  /**
   * Track an error for reporting
   */
  trackError(type, message, details = null) {
    const error = {
      timestamp: new Date().toISOString(),
      type,
      message,
      details,
      url: this.page.url(),
      agent: this.agentName
    };
    this.errors.push(error);
    console.error(`❌ ${type}: ${message}`);
  }

  /**
   * Report a bug with severity and details
   */
  async reportBug(severity, title, description, reproduction = null) {
    const bug = {
      id: `BUG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      agent: this.agentName,
      severity, // P0, P1, P2, P3
      title,
      description,
      reproduction,
      url: this.page.url(),
      screenshot: await this.takeScreenshot(`bug-${this.bugs.length}`)
    };

    this.bugs.push(bug);
    console.log(`🐛 ${severity} Bug Reported: ${title}`);

    // Auto-fix P0 and P1 bugs if possible
    if (severity === 'P0' || severity === 'P1') {
      await this.attemptAutoFix(bug);
    }

    return bug;
  }

  /**
   * Attempt to automatically fix a bug
   */
  async attemptAutoFix(bug) {
    console.log(`🔧 Attempting to auto-fix ${bug.severity} bug: ${bug.title}`);
    // This will be expanded with specific fix strategies
    // For now, just log the attempt
    return false;
  }

  /**
   * Take a screenshot and save it
   */
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${this.agentName}-${name}-${timestamp}.png`;
    const filepath = path.join(__dirname, '..', 'screenshots', filename);

    try {
      await this.page.screenshot({ path: filepath, fullPage: true });
      this.screenshots.push(filename);
      console.log(`📸 Screenshot saved: ${filename}`);
      return filename;
    } catch (error) {
      console.error(`Failed to take screenshot: ${error.message}`);
      return null;
    }
  }

  /**
   * Navigate to a URL with retry logic
   */
  async goto(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.page.goto(fullUrl, {
          waitUntil: 'networkidle2',
          timeout: this.config.defaultTimeout,
          ...options
        });
        return true;
      } catch (error) {
        console.log(`⚠️ Navigation attempt ${i + 1} failed: ${error.message}`);
        if (i === maxRetries - 1) {
          this.trackError('Navigation Failed', `Could not navigate to ${fullUrl}`, error.message);
          return false;
        }
        await this.wait(2000);
      }
    }
  }

  /**
   * Wait for a selector with built-in error handling
   */
  async waitForSelector(selector, options = {}) {
    try {
      return await this.page.waitForSelector(selector, {
        timeout: this.config.defaultTimeout,
        ...options
      });
    } catch (error) {
      this.trackError('Element Not Found', `Selector not found: ${selector}`, error.message);
      return null;
    }
  }

  /**
   * Type text into an input field
   */
  async type(selector, text, options = {}) {
    const element = await this.waitForSelector(selector);
    if (!element) return false;

    try {
      await this.page.focus(selector);
      await this.page.type(selector, text, { delay: 50, ...options });
      return true;
    } catch (error) {
      this.trackError('Type Failed', `Could not type into ${selector}`, error.message);
      return false;
    }
  }

  /**
   * Click an element
   */
  async click(selector, options = {}) {
    const element = await this.waitForSelector(selector);
    if (!element) return false;

    try {
      await this.page.click(selector, options);
      return true;
    } catch (error) {
      this.trackError('Click Failed', `Could not click ${selector}`, error.message);
      return false;
    }
  }

  /**
   * Wait for navigation after an action
   */
  async waitForNavigation(options = {}) {
    try {
      await this.page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: this.config.defaultTimeout,
        ...options
      });
      return true;
    } catch (error) {
      this.trackError('Navigation Timeout', 'Navigation did not complete in time', error.message);
      return false;
    }
  }

  /**
   * Check if an element exists on the page
   */
  async exists(selector) {
    try {
      const element = await this.page.$(selector);
      return element !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get text content of an element
   */
  async getText(selector) {
    try {
      return await this.page.$eval(selector, el => el.textContent);
    } catch {
      return null;
    }
  }

  /**
   * Get multiple elements' text content
   */
  async getTexts(selector) {
    try {
      return await this.page.$$eval(selector, els => els.map(el => el.textContent));
    } catch {
      return [];
    }
  }

  /**
   * Execute JavaScript in the page context
   */
  async evaluate(fn, ...args) {
    try {
      return await this.page.evaluate(fn, ...args);
    } catch (error) {
      this.trackError('Evaluate Failed', 'JavaScript execution failed', error.message);
      return null;
    }
  }

  /**
   * Wait for a specific amount of time
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check for console errors
   */
  async checkForErrors() {
    const recentErrors = this.errors.filter(e =>
      new Date(e.timestamp) > new Date(Date.now() - 5000)
    );

    if (recentErrors.length > 0) {
      console.log(`⚠️ Found ${recentErrors.length} recent errors`);
      return recentErrors;
    }
    return [];
  }

  /**
   * Login as a test user
   */
  async loginAs(email, password) {
    console.log(`🔐 Logging in as ${email}...`);

    await this.goto('/login');
    await this.wait(1000);

    if (!await this.type('input[name="email"]', email)) {
      return false;
    }

    if (!await this.type('input[name="password"]', password)) {
      return false;
    }

    if (!await this.click('button[type="submit"]')) {
      return false;
    }

    // Wait for navigation (hard reload expected)
    await this.wait(3000);

    // Check if we're on the characters page
    const url = this.page.url();
    if (url.includes('/characters')) {
      console.log(`✅ Successfully logged in as ${email}`);
      return true;
    } else {
      this.trackError('Login Failed', `Failed to login as ${email}`, `Ended up at ${url}`);
      return false;
    }
  }

  /**
   * Create a test user with a specific faction
   */
  async createTestUser(email, password, username) {
    console.log(`👤 Creating test user: ${email}`);

    await this.goto('/register');
    await this.wait(1000);

    if (!await this.type('input[name="username"]', username)) return false;
    if (!await this.type('input[name="email"]', email)) return false;
    if (!await this.type('input[name="password"]', password)) return false;
    if (!await this.type('input[name="confirmPassword"]', password)) return false;

    if (!await this.click('button[type="submit"]')) return false;

    await this.wait(2000);

    // Check for success
    const url = this.page.url();
    if (url.includes('/verify-email') || url.includes('/login')) {
      console.log(`✅ Test user created: ${email}`);
      // Auto-verify email (mock verification)
      await this.verifyEmail(email);
      return true;
    } else {
      this.trackError('Registration Failed', `Failed to create user ${email}`, `Ended up at ${url}`);
      return false;
    }
  }

  /**
   * Mock email verification
   */
  async verifyEmail(email) {
    console.log(`📧 Verifying email for ${email} (mocked)`);
    // In a real test environment, we'd either:
    // 1. Have a test endpoint to auto-verify
    // 2. Parse the verification token from logs
    // 3. Use a test email service
    // For now, we'll assume it's verified on next login
    return true;
  }

  /**
   * Create a character with specified name and faction
   */
  async createCharacter(name, faction) {
    console.log(`🎮 Creating character: ${name} (${faction})`);

    // Make sure we're on the characters page
    if (!this.page.url().includes('/characters')) {
      await this.goto('/characters');
      await this.wait(2000);
    }

    // Click create character button
    const createButton = await this.waitForSelector('button:has-text("Create"), button:has-text("New Character")');
    if (!createButton) {
      // Use a different selector approach
      const buttons = await this.getTexts('button');
      const createButtonIndex = buttons.findIndex(text =>
        text && (text.includes('Create') || text.includes('New Character'))
      );

      if (createButtonIndex >= 0) {
        const buttonElements = await this.page.$$('button');
        await buttonElements[createButtonIndex].click();
      } else {
        this.trackError('Create Button Not Found', 'Could not find create character button');
        return false;
      }
    } else {
      await createButton.click();
    }

    await this.wait(1000);

    // Fill in character details
    if (!await this.type('input[name="name"]', name)) return false;

    // Select faction
    const factionSelector = `input[value="${faction}"], button[data-faction="${faction}"]`;
    if (!await this.click(factionSelector)) {
      console.log(`⚠️ Could not select faction ${faction}`);
    }

    // Confirm creation
    if (!await this.click('button:has-text("Create Character"), button:has-text("Confirm")')) {
      return false;
    }

    await this.wait(2000);

    console.log(`✅ Character created: ${name}`);
    return true;
  }

  /**
   * Select a character by index or name
   */
  async selectCharacter(indexOrName) {
    console.log(`🎯 Selecting character: ${indexOrName}`);

    if (typeof indexOrName === 'number') {
      // Select by index
      const cards = await this.page.$$('[data-testid="character-card"], .character-card');
      if (cards[indexOrName]) {
        await cards[indexOrName].click();
        await this.wait(2000);
        return true;
      }
    } else {
      // Select by name
      const nameElements = await this.getTexts('.character-name, h3, h2');
      const index = nameElements.findIndex(name => name && name.includes(indexOrName));
      if (index >= 0) {
        const cards = await this.page.$$('[data-testid="character-card"], .character-card');
        if (cards[index]) {
          await cards[index].click();
          await this.wait(2000);
          return true;
        }
      }
    }

    this.trackError('Character Selection Failed', `Could not select character: ${indexOrName}`);
    return false;
  }

  /**
   * Check current game state
   */
  async getGameState() {
    return await this.evaluate(() => {
      const authStore = localStorage.getItem('auth-store');
      const gameStore = localStorage.getItem('game-store');

      return {
        auth: authStore ? JSON.parse(authStore) : null,
        game: gameStore ? JSON.parse(gameStore) : null,
        url: window.location.pathname,
        cookies: document.cookie
      };
    });
  }

  /**
   * Generate a test report
   */
  async generateReport() {
    const duration = Date.now() - this.startTime;
    const report = {
      agent: this.agentName,
      timestamp: new Date().toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      errors: this.errors.length,
      bugs: this.bugs.length,
      screenshots: this.screenshots.length,

      bugsByPriority: {
        P0: this.bugs.filter(b => b.severity === 'P0').length,
        P1: this.bugs.filter(b => b.severity === 'P1').length,
        P2: this.bugs.filter(b => b.severity === 'P2').length,
        P3: this.bugs.filter(b => b.severity === 'P3').length
      },

      errorTypes: this.errors.reduce((acc, err) => {
        acc[err.type] = (acc[err.type] || 0) + 1;
        return acc;
      }, {}),

      details: {
        errors: this.errors,
        bugs: this.bugs,
        screenshots: this.screenshots
      }
    };

    // Save report to file
    const reportPath = path.join(
      __dirname,
      '..',
      'reports',
      `${this.agentName}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );

    try {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`📊 Report saved to: ${reportPath}`);
    } catch (error) {
      console.error(`Failed to save report: ${error.message}`);
    }

    return report;
  }

  /**
   * Clean up and close browser
   */
  async cleanup() {
    console.log(`🧹 ${this.agentName} - Cleaning up...`);

    const report = await this.generateReport();

    if (this.browser) {
      await this.browser.close();
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 ${this.agentName} - Test Summary`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Duration: ${report.duration}`);
    console.log(`Errors Found: ${report.errors}`);
    console.log(`Bugs Reported: ${report.bugs} (P0: ${report.bugsByPriority.P0}, P1: ${report.bugsByPriority.P1})`);
    console.log(`Screenshots Taken: ${report.screenshots}`);
    console.log(`${'='.repeat(60)}\n`);

    return report;
  }
}

module.exports = TestRunner;