# Integration Tests - Desperados Destiny

This directory contains comprehensive integration tests for the complete game loop.

## Test Structure

### Test Files

1. **gameLoop.integration.test.ts** - Complete player journey tests
   - Character creation → skill training → actions → rewards → progression
   - 40+ test scenarios covering the full game experience

2. **destinyDeck.integration.test.ts** - Card mechanics and hand evaluation
   - Deck creation, shuffling, drawing
   - All 10 poker hand ranks
   - Skill bonuses and suit scoring
   - 30+ tests ensuring fair card distribution

3. **energy.integration.test.ts** - Energy system validation
   - Energy deduction on actions
   - Regeneration over time (free vs premium)
   - Transaction safety for concurrent actions
   - 25+ tests covering all energy scenarios

4. **skills.integration.test.ts** - Skill training and progression
   - Training start/cancel/complete flows
   - XP and leveling mechanics
   - Offline progression
   - Skill bonuses to action resolution
   - 30+ tests

5. **performance.integration.test.ts** - System performance under load
   - 100+ concurrent actions
   - Response time benchmarks
   - Memory usage validation
   - 15+ performance tests

6. **apiContracts.test.ts** - Type safety and API contracts
   - Validates all endpoints match shared TypeScript types
   - Ensures frontend/backend consistency
   - 20+ contract validation tests

## Running Tests

### Run All Integration Tests
```bash
npm run test:integration
```

### Run Specific Test File
```bash
npm test -- gameLoop.integration.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Helpers

Located in `server/tests/helpers/`:

- **testHelpers.ts** - Game-specific helpers
  - `TimeSimulator` - Mock time for training/energy tests
  - `createTestDeck()` - Predictable card generation
  - `createRoyalFlush()`, `createPair()`, etc. - Hand creators
  - `setupCompleteGameState()` - Full user/character setup
  - `calculateExpectedEnergy()` - Energy math helpers

- **api.helpers.ts** - HTTP request helpers
  - `apiGet()`, `apiPost()`, `apiPatch()`, `apiDelete()`
  - `expectSuccess()`, `expectError()`, `expectValidationError()`

- **auth.helpers.ts** - Authentication helpers
  - `createTestToken()` - JWT generation
  - `createTestUserWithPassword()` - User creation

- **db.helpers.ts** - Database helpers
  - `clearDatabase()` - Clean slate between tests
  - `clearCollection()` - Clear specific collection

## Test Data Setup

### Before Each Test
```typescript
beforeEach(async () => {
  await clearDatabase();
  timeSimulator = new TimeSimulator();
});
```

### After Each Test
```typescript
afterEach(() => {
  timeSimulator.restore();
});
```

## Common Test Patterns

### Testing Complete Game Loop
```typescript
it('should complete full player journey', async () => {
  const { token, character } = await setupCompleteGameState(app);

  // Perform action
  const res = await apiPost(
    app,
    '/api/actions/challenge',
    { actionId: 'pick-lock', characterId: character._id },
    token
  );

  expectSuccess(res);
  expect(res.body.data.hand).toHaveLength(5);
});
```

### Testing Skill Training
```typescript
it('should complete training after time elapsed', async () => {
  const { token, character } = await setupCompleteGameState(app);

  const skillsRes = await apiGet(app, '/api/skills', token);
  const skill = skillsRes.body.data.skills[0];

  const startRes = await apiPost(
    app,
    '/api/skills/train',
    { skillId: skill.id, characterId: character._id },
    token
  );

  const completesAt = new Date(startRes.body.data.currentTraining.completesAt).getTime();

  // Simulate time passing
  timeSimulator.setTime(completesAt + 1000);

  const completeRes = await apiPost(app, '/api/skills/complete', {}, token);
  expectSuccess(completeRes);
});
```

### Testing Energy Regeneration
```typescript
it('should regenerate energy over time', async () => {
  const { token, character } = await setupCompleteGameState(app);

  // Use energy
  await apiPost(
    app,
    '/api/actions/challenge',
    { actionId: 'basic-action', characterId: character._id },
    token
  );

  const afterActionRes = await apiGet(app, `/api/characters/${character._id}`, token);
  const energyAfterAction = afterActionRes.body.data.character.energy;

  // Simulate 1 hour passing
  timeSimulator.advanceHours(1);

  const afterRegenRes = await apiGet(app, `/api/characters/${character._id}`, token);
  const energyAfterRegen = afterRegenRes.body.data.character.energy;

  expect(energyAfterRegen).toBeGreaterThan(energyAfterAction);
});
```

## Mocking Strategies

### Time Simulation
```typescript
const timeSimulator = new TimeSimulator();
timeSimulator.advanceHours(2);  // Fast-forward 2 hours
timeSimulator.restore();         // Reset to real time
```

### Predictable Card Hands
```typescript
const royalFlush = createRoyalFlush(Suit.SPADES);
const evaluation = evaluateHand(royalFlush);
expect(evaluation.rank).toBe(HandRank.ROYAL_FLUSH);
```

## Test Isolation

Each test runs in complete isolation:
- Fresh MongoDB instance (mongodb-memory-server)
- Database cleared between tests
- No shared state between tests
- Parallel execution safe

## Skipped Tests

Tests marked with `.skip()` are waiting for implementations:
- Agent 1: Destiny Deck Action Backend
- Agent 2: Destiny Deck UI & Card Animations
- Agent 3: Energy Cost System
- Agent 4: Skill Training Backend
- Agent 5: Skill Training UI

Remove `.skip()` once implementations are complete.

## Critical Tests

These tests MUST pass before Sprint 3 completion:

1. ✅ Complete game loop works end-to-end
2. ✅ Energy deduction is transaction-safe
3. ✅ Skill bonuses apply correctly to Destiny Deck
4. ✅ Offline skill training works
5. ✅ Multi-user isolation (no crosstalk)
6. ✅ Race conditions prevented
7. ✅ All API contracts match shared types
8. ✅ No data leaks between users
9. ✅ Premium vs free player differences work
10. ✅ Card drawing is fair (no bias)

## Debugging Failed Tests

### Enable Verbose Logging
```bash
LOG_LEVEL=debug npm test
```

### Run Single Test
```bash
npm test -- -t "should complete full player journey"
```

### Inspect Database State
```typescript
it('should do something', async () => {
  const { character } = await setupCompleteGameState(app);

  // Add debugging
  console.log('Character state:', character);

  // ... rest of test
});
```

## Performance Benchmarks

Expected response times:
- `POST /api/actions/challenge`: < 500ms
- `GET /api/skills`: < 200ms
- `GET /api/characters`: < 200ms

Expected throughput:
- 100 concurrent actions: < 30 seconds
- 100 concurrent skill training starts: < 20 seconds

## Coverage Goals

- **Backend Integration**: 80%+ coverage
- **API Contracts**: 100% endpoint coverage
- **Critical Paths**: 100% coverage

## Adding New Integration Tests

1. Create test file in `server/tests/integration/`
2. Import necessary helpers
3. Follow existing test structure
4. Use `.skip()` if implementation not ready
5. Add descriptive test names
6. Document in this README

## Troubleshooting

### Tests Hanging
- Check for missing `await` keywords
- Verify database connection closed after tests
- Ensure timeSimulator.restore() called

### Flaky Tests
- Avoid relying on exact timings
- Use proper async/await patterns
- Clear database between tests

### Type Errors
- Ensure @desperados/shared is up to date
- Rebuild shared package if types changed
- Check import paths

## Contributing

When adding tests:
- Write clear, descriptive test names
- Test both success and error cases
- Verify multi-user isolation
- Test race conditions where applicable
- Document complex test scenarios
