const puppeteer = require('puppeteer');

async function detailedLoginTest() {
  console.log('🔍 DETAILED LOGIN TEST - Full auth state tracking\n');

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // Capture ALL console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log(`[CONSOLE]:`, text);
  });

  try {
    console.log('Step 1: Load app and wait for hydration\n');
    await page.goto('http://localhost:3006', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    console.log('\nStep 2: Navigate to login\n');
    await page.click('a[href="/login"]');
    await page.waitForSelector('input[type="email"]');
    await new Promise(r => setTimeout(r, 500));

    console.log('\nStep 3: Fill login form\n');
    await page.type('input[type="email"]', 'test@test.com');
    await page.type('input[type="password"]', 'Test123!');
    await new Promise(r => setTimeout(r, 500));

    console.log('\nStep 4: Get auth state BEFORE login\n');
    const stateBefore = await page.evaluate(() => {
      const store = window.useAuthStore?.getState?.();
      return {
        isAuthenticated: store?.isAuthenticated,
        user: store?.user?.email,
        _hasHydrated: store?._hasHydrated
      };
    });
    console.log('Auth state BEFORE login:', stateBefore);

    console.log('\nStep 5: Submit login and track state changes\n');
    await page.click('button[type="submit"]');

    // Wait 2 seconds and check state multiple times
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 200));
      const state = await page.evaluate(() => {
        const store = window.useAuthStore?.getState?.();
        return {
          url: window.location.href,
          isAuthenticated: store?.isAuthenticated,
          user: store?.user?.email,
          _hasHydrated: store?._hasHydrated,
          isLoading: store?.isLoading
        };
      });
      console.log(`T+${i * 200}ms:`, JSON.stringify(state));
    }

    console.log('\nStep 6: Check cookies\n');
    const cookies = await page.cookies();
    console.log('Cookies:', cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...', sameSite: c.sameSite })));

    console.log('\nStep 7: Final state\n');
    const finalState = await page.evaluate(() => {
      const store = window.useAuthStore?.getState?.();
      return {
        url: window.location.href,
        isAuthenticated: store?.isAuthenticated,
        user: store?.user,
        _hasHydrated: store?._hasHydrated,
        isLoading: store?.isLoading,
        error: store?.error,
        localStorage: localStorage.getItem('auth-store')
      };
    });
    console.log('Final state:', JSON.stringify(finalState, null, 2));

    console.log('\nStep 8: Try to navigate to /characters manually\n');
    await page.goto('http://localhost:3006/characters', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    const afterManualNav = await page.evaluate(() => ({
      url: window.location.href,
      isAuthenticated: window.useAuthStore?.getState?.().isAuthenticated
    }));
    console.log('After manual navigation:', afterManualNav);

    console.log('\n✅ Test complete. Browser will stay open for 30 seconds.\n');
    await new Promise(r => setTimeout(r, 30000));

  } catch (error) {
    console.error('💥 ERROR:', error.message);
  } finally {
    await browser.close();
  }
}

detailedLoginTest().catch(console.error);
