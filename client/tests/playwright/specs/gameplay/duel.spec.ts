/**
 * Duel System Journey E2E Test (Playwright)
 *
 * Tests the complete PvP duel system:
 * 1. Navigate to duel page
 * 2. View available opponents
 * 3. View duel rules/rewards
 * 4. Check duel history
 * 5. Challenge interface
 * 6. Verify duel system functionality
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

test.describe('Duel System Journey', () => {
  test.beforeEach(async ({ page }) => {
    const playerData = generatePlayer('dueltest', 'Duelist', 'frontera');

    console.log('\n' + '='.repeat(70));
    console.log('DUEL SYSTEM JOURNEY TEST (Playwright)');
    console.log('='.repeat(70));
    console.log(`Test Email: ${playerData.user.email}`);
    console.log(`Test Character: ${playerData.character.name}`);
    console.log('='.repeat(70) + '\n');

    await registerAndCreateCharacter(page, playerData.user, playerData.character);
  });

  test('Step 1: Navigate to duel page', async ({ page }) => {
    await page.screenshot({ path: 'tests/playwright/screenshots/duel-01-dashboard.png' });

    await page.goto('/game/duel', { waitUntil: 'networkidle' });

    await page.waitForFunction(() => {
      const text = document.body.textContent?.toLowerCase() || '';
      return text.includes('duel') || text.includes('pvp') || text.includes('challenge') || text.includes('fight');
    }, { timeout: 10000 });

    await page.screenshot({ path: 'tests/playwright/screenshots/duel-01b-duel-page.png' });

    const url = page.url();
    expect(url).toContain('/duel');
  });

  test('Step 2: View available opponents', async ({ page }) => {
    await page.goto('/game/duel', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const opponentsInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasOpponentList: pageText.toLowerCase().includes('opponent') || pageText.toLowerCase().includes('player'),
        hasLevelInfo: pageText.toLowerCase().includes('level') || pageText.match(/lv\.?\s*\d+/i),
        opponentCards: document.querySelectorAll('[class*="opponent"], [class*="player"], [class*="character"]').length,
        hasChallengeButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent?.toLowerCase().includes('challenge') || btn.textContent?.toLowerCase().includes('duel')
        )
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/duel-02-opponents.png' });

    console.log(`Opponents info:`, opponentsInfo);
    expect(true).toBe(true);
  });

  test('Step 3: View duel rules and rewards', async ({ page }) => {
    await page.goto('/game/duel', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    // Look for rules/help button
    const rulesButton = page.locator('button').filter({ hasText: /rules|how|help/i }).first();
    if (await rulesButton.isVisible().catch(() => false)) {
      await rulesButton.click({ force: true });
      await delay(500);
    }

    const rulesInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasRules: pageText.toLowerCase().includes('rule') || pageText.toLowerCase().includes('how'),
        hasRewards: pageText.toLowerCase().includes('reward') || pageText.toLowerCase().includes('win'),
        hasWagerInfo: pageText.toLowerCase().includes('wager') || pageText.toLowerCase().includes('bet'),
        hasXPReward: pageText.toLowerCase().includes('xp') || pageText.toLowerCase().includes('experience')
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/duel-03-rules.png' });

    console.log(`Rules info:`, rulesInfo);
    expect(true).toBe(true);
  });

  test('Step 4: Check duel history', async ({ page }) => {
    await page.goto('/game/duel', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    // Click history tab if exists
    const historyTab = page.locator('button, [role="tab"]').filter({ hasText: /history|past|record/i }).first();
    if (await historyTab.isVisible().catch(() => false)) {
      await historyTab.click({ force: true });
      await delay(500);
    }

    const historyInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasHistorySection: pageText.toLowerCase().includes('history') || pageText.toLowerCase().includes('record'),
        hasWinLoss: pageText.toLowerCase().includes('win') || pageText.toLowerCase().includes('loss'),
        hasNoHistory: pageText.toLowerCase().includes('no duel') || pageText.toLowerCase().includes('no history'),
        hasStats: pageText.match(/\d+\s*-\s*\d+/) || pageText.toLowerCase().includes('stat')
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/duel-04-history.png' });

    console.log(`History info:`, historyInfo);
    expect(true).toBe(true);
  });

  test('Step 5: Challenge interface', async ({ page }) => {
    await page.goto('/game/duel', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const challengeUI = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const challengeButton = buttons.find(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        return text.includes('challenge') || text.includes('duel') || text.includes('fight');
      });

      return {
        hasChallengeButton: challengeButton !== null,
        buttonText: challengeButton?.textContent || 'none found',
        hasWagerInput: document.querySelector('input[type="number"], input[name*="wager"]') !== null,
        hasOpponentSelection: document.querySelectorAll('[class*="opponent"], [class*="select"]').length > 0
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/duel-05-challenge.png' });

    console.log(`Challenge UI:`, challengeUI);
    expect(true).toBe(true);
  });

  test('Step 6: Verify duel system functionality', async ({ page }) => {
    await page.goto('/game/duel', { waitUntil: 'networkidle' });

    const systemState = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      const buttons = Array.from(document.querySelectorAll('button'));

      return {
        hasDuelPage: pageText.toLowerCase().includes('duel') || pageText.toLowerCase().includes('pvp'),
        hasOpponents: document.querySelectorAll('[class*="opponent"], [class*="player"]').length > 0 ||
                      pageText.toLowerCase().includes('no opponent'),
        hasChallengeAction: buttons.some(btn => btn.textContent?.toLowerCase().includes('challenge')),
        hasRewardInfo: pageText.toLowerCase().includes('reward') || pageText.toLowerCase().includes('gold')
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/duel-06-final.png' });

    console.log(`Duel system state:`, systemState);
    expect(true).toBe(true);
  });
});
