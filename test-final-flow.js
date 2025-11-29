// Final test of the login and character page flow
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('=== TESTING LOGIN AND CHARACTER PAGE FLOW ===\n');

  try {
    // Start fresh
    console.log('1. Starting fresh at login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    console.log('   ✓ On login page');

    // Login
    console.log('\n2. Logging in with test credentials...');
    await page.type('input[name="email"]', 'test@desperados.com');
    await page.type('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    console.log('   ✓ Login submitted');

    // Wait for navigation (hard reload expected)
    console.log('\n3. Waiting for navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('   ✓ Navigation complete');
    console.log('   Current URL:', page.url());

    // Check what's displayed
    console.log('\n4. Checking page content...');
    const pageContent = await page.evaluate(() => {
      return {
        url: window.location.pathname,
        title: document.querySelector('h1')?.textContent,
        subtitle: document.querySelector('p')?.textContent,

        // Look for character page elements
        hasCharacterTitle: document.body.innerText.includes('Your Characters'),
        hasWelcomeMessage: document.body.innerText.includes('Welcome back'),
        hasCreateButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent?.includes('Create') || btn.textContent?.includes('New Character')
        ),
        hasLoginForm: !!document.querySelector('input[name="email"]'),

        // Check for "no characters" message
        hasNoCharactersMessage: document.body.innerText.includes('No characters') ||
                                document.body.innerText.includes('Create your first'),

        // Get actual visible text
        visibleText: document.body.innerText.substring(0, 300)
      };
    });

    console.log('\n   Page Analysis:');
    console.log('   - URL:', pageContent.url);
    console.log('   - Title:', pageContent.title);
    console.log('   - Subtitle:', pageContent.subtitle);
    console.log('   - Shows "Your Characters"?', pageContent.hasCharacterTitle);
    console.log('   - Shows welcome message?', pageContent.hasWelcomeMessage);
    console.log('   - Has create button?', pageContent.hasCreateButton);
    console.log('   - Still shows login form?', pageContent.hasLoginForm);
    console.log('   - Shows "no characters" message?', pageContent.hasNoCharactersMessage);

    // API test
    console.log('\n5. Testing character API...');
    const apiResponse = await page.evaluate(async () => {
      const response = await fetch('/api/characters', {
        credentials: 'include'
      });
      const data = await response.json();
      return {
        status: response.status,
        success: data.success,
        charactersCount: data.data?.characters?.length || 0
      };
    });
    console.log('   API Response:', apiResponse);

    // Take screenshot
    await page.screenshot({ path: 'final-character-page.png', fullPage: true });
    console.log('\n6. Screenshot saved as final-character-page.png');

    // Success check
    const isSuccessful = pageContent.url === '/characters' &&
                         !pageContent.hasLoginForm &&
                         apiResponse.status === 200;

    console.log('\n=== TEST RESULT ===');
    if (isSuccessful) {
      console.log('✅ SUCCESS! Character page is loading correctly!');
      console.log('   - User is authenticated');
      console.log('   - Navigation works');
      console.log('   - API calls succeed');
      console.log(`   - User has ${apiResponse.charactersCount} characters`);

      if (apiResponse.charactersCount === 0) {
        console.log('\n📝 Note: User has no characters yet.');
        console.log('   The page should show a "Create your first character" message.');
      }
    } else {
      console.log('❌ FAILURE! Issues found:');
      if (pageContent.url !== '/characters') {
        console.log('   - Not on /characters page');
      }
      if (pageContent.hasLoginForm) {
        console.log('   - Still showing login form');
      }
      if (apiResponse.status !== 200) {
        console.log('   - API calls failing');
      }
    }

    console.log('\n   Visible content preview:');
    console.log('   "' + pageContent.visibleText + '"');

  } catch (error) {
    console.error('Test failed with error:', error);
    await page.screenshot({ path: 'error-final-test.png' });
  }

  console.log('\n\nBrowser will stay open for 20 seconds for inspection...');
  await new Promise(resolve => setTimeout(resolve, 20000));

  await browser.close();
})();