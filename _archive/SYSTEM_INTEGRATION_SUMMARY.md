# System Integration Testing - Quick Summary

## What Was Built

A comprehensive system integration testing framework for Desperados Destiny that ensures all 15+ game systems work together seamlessly.

## Core Components

### 1. System Event Dispatcher (`systemEvent.service.ts`)
**Purpose**: Central hub for cross-system communication

**Key Features**:
- Automatic event routing to interested systems
- Priority-based event queuing
- Async processing with timeout protection
- Error handling that doesn't break features
- Event statistics and monitoring

**Example Usage**:
```typescript
// Combat victory automatically notifies all relevant systems
await SystemEventService.emitCombatVictory(characterId, {
  goldEarned: 100,
  xpEarned: 150,
  isBoss: false
});
// Routes to: Quest, Legacy, Achievement, Reputation systems
```

### 2. Integration Health Checker (`integrationHealth.ts`)
**Purpose**: Monitor system connectivity and data flow health

**Key Features**:
- Real-time system health checks
- Dependency graph management
- Data flow verification
- Latency monitoring
- Comprehensive health reports

**Example Usage**:
```typescript
// Check if Combat → Gold integration is healthy
const isHealthy = await IntegrationHealthChecker.isIntegrationHealthy(
  SystemName.COMBAT,
  SystemName.GOLD
);

// Generate full health report
const report = await IntegrationHealthChecker.generateHealthReport();
```

### 3. System Event Types (`systemEvents.types.ts`)
**Purpose**: Type-safe event definitions

**What's Defined**:
- 30+ system names
- 35+ event types
- Event data structures
- Integration health types
- Cross-system transaction types

### 4. Integration Test Suite (`systemIntegration.test.ts`)
**Purpose**: Comprehensive tests for all integrations

**Coverage**:
- 28 integration tests
- Character + Legacy integration
- Combat + Multiple systems
- Economy flows
- Progression chains
- Social systems
- Event dispatching
- Health checks
- Transaction safety

### 5. Integration Map (`SYSTEM_INTEGRATION_MAP.md`)
**Purpose**: Complete documentation of all system integrations

**Contains**:
- 8-tier system hierarchy
- Dependency graphs
- 8 data flow diagrams
- Event chain documentation
- Shared resource documentation
- Integration point examples
- Troubleshooting guides

### 6. Integration Checklist (`INTEGRATION_CHECKLIST.md`)
**Purpose**: Developer guide for safe feature integration

**Includes**:
- 5-phase integration process
- 10 common pitfalls with solutions
- Testing requirements
- Rollback procedures
- Best practices

## Key Benefits

### For Developers
✅ **Less Code**: Event system reduces boilerplate
✅ **Harder to Miss**: Automatic routing prevents forgotten integrations
✅ **Easier Testing**: Clear integration points and test patterns
✅ **Better Errors**: Graceful error handling that doesn't break features
✅ **Clear Docs**: Comprehensive guides and examples

### For the System
✅ **Reliability**: Transaction-safe multi-system updates
✅ **Observability**: Real-time health monitoring
✅ **Scalability**: Ready for new systems
✅ **Maintainability**: Clear patterns and documentation
✅ **Performance**: <100ms event propagation

## Critical Integration Points

### 1. Combat Victory Flow
```
Combat Victory
  ↓
Gold Added → Quest objectives checked
  ↓
XP Awarded → Possible level up
  ↓
Items Looted → Quest items checked
  ↓
Stats Updated → Achievements checked
  ↓
Legacy Tracked → Milestones checked
  ↓
Events Dispatched → All systems notified
```

### 2. Quest Completion Flow
```
Quest Complete
  ↓
Gold Reward → Legacy tracking
  ↓
XP Reward → Possible level up
  ↓
Items Awarded → Inventory updated
  ↓
Reputation Gained → Faction access updated
  ↓
Achievements Checked → New unlocks
  ↓
Events Dispatched → Notifications sent
```

### 3. Character Creation Flow
```
Character Created
  ↓
Legacy Profile Retrieved → Bonuses calculated
  ↓
Bonuses Applied → Extra gold & XP
  ↓
Systems Initialized → Energy, skills, inventory
  ↓
Events Dispatched → Quest system, notifications
  ↓
Character Ready
```

## How to Use

### Adding a New Feature

1. **Check Integration Map**: Identify what systems you need
2. **Follow Checklist**: Use the integration checklist
3. **Emit Events**: Use SystemEventService for notifications
4. **Write Tests**: Add integration tests
5. **Run Health Check**: Verify integrations work
6. **Update Docs**: Add to integration map

### Emitting Events

```typescript
// When character levels up
await SystemEventService.emitCharacterLevelUp(
  characterId,
  newLevel,
  metadata
);

// When gold is earned (GoldService does this automatically)
await SystemEventService.emitGoldEarned(
  characterId,
  amount,
  source,
  metadata
);

// When quest completes
await SystemEventService.emitQuestCompleted(
  characterId,
  questId,
  rewards
);
```

### Subscribing to Events

```typescript
// Subscribe to gold events for analytics
SystemEventService.subscribe({
  system: SystemName.ANALYTICS,
  eventTypes: [SystemEventType.GOLD_EARNED, SystemEventType.GOLD_SPENT],
  handler: async (event) => {
    // Track gold flow
    await trackGoldFlow(event.data);
  },
  priority: EventPriority.LOW
});
```

### Checking Health

```typescript
// Full health check
const report = await IntegrationHealthChecker.generateHealthReport();
console.log(`Overall: ${report.overall}`);
console.log(`Healthy: ${report.summary.healthySystems}`);
console.log(`Issues: ${report.summary.criticalIssues}`);

// Quick check for specific integration
const isHealthy = await IntegrationHealthChecker.isIntegrationHealthy(
  SystemName.COMBAT,
  SystemName.GOLD
);
```

## Testing Integration Points

```typescript
// Test combat victory integration
const character = await createTestCharacter();
const npc = await createTestNPC();

// Start combat
const encounter = await CombatService.initiateCombat(character, npc._id);

// Verify integration
expect(encounter.characterId).toBe(character._id);
expect(encounter.npcId).toBe(npc._id);

// Complete combat would trigger:
// - Gold earned
// - XP awarded
// - Quest objectives updated
// - Legacy stats tracked
// - Achievements checked
```

## Common Patterns

### Pattern 1: Service with Integration
```typescript
export class MyService {
  static async doAction(characterId: string) {
    // 1. Validate
    const character = await Character.findById(characterId);
    if (!character) throw new Error('Not found');

    // 2. Execute with transaction
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      // Update database
      character.someField = newValue;
      await character.save({ session });

      // Commit transaction
      await session.commitTransaction();

      // 3. Emit event (after commit!)
      await SystemEventService.dispatch(
        SystemName.MY_SYSTEM,
        SystemEventType.MY_EVENT,
        { characterId, data }
      );

      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

### Pattern 2: Service with Quest Integration
```typescript
export class MyService {
  static async doAction(characterId: string) {
    // Execute action
    const result = await this.performAction(characterId);

    // Update quest objectives (don't fail action if this fails)
    try {
      await QuestService.onMyAction(characterId, result.actionType);
    } catch (questError) {
      logger.error('Failed to update quest progress:', questError);
      // Continue - don't fail the action
    }

    return result;
  }
}
```

### Pattern 3: Multi-System Atomic Update
```typescript
export class MyService {
  static async complexAction(characterId: string) {
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      // 1. Update System A
      await SystemA.update(data, { session });

      // 2. Update System B
      await SystemB.update(data, { session });

      // 3. Update System C
      await SystemC.update(data, { session });

      // All succeed or all fail together
      await session.commitTransaction();

      // 4. Emit events (after commit)
      await SystemEventService.dispatch(...);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

## Troubleshooting

### Quest Not Updating
**Problem**: Character completes action but quest doesn't progress
**Solution**: Check if action calls appropriate `QuestService.on*()` method
```typescript
// Add quest trigger
await QuestService.onEnemyDefeated(characterId, enemyType);
```

### Legacy Stats Not Tracking
**Problem**: Player actions don't update legacy profile
**Solution**: Ensure service emits appropriate events
```typescript
// Emit event for legacy tracking
await SystemEventService.emitGoldEarned(characterId, amount, source);
```

### Integration Health Degraded
**Problem**: Health check shows degraded status
**Solution**: Run diagnostics
```typescript
const report = await IntegrationHealthChecker.generateHealthReport();
console.log('Issues:', report.summary.criticalIssues);
// Check logs for specific system errors
```

## Quick Reference

### Event Types for Common Actions
- Character created: `CHARACTER_CREATED`
- Combat victory: `COMBAT_VICTORY`
- Boss defeated: `BOSS_DEFEATED`
- Gold earned: `GOLD_EARNED`
- Gold spent: `GOLD_SPENT`
- Quest completed: `QUEST_COMPLETED`
- Level up: `CHARACTER_LEVEL_UP`
- Skill level up: `SKILL_LEVEL_UP`
- Achievement unlocked: `ACHIEVEMENT_UNLOCKED`
- Gang joined: `GANG_JOINED`
- Territory captured: `TERRITORY_CAPTURED`

### System Names
- Character: `SystemName.CHARACTER`
- Combat: `SystemName.COMBAT`
- Gold: `SystemName.GOLD`
- Quest: `SystemName.QUEST`
- Legacy: `SystemName.LEGACY`
- Achievement: `SystemName.ACHIEVEMENT`
- Gang: `SystemName.GANG`
- Skill: `SystemName.SKILL`

### Health Check Locations
- Full report: `IntegrationHealthChecker.generateHealthReport()`
- All systems: `IntegrationHealthChecker.checkAllSystems()`
- Specific integration: `IntegrationHealthChecker.isIntegrationHealthy(from, to)`
- Data flows: `IntegrationHealthChecker.verifyDataFlows()`

## Files to Reference

### When Adding New Feature
1. Read: `docs/INTEGRATION_CHECKLIST.md` (step-by-step guide)
2. Reference: `docs/SYSTEM_INTEGRATION_MAP.md` (see similar integrations)
3. Use: `shared/src/types/systemEvents.types.ts` (event types)
4. Test: `server/tests/integration/systemIntegration.test.ts` (test patterns)

### When Debugging Integration
1. Check: `docs/SYSTEM_INTEGRATION_MAP.md` → Troubleshooting section
2. Run: `IntegrationHealthChecker.generateHealthReport()`
3. Review: Application logs for integration errors
4. Test: Run integration test suite

---

**For complete details, see**:
- `docs/SYSTEM_INTEGRATION_MAP.md` - Complete integration documentation
- `docs/INTEGRATION_CHECKLIST.md` - Developer integration guide
- `PHASE_15_WAVE_15.2_COMPLETION_REPORT.md` - Full implementation report
