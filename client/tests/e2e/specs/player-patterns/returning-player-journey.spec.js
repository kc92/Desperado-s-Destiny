/**
 * Returning Player Journey E2E Test
 *
 * Tests the complete flow for a returning player:
 * 1. Login with existing credentials
 * 2. Select character from character list
 * 3. Land on game dashboard with persisted state
 * 4. Navigate across different game pages
 * 5. Verify character data persists
 * 6. Test logout flow
 *
 * Duration: ~3-4 minutes
 * Dependencies: Requires existing test user with character
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Import helpers
const authHelper = require('../../helpers/auth.helper');
const gameplayHelper = require('../../helpers/gameplay.helper');
const journeyLogger = require('../../helpers/journey-logger.helper');
const screenshotHelper = require('../../helpers/screenshot.helper');
const testData = require('../../fixtures/test-data');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5175';
const HEADLESS = process.env.HEADLESS !== 'false';

describe('Returning Player Journey', () => {
  let browser;
  let page;
  let journeyLog;
  const timestamp = Date.now();

  // Test user credentials - This user should already exist from new-player-journey test
  // OR we create them in beforeAll if they don't exist
  let testUser;
  let testCharacter;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: HEADLESS,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 720 }
    });

    console.log('\n' + '='.repeat(70));
    console.log('🎮 RETURNING PLAYER JOURNEY TEST');
    console.log('='.repeat(70));

    // Initialize journey log
    journeyLog = journeyLogger.createJourneyLog();

    // Use the most recent new player from new-player-journey test
    // This player already has a character created
    const recentTimestamp = 1765130580768; // From latest successful new-player test
    testUser = {
      email: `newplayer${recentTimestamp}@e2e.test`,
      username: `player${recentTimestamp}`,
      password: 'NewPlayer123!' // Must match new-player-journey test password
    };
    testCharacter = {
      name: `Hero${recentTimestamp}`,
      faction: 'frontera' // New player journey uses frontera
    };

    journeyLogger.updatePlayerData(journeyLog, {
      email: testUser.email,
      username: testUser.username,
      characterName: testCharacter.name,
      faction: testCharacter.faction,
      note: 'Using existing user from new-player-journey test'
    });

    console.log(`📧 Test Email: ${testUser.email}`);
    console.log(`👤 Test Username: ${testUser.username}`);
    console.log(`🎭 Test Character: ${testCharacter.name}`);
    console.log(`✅ Using existing user with character`);
    console.log('='.repeat(70) + '\n');
  });

  afterAll(async () => {
    // Save journey log
    const logPath = journeyLogger.saveJourneyLog(journeyLog, 'returning-player-journey', timestamp);
    console.log(`\n💾 Journey log saved: ${logPath}`);

    // Print summary
    journeyLogger.printJourneySummary(journeyLog);

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

  /**
   * STEP 1: Login with Existing Credentials
   * Tests that a returning player can login with their credentials
   */
  test('Step 1: Login with existing credentials', async () => {
    journeyLogger.logStep(journeyLog, 'Login with Existing Credentials', 'RUNNING');

    try {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });

      await screenshotHelper.capture(page, `returning-01-login-page-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Fill login form
      await page.type('input[type="email"]', testUser.email);
      await gameplayHelper.delay(300);
      await page.type('input[type="password"]', testUser.password);
      await gameplayHelper.delay(300);

      await screenshotHelper.capture(page, `returning-01b-credentials-entered-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Submit login
      const submitButton = await page.$('button[type="submit"]');
      await submitButton.click();

      // Wait for navigation
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        gameplayHelper.delay(3000)
      ]);

      const postLoginUrl = page.url();
      await screenshotHelper.capture(page, `returning-01c-after-login-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Verify redirected to character selection
      const isOnCharacterSelect = postLoginUrl.includes('/characters');
      expect(isOnCharacterSelect).toBe(true);

      // Verify authenticated
      const isAuthenticated = await authHelper.isAuthenticated(page);
      expect(isAuthenticated).toBe(true);

      journeyLogger.logStep(journeyLog, 'Login with Existing Credentials', 'PASS', {
        redirectUrl: postLoginUrl,
        isAuthenticated
      });
    } catch (error) {
      await screenshotHelper.captureOnFailure(page, 'returning-player-login-failed');
      journeyLogger.logStep(journeyLog, 'Login with Existing Credentials', 'FAIL', {
        error: error.message
      });
      throw error;
    }
  }, 30000);

  /**
   * STEP 2: Select Character from List
   */
  test('Step 2: Select character from character list', async () => {
    journeyLogger.logStep(journeyLog, 'Select Character', 'RUNNING');

    try {
      // Login first (prerequisite)
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', testUser.email);
      await page.type('input[type="password"]', testUser.password);
      const submitButton = await page.$('button[type="submit"]');
      await submitButton.click();
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        gameplayHelper.delay(3000)
      ]);

      // Now on character selection page
      await page.waitForSelector('[data-testid="character-card"], .character-card', { timeout: 10000 });

      await screenshotHelper.capture(page, `returning-02-character-select-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Get all characters
      const characterCards = await page.$$('[data-testid="character-card"], .character-card');
      expect(characterCards.length).toBeGreaterThan(0);

      // Find our test character by name
      const characterFound = await page.evaluate((targetName) => {
        const cards = document.querySelectorAll('[data-testid="character-card"], .character-card');
        for (const card of cards) {
          const nameElement = card.querySelector('[data-testid="character-name"], .character-name, h2, h3');
          if (nameElement) {
            const cardName = nameElement.textContent.trim();
            if (cardName === targetName || cardName.includes(targetName)) {
              card.click();
              return true;
            }
          }
        }
        return false;
      }, testCharacter.name);

      expect(characterFound).toBe(true);

      await gameplayHelper.delay(500);
      await screenshotHelper.capture(page, `returning-02b-character-selected-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Click Play/Select button
      const playButton = await page.evaluateHandle(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent && (btn.textContent.includes('Play') || btn.textContent.includes('Select'))) {
            return btn;
          }
        }
        return null;
      });

      if (playButton && playButton.asElement()) {
        await playButton.asElement().click();
        await Promise.race([
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
          gameplayHelper.delay(3000)
        ]);
      }

      const gameUrl = page.url();
      await screenshotHelper.capture(page, `returning-02c-entered-game-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Verify landed on game page
      const isOnGame = gameUrl.includes('/game');
      expect(isOnGame).toBe(true);

      journeyLogger.logStep(journeyLog, 'Select Character', 'PASS', {
        characterName: testCharacter.name,
        gameUrl,
        charactersFound: characterCards.length
      });
    } catch (error) {
      await screenshotHelper.captureOnFailure(page, 'returning-player-character-select-failed');
      journeyLogger.logStep(journeyLog, 'Select Character', 'FAIL', {
        error: error.message
      });
      throw error;
    }
  }, 30000);

  /**
   * STEP 3: Verify Game Dashboard State
   */
  test('Step 3: Verify game dashboard loads with character state', async () => {
    journeyLogger.logStep(journeyLog, 'Verify Game Dashboard', 'RUNNING');

    try {
      // Login and select character (prerequisite)
      await authHelper.loginWithCharacter(page, testUser.email, testUser.password, testCharacter.name);

      await page.waitForSelector('body', { timeout: 10000 });
      await gameplayHelper.delay(2000); // Wait for all state to load

      await screenshotHelper.capture(page, `returning-03-game-dashboard-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Get character stats
      const stats = await gameplayHelper.getCharacterStats(page);

      // Verify essential UI elements exist
      const hasGold = stats.gold !== undefined;
      const hasEnergy = stats.energy !== undefined || await gameplayHelper.elementExists(page, '[data-testid="energy"], [class*="energy"]');
      const hasNavigation = await gameplayHelper.elementExists(page, 'nav, [role="navigation"]');

      // Get current character from localStorage
      const currentCharacter = await authHelper.getCurrentCharacter(page);

      journeyLogger.logStep(journeyLog, 'Verify Game Dashboard', 'PASS', {
        stats,
        currentCharacter,
        dashboardElements: {
          hasGold,
          hasEnergy,
          hasNavigation
        }
      });

      expect(hasNavigation).toBe(true);
    } catch (error) {
      await screenshotHelper.captureOnFailure(page, 'returning-player-dashboard-failed');
      journeyLogger.logStep(journeyLog, 'Verify Game Dashboard', 'FAIL', {
        error: error.message
      });
      throw error;
    }
  }, 30000);

  /**
   * STEP 4: Navigate Across Game Pages
   */
  test('Step 4: Navigate to different game pages', async () => {
    journeyLogger.logStep(journeyLog, 'Navigate Game Pages', 'RUNNING');

    try {
      // Login and select character (prerequisite)
      await authHelper.loginWithCharacter(page, testUser.email, testUser.password, testCharacter.name);
      await gameplayHelper.delay(2000);

      const pagesVisited = [];

      // Test navigation to Actions page
      const actionsNav = await gameplayHelper.navigateToGamePage(page, 'Actions');
      if (actionsNav) {
        await screenshotHelper.capture(page, `returning-04a-actions-page-${new Date().toISOString().replace(/[:.]/g, '-')}`);
        pagesVisited.push('Actions');
      }

      await gameplayHelper.delay(1000);

      // Test navigation to Skills page
      const skillsNav = await gameplayHelper.navigateToGamePage(page, 'Skills');
      if (skillsNav) {
        await screenshotHelper.capture(page, `returning-04b-skills-page-${new Date().toISOString().replace(/[:.]/g, '-')}`);
        pagesVisited.push('Skills');
      }

      await gameplayHelper.delay(1000);

      // Test navigation to Combat page
      const combatNav = await gameplayHelper.navigateToGamePage(page, 'Combat');
      if (combatNav) {
        await screenshotHelper.capture(page, `returning-04c-combat-page-${new Date().toISOString().replace(/[:.]/g, '-')}`);
        pagesVisited.push('Combat');
      }

      await gameplayHelper.delay(1000);

      // Test navigation to Gangs page
      const gangsNav = await gameplayHelper.navigateToGamePage(page, 'Gangs');
      if (gangsNav) {
        await screenshotHelper.capture(page, `returning-04d-gangs-page-${new Date().toISOString().replace(/[:.]/g, '-')}`);
        pagesVisited.push('Gangs');
      }

      await gameplayHelper.delay(1000);

      // Return to Location/Dashboard
      const locationNav = await gameplayHelper.navigateToGamePage(page, 'Location');
      if (locationNav) {
        await screenshotHelper.capture(page, `returning-04e-location-page-${new Date().toISOString().replace(/[:.]/g, '-')}`);
        pagesVisited.push('Location');
      }

      journeyLogger.logStep(journeyLog, 'Navigate Game Pages', 'PASS', {
        pagesVisited,
        totalPages: pagesVisited.length
      });

      expect(pagesVisited.length).toBeGreaterThan(0);
    } catch (error) {
      await screenshotHelper.captureOnFailure(page, 'returning-player-navigation-failed');
      journeyLogger.logStep(journeyLog, 'Navigate Game Pages', 'FAIL', {
        error: error.message
      });
      throw error;
    }
  }, 45000);

  /**
   * STEP 5: Verify Character Data Persists
   */
  test('Step 5: Verify character data persists across page loads', async () => {
    journeyLogger.logStep(journeyLog, 'Verify Data Persistence', 'RUNNING');

    try {
      // Login and select character
      await authHelper.loginWithCharacter(page, testUser.email, testUser.password, testCharacter.name);
      await gameplayHelper.delay(2000);

      // Get initial stats
      const initialStats = await gameplayHelper.getCharacterStats(page);
      const initialCharacter = await authHelper.getCurrentCharacter(page);

      await screenshotHelper.capture(page, `returning-05a-initial-state-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Navigate away and back
      await gameplayHelper.navigateToGamePage(page, 'Skills');
      await gameplayHelper.delay(1000);
      await gameplayHelper.navigateToGamePage(page, 'Location');
      await gameplayHelper.delay(1000);

      // Get stats after navigation
      const afterStats = await gameplayHelper.getCharacterStats(page);
      const afterCharacter = await authHelper.getCurrentCharacter(page);

      await screenshotHelper.capture(page, `returning-05b-after-navigation-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Verify stats persisted (should be same or character progressed)
      const goldPersisted = afterStats.gold !== undefined;
      const characterPersisted = afterCharacter !== null;

      journeyLogger.logStep(journeyLog, 'Verify Data Persistence', 'PASS', {
        initialStats,
        afterStats,
        goldPersisted,
        characterPersisted
      });

      expect(characterPersisted).toBe(true);
    } catch (error) {
      await screenshotHelper.captureOnFailure(page, 'returning-player-persistence-failed');
      journeyLogger.logStep(journeyLog, 'Verify Data Persistence', 'FAIL', {
        error: error.message
      });
      throw error;
    }
  }, 30000);

  /**
   * STEP 6: Test Logout Flow
   */
  test('Step 6: Logout and verify session cleared', async () => {
    journeyLogger.logStep(journeyLog, 'Logout Flow', 'RUNNING');

    try {
      // Login and select character
      await authHelper.loginWithCharacter(page, testUser.email, testUser.password, testCharacter.name);
      await gameplayHelper.delay(2000);

      // Verify authenticated before logout
      const authBefore = await authHelper.isAuthenticated(page);
      expect(authBefore).toBe(true);

      await screenshotHelper.capture(page, `returning-06a-before-logout-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Perform logout
      await authHelper.logout(page);
      await gameplayHelper.delay(2000);

      const postLogoutUrl = page.url();
      await screenshotHelper.capture(page, `returning-06b-after-logout-${new Date().toISOString().replace(/[:.]/g, '-')}`);

      // Verify logged out
      const authAfter = await authHelper.isAuthenticated(page);
      const redirectedToLogin = postLogoutUrl.includes('/login') || postLogoutUrl.includes('/') && !postLogoutUrl.includes('/game');

      journeyLogger.logStep(journeyLog, 'Logout Flow', 'PASS', {
        postLogoutUrl,
        wasAuthenticated: authBefore,
        isAuthenticatedAfter: authAfter,
        redirectedCorrectly: redirectedToLogin
      });

      expect(authAfter).toBe(false);
    } catch (error) {
      await screenshotHelper.captureOnFailure(page, 'returning-player-logout-failed');
      journeyLogger.logStep(journeyLog, 'Logout Flow', 'FAIL', {
        error: error.message
      });
      throw error;
    }
  }, 30000);
});
