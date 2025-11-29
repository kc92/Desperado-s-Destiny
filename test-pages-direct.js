/**
 * Direct test of Mail and Friends pages (bypasses auth)
 */

const puppeteer = require('puppeteer');

async function testPages() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
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

    console.log('\n=== TESTING MAIL AND FRIENDS PAGES (DIRECT) ===\n');

    // Test 1: Direct navigation to Mail page (should redirect to login if not authenticated)
    console.log('1. Testing direct navigation to /game/mail...');
    await page.goto('http://localhost:3000/game/mail', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-pages-01-mail-direct.png', fullPage: true });

    const mailPath = await page.evaluate(() => window.location.pathname);
    console.log('   Current path:', mailPath);

    const mailContent = await page.evaluate(() => {
      const body = document.body.textContent;
      const hasMailDebug = body.includes('MAIL DEBUG PAGE');
      const hasContent = body.trim().length > 0;
      return { hasMailDebug, hasContent, preview: body.substring(0, 300) };
    });

    console.log('   Mail page content check:');
    console.log('   - Has Mail Debug text:', mailContent.hasMailDebug);
    console.log('   - Has any content:', mailContent.hasContent);
    console.log('   - Preview:', mailContent.preview);

    // Test 2: Direct navigation to Friends page
    console.log('\n2. Testing direct navigation to /game/friends...');
    await page.goto('http://localhost:3000/game/friends', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-pages-02-friends-direct.png', fullPage: true });

    const friendsPath = await page.evaluate(() => window.location.pathname);
    console.log('   Current path:', friendsPath);

    const friendsContent = await page.evaluate(() => {
      const body = document.body.textContent;
      const hasFriendsDebug = body.includes('FRIENDS DEBUG PAGE');
      const hasContent = body.trim().length > 0;
      return { hasFriendsDebug, hasContent, preview: body.substring(0, 300) };
    });

    console.log('   Friends page content check:');
    console.log('   - Has Friends Debug text:', friendsContent.hasFriendsDebug);
    console.log('   - Has any content:', friendsContent.hasContent);
    console.log('   - Preview:', friendsContent.preview);

    console.log('\n=== TEST COMPLETE ===\n');
    console.log('Screenshots saved:');
    console.log('  - test-pages-01-mail-direct.png');
    console.log('  - test-pages-02-friends-direct.png');

    await new Promise(resolve => setTimeout(resolve, 3000));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await browser.close();
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testPages().catch(console.error);
