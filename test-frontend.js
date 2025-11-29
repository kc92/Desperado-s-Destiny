const puppeteer = require('puppeteer');

async function testFrontend() {
  console.log('Starting Puppeteer test of Desperados Destiny frontend...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Test 1: Landing Page
    console.log('\n1. Testing Landing Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'screenshot-1-landing.png', fullPage: true });
    console.log('   ✓ Landing page loaded and screenshot saved');

    // Check for key elements
    const title = await page.title();
    console.log(`   ✓ Page title: ${title}`);

    // Look for main content
    const hasContent = await page.evaluate(() => {
      const elements = {
        hasHeader: !!document.querySelector('h1, h2'),
        hasButtons: !!document.querySelector('button'),
        hasLinks: !!document.querySelector('a'),
        bodyText: document.body.innerText.substring(0, 100)
      };
      return elements;
    });
    console.log('   ✓ Page content:', hasContent);

    // Test 2: Navigation to Login
    console.log('\n2. Testing Login Page...');
    const loginLink = await page.$('a[href="/login"]');
    if (loginLink) {
      await loginLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.screenshot({ path: 'screenshot-2-login.png', fullPage: true });
      console.log('   ✓ Login page loaded and screenshot saved');

      // Check for login form
      const hasLoginForm = await page.evaluate(() => {
        return {
          hasEmailInput: !!document.querySelector('input[type="email"], input[name="email"]'),
          hasPasswordInput: !!document.querySelector('input[type="password"]'),
          hasSubmitButton: !!document.querySelector('button[type="submit"]')
        };
      });
      console.log('   ✓ Login form elements:', hasLoginForm);
    }

    // Test 3: Navigation to Register
    console.log('\n3. Testing Register Page...');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'screenshot-3-register.png', fullPage: true });
    console.log('   ✓ Register page loaded and screenshot saved');

    // Check for register form
    const hasRegisterForm = await page.evaluate(() => {
      return {
        hasEmailInput: !!document.querySelector('input[type="email"], input[name="email"]'),
        hasPasswordInput: !!document.querySelector('input[type="password"]'),
        hasConfirmPasswordInput: document.querySelectorAll('input[type="password"]').length > 1,
        hasSubmitButton: !!document.querySelector('button[type="submit"]')
      };
    });
    console.log('   ✓ Register form elements:', hasRegisterForm);

    // Test 4: Check API connection
    console.log('\n4. Testing API Connection...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        return {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    console.log('   API health check:', apiResponse);

    console.log('\n✅ Frontend testing complete!');
    console.log('Screenshots saved:');
    console.log('  - screenshot-1-landing.png');
    console.log('  - screenshot-2-login.png');
    console.log('  - screenshot-3-register.png');

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testFrontend();