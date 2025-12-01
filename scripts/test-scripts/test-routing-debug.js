// Debug routing issues
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
    const text = msg.text();
    if (text.includes('PROTECTED') || text.includes('AUTH') || text.includes('LOGIN') || text.includes('ROUTE')) {
      console.log('Browser:', text);
    }
  });

  try {
    console.log('1. Going directly to /characters (should redirect to login)...');
    await page.goto('http://localhost:3000/characters', { waitUntil: 'networkidle2' });
    console.log('   Current URL:', page.url());

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n2. Logging in...');
    await page.type('input[name="email"]', 'test@desperados.com');
    await page.type('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    console.log('\n3. Waiting for navigation...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('   URL after login:', page.url());

    // Check what component is actually rendered
    const pageInfo = await page.evaluate(() => {
      // Try to find React component info
      const result = {
        url: window.location.href,
        pathname: window.location.pathname,
        title: document.title,
        h1Text: document.querySelector('h1')?.textContent,

        // Check for specific page indicators
        hasLoginForm: !!document.querySelector('input[name="email"]'),
        hasCharacterCards: document.querySelectorAll('[class*="character"]').length > 0,
        hasCreateButton: Array.from(document.querySelectorAll('button')).some(btn =>
          btn.textContent?.toLowerCase().includes('create')
        ),

        // Get all visible text from main content
        mainContent: document.querySelector('main')?.innerText?.substring(0, 200) ||
                     document.querySelector('[role="main"]')?.innerText?.substring(0, 200) ||
                     document.body.innerText.substring(0, 200),

        // Check localStorage
        authStore: JSON.parse(localStorage.getItem('auth-store') || '{}'),

        // Get React Router info if available
        reactRouterPresent: !!window.React || !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__
      };

      // Try to get React Fiber info
      const rootElement = document.getElementById('root');
      if (rootElement && rootElement._reactRootContainer) {
        result.hasReactRoot = true;
      }

      return result;
    });

    console.log('\n4. Page Analysis:');
    console.log('   URL:', pageInfo.url);
    console.log('   Pathname:', pageInfo.pathname);
    console.log('   Title:', pageInfo.title);
    console.log('   H1 Text:', pageInfo.h1Text);
    console.log('   Has Login Form?', pageInfo.hasLoginForm);
    console.log('   Has Character Elements?', pageInfo.hasCharacterCards);
    console.log('   Has Create Button?', pageInfo.hasCreateButton);
    console.log('   Is Authenticated?', pageInfo.authStore?.state?.isAuthenticated);
    console.log('   Main Content Preview:', pageInfo.mainContent);

    console.log('\n5. Trying manual navigation to /characters again...');
    await page.goto('http://localhost:3000/characters', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const afterNav = await page.evaluate(() => ({
      url: window.location.href,
      hasLoginForm: !!document.querySelector('input[name="email"]'),
      isAuthenticated: JSON.parse(localStorage.getItem('auth-store') || '{}')?.state?.isAuthenticated
    }));

    console.log('   After manual navigation:');
    console.log('   URL:', afterNav.url);
    console.log('   Still showing login?', afterNav.hasLoginForm);
    console.log('   Still authenticated?', afterNav.isAuthenticated);

    // Try to check if ProtectedRoute is the issue
    console.log('\n6. Checking if we can call the API directly...');
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/characters', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        return {
          status: response.status,
          success: data.success,
          charactersCount: data.data?.characters?.length || 0,
          error: data.error
        };
      } catch (err) {
        return { error: err.message };
      }
    });

    console.log('   API Response:', apiTest);

    // Take a final screenshot
    await page.screenshot({ path: 'routing-debug.png', fullPage: true });
    console.log('\n7. Screenshot saved as routing-debug.png');

  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n\nTest complete. Browser will stay open for inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  await browser.close();
})();