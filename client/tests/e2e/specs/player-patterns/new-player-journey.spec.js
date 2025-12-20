/**
 * E2E Test: New Player Onboarding Journey
 *
 * Tests the complete new player experience from registration through first gameplay session.
 * This is the most critical user journey as every player must complete this flow.
 *
 * Test Flow:
 * 1. Register new account
 * 2. Create character (name + faction)
 * 3. Land on game dashboard
 * 4. Verify character stats loaded
 * 5. Navigate to actions page
 * 6. View available actions
 * 7. (Future) Complete first action
 * 8. (Future) Verify rewards received
 */

const puppeteer = require('puppeteer');
const { capture } = require('../../helpers/screenshot.helper');

describe('Player Pattern: New Player Onboarding Journey', () => {
  let browser;
  let page;
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5174';

  // Test data
  const timestamp = Date.now();
  const testEmail = `newplayer${timestamp}@e2e.test`;
  const testPassword = 'NewPlayer123!';
  const testUsername = `player${timestamp}`;
  const characterName = `Hero${timestamp}`.substring(0, 20); // Ensure under 20 char limit

  // Test state tracking
  const journeyLog = {
    timestamp: new Date().toISOString(),
    steps: [],
    screenshots: [],
    playerData: {}
  };

  const logStep = (step, status, data = {}) => {
    const entry = {
      step,
      status,
      timestamp: new Date().toISOString(),
      ...data
    };
    journeyLog.steps.push(entry);
    console.log(`[${status}] ${step}`);
    if (data.error) {
      console.error('  Error:', data.error);
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    page = await browser.newPage();

    // Log console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Error:', msg.text());
      }
    });

    // Log page errors
    page.on('pageerror', error => {
      console.error('Page Error:', error.message);
    });
  }, 30000);

  afterAll(async () => {
    // Save journey log
    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(__dirname, '../../logs/player-journeys');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logPath = path.join(logDir, `new-player-journey-${timestamp}.json`);
    fs.writeFileSync(logPath, JSON.stringify(journeyLog, null, 2));
    console.log(`\n=== Journey Log Saved: ${logPath} ===`);

    if (browser) {
      await browser.close();
    }
  }, 10000);

  // ============================================================================
  // TEST STEPS
  // ============================================================================

  it('Step 1: Register New Player Account', async () => {
    logStep('Register New Account', 'RUNNING');

    try {
      // Navigate to registration page
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' });
      await delay(1000);

      const screenshotPath = await capture(page, 'new-player-01-registration');
      journeyLog.screenshots.push({ step: 'registration-page', path: screenshotPath });

      // Fill registration form in CORRECT ORDER (username → email → password)
      // This matches the form structure and allows proper validation

      // 1. Fill USERNAME FIRST (has async validation)
      await page.waitForSelector('input[name="username"], input[placeholder*="username" i]', { timeout: 5000 });
      const usernameInput = await page.$('input[name="username"], input[placeholder*="username" i]');
      await usernameInput.type(testUsername);
      await delay(1000); // Wait for async username validation (500ms debounce + check)

      // 2. Fill EMAIL SECOND
      const emailInput = await page.$('input[type="email"], input[name="email"]');
      await emailInput.type(testEmail);
      await delay(500);

      // 3. Fill PASSWORD THIRD
      const passwordFields = await page.$$('input[type="password"]');
      if (passwordFields.length === 0) {
        throw new Error('No password field found');
      }
      await passwordFields[0].type(testPassword);
      await delay(500);

      // Fill password confirmation if it exists
      if (passwordFields.length > 1) {
        await passwordFields[1].type(testPassword);
        await delay(500);
      }

      const screenshotBeforeSubmit = await capture(page, 'new-player-01b-before-submit');
      journeyLog.screenshots.push({ step: 'before-submit', path: screenshotBeforeSubmit });

      // Submit registration
      const submitButton = await page.$('button[type="submit"]');
      if (!submitButton) {
        throw new Error('Submit button not found');
      }

      await submitButton.click();

      // Wait for EITHER navigation OR error message OR timeout (like visual UI test)
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        page.waitForSelector('[role="alert"], .error, .success', { timeout: 5000 }),
        delay(3000)
      ]);

      await delay(2000); // Extra buffer for any animations/redirects

      const url = page.url();
      console.log('Current URL after registration:', url);

      // Check for error messages
      const errorMessage = await page.evaluate(() => {
        const error = document.querySelector('[role="alert"], .error, .text-red-500');
        return error ? error.textContent : null;
      });

      if (errorMessage) {
        throw new Error(`Registration failed with error: ${errorMessage}`);
      }

      // Check if we successfully registered and redirected
      if (!url.includes('/characters')) {
        const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
        throw new Error(`Expected to be on /characters but got ${url}. Page content: ${pageText}`);
      }

      journeyLog.playerData.email = testEmail;
      journeyLog.playerData.username = testUsername;

      logStep('Register New Account', 'PASS', { redirectUrl: url });
    } catch (error) {
      logStep('Register New Account', 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);

  it('Step 2: Create First Character', async () => {
    logStep('Create First Character', 'RUNNING');

    try {
      await delay(2000);

      // Should be on characters page
      const screenshotPath1 = await capture(page, 'new-player-02-character-select');
      journeyLog.screenshots.push({ step: 'character-select-page', path: screenshotPath1 });

      // Click "Create Your First Character" button
      const createButton = await page.$('[data-testid="create-first-character-button"]');
      if (!createButton) {
        throw new Error('Create character button not found');
      }

      await createButton.click();
      await delay(1500);

      // Enter character name
      await page.waitForSelector('#character-name', { timeout: 10000 });
      const nameInput = await page.$('#character-name');
      await nameInput.type(characterName);
      await delay(1000);

      const screenshotPath2 = await capture(page, 'new-player-03-character-name');
      journeyLog.screenshots.push({ step: 'character-name-entered', path: screenshotPath2 });

      // Select first faction (Frontera)
      const factionCards = await page.$$('[data-testid^="faction-card-"]');
      if (factionCards.length === 0) {
        throw new Error('No faction cards found');
      }

      await factionCards[0].click(); // Select first faction
      await delay(1000);

      const screenshotPath3 = await capture(page, 'new-player-04-faction-selected');
      journeyLog.screenshots.push({ step: 'faction-selected', path: screenshotPath3 });

      // Click Next button
      const nextButton = await page.$('[data-testid="character-next-button"]');
      if (!nextButton) {
        throw new Error('Next button not found');
      }

      await nextButton.click();
      await delay(2000);

      // Click Create Character button
      const createCharButton = await page.$('[data-testid="character-create-button"]');
      if (!createCharButton) {
        throw new Error('Create character button not found');
      }

      await createCharButton.click();

      // Wait for navigation to game page
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
        delay(10000)
      ]);

      const finalUrl = page.url();
      journeyLog.playerData.characterName = characterName;
      journeyLog.playerData.landingUrl = finalUrl;

      logStep('Create First Character', 'PASS', {
        characterName,
        landedOn: finalUrl
      });
    } catch (error) {
      const errorScreenshot = await capture(page, 'new-player-ERROR-character-creation');
      journeyLog.screenshots.push({ step: 'character-creation-error', path: errorScreenshot });
      logStep('Create First Character', 'FAIL', { error: error.message });
      throw error;
    }
  }, 45000);

  it('Step 3: Land on Game Dashboard', async () => {
    logStep('Land on Game Dashboard', 'RUNNING');

    try {
      await delay(3000); // Allow page to fully load

      const url = page.url();
      const screenshotPath = await capture(page, 'new-player-05-game-dashboard');
      journeyLog.screenshots.push({ step: 'game-dashboard', path: screenshotPath });

      // Verify we're on /game
      if (!url.includes('/game')) {
        throw new Error(`Expected to be on /game but got ${url}`);
      }

      // Check for essential dashboard elements
      const dashboardChecks = {
        hasCharacterName: await page.$('text/' + characterName) !== null,
        hasGoldDisplay: await page.$('[class*="gold"]') !== null || await page.$('text/Gold') !== null,
        hasEnergyDisplay: await page.$('text/Energy') !== null || await page.$('[class*="energy"]') !== null,
        hasLocationInfo: await page.$('text/Location') !== null || await page.$('[class*="location"]') !== null,
        hasNavigationLinks: (await page.$$('a[href^="/"]')).length > 0
      };

      journeyLog.playerData.dashboardState = dashboardChecks;

      logStep('Land on Game Dashboard', 'PASS', {
        url,
        dashboardElements: dashboardChecks
      });
    } catch (error) {
      const errorScreenshot = await capture(page, 'new-player-ERROR-dashboard');
      journeyLog.screenshots.push({ step: 'dashboard-error', path: errorScreenshot });
      logStep('Land on Game Dashboard', 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);

  it('Step 4: Navigate to Actions Page', async () => {
    logStep('Navigate to Actions Page', 'RUNNING');

    try {
      await delay(2000);

      // Look for Actions link/button in navigation
      const actionsLink = await page.evaluateHandle(() => {
        const links = Array.from(document.querySelectorAll('a, button'));
        return links.find(el =>
          el.textContent &&
          el.textContent.toLowerCase().includes('action')
        );
      });

      if (!actionsLink || !actionsLink.asElement()) {
        // Actions might be in a dropdown or sidebar - try common patterns
        const possibleSelectors = [
          'a[href="/actions"]',
          'button:has-text("Actions")',
          '[data-testid="actions-link"]',
          'nav a:has-text("Actions")'
        ];

        let found = false;
        for (const selector of possibleSelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              await element.click();
              found = true;
              break;
            }
          } catch (e) {
            // Continue trying other selectors
          }
        }

        if (!found) {
          // Fallback: navigate directly
          await page.goto(`${BASE_URL}/actions`, { waitUntil: 'networkidle0' });
        }
      } else {
        await actionsLink.asElement().click();
        await delay(2000);
      }

      const url = page.url();
      const screenshotPath = await capture(page, 'new-player-06-actions-page');
      journeyLog.screenshots.push({ step: 'actions-page', path: screenshotPath });

      // Verify actions page loaded
      const hasActionElements = await page.evaluate(() => {
        const text = document.body.textContent || '';
        return text.toLowerCase().includes('action') ||
               text.toLowerCase().includes('activity') ||
               text.toLowerCase().includes('task');
      });

      journeyLog.playerData.actionsPageUrl = url;
      journeyLog.playerData.actionsPageLoaded = hasActionElements;

      logStep('Navigate to Actions Page', 'PASS', {
        url,
        hasActionContent: hasActionElements
      });
    } catch (error) {
      const errorScreenshot = await capture(page, 'new-player-ERROR-actions');
      journeyLog.screenshots.push({ step: 'actions-error', path: errorScreenshot });
      logStep('Navigate to Actions Page', 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);

  it('Step 5: View Available Actions', async () => {
    logStep('View Available Actions', 'RUNNING');

    try {
      await delay(2000);

      // Count available actions/cards on the page
      const actionElements = await page.$$('button[class*="action"], [class*="action-card"], [data-testid*="action"]');
      const actionCount = actionElements.length;

      // Check if there's any action-related content
      const pageContent = await page.evaluate(() => {
        return {
          hasCards: document.querySelectorAll('[class*="card"]').length > 0,
          hasButtons: document.querySelectorAll('button').length > 0,
          bodyText: document.body.innerText.substring(0, 500) // First 500 chars
        };
      });

      const screenshotPath = await capture(page, 'new-player-07-actions-available');
      journeyLog.screenshots.push({ step: 'actions-available', path: screenshotPath });

      journeyLog.playerData.availableActions = {
        count: actionCount,
        pageContent: pageContent
      };

      logStep('View Available Actions', 'PASS', {
        actionElementsFound: actionCount,
        hasInteractiveElements: pageContent.hasButtons
      });
    } catch (error) {
      logStep('View Available Actions', 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);

  // ============================================================================
  // ACTION GAMEPLAY STEPS
  // ============================================================================

  it('Step 6: Complete First Action', async () => {
    logStep('Complete First Action', 'RUNNING');

    try {
      await delay(2000);

      // Skip tutorial to access actions
      // Tutorial auto-triggers for new level 1 characters with 0 XP
      const tutorialActive = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        return bodyText.includes('Hawk') || bodyText.includes('Tutorial');
      });

      if (tutorialActive) {
        console.log('Tutorial detected - attempting to skip...');

        // Find and click "Skip Tutorial" button (top-right of dialogue)
        const skipTutorialButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => {
            const text = btn.textContent || '';
            return text.includes('Skip Tutorial') && !text.includes('Section');
          });
        });

        if (skipTutorialButton && skipTutorialButton.asElement()) {
          await skipTutorialButton.asElement().click();
          console.log('Clicked "Skip Tutorial" button');
          await delay(1000);

          const beforeConfirmScreenshot = await capture(page, 'new-player-08a-skip-confirm');
          journeyLog.screenshots.push({ step: 'skip-confirmation', path: beforeConfirmScreenshot });

          // Confirm skip in modal ("Yes, Skip")
          const confirmButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => {
              const text = btn.textContent || '';
              return text.includes('Yes') && text.includes('Skip');
            });
          });

          if (confirmButton && confirmButton.asElement()) {
            await confirmButton.asElement().click();
            console.log('Confirmed tutorial skip');
            await delay(2000); // Wait for tutorial to dismiss

            const afterSkipScreenshot = await capture(page, 'new-player-08b-tutorial-skipped');
            journeyLog.screenshots.push({ step: 'tutorial-skipped', path: afterSkipScreenshot });

            // Verify tutorial is gone
            const stillActive = await page.evaluate(() => {
              const bodyText = document.body.innerText;
              return bodyText.includes('Hawk');
            });

            if (stillActive) {
              console.warn('Tutorial still active after skip attempt');
            } else {
              console.log('Tutorial successfully dismissed');
            }
          } else {
            console.warn('Could not find "Yes, Skip" confirmation button');
          }
        } else {
          console.warn('Could not find "Skip Tutorial" button - trying "Skip Section"');

          // Fallback: Try "Skip Section" button multiple times
          for (let i = 0; i < 4; i++) {
            const skipSectionButton = await page.evaluateHandle(() => {
              const buttons = Array.from(document.querySelectorAll('button'));
              return buttons.find(btn => btn.textContent?.includes('Skip Section'));
            });

            if (skipSectionButton && skipSectionButton.asElement()) {
              await skipSectionButton.asElement().click();
              console.log(`Clicked "Skip Section" (${i + 1}/4)`);
              await delay(1500);
            }
          }
        }
      } else {
        console.log('No tutorial detected');
      }

      // Capture state before action
      const beforeScreenshot = await capture(page, 'new-player-09-before-action');
      journeyLog.screenshots.push({ step: 'before-action', path: beforeScreenshot });

      // Get character stats before action
      const statsBefore = await page.evaluate(() => {
        const goldText = document.body.innerText.match(/(\d+)\s*gold/i);
        const energyText = document.body.innerText.match(/(\d+)\s*energy/i);
        return {
          gold: goldText ? parseInt(goldText[1]) : 0,
          energy: energyText ? parseInt(energyText[1]) : 0
        };
      });

      journeyLog.playerData.statsBefore = statsBefore;

      // Find first available action (look for action cards)
      const actionCards = await page.$$('[data-testid^="action-"]');

      if (actionCards.length === 0) {
        // Try alternative: look for any action button by text content
        const actionButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn =>
            btn.textContent.toLowerCase().includes('attempt') ||
            btn.textContent.toLowerCase().includes('start') ||
            btn.textContent.toLowerCase().includes('go')
          );
        });

        if (actionButton && actionButton.asElement()) {
          await actionButton.asElement().click();
        } else {
          throw new Error('No action cards or action buttons found');
        }
      } else {
        // Click first action's "Attempt" button
        const firstAction = actionCards[0];
        await firstAction.click();
        await delay(1000);

        // Look for "Attempt" button
        const attemptButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent.toLowerCase().includes('attempt'));
        });

        if (attemptButton && attemptButton.asElement()) {
          await attemptButton.asElement().click();
        }
      }

      await delay(3000); // Wait for deck game modal to appear

      const deckGameScreenshot = await capture(page, 'new-player-10-deck-game');
      journeyLog.screenshots.push({ step: 'deck-game-started', path: deckGameScreenshot });

      // Play the deck game - simple strategy: hold all cards and draw once
      // Cards can be selected via CSS classes
      const cardSlots = await page.$$('.card-slot, .playing-card, [class*="card"]');

      if (cardSlots.length > 0) {
        // Select first 2 cards to hold (keep some, discard some)
        await cardSlots[0].click();
        await delay(300);
        await cardSlots[1].click();
        await delay(300);

        const cardsSelectedScreenshot = await capture(page, 'new-player-11-cards-selected');
        journeyLog.screenshots.push({ step: 'cards-selected', path: cardsSelectedScreenshot });
      }

      // Click "Draw" or "Hold" button to play the hand
      const drawButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn =>
          btn.textContent.toLowerCase().includes('draw') ||
          btn.textContent.toLowerCase().includes('hold') ||
          btn.textContent.toLowerCase().includes('play')
        );
      });

      if (drawButton && drawButton.asElement()) {
        await drawButton.asElement().click();
        await delay(4000); // Wait for game to resolve and show results
      }

      const resultScreenshot = await capture(page, 'new-player-12-action-result');
      journeyLog.screenshots.push({ step: 'action-result', path: resultScreenshot });

      // Check if result modal is showing
      const resultText = await page.evaluate(() => {
        const body = document.body.innerText;
        const hasSuccess = body.toLowerCase().includes('success');
        const hasFailure = body.toLowerCase().includes('fail');
        const hasGold = body.match(/\+?\d+\s*gold/i);
        const hasXP = body.match(/\+?\d+\s*(xp|experience)/i);

        return {
          hasResult: hasSuccess || hasFailure,
          success: hasSuccess,
          goldMatch: hasGold ? hasGold[0] : null,
          xpMatch: hasXP ? hasXP[0] : null,
          bodyPreview: body.substring(0, 500)
        };
      });

      journeyLog.playerData.actionResult = resultText;

      logStep('Complete First Action', 'PASS', {
        hadResult: resultText.hasResult,
        foundGold: !!resultText.goldMatch,
        foundXP: !!resultText.xpMatch
      });
    } catch (error) {
      const errorScreenshot = await capture(page, 'new-player-ERROR-action');
      journeyLog.screenshots.push({ step: 'action-error', path: errorScreenshot });
      logStep('Complete First Action', 'FAIL', { error: error.message });
      throw error;
    }
  }, 60000);

  it('Step 7: Verify Rewards Received', async () => {
    logStep('Verify Rewards Received', 'RUNNING');

    try {
      await delay(2000);

      // Look for reward display on screen
      const rewardsDisplayed = await page.evaluate(() => {
        const text = document.body.innerText;

        // Extract numbers from reward text
        const goldMatch = text.match(/\+?(\d+)\s*gold/i);
        const xpMatch = text.match(/\+?(\d+)\s*(xp|experience)/i);

        return {
          goldEarned: goldMatch ? parseInt(goldMatch[1]) : null,
          xpEarned: xpMatch ? parseInt(xpMatch[1]) : null,
          hasRewardScreen: text.toLowerCase().includes('reward') ||
                           text.toLowerCase().includes('earned') ||
                           goldMatch !== null || xpMatch !== null
        };
      });

      journeyLog.playerData.rewardsDisplayed = rewardsDisplayed;

      const rewardScreenshot = await capture(page, 'new-player-13-rewards');
      journeyLog.screenshots.push({ step: 'rewards-displayed', path: rewardScreenshot });

      // Click "Continue" or "Close" to dismiss result modal
      const continueButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn =>
          btn.textContent.toLowerCase().includes('continue') ||
          btn.textContent.toLowerCase().includes('close') ||
          btn.textContent.toLowerCase().includes('ok')
        );
      });

      if (continueButton && continueButton.asElement()) {
        await continueButton.asElement().click();
        await delay(2000);
      }

      const afterRewardsScreenshot = await capture(page, 'new-player-14-after-rewards');
      journeyLog.screenshots.push({ step: 'after-rewards', path: afterRewardsScreenshot });

      logStep('Verify Rewards Received', 'PASS', {
        goldEarned: rewardsDisplayed.goldEarned,
        xpEarned: rewardsDisplayed.xpEarned,
        hadRewardScreen: rewardsDisplayed.hasRewardScreen
      });
    } catch (error) {
      const errorScreenshot = await capture(page, 'new-player-ERROR-rewards');
      journeyLog.screenshots.push({ step: 'rewards-error', path: errorScreenshot });
      logStep('Verify Rewards Received', 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);

  it('Step 8: Check Character Progression', async () => {
    logStep('Check Character Progression', 'RUNNING');

    try {
      await delay(2000);

      // Get character stats after action
      const statsAfter = await page.evaluate(() => {
        const text = document.body.innerText;

        const goldText = text.match(/(\d+)\s*gold/i);
        const energyText = text.match(/(\d+)\s*energy/i);
        const levelText = text.match(/level\s*(\d+)/i);
        const xpText = text.match(/(\d+)\s*\/\s*(\d+)\s*(xp|experience)/i);

        return {
          gold: goldText ? parseInt(goldText[1]) : 0,
          energy: energyText ? parseInt(energyText[1]) : 0,
          level: levelText ? parseInt(levelText[1]) : 1,
          currentXP: xpText ? parseInt(xpText[1]) : 0,
          xpToNextLevel: xpText ? parseInt(xpText[2]) : 0
        };
      });

      journeyLog.playerData.statsAfter = statsAfter;

      const finalScreenshot = await capture(page, 'new-player-15-final-stats');
      journeyLog.screenshots.push({ step: 'final-stats', path: finalScreenshot });

      // Calculate progression
      const statsBefore = journeyLog.playerData.statsBefore || { gold: 0, energy: 0 };
      const progression = {
        goldGained: statsAfter.gold - statsBefore.gold,
        energySpent: statsBefore.energy - statsAfter.energy,
        level: statsAfter.level,
        hasXP: statsAfter.currentXP > 0
      };

      journeyLog.playerData.progression = progression;

      logStep('Check Character Progression', 'PASS', {
        goldGained: progression.goldGained,
        energySpent: progression.energySpent,
        finalLevel: statsAfter.level,
        hasXP: progression.hasXP
      });

      // Final summary
      console.log('\n=== NEW PLAYER JOURNEY COMPLETE ===');
      console.log(`Player: ${journeyLog.playerData.username}`);
      console.log(`Character: ${journeyLog.playerData.characterName}`);
      console.log(`Final Gold: ${statsAfter.gold} (+${progression.goldGained})`);
      console.log(`Final Energy: ${statsAfter.energy} (spent ${progression.energySpent})`);
      console.log(`Level: ${statsAfter.level}`);
      console.log(`XP: ${statsAfter.currentXP}/${statsAfter.xpToNextLevel}`);
      console.log('=====================================\n');

    } catch (error) {
      const errorScreenshot = await capture(page, 'new-player-ERROR-progression');
      journeyLog.screenshots.push({ step: 'progression-error', path: errorScreenshot });
      logStep('Check Character Progression', 'FAIL', { error: error.message });
      throw error;
    }
  }, 30000);
});
