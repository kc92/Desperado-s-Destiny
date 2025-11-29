/**
 * Jest E2E Setup
 * Runs before each test file
 */

jest.setTimeout(30000);

// Add custom matchers
expect.extend({
  async toHaveText(element, expectedText) {
    const text = await element.evaluate(el => el.textContent);
    const pass = text.includes(expectedText);
    return {
      pass,
      message: () => `Expected element to ${pass ? 'not ' : ''}have text "${expectedText}", got "${text}"`,
    };
  },
});
