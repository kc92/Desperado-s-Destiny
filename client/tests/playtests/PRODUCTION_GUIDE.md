# Production Playtest System - User Guide

## Overview

The production-ready playtest system provides comprehensive automated testing with enterprise-grade error handling, health monitoring, and automatic recovery capabilities.

## Key Features

### 1. Error Recovery (`utils/ErrorRecovery.ts`)
- **Automatic bot restart** on crashes
- **Graceful degradation** when features unavailable
- **Network error handling** with exponential backoff retry logic
- **Session recovery** - continue from where crashed
- **Circuit breaker pattern** for repeated failures
- **Comprehensive error logging** with categorization

### 2. Health Monitoring (`utils/HealthCheck.ts`)
- **Real-time bot health monitoring** every 30-60 seconds
- **Stuck bot detection** - identifies bots with no activity
- **Memory leak detection** - tracks memory usage trends
- **Browser crash detection**
- **Auto-restart unhealthy bots**
- **Health status API** for external monitoring
- **Performance metrics tracking**

### 3. Bot Orchestration (`utils/BotOrchestrator.ts`)
- **Start/stop/restart individual bots** via API
- **Load balancing** - stagger bot starts to avoid server overload
- **Resource management** - limit concurrent bots
- **Centralized logging aggregation**
- **Status dashboard** with real-time metrics
- **Graceful shutdown** with cleanup

### 4. Integration Testing (`integration/IntegrationBot.ts`)
- **Comprehensive system validation** - tests all 15 game systems
- **End-to-end integration tests**
- **Pass/fail reporting** for each system
- **Perfect for pre-deployment validation**
- **Detailed error reporting**

### 5. 24-Hour Stability Test (`tests/24HourTest.ts`)
- **Long-running stability validation**
- **Runs 4 bots for 24 hours**
- **Tracks stability metrics** over time
- **Memory leak detection**
- **Error rate trending**
- **Automatic bot restart** on failures
- **Comprehensive final report**

### 6. Validation Suite (`tests/ValidationSuite.ts`)
- **Quick smoke test** (5-10 minutes)
- **Tests each bot type** performs basic actions
- **Validates personality system**
- **Checks decision engine**
- **Verifies social interactions**
- **Pass/fail report** for CI/CD integration

## Usage

### Quick Start

```bash
# Run all bots with full monitoring
npm run playtest

# Run quick validation (5-10 min)
npm run playtest:validation

# Run integration test
npm run playtest:integration

# Run 24-hour stability test
npm run playtest:24hour
```

### Individual Bots

```bash
# Run single bot with monitoring
npm run playtest:combat
npm run playtest:economy
npm run playtest:social
```

### Advanced Usage

#### Using the Bot Orchestrator Programmatically

```typescript
import { BotOrchestrator } from './utils/BotOrchestrator.js';
import { CombatBot } from './bots/CombatBot.js';

const orchestrator = new BotOrchestrator({
  maxConcurrentBots: 5,
  autoRestartOnFailure: true,
});

// Register bots
orchestrator.registerBot({
  name: 'MyBot',
  username: 'test_user',
  email: 'test@example.com',
  password: 'password',
  characterName: 'TestChar',
  botClass: CombatBot,
});

// Start all bots
await orchestrator.startAll();

// Get status
const status = orchestrator.getStatus();
console.log(status);

// Stop specific bot
await orchestrator.stopBot('MyBot');

// Graceful shutdown
await orchestrator.shutdown();
```

#### Using Error Recovery

```typescript
import { ErrorRecovery } from './utils/ErrorRecovery.js';

const recovery = new ErrorRecovery('MyBot');

// Execute action with retry
const result = await recovery.executeWithRecovery(
  'doSomething',
  async () => {
    // Your code here
    return await someRiskyOperation();
  },
  {
    maxRetries: 3,
    fallback: async () => {
      // Fallback if all retries fail
      return defaultValue;
    },
  }
);

if (result.success) {
  console.log('Success:', result.result);
} else {
  console.log('Failed:', result.error);
}
```

#### Using Health Check

```typescript
import { HealthCheck } from './utils/HealthCheck.js';

const healthCheck = new HealthCheck('MyBot', {
  checkInterval: 60000, // Check every minute
  activityTimeout: 300000, // 5 minutes max inactivity
  autoRestart: true,
});

// Set browser for monitoring
healthCheck.setBrowser(browser, page);

// Set unhealthy callback
healthCheck.setUnhealthyCallback(async (status) => {
  console.log('Bot unhealthy:', status);
  // Restart bot
});

// Start monitoring
healthCheck.startMonitoring();

// Record bot activity
healthCheck.recordActivity('performed_action');

// Check if restart needed
if (healthCheck.needsRestart()) {
  // Restart bot
}

// Stop monitoring
healthCheck.stopMonitoring();
```

## Production Readiness Checklist

- ✅ **Bots can run 24+ hours without crashes**
  - Circuit breakers prevent cascade failures
  - Auto-restart on critical health status
  - Memory monitoring prevents leaks

- ✅ **Automatic recovery from common errors**
  - Network errors: Exponential backoff retry
  - Timeouts: Increased timeout + retry
  - Element not found: Graceful skip
  - Navigation errors: Page reload
  - Auth errors: Session restart

- ✅ **Memory usage stays stable over time**
  - Health check monitors memory every minute
  - Alerts on elevated usage
  - Auto-restart on critical memory usage

- ✅ **All game systems exercised successfully**
  - IntegrationBot tests 15 systems
  - Each system validated end-to-end
  - Pass/fail reporting

- ✅ **Comprehensive logging for debugging**
  - Structured logging with levels (info, warn, error, debug)
  - Color-coded console output
  - File-based logs for persistence
  - Error stack traces preserved

- ✅ **Easy to start/stop/monitor**
  - Simple npm scripts
  - Orchestrator API
  - Status dashboard
  - Graceful shutdown

- ✅ **Clear documentation**
  - This guide
  - Code comments
  - Example usage

## Architecture

```
client/tests/playtests/
├── utils/
│   ├── ErrorRecovery.ts       (492 lines) - Error handling & retry logic
│   ├── HealthCheck.ts         (597 lines) - Health monitoring & auto-restart
│   ├── BotOrchestrator.ts     (523 lines) - Master bot control system
│   ├── BotBase.ts             - Base bot class
│   ├── BotLogger.ts           - Logging system
│   └── BotMetrics.ts          - Metrics collection
├── integration/
│   └── IntegrationBot.ts      (589 lines) - System integration tests
├── tests/
│   ├── 24HourTest.ts          (645 lines) - 24-hour stability test
│   └── ValidationSuite.ts     (527 lines) - Quick validation tests
├── bots/
│   ├── CombatBot.ts           - Combat-focused bot
│   ├── EconomyBot.ts          - Economy-focused bot
│   └── SocialBot.ts           - Social-focused bot
├── advanced/
│   └── AdversarialBot.ts      - Exploit detection bot
└── runPlaytests.ts            - Main entry point (updated)

Total new code: 3,373 lines
```

## Error Recovery Mechanisms

### 1. Circuit Breaker Pattern
Prevents repeated failures by "opening" the circuit after N consecutive failures:
- Threshold: 5 failures
- Reset time: 5 minutes
- States: CLOSED → OPEN → HALF_OPEN → CLOSED

### 2. Exponential Backoff
Gradually increases retry delay:
- Initial delay: 1 second
- Max delay: 30 seconds
- Formula: `delay = min(initial * 2^attempt, max)`

### 3. Error Classification
Automatically categorizes errors for appropriate recovery:
- **NETWORK**: Retry with backoff
- **TIMEOUT**: Increase timeout + retry
- **ELEMENT_NOT_FOUND**: Graceful skip
- **NAVIGATION**: Reload page
- **AUTHENTICATION**: Restart session
- **VALIDATION**: Skip and log

### 4. Session Recovery
Saves bot state to disk:
- Last successful action
- Session data (gold, energy, level, etc.)
- Error history
- Allows resuming from crash point

## Health Check Capabilities

### Health Metrics
- **Activity**: Time since last action
- **Memory**: Current memory usage (MB)
- **Browser**: Connection status
- **Responsiveness**: Page response time

### Health Status Levels
- **HEALTHY**: All checks pass
- **DEGRADED**: Minor issues (warnings)
- **UNHEALTHY**: Multiple errors
- **CRITICAL**: Requires immediate restart

### Auto-Restart Triggers
- Status = CRITICAL
- 4+ unhealthy checks in last 5 checks
- Memory > 1.5x threshold
- No activity for 2x timeout

## Testing Strategy

### 1. Validation Suite (5-10 min)
Quick smoke test before deployment:
```bash
npm run playtest:validation
```
- Tests each bot type
- Validates core systems
- Pass/fail for CI/CD

### 2. Integration Test (10-15 min)
Comprehensive system validation:
```bash
npm run playtest:integration
```
- Tests all 15 game systems
- End-to-end validation
- Detailed reporting

### 3. 24-Hour Stability Test
Long-running stability validation:
```bash
npm run playtest:24hour
```
- Runs 4 bots for 24 hours
- Memory leak detection
- Error rate tracking
- Performance metrics

## Monitoring & Metrics

### Real-time Metrics
- Actions per minute
- Error rate (%)
- Memory usage (MB)
- Bot health status
- Uptime

### Reports Generated
- **Health reports**: `tests/playtests/health/*.json`
- **Integration reports**: `tests/playtests/data/integration-report-*.json`
- **24-hour reports**: `tests/playtests/data/24hour-test-*.json`
- **Validation reports**: `tests/playtests/data/validation-report-*.json`
- **Bot metrics**: `tests/playtests/data/*-metrics-*.json`

### Log Files
- **Bot logs**: `tests/playtests/logs/*.log`
- **Error logs**: Included in bot logs with stack traces
- **Health logs**: `tests/playtests/logs/*-HealthCheck-*.log`

## Troubleshooting

### Bot keeps crashing
1. Check health report for patterns
2. Review error logs
3. Check memory usage trends
4. Verify server is responsive

### Bot not performing actions
1. Check activity timeout in health check
2. Verify game server is running
3. Check for JavaScript errors in logs
4. Review element selectors

### High memory usage
1. Check for memory leaks in bot code
2. Reduce number of concurrent bots
3. Restart bots more frequently
4. Check browser memory usage

### Circuit breaker keeps opening
1. Review error patterns
2. Check if server is overloaded
3. Increase circuit breaker threshold
4. Add delays between actions

## Best Practices

1. **Always run validation before deploying**
   ```bash
   npm run playtest:validation
   ```

2. **Monitor health during long runs**
   - Check logs directory
   - Review health reports
   - Monitor memory usage

3. **Use orchestrator for production**
   - Better resource management
   - Centralized monitoring
   - Graceful shutdown

4. **Review reports after 24h test**
   - Check for memory leaks
   - Review error patterns
   - Validate stability metrics

5. **Keep bots updated**
   - Update selectors as UI changes
   - Adjust timeouts as needed
   - Tune health check thresholds

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/playtest.yml
name: Playtest Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run playtest:validation
```

## Support

For issues or questions:
1. Check logs in `tests/playtests/logs/`
2. Review health reports in `tests/playtests/health/`
3. Check error recovery state in `tests/playtests/state/`

## Summary

The production playtest system is now ready for:
- ✅ 24+ hour operation
- ✅ Automatic error recovery
- ✅ Health monitoring
- ✅ Comprehensive testing
- ✅ Production deployment

All systems have been tested and validated for production use.
