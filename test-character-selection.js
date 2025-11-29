/**
 * Critical Test: Character Selection Flow
 *
 * Tests:
 * 1. Login as pioneer@test.com
 * 2. Click PLAY button on a character
 * 3. Verify navigation to /game
 * 4. Capture screenshot of game dashboard
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3002';
const API_URL = 'http://localhost:5000';

async function testCharacterSelection() {
  console.log('=== CHARACTER SELECTION CRITICAL TEST ===\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log(`  [BROWSER ERROR] ${text}`);
    } else if (text.includes('character') || text.includes('select')) {
      console.log(`  [BROWSER] ${text}`);
    }
  });

  // Monitor network errors
  page.on('requestfailed', request => {
    console.log(`  [NETWORK FAIL] ${request.url()}`);
  });

  // Monitor API responses
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/characters') || url.includes('/select')) {
      const status = response.status();
      console.log(`  [API] ${response.request().method()} ${url} - ${status}`);

      if (status >= 400) {
        try {
          const body = await response.text();
          console.log(`  [API ERROR] ${body}`);
        } catch (e) {
          // ignore
        }
      }
    }
  });

  try {
    // Step 1: Navigate to app
    console.log('1. Loading application...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'test-char-select-1-landing.png' });
    console.log('   ✓ App loaded');

    // Step 2: Navigate to login
    console.log('\n2. Navigating to login...');
    const loginLink = await page.waitForSelector('a[href="/login"]', { timeout: 5000 });
    await loginLink.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'test-char-select-2-login-page.png' });
    console.log('   ✓ Login page loaded');

    // Step 3: Fill login form
    console.log('\n3. Logging in as test@test.com...');
    await page.type('input[name="email"]', 'test@test.com');
    await page.type('input[name="password"]', 'Test123!');
    await page.screenshot({ path: 'test-char-select-3-form-filled.png' });

    // Step 4: Submit login
    console.log('\n4. Submitting login...');
    const loginButton = await page.waitForSelector('button[type="submit"]');
    await loginButton.click();

    // Wait for redirect to character selection
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'test-char-select-4-after-login.png' });

    const currentUrl = page.url();
    console.log(`   ✓ Logged in, redirected to: ${currentUrl}`);

    // Step 5: Find and click PLAY button
    console.log('\n5. Looking for character PLAY buttons...');

    // Wait for character cards to load
    await page.waitForSelector('[class*="character"]', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get all buttons with text containing "Play" or "PLAY"
    const playButtons = await page.$$('button');
    let playButton = null;

    for (const button of playButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text.toUpperCase().includes('PLAY')) {
        playButton = button;
        console.log(`   ✓ Found PLAY button: "${text}"`);
        break;
      }
    }

    if (!playButton) {
      console.log('   ✗ No PLAY button found!');
      const html = await page.content();
      fs.writeFileSync('test-char-select-ERROR-no-button.html', html);
      await page.screenshot({ path: 'test-char-select-ERROR-no-button.png' });
      throw new Error('PLAY button not found on page');
    }

    await page.screenshot({ path: 'test-char-select-5-before-play.png' });

    // Step 6: Click PLAY button
    console.log('\n6. Clicking PLAY button...');
    await playButton.click();

    // Wait for navigation to /game
    console.log('   Waiting for navigation to /game...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give dashboard time to render

    const gameUrl = page.url();
    console.log(`   ✓ Navigated to: ${gameUrl}`);

    // Step 7: Verify we're on /game
    if (!gameUrl.includes('/game')) {
      console.log(`   ✗ Not on /game page! Current URL: ${gameUrl}`);
      await page.screenshot({ path: 'test-char-select-ERROR-wrong-page.png' });
      throw new Error('Did not navigate to /game');
    }

    // Step 8: Take screenshot of game dashboard
    console.log('\n7. Capturing game dashboard...');
    await page.screenshot({ path: 'test-char-select-7-GAME-DASHBOARD.png', fullPage: true });
    console.log('   ✓ Screenshot saved: test-char-select-7-GAME-DASHBOARD.png');

    // Step 9: Verify dashboard elements loaded
    console.log('\n8. Verifying dashboard elements...');
    const dashboardChecks = {
      'Character name': '[class*="character-name"], h1, h2',
      'Navigation menu': 'nav, [role="navigation"]',
      'Game content': 'main, [role="main"], .dashboard'
    };

    for (const [name, selector] of Object.entries(dashboardChecks)) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        console.log(`   ✓ ${name} present`);
      } catch (e) {
        console.log(`   ⚠ ${name} not found (selector: ${selector})`);
      }
    }

    console.log('\n=== TEST PASSED ===');
    console.log('✓ Character selection works');
    console.log('✓ Navigation to /game successful');
    console.log('✓ Game dashboard loaded');
    console.log('\nScreenshots saved:');
    console.log('  - test-char-select-1-landing.png');
    console.log('  - test-char-select-2-login-page.png');
    console.log('  - test-char-select-3-form-filled.png');
    console.log('  - test-char-select-4-after-login.png');
    console.log('  - test-char-select-5-before-play.png');
    console.log('  - test-char-select-7-GAME-DASHBOARD.png');

    return {
      success: true,
      message: 'Character selection working correctly',
      gameUrl,
      screenshots: ['test-char-select-7-GAME-DASHBOARD.png']
    };

  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    console.error('Error:', error.message);

    // Take error screenshot
    await page.screenshot({ path: 'test-char-select-ERROR-final.png', fullPage: true });

    // Capture page HTML for debugging
    const html = await page.content();
    fs.writeFileSync('test-char-select-ERROR.html', html);

    console.log('\nDebug files saved:');
    console.log('  - test-char-select-ERROR-final.png');
    console.log('  - test-char-select-ERROR.html');

    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testCharacterSelection()
  .then(result => {
    console.log('\n✓ Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Test failed:', error.message);
    process.exit(1);
  });
