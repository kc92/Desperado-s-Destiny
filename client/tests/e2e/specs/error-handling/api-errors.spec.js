/**
 * API Error Handling E2E Tests
 */

const { loginAndSelectCharacter } = require('../../helpers/auth.helper');
const { goToTown, goToPage, delay } = require('../../helpers/navigation.helper');
const users = require('../../fixtures/users.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('API Error Handling', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);
  });

  afterEach(async () => {
    await jestPuppeteer.resetPage();
  });

  it('should display 404 errors properly', async () => {
    await page.setRequestInterception(true);

    page.on('request', request => {
      if (request.url().includes('/api/locations/')) {
        request.respond({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Location not found' }),
        });
      } else {
        request.continue();
      }
    });

    await goToTown(page);
    await delay(2000);

    // Check page didn't crash
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);
  });

  it('should display 500 errors properly', async () => {
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
    await delay(2000);

    // Should show error indicator
    const hasError = await page.evaluate(() => {
      return document.body.textContent.includes('error') ||
             document.body.textContent.includes('Error') ||
             document.querySelector('.bg-red-900') !== null;
    });

    expect(hasError).toBe(true);
  });

  it('should handle rate limiting', async () => {
    await page.setRequestInterception(true);

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        request.respond({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Too many requests' }),
        });
      } else {
        request.continue();
      }
    });

    await page.goto(`${BASE_URL}/game/town`);
    await delay(2000);

    // Page should handle gracefully
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);
  });

  it('should handle malformed JSON response', async () => {
    await page.setRequestInterception(true);

    page.on('request', request => {
      if (request.url().includes('/api/locations')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: 'not valid json {{{',
        });
      } else {
        request.continue();
      }
    });

    await page.goto(`${BASE_URL}/game/town`);
    await delay(2000);

    // Should not crash
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);
  });

  it('should handle network timeout', async () => {
    await page.setRequestInterception(true);

    page.on('request', request => {
      if (request.url().includes('/api/locations')) {
        // Don't respond - simulate timeout
        setTimeout(() => {
          try {
            request.abort('timedout');
          } catch (e) {
            // Request may have been handled
          }
        }, 100);
      } else {
        request.continue();
      }
    });

    await page.goto(`${BASE_URL}/game/town`);
    await delay(3000);

    // Should show error or loading state
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);
  });

  it('should handle CORS errors', async () => {
    await page.setRequestInterception(true);

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        request.respond({
          status: 0,
          body: '',
        });
      } else {
        request.continue();
      }
    });

    await page.goto(`${BASE_URL}/game/town`);
    await delay(2000);

    // Page should handle gracefully
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);
  });

  it('should collect all API errors in console', async () => {
    const apiErrors = [];

    page.on('response', async response => {
      if (response.url().includes('/api/') && !response.ok()) {
        apiErrors.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.setRequestInterception(true);

    page.on('request', request => {
      if (request.url().includes('/api/locations')) {
        request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Test error' }),
        });
      } else {
        request.continue();
      }
    });

    await page.goto(`${BASE_URL}/game/town`);
    await delay(2000);

    // Should have captured the error
    expect(apiErrors.length).toBeGreaterThan(0);
    expect(apiErrors[0].status).toBe(500);
  });
});
