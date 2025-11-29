/**
 * Jest E2E Configuration
 * For Puppeteer-based end-to-end tests
 */

module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['<rootDir>/tests/e2e/specs/**/*.spec.js'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.cjs'],
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './tests/e2e/reports',
      filename: 'e2e-report.html',
      openReport: false,
    }],
  ],
};
