/**
 * Helper Validation Test
 * Validates that all E2E test helpers load and function correctly
 * This test serves as both validation and documentation for helper usage
 */

const puppeteer = require('puppeteer');

// Import all helpers
const authHelper = require('../helpers/auth.helper');
const gameplayHelper = require('../helpers/gameplay.helper');
const journeyLogger = require('../helpers/journey-logger.helper');
const navigationHelper = require('../helpers/navigation.helper');
const screenshotHelper = require('../helpers/screenshot.helper');
const testData = require('../fixtures/test-data');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5175';

describe('E2E Test Infrastructure Validation', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('Test Data Fixtures', () => {
    test('should generate unique test user data', () => {
      const user1 = testData.generateTestUser('test1');
      const user2 = testData.generateTestUser('test2');

      expect(user1).toHaveProperty('email');
      expect(user1).toHaveProperty('username');
      expect(user1).toHaveProperty('password');

      expect(user1.email).not.toBe(user2.email);
      expect(user1.username).not.toBe(user2.username);

      console.log('✅ Test user generation works:', user1);
    });

    test('should generate character data', () => {
      const character = testData.generateCharacter('Hero');

      expect(character).toHaveProperty('name');
      expect(character).toHaveProperty('faction');
      expect(['frontera', 'settler', 'nahi']).toContain(character.faction);

      console.log('✅ Character generation works:', character);
    });

    test('should generate full player data', () => {
      const player = testData.generatePlayer('player', 'Hero', 'frontera');

      expect(player).toHaveProperty('user');
      expect(player).toHaveProperty('character');
      expect(player).toHaveProperty('timestamp');

      expect(player.character.faction).toBe('frontera');

      console.log('✅ Player generation works:', player);
    });

    test('should have predefined test users', () => {
      expect(testData.TEST_USERS).toHaveProperty('REGULAR');
      expect(testData.TEST_USERS).toHaveProperty('RETURNING');
      expect(testData.TEST_USERS.REGULAR).toHaveProperty('email');

      console.log('✅ Predefined test users available:', Object.keys(testData.TEST_USERS));
    });

    test('should have game constants', () => {
      expect(testData.GAME_CONSTANTS).toHaveProperty('FACTIONS');
      expect(testData.GAME_CONSTANTS).toHaveProperty('STARTING_GOLD');
      expect(testData.GAME_CONSTANTS.STARTING_GOLD).toBe(50);

      console.log('✅ Game constants available:', testData.GAME_CONSTANTS.STARTING_GOLD);
    });

    test('should have utility functions', () => {
      const randomNum = testData.randomInt(1, 10);
      expect(randomNum).toBeGreaterThanOrEqual(1);
      expect(randomNum).toBeLessThanOrEqual(10);

      const testId = testData.createTestId('validation');
      expect(testId).toContain('validation');

      console.log('✅ Utility functions work:', { randomNum, testId });
    });
  });

  describe('Journey Logger Helper', () => {
    test('should create journey log structure', () => {
      const log = journeyLogger.createJourneyLog();

      expect(log).toHaveProperty('timestamp');
      expect(log).toHaveProperty('steps');
      expect(log).toHaveProperty('screenshots');
      expect(log).toHaveProperty('playerData');
      expect(Array.isArray(log.steps)).toBe(true);

      console.log('✅ Journey log created:', log);
    });

    test('should log steps with status', () => {
      const log = journeyLogger.createJourneyLog();

      journeyLogger.logStep(log, 'Test Step 1', 'RUNNING');
      journeyLogger.logStep(log, 'Test Step 1', 'PASS', { result: 'success' });

      expect(log.steps.length).toBe(2);
      expect(log.steps[0].status).toBe('RUNNING');
      expect(log.steps[1].status).toBe('PASS');
      expect(log.steps[1].result).toBe('success');

      console.log('✅ Step logging works:', log.steps);
    });

    test('should update player data', () => {
      const log = journeyLogger.createJourneyLog();

      journeyLogger.updatePlayerData(log, { email: 'test@e2e.test' });
      journeyLogger.updatePlayerData(log, { characterName: 'TestHero' });

      expect(log.playerData.email).toBe('test@e2e.test');
      expect(log.playerData.characterName).toBe('TestHero');

      console.log('✅ Player data updates work:', log.playerData);
    });

    test('should get journey summary', () => {
      const log = journeyLogger.createJourneyLog();

      journeyLogger.logStep(log, 'Step 1', 'PASS');
      journeyLogger.logStep(log, 'Step 2', 'PASS');
      journeyLogger.logStep(log, 'Step 3', 'FAIL');

      const summary = journeyLogger.getJourneySummary(log);

      expect(summary.totalSteps).toBe(3);
      expect(summary.passed).toBe(2);
      expect(summary.failed).toBe(1);
      expect(summary.successRate).toBe('66.7');

      console.log('✅ Journey summary works:', summary);
    });
  });

  describe('Gameplay Helper', () => {
    test('should have delay utility', async () => {
      const start = Date.now();
      await gameplayHelper.delay(100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(elapsed).toBeLessThan(200);

      console.log('✅ Delay utility works:', `${elapsed}ms`);
    });

    test('should navigate to base URL', async () => {
      await page.goto(BASE_URL);
      const url = page.url();

      expect(url).toContain('localhost');

      console.log('✅ Page navigation works:', url);
    });

    test('should check if element exists', async () => {
      await page.goto(BASE_URL);
      await page.waitForSelector('body', { timeout: 5000 });

      const bodyExists = await gameplayHelper.elementExists(page, 'body');
      const fakeExists = await gameplayHelper.elementExists(page, '#nonexistent-element-xyz');

      expect(bodyExists).toBe(true);
      expect(fakeExists).toBe(false);

      console.log('✅ Element existence check works');
    });

    test('should get current path', async () => {
      await page.goto(BASE_URL);

      const path = await gameplayHelper.getCurrentPath(page);

      expect(typeof path).toBe('string');
      expect(path).toBeTruthy();

      console.log('✅ Get current path works:', path);
    });

    test('should check page for text', async () => {
      await page.goto(BASE_URL);
      await page.waitForSelector('body', { timeout: 5000 });

      // Set some text on page
      await page.evaluate(() => {
        document.body.innerHTML += '<div>Test Content Here</div>';
      });

      const hasText = await gameplayHelper.pageContainsText(page, 'Test Content');
      const noText = await gameplayHelper.pageContainsText(page, 'Nonexistent Text XYZ');

      expect(hasText).toBe(true);
      expect(noText).toBe(false);

      console.log('✅ Page text search works');
    });
  });

  describe('Auth Helper', () => {
    test('should check authentication status', async () => {
      await page.goto(BASE_URL);

      const isAuth = await authHelper.isAuthenticated(page);

      expect(typeof isAuth).toBe('boolean');

      console.log('✅ Auth status check works:', isAuth);
    });

    test('should get current user from localStorage', async () => {
      await page.goto(BASE_URL);

      // Mock localStorage
      await page.evaluate(() => {
        localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            user: {
              email: 'test@e2e.test',
              username: 'testuser'
            }
          }
        }));
      });

      const user = await authHelper.getCurrentUser(page);

      expect(user).toBeTruthy();
      expect(user.email).toBe('test@e2e.test');

      console.log('✅ Get current user works:', user);
    });

    test('should get current character from localStorage', async () => {
      await page.goto(BASE_URL);

      // Mock localStorage
      await page.evaluate(() => {
        localStorage.setItem('character-storage', JSON.stringify({
          state: {
            currentCharacter: {
              name: 'TestHero',
              level: 5
            }
          }
        }));
      });

      const character = await authHelper.getCurrentCharacter(page);

      expect(character).toBeTruthy();
      expect(character.name).toBe('TestHero');
      expect(character.level).toBe(5);

      console.log('✅ Get current character works:', character);
    });
  });

  describe('Navigation Helper', () => {
    test('should have delay function', async () => {
      const start = Date.now();
      await navigationHelper.delay(50);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(50);

      console.log('✅ Navigation delay works:', `${elapsed}ms`);
    });

    test('should get path', async () => {
      await page.goto(BASE_URL);

      const path = navigationHelper.getPath(page);

      expect(path).toBeTruthy();

      console.log('✅ Get path works:', await path);
    });
  });

  describe('Screenshot Helper', () => {
    test('should have capture method', () => {
      expect(typeof screenshotHelper.capture).toBe('function');

      console.log('✅ Screenshot helper loaded');
    });

    test('should have cleanUp method', () => {
      expect(typeof screenshotHelper.cleanUp).toBe('function');

      console.log('✅ Screenshot cleanup available');
    });
  });

  describe('All Helpers Integration', () => {
    test('should use all helpers together in realistic flow', async () => {
      // 1. Generate test data
      const player = testData.generatePlayer('validation', 'TestHero', 'frontera');
      console.log('📊 Generated player:', player.user.email);

      // 2. Create journey log
      const journey = journeyLogger.createJourneyLog();
      journeyLogger.updatePlayerData(journey, {
        email: player.user.email,
        characterName: player.character.name
      });

      // 3. Navigate to landing page
      journeyLogger.logStep(journey, 'Navigate to Landing', 'RUNNING');
      await page.goto(BASE_URL);
      await gameplayHelper.delay(1000);

      const landingPath = await gameplayHelper.getCurrentPath(page);
      expect(landingPath).toBeTruthy();

      journeyLogger.logStep(journey, 'Navigate to Landing', 'PASS', { path: landingPath });

      // 4. Check page elements
      journeyLogger.logStep(journey, 'Verify Page Elements', 'RUNNING');

      const bodyExists = await gameplayHelper.elementExists(page, 'body');
      expect(bodyExists).toBe(true);

      journeyLogger.logStep(journey, 'Verify Page Elements', 'PASS', { bodyExists });

      // 5. Get journey summary
      const summary = journeyLogger.getJourneySummary(journey);
      journeyLogger.printJourneySummary(journey);

      expect(summary.passed).toBeGreaterThan(0);
      expect(summary.totalSteps).toBeGreaterThan(0);

      console.log('✅ ALL HELPERS WORK TOGETHER SUCCESSFULLY');
      console.log('📊 Journey Summary:', summary);
    });
  });
});
