/**
 * Test Mail and Friends pages with authentication
 */

const puppeteer = require('puppeteer');

async function testPages() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 50
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Listen for console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (text.includes('[MailDebug]') || text.includes('[FriendsDebug]') || text.includes('ERROR') || text.includes('error')) {
        console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.error('[PAGE ERROR]:', error.message);
    });

    console.log('\n=== TESTING MAIL AND FRIENDS PAGES WITH AUTH ===\n');

    // Step 1: Login
    console.log('1. Logging in...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.type('input[type="email"]', 'test@test.com');
    await page.type('input[type="password"]', 'Test123!');

    await page.click('button[type="submit"]');
    console.log('   ⏳ Waiting for login...');

    // Wait for redirect after login
    await page.waitForFunction(
      () => window.location.pathname !== '/login',
      { timeout: 15000 }
    );

    await new Promise(resolve => setTimeout(resolve, 3000));
    const afterLoginPath = await page.evaluate(() => window.location.pathname);
    console.log('   ✓ Login successful, redirected to:', afterLoginPath);
    await page.screenshot({ path: 'test-auth-01-after-login.png' });

    // If on character select, select first character
    if (afterLoginPath === '/characters') {
      console.log('\n2. Selecting character...');
      await page.waitForSelector('button', { timeout: 5000 });
      const buttons = await page.$$('button');
      if (buttons.length > 0) {
        // Find "Select" button
        for (const button of buttons) {
          const text = await page.evaluate(el => el.textContent, button);
          if (text.includes('Select')) {
            await button.click();
            break;
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('   ✓ Character selected');
      }
    }

    // Test Mail page
    console.log('\n3. Testing MAIL page...');
    await page.goto('http://localhost:3000/game/mail', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-auth-02-mail.png', fullPage: true });

    const mailCheck = await page.evaluate(() => {
      const body = document.body;
      const text = body.textContent;
      const bgColor = window.getComputedStyle(body.querySelector('.container') || body).backgroundColor;

      return {
        hasDebugText: text.includes('MAIL DEBUG PAGE') || text.includes('Mail'),
        hasMailHeading: text.includes('MAIL'),
        hasContent: text.trim().length > 100,
        textPreview: text.substring(0, 500),
        backgroundColor: bgColor,
        htmlPreview: body.innerHTML.substring(0, 1000)
      };
    });

    console.log('\n   MAIL PAGE RESULTS:');
    console.log('   - Has Debug Text:', mailCheck.hasDebugText);
    console.log('   - Has Mail Heading:', mailCheck.hasMailHeading);
    console.log('   - Has Content:', mailCheck.hasContent);
    console.log('   - Background Color:', mailCheck.backgroundColor);
    console.log('   - Text Preview:', mailCheck.textPreview.substring(0, 200));

    if (mailCheck.hasDebugText) {
      console.log('   ✅ MAIL DEBUG PAGE IS RENDERING!');
    } else {
      console.log('   ❌ Mail debug page NOT rendering properly');
      console.log('   HTML Preview:', mailCheck.htmlPreview);
    }

    // Test Friends page
    console.log('\n4. Testing FRIENDS page...');
    await page.goto('http://localhost:3000/game/friends', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-auth-03-friends.png', fullPage: true });

    const friendsCheck = await page.evaluate(() => {
      const body = document.body;
      const text = body.textContent;
      const bgColor = window.getComputedStyle(body.querySelector('.container') || body).backgroundColor;

      return {
        hasDebugText: text.includes('FRIENDS DEBUG PAGE') || text.includes('Friends'),
        hasFriendsHeading: text.includes('FRIENDS'),
        hasContent: text.trim().length > 100,
        textPreview: text.substring(0, 500),
        backgroundColor: bgColor,
        htmlPreview: body.innerHTML.substring(0, 1000)
      };
    });

    console.log('\n   FRIENDS PAGE RESULTS:');
    console.log('   - Has Debug Text:', friendsCheck.hasDebugText);
    console.log('   - Has Friends Heading:', friendsCheck.hasFriendsHeading);
    console.log('   - Has Content:', friendsCheck.hasContent);
    console.log('   - Background Color:', friendsCheck.backgroundColor);
    console.log('   - Text Preview:', friendsCheck.textPreview.substring(0, 200));

    if (friendsCheck.hasDebugText) {
      console.log('   ✅ FRIENDS DEBUG PAGE IS RENDERING!');
    } else {
      console.log('   ❌ Friends debug page NOT rendering properly');
      console.log('   HTML Preview:', friendsCheck.htmlPreview);
    }

    console.log('\n=== TEST COMPLETE ===\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testPages().catch(console.error);
