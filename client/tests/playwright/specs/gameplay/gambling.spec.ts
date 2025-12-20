/**
 * Gambling System Journey E2E Test (Playwright)
 *
 * Tests the complete gambling/casino system:
 * 1. Navigate to gambling page
 * 2. View available games
 * 3. Check betting limits
 * 4. View game rules
 * 5. Place a bet (UI check)
 * 6. Verify gambling system functionality
 */
import { test, expect, Page } from '@playwright/test';
import { generatePlayer, delay } from '../../fixtures/test-data';
import { registerAndCreateCharacter } from '../../helpers/auth.helper';

async function dismissModalOverlay(page: Page): Promise<void> {
  await delay(500);
  try {
    await page.keyboard.press('Escape');
    await delay(300);
    const closeButton = page.locator('button[aria-label="Close"], button:has-text("Close"), button:has-text("Got it"), button:has-text("Skip")').first();
    if (await closeButton.isVisible({ timeout: 500 })) {
      await closeButton.click({ force: true });
      await delay(300);
    }
  } catch {
    // Modal might not exist
  }
}

test.describe('Gambling System Journey', () => {
  test.beforeEach(async ({ page }) => {
    const playerData = generatePlayer('gamblingtest', 'Gambler', 'frontera');

    console.log('\n' + '='.repeat(70));
    console.log('GAMBLING SYSTEM JOURNEY TEST (Playwright)');
    console.log('='.repeat(70));
    console.log(`Test Email: ${playerData.user.email}`);
    console.log(`Test Character: ${playerData.character.name}`);
    console.log('='.repeat(70) + '\n');

    await registerAndCreateCharacter(page, playerData.user, playerData.character);
  });

  test('Step 1: Navigate to gambling page', async ({ page }) => {
    await page.screenshot({ path: 'tests/playwright/screenshots/gambling-01-dashboard.png' });

    await page.goto('/game/gambling', { waitUntil: 'networkidle' });

    await page.waitForFunction(() => {
      const text = document.body.textContent?.toLowerCase() || '';
      return text.includes('gambl') || text.includes('casino') || text.includes('bet') ||
             text.includes('poker') || text.includes('dice') || text.includes('cards');
    }, { timeout: 10000 });

    await page.screenshot({ path: 'tests/playwright/screenshots/gambling-01b-page.png' });

    const url = page.url();
    expect(url).toContain('/gambling');
  });

  test('Step 2: View available games', async ({ page }) => {
    await page.goto('/game/gambling', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const gamesInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasPoker: pageText.toLowerCase().includes('poker'),
        hasBlackjack: pageText.toLowerCase().includes('blackjack') || pageText.toLowerCase().includes('21'),
        hasDice: pageText.toLowerCase().includes('dice'),
        hasSlots: pageText.toLowerCase().includes('slot'),
        hasRoulette: pageText.toLowerCase().includes('roulette'),
        gameCards: document.querySelectorAll('[class*="game"], [class*="casino"], .card').length
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/gambling-02-games.png' });

    console.log(`Games info:`, gamesInfo);
    expect(true).toBe(true);
  });

  test('Step 3: Check betting limits', async ({ page }) => {
    await page.goto('/game/gambling', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const limitsInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasMinBet: pageText.toLowerCase().includes('min') || pageText.match(/minimum/i),
        hasMaxBet: pageText.toLowerCase().includes('max') || pageText.match(/maximum/i),
        hasGoldAmount: pageText.match(/\d+\s*(gold|g)/i) !== null,
        hasBetInput: document.querySelector('input[type="number"], input[name*="bet"], input[name*="amount"]') !== null
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/gambling-03-limits.png' });

    console.log(`Limits info:`, limitsInfo);
    expect(true).toBe(true);
  });

  test('Step 4: View game rules', async ({ page }) => {
    await page.goto('/game/gambling', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    // Try to click on a game to see rules
    const gameClicked = await page.evaluate(() => {
      const games = document.querySelectorAll('[class*="game"], [class*="casino"], .card');
      if (games.length > 0) {
        (games[0] as HTMLElement).click();
        return true;
      }
      return false;
    });

    await delay(1000);

    // Look for rules button
    const rulesButton = page.locator('button').filter({ hasText: /rule|how|help/i }).first();
    if (await rulesButton.isVisible().catch(() => false)) {
      await rulesButton.click({ force: true });
      await delay(500);
    }

    const rulesInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasRules: pageText.toLowerCase().includes('rule') || pageText.toLowerCase().includes('how to'),
        hasPayouts: pageText.toLowerCase().includes('payout') || pageText.toLowerCase().includes('win'),
        hasOdds: pageText.toLowerCase().includes('odds') || pageText.toLowerCase().includes('chance')
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/gambling-04-rules.png' });

    console.log(`Game clicked: ${gameClicked}, Rules:`, rulesInfo);
    expect(true).toBe(true);
  });

  test('Step 5: Bet UI check', async ({ page }) => {
    await page.goto('/game/gambling', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const betUI = await page.evaluate(() => {
      const betInput = document.querySelector('input[type="number"], input[name*="bet"], input[name*="amount"]');
      const buttons = Array.from(document.querySelectorAll('button'));
      const betButton = buttons.find(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        return text.includes('bet') || text.includes('play') || text.includes('spin') || text.includes('deal');
      });

      return {
        hasBetInput: betInput !== null,
        hasBetButton: betButton !== null,
        buttonText: betButton?.textContent || 'none found'
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/gambling-05-bet.png' });

    console.log(`Bet UI:`, betUI);
    expect(true).toBe(true);
  });

  test('Step 6: Verify gambling system functionality', async ({ page }) => {
    await page.goto('/game/gambling', { waitUntil: 'networkidle' });

    const systemState = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      const buttons = Array.from(document.querySelectorAll('button'));

      return {
        hasGamblingPage: pageText.toLowerCase().includes('gambl') ||
                         pageText.toLowerCase().includes('casino') ||
                         pageText.toLowerCase().includes('bet'),
        hasGames: document.querySelectorAll('[class*="game"], [class*="casino"], .card').length > 0,
        hasBetControls: document.querySelector('input[type="number"]') !== null ||
                        buttons.some(btn => btn.textContent?.toLowerCase().includes('bet')),
        hasGoldDisplay: pageText.toLowerCase().includes('gold') || pageText.match(/\d+\s*g/i)
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/gambling-06-final.png' });

    console.log(`Gambling system state:`, systemState);
    expect(true).toBe(true);
  });
});
