# Agent 6: The Integrator - Integration Testing Documentation

## Mission Overview

Agent 6 validates that all game systems work together seamlessly through comprehensive cross-feature integration testing.

## Test Coverage

### Journey 1: Complete Player Experience
**Goal**: Validate the entire player lifecycle from registration to endgame

**Test Flow**:
1. **Registration** - Create new account
2. **Character Creation** - Build character with faction selection
3. **Earn Gold (Combat)** - Defeat NPCs to earn gold
4. **Earn Gold (Crimes)** - Commit crimes for additional gold
5. **Create Gang** - Use earned gold to establish gang
6. **Gang Vault Operations** - Deposit/withdraw from gang bank
7. **Skill Training** - Start skill training session
8. **Earn Wanted Level** - Accumulate wanted stars through crimes
9. **Jail System** - Experience arrest and incarceration
10. **Pay Bail** - Use gold to escape jail early

**Success Criteria**:
- All 10 steps complete without critical errors
- Gold flows correctly between systems
- State changes persist across features

---

### Journey 2: State Persistence
**Goal**: Verify all character data persists across logout/login cycles

**Test Flow**:
1. **Capture State** - Record all character data
   - Gold balance
   - Level and experience
   - Gang membership
   - Skill training status
   - Wanted level
   - Inventory
2. **Logout** - End session
3. **Login** - Authenticate again
4. **Character Select** - Choose same character
5. **Verify State** - Compare all data points

**Success Criteria**:
- 100% data persistence
- No data loss on logout/login
- Character state matches exactly

**Tested Fields**:
- ✅ Gold amount
- ✅ Character level
- ✅ Experience points
- ✅ Gang membership
- ✅ Skill levels
- ✅ Wanted level
- ✅ Jail status
- ✅ Inventory items

---

### Journey 3: Real-time Features
**Goal**: Test systems that update without page refresh

**Test Components**:

#### 3.1 Energy Regeneration
- Verify energy decreases when performing actions
- Confirm energy regenerates over time
- Validate energy caps at maximum
- Test regeneration rate accuracy

#### 3.2 Chat System (WebSocket)
- Send messages to global/gang chat
- Verify messages appear in real-time
- Test message persistence
- Validate chat rate limiting

#### 3.3 Friend Online Status
- Check friend online/offline indicators
- Verify status updates in real-time
- Test presence system accuracy

**Success Criteria**:
- Energy regenerates at correct rate (30/hour free, 31.25/hour premium)
- Chat messages send and receive without page refresh
- Friend status updates reflect actual player state

---

### Journey 4: Error Recovery
**Goal**: Validate system resilience to edge cases and failures

**Test Scenarios**:

#### 4.1 Concurrent Action Prevention
- Attempt multiple actions simultaneously
- Verify only one succeeds (transaction safety)
- Check for proper error messages
- Confirm no duplicate resource deduction

#### 4.2 Invalid Input Handling
- Submit negative values (gold, energy)
- Send malformed data to API
- Test SQL injection protection
- Validate XSS prevention

#### 4.3 Insufficient Resources
- Attempt actions without enough energy
- Try purchases without sufficient gold
- Verify gang operations require permissions
- Test skill training without prerequisites

#### 4.4 Network Error Recovery
- Simulate connection loss
- Test API timeout handling
- Verify retry mechanisms
- Check data consistency after recovery

**Success Criteria**:
- All invalid operations rejected with clear errors
- No data corruption from failed operations
- Transaction rollback on failures
- User-friendly error messages

---

### Journey 5: Cross-Feature Dependencies
**Goal**: Test features that depend on each other

**Dependency Chains Tested**:

#### Chain 1: Skills → Actions
- Train skill to increase level
- Perform action using that skill
- Verify skill bonus applied to action
- Confirm higher success rate with trained skills

#### Chain 2: Combat → Gold → Gang
- Win combat encounter
- Receive gold reward
- Use gold to create/upgrade gang
- Verify gold transaction recorded

#### Chain 3: Crime → Wanted → Jail → Bail
- Commit crime
- Gain wanted level
- Get arrested when wanted ≥ 3
- Pay bail using gold
- Verify wanted level affects arrest chance

#### Chain 4: Gang → Territory → War
- Create gang
- Claim territory
- Initiate gang war
- Verify territory control affects resources

**Success Criteria**:
- All dependency chains function correctly
- Data flows between features without loss
- State changes propagate to dependent systems

---

## Test Execution

### Running Agent 6

```bash
# From test-automation directory
node journeys/agent-6-integrator.js
```

### Prerequisites
- Backend server running on localhost:3000
- Frontend server running on localhost:3001
- MongoDB instance available
- Clean database state (or test user created)

### Configuration
Located in `TestRunner.js`:
```javascript
{
  baseUrl: 'http://localhost:3001',
  apiUrl: 'http://localhost:3000/api',
  headless: false,
  slowMo: 50,
  defaultTimeout: 30000
}
```

---

## Test Report Structure

### Report Location
`test-automation/reports/Agent-6-Integrator-[timestamp].json`

### Report Contents

```json
{
  "agent": "Agent-6-Integrator",
  "timestamp": "2025-11-18T...",
  "testDuration": 180000,
  "summary": {
    "totalJourneys": 5,
    "passedJourneys": 5,
    "failedJourneys": 0,
    "totalTests": 42,
    "successRate": "100%",
    "bugsFound": 0,
    "screenshots": 15
  },
  "journeys": [...],
  "persistence": [...],
  "realTime": [...],
  "errorRecovery": [...],
  "bugs": [...],
  "recommendations": [...]
}
```

---

## Success Metrics

### Critical Metrics
- **Journey Success Rate**: ≥ 95% (all journeys pass)
- **State Persistence**: 100% (no data loss)
- **Error Recovery**: 100% (all errors handled gracefully)
- **Bug Severity**: 0 P0/P1 bugs

### Quality Indicators
- **Test Duration**: < 5 minutes (optimal performance)
- **Screenshots**: All critical steps captured
- **Error Messages**: All user-friendly and actionable

---

## Bug Reporting

### Bug Severity Levels

**P0 - Critical** (Blocks all testing)
- Server crashes
- Database connection failures
- Authentication completely broken

**P1 - Major** (Blocks specific journeys)
- Data loss on logout/login
- Gold transactions failing
- Gang creation broken

**P2 - Moderate** (Degrades experience)
- Energy regeneration inaccurate
- Chat messages delayed
- UI elements missing

**P3 - Minor** (Cosmetic issues)
- Typos in messages
- Button alignment issues
- Console warnings

### Bug Report Format
```json
{
  "id": "BUG-1699999999-abc123",
  "severity": "P1",
  "title": "Gold Not Persisting After Logout",
  "description": "Character gold resets to 100 after logout/login",
  "reproduction": [
    "Earn gold through combat",
    "Logout",
    "Login again",
    "Select same character",
    "Observe gold reset to starting value"
  ],
  "screenshot": "bug-0-timestamp.png"
}
```

---

## Recommendations for Stability

Based on integration testing, implement these improvements:

### 1. Transaction Safety
**Issue**: Concurrent actions may cause race conditions
**Solution**:
- Implement optimistic locking on Character model
- Use MongoDB transactions for all financial operations
- Add request queuing for sequential action processing

**Code Example**:
```typescript
// Before
character.gold -= cost;
await character.save();

// After (with transaction)
const session = await mongoose.startSession();
session.startTransaction();
try {
  character.gold -= cost;
  await character.save({ session });
  await GoldTransaction.create([{ ... }], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 2. State Persistence
**Issue**: Some state may not persist across sessions
**Solution**:
- Add `lastEnergyUpdate` timestamp to calculate offline regeneration
- Save skill training state to database, not just memory
- Persist all temporary buffs/debuffs with expiration times

### 3. Real-time Connection Recovery
**Issue**: WebSocket disconnection may cause chat/friend status issues
**Solution**:
- Implement automatic reconnection with exponential backoff
- Queue messages during disconnection
- Replay missed messages on reconnect

**Code Example**:
```javascript
socket.on('disconnect', () => {
  let retries = 0;
  const reconnect = setInterval(() => {
    if (retries < 5) {
      socket.connect();
      retries++;
    } else {
      clearInterval(reconnect);
      showError('Connection lost. Please refresh.');
    }
  }, 1000 * Math.pow(2, retries));
});
```

### 4. Error Message Improvements
**Issue**: Generic error messages confuse users
**Solution**:
- Map all error codes to user-friendly messages
- Include actionable next steps in errors
- Show estimated wait times for energy/jail

**Example**:
```javascript
// Before
{ error: 'Insufficient energy' }

// After
{
  error: 'Not enough energy to perform this action',
  details: {
    required: 25,
    current: 15,
    deficit: 10,
    timeUntilAvailable: '12 minutes'
  },
  suggestion: 'Wait for energy to regenerate or purchase premium for faster regeneration'
}
```

### 5. Input Validation
**Issue**: Client-side validation bypassed by malicious users
**Solution**:
- Validate all inputs on server-side
- Use Joi/Zod schemas for request validation
- Sanitize all user-generated content

### 6. Concurrent Action Prevention
**Issue**: Multiple simultaneous actions on same character
**Solution**:
- Implement action locks with Redis
- Check action lock before processing
- Release lock after completion/timeout

**Code Example**:
```typescript
const lockKey = `action:${characterId}`;
const locked = await redis.set(lockKey, '1', 'NX', 'EX', 10);
if (!locked) {
  throw new Error('Action already in progress');
}
try {
  // Perform action
} finally {
  await redis.del(lockKey);
}
```

---

## Integration Test Checklist

### Pre-Test Setup
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Database clean or test user ready
- [ ] Redis server running (for real-time features)
- [ ] All environment variables set

### During Test Execution
- [ ] Monitor console for errors
- [ ] Watch network tab for failed requests
- [ ] Observe UI for visual bugs
- [ ] Check database for data consistency

### Post-Test Analysis
- [ ] Review test report
- [ ] Analyze screenshots
- [ ] Investigate all bugs
- [ ] Prioritize fixes by severity

### Bug Fix Verification
- [ ] Re-run affected journey
- [ ] Verify fix doesn't break other features
- [ ] Update integration tests if needed
- [ ] Document fix in changelog

---

## Continuous Integration

### Running in CI/CD Pipeline

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Start MongoDB
        run: docker-compose up -d mongo

      - name: Start Backend
        run: |
          cd server
          npm install
          npm run build
          npm start &

      - name: Start Frontend
        run: |
          cd client
          npm install
          npm run build
          npm run preview &

      - name: Wait for servers
        run: sleep 30

      - name: Run Agent 6
        run: |
          cd test-automation
          npm install
          node journeys/agent-6-integrator.js

      - name: Upload Reports
        uses: actions/upload-artifact@v2
        with:
          name: integration-reports
          path: test-automation/reports/

      - name: Upload Screenshots
        uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: test-automation/screenshots/
```

---

## Troubleshooting

### Common Issues

#### Issue: "Browser launch failed"
**Solution**: Install Puppeteer dependencies
```bash
# Ubuntu/Debian
sudo apt-get install -y libgbm-dev

# Windows
# Ensure Chrome/Chromium installed
```

#### Issue: "Connection refused to localhost:3000"
**Solution**: Verify backend is running
```bash
cd server
npm run dev
# Check http://localhost:3000/api/health
```

#### Issue: "Login failed - user not found"
**Solution**: Create test user or use clean database
```bash
# Clean database
mongo
> use desperados_test
> db.dropDatabase()
```

#### Issue: "Tests timeout frequently"
**Solution**: Increase timeout in config
```javascript
this.config.defaultTimeout = 60000; // 60 seconds
```

#### Issue: "Screenshots not saving"
**Solution**: Create screenshots directory
```bash
mkdir -p test-automation/screenshots
```

---

## Future Enhancements

### Planned Features

1. **Multi-Player Testing**
   - Spawn multiple browser instances
   - Test gang interactions between real players
   - Validate PvP combat scenarios

2. **Performance Testing**
   - Measure action response times
   - Track page load speeds
   - Monitor memory usage

3. **Load Testing**
   - Simulate 100+ concurrent players
   - Test server stability under load
   - Identify bottlenecks

4. **Visual Regression Testing**
   - Compare screenshots against baseline
   - Detect unintended UI changes
   - Flag broken layouts

5. **API Contract Testing**
   - Validate API responses match OpenAPI spec
   - Test all error scenarios
   - Verify response schemas

---

## Metrics Dashboard

### Key Performance Indicators

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Journey Success Rate | ≥95% | TBD | 🟡 Pending |
| State Persistence | 100% | TBD | 🟡 Pending |
| Error Recovery | 100% | TBD | 🟡 Pending |
| Test Duration | <5min | TBD | 🟡 Pending |
| P0/P1 Bugs | 0 | TBD | 🟡 Pending |

### Test Coverage

| Feature | Integration Tests | Status |
|---------|-------------------|--------|
| Authentication | ✅ Login/Register | Complete |
| Character System | ✅ Create/Select | Complete |
| Combat System | ✅ Full Flow | Complete |
| Crime System | ✅ Full Flow | Complete |
| Gang System | ✅ Create/Manage | Complete |
| Skills System | ✅ Train/Use | Complete |
| Gold Economy | ✅ Earn/Spend | Complete |
| Energy System | ✅ Regen/Use | Complete |
| Jail System | ✅ Arrest/Bail | Complete |
| Chat System | ⚠️ Partial | In Progress |
| Friends System | ⚠️ Partial | In Progress |

---

## Contact & Support

**Agent Owner**: Integration Testing Team
**Purpose**: Cross-feature validation
**Run Frequency**: Before every deployment
**Priority**: P0 (Critical for release)

**Questions?** Check `/test-automation/README.md` or contact the QA team.

---

## Changelog

### v1.0.0 - 2025-11-18
- Initial Agent 6 creation
- Complete player journey testing
- State persistence validation
- Real-time features testing
- Error recovery scenarios
- Cross-feature dependency validation
