# Integration Checklist

## Overview

This checklist ensures all new features properly integrate with existing systems. Use this before deploying any new feature or system.

---

## New Feature Integration Checklist

### Phase 1: Planning

- [ ] **Identify Dependencies**
  - [ ] List all systems this feature depends on
  - [ ] List all systems that will depend on this feature
  - [ ] Map data flows (what data goes in/out)
  - [ ] Identify shared resources (gold, XP, energy, etc.)

- [ ] **Review Integration Map**
  - [ ] Check `SYSTEM_INTEGRATION_MAP.md`
  - [ ] Identify similar existing integrations
  - [ ] Learn from existing patterns
  - [ ] Note any conflicts or overlaps

- [ ] **Design Integration Points**
  - [ ] Define service interfaces
  - [ ] Plan event emissions
  - [ ] Design data structures
  - [ ] Plan error handling

### Phase 2: Implementation

#### Core Integration

- [ ] **Database Integration**
  - [ ] Create necessary models/schemas
  - [ ] Add proper indexes
  - [ ] Define relationships (refs, embeds)
  - [ ] Add validation rules
  - [ ] Test migrations if modifying existing schemas

- [ ] **Service Integration**
  - [ ] Import required services
  - [ ] Handle circular dependencies (use dynamic imports if needed)
  - [ ] Implement error handling for service calls
  - [ ] Use transactions for multi-system updates
  - [ ] Add logging for integration points

- [ ] **Event Integration**
  - [ ] Define new event types in `systemEvents.types.ts` (if needed)
  - [ ] Emit events at appropriate times
  - [ ] Subscribe to relevant events from other systems
  - [ ] Handle event errors gracefully
  - [ ] Test event propagation

#### Resource Integration

- [ ] **Gold Integration** (if feature involves gold)
  - [ ] Use `GoldService.addGold()` for all gold gains
  - [ ] Use `GoldService.deductGold()` for all gold costs
  - [ ] Pass proper `TransactionSource`
  - [ ] Include meaningful metadata
  - [ ] Test with world event modifiers
  - [ ] Test with legacy multipliers

- [ ] **XP Integration** (if feature grants XP)
  - [ ] Use `Character.addExperience()`
  - [ ] Handle potential level ups
  - [ ] Trigger appropriate events
  - [ ] Update quest objectives
  - [ ] Update legacy stats

- [ ] **Energy Integration** (if feature costs energy)
  - [ ] Use `EnergyService.spendEnergy()`
  - [ ] Check energy before action
  - [ ] Handle insufficient energy gracefully
  - [ ] Consider premium bonuses
  - [ ] Test energy regeneration

- [ ] **Reputation Integration** (if feature affects reputation)
  - [ ] Use `ReputationService.modifyReputation()`
  - [ ] Handle multiple faction impacts
  - [ ] Trigger gossip system updates
  - [ ] Update quest objectives
  - [ ] Check achievement triggers

#### Quest Integration

- [ ] **Quest Triggers** (if feature can progress quests)
  - [ ] Call appropriate `QuestService.on*()` methods
  - [ ] Pass correct parameters
  - [ ] Handle quest completion triggers
  - [ ] Test with multiple active quests
  - [ ] Don't fail feature if quest update fails (use try-catch)

- [ ] **Quest Objectives** (if feature is quest objective)
  - [ ] Support "any" variant objectives
  - [ ] Support specific objective matching
  - [ ] Support quantity tracking
  - [ ] Test objective completion
  - [ ] Test quest chains

#### Legacy Integration

- [ ] **Legacy Tracking** (if feature tracks lifetime stats)
  - [ ] Emit appropriate legacy events
  - [ ] Map to correct lifetime stats
  - [ ] Update milestone progress
  - [ ] Handle tier calculations
  - [ ] Test milestone unlocks

- [ ] **Legacy Bonuses** (if feature can be affected by legacy)
  - [ ] Check for applicable bonuses
  - [ ] Apply multipliers correctly
  - [ ] Document bonus mechanics
  - [ ] Test at different legacy tiers

#### Achievement Integration

- [ ] **Achievement Triggers** (if feature unlocks achievements)
  - [ ] Emit achievement check events
  - [ ] Support incremental achievements
  - [ ] Support one-time achievements
  - [ ] Test edge cases (already unlocked, etc.)

#### Social Integration

- [ ] **Gang Integration** (if feature involves gangs)
  - [ ] Check gang membership
  - [ ] Verify gang permissions/ranks
  - [ ] Update gang stats/resources
  - [ ] Distribute member rewards
  - [ ] Emit gang events

- [ ] **Friend Integration** (if feature involves friends)
  - [ ] Check friend relationships
  - [ ] Support friend lists
  - [ ] Trigger notifications
  - [ ] Update social stats

- [ ] **Notification Integration** (if feature needs notifications)
  - [ ] Create notification records
  - [ ] Support different notification types
  - [ ] Include relevant metadata
  - [ ] Test notification delivery

### Phase 3: Testing

#### Unit Tests

- [ ] **Service Tests**
  - [ ] Test service methods in isolation
  - [ ] Mock external dependencies
  - [ ] Test error cases
  - [ ] Test edge cases
  - [ ] Achieve >80% code coverage

#### Integration Tests

- [ ] **Direct Integration Tests**
  - [ ] Test feature → dependency flow
  - [ ] Test dependency → feature flow
  - [ ] Test bidirectional flows
  - [ ] Test with real database
  - [ ] Test transaction rollbacks

- [ ] **Cross-System Tests**
  - [ ] Test multi-system chains (e.g., combat → gold → quest → legacy)
  - [ ] Test event propagation
  - [ ] Test concurrent operations
  - [ ] Test race conditions
  - [ ] Test deadlock scenarios

- [ ] **Resource Tests**
  - [ ] Test resource gains
  - [ ] Test resource costs
  - [ ] Test resource limits
  - [ ] Test resource transfers
  - [ ] Test resource rollbacks

#### Health Check Tests

- [ ] **Integration Health**
  - [ ] Add feature to dependency graph
  - [ ] Test health check passes
  - [ ] Test data flow verification
  - [ ] Test failure detection
  - [ ] Test recovery procedures

### Phase 4: Documentation

- [ ] **Code Documentation**
  - [ ] Add JSDoc comments to service methods
  - [ ] Document integration points
  - [ ] Document event emissions
  - [ ] Document error cases
  - [ ] Document transaction requirements

- [ ] **Integration Map Updates**
  - [ ] Update `SYSTEM_INTEGRATION_MAP.md`
  - [ ] Add new system to overview
  - [ ] Add dependency graph entries
  - [ ] Add data flow diagrams
  - [ ] Add event chain documentation

- [ ] **API Documentation**
  - [ ] Document new endpoints
  - [ ] Document request/response formats
  - [ ] Document error responses
  - [ ] Add usage examples
  - [ ] Update Swagger/OpenAPI specs

### Phase 5: Deployment

- [ ] **Pre-Deployment**
  - [ ] Run full integration test suite
  - [ ] Run health check report
  - [ ] Review integration logs
  - [ ] Verify no breaking changes
  - [ ] Create rollback plan

- [ ] **Deployment**
  - [ ] Deploy database migrations first (if any)
  - [ ] Deploy backend code
  - [ ] Verify health checks pass
  - [ ] Monitor error rates
  - [ ] Monitor integration latency

- [ ] **Post-Deployment**
  - [ ] Run smoke tests
  - [ ] Verify event propagation
  - [ ] Check integration health
  - [ ] Monitor for errors
  - [ ] Review logs for issues

---

## Common Integration Pitfalls

### 1. Missing Transaction Management

**Problem**: Updates to multiple systems are not atomic
**Symptom**: Partial updates after errors
**Solution**: Always use MongoDB transactions for multi-system updates

```typescript
// ❌ BAD - No transaction
await GoldService.addGold(charId, 100, source);
await Character.findByIdAndUpdate(charId, { $inc: { experience: 50 } });
// If second call fails, gold is already added!

// ✅ GOOD - With transaction
const session = await mongoose.startSession();
await session.startTransaction();
try {
  await GoldService.addGold(charId, 100, source, {}, session);
  await Character.findByIdAndUpdate(charId,
    { $inc: { experience: 50 } },
    { session }
  );
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 2. Circular Dependencies

**Problem**: Two services import each other
**Symptom**: `undefined` errors, import failures
**Solution**: Use dynamic imports for circular dependencies

```typescript
// ❌ BAD - Direct circular import
import { QuestService } from './quest.service';

export class CombatService {
  static async victory() {
    QuestService.onEnemyDefeated(); // May be undefined!
  }
}

// ✅ GOOD - Dynamic import
export class CombatService {
  static async victory() {
    const { QuestService } = await import('./quest.service');
    await QuestService.onEnemyDefeated();
  }
}
```

### 3. Swallowing Integration Errors

**Problem**: Feature completes but integration silently fails
**Symptom**: Quests don't update, legacy stats wrong, no notifications
**Solution**: Log errors but don't fail the main action

```typescript
// ❌ BAD - Silent failure
try {
  await QuestService.onGoldEarned(charId, amount);
} catch (error) {
  // Nothing - error is lost!
}

// ✅ GOOD - Log but continue
try {
  await QuestService.onGoldEarned(charId, amount);
} catch (error) {
  logger.error('Failed to update quest progress for gold earned:', error);
  // Feature continues, integration failure is logged
}
```

### 4. Not Using Event System

**Problem**: Tightly coupled systems, missing updates
**Symptom**: Some systems don't get notified of changes
**Solution**: Use SystemEventService for cross-system notifications

```typescript
// ❌ BAD - Direct coupling
await QuestService.onEnemyDefeated(charId, npcType);
await AchievementService.checkCombatAchievements(charId);
await LegacyService.incrementKills(userId);
await ReputationService.updateFromCombat(charId, npcType);
// Must remember all systems!

// ✅ GOOD - Event dispatch
await SystemEventService.emitCombatVictory(charId, {
  npcId,
  goldEarned,
  xpEarned,
  isBoss
});
// Event routes to all interested systems automatically
```

### 5. Forgetting Legacy Tracking

**Problem**: Player actions don't update legacy stats
**Symptom**: Milestones never complete, bonuses don't unlock
**Solution**: Emit legacy events for all trackable actions

```typescript
// ❌ BAD - No legacy tracking
await GoldService.addGold(charId, 100, source);
// Legacy never knows gold was earned!

// ✅ GOOD - Emit event for legacy
await GoldService.addGold(charId, 100, source);
// GoldService emits GOLD_EARNED event
// SystemEventService routes to LegacyService
// Legacy stats updated automatically
```

### 6. Not Handling Session in Service Calls

**Problem**: Service ignores session, breaks transaction
**Symptom**: Transaction errors, partial updates
**Solution**: Always pass session to external services

```typescript
// ❌ BAD - No session passed
const session = await mongoose.startSession();
await session.startTransaction();
await GoldService.addGold(charId, 100, source); // No session!
await character.save({ session });
// Gold service doesn't participate in transaction!

// ✅ GOOD - Pass session
const session = await mongoose.startSession();
await session.startTransaction();
await GoldService.addGold(charId, 100, source, {}, session); // ✅
await character.save({ session });
// All operations in same transaction
```

### 7. Missing Quest Integration

**Problem**: Feature doesn't trigger quest objectives
**Symptom**: Players report quests stuck/not completing
**Solution**: Call appropriate QuestService methods

```typescript
// ❌ BAD - No quest integration
async function completeHeist(charId) {
  await GoldService.addGold(charId, 500, TransactionSource.CRIME);
  // Quests requiring "commit 5 heists" never progress!
}

// ✅ GOOD - Trigger quest check
async function completeHeist(charId) {
  await GoldService.addGold(charId, 500, TransactionSource.CRIME);
  await QuestService.onCrimeCompleted(charId, 'heist');
  // Quest objectives update correctly
}
```

### 8. Race Conditions in Async Operations

**Problem**: Multiple async operations on same resource
**Symptom**: Inconsistent state, test flakiness
**Solution**: Await all operations, use proper ordering

```typescript
// ❌ BAD - Race condition
Promise.all([
  GoldService.addGold(charId, 100, source),
  Character.findByIdAndUpdate(charId, { $inc: { level: 1 } })
]);
// Character.gold and database gold may be out of sync!

// ✅ GOOD - Sequential where needed
await GoldService.addGold(charId, 100, source);
// GoldService updates character.gold
const character = await Character.findById(charId);
await character.save(); // Now safe to save other changes
```

### 9. Not Testing Integration Health

**Problem**: Integration broken but not detected
**Symptom**: Silent failures in production
**Solution**: Add health checks and run regularly

```typescript
// ✅ GOOD - Regular health checks
// In server startup
const health = await IntegrationHealthChecker.generateHealthReport();
if (health.overall === 'critical') {
  logger.error('Critical integration issues detected!', health.summary);
  throw new Error('Cannot start server with critical integration issues');
}

// In monitoring cron job
setInterval(async () => {
  const health = await IntegrationHealthChecker.checkAllSystems();
  const degraded = health.filter(h => h.status !== 'healthy');
  if (degraded.length > 0) {
    logger.warn('Degraded systems detected:', degraded);
  }
}, 3600000); // Hourly
```

### 10. Missing Rollback Procedures

**Problem**: No way to undo changes after partial failure
**Symptom**: Data corruption, stuck states
**Solution**: Use transactions and plan rollback strategies

```typescript
// ✅ GOOD - Transaction with rollback
const session = await mongoose.startSession();
await session.startTransaction();

try {
  const result = await performComplexOperation(session);
  await session.commitTransaction();
  return result;
} catch (error) {
  await session.abortTransaction();
  logger.error('Operation failed, rolled back:', error);
  throw error;
} finally {
  session.endSession();
}
```

---

## Testing Requirements

### Integration Test Checklist

- [ ] **Happy Path Tests**
  - [ ] Basic feature functionality
  - [ ] Expected integrations trigger
  - [ ] Data flows correctly
  - [ ] Events emit correctly

- [ ] **Error Path Tests**
  - [ ] Handle missing dependencies
  - [ ] Handle service failures
  - [ ] Handle database errors
  - [ ] Handle transaction rollbacks

- [ ] **Edge Case Tests**
  - [ ] Boundary values (0, max, negative)
  - [ ] Empty/null inputs
  - [ ] Concurrent operations
  - [ ] Race conditions

- [ ] **Performance Tests**
  - [ ] Integration doesn't slow feature
  - [ ] No N+1 queries
  - [ ] Proper indexing
  - [ ] Acceptable latency

- [ ] **Event Tests**
  - [ ] Events emit at right time
  - [ ] Events have correct data
  - [ ] Events route to correct systems
  - [ ] Event failures don't break feature

### Test Coverage Requirements

- **Service Methods**: >80% coverage
- **Integration Points**: 100% coverage
- **Critical Paths**: 100% coverage
- **Error Handling**: >90% coverage

---

## Rollback Procedures

### Integration Failure Rollback

If integration fails in production:

1. **Identify Failure Scope**
   - Run `IntegrationHealthChecker.generateHealthReport()`
   - Check error logs for integration errors
   - Identify affected systems

2. **Assess Impact**
   - Are users affected?
   - Is data corrupted?
   - Are critical systems down?

3. **Immediate Actions**
   - If critical: Rollback deployment
   - If non-critical: Disable feature flag
   - Notify team and stakeholders

4. **Rollback Deployment**
   ```bash
   # Rollback to previous version
   git revert <commit-hash>
   git push origin master

   # Or rollback to tag
   git checkout <previous-tag>
   npm run deploy

   # Run health check
   curl http://localhost:3000/api/health/integration
   ```

5. **Verify Rollback**
   - Run integration tests
   - Check health report
   - Verify affected systems recovered
   - Monitor error rates

6. **Root Cause Analysis**
   - Review integration logs
   - Identify what failed
   - Determine why it failed
   - Plan fix

7. **Fix and Redeploy**
   - Implement fix
   - Add regression test
   - Test thoroughly
   - Deploy with monitoring

---

## Integration Health Monitoring

### Health Check Schedule

- **On Server Start**: Full health check
- **Hourly**: Quick system check
- **After Deployment**: Comprehensive check
- **On Error Spike**: Targeted check

### Health Check Endpoints

```typescript
// GET /api/health/integration
// Returns comprehensive health report
{
  overall: 'healthy' | 'degraded' | 'critical',
  systems: [...],
  dataFlows: {...},
  summary: {...}
}

// GET /api/health/system/:systemName
// Returns health for specific system
{
  system: 'combat',
  status: 'healthy',
  dependencies: [...],
  lastCheck: '2024-01-15T10:30:00Z'
}
```

### Alert Thresholds

- **Critical**: Required system down
- **High**: Multiple systems degraded
- **Medium**: Single non-critical system down
- **Low**: High latency detected

---

## Pre-Deployment Checklist

Before deploying any new feature:

- [ ] All integration tests pass
- [ ] Health check reports "healthy"
- [ ] No new deprecation warnings
- [ ] Integration map updated
- [ ] API documentation updated
- [ ] Rollback plan documented
- [ ] Team notified of changes
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Performance baselines recorded

---

## Post-Deployment Monitoring

For 24 hours after deployment:

- [ ] Monitor error rates (should be <0.1%)
- [ ] Monitor integration latency (should be <100ms)
- [ ] Check health reports hourly
- [ ] Review integration logs
- [ ] Monitor resource usage
- [ ] Check for memory leaks
- [ ] Verify event propagation
- [ ] Validate data flows
- [ ] Check user reports
- [ ] Verify rollback plan works

---

## Integration Best Practices

### DO:
✅ Use transactions for multi-system updates
✅ Emit events for cross-system notifications
✅ Log integration points for debugging
✅ Handle integration errors gracefully
✅ Test integrations thoroughly
✅ Document integration points
✅ Monitor integration health
✅ Plan rollback procedures

### DON'T:
❌ Skip transaction management
❌ Swallow integration errors
❌ Tightly couple systems
❌ Forget legacy tracking
❌ Ignore quest integration
❌ Skip health checks
❌ Deploy without testing
❌ Forget to document

---

## Getting Help

If you encounter integration issues:

1. **Check Documentation**
   - Review `SYSTEM_INTEGRATION_MAP.md`
   - Check service JSDoc comments
   - Read error messages carefully

2. **Run Diagnostics**
   ```typescript
   // Check integration health
   const health = await IntegrationHealthChecker.generateHealthReport();
   console.log(health);

   // Check specific integration
   const isHealthy = await IntegrationHealthChecker.isIntegrationHealthy(
     SystemName.COMBAT,
     SystemName.GOLD
   );

   // View dependency graph
   const deps = IntegrationHealthChecker.getDependencyGraph();
   console.log(deps);
   ```

3. **Review Logs**
   - Check application logs for integration errors
   - Look for transaction rollbacks
   - Find event dispatch failures

4. **Ask Team**
   - Post in #development channel
   - Tag relevant system owners
   - Include error logs and diagnostics

---

Last Updated: Phase 15, Wave 15.2
