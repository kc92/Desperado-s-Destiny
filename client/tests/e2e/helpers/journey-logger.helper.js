/**
 * Journey Logger Helper
 * Utilities for structured logging of E2E test player journeys
 * Captures steps, screenshots, and player state throughout test execution
 */

const fs = require('fs');
const path = require('path');

/**
 * Create a new journey log structure
 * @returns {Object} - Journey log object with timestamp, steps, screenshots, and playerData
 */
function createJourneyLog() {
  return {
    timestamp: new Date().toISOString(),
    steps: [],
    screenshots: [],
    playerData: {}
  };
}

/**
 * Log a test step with status and optional data
 * Automatically adds timestamp and logs to console
 *
 * @param {Object} journeyLog - The journey log object
 * @param {string} step - Name of the step (e.g., "Register New Account")
 * @param {string} status - Step status: "RUNNING" | "PASS" | "FAIL" | "SKIP"
 * @param {Object} [data={}] - Additional data to attach to this step
 * @returns {Object} - The step entry that was added
 */
function logStep(journeyLog, step, status, data = {}) {
  const entry = {
    step,
    status,
    timestamp: new Date().toISOString(),
    ...data
  };

  journeyLog.steps.push(entry);

  // Console output with color coding
  const statusSymbol = {
    'RUNNING': '🔄',
    'PASS': '✅',
    'FAIL': '❌',
    'SKIP': '⏭️'
  }[status] || '◼️';

  console.log(`${statusSymbol} [${status}] ${step}`);

  // Log additional data if provided
  if (Object.keys(data).length > 0) {
    console.log(`   Data:`, JSON.stringify(data, null, 2));
  }

  return entry;
}

/**
 * Add screenshot reference to journey log
 *
 * @param {Object} journeyLog - The journey log object
 * @param {string} stepName - Name/identifier of the step (e.g., "registration-page")
 * @param {string} filepath - Absolute path to screenshot file
 * @returns {Object} - The screenshot entry that was added
 */
function logScreenshot(journeyLog, stepName, filepath) {
  const entry = {
    step: stepName,
    path: filepath
  };

  journeyLog.screenshots.push(entry);
  console.log(`📸 Screenshot captured: ${stepName} -> ${path.basename(filepath)}`);

  return entry;
}

/**
 * Add or update player data in the journey log
 * Merges new data with existing playerData object
 *
 * @param {Object} journeyLog - The journey log object
 * @param {Object} data - Player data to add/update
 * @returns {Object} - The updated playerData object
 */
function updatePlayerData(journeyLog, data) {
  journeyLog.playerData = {
    ...journeyLog.playerData,
    ...data
  };

  return journeyLog.playerData;
}

/**
 * Save journey log to JSON file
 * Creates directory structure if it doesn't exist
 *
 * @param {Object} journeyLog - The journey log object to save
 * @param {string} testName - Name of the test (e.g., "new-player-journey")
 * @param {number|string} [timestamp] - Optional timestamp for filename (default: Date.now())
 * @returns {string} - Path to saved log file
 */
function saveJourneyLog(journeyLog, testName, timestamp = Date.now()) {
  // Ensure logs directory exists
  const logsDir = path.join(__dirname, '..', 'logs', 'player-journeys');

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Generate filename
  const filename = `${testName}-${timestamp}.json`;
  const filepath = path.join(logsDir, filename);

  // Write JSON file with pretty formatting
  fs.writeFileSync(filepath, JSON.stringify(journeyLog, null, 2), 'utf8');

  console.log(`\n📝 Journey log saved: ${filepath}`);
  console.log(`   Total steps: ${journeyLog.steps.length}`);
  console.log(`   Screenshots: ${journeyLog.screenshots.length}`);

  // Log summary of step statuses
  const statusCounts = journeyLog.steps.reduce((acc, step) => {
    acc[step.status] = (acc[step.status] || 0) + 1;
    return acc;
  }, {});

  console.log(`   Step results:`, statusCounts);

  return filepath;
}

/**
 * Get a summary of the journey log for quick analysis
 *
 * @param {Object} journeyLog - The journey log object
 * @returns {Object} - Summary statistics
 */
function getJourneySummary(journeyLog) {
  const totalSteps = journeyLog.steps.length;
  const statusCounts = journeyLog.steps.reduce((acc, step) => {
    acc[step.status] = (acc[step.status] || 0) + 1;
    return acc;
  }, {});

  const passed = statusCounts.PASS || 0;
  const failed = statusCounts.FAIL || 0;
  const skipped = statusCounts.SKIP || 0;
  const running = statusCounts.RUNNING || 0;

  const duration = totalSteps > 0
    ? new Date(journeyLog.steps[totalSteps - 1].timestamp) - new Date(journeyLog.steps[0].timestamp)
    : 0;

  return {
    totalSteps,
    passed,
    failed,
    skipped,
    running,
    successRate: totalSteps > 0 ? (passed / totalSteps * 100).toFixed(1) : 0,
    duration,
    durationSeconds: (duration / 1000).toFixed(1),
    screenshotCount: journeyLog.screenshots.length,
    startTime: journeyLog.timestamp,
    endTime: totalSteps > 0 ? journeyLog.steps[totalSteps - 1].timestamp : null
  };
}

/**
 * Print journey summary to console
 *
 * @param {Object} journeyLog - The journey log object
 */
function printJourneySummary(journeyLog) {
  const summary = getJourneySummary(journeyLog);

  console.log('\n' + '='.repeat(60));
  console.log('JOURNEY SUMMARY');
  console.log('='.repeat(60));
  console.log(`Start Time:       ${summary.startTime}`);
  console.log(`End Time:         ${summary.endTime || 'In Progress'}`);
  console.log(`Duration:         ${summary.durationSeconds}s`);
  console.log(`Total Steps:      ${summary.totalSteps}`);
  console.log(`✅ Passed:        ${summary.passed}`);
  console.log(`❌ Failed:        ${summary.failed}`);
  console.log(`⏭️  Skipped:       ${summary.skipped}`);
  console.log(`🔄 Running:       ${summary.running}`);
  console.log(`Success Rate:     ${summary.successRate}%`);
  console.log(`📸 Screenshots:   ${summary.screenshotCount}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Load a previously saved journey log
 *
 * @param {string} filepath - Path to journey log JSON file
 * @returns {Object|null} - Journey log object or null if file doesn't exist
 */
function loadJourneyLog(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      console.error(`Journey log not found: ${filepath}`);
      return null;
    }

    const content = fs.readFileSync(filepath, 'utf8');
    const journeyLog = JSON.parse(content);

    console.log(`📖 Journey log loaded: ${filepath}`);
    return journeyLog;
  } catch (error) {
    console.error(`Failed to load journey log: ${error.message}`);
    return null;
  }
}

/**
 * Get all journey logs for a specific test
 *
 * @param {string} testName - Name of the test (e.g., "new-player-journey")
 * @returns {Array<Object>} - Array of journey log metadata {filepath, timestamp, summary}
 */
function getTestJourneyLogs(testName) {
  const logsDir = path.join(__dirname, '..', 'logs', 'player-journeys');

  if (!fs.existsSync(logsDir)) {
    return [];
  }

  const files = fs.readdirSync(logsDir);
  const testLogs = files
    .filter(file => file.startsWith(testName) && file.endsWith('.json'))
    .map(file => {
      const filepath = path.join(logsDir, file);
      const journeyLog = loadJourneyLog(filepath);

      return {
        filepath,
        filename: file,
        timestamp: journeyLog ? journeyLog.timestamp : null,
        summary: journeyLog ? getJourneySummary(journeyLog) : null
      };
    })
    .filter(log => log.timestamp !== null)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Most recent first

  return testLogs;
}

/**
 * Clean up old journey logs
 *
 * @param {number} [olderThanDays=30] - Delete logs older than this many days
 * @returns {number} - Number of logs deleted
 */
function cleanupJourneyLogs(olderThanDays = 30) {
  const logsDir = path.join(__dirname, '..', 'logs', 'player-journeys');

  if (!fs.existsSync(logsDir)) {
    return 0;
  }

  const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
  const files = fs.readdirSync(logsDir);
  let deletedCount = 0;

  files.forEach(file => {
    const filepath = path.join(logsDir, file);
    const stats = fs.statSync(filepath);

    if (stats.mtimeMs < cutoffDate) {
      fs.unlinkSync(filepath);
      deletedCount++;
      console.log(`🗑️  Deleted old log: ${file}`);
    }
  });

  if (deletedCount > 0) {
    console.log(`\n🧹 Cleanup complete: ${deletedCount} old log(s) deleted`);
  }

  return deletedCount;
}

module.exports = {
  // Core functions
  createJourneyLog,
  logStep,
  logScreenshot,
  updatePlayerData,
  saveJourneyLog,

  // Analysis functions
  getJourneySummary,
  printJourneySummary,

  // Utility functions
  loadJourneyLog,
  getTestJourneyLogs,
  cleanupJourneyLogs
};
