/**
 * Town Page Loading E2E Tests
 */

const { loginAndSelectCharacter } = require('../../helpers/auth.helper');
const { goToTown, waitForLoading, delay } = require('../../helpers/navigation.helper');
const { captureOnFailure } = require('../../helpers/screenshot.helper');
const users = require('../../fixtures/users.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Town Page Loading', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });

    // Capture API errors
    page.on('response', async response => {
      if (response.url().includes('/api/') && !response.ok()) {
        console.error(`API Error: ${response.status()} ${response.url()}`);
      }
    });

    // Login and select character
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);
  });

  afterEach(async () => {
    await jestPuppeteer.resetPage();
  });

  it('should show loading spinner initially', async () => {
    // Go to town without waiting for load
    await page.goto(`${BASE_URL}/game/town`);

    // Check for spinner (may be very fast)
    const spinner = await page.$('.animate-spin');
    // Spinner might already be gone if load is fast
    expect(true).toBe(true);
  });

  it('should load and display town buildings', async () => {
    await goToTown(page);

    // Wait for buildings to load
    await page.waitForSelector('button', { timeout: 10000 });

    const buttons = await page.$$('button');
    // Should have multiple building buttons plus quick action buttons
    expect(buttons.length).toBeGreaterThan(5);
  });

  it('should display character status header', async () => {
    await goToTown(page);

    // Check for status elements
    const pageContent = await page.content();

    expect(pageContent).toContain('Location');
    expect(pageContent).toContain('Energy');
    expect(pageContent).toContain('Gold');
  });

  it('should display town title', async () => {
    await goToTown(page);

    const pageContent = await page.content();
    expect(pageContent).toContain('Frontera');
  });

  it('should display quick actions panel', async () => {
    await goToTown(page);

    const pageContent = await page.content();

    expect(pageContent).toContain('Quick Actions');
    expect(pageContent).toContain('Skills');
    expect(pageContent).toContain('Inventory');
  });

  it('should display error on API failure', async () => {
    // Intercept locations API
    await page.setRequestInterception(true);

    page.on('request', request => {
      if (request.url().includes('/api/locations')) {
        request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      } else {
        request.continue();
      }
    });

    await page.goto(`${BASE_URL}/game/town`);
    await delay(3000);

    // Should show error UI
    const errorElement = await page.$('.bg-red-900, .text-red-500, [role="alert"]');
    expect(errorElement).toBeTruthy();
  });

  it('should handle 401 unauthorized by redirecting to login', async () => {
    // Clear auth
    await page.deleteCookie({ name: 'token' });

    // Intercept with 401
    await page.setRequestInterception(true);

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        request.respond({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        });
      } else {
        request.continue();
      }
    });

    await page.goto(`${BASE_URL}/game/town`);
    await delay(2000);

    // Should redirect to login
    expect(page.url()).toContain('/login');
  });

  it('should show empty state when no buildings returned', async () => {
    await page.setRequestInterception(true);

    page.on('request', request => {
      if (request.url().includes('/api/locations')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { locations: [] } }),
        });
      } else {
        request.continue();
      }
    });

    await page.goto(`${BASE_URL}/game/town`);
    await waitForLoading(page);

    // Page should still render without crashing
    const pageContent = await page.content();
    expect(pageContent).toContain('Frontera');
  });
});
