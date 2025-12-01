# Quick Start: Agent 6 Integration Testing

## What is Agent 6?

Agent 6 "The Integrator" validates that all game features work together seamlessly. It tests the **complete player journey** from registration to endgame.

## Quick Run

```bash
# 1. Start backend (terminal 1)
cd server
npm run dev

# 2. Start frontend (terminal 2)
cd client
npm run dev

# 3. Run Agent 6 (terminal 3)
cd test-automation
node journeys/agent-6-integrator.js
```

## What Gets Tested?

### 🎯 Journey 1: Complete Player Experience
Tests the full game loop:
- ✅ Register new account
- ✅ Create character
- ✅ Earn gold (combat + crimes)
- ✅ Create gang with earned gold
- ✅ Use gang vault
- ✅ Train skills
- ✅ Earn wanted level
- ✅ Get jailed
- ✅ Pay bail

### 💾 Journey 2: State Persistence
Ensures data survives logout/login:
- ✅ Gold persists
- ✅ Level & XP persists
- ✅ Gang membership persists
- ✅ Skill training persists

### ⚡ Journey 3: Real-Time Features
Tests live updates:
- ✅ Energy regenerates over time
- ✅ Chat messages send/receive
- ✅ Friend status updates

### 🛡️ Journey 4: Error Recovery
Validates error handling:
- ✅ Concurrent actions blocked
- ✅ Invalid input rejected
- ✅ Insufficient resources handled
- ✅ Network errors graceful

### 🔗 Journey 5: Cross-Feature Dependencies
Tests system integration:
- ✅ Skills affect action success
- ✅ Combat rewards fund gang creation
- ✅ Crimes lead to jail time

## Expected Output

```
🔗 THE INTEGRATOR - Testing cross-feature interactions...
======================================================================
Mission: Validate complete player journeys and system integration
======================================================================

📖 Journey 1: Complete Player Experience
----------------------------------------------------------------------
  → Registration...
    ✅ Registration passed
  → Character Creation...
    ✅ Character Creation passed
  → Earn Gold - Combat...
    ✅ Earn Gold - Combat passed
  [... more steps ...]

✅ Journey 1 Complete: 10 steps in 45000ms

[... more journeys ...]

📊 Generating Integration Report...
======================================================================

======================================================================
INTEGRATION TEST RESULTS
======================================================================
Total Journeys: 5
Passed: 5
Failed: 0
Success Rate: 100%
Total Tests: 42
Bugs Found: 0
Test Duration: 180.45s
======================================================================
```

## Viewing Results

### Test Report
Located at: `test-automation/reports/Agent-6-Integrator-[timestamp].json`

### Screenshots
Located at: `test-automation/screenshots/`

## Success Criteria

✅ **PASS** - All journeys complete, ≥95% success rate, 0 P0/P1 bugs
⚠️ **WARNING** - Some features degraded, <95% success rate, minor bugs
❌ **FAIL** - Critical failures, data loss, P0/P1 bugs

## Interpreting Results

### 100% Success Rate
System is production-ready! All features integrate correctly.

### 95-99% Success Rate
Minor issues found. Review warnings and fix before release.

### <95% Success Rate
Critical integration problems. Do not deploy.

## Common Issues & Fixes

### "Cannot connect to localhost:3000"
**Fix**: Start backend server
```bash
cd server && npm run dev
```

### "Cannot connect to localhost:3001"
**Fix**: Start frontend server
```bash
cd client && npm run dev
```

### "Registration failed"
**Fix**: Check if user already exists. Clear database:
```bash
mongo
> use desperados_dev
> db.users.deleteMany({email: /integrator/})
```

### "Browser launch failed"
**Fix**: Install Puppeteer dependencies
```bash
npm install puppeteer
```

## What Happens During Test?

1. **Browser opens** (visible, not headless)
2. **Agent navigates** through the game
3. **Actions performed** (combat, crimes, gang creation)
4. **Screenshots taken** at critical moments
5. **Data verified** at each step
6. **Report generated** with results

## Time Required

- **Fast Run**: 2-3 minutes (all features working)
- **Normal Run**: 3-5 minutes (some delays)
- **Slow Run**: >5 minutes (performance issues detected)

## When to Run Agent 6

### Required
- ✅ Before every production deployment
- ✅ After major feature additions
- ✅ After database schema changes

### Recommended
- ✅ After bug fixes
- ✅ Before pull request merge
- ✅ Weekly regression testing

### Optional
- ⚠️ After UI-only changes
- ⚠️ After documentation updates

## Next Steps After Testing

### If All Tests Pass ✅
1. Review detailed report
2. Check for warnings
3. Proceed with deployment

### If Tests Fail ❌
1. Check bug report in JSON
2. Review screenshots
3. Fix critical (P0/P1) bugs first
4. Re-run tests
5. Deploy only after 100% pass

## Advanced Usage

### Run in Headless Mode
Edit `test-automation/core/TestRunner.js`:
```javascript
this.config.headless = true; // Change to true
```

### Change Timeouts
```javascript
this.config.defaultTimeout = 60000; // 60 seconds
```

### Custom Test User
Create user before running:
```javascript
const email = 'your-test@example.com';
const password = 'YourPass123!';
```

## Integration with CI/CD

Add to `.github/workflows/ci.yml`:
```yaml
- name: Run Integration Tests
  run: |
    cd test-automation
    node journeys/agent-6-integrator.js
```

## Report Example

```json
{
  "summary": {
    "totalJourneys": 5,
    "passedJourneys": 5,
    "successRate": "100%",
    "bugsFound": 0
  },
  "recommendations": [
    "Add WebSocket reconnection logic",
    "Implement optimistic locking for transactions"
  ]
}
```

## FAQ

**Q: How long does it take?**
A: 2-5 minutes for full test suite

**Q: Can I run multiple agents at once?**
A: No, agents use same ports/database

**Q: What if I don't have a character?**
A: Agent creates one automatically

**Q: Can I skip certain journeys?**
A: Yes, comment out journey calls in runMission()

**Q: Does it work with production?**
A: No! Only use with dev/staging environments

## Support

**Issues?** Check `AGENT-6-INTEGRATION-TESTING.md` for full documentation.

**Bugs in Agent 6?** Report to QA team with:
- Error message
- Console output
- Screenshots from test run
