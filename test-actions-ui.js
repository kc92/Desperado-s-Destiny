/**
 * Test Actions Page in Browser
 */

const puppeteer = require('puppeteer');

async function testActionsUI() {
  console.log('Testing Actions Page in Browser UI\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1400, height: 900 }
  });

  try {
    const page = await browser.newPage();

    // Track API responses
    page.on('response', async response => {
      if (response.url().includes('/api/actions')) {
        const status = response.status();
        console.log(`\n📡 Actions API: ${status}`);

        if (status === 401) {
          console.log('   ❌ 401 UNAUTHORIZED - Fix did not work!');
        } else if (status === 200) {
          console.log('   ✅ 200 OK - Authentication successful!');
          try {
            const data = await response.json();
            if (data.data && data.data.actions) {
              const count = Array.isArray(data.data.actions)
                ? data.data.actions.length
                : Object.values(data.data.actions).flat().length;
              console.log(`   ✅ Loaded ${count} actions`);
            }
          } catch (e) {}
        }
      }
    });

    // Step 1: Login
    console.log('1. Going to login page...');
    await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');

    console.log('2. Logging in...');
    await page.type('input[type="email"]', 'test@test.com');
    await page.type('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('   ✅ Login submitted');

    // Step 2: Navigate to Actions
    console.log('\n3. Navigating to Actions page...');
    await page.goto('http://localhost:3005/actions', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Take screenshot
    console.log('4. Taking screenshot...');
    await page.screenshot({
      path: 'test-actions-page-FIXED.png',
      fullPage: true
    });
    console.log('   ✅ Screenshot saved: test-actions-page-FIXED.png');

    // Step 4: Check page content
    const pageContent = await page.evaluate(() => {
      const hasActions = document.querySelectorAll('[class*="action"]').length > 0;
      const has401 = document.body.innerText.includes('401');
      const hasUnauth = document.body.innerText.toLowerCase().includes('unauthorized');
      const hasLoading = document.body.innerText.includes('Loading');
      const hasAvailableActions = document.body.innerText.includes('Available Actions');

      return {
        hasActions,
        has401,
        hasUnauth,
        hasLoading,
        hasAvailableActions,
        title: document.querySelector('h1')?.innerText || 'No title found'
      };
    });

    console.log('\n5. Page Analysis:');
    console.log(`   Title: "${pageContent.title}"`);
    console.log(`   Has "Available Actions": ${pageContent.hasAvailableActions}`);
    console.log(`   Has action elements: ${pageContent.hasActions}`);
    console.log(`   Shows Loading: ${pageContent.hasLoading}`);
    console.log(`   Has 401 error: ${pageContent.has401}`);
    console.log(`   Has Unauthorized: ${pageContent.hasUnauth}`);

    if (pageContent.hasAvailableActions && !pageContent.has401 && !pageContent.hasUnauth) {
      console.log('\n✅ SUCCESS! Actions page is working correctly!');
    } else {
      console.log('\n⚠️  Page may have issues. Check the screenshot.');
    }

    console.log('\nKeeping browser open for 10 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testActionsUI().catch(console.error);
