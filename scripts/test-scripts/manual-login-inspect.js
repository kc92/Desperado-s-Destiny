const puppeteer = require('puppeteer');

async function manualInspect() {
  console.log('🔍 Opening browser for manual inspection...\n');

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    defaultViewport: { width: 1920, height: 1080 },
    devtools: true // Open DevTools automatically
  });

  const page = await browser.newPage();

  // Capture ALL console logs
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
  });

  // Capture errors
  page.on('pageerror', error => {
    console.error('[BROWSER ERROR]:', error.message);
  });

  try {
    console.log('Loading http://localhost:3006...\n');
    await page.goto('http://localhost:3006', { waitUntil: 'networkidle0' });

    console.log('✅ Page loaded. Browser will stay open.');
    console.log('📍 Please manually:');
    console.log('   1. Open DevTools Console (already open)');
    console.log('   2. Click "RETURNING PLAYER"');
    console.log('   3. Enter: test@test.com / Test123!');
    console.log('   4. Click "ENTER THE TERRITORY"');
    console.log('   5. Watch the console logs');
    console.log('\nPress Ctrl+C to close when done.\n');

    // Keep browser open indefinitely
    await new Promise(() => {});
  } catch (error) {
    console.error('💥 ERROR:', error.message);
  }
}

manualInspect().catch(console.error);
