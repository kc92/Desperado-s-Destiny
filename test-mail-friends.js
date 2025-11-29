/**
 * Test script to check Mail and Friends pages
 */

const puppeteer = require('puppeteer');

async function testPages() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Listen for console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.error('[PAGE ERROR]:', error.message);
    });

    // Listen for failed requests
    page.on('requestfailed', request => {
      console.error('[REQUEST FAILED]:', request.url(), request.failure().errorText);
    });

    console.log('\n=== TESTING MAIL AND FRIENDS PAGES ===\n');

    // Go to landing page
    console.log('1. Navigating to landing page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-mail-friends-01-landing.png' });
    console.log('   ✓ Landing page loaded');

    // Click login
    console.log('\n2. Navigating to login...');
    await page.waitForSelector('a[href="/login"]', { timeout: 5000 });
    await page.click('a[href="/login"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-mail-friends-02-login.png' });
    console.log('   ✓ Login page loaded');

    // Login
    console.log('\n3. Logging in...');
    await page.type('input[type="email"]', 'hawk@test.com');
    await page.type('input[type="password"]', 'Password123!');
    await page.screenshot({ path: 'test-mail-friends-03-filled.png' });

    await page.click('button[type="submit"]');
    console.log('   ⏳ Waiting for login to complete...');

    // Wait for redirect to character select or game
    await page.waitForFunction(
      () => window.location.pathname === '/characters' || window.location.pathname.startsWith('/game'),
      { timeout: 10000 }
    );

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-mail-friends-04-after-login.png' });
    console.log('   ✓ Login successful');

    // Check current path
    const currentPath = await page.evaluate(() => window.location.pathname);
    console.log('   Current path:', currentPath);

    // If on character select, select a character
    if (currentPath === '/characters') {
      console.log('\n4. Selecting character...');
      await page.waitForSelector('button', { timeout: 5000 });
      const buttons = await page.$$('button');
      if (buttons.length > 0) {
        await buttons[0].click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('   ✓ Character selected');
      }
    }

    // Navigate to Mail page
    console.log('\n5. Testing MAIL page...');
    await page.goto('http://localhost:3000/game/mail', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-mail-friends-05-mail.png', fullPage: true });

    // Check if mail page rendered
    const mailPageContent = await page.evaluate(() => {
      const heading = document.querySelector('h1');
      const hasContent = document.body.textContent.trim().length > 0;
      return {
        heading: heading ? heading.textContent : null,
        hasContent,
        bodyText: document.body.textContent.substring(0, 500)
      };
    });

    console.log('\n   MAIL PAGE STATUS:');
    console.log('   - Heading:', mailPageContent.heading);
    console.log('   - Has content:', mailPageContent.hasContent);
    console.log('   - Body text preview:', mailPageContent.bodyText.substring(0, 200));

    if (!mailPageContent.hasContent || !mailPageContent.heading) {
      console.error('   ❌ MAIL PAGE APPEARS BLANK!');
    } else {
      console.log('   ✓ Mail page rendered successfully');
    }

    // Navigate to Friends page
    console.log('\n6. Testing FRIENDS page...');
    await page.goto('http://localhost:3000/game/friends', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-mail-friends-06-friends.png', fullPage: true });

    // Check if friends page rendered
    const friendsPageContent = await page.evaluate(() => {
      const heading = document.querySelector('h1');
      const hasContent = document.body.textContent.trim().length > 0;
      return {
        heading: heading ? heading.textContent : null,
        hasContent,
        bodyText: document.body.textContent.substring(0, 500)
      };
    });

    console.log('\n   FRIENDS PAGE STATUS:');
    console.log('   - Heading:', friendsPageContent.heading);
    console.log('   - Has content:', friendsPageContent.hasContent);
    console.log('   - Body text preview:', friendsPageContent.bodyText.substring(0, 200));

    if (!friendsPageContent.hasContent || !friendsPageContent.heading) {
      console.error('   ❌ FRIENDS PAGE APPEARS BLANK!');
    } else {
      console.log('   ✓ Friends page rendered successfully');
    }

    // Get final console errors
    console.log('\n=== TEST COMPLETE ===\n');
    console.log('Screenshots saved:');
    console.log('  - test-mail-friends-05-mail.png');
    console.log('  - test-mail-friends-06-friends.png');

    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await browser.close();
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testPages().catch(console.error);
