/**
 * Simple test to capture inventory page screenshots
 */

const puppeteer = require('puppeteer');

async function testInventory() {
  console.log('🧪 Starting Simple Inventory Test...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Navigate to login
    console.log('📄 Navigating to login...');
    await page.goto('http://localhost:3003/login', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if already logged in (redirected to game)
    const currentUrl = page.url();
    console.log('Current URL after login page load:', currentUrl);

    if (!currentUrl.includes('game') && !currentUrl.includes('character-select')) {
      // Need to login
      console.log('🔐 Filling login form...');
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await page.type('input[type="email"]', 'test@test.com', { delay: 50 });
      await page.type('input[type="password"]', 'Test123!', { delay: 50 });

      console.log('🔐 Clicking login button...');
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        console.log('⏳ Waiting for login to complete...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('Current URL:', page.url());

    // Handle character selection if needed
    if (page.url().includes('character')) {
      console.log('📋 On character select, waiting for UI...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try to find and click the PLAY button
      const playButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => btn.textContent.includes('PLAY'));
      });

      if (playButton.asElement()) {
        console.log('✅ Clicking PLAY button...');
        await playButton.asElement().click();
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.log('⚠️ PLAY button not found, navigating directly...');
      }
    }

    // Navigate to game dashboard
    console.log('🎮 Navigating to game dashboard...');
    await page.goto('http://localhost:3003/game', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot of dashboard
    console.log('📸 Taking dashboard screenshot...');
    await page.screenshot({ path: 'inventory-test-1-dashboard.png', fullPage: true });
    console.log('✅ Saved: inventory-test-1-dashboard.png');

    // Navigate directly to inventory page
    console.log('🎒 Navigating to inventory page...');
    await page.goto('http://localhost:3003/game/inventory', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot of inventory
    console.log('📸 Taking inventory screenshot...');
    await page.screenshot({ path: 'inventory-test-2-page.png', fullPage: true });
    console.log('✅ Saved: inventory-test-2-page.png');

    // Check page content
    const pageTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : 'No title found';
    });
    console.log('📄 Page title:', pageTitle);

    console.log('\n✅ Test completed successfully!');
    console.log('Screenshots saved:');
    console.log('  - inventory-test-1-dashboard.png (Game Dashboard with Inventory button)');
    console.log('  - inventory-test-2-page.png (Inventory Page)');

    // Keep browser open for 5 seconds to review
    console.log('\n⏳ Keeping browser open for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('❌ Error:', error.message);

    try {
      const page = (await browser.pages())[0];
      await page.screenshot({ path: 'inventory-test-ERROR.png', fullPage: true });
      console.log('📸 Error screenshot saved');
    } catch (e) {
      // ignore
    }

    throw error;
  } finally {
    await browser.close();
  }
}

testInventory().catch(console.error);
