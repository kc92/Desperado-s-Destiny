/**
 * Test Gold Display on Dashboard
 * This script verifies:
 * 1. Character data includes gold field
 * 2. Dashboard displays gold properly
 */

const puppeteer = require('puppeteer');

async function testGoldDisplay() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();

    // Enable request interception to log API responses
    await page.setRequestInterception(true);
    page.on('request', request => {
      request.continue();
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/characters')) {
        try {
          const data = await response.json();
          console.log('\n📊 Character API Response:', JSON.stringify(data, null, 2));
          if (data.data && data.data.character) {
            console.log('\n💰 Gold value:', data.data.character.gold);
          }
        } catch (e) {
          // Not JSON response
        }
      }
    });

    console.log('🌐 Opening application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Check if we're on login page
    const isLoginPage = await page.evaluate(() => {
      return window.location.pathname === '/login' ||
             document.querySelector('input[type="email"]') !== null;
    });

    if (isLoginPage) {
      console.log('🔐 Logging in...');
      await page.type('input[type="email"]', 'hawk@test.com');
      await page.type('input[type="password"]', 'TestPass123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }

    // Wait for character selection or game dashboard
    await new Promise(resolve => setTimeout(resolve, 2000));

    const currentPath = await page.evaluate(() => window.location.pathname);
    console.log('📍 Current path:', currentPath);

    if (currentPath.includes('character-select')) {
      console.log('🎭 On character select page, clicking first character...');
      await page.waitForSelector('[data-testid="character-card"]', { timeout: 5000 });
      await page.click('[data-testid="character-card"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }

    // Wait for dashboard to load
    console.log('⏳ Waiting for game dashboard...');
    await page.waitForSelector('[data-testid="game-dashboard"]', { timeout: 10000 });

    // Check if gold is displayed
    const goldDisplay = await page.evaluate(() => {
      // Look for gold display (with 💰 emoji and dollar sign)
      const dashboard = document.querySelector('[data-testid="character-stats"]');
      if (!dashboard) return { found: false, error: 'Dashboard not found' };

      const textContent = dashboard.textContent || '';
      const hasMoneyBag = textContent.includes('💰');
      const hasDollarSign = textContent.includes('$');

      // Try to extract the gold amount
      const goldMatch = textContent.match(/💰\s*\$?([\d,]+)/);
      const goldAmount = goldMatch ? goldMatch[1] : null;

      return {
        found: hasMoneyBag || hasDollarSign,
        hasMoneyBag,
        hasDollarSign,
        goldAmount,
        fullText: textContent
      };
    });

    console.log('\n💰 Gold Display Check:');
    console.log('  - Found:', goldDisplay.found);
    console.log('  - Has 💰 emoji:', goldDisplay.hasMoneyBag);
    console.log('  - Has $ sign:', goldDisplay.hasDollarSign);
    console.log('  - Gold amount:', goldDisplay.goldAmount);

    if (!goldDisplay.found) {
      console.log('\n❌ Gold is NOT displaying on the dashboard!');
      console.log('Dashboard text:', goldDisplay.fullText);
    } else {
      console.log('\n✅ Gold IS displaying on the dashboard!');
    }

    // Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({
      path: 'test-gold-display.png',
      fullPage: false
    });
    console.log('Screenshot saved as: test-gold-display.png');

    // Get character state from React store
    const storeData = await page.evaluate(() => {
      const gameStore = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.
        getCurrentFiber?.()?.memoizedState?.baseState;
      return gameStore;
    });

    if (storeData) {
      console.log('\n📦 Store data available');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await page.screenshot({ path: 'test-gold-error.png' });
    console.log('Error screenshot saved as: test-gold-error.png');
  } finally {
    await browser.close();
  }
}

testGoldDisplay().catch(console.error);
