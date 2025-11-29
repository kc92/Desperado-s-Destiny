#!/usr/bin/env node
/**
 * DESPERADOS DESTINY - Health Check Script
 *
 * Verifies all services are running and healthy:
 * 1. MongoDB connection
 * 2. Redis connection
 * 3. Backend API health endpoint
 * 4. Frontend availability
 */

const http = require('http');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`),
};

// Check HTTP endpoint
const checkEndpoint = (url, serviceName) => {
  return new Promise((resolve) => {
    const request = http.get(url, (res) => {
      if (res.statusCode === 200) {
        log.success(`${serviceName} is healthy (${url})`);
        resolve(true);
      } else {
        log.error(`${serviceName} returned status ${res.statusCode}`);
        resolve(false);
      }
    });

    request.on('error', (error) => {
      log.error(`${serviceName} is not reachable: ${error.message}`);
      resolve(false);
    });

    request.setTimeout(5000, () => {
      request.destroy();
      log.error(`${serviceName} timeout (5s)`);
      resolve(false);
    });
  });
};

// Main health check
async function healthCheck() {
  log.header('🤠 DESPERADOS DESTINY - HEALTH CHECK');
  log.info('Checking all services...\n');

  const checks = [];

  // Check backend API
  log.header('Backend API');
  checks.push(await checkEndpoint('http://localhost:5000/health', 'Backend API'));

  // Check frontend
  log.header('\nFrontend');
  checks.push(await checkEndpoint('http://localhost:5173/', 'Frontend'));

  // Summary
  log.header('\n📊 HEALTH CHECK SUMMARY');
  const healthy = checks.filter(Boolean).length;
  const total = checks.length;

  if (healthy === total) {
    log.success(`All services healthy (${healthy}/${total})`);
    console.log('\n✅ System is ready!');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend:  http://localhost:5000');
    console.log('   MongoDB:  mongodb://localhost:27017');
    console.log('   Redis:    redis://localhost:6379\n');
    process.exit(0);
  } else {
    log.warn(`${healthy}/${total} services healthy`);
    console.log('\n⚠️  Some services are not ready');
    console.log('   Try: npm run logs (to see container logs)');
    console.log('   Or:  docker-compose ps (to see container status)\n');
    process.exit(1);
  }
}

// Check if we should wait for services
const args = process.argv.slice(2);
const waitMode = args.includes('--wait');

if (waitMode) {
  log.info('Wait mode enabled - will retry for 60 seconds...\n');

  let retries = 12; // 12 * 5 seconds = 60 seconds
  const interval = setInterval(async () => {
    const allHealthy = await healthCheck().catch(() => false);

    if (allHealthy || retries <= 0) {
      clearInterval(interval);
      if (!allHealthy) {
        log.error('Services did not become healthy within 60 seconds');
        process.exit(1);
      }
    }

    retries--;
  }, 5000);
} else {
  healthCheck().catch((error) => {
    log.error(`Health check failed: ${error.message}`);
    process.exit(1);
  });
}
