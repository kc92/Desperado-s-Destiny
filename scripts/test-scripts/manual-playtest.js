const puppeteer = require('puppeteer');
const fs = require('fs');

async function manualPlaytest() {
  console.log('🎮 HAWK\'S MANUAL PLAYTEST - Seeing it with my own eyes\n');

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 500, // Slow down so we can see what's happening
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // Listen to console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ BROWSER ERROR:', msg.text());
    }
  });

  // Listen to network requests
  const loginRequest = new Promise(resolve => {
    page.on('response', async response => {
      if (response.url().includes('/api/auth/login')) {
        const status = response.status();
        let body = null;
        try {
          body = await response.json();
        } catch (e) {}
        resolve({ status, body });
      }
    });
  });

  try {
    // STEP 1: Load the landing page
    console.log('📍 STEP 1: Loading landing page...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'hawk-test-1-landing.png', fullPage: true });
    console.log('   ✅ Screenshot saved: hawk-test-1-landing.png');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // STEP 2: Click "RETURNING PLAYER" button
    console.log('\n📍 STEP 2: Clicking "RETURNING PLAYER" button...');

    // Find and click the button
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const loginBtn = buttons.find(btn =>
        btn.textContent.includes('RETURNING PLAYER') ||
        btn.textContent.toLowerCase().includes('login') ||
        btn.getAttribute('href')?.includes('login')
      );
      if (loginBtn) {
        loginBtn.click();
        return true;
      }
      return false;
    });

    if (!clicked) {
      console.log('   ❌ FAILED: Cannot find login button');
      await browser.close();
      return;
    }
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'hawk-test-2-login-page.png', fullPage: true });
    console.log('   ✅ Screenshot saved: hawk-test-2-login-page.png');
    console.log('   📍 Current URL:', page.url());
    await new Promise(resolve => setTimeout(resolve, 1000));

    // STEP 3: Fill in login form
    console.log('\n📍 STEP 3: Filling login form...');
    const emailInput = await page.$('input[type="email"]') || await page.$('input[name="email"]');
    const passwordInput = await page.$('input[type="password"]') || await page.$('input[name="password"]');

    if (!emailInput || !passwordInput) {
      console.log('   ❌ FAILED: Cannot find email or password input');
      await browser.close();
      return;
    }

    await emailInput.type('test@test.com');
    await passwordInput.type('Test123!');
    await page.screenshot({ path: 'hawk-test-3-form-filled.png', fullPage: true });
    console.log('   ✅ Screenshot saved: hawk-test-3-form-filled.png');
    console.log('   📝 Email: test@test.com');
    console.log('   📝 Password: Test123!');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // STEP 4: Submit login
    console.log('\n📍 STEP 4: Submitting login form...');
    const urlBeforeSubmit = page.url();
    console.log('   📍 URL before submit:', urlBeforeSubmit);

    const submitClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submitBtn = buttons.find(btn =>
        btn.type === 'submit' ||
        btn.textContent.toLowerCase().includes('log')
      );
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    });

    if (!submitClicked) {
      console.log('   ❌ FAILED: Cannot find submit button');
      await browser.close();
      return;
    }

    // Wait for either navigation or error message
    try {
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }),
        page.waitForSelector('.error', { timeout: 5000 }),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);
    } catch (e) {
      // Timeout is ok, continue
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const urlAfterSubmit = page.url();
    await page.screenshot({ path: 'hawk-test-4-after-login.png', fullPage: true });
    console.log('   ✅ Screenshot saved: hawk-test-4-after-login.png');
    console.log('   📍 URL after submit:', urlAfterSubmit);

    // Check the login API response
    const loginResponse = await Promise.race([loginRequest, new Promise(resolve => setTimeout(() => resolve(null), 2000))]);
    if (loginResponse) {
      console.log('\n🌐 LOGIN API RESPONSE:');
      console.log('   Status:', loginResponse.status);
      console.log('   Body:', JSON.stringify(loginResponse.body, null, 2));
    }

    // STEP 5: Analyze what happened
    console.log('\n📊 ANALYSIS:');

    if (urlBeforeSubmit === urlAfterSubmit) {
      console.log('   ❌ URL DID NOT CHANGE - Login likely failed');
      console.log('   ⚠️  Still on:', urlAfterSubmit);

      // Check for error messages
      const errorText = await page.evaluate(() => {
        const errorEl = document.querySelector('.error') ||
                       document.querySelector('[role="alert"]') ||
                       document.querySelector('.text-red-500') ||
                       document.querySelector('.alert-error');
        return errorEl ? errorEl.textContent : null;
      });

      if (errorText) {
        console.log('   ❌ Error message found:', errorText);
      }

      console.log('\n❌ LOGIN FAILED - Staying on login page');

    } else {
      console.log('   ✅ URL CHANGED!');
      console.log('   ✅ Before:', urlBeforeSubmit);
      console.log('   ✅ After:', urlAfterSubmit);

      if (urlAfterSubmit.includes('/characters') || urlAfterSubmit.includes('/game')) {
        console.log('\n✅ LOGIN SUCCESS - Redirected to game!');
      } else {
        console.log('\n⚠️  Redirected, but not to expected page');
      }
    }

    // STEP 6: Check what's on screen
    console.log('\n📍 STEP 5: Checking current page content...');
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent,
        bodyText: document.body.innerText.substring(0, 500),
        hasCharacterUI: !!document.querySelector('[data-testid*="character"]') ||
                       document.body.innerText.includes('Character') ||
                       document.body.innerText.includes('Energy'),
        hasLoginForm: !!document.querySelector('input[type="email"]'),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent).slice(0, 10)
      };
    });

    console.log('\n📄 PAGE CONTENT:');
    console.log('   Title:', pageContent.title);
    console.log('   H1:', pageContent.h1);
    console.log('   Has Character UI:', pageContent.hasCharacterUI);
    console.log('   Has Login Form:', pageContent.hasLoginForm);
    console.log('   Buttons on page:', pageContent.buttons);

    await page.screenshot({ path: 'hawk-test-5-final-state.png', fullPage: true });
    console.log('   ✅ Screenshot saved: hawk-test-5-final-state.png');

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('🎯 FINAL VERDICT:');
    console.log('════════════════════════════════════════════════════════════');

    if (!pageContent.hasLoginForm && urlAfterSubmit !== urlBeforeSubmit) {
      console.log('✅ LOGIN WORKS - Successfully logged in and redirected');
      console.log('✅ No longer on login page');
      console.log('✅ URL changed from', urlBeforeSubmit, 'to', urlAfterSubmit);
    } else if (pageContent.hasLoginForm) {
      console.log('❌ LOGIN FAILED - Still showing login form');
      console.log('❌ URL:', urlAfterSubmit);
    } else {
      console.log('⚠️  UNCLEAR STATE - Need manual verification');
    }

    console.log('\n⏸️  Browser staying open for 30 seconds for manual inspection...');
    console.log('    Check the screenshots to verify what actually happened.');

    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('\n💥 ERROR during playtest:', error);
    await page.screenshot({ path: 'hawk-test-ERROR.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

manualPlaytest().catch(console.error);
