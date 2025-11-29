const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  email: 'pioneer@test.com',
  password: 'PioneerTest123!',
  characterName: 'ManualTest',
  faction: 'Nahi Coalition',
  screenshotDir: path.join(__dirname, 'manual-test-screenshots')
};

// Ensure screenshot directory exists
if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
  fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshot(page, name) {
  const filepath = path.join(TEST_CONFIG.screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${name}.png`);
  return filepath;
}

async function logConsoleMessages(page) {
  const consoleMessages = [];
  const errorMessages = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, text);
  });

  page.on('pageerror', error => {
    errorMessages.push(error.message);
    console.error('❌ [PAGE ERROR]:', error.message);
  });

  page.on('requestfailed', request => {
    console.error('❌ [REQUEST FAILED]:', request.url(), request.failure().errorText);
  });

  return { consoleMessages, errorMessages };
}

async function captureNetworkTraffic(page) {
  const requests = [];
  const responses = [];

  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers()
    });
  });

  page.on('response', async response => {
    const url = response.url();
    const status = response.status();

    if (url.includes('/api/')) {
      let body = null;
      try {
        body = await response.text();
      } catch (e) {
        // Some responses can't be read
      }

      responses.push({
        url,
        status,
        statusText: response.statusText(),
        body
      });

      console.log(`[API ${response.request().method()}] ${status} ${url}`);
      if (status >= 400) {
        console.error(`❌ API Error: ${status} ${url}`);
        if (body) {
          console.error('Response body:', body);
        }
      }
    }
  });

  return { requests, responses };
}

async function runManualTest() {
  console.log('🚀 Starting Manual Character Test Flow\n');
  console.log('Configuration:');
  console.log(`  Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`  Email: ${TEST_CONFIG.email}`);
  console.log(`  Character: ${TEST_CONFIG.characterName}`);
  console.log(`  Faction: ${TEST_CONFIG.faction}\n`);

  const testResults = {
    steps: [],
    errors: [],
    screenshots: [],
    success: false
  };

  let browser;

  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    const page = await browser.newPage();

    // Setup logging
    const logs = await logConsoleMessages(page);
    const network = await captureNetworkTraffic(page);

    // STEP 1: Navigate to login page
    console.log('\n📍 STEP 1: Navigate to Login Page');
    console.log('=' .repeat(50));

    await page.goto(`${TEST_CONFIG.baseUrl}/login`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await sleep(2000);
    const screenshot1 = await captureScreenshot(page, '01-login-page');
    testResults.screenshots.push(screenshot1);
    testResults.steps.push({ step: 1, name: 'Navigate to login', status: 'success' });
    console.log('✅ Login page loaded successfully');

    // STEP 2: Fill in login credentials
    console.log('\n📍 STEP 2: Enter Login Credentials');
    console.log('=' .repeat(50));

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', TEST_CONFIG.email, { delay: 50 });
    console.log(`  ✓ Entered email: ${TEST_CONFIG.email}`);

    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.type('input[type="password"]', TEST_CONFIG.password, { delay: 50 });
    console.log(`  ✓ Entered password`);

    await sleep(1000);
    const screenshot2 = await captureScreenshot(page, '02-login-filled');
    testResults.screenshots.push(screenshot2);
    testResults.steps.push({ step: 2, name: 'Fill login form', status: 'success' });
    console.log('✅ Login form filled');

    // STEP 3: Submit login
    console.log('\n📍 STEP 3: Submit Login');
    console.log('=' .repeat(50));

    const loginButton = await page.$('button[type="submit"]');
    if (!loginButton) {
      throw new Error('Login button not found');
    }

    await loginButton.click();
    console.log('  ✓ Clicked login button');

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(2000);

    const currentUrl = page.url();
    console.log(`  ✓ Navigated to: ${currentUrl}`);

    const screenshot3 = await captureScreenshot(page, '03-after-login');
    testResults.screenshots.push(screenshot3);
    testResults.steps.push({ step: 3, name: 'Login submitted', status: 'success', url: currentUrl });
    console.log('✅ Login successful');

    // STEP 4: Check for characters page or create character
    console.log('\n📍 STEP 4: Character Selection/Creation');
    console.log('=' .repeat(50));

    await sleep(2000);

    // Check if we're on characters page
    const isCharactersPage = currentUrl.includes('/characters');
    console.log(`  Current page: ${isCharactersPage ? 'Characters page' : 'Other page'}`);

    // Look for existing characters or create button
    // Use XPath to find buttons by text content
    const playButtons = await page.$x("//button[contains(., 'PLAY')]");
    const createButtons = await page.$x("//button[contains(., 'Create Your First Character') or contains(., 'CREATE CHARACTER')]");

    if (playButtons.length > 0) {
      const playButton = playButtons[0];
      console.log('  ✓ Found existing character with PLAY button');
      testResults.steps.push({ step: 4, name: 'Found existing character', status: 'success' });

      const screenshot4a = await captureScreenshot(page, '04a-existing-character');
      testResults.screenshots.push(screenshot4a);

      // Skip to STEP 6 (character selection)
      console.log('\n📍 STEP 6: Select Character');
      console.log('=' .repeat(50));

      await playButton.click();
      console.log('  ✓ Clicked PLAY button');

      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
      await sleep(2000);

      const gameUrl = page.url();
      console.log(`  ✓ Navigated to: ${gameUrl}`);

      const screenshot6 = await captureScreenshot(page, '06-game-page');
      testResults.screenshots.push(screenshot6);

      if (gameUrl.includes('/game')) {
        testResults.steps.push({ step: 6, name: 'Character selected', status: 'success', url: gameUrl });
        testResults.success = true;
        console.log('✅ Successfully reached game page!');
      } else {
        throw new Error(`Expected /game URL but got: ${gameUrl}`);
      }

    } else if (createButtons.length > 0) {
      const createButton = createButtons[0];
      console.log('  ✓ Found character creation button');
      testResults.steps.push({ step: 4, name: 'Character creation needed', status: 'success' });

      const screenshot4b = await captureScreenshot(page, '04b-no-characters');
      testResults.screenshots.push(screenshot4b);

      // STEP 5: Create character
      console.log('\n📍 STEP 5: Create Character');
      console.log('=' .repeat(50));

      await createButton.click();
      console.log('  ✓ Clicked create character button');
      await sleep(2000);

      // Enter character name
      await page.waitForSelector('input[placeholder*="name" i], input[name="name"]', { timeout: 10000 });
      await page.type('input[placeholder*="name" i], input[name="name"]', TEST_CONFIG.characterName, { delay: 50 });
      console.log(`  ✓ Entered character name: ${TEST_CONFIG.characterName}`);

      await sleep(1000);
      const screenshot5a = await captureScreenshot(page, '05a-character-name');
      testResults.screenshots.push(screenshot5a);

      // Select faction
      const factionButtons = await page.$x(`//button[contains(., '${TEST_CONFIG.faction}')]`);
      if (factionButtons.length > 0) {
        await factionButtons[0].click();
        console.log(`  ✓ Selected faction: ${TEST_CONFIG.faction}`);
      } else {
        console.log('  ⚠ Faction button not found, trying radio/checkbox');
        const factionRadio = await page.$(`input[value="${TEST_CONFIG.faction}"]`);
        if (factionRadio) {
          await factionRadio.click();
          console.log(`  ✓ Selected faction via radio: ${TEST_CONFIG.faction}`);
        }
      }

      await sleep(1000);
      const screenshot5b = await captureScreenshot(page, '05b-faction-selected');
      testResults.screenshots.push(screenshot5b);

      // Click Next Step or Create
      const nextButtons = await page.$x("//button[contains(., 'Next Step') or contains(., 'NEXT')]");
      if (nextButtons.length > 0) {
        await nextButtons[0].click();
        console.log('  ✓ Clicked Next Step');
        await sleep(2000);

        const screenshot5c = await captureScreenshot(page, '05c-after-next');
        testResults.screenshots.push(screenshot5c);
      }

      // Final create button
      const finalCreateButtons = await page.$x("//button[contains(., 'CREATE CHARACTER')]");
      const submitButtons = await page.$('button[type="submit"]');

      if (finalCreateButtons.length > 0) {
        await finalCreateButtons[0].click();
        console.log('  ✓ Clicked CREATE CHARACTER');

        await sleep(3000);

        const screenshot5d = await captureScreenshot(page, '05d-after-create');
        testResults.screenshots.push(screenshot5d);

        testResults.steps.push({ step: 5, name: 'Character created', status: 'success' });
        console.log('✅ Character created');
      } else {
        throw new Error('CREATE CHARACTER button not found');
      }

      // STEP 6: Select the newly created character
      console.log('\n📍 STEP 6: Select Character');
      console.log('=' .repeat(50));

      await sleep(2000);

      const newPlayButtons = await page.$x("//button[contains(., 'PLAY')]");
      if (newPlayButtons.length === 0) {
        throw new Error('PLAY button not found after character creation');
      }

      await newPlayButtons[0].click();
      console.log('  ✓ Clicked PLAY button');

      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
      await sleep(2000);

      const gameUrl = page.url();
      console.log(`  ✓ Navigated to: ${gameUrl}`);

      const screenshot6 = await captureScreenshot(page, '06-game-page');
      testResults.screenshots.push(screenshot6);

      if (gameUrl.includes('/game')) {
        testResults.steps.push({ step: 6, name: 'Character selected', status: 'success', url: gameUrl });
        testResults.success = true;
        console.log('✅ Successfully reached game page!');
      } else {
        throw new Error(`Expected /game URL but got: ${gameUrl}`);
      }

    } else {
      throw new Error('Neither PLAY button nor CREATE CHARACTER button found');
    }

    // Final verification
    console.log('\n📍 FINAL VERIFICATION');
    console.log('=' .repeat(50));

    const finalUrl = page.url();
    console.log(`  Current URL: ${finalUrl}`);

    const pageTitle = await page.title();
    console.log(`  Page Title: ${pageTitle}`);

    const screenshot7 = await captureScreenshot(page, '07-final-state');
    testResults.screenshots.push(screenshot7);

    // Keep browser open for inspection
    console.log('\n⏸  Browser will remain open for 10 seconds for inspection...');
    await sleep(10000);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    testResults.errors.push({
      message: error.message,
      stack: error.stack
    });

    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const page = pages[pages.length - 1];
          const errorScreenshot = await captureScreenshot(page, 'ERROR-state');
          testResults.screenshots.push(errorScreenshot);

          // Capture HTML for debugging
          const html = await page.content();
          const htmlPath = path.join(TEST_CONFIG.screenshotDir, 'ERROR-page.html');
          fs.writeFileSync(htmlPath, html);
          console.log(`📄 HTML saved: ERROR-page.html`);
        }
      } catch (screenshotError) {
        console.error('Could not capture error screenshot:', screenshotError.message);
      }
    }
  } finally {
    // Save test results
    const resultsPath = path.join(TEST_CONFIG.screenshotDir, 'test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📊 Test results saved: test-results.json`);

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`Status: ${testResults.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Steps Completed: ${testResults.steps.length}`);
    console.log(`Screenshots Taken: ${testResults.screenshots.length}`);
    console.log(`Errors: ${testResults.errors.length}`);

    if (testResults.steps.length > 0) {
      console.log('\nSteps:');
      testResults.steps.forEach(step => {
        console.log(`  ${step.step}. ${step.name} - ${step.status}${step.url ? ` (${step.url})` : ''}`);
      });
    }

    if (testResults.errors.length > 0) {
      console.log('\nErrors:');
      testResults.errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.message}`);
      });
    }

    console.log(`\nScreenshots location: ${TEST_CONFIG.screenshotDir}`);
    console.log('='.repeat(70));

    if (browser) {
      await browser.close();
    }
  }

  return testResults;
}

// Run the test
runManualTest()
  .then(results => {
    process.exit(results.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
