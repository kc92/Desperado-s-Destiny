/**
 * Test script to navigate to Inventory page and take screenshot
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function testInventory() {
  console.log('🧪 Starting Inventory Page Test...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. Navigate to login page
    console.log('📄 Navigating to login page...');
    await page.goto('http://localhost:3003/login', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Login with test credentials
    console.log('🔐 Logging in...');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('✅ Login successful');
    console.log('Current URL:', page.url());

    // 3. Navigate to Game Dashboard
    const currentUrl = page.url();
    if (currentUrl.includes('character-select')) {
      console.log('📋 On character select page, choosing first character...');
      await page.waitForSelector('[data-testid="select-character-btn"]', { timeout: 5000 });
      const selectButtons = await page.$$('[data-testid="select-character-btn"]');
      if (selectButtons.length > 0) {
        await selectButtons[0].click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 4. Wait for game dashboard to load
    console.log('🎮 Waiting for game dashboard...');
    await page.waitForSelector('[data-testid="game-dashboard"]', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take screenshot of dashboard with Inventory button
    console.log('📸 Taking screenshot of dashboard...');
    await page.screenshot({ path: 'inventory-test-1-dashboard.png', fullPage: true });
    console.log('✅ Saved: inventory-test-1-dashboard.png');

    // 5. Click on Inventory navigation card
    console.log('🎒 Clicking on Inventory card...');
    await page.click('[data-testid="nav-inventory"]');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Wait for inventory page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 6. Take screenshot of inventory page
    console.log('📸 Taking screenshot of inventory page...');
    await page.screenshot({ path: 'inventory-test-2-page.png', fullPage: true });
    console.log('✅ Saved: inventory-test-2-page.png');

    // 7. Verify page content
    const pageTitle = await page.$eval('h1', el => el.textContent);
    console.log('📄 Page title:', pageTitle);

    const hasEmptyState = await page.$('div:has-text("Empty Inventory")');
    if (hasEmptyState) {
      console.log('✅ Empty inventory state displayed correctly');
    } else {
      console.log('📦 Inventory has items');
    }

    console.log('\n✅ Inventory page test completed successfully!');
    console.log('Screenshots saved:');
    console.log('  - inventory-test-1-dashboard.png');
    console.log('  - inventory-test-2-page.png');

  } catch (error) {
    console.error('❌ Error during test:', error.message);

    // Take error screenshot
    try {
      const page = (await browser.pages())[0];
      await page.screenshot({ path: 'inventory-test-ERROR.png', fullPage: true });
      console.log('📸 Error screenshot saved: inventory-test-ERROR.png');
    } catch (e) {
      console.error('Could not take error screenshot');
    }

    throw error;
  } finally {
    await browser.close();
  }
}

testInventory().catch(console.error);
