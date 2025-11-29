# Test Suites Directory

This directory contains production-ready test suites for comprehensive game validation.

## Test Suites

### 1. ValidationSuite.ts
**Purpose:** Quick smoke test before deployment

**Duration:** 5-10 minutes

**Usage:**
```bash
npm run playtest:validation
```

**What it tests:**
- Combat bot performs basic actions
- Economy bot performs basic actions
- Social bot performs basic actions
- All game systems accessible (integration test)
- Adversarial bot can detect issues

**Output:**
- Pass/fail for each test
- Overall pass rate
- Saved to `data/validation-report-*.json`

**Use case:** Run before every commit or deployment

---

### 2. 24HourTest.ts
**Purpose:** Long-running stability validation

**Duration:** 24 hours (configurable)

**Usage:**
```bash
npm run playtest:24hour
```

**What it tests:**
- System stability over 24 hours
- Memory leak detection
- Error rate tracking
- Bot restart recovery
- Performance degradation

**Bots run:**
- CombatBot-24h
- EconomyBot-24h
- SocialBot-24h
- AdversarialBot-24h

**Metrics collected:**
- Actions performed
- Errors encountered
- Memory usage over time
- Restart count
- Health status

**Output:**
- Comprehensive stability report
- Metrics history (every 5 minutes)
- Recommendations based on results
- Saved to `data/24hour-test-*.json`

**Use case:** Monthly stability check, pre-production validation

---

## Running Tests

### Quick Validation
```bash
# From project root
npm run playtest:validation

# Expected output:
# ✓ ALL VALIDATION TESTS PASSED
# Pass Rate: 100.0%
# Exit code: 0
```

### 24-Hour Test
```bash
# From project root
npm run playtest:24hour

# To stop early: Ctrl+C (graceful shutdown)
```

### Custom Duration Test
```typescript
import { TwentyFourHourTest } from './tests/24HourTest.js';

// Run for 1 hour instead of 24
const test = new TwentyFourHourTest(1);
const report = await test.run();
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
# .github/workflows/validation.yml
name: Validation Tests

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

### Jenkins Example
```groovy
pipeline {
  agent any
  stages {
    stage('Validate') {
      steps {
        sh 'npm install'
        sh 'npm run playtest:validation'
      }
    }
  }
}
```

## Reports

All test reports are saved to:
- `tests/playtests/data/validation-report-*.json`
- `tests/playtests/data/24hour-test-*.json`

Report format:
```json
{
  "timestamp": 1234567890,
  "totalTests": 5,
  "passed": 5,
  "failed": 0,
  "passRate": 100,
  "overallStatus": "PASS",
  "results": [...]
}
```

## Troubleshooting

### Validation tests failing
1. Check if game server is running
2. Verify bot user accounts exist
3. Review error logs in `tests/playtests/logs/`
4. Check browser compatibility

### 24-hour test crashes
1. Check memory usage
2. Review health reports
3. Verify auto-restart is enabled
4. Check for network issues

### High error rates
1. Review error logs
2. Check if game systems are down
3. Verify element selectors are current
4. Check network connectivity

## Best Practices

1. **Run validation before every deployment**
2. **Run 24-hour test monthly** or before major releases
3. **Monitor reports** for trends
4. **Update thresholds** as needed based on results
5. **Keep bots updated** with latest selectors

## Support

For issues:
1. Check `tests/playtests/logs/` for detailed logs
2. Review `tests/playtests/health/` for health reports
3. Check `tests/playtests/state/` for bot state
4. Consult `PRODUCTION_GUIDE.md` for detailed documentation
