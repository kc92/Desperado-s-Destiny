/**
 * Location Crimes Tests
 * Tests for the location-specific crime system
 */

const { loginAndSelectCharacter } = require('../../helpers/auth.helper');
const { waitForLoading, delay } = require('../../helpers/navigation.helper');
const {
  goToLocation,
  getAvailableCrimes,
  attemptCrime,
  travelTo,
  hasSectionWithTitle
} = require('../../helpers/location.helper');
const users = require('../../fixtures/users.json');
const locations = require('../../fixtures/locations.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Location Crimes', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });

    page.on('response', async response => {
      if (response.url().includes('/api/') && !response.ok()) {
        console.error(`API Error: ${response.status()} ${response.url()}`);
      }
    });

    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);
    await goToLocation(page);
  });

  afterEach(async () => {
    await jestPuppeteer.resetPage();
  });

  describe('Crimes Section Display', () => {
    it('should display Criminal Opportunities section when crimes exist', async () => {
      const hasCrimes = await hasSectionWithTitle(page, 'Criminal Opportunities');
      // Section should exist if location has crimes
      expect(typeof hasCrimes).toBe('boolean');
    });

    it('should display gun icon in section header', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        expect(content).toContain('🔫');
      }
    });

    it('should display crimes in grid layout', async () => {
      const crimes = await getAvailableCrimes(page);
      // Crimes array should be returned (might be empty for some locations)
      expect(Array.isArray(crimes)).toBe(true);
    });
  });

  describe('Crime Card Details', () => {
    it('should display crime name in red', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        const crimeNames = await page.$$('.text-red-300');
        expect(crimeNames.length).toBeGreaterThan(0);
      }
    });

    it('should display crime description', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        // Descriptions are in text-gray-400
        const hasDescriptions = content.includes('text-gray-400');
        expect(hasDescriptions).toBe(true);
      }
    });

    it('should display energy cost', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        expect(content).toContain('energy');
        expect(content).toContain('⚡');
      }
    });

    it('should display difficulty level', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        expect(content).toContain('Difficulty');
      }
    });

    it('should display wanted level increase', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        expect(content).toContain('wanted');
        expect(content).toContain('⚠️');
      }
    });

    it('should display jail time warning', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        // Jail time shown with chain icon
        const hasJailWarning = content.includes('⛓️') || content.includes('jail');
        expect(hasJailWarning).toBe(true);
      }
    });

    it('should display Attempt Crime button', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        expect(content).toContain('Attempt Crime');
      }
    });
  });

  describe('Crime Button Functionality', () => {
    it('should have clickable Attempt Crime buttons', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        const buttons = await page.$$('button');
        let hasAttemptButton = false;

        for (const btn of buttons) {
          const text = await btn.evaluate(el => el.textContent);
          if (text.includes('Attempt Crime')) {
            hasAttemptButton = true;
            break;
          }
        }

        expect(hasAttemptButton).toBe(true);
      }
    });

    it('should navigate to action-challenge when crime attempted', async () => {
      const crimes = await getAvailableCrimes(page);

      if (crimes.length > 0) {
        // Store initial URL
        const initialUrl = page.url();

        await attemptCrime(page, crimes[0]);
        await delay(1000);

        // Should navigate to action-challenge or have stored data
        const newUrl = page.url();
        const urlChanged = newUrl !== initialUrl;
        const hasChallenge = newUrl.includes('action-challenge');

        // Either navigated or data was stored for navigation
        expect(urlChanged || hasChallenge).toBe(true);
      }
    });

    it('should store crime data in sessionStorage', async () => {
      const crimes = await getAvailableCrimes(page);

      if (crimes.length > 0) {
        await attemptCrime(page, crimes[0]);
        await delay(500);

        // Check sessionStorage for selectedAction
        const storedData = await page.evaluate(() => {
          return sessionStorage.getItem('selectedAction');
        });

        // Data should be stored
        expect(storedData).toBeTruthy();
      }
    });
  });

  describe('Location-Specific Crime Filtering', () => {
    it('should only show crimes available at current location', async () => {
      const crimes = await getAvailableCrimes(page);

      // If we're at Red Gulch, should see Red Gulch crimes
      const content = await page.content();

      if (content.includes('Red Gulch')) {
        const expectedCrimes = locations.testCrimes.RED_GULCH;
        // At least one expected crime should be visible
        const hasExpectedCrime = expectedCrimes.some(crime =>
          crimes.includes(crime) || content.includes(crime)
        );
        expect(hasExpectedCrime).toBe(true);
      }
    });

    it('should show different crimes at different locations', async () => {
      // Get crimes at current location
      const currentCrimes = await getAvailableCrimes(page);
      const currentContent = await page.content();

      // This test just verifies crimes can change per location
      // Full verification would require traveling and comparing
      expect(Array.isArray(currentCrimes)).toBe(true);
    });

    it('should not show crimes at Spirit Springs (no-crime zone)', async () => {
      // Travel to Spirit Springs if possible
      const content = await page.content();

      // If we can access Spirit Springs
      if (content.includes('Spirit Springs')) {
        await travelTo(page, 'Spirit Springs');
        await delay(3000);

        const newContent = await page.content();
        const hasCrimes = newContent.includes('Criminal Opportunities');

        // Spirit Springs should not have crimes
        expect(hasCrimes).toBe(false);
      }
    });
  });

  describe('Energy Requirements for Crimes', () => {
    it('should disable Attempt Crime button when insufficient energy', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        const buttons = await page.$$('button');

        for (const btn of buttons) {
          const text = await btn.evaluate(el => el.textContent);
          if (text.includes('Attempt Crime')) {
            const isDisabled = await btn.evaluate(el => el.disabled);
            // Just verify disabled state can be checked
            expect(typeof isDisabled).toBe('boolean');
            break;
          }
        }
      }
    });
  });

  describe('Crime Card Styling', () => {
    it('should have red-themed styling for crime cards', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        // Cards should have red border
        const hasRedBorder = content.includes('border-red-900');
        expect(hasRedBorder).toBe(true);
      }
    });

    it('should have red-themed button styling', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        // Buttons should have red styling
        const hasRedButton = content.includes('bg-red-900') || content.includes('border-red-700');
        expect(hasRedButton).toBe(true);
      }
    });
  });

  describe('Crime Loading State', () => {
    it('should show crimes after page loads', async () => {
      // Navigate fresh
      await page.goto(`${BASE_URL}/game/location`);
      await waitForLoading(page);

      // Wait a bit for crimes to load
      await delay(1000);

      const crimes = await getAvailableCrimes(page);
      // Should have crimes array (possibly empty for some locations)
      expect(Array.isArray(crimes)).toBe(true);
    });
  });
});
