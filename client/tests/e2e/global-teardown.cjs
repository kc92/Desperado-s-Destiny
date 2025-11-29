/**
 * Global Teardown for E2E Tests
 * Runs once after all tests
 */

module.exports = async () => {
  console.log('Cleaning up E2E test suite...');

  if (global.__BROWSER__) {
    await global.__BROWSER__.close();
  }
};
