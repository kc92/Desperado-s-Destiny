// client/tests/playtests/autonomous/jest.config.js
module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/run*.ts'],
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  testTimeout: 3600000, // 1 hour
};
