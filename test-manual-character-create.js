/**
 * Manual test - Try to create a character
 */

const puppeteer = require('puppeteer');

async function testCharacterCreation() {
  console.log('🧪 Manual Character Creation Test');
  console.log('=' .repeat(60));

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`[BROWSER ${type.toUpperCase()}]`, msg.text());
      }
    });

    // Navigate to login
    console.log('\n1️⃣ Navigating to login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });

    // Login
    console.log('2️⃣ Logging in...');
    await page.type('input[name="email"]', 'pioneer@test.com');
    await page.type('input[name="password"]', 'PioneerTest123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log(`   Current URL: ${page.url()}`);

    // Wait for characters page
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click create character button
    console.log('3️⃣ Opening character creator...');
    const createButton = await page.waitForSelector('button', { timeout: 5000 });
    const buttons = await page.$$('button');

    for (const button of buttons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.includes('Create')) {
        console.log(`   Found button: "${text.trim()}"`);
        await button.click();
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fill character name
    console.log('4️⃣ Filling character name...');
    const nameInput = await page.waitForSelector('input#character-name', { timeout: 5000 });
    await nameInput.type('TestHero', { delay: 100 });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Select a faction
    console.log('5️⃣ Selecting faction...');
    const factionButtons = await page.$$('button');
    for (const button of factionButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.includes('Nahi Coalition')) {
        console.log(`   Clicking faction: Nahi Coalition`);
        await button.click();
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Click Next Step
    console.log('6️⃣ Clicking Next Step...');
    const nextButtons = await page.$$('button');
    for (const button of nextButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.includes('Next')) {
        console.log(`   Clicking: "${text.trim()}"`);
        await button.click();
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot of step 2
    await page.screenshot({ path: 'manual-test-step2.png' });
    console.log('   📸 Screenshot saved: manual-test-step2.png');

    // Click CREATE CHARACTER button
    console.log('7️⃣ Clicking CREATE CHARACTER button...');

    // First, let's see what buttons are available
    const allButtons = await page.$$('button');
    console.log(`   Found ${allButtons.length} buttons on page`);

    for (const button of allButtons) {
      const text = await button.evaluate(el => el.textContent);
      const isDisabled = await button.evaluate(el => el.disabled);
      console.log(`   Button: "${text?.trim()}" - Disabled: ${isDisabled}`);

      if (text && text.toUpperCase().includes('CREATE CHARACTER')) {
        console.log(`   ✅ Found CREATE CHARACTER button: "${text.trim()}"`);
        if (isDisabled) {
          console.log(`   ⚠️ Button is disabled`);
        } else {
          console.log(`   Clicking button...`);
          await button.click();
          console.log(`   ✅ Button clicked!`);
          break;
        }
      }
    }

    // Wait for API request
    console.log('8️⃣ Waiting for character creation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take final screenshot
    await page.screenshot({ path: 'manual-test-final.png' });
    console.log('   📸 Screenshot saved: manual-test-final.png');

    // Check if we're back on characters page with a character
    const url = page.url();
    console.log(`   Final URL: ${url}`);

    console.log('\n✅ Test complete! Check screenshots and server logs.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\nClosing browser in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

testCharacterCreation();
