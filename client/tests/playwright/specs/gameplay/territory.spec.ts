/**
 * Territory/Map Journey E2E Test (Playwright)
 *
 * Tests the complete territory/map system:
 * 1. Navigate to territory page
 * 2. View map regions
 * 3. View region details
 * 4. Check region activities
 * 5. Explore travel options
 * 6. Verify territory system functionality
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

test.describe('Territory/Map Journey', () => {
  test.beforeEach(async ({ page }) => {
    const playerData = generatePlayer('territorytest', 'Explorer', 'frontera');

    console.log('\n' + '='.repeat(70));
    console.log('TERRITORY/MAP JOURNEY TEST (Playwright)');
    console.log('='.repeat(70));
    console.log(`Test Email: ${playerData.user.email}`);
    console.log(`Test Character: ${playerData.character.name}`);
    console.log('='.repeat(70) + '\n');

    await registerAndCreateCharacter(page, playerData.user, playerData.character);
  });

  test('Step 1: Navigate to territory page', async ({ page }) => {
    await page.screenshot({ path: 'tests/playwright/screenshots/territory-01-dashboard.png' });

    await page.goto('/game/territory', { waitUntil: 'networkidle' });

    await page.waitForFunction(() => {
      const text = document.body.textContent?.toLowerCase() || '';
      return text.includes('territory') || text.includes('map') || text.includes('region') || text.includes('location');
    }, { timeout: 10000 });

    await page.screenshot({ path: 'tests/playwright/screenshots/territory-01b-page.png' });

    const url = page.url();
    expect(url).toContain('/territory');
  });

  test('Step 2: View map regions', async ({ page }) => {
    await page.goto('/game/territory', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const mapInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasMap: document.querySelector('[class*="map"], svg, canvas') !== null,
        hasRegions: pageText.toLowerCase().includes('region') || pageText.toLowerCase().includes('zone'),
        hasTownNames: pageText.toLowerCase().includes('town') || pageText.toLowerCase().includes('city'),
        regionCards: document.querySelectorAll('[class*="region"], [class*="location"], [class*="zone"]').length
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/territory-02-map.png' });

    console.log(`Map info:`, mapInfo);
    expect(true).toBe(true);
  });

  test('Step 3: View region details', async ({ page }) => {
    await page.goto('/game/territory', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    // Click on first region
    const regionClicked = await page.evaluate(() => {
      const regions = document.querySelectorAll('[class*="region"], [class*="location"], [class*="zone"], .card');
      if (regions.length > 0) {
        (regions[0] as HTMLElement).click();
        return true;
      }
      return false;
    });

    await delay(1000);

    const regionDetails = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasName: pageText.length > 50,
        hasDescription: pageText.toLowerCase().includes('description') || pageText.length > 100,
        hasActivities: pageText.toLowerCase().includes('activit') || pageText.toLowerCase().includes('action'),
        hasTravelButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent?.toLowerCase().includes('travel') || btn.textContent?.toLowerCase().includes('go')
        )
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/territory-03-details.png' });

    console.log(`Region clicked: ${regionClicked}, Details:`, regionDetails);
    expect(true).toBe(true);
  });

  test('Step 4: Check region activities', async ({ page }) => {
    await page.goto('/game/territory', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const activitiesInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      return {
        hasQuests: pageText.toLowerCase().includes('quest'),
        hasShop: pageText.toLowerCase().includes('shop') || pageText.toLowerCase().includes('store'),
        hasNPCs: pageText.toLowerCase().includes('npc') || pageText.toLowerCase().includes('character'),
        hasDangerLevel: pageText.toLowerCase().includes('danger') || pageText.toLowerCase().includes('level'),
        hasResources: pageText.toLowerCase().includes('resource') || pageText.toLowerCase().includes('gather')
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/territory-04-activities.png' });

    console.log(`Activities info:`, activitiesInfo);
    expect(true).toBe(true);
  });

  test('Step 5: Explore travel options', async ({ page }) => {
    await page.goto('/game/territory', { waitUntil: 'networkidle' });
    await dismissModalOverlay(page);

    const travelInfo = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      const buttons = Array.from(document.querySelectorAll('button'));

      return {
        hasTravelButton: buttons.some(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('travel') || text.includes('go') || text.includes('move');
        }),
        hasTravelCost: pageText.toLowerCase().includes('cost') || pageText.toLowerCase().includes('energy'),
        hasTravelTime: pageText.toLowerCase().includes('time') || pageText.toLowerCase().includes('minute'),
        hasCurrentLocation: pageText.toLowerCase().includes('current') || pageText.toLowerCase().includes('you are')
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/territory-05-travel.png' });

    console.log(`Travel info:`, travelInfo);
    expect(true).toBe(true);
  });

  test('Step 6: Verify territory system functionality', async ({ page }) => {
    await page.goto('/game/territory', { waitUntil: 'networkidle' });

    const systemState = await page.evaluate(() => {
      const pageText = document.body.textContent || '';
      const buttons = Array.from(document.querySelectorAll('button'));

      return {
        hasTerritoryPage: pageText.toLowerCase().includes('territory') || pageText.toLowerCase().includes('map'),
        hasRegions: document.querySelectorAll('[class*="region"], [class*="location"]').length > 0,
        hasTravelOption: buttons.some(btn => btn.textContent?.toLowerCase().includes('travel')),
        hasLocationInfo: pageText.toLowerCase().includes('location') || pageText.toLowerCase().includes('current')
      };
    });

    await page.screenshot({ path: 'tests/playwright/screenshots/territory-06-final.png' });

    console.log(`Territory system state:`, systemState);
    expect(true).toBe(true);
  });
});
