/**
 * Complete Actions Page Test - Full User Flow
 */

const puppeteer = require('puppeteer');

async function testComplete() {
  console.log('Testing Complete Actions Flow\n');

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
          console.log('   ❌ 401 UNAUTHORIZED');
        } else if (status === 200) {
          console.log('   ✅ 200 OK - Fix is working!');
        }
      }
    });

    // Step 1: Login
    console.log('1. Logging in...');
    await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'test@test.com');
    await page.type('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Select character
    console.log('2. Selecting character...');
    await page.goto('http://localhost:3005/character-select', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Click the select button
    const selectButtons = await page.$$('button');
    let characterSelected = false;
    for (const button of selectButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text.includes('Select') || text.includes('SELECT')) {
        await button.click();
        characterSelected = true;
        console.log('   ✅ Character selected');
        await new Promise(resolve => setTimeout(resolve, 2000));
        break;
      }
    }

    if (!characterSelected) {
      console.log('   ⚠️ Could not find Select button, trying first button');
      if (selectButtons.length > 0) {
        await selectButtons[0].click();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Step 3: Navigate to Actions
    console.log('\n3. Navigating to Actions page...');
    await page.goto('http://localhost:3005/actions', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Take screenshot
    console.log('4. Taking screenshot...');
    await page.screenshot({
      path: 'ACTIONS-PAGE-WORKING.png',
      fullPage: true
    });
    console.log('   ✅ Screenshot saved: ACTIONS-PAGE-WORKING.png');

    // Step 5: Check page content
    const result = await page.evaluate(() => {
      const title = document.querySelector('h1')?.innerText || '';
      const hasAvailableActions = title.includes('Available Actions');
      const has401 = document.body.innerText.includes('401');
      const hasUnauth = document.body.innerText.toLowerCase().includes('unauthorized');
      const actionButtons = document.querySelectorAll('button').length;
      const bodyText = document.body.innerText.substring(0, 300);

      return {
        title,
        hasAvailableActions,
        has401,
        hasUnauth,
        actionButtons,
        bodyText
      };
    });

    console.log('\n📊 Page Analysis:');
    console.log(`   Title: "${result.title}"`);
    console.log(`   Has "Available Actions": ${result.hasAvailableActions}`);
    console.log(`   Action buttons: ${result.actionButtons}`);
    console.log(`   Has 401 error: ${result.has401}`);
    console.log(`   Has Unauthorized: ${result.hasUnauth}`);

    if (result.hasAvailableActions && !result.has401 && !result.hasUnauth) {
      console.log('\n✅✅✅ SUCCESS! Actions page is fully working! ✅✅✅');
      console.log('The authentication bug has been fixed!');
    } else {
      console.log('\n⚠️ Status unclear. Page text:');
      console.log(result.bodyText);
    }

    console.log('\nBrowser will stay open for inspection...');
    await new Promise(resolve => setTimeout(resolve, 15000));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testComplete().catch(console.error);
