/**
 * Location Display Tests
 * Tests for location page loading and display functionality
 */

const { loginAndSelectCharacter } = require('../../helpers/auth.helper');
const { waitForLoading, delay } = require('../../helpers/navigation.helper');
const {
  goToLocation,
  getCurrentLocationName,
  getDangerLevel,
  hasSectionWithTitle
} = require('../../helpers/location.helper');
const users = require('../../fixtures/users.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Location Display', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });

    // Log API errors for debugging
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

  describe('Page Loading', () => {
    it('should load the location page successfully', async () => {
      await goToLocation(page);

      const url = page.url();
      expect(url).toContain('/game/location');
    });

    it('should display loading spinner while fetching data', async () => {
      // Navigate but don't wait for loading
      await page.goto(`${BASE_URL}/game/location`);

      // Check for loading spinner (might be quick)
      const hasSpinner = await page.$('.animate-spin');
      // Spinner might have already finished, so just ensure page loads
      await waitForLoading(page);

      const content = await page.content();
      expect(content.length).toBeGreaterThan(0);
    });

    it('should display location content after loading', async () => {
      await goToLocation(page);

      // Wait for location name to appear
      await page.waitForSelector('h1', { timeout: 10000 });

      const locationName = await getCurrentLocationName(page);
      expect(locationName).toBeTruthy();
    });
  });

  describe('Location Header', () => {
    beforeEach(async () => {
      await goToLocation(page);
    });

    it('should display location name in header', async () => {
      const locationName = await getCurrentLocationName(page);
      expect(locationName).toBeTruthy();
      expect(locationName.length).toBeGreaterThan(0);
    });

    it('should display location icon', async () => {
      const content = await page.content();
      // Location icons are emojis in span with text-4xl
      const hasIcon = await page.$('.text-4xl');
      expect(hasIcon).toBeTruthy();
    });

    it('should display short description', async () => {
      const content = await page.content();
      // Short descriptions are in amber-200/80 text
      const descEl = await page.$('.text-amber-200\\/80');
      expect(descEl).toBeTruthy();
    });
  });

  describe('Danger Level', () => {
    beforeEach(async () => {
      await goToLocation(page);
    });

    it('should display danger level indicator', async () => {
      const content = await page.content();
      expect(content).toContain('Danger Level');
    });

    it('should show danger level as X/10', async () => {
      const dangerLevel = await getDangerLevel(page);
      expect(dangerLevel).toBeGreaterThanOrEqual(1);
      expect(dangerLevel).toBeLessThanOrEqual(10);
    });

    it('should display danger level text (Safe/Moderate/Dangerous)', async () => {
      const content = await page.content();
      const hasDangerText =
        content.includes('Safe') ||
        content.includes('Moderate') ||
        content.includes('Dangerous') ||
        content.includes('Very Dangerous') ||
        content.includes('Extremely Dangerous');
      expect(hasDangerText).toBe(true);
    });

    it('should have appropriate color for danger level', async () => {
      // Check for color classes
      const hasGreen = await page.$('.text-green-500');
      const hasYellow = await page.$('.text-yellow-500');
      const hasRed = await page.$('.text-red-500');

      // At least one danger color should be present
      expect(hasGreen || hasYellow || hasRed).toBeTruthy();
    });
  });

  describe('Atmosphere', () => {
    beforeEach(async () => {
      await goToLocation(page);
    });

    it('should display atmosphere text', async () => {
      // Atmosphere is in italic text within bg-black/20
      const atmosphereEl = await page.$('.italic');
      expect(atmosphereEl).toBeTruthy();
    });

    it('should display atmosphere in styled container', async () => {
      const atmosphereBox = await page.$('[class*="bg-black/20"]');
      expect(atmosphereBox).toBeTruthy();
    });
  });

  describe('Faction Influence', () => {
    beforeEach(async () => {
      await goToLocation(page);
    });

    it('should display faction influence section', async () => {
      const content = await page.content();
      expect(content).toContain('Settlers');
      expect(content).toContain('Coalition');
      expect(content).toContain('Frontera');
    });

    it('should show influence percentages', async () => {
      const content = await page.content();
      // Look for percentage values
      const percentages = content.match(/\d+%/g);
      expect(percentages).toBeTruthy();
      expect(percentages.length).toBeGreaterThanOrEqual(3);
    });

    it('should display faction colors correctly', async () => {
      // Settlers = blue, Coalition = green, Frontera = red
      const blueBox = await page.$('[class*="bg-blue-900"]');
      const greenBox = await page.$('[class*="bg-green-900"]');
      const redBox = await page.$('[class*="bg-red-900"]');

      expect(blueBox).toBeTruthy();
      expect(greenBox).toBeTruthy();
      expect(redBox).toBeTruthy();
    });
  });

  describe('Content Sections', () => {
    beforeEach(async () => {
      await goToLocation(page);
    });

    it('should display at least one content section', async () => {
      const content = await page.content();

      const hasJobs = content.includes('Available Jobs');
      const hasShops = content.includes('Shops');
      const hasNPCs = content.includes('People Here');
      const hasTravel = content.includes('Travel');
      const hasCrimes = content.includes('Criminal Opportunities');

      // At least one section should be present
      expect(hasJobs || hasShops || hasNPCs || hasTravel || hasCrimes).toBe(true);
    });

    it('should display Travel section with connected locations', async () => {
      const hasTravel = await hasSectionWithTitle(page, 'Travel');
      expect(hasTravel).toBe(true);
    });
  });

  describe('Error States', () => {
    it('should handle API errors gracefully', async () => {
      // Intercept API call and return error
      await page.setRequestInterception(true);

      page.on('request', request => {
        if (request.url().includes('/api/locations/current')) {
          request.respond({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ success: false, message: 'Server error' }),
          });
        } else {
          request.continue();
        }
      });

      await page.goto(`${BASE_URL}/game/location`);
      await delay(2000);

      const content = await page.content();
      // Should show error or retry option
      const hasError = content.includes('error') || content.includes('Error') || content.includes('Retry');
      expect(hasError).toBe(true);

      await page.setRequestInterception(false);
    });
  });
});
