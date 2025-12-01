/**
 * Test Actions Authentication Fix
 *
 * This script tests that the actions endpoint now works with cookie authentication
 */

const puppeteer = require('puppeteer');

async function testActionsAuth() {
  console.log('Starting Actions Authentication Test...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();

    // Enable request interception to log API calls
    await page.setRequestInterception(true);
    const apiCalls = [];

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push({
          method: request.method(),
          url: request.url(),
          headers: request.headers()
        });
      }
      request.continue();
    });

    page.on('response', async response => {
      if (response.url().includes('/api/actions')) {
        console.log(`\n📡 Actions API Response:`);
        console.log(`   Status: ${response.status()}`);
        console.log(`   URL: ${response.url()}`);
        try {
          const data = await response.json();
          console.log(`   Success: ${data.success}`);
          if (data.error) {
            console.log(`   ❌ Error: ${data.error}`);
          }
          if (data.data && data.data.actions) {
            console.log(`   ✅ Actions loaded: ${data.data.actions.length || Object.keys(data.data.actions).length} actions`);
          }
        } catch (e) {
          console.log(`   Error parsing response: ${e.message}`);
        }
      }
    });

    // Step 1: Go to login page
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'test-actions-1-login.png' });

    // Step 2: Login with test user
    console.log('2. Logging in...');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    await page.screenshot({ path: 'test-actions-2-after-login.png' });
    console.log('   ✅ Logged in successfully');

    // Step 3: Select character if needed
    const url = page.url();
    if (url.includes('/character-select')) {
      console.log('3. Selecting character...');
      await page.waitForSelector('button:has-text("Select")', { timeout: 5000 });
      const selectButton = await page.$('button');
      if (selectButton) {
        await selectButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
        await page.screenshot({ path: 'test-actions-3-character-selected.png' });
        console.log('   ✅ Character selected');
      }
    }

    // Step 4: Navigate to Actions page
    console.log('4. Navigating to Actions page...');
    await page.goto('http://localhost:3005/actions', { waitUntil: 'networkidle0' });

    // Wait a bit for any API calls to complete
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-actions-4-actions-page.png', fullPage: true });

    // Step 5: Check if actions loaded
    console.log('5. Checking if actions loaded...');
    const hasActions = await page.evaluate(() => {
      const loadingText = document.body.innerText.includes('Loading actions');
      const noActionsText = document.body.innerText.includes('No actions available');
      const errorText = document.body.innerText.includes('401') || document.body.innerText.includes('Unauthorized');

      return {
        loadingText,
        noActionsText,
        errorText,
        pageText: document.body.innerText.substring(0, 500)
      };
    });

    console.log('\n📊 Page Status:');
    console.log(`   Loading: ${hasActions.loadingText}`);
    console.log(`   No Actions: ${hasActions.noActionsText}`);
    console.log(`   Error: ${hasActions.errorText}`);
    console.log(`\n   Page Text Preview: ${hasActions.pageText.substring(0, 200)}...`);

    // Step 6: Check for 401 errors in console
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('401') || msg.text().includes('Unauthorized')) {
        consoleLogs.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    if (consoleLogs.length > 0) {
      console.log('\n❌ 401 ERRORS DETECTED:');
      consoleLogs.forEach(log => console.log(`   ${log}`));
    } else {
      console.log('\n✅ NO 401 ERRORS DETECTED');
    }

    // Print all API calls
    console.log('\n📡 All API Calls Made:');
    apiCalls.forEach((call, i) => {
      console.log(`\n   ${i + 1}. ${call.method} ${call.url}`);
      if (call.headers.cookie) {
        console.log(`      Cookie: ${call.headers.cookie.substring(0, 50)}...`);
      } else {
        console.log(`      ⚠️  No cookie sent!`);
      }
    });

    console.log('\n✅ Test completed! Check the screenshots for visual verification.');
    console.log('   - test-actions-1-login.png');
    console.log('   - test-actions-2-after-login.png');
    console.log('   - test-actions-3-character-selected.png');
    console.log('   - test-actions-4-actions-page.png\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    // Keep browser open for inspection
    console.log('Browser will remain open for 30 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    await browser.close();
  }
}

testActionsAuth().catch(console.error);
