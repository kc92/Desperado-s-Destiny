// Test script to verify login and navigation
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true, // Open DevTools to see console logs
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => {
    if (msg.text().includes('LOGIN') || msg.text().includes('AUTH') || msg.text().includes('PROTECTED')) {
      console.log('Browser Console:', msg.text());
    }
  });

  try {
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    console.log('2. Current URL:', page.url());

    // Click login button on landing page
    console.log('3. Looking for login button...');
    await page.waitForSelector('a[href="/login"]', { timeout: 5000 });
    await page.click('a[href="/login"]');

    // Wait for login page to load
    console.log('4. Waiting for login page...');
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });

    console.log('5. Current URL after clicking login:', page.url());

    // Fill in login form
    console.log('6. Filling login form...');
    await page.type('input[name="email"]', 'test@desperados.com');
    await page.type('input[name="password"]', 'Password123!');

    // Take screenshot before login
    await page.screenshot({ path: 'login-before.png' });
    console.log('7. Screenshot saved: login-before.png');

    // Click login button
    console.log('8. Clicking login button...');
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    console.log('9. Waiting for navigation...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Give it time to navigate

    console.log('10. Final URL:', page.url());

    // Check localStorage for auth state
    const authStore = await page.evaluate(() => {
      const stored = window.localStorage.getItem('auth-store');
      return stored ? JSON.parse(stored) : null;
    });

    console.log('11. Auth store in localStorage:', authStore);

    // Take screenshot after login
    await page.screenshot({ path: 'login-after.png' });
    console.log('12. Screenshot saved: login-after.png');

    // Check if we're on the characters page
    const isOnCharactersPage = page.url().includes('/characters');
    console.log('13. Successfully navigated to characters page?', isOnCharactersPage);

    if (!isOnCharactersPage) {
      console.log('ERROR: Navigation failed! Still on:', page.url());

      // Try to manually navigate
      console.log('14. Trying manual navigation to /characters...');
      await page.goto('http://localhost:3000/characters', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('15. URL after manual navigation:', page.url());

      await page.screenshot({ path: 'manual-navigation.png' });
    }

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  // Keep browser open for inspection
  console.log('\nTest complete. Browser will stay open for 30 seconds for inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  await browser.close();
})();