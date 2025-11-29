# Agent 6 Integration Testing Checklist

## Pre-Test Setup Checklist

### Environment Setup
- [ ] Backend server is running (http://localhost:3000)
  ```bash
  cd server && npm run dev
  ```
- [ ] Frontend server is running (http://localhost:3001)
  ```bash
  cd client && npm run dev
  ```
- [ ] MongoDB is accessible
- [ ] Redis is running (for real-time features)
- [ ] Database is clean or test user created

### Verification Steps
- [ ] Backend health check passes: `curl http://localhost:3000/api/health`
- [ ] Frontend loads: Open http://localhost:3001 in browser
- [ ] No errors in server console
- [ ] No errors in frontend console

---

## Running Agent 6

### Execution
- [ ] Navigate to test-automation directory
  ```bash
  cd test-automation
  ```
- [ ] Run Agent 6
  ```bash
  node journeys/agent-6-integrator.js
  ```
- [ ] Watch browser open and execute tests
- [ ] Monitor console output for errors
- [ ] Wait for completion (2-5 minutes)

### During Execution
- [ ] Browser opens successfully
- [ ] Landing page loads
- [ ] Registration completes
- [ ] Character creation works
- [ ] Game dashboard appears
- [ ] Actions execute
- [ ] No crashes or freezes

---

## Interpreting Results

### Success Indicators ✅

**Console Output:**
```
======================================================================
INTEGRATION TEST RESULTS
======================================================================
Total Journeys: 5
Passed: 5
Failed: 0
Success Rate: 100%
Total Tests: 42
Bugs Found: 0
Test Duration: 185.34s
======================================================================
```

**Checklist:**
- [ ] All 5 journeys show ✅ (pass)
- [ ] Success Rate ≥ 95%
- [ ] Bugs Found = 0 (or only P3)
- [ ] Test Duration < 5 minutes
- [ ] No P0 or P1 bugs reported

**Action:** System is production-ready! ✅

---

### Warning Indicators ⚠️

**Console Output:**
```
Success Rate: 92%
Bugs Found: 3 (P2, P2, P3)

JOURNEY RESULTS:
  ✅ Journey 1: Complete Player Experience - pass
  ✅ Journey 2: State Persistence - pass
  ⚠️ Journey 3: Real-Time Features - warning
  ✅ Journey 4: Error Recovery - pass
  ✅ Journey 5: Cross-Feature Dependencies - pass
```

**Checklist:**
- [ ] Success Rate 90-94%
- [ ] Only P2/P3 bugs found
- [ ] Some journeys have warnings
- [ ] Core features still work
- [ ] Data persistence intact

**Action:** Review bugs, fix if time permits, can deploy with caution ⚠️

---

### Failure Indicators ❌

**Console Output:**
```
Success Rate: 75%
Bugs Found: 5 (P0, P1, P1, P2, P3)

JOURNEY RESULTS:
  ❌ Journey 1: Complete Player Experience - fail
  ❌ Journey 2: State Persistence - fail
  ✅ Journey 3: Real-Time Features - pass
  ❌ Journey 4: Error Recovery - fail
  ✅ Journey 5: Cross-Feature Dependencies - pass
```

**Checklist:**
- [ ] Success Rate < 90%
- [ ] P0 or P1 bugs found
- [ ] Multiple journeys failed
- [ ] Critical features broken
- [ ] Data loss detected

**Action:** DO NOT DEPLOY! Fix critical bugs first ❌

---

## Bug Analysis Checklist

### For Each Bug Found

- [ ] Read bug title and description
- [ ] Check severity level (P0, P1, P2, P3)
- [ ] View screenshot evidence
  - Location: `test-automation/screenshots/bug-[N]-[timestamp].png`
- [ ] Review reproduction steps
- [ ] Determine affected feature
- [ ] Estimate fix complexity

### Bug Prioritization

**P0 (Critical) - Fix IMMEDIATELY**
- [ ] Blocks all testing
- [ ] Causes data loss
- [ ] Server crashes
- [ ] Authentication broken

**P1 (Major) - Fix BEFORE deployment**
- [ ] Blocks specific journeys
- [ ] Causes data corruption
- [ ] Major features broken
- [ ] Security vulnerability

**P2 (Moderate) - Fix if time permits**
- [ ] Degrades experience
- [ ] Workaround exists
- [ ] Minor features affected
- [ ] Performance issue

**P3 (Minor) - Fix in next sprint**
- [ ] Cosmetic issues
- [ ] Typos
- [ ] Console warnings
- [ ] Nice-to-have improvements

---

## Journey-Specific Checklists

### Journey 1: Complete Player Experience

**If FAILED:**
- [ ] Check which step failed (registration, combat, gang, etc.)
- [ ] Review screenshot of failure point
- [ ] Verify API endpoints working
- [ ] Check database connections
- [ ] Look for console errors

**Common Issues:**
- Registration endpoint not responding
- Character creation validation failing
- Combat NPC list empty
- Gang creation cost mismatch
- Skill training not starting

---

### Journey 2: State Persistence

**If FAILED:**
- [ ] Check which data field didn't persist
- [ ] Compare before/after values in report
- [ ] Verify database save operations
- [ ] Check session management
- [ ] Review logout/login flow

**Common Issues:**
- Gold not saving to database
- Character level reset on login
- Gang membership lost
- Skill progress wiped
- Inventory items disappeared

**Critical Fix Required:**
All state must persist 100%. No data loss acceptable.

---

### Journey 3: Real-Time Features

**If FAILED:**
- [ ] Check WebSocket connection
- [ ] Verify energy regeneration calculation
- [ ] Test chat message delivery
- [ ] Confirm friend status updates

**Common Issues:**
- WebSocket not connecting
- Energy not regenerating
- Chat messages not sending
- Friend status stale

**Acceptable Degradation:**
Minor delays in real-time updates are OK, complete failures are not.

---

### Journey 4: Error Recovery

**If FAILED:**
- [ ] Check error message quality
- [ ] Verify concurrent action handling
- [ ] Test invalid input rejection
- [ ] Confirm transaction rollback

**Common Issues:**
- Concurrent actions not blocked
- Invalid input accepted
- No error messages shown
- Database inconsistency after failure

**Critical Fix Required:**
Error recovery failures can cause data corruption.

---

### Journey 5: Cross-Feature Dependencies

**If FAILED:**
- [ ] Identify which dependency chain broke
- [ ] Check data flow between features
- [ ] Verify skill bonuses apply
- [ ] Confirm gold transactions work

**Common Issues:**
- Skills don't affect actions
- Combat rewards not granted
- Gang creation doesn't deduct gold
- Wanted level doesn't trigger jail

**Impact:**
Breaks game economy and progression.

---

## Post-Test Analysis Checklist

### Report Review

- [ ] Open JSON report: `test-automation/reports/Agent-6-Integrator-[timestamp].json`
- [ ] Review summary section
- [ ] Read all bug reports
- [ ] Check recommendations list
- [ ] Analyze journey details

### Screenshot Review

- [ ] Browse `test-automation/screenshots/`
- [ ] Look at baseline screenshots (working state)
- [ ] Compare bug screenshots (failure state)
- [ ] Identify visual issues
- [ ] Document UI problems

### Recommendation Implementation

**For Each Recommendation:**
- [ ] Read recommendation description
- [ ] Understand the problem
- [ ] Review code example
- [ ] Estimate implementation time
- [ ] Create issue/ticket
- [ ] Assign to developer
- [ ] Track completion

---

## Fix Verification Checklist

### After Fixing Bugs

- [ ] Re-run Agent 6
- [ ] Verify bug no longer occurs
- [ ] Check success rate improved
- [ ] Ensure no new bugs introduced
- [ ] Confirm all journeys pass
- [ ] Review updated report

### Regression Prevention

- [ ] Add unit tests for fix
- [ ] Document the bug
- [ ] Update API contracts if needed
- [ ] Add validation to prevent recurrence
- [ ] Update integration tests if needed

---

## Deployment Readiness Checklist

### Pre-Deployment Validation

- [ ] Agent 6 success rate ≥ 95%
- [ ] Zero P0 bugs
- [ ] Zero P1 bugs
- [ ] All critical recommendations implemented
- [ ] State persistence 100%
- [ ] Transaction safety verified
- [ ] Error handling validated

### Final Checks

- [ ] Run Agent 6 on staging environment
- [ ] Verify production database backups exist
- [ ] Confirm rollback plan ready
- [ ] Alert monitoring team
- [ ] Schedule deployment window
- [ ] Notify stakeholders

### Post-Deployment

- [ ] Run Agent 6 on production (if possible)
- [ ] Monitor error rates
- [ ] Watch real-time features
- [ ] Check transaction logs
- [ ] Verify data integrity
- [ ] Run smoke tests

---

## Troubleshooting Checklist

### Agent Won't Start

- [ ] Check Node.js installed: `node --version`
- [ ] Verify in correct directory
- [ ] Install dependencies: `npm install`
- [ ] Check Puppeteer installed
- [ ] Try: `npm install puppeteer`

### Browser Launch Fails

- [ ] Install Chrome/Chromium
- [ ] Check system dependencies
- [ ] Try headless mode: Edit `TestRunner.js`, set `headless: true`
- [ ] Check for port conflicts

### Connection Errors

- [ ] Verify backend running: `curl http://localhost:3000/api/health`
- [ ] Check frontend running: Open http://localhost:3001
- [ ] Test MongoDB: `mongo --eval 'db.version()'`
- [ ] Test Redis: `redis-cli ping`

### Tests Timeout

- [ ] Increase timeout in config: `defaultTimeout: 60000`
- [ ] Check server response times
- [ ] Verify database performance
- [ ] Look for hanging requests

### Screenshots Not Saving

- [ ] Check directory exists: `test-automation/screenshots/`
- [ ] Create if missing: `mkdir -p test-automation/screenshots`
- [ ] Check write permissions
- [ ] Verify disk space available

### Database Issues

- [ ] Clean database: Drop test collections
- [ ] Check MongoDB connection string
- [ ] Verify database permissions
- [ ] Look for schema validation errors

---

## Continuous Integration Checklist

### CI/CD Setup

- [ ] Add Agent 6 to pipeline
- [ ] Configure test environment
- [ ] Set up MongoDB for tests
- [ ] Start backend/frontend services
- [ ] Run Agent 6
- [ ] Upload reports as artifacts
- [ ] Fail build on P0/P1 bugs

### Pipeline Stages

1. [ ] Setup
   - Install dependencies
   - Start services
   - Initialize database

2. [ ] Execute
   - Run Agent 6
   - Capture output
   - Save screenshots

3. [ ] Report
   - Generate HTML report
   - Upload to artifact storage
   - Send notifications

4. [ ] Cleanup
   - Stop services
   - Clean database
   - Remove temp files

---

## Monthly Maintenance Checklist

### Regular Updates

- [ ] Review and update test scenarios
- [ ] Add new feature tests
- [ ] Update documentation
- [ ] Check for deprecated dependencies
- [ ] Review and close old bugs
- [ ] Update baseline screenshots

### Performance Review

- [ ] Analyze test duration trends
- [ ] Identify slow tests
- [ ] Optimize test execution
- [ ] Review resource usage
- [ ] Check for test flakiness

---

## Emergency Checklist

### Production Issue Detected

- [ ] Run Agent 6 on production-like environment
- [ ] Identify which journey fails
- [ ] Review related bugs
- [ ] Check if bug was previously reported
- [ ] Determine if regression
- [ ] Create hotfix
- [ ] Re-run tests
- [ ] Deploy fix

### Data Loss Detected

- [ ] Stop all deployments immediately
- [ ] Run Journey 2 (State Persistence)
- [ ] Identify which data is lost
- [ ] Check database backups
- [ ] Determine root cause
- [ ] Implement fix with transaction safety
- [ ] Test thoroughly
- [ ] Restore data if possible

---

## Success Metrics Checklist

### Track These Metrics

- [ ] Success rate over time
- [ ] Bug count by severity
- [ ] Test duration trend
- [ ] Features covered
- [ ] Regression rate
- [ ] Fix time per bug

### Quality Goals

- [ ] Maintain ≥95% success rate
- [ ] Keep P0/P1 bugs at zero
- [ ] Reduce test duration to <3 minutes
- [ ] Cover 100% of critical features
- [ ] Fix regressions within 24 hours

---

## Quick Reference

### Run Test
```bash
cd test-automation && node journeys/agent-6-integrator.js
```

### View Report
```bash
cat test-automation/reports/Agent-6-Integrator-*.json | jq '.summary'
```

### Check Bugs
```bash
cat test-automation/reports/Agent-6-Integrator-*.json | jq '.bugs[]'
```

### View Recommendations
```bash
cat test-automation/reports/Agent-6-Integrator-*.json | jq '.recommendations'
```

---

**Last Updated:** November 18, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
