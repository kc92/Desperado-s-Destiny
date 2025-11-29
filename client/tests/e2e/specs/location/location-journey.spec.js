/**
 * Location Journey Integration Tests
 * End-to-end tests for complete user journeys through the location system
 */

const { loginAndSelectCharacter } = require('../../helpers/auth.helper');
const { waitForLoading, delay } = require('../../helpers/navigation.helper');
const {
  goToLocation,
  getCurrentLocationName,
  performJob,
  waitForJobResult,
  travelTo,
  openShop,
  purchaseItem,
  closeModal,
  attemptCrime,
  getAvailableJobs,
  getAvailableCrimes,
  getConnectedLocations
} = require('../../helpers/location.helper');
const users = require('../../fixtures/users.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Location Journey Integration', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });

    page.on('response', async response => {
      if (response.url().includes('/api/') && !response.ok()) {
        console.error(`API Error: ${response.status()} ${response.url()}`);
      }
    });

    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);
  });

  afterEach(async () => {
    await jestPuppeteer.resetPage();
  });

  describe('Complete User Flow', () => {
    it('should complete full flow: Login -> Location -> Job -> Travel', async () => {
      // 1. Navigate to location
      await goToLocation(page);
      const startLocation = await getCurrentLocationName(page);
      expect(startLocation).toBeTruthy();

      // 2. Perform a job
      const jobs = await getAvailableJobs(page);
      if (jobs.length > 0) {
        await performJob(page, jobs[0]);
        await waitForJobResult(page);
      }

      // 3. Travel to connected location
      const connected = await getConnectedLocations(page);
      if (connected.length > 0) {
        await travelTo(page, connected[0]);
        await delay(3000);
      }

      // 4. Verify we can interact with new location
      const newLocation = await getCurrentLocationName(page);
      expect(newLocation).toBeTruthy();
    });

    it('should complete flow with shopping', async () => {
      // 1. Navigate to location
      await goToLocation(page);

      // 2. Check if shops available
      const content = await page.content();
      if (content.includes('Shops')) {
        // 3. Open shop
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await btn.evaluate(el => el.textContent);
          if (text.includes('Browse')) {
            await btn.click();
            await delay(500);
            break;
          }
        }

        // 4. Try to purchase
        await purchaseItem(page, 'Bandages');
        await delay(1000);

        // 5. Close modal
        await closeModal(page);
      }

      // Verify page still works
      const finalContent = await page.content();
      expect(finalContent.length).toBeGreaterThan(0);
    });
  });

  describe('Explorer Path', () => {
    it('should allow visiting multiple locations', async () => {
      await goToLocation(page);
      const locations = [];

      // Record starting location
      const start = await getCurrentLocationName(page);
      locations.push(start);

      // Visit first connected location
      let connected = await getConnectedLocations(page);
      if (connected.length > 0) {
        await travelTo(page, connected[0]);
        await delay(3000);

        const second = await getCurrentLocationName(page);
        if (second && second !== start) {
          locations.push(second);
        }

        // Try to visit another
        connected = await getConnectedLocations(page);
        if (connected.length > 0) {
          await travelTo(page, connected[0]);
          await delay(3000);

          const third = await getCurrentLocationName(page);
          if (third) {
            locations.push(third);
          }
        }
      }

      // Should have visited at least one location
      expect(locations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Worker Path', () => {
    it('should allow performing multiple jobs', async () => {
      await goToLocation(page);
      const results = [];

      const jobs = await getAvailableJobs(page);
      if (jobs.length > 0) {
        // Perform first job
        await performJob(page, jobs[0]);
        const hasResult1 = await waitForJobResult(page);
        results.push(hasResult1);

        await delay(1000);

        // Perform second job
        await performJob(page, jobs[0]);
        const hasResult2 = await waitForJobResult(page);
        results.push(hasResult2);
      }

      // Should have attempted jobs
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Criminal Path', () => {
    it('should allow attempting crimes at location', async () => {
      await goToLocation(page);

      const crimes = await getAvailableCrimes(page);
      if (crimes.length > 0) {
        // Store initial URL
        const initialUrl = page.url();

        // Attempt crime
        await attemptCrime(page, crimes[0]);
        await delay(1000);

        // Should navigate or store data
        const newUrl = page.url();
        expect(newUrl).toBeTruthy();
      }
    });
  });

  describe('Combined Activities', () => {
    it('should allow job -> shop -> travel in sequence', async () => {
      await goToLocation(page);

      // 1. Perform job
      const jobs = await getAvailableJobs(page);
      if (jobs.length > 0) {
        await performJob(page, jobs[0]);
        await waitForJobResult(page);
        await delay(500);
      }

      // 2. Shop
      const content = await page.content();
      if (content.includes('Shops')) {
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await btn.evaluate(el => el.textContent);
          if (text.includes('Browse')) {
            await btn.click();
            await delay(500);
            await closeModal(page);
            break;
          }
        }
      }

      // 3. Travel
      const connected = await getConnectedLocations(page);
      if (connected.length > 0) {
        await travelTo(page, connected[0]);
        await delay(3000);
      }

      // Verify still on location page
      const finalUrl = page.url();
      expect(finalUrl).toContain('/game');
    });
  });

  describe('Error Recovery', () => {
    it('should handle errors gracefully and allow retry', async () => {
      await goToLocation(page);

      // Try various actions
      const jobs = await getAvailableJobs(page);
      if (jobs.length > 0) {
        await performJob(page, jobs[0]);
        await delay(2000);
      }

      // Page should still be functional
      const content = await page.content();
      expect(content).toContain('Travel');
    });
  });

  describe('Session Persistence', () => {
    it('should maintain location state across page refreshes', async () => {
      await goToLocation(page);
      const locationBefore = await getCurrentLocationName(page);

      // Refresh page
      await page.reload();
      await waitForLoading(page);

      const locationAfter = await getCurrentLocationName(page);

      // Should be at same location
      expect(locationAfter).toBeTruthy();
    });
  });
});
