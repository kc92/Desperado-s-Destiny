const puppeteer = require('puppeteer');

async function visualLoginTest() {
  console.log('🔍 VISUAL LOGIN TEST - Testing with fresh client on port 3006 (with hydration fix)\n');

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[AUTH DEBUG]')) {
      console.log('🔧 CLIENT DEBUG:', text);
    }
  });

  // Capture network responses
  page.on('response', async response => {
    if (response.url().includes('/api/auth/login')) {
      console.log(`\n🌐 LOGIN API RESPONSE: ${response.status()}`);
      try {
        const body = await response.json();
        console.log('   Response body:', JSON.stringify(body, null, 2));
      } catch (e) {
        console.log('   Could not parse response body');
      }
    }
  });

  try {
    // STEP 1: Load the app
    console.log('📍 STEP 1: Loading app on port 3006...');
    await page.goto('http://localhost:3006', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'visual-test-1-landing.png', fullPage: true });
    console.log('   ✅ Screenshot: visual-test-1-landing.png');

    // STEP 2: Navigate to login (client-side routing)
    console.log('\n📍 STEP 2: Clicking "RETURNING PLAYER"...');

    // Click the link/button - it's wrapped in a Link component
    await page.click('a[href="/login"]');

    // Wait for the login form to appear (client-side navigation)
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });

    await page.screenshot({ path: 'visual-test-2-login-page.png', fullPage: true });
    console.log('   ✅ Screenshot: visual-test-2-login-page.png');
    console.log('   📍 Current URL:', page.url());

    // STEP 3: Fill login form
    console.log('\n📍 STEP 3: Filling login form...');
    await page.type('input[type="email"]', 'test@test.com');
    await page.type('input[type="password"]', 'Test123!');
    await page.screenshot({ path: 'visual-test-3-form-filled.png', fullPage: true });
    console.log('   ✅ Screenshot: visual-test-3-form-filled.png');

    // STEP 4: Submit login
    console.log('\n📍 STEP 4: Submitting login...');
    const urlBefore = page.url();

    // Find and click submit button
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]') ||
                       Array.from(document.querySelectorAll('button')).find(b =>
                         b.textContent?.toLowerCase().includes('log in') ||
                         b.textContent?.toLowerCase().includes('login') ||
                         b.textContent?.toLowerCase().includes('sign in')
                       );
      if (submitBtn) {
        console.log('Clicking submit button:', submitBtn.textContent);
        submitBtn.click();
      }
    });

    // Wait for either URL change or error message
    await Promise.race([
      page.waitForFunction(
        oldUrl => window.location.href !== oldUrl,
        { timeout: 10000 },
        urlBefore
      ),
      page.waitForSelector('.error, [role="alert"], .text-red-500', { timeout: 5000 }),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]);

    // Give it a moment to settle
    await new Promise(resolve => setTimeout(resolve, 2000));

    const urlAfter = page.url();
    await page.screenshot({ path: 'visual-test-4-after-login.png', fullPage: true });
    console.log('   ✅ Screenshot: visual-test-4-after-login.png');

    // STEP 5: Analyze results
    console.log('\n📊 ANALYSIS:');
    console.log('   URL before:', urlBefore);
    console.log('   URL after:', urlAfter);

    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasLoginForm: !!document.querySelector('input[type="email"]'),
        hasCharacterUI: document.body.innerText.includes('Character') ||
                       document.body.innerText.includes('Energy') ||
                       document.body.innerText.includes('Gold') ||
                       document.body.innerText.includes('Health'),
        hasCharacterSelect: document.body.innerText.includes('Select Character') ||
                           document.body.innerText.includes('Create Character'),
        bodyPreview: document.body.innerText.substring(0, 300),
        errorMessages: Array.from(document.querySelectorAll('.error, [role="alert"], .text-red-500'))
          .map(el => el.textContent?.trim())
          .filter(Boolean)
      };
    });

    console.log('\n📄 PAGE STATE:');
    console.log('   Title:', pageContent.title);
    console.log('   Has login form:', pageContent.hasLoginForm);
    console.log('   Has game UI:', pageContent.hasCharacterUI);
    console.log('   Has character select:', pageContent.hasCharacterSelect);
    if (pageContent.errorMessages.length > 0) {
      console.log('   Error messages:', pageContent.errorMessages);
    }
    console.log('   Page preview:', pageContent.bodyPreview);

    console.log('\n🎯 VERDICT:');
    if (urlBefore !== urlAfter && !pageContent.hasLoginForm) {
      console.log('   ✅ LOGIN SUCCESS - Redirected away from login page');
      console.log('   ✅ New URL:', urlAfter);
      if (pageContent.hasCharacterSelect) {
        console.log('   ✅ Redirected to character selection');
      } else if (pageContent.hasCharacterUI) {
        console.log('   ✅ Redirected to game');
      }
    } else if (pageContent.hasLoginForm) {
      console.log('   ❌ LOGIN FAILED - Still on login page');
      if (pageContent.errorMessages.length > 0) {
        console.log('   ❌ Errors found:', pageContent.errorMessages.join(', '));
      }
    } else {
      console.log('   ⚠️  UNCLEAR - Check screenshots for verification');
    }

    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser stays open for 10 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.error('💥 ERROR:', error.message);
    await page.screenshot({ path: 'visual-test-ERROR.png' });
  } finally {
    await browser.close();
  }
}

visualLoginTest().catch(console.error);