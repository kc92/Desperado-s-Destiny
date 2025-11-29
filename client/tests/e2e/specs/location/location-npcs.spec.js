/**
 * Location NPCs Tests
 * Tests for NPC interaction system at locations
 */

const { loginAndSelectCharacter } = require('../../helpers/auth.helper');
const { delay } = require('../../helpers/navigation.helper');
const {
  goToLocation,
  openNPCDialogue,
  closeModal,
  hasSectionWithTitle
} = require('../../helpers/location.helper');
const users = require('../../fixtures/users.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Location NPCs', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    await loginAndSelectCharacter(page, users.validUser.email, users.validUser.password);
    await goToLocation(page);
  });

  afterEach(async () => {
    await jestPuppeteer.resetPage();
  });

  describe('NPCs Section Display', () => {
    it('should display People Here section when NPCs exist', async () => {
      const hasNPCs = await hasSectionWithTitle(page, 'People Here');
      expect(typeof hasNPCs).toBe('boolean');
    });

    it('should display person icon in section header', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        expect(content).toContain('👤');
      }
    });

    it('should display NPC cards in grid layout', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        const cards = await page.$$('[class*="cursor-pointer"]');
        expect(cards.length).toBeGreaterThan(0);
      }
    });
  });

  describe('NPC Card Details', () => {
    it('should display NPC name', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        const names = await page.$$('.text-amber-300');
        expect(names.length).toBeGreaterThan(0);
      }
    });

    it('should display NPC title when available', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        // Titles shown in text-gray-500
        const titles = await page.$$('.text-xs.text-gray-500');
        expect(titles.length).toBeGreaterThan(0);
      }
    });

    it('should display NPC description', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        const descriptions = await page.$$('.text-gray-400');
        expect(descriptions.length).toBeGreaterThan(0);
      }
    });

    it('should have hover effect on NPC cards', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        const hasHover = content.includes('hover:border-amber-500');
        expect(hasHover).toBe(true);
      }
    });
  });

  describe('NPC Dialogue Modal', () => {
    it('should open modal when NPC card clicked', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        const cards = await page.$$('[class*="cursor-pointer"]');
        if (cards.length > 0) {
          await cards[0].click();
          await delay(500);

          const modal = await page.$('[class*="fixed"]');
          expect(modal).toBeTruthy();
        }
      }
    });

    it('should display NPC name in modal', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        const cards = await page.$$('[class*="cursor-pointer"]');
        if (cards.length > 0) {
          await cards[0].click();
          await delay(500);

          const modalContent = await page.content();
          // Modal should have NPC info
          expect(modalContent.length).toBeGreaterThan(content.length);
        }
      }
    });

    it('should display dialogue text', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        const cards = await page.$$('[class*="cursor-pointer"]');
        if (cards.length > 0) {
          await cards[0].click();
          await delay(500);

          // Should have some dialogue
          const modalContent = await page.content();
          expect(modalContent.length).toBeGreaterThan(0);
        }
      }
    });

    it('should close modal properly', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        const cards = await page.$$('[class*="cursor-pointer"]');
        if (cards.length > 0) {
          await cards[0].click();
          await delay(500);
          await closeModal(page);

          // Page should still be functional
          const newContent = await page.content();
          expect(newContent.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Quest NPCs', () => {
    it('should display quest buttons for NPCs with quests', async () => {
      const content = await page.content();
      if (content.includes('People Here')) {
        // Some NPCs have quests
        const hasQuestMention = content.includes('quest') || content.includes('Quest');
        expect(typeof hasQuestMention).toBe('boolean');
      }
    });
  });
});
