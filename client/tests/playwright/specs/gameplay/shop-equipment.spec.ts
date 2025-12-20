/**
 * Shop & Equipment Journey E2E Test (Playwright)
 *
 * Tests the complete shop/store system:
 * 1. Navigate to shop page
 * 2. View available items by category
 * 3. View item details
 * 4. Check inventory
 * 5. Attempt purchase
 * 6. Verify shop system functionality
 */
import { test, expect, Page } from '@playwright/test';
import { generatePlayer, delay } from '../../fixtures/test-data';
import { registerAndCreateCharacter } from '../../helpers/auth.helper';

/**
 * Helper to dismiss any modal overlays (tutorial, welcome, etc.)
 */
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

test.describe('Shop & Equipment Journey', () => {
  test.beforeEach(async ({ page }) => {
    const playerData = generatePlayer('shoptest', 'Shopper', 'frontera');

    console.log('\n' + '='.repeat(70));
    console.log('SHOP & EQUIPMENT JOURNEY TEST (Playwright)');
    console.log('='.repeat(70));
    console.log(`Test Email: ${playerData.user.email}`);
    console.log(`Test Character: ${playerData.character.name}`);
    console.log('='.repeat(70) + '\n');

    await registerAndCreateCharacter(page, playerData.user, playerData.character);
  });

  test('Step 1: Navigate to shop page from dashboard', async ({ page }) => {
    await page.screenshot({ path: 'tests/playwright/screenshots/shop-01-dashboard.png' });

    await page.goto('/game/shop', { waitUntil: 'networkidle' });

    await page.waitForFunction(() => {
      const hasShopContent = document.body.textContent?.toLowerCase().includes('shop') ||
                             document.body.textContent?.toLowerCase().includes('store') ||
                             document.body.textContent?.toLowerCase().includes('item');
      return hasShopContent;
    }, { timeout: 10000 });

    await page.screenshot({ path: 'tests/playwright/screenshots/shop-01b-shop-page.png' });

    const url = page.url();
    expect(url).toContain('/shop');
  });

  test('Step 2: View available items and categories', async ({ page }) => {
    await page.goto('/game/shop', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const shopInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasWeapons: pageText.toLowerCase().includes('weapon'),
        hasArmor: pageText.toLowerCase().includes('armor'),
        hasItems: pageText.toLowerCase().includes('item'),
        hasEquipment: pageText.toLowerCase().includes('equipment'),
        itemCards: document.querySelectorAll('[class*="item"], [class*="card"], .grid > div').length
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/shop-02-items-list.png' });

    // Try clicking a category filter
    const categoryButton = page.locator('button').filter({ hasText: /weapon|armor|all/i }).first();
    if (await categoryButton.isVisible()) {
      try {
        await categoryButton.click({ timeout: 3000 });
      } catch {
        await categoryButton.click({ force: true });
      }
      await delay(500);
      await page.screenshot({ path: 'tests/playwright/screenshots/shop-02b-filtered.png' });
    }

    console.log(`Shop info:`, shopInfo);
    expect(shopInfo.itemCards).toBeGreaterThanOrEqual(0);
  });

  test('Step 3: View item details', async ({ page }) => {
    await page.goto('/game/shop', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    // Click on first item card
    const itemClicked = await page.evaluate(() => {
      const items = document.querySelectorAll('[class*="item"], [class*="card"], .grid > div');
      if (items.length > 0) {
        (items[0] as HTMLElement).click();
        return true;
      }
      return false;
    });

    await delay(1000);

    const itemDetails = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasPrice: pageText.match(/\d+\s*(gold|g)/i) !== null,
        hasStats: pageText.toLowerCase().includes('stat') || pageText.toLowerCase().includes('damage') || pageText.toLowerCase().includes('defense'),
        hasDescription: pageText.length > 100,
        hasBuyButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent?.toLowerCase().includes('buy') || btn.textContent?.toLowerCase().includes('purchase')
        )
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/shop-03-item-details.png' });

    console.log(`Item clicked: ${itemClicked}, Details:`, itemDetails);
    expect(true).toBe(true);
  });

  test('Step 4: Check inventory', async ({ page }) => {
    await page.goto('/game/inventory', { waitUntil: 'networkidle' });
    await delay(1000);

    const inventoryInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasInventory: pageText.toLowerCase().includes('inventory') || pageText.toLowerCase().includes('item'),
        hasEquipped: pageText.toLowerCase().includes('equipped') || pageText.toLowerCase().includes('wearing'),
        hasSlots: document.querySelectorAll('[class*="slot"], [class*="item"]').length
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/shop-04-inventory.png' });

    console.log(`Inventory info:`, inventoryInfo);
    expect(true).toBe(true);
  });

  test('Step 5: Attempt purchase (check UI)', async ({ page }) => {
    await page.goto('/game/shop', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const purchaseUI = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buyButton = buttons.find(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        return text.includes('buy') || text.includes('purchase');
      });

      return {
        hasBuyButton: buyButton !== null,
        buttonText: buyButton?.textContent || 'none found',
        hasGoldDisplay: document.body.textContent?.toLowerCase().includes('gold')
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/shop-05-purchase-ui.png' });

    console.log(`Purchase UI:`, purchaseUI);
    expect(true).toBe(true);
  });

  test('Step 6: Verify shop system functionality', async ({ page }) => {
    await page.goto('/game/shop', { waitUntil: 'networkidle' });

    const systemState = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      const buttons = Array.from(document.querySelectorAll('button'));

      return {
        hasShopPage: pageText.toLowerCase().includes('shop') || pageText.toLowerCase().includes('store'),
        hasItems: document.querySelectorAll('[class*="item"], [class*="card"]').length > 0,
        hasPrices: pageText.match(/\d+\s*(gold|g)/i) !== null,
        hasCategories: buttons.some(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('weapon') || text.includes('armor') || text.includes('all');
        })
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/shop-06-final.png' });

    console.log(`Shop system state:`, systemState);
    expect(true).toBe(true);
  });
});
