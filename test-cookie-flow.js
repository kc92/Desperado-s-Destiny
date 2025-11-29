// Test to debug cookie flow
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable request interception to see cookies
  await page.setRequestInterception(true);

  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('REQUEST:', request.method(), request.url());
      console.log('Cookie header:', request.headers()['cookie'] || 'No cookies');
    }
    request.continue();
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      const setCookie = response.headers()['set-cookie'];
      if (setCookie) {
        console.log('RESPONSE SET-COOKIE:', setCookie);
      }
    }
  });

  try {
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

    console.log('2. Logging in...');
    await page.type('input[name="email"]', 'test@desperados.com');
    await page.type('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    console.log('3. Waiting for response...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check cookies in the browser
    const cookies = await page.cookies();
    console.log('\n4. Browser cookies:');
    cookies.forEach(cookie => {
      console.log(`  ${cookie.name}: ${cookie.value.substring(0, 30)}... (domain: ${cookie.domain}, path: ${cookie.path})`);
    });

    // Try to manually navigate to /characters
    console.log('\n5. Navigating to /characters...');
    await page.goto('http://localhost:3000/characters', { waitUntil: 'networkidle2' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if we can access protected endpoint
    console.log('\n6. Testing protected API endpoint directly...');
    const meResponse = await page.evaluate(async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return {
        status: response.status,
        ok: response.ok,
        data: await response.text()
      };
    });

    console.log('  /auth/me response:', meResponse);

    // Check localStorage
    const localStorage = await page.evaluate(() => {
      const authStore = window.localStorage.getItem('auth-store');
      return authStore ? JSON.parse(authStore) : null;
    });

    console.log('\n7. Auth store in localStorage:', localStorage?.state?.isAuthenticated ? 'Authenticated' : 'Not authenticated');

  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n\nTest complete. Browser will stay open for inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  await browser.close();
})();