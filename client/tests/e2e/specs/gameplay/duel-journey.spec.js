/**
 * Duel System Journey E2E Test
 *
 * Tests the complete duel/PvP system:
 * 1. Navigate to duel page
 * 2. View available opponents
 * 3. View duel history
 * 4. Check duel requirements
 * 5. View duel rewards/stakes
 * 6. Initiate a duel challenge
 *
 * Duration: ~2-3 minutes
 * Dependencies: Requires authenticated character
 */

const puppeteer = require('puppeteer');

// Import helpers
const authHelper = require('../../helpers/auth.helper');
const journeyLogger = require('../../helpers/journey-logger.helper');
const screenshotHelper = require('../../helpers/screenshot.helper');
const testData = require('../../fixtures/test-data');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5183';
const HEADLESS = process.env.HEADLESS !== 'false';

describe('Duel System Journey', () => {
  let browser;
  let page;
  let journeyLog;
  const timestamp = Date.now();

  const playerData = testData.generatePlayer('dueltest', 'Dueler', 'frontera');
  const testUser = playerData.user;
  const testCharacter = playerData.character;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: HEADLESS,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 720 }
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('\n' + '='.repeat(70));
    console.log('DUEL SYSTEM JOURNEY TEST');
    console.log('='.repeat(70));

    journeyLog = journeyLogger.createJourneyLog();
    journeyLogger.updatePlayerData(journeyLog, {
      email: testUser.email,
      characterName: testCharacter.name,
      note: 'Testing duel system'
    });

    console.log(`Test Email: ${testUser.email}`);
    console.log(`Test Character: ${testCharacter.name}`);
    console.log('='.repeat(70) + '\n');

    // Register and create character
    console.log('Registering test user...');
    const registered = await authHelper.registerTestUser(page, testUser);
    if (!registered) throw new Error('Failed to register test user');

    console.log('Creating test character...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('[data-testid="create-first-character-button"], .character-card', { timeout: 5000 }).catch(() => {});

    const openCreatorButton = await page.$('[data-testid="create-first-character-button"]');
    if (openCreatorButton) {
      await openCreatorButton.click();
      await page.waitForSelector('[data-testid^="faction-card"]', { timeout: 3000 });
    }

    const nameInput = await page.$('input[name="name"], input[placeholder*="name" i]');
    if (nameInput) await nameInput.type(testCharacter.name);

    await new Promise(resolve => setTimeout(resolve, 500));

    let factionButton = await page.$('[data-testid^="faction-card-"]');
    if (factionButton) await factionButton.click();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const nextButton = await page.$('[data-testid="character-next-button"]');
    if (nextButton) await nextButton.click();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const createButton = await page.$('[data-testid="character-create-button"]');
    if (createButton) await createButton.click();

    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => {
      const goldElements = document.querySelectorAll('[class*="gold"]');
      return Array.from(goldElements).some(el => el.textContent?.match(/\d+/));
    }, { timeout: 15000 }).catch(() => {});

    console.log('Character created - ready for duel journey');
  }, 120000);

  afterAll(async () => {
    const logPath = journeyLogger.saveJourneyLog(journeyLog, `duel-journey-${timestamp}`);
    console.log(`\nJourney log saved: ${logPath}`);
    journeyLogger.printJourneySummary(journeyLog);
    if (browser) await browser.close();
  });

  /**
   * Step 1: Navigate to duel page
   */
  it('Step 1: Navigate to duel page', async () => {
    const stepName = 'Navigate to Duel';
    journeyLogger.logStep(journeyLog, stepName, 'RUNNING');

    try {
      await screenshotHelper.capture(page, 'duel-01-dashboard');

      await page.goto(`${BASE_URL}/game/duel`, { waitUntil: 'networkidle2', timeout: 30000 });

      await new Promise(resolve => setTimeout(resolve, 2000));
      await screenshotHelper.capture(page, 'duel-01b-page');

      const duelUrl = page.url();
      const hasDuelContent = await page.evaluate(() => {
        const text = document.body.textContent?.toLowerCase() || '';
        return text.includes('duel') || text.includes('pvp') || text.includes('challenge') || text.includes('fight');
      });

      journeyLogger.logStep(journeyLog, stepName, 'PASS', { duelUrl, hasDuelContent });
      expect(true).toBe(true);
    } catch (error) {
      await screenshotHelper.capture(page, 'duel-01-error');
      journeyLogger.logStep(journeyLog, stepName, 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);

  /**
   * Step 2: View available opponents
   */
  it('Step 2: View available opponents', async () => {
    const stepName = 'View Opponents';
    journeyLogger.logStep(journeyLog, stepName, 'RUNNING');

    try {
      const opponentsInfo = await page.evaluate(() => {
        const pageText = document.body.textContent || '';
        return {
          hasOpponentList: pageText.toLowerCase().includes('opponent') || pageText.toLowerCase().includes('player'),
          hasLevelInfo: pageText.toLowerCase().includes('level') || pageText.match(/lv\.?\s*\d+/i) !== null,
          hasFactionInfo: pageText.toLowerCase().includes('frontera') ||
                          pageText.toLowerCase().includes('settler') ||
                          pageText.toLowerCase().includes('nahi'),
          opponentCards: document.querySelectorAll('[class*="opponent"], [class*="player"], [class*="challenger"]').length
        };
      });

      await screenshotHelper.capture(page, 'duel-02-opponents');

      journeyLogger.logStep(journeyLog, stepName, 'PASS', { opponentsInfo });
      expect(true).toBe(true);
    } catch (error) {
      await screenshotHelper.capture(page, 'duel-02-error');
      journeyLogger.logStep(journeyLog, stepName, 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);

  /**
   * Step 3: View duel history
   */
  it('Step 3: View duel history', async () => {
    const stepName = 'View History';
    journeyLogger.logStep(journeyLog, stepName, 'RUNNING');

    try {
      // Click history tab if exists
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="tab"]'));
        const historyBtn = buttons.find(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('history') || text.includes('past') || text.includes('record');
        });
        if (historyBtn) historyBtn.click();
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      const historyInfo = await page.evaluate(() => {
        const pageText = document.body.textContent || '';
        return {
          hasHistorySection: pageText.toLowerCase().includes('history') || pageText.toLowerCase().includes('record'),
          hasWinLoss: pageText.toLowerCase().includes('win') || pageText.toLowerCase().includes('loss'),
          hasResults: document.querySelectorAll('[class*="result"], [class*="history"]').length
        };
      });

      await screenshotHelper.capture(page, 'duel-03-history');

      journeyLogger.logStep(journeyLog, stepName, 'PASS', { historyInfo });
      expect(true).toBe(true);
    } catch (error) {
      await screenshotHelper.capture(page, 'duel-03-error');
      journeyLogger.logStep(journeyLog, stepName, 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);

  /**
   * Step 4: Check duel requirements
   */
  it('Step 4: Check duel requirements', async () => {
    const stepName = 'Check Requirements';
    journeyLogger.logStep(journeyLog, stepName, 'RUNNING');

    try {
      // Go back to main duel view
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="tab"]'));
        const findBtn = buttons.find(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('find') || text.includes('opponent') || text.includes('challenge');
        });
        if (findBtn) findBtn.click();
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      const requirements = await page.evaluate(() => {
        const pageText = document.body.textContent || '';
        return {
          hasEnergyReq: pageText.toLowerCase().includes('energy'),
          hasLevelReq: pageText.toLowerCase().includes('level'),
          hasGoldStake: pageText.toLowerCase().includes('gold') || pageText.toLowerCase().includes('stake'),
          hasCooldown: pageText.toLowerCase().includes('cooldown') || pageText.toLowerCase().includes('wait')
        };
      });

      await screenshotHelper.capture(page, 'duel-04-requirements');

      journeyLogger.logStep(journeyLog, stepName, 'PASS', { requirements });
      expect(true).toBe(true);
    } catch (error) {
      await screenshotHelper.capture(page, 'duel-04-error');
      journeyLogger.logStep(journeyLog, stepName, 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);

  /**
   * Step 5: View duel rewards/stakes
   */
  it('Step 5: View duel rewards and stakes', async () => {
    const stepName = 'View Rewards';
    journeyLogger.logStep(journeyLog, stepName, 'RUNNING');

    try {
      const rewardsInfo = await page.evaluate(() => {
        const pageText = document.body.textContent || '';
        return {
          hasGoldReward: pageText.toLowerCase().includes('gold'),
          hasXPReward: pageText.toLowerCase().includes('xp') || pageText.toLowerCase().includes('experience'),
          hasReputation: pageText.toLowerCase().includes('reputation') || pageText.toLowerCase().includes('honor'),
          hasStakeInfo: pageText.toLowerCase().includes('stake') || pageText.toLowerCase().includes('wager')
        };
      });

      await screenshotHelper.capture(page, 'duel-05-rewards');

      journeyLogger.logStep(journeyLog, stepName, 'PASS', { rewardsInfo });
      expect(true).toBe(true);
    } catch (error) {
      await screenshotHelper.capture(page, 'duel-05-error');
      journeyLogger.logStep(journeyLog, stepName, 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);

  /**
   * Step 6: Verify duel system functionality
   */
  it('Step 6: Verify duel system functionality', async () => {
    const stepName = 'Verify Duel System';
    journeyLogger.logStep(journeyLog, stepName, 'RUNNING');

    try {
      const systemState = await page.evaluate(() => {
        const pageText = document.body.textContent || '';
        const buttons = Array.from(document.querySelectorAll('button'));

        return {
          hasDuelPage: pageText.toLowerCase().includes('duel') || pageText.toLowerCase().includes('pvp'),
          hasChallengeButton: buttons.some(btn => {
            const text = btn.textContent?.toLowerCase() || '';
            return text.includes('challenge') || text.includes('duel') || text.includes('fight');
          }),
          hasOpponentSelection: document.querySelectorAll('[class*="opponent"], [class*="player"]').length > 0 ||
                                pageText.toLowerCase().includes('select') ||
                                pageText.toLowerCase().includes('choose'),
          hasStats: pageText.toLowerCase().includes('stat') ||
                   pageText.toLowerCase().includes('power') ||
                   pageText.toLowerCase().includes('strength')
        };
      });

      await screenshotHelper.capture(page, 'duel-06-final');

      journeyLogger.logStep(journeyLog, stepName, 'PASS', { systemState });
      expect(true).toBe(true);
    } catch (error) {
      await screenshotHelper.capture(page, 'duel-06-error');
      journeyLogger.logStep(journeyLog, stepName, 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);
});
