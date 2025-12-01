const puppeteer = require('puppeteer');

async function testApp() {
  console.log('🚀 Starting automated test...\n');

  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  try {
    const page = await browser.newPage();

    // Capture console logs
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`❌ [Browser ${type}]:`, msg.text());
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.log('❌ [Page Error]:', error.message);
    });

    // Capture failed requests
    page.on('requestfailed', request => {
      console.log('❌ [Request Failed]:', request.url(), request.failure().errorText);
    });

    console.log('📍 Step 1: Navigating to http://localhost:3001');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'screenshot-1-loaded.png' });
    console.log('✅ Page loaded\n');

    // Wait a bit for any initial requests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if we're on landing page
    let url = page.url();
    console.log('📍 Current URL:', url);

    // If on landing page, click "RETURNING PLAYER" link to go to login
    if (url === 'http://localhost:3001/' || !url.includes('/login')) {
      console.log('📍 Step 2: On landing page, clicking RETURNING PLAYER');

      // Click the link to /login
      await page.click('a[href="/login"]');
      console.log('✅ Clicked RETURNING PLAYER link');
      await new Promise(resolve => setTimeout(resolve, 2000));

      url = page.url();
      console.log('📍 After clicking, URL:', url);
    }

    if (url.includes('/login')) {
      console.log('📍 Step 3: Logging in with test credentials');

      // Wait for login form
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });

      // Fill in login form
      await page.type('input[type="email"]', 'test@test.com');
      await page.type('input[type="password"]', 'Test123!');
      await page.screenshot({ path: 'screenshot-2-login-form.png' });

      // Click login button
      const loginButton = await page.$('button[type="submit"]');
      await loginButton.click();
      console.log('🔄 Login button clicked, waiting for response...\n');

      // Wait for navigation or error
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.screenshot({ path: 'screenshot-3-after-login.png' });

      const newUrl = page.url();
      console.log('📍 After login URL:', newUrl);

      if (newUrl.includes('/login')) {
        console.log('❌ Still on login page - login failed');
        const errorMsg = await page.$eval('.error, .alert', el => el.textContent).catch(() => 'No error message found');
        console.log('Error message:', errorMsg);
      } else {
        console.log('✅ Login successful!\n');
      }
    }

    // Check if we're on character creation
    if (page.url().includes('/character-creation')) {
      console.log('📍 Step 4: On character creation page');
      await page.screenshot({ path: 'screenshot-4-character-creation.png' });

      // Fill out character creation form
      console.log('📍 Step 5: Filling out character creation form');

      // Wait for name input
      await page.waitForSelector('input[name="characterName"]', { timeout: 5000 });
      await page.type('input[name="characterName"]', 'TestHero');

      // Select a faction (click on one of the faction cards)
      const factionCards = await page.$$('[data-faction], button:has-text("Settler Alliance"), button:has-text("Nahi Coalition"), button:has-text("Frontera")');
      if (factionCards.length > 0) {
        await factionCards[0].click();
        console.log('✅ Faction selected');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ path: 'screenshot-5-form-filled.png' });

      // Look for "Enter the Territory" or submit button
      console.log('📍 Step 6: Looking for submit button');

      const buttons = await page.$$('button');
      let submitButton = null;

      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        console.log('Found button:', text);
        if (text.includes('Enter') || text.includes('Territory') || text.includes('Create') || text.includes('Continue')) {
          submitButton = button;
          console.log('✅ Found submit button:', text);
          break;
        }
      }

      if (submitButton) {
        console.log('📍 Step 7: Clicking submit button');
        await submitButton.click();
        console.log('🔄 Button clicked, waiting for response...\n');

        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'screenshot-6-after-submit.png' });

        const finalUrl = page.url();
        console.log('📍 Final URL:', finalUrl);

        if (finalUrl.includes('/character-creation')) {
          console.log('❌ Still on character creation - submission may have failed');
        } else {
          console.log('✅ Character creation completed! Redirected to:', finalUrl);
        }
      } else {
        console.log('❌ Could not find submit button');
      }
    }

    // Check final state
    console.log('\n📊 Final Report:');
    console.log('Current URL:', page.url());
    console.log('Screenshots saved to current directory');

    // Keep browser open for inspection
    console.log('\n⏸️  Browser will stay open for 30 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Test complete!');
  }
}

testApp().catch(console.error);
