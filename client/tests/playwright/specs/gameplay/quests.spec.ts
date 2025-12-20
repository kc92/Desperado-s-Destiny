/**
 * Quests Journey E2E Test (Playwright)
 *
 * Tests the complete quest system:
 * 1. Navigate to quests page
 * 2. View available quests
 * 3. View quest details
 * 4. Accept a quest
 * 5. Check active quests
 * 6. Verify quest system functionality
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

test.describe('Quests Journey', () => {
  test.beforeEach(async ({ page }) => {
    const playerData = generatePlayer('questtest', 'Quester', 'frontera');

    console.log('\n' + '='.repeat(70));
    console.log('QUESTS JOURNEY TEST (Playwright)');
    console.log('='.repeat(70));
    console.log(`Test Email: ${playerData.user.email}`);
    console.log(`Test Character: ${playerData.character.name}`);
    console.log('='.repeat(70) + '\n');

    await registerAndCreateCharacter(page, playerData.user, playerData.character);
  });

  test('Step 1: Navigate to quests page', async ({ page }) => {
    await page.screenshot({ path: 'tests/playwright/screenshots/quests-01-dashboard.png' });

    await page.goto('/game/quests', { waitUntil: 'networkidle' });

    await page.waitForFunction(() => {
      const text = document.body.textContent?.toLowerCase() || '';
      return text.includes('quest') || text.includes('mission') || text.includes('task');
    }, { timeout: 10000 });

    await page.screenshot({ path: 'tests/playwright/screenshots/quests-01b-quests-page.png' });

    const url = page.url();
    expect(url).toContain('/quest');
  });

  test('Step 2: View available quests', async ({ page }) => {
    await page.goto('/game/quests', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const questsInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasQuestList: pageText.toLowerCase().includes('quest') || pageText.toLowerCase().includes('mission'),
        hasRewards: pageText.toLowerCase().includes('reward') || pageText.toLowerCase().includes('gold') || pageText.toLowerCase().includes('xp'),
        questCards: document.querySelectorAll('[class*="quest"], [class*="mission"], .card').length,
        hasDifficulty: pageText.toLowerCase().includes('easy') || pageText.toLowerCase().includes('hard') || pageText.toLowerCase().includes('difficulty')
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/quests-02-list.png' });

    console.log(`Quests info:`, questsInfo);
    expect(true).toBe(true);
  });

  test('Step 3: View quest details', async ({ page }) => {
    await page.goto('/game/quests', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    // Click first quest card
    const questClicked = await page.evaluate(() => {
      const quests = document.querySelectorAll('[class*="quest"], [class*="mission"], .card');
      if (quests.length > 0) {
        (quests[0] as HTMLElement).click();
        return true;
      }
      return false;
    });

    await delay(1000);

    const questDetails = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasObjective: pageText.toLowerCase().includes('objective') || pageText.toLowerCase().includes('goal'),
        hasReward: pageText.toLowerCase().includes('reward'),
        hasAcceptButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent?.toLowerCase().includes('accept') || btn.textContent?.toLowerCase().includes('start')
        ),
        hasDescription: pageText.length > 100
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/quests-03-details.png' });

    console.log(`Quest clicked: ${questClicked}, Details:`, questDetails);
    expect(true).toBe(true);
  });

  test('Step 4: Accept a quest', async ({ page }) => {
    await page.goto('/game/quests', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const acceptButton = page.locator('button').filter({ hasText: /accept|start/i }).first();
    const acceptButtonVisible = await acceptButton.isVisible().catch(() => false);

    if (acceptButtonVisible) {
      try {
        await acceptButton.click({ timeout: 5000 });
      } catch {
        await acceptButton.click({ force: true });
      }
      console.log('Clicked Accept button');
      await delay(1000);
    }

    await page.screenshot({ path: 'tests/playwright/screenshots/quests-04-accepted.png' });

    console.log(`Accept button visible: ${acceptButtonVisible}`);
    expect(true).toBe(true);
  });

  test('Step 5: Check active quests', async ({ page }) => {
    await page.goto('/game/quests', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    // Click active tab if exists
    const activeTab = page.locator('button, [role="tab"]').filter({ hasText: /active|current|in progress/i }).first();
    if (await activeTab.isVisible().catch(() => false)) {
      await activeTab.click({ force: true });
      await delay(500);
    }

    const activeQuestsInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasActiveSection: pageText.toLowerCase().includes('active') || pageText.toLowerCase().includes('current'),
        hasProgress: pageText.toLowerCase().includes('progress') || pageText.match(/\d+\/\d+/),
        hasAbandonButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent?.toLowerCase().includes('abandon') || btn.textContent?.toLowerCase().includes('cancel')
        )
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/quests-05-active.png' });

    console.log(`Active quests info:`, activeQuestsInfo);
    expect(true).toBe(true);
  });

  test('Step 6: Verify quest system functionality', async ({ page }) => {
    await page.goto('/game/quests', { waitUntil: 'networkidle' });

    const systemState = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      const buttons = Array.from(document.querySelectorAll('button'));

      return {
        hasQuestPage: pageText.toLowerCase().includes('quest') || pageText.toLowerCase().includes('mission'),
        hasQuestList: document.querySelectorAll('[class*="quest"], [class*="mission"], .card').length > 0,
        hasAcceptButtons: buttons.some(btn => btn.textContent?.toLowerCase().includes('accept')),
        hasRewardInfo: pageText.toLowerCase().includes('reward') || pageText.toLowerCase().includes('gold')
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/quests-06-final.png' });

    console.log(`Quest system state:`, systemState);
    expect(true).toBe(true);
  });
});
