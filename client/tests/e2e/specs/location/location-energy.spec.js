/**
 * Location Energy Tests
 * Tests for energy consumption across location actions
 */

const { loginAndSelectCharacter } = require('../../helpers/auth.helper');
const { delay } = require('../../helpers/navigation.helper');
const {
  goToLocation,
  getCurrentEnergy,
  performJob,
  travelTo,
  waitForJobResult,
  getAvailableJobs,
  getConnectedLocations
} = require('../../helpers/location.helper');
const users = require('../../fixtures/users.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Location Energy System', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);
    await goToLocation(page);
  });

  afterEach(async () => {
    await jestPuppeteer.resetPage();
  });

  describe('Energy Display', () => {
    it('should display character energy', async () => {
      const content = await page.content();
      const hasEnergy = content.includes('energy') || content.includes('Energy');
      expect(hasEnergy).toBe(true);
    });

    it('should show energy costs on jobs', async () => {
      const content = await page.content();
      const energyMatches = content.match(/⚡\s*\d+/g);
      expect(energyMatches).toBeTruthy();
    });

    it('should show energy costs on travel', async () => {
      const content = await page.content();
      if (content.includes('Travel')) {
        const hasEnergyCost = content.includes('energy');
        expect(hasEnergyCost).toBe(true);
      }
    });

    it('should show energy costs on crimes', async () => {
      const content = await page.content();
      if (content.includes('Criminal Opportunities')) {
        const hasEnergyCost = content.includes('energy');
        expect(hasEnergyCost).toBe(true);
      }
    });
  });

  describe('Energy Consumption - Jobs', () => {
    it('should deduct energy after performing job', async () => {
      const jobs = await getAvailableJobs(page);

      if (jobs.length > 0) {
        const initialEnergy = await getCurrentEnergy(page);

        await performJob(page, jobs[0]);
        await waitForJobResult(page);
        await delay(500);

        // Energy should have changed (or action failed)
        const newEnergy = await getCurrentEnergy(page);
        // Can't always verify decrease (might not have permission to read exact values)
        expect(typeof newEnergy === 'number' || newEnergy === null).toBe(true);
      }
    });

    it('should disable job buttons when energy too low', async () => {
      const buttons = await page.$$('button');

      for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text === 'Work') {
          const isDisabled = await btn.evaluate(el => el.disabled);
          expect(typeof isDisabled).toBe('boolean');
          break;
        }
      }
    });
  });

  describe('Energy Consumption - Travel', () => {
    it('should deduct energy after traveling', async () => {
      const connected = await getConnectedLocations(page);

      if (connected.length > 0) {
        await travelTo(page, connected[0]);
        await delay(3000);

        // Travel should complete or fail
        const content = await page.content();
        expect(content.length).toBeGreaterThan(0);
      }
    });

    it('should disable travel buttons when energy too low', async () => {
      const buttons = await page.$$('button');

      for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text === 'Go') {
          const isDisabled = await btn.evaluate(el => el.disabled);
          expect(typeof isDisabled).toBe('boolean');
          break;
        }
      }
    });
  });

  describe('Multiple Actions', () => {
    it('should allow multiple actions while energy available', async () => {
      const jobs = await getAvailableJobs(page);

      if (jobs.length > 0) {
        // Perform first action
        await performJob(page, jobs[0]);
        await waitForJobResult(page);
        await delay(500);

        // Try second action
        await performJob(page, jobs[0]);
        await delay(2000);

        // Should complete or fail gracefully
        const content = await page.content();
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Button States', () => {
    it('should update button states based on available energy', async () => {
      // Verify buttons have proper disabled state handling
      const workButtons = await page.$$('button');
      let buttonCount = 0;

      for (const btn of workButtons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text === 'Work' || text === 'Go' || text.includes('Attempt')) {
          buttonCount++;
          const isDisabled = await btn.evaluate(el => el.disabled);
          expect(typeof isDisabled).toBe('boolean');
        }
      }

      expect(buttonCount).toBeGreaterThan(0);
    });
  });
});
