// Test script to verify character page loads and displays properly
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => {
    console.log('Browser Console:', msg.text());
  });

  // Monitor API calls
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/')) {
      console.log(`API Call: ${response.request().method()} ${url} - Status: ${response.status()}`);
    }
  });

  try {
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

    console.log('2. Logging in...');
    await page.type('input[name="email"]', 'test@desperados.com');
    await page.type('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for navigation to characters page
    console.log('3. Waiting for navigation to characters page...');
    await page.waitForFunction(
      () => window.location.pathname === '/characters',
      { timeout: 5000 }
    );

    console.log('4. Successfully navigated to:', page.url());

    // Wait for the page content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check what's on the page
    const pageContent = await page.evaluate(() => {
      const result = {
        title: document.querySelector('h1')?.textContent || 'No title found',
        hasCharacterCards: document.querySelectorAll('[data-testid="character-card"]').length,
        hasCreateButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent?.includes('Create') || btn.textContent?.includes('New Character')
        ),
        errorMessage: document.querySelector('[role="alert"]')?.textContent,
        loadingIndicator: !!document.querySelector('[data-testid="loading"], .spinner, .loading'),
        // Get any visible text content
        bodyText: document.body.innerText.substring(0, 500)
      };

      // Try to find character data
      const cards = Array.from(document.querySelectorAll('.card, [class*="card"]'));
      result.cardCount = cards.length;

      // Check for any character-related elements
      result.characterElements = {
        names: Array.from(document.querySelectorAll('[class*="name"], h2, h3')).map(el => el.textContent).filter(Boolean),
        buttons: Array.from(document.querySelectorAll('button')).map(el => el.textContent).filter(Boolean)
      };

      return result;
    });

    console.log('\n5. Page Content Analysis:');
    console.log('   Title:', pageContent.title);
    console.log('   Character Cards Found:', pageContent.hasCharacterCards);
    console.log('   Card Elements Found:', pageContent.cardCount);
    console.log('   Create Button:', pageContent.hasCreateButton ? 'Yes' : 'No');
    console.log('   Loading Indicator:', pageContent.loadingIndicator ? 'Yes' : 'No');
    console.log('   Error Message:', pageContent.errorMessage || 'None');

    console.log('\n6. Character Elements Found:');
    console.log('   Names/Headers:', pageContent.characterElements.names);
    console.log('   Buttons:', pageContent.characterElements.buttons);

    console.log('\n7. Visible Text (first 500 chars):');
    console.log(pageContent.bodyText);

    // Take screenshot
    await page.screenshot({ path: 'character-page.png', fullPage: true });
    console.log('\n8. Screenshot saved as character-page.png');

    // Check localStorage for character data
    const authStore = await page.evaluate(() => {
      const stored = window.localStorage.getItem('auth-store');
      return stored ? JSON.parse(stored) : null;
    });

    console.log('\n9. Auth State:', authStore?.state?.isAuthenticated ? 'Authenticated' : 'Not Authenticated');

    // Try to check Redux DevTools or Zustand state
    const gameState = await page.evaluate(() => {
      // Try to access Zustand store if exposed
      if (window.__ZUSTAND_DEVTOOLS__) {
        return window.__ZUSTAND_DEVTOOLS__;
      }
      return null;
    });

    if (gameState) {
      console.log('\n10. Game Store State Found:', gameState);
    }

  } catch (error) {
    console.error('\nTest failed:', error);
    await page.screenshot({ path: 'character-page-error.png' });
    console.log('Error screenshot saved as character-page-error.png');
  }

  // Keep browser open for inspection
  console.log('\n\nTest complete. Browser will stay open for 30 seconds for inspection...');
  console.log('You can manually interact with the page to see what happens.');
  await new Promise(resolve => setTimeout(resolve, 30000));

  await browser.close();
})();