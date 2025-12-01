# Implementation Roadmap
## Based on E2E Testing & Frontend Audit

**Date:** November 29, 2025
**Status:** Ready for Implementation

---

## 📋 Executive Summary

### Major Discovery
**The frontend is 90%+ complete!** The E2E tests showed 0% pass rate due to incorrect test selectors, NOT missing features.

### Actual State
- ✅ **37 game pages implemented** and functional
- ✅ **Actions system** fully working (deck-based mini-games)
- ✅ **Location system** fully working (buildings, travel, jobs, shops, NPCs)
- ✅ **Backend integration** solid and tested
- ❌ **E2E tests** need selector fixes

### Priority Order
1. 🔴 **CRITICAL:** Fix E2E test selectors (30 min)
2. 🟠 **HIGH:** Add data-testid attributes to UI (1 hour)
3. 🟡 **MEDIUM:** Improve test coverage & documentation (2 hours)
4. 🟢 **LOW:** Add nice-to-have features (ongoing)

---

## 🔴 CRITICAL - Fix E2E Tests (Est: 30 minutes)

### Task 1: Fix Location Navigation Selector
**File:** `client/tests/playtests/comprehensive/AllLocationsE2E.ts`

**Line 132:** Change search term from plural to singular
```typescript
// CURRENT (WRONG):
return text.includes('locations') || text.includes('map') || text.includes('travel');

// FIXED:
return text.includes('location') || text.includes('map') || text.includes('travel');
//                    ^^^^^^^^ Changed to singular
```

### Task 2: Verify Actions Navigation Selector
**File:** `client/tests/playtests/comprehensive/AllActionsE2E.ts`

**Line 134:** Already correct, but can optimize
```typescript
// CURRENT (works but has false alternatives):
return text.includes('actions') || text.includes('crimes') || text.includes('activities');

// OPTIMIZED:
return text.includes('action');  // Matches both "Action" and "Actions"
```

### Task 3: Update Default Route Expectation
**Both test files:** After character selection, expect redirect to `/game/location`

```typescript
// After selectCharacter():
await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
// Should now be at /game/location automatically
```

### Task 4: Re-run Tests
```bash
cd client
npm run test:comprehensive:e2e
```

**Expected Result After Fix:**
- Navigation: ✅ Should find "Location" and "Actions" links
- Still may show 0 locations/actions because:
  - Location page shows buildings/connected locations (not all 30 locations)
  - Actions page shows location-specific actions (not all 46 actions)

---

## 🟠 HIGH PRIORITY - Add Test IDs (Est: 1 hour)

### Why This Matters
Data attributes make E2E tests:
- More reliable (don't break when CSS changes)
- Easier to write
- Faster to execute
- Better documented

### Task 1: Add Building Test IDs

**File:** `client/src/pages/Location.tsx`
**Line 412:** Add data-testid to building buttons

```tsx
// CURRENT:
<button
  key={building.id}
  onClick={() => setSelectedBuilding(building)}
  className={`${config.color} border rounded-lg ...`}
>

// ADD:
<button
  key={building.id}
  data-testid={`building-${building.id}`}
  data-building-name={building.name}
  data-building-type={building.type}
  onClick={() => setSelectedBuilding(building)}
  className={`${config.color} border rounded-lg ...`}
>
```

### Task 2: Add Travel Destination Test IDs

**File:** `client/src/pages/Location.tsx`
**Line 650:** Add data-testid to travel cards

```tsx
// ADD after key={dest._id}:
data-testid={`travel-${dest._id}`}
data-location-name={dest.name}
data-location-type={dest.type}
```

### Task 3: Add Action Test IDs

**File:** `client/src/pages/Actions.tsx`
**Line 374:** Add data-testid to action cards

```tsx
// CURRENT:
<div
  key={action.id}
  className={`p-4 bg-wood-grain/10 rounded ...`}
  onClick={() => setSelectedAction(action)}
>

// ADD:
<div
  key={action.id}
  data-testid={`action-${action.id}`}
  data-action-name={action.name}
  data-action-category={action.type}
  data-action-difficulty={action.difficulty}
  className={`p-4 bg-wood-grain/10 rounded ...`}
  onClick={() => setSelectedAction(action)}
>
```

### Task 4: Add Action Button Test ID

**File:** `client/src/pages/Actions.tsx`
**Line 417:** Add data-testid to attempt button

```tsx
<Button
  data-testid={`action-button-${action.id}`}
  size="sm"
  variant={unlocked ? 'primary' : 'ghost'}
  onClick={(e) => {
    e.stopPropagation();
    handleAttemptAction(action);
  }}
>
```

### Task 5: Update E2E Tests to Use Data Attributes

**File:** `client/tests/playtests/comprehensive/AllLocationsE2E.ts`

```typescript
// NEW: Extract buildings using data attributes
const buildings = await this.page.evaluate(() => {
  const buildingEls = document.querySelectorAll('[data-testid^="building-"]');
  return Array.from(buildingEls).map(el => ({
    id: el.getAttribute('data-testid')?.replace('building-', ''),
    name: el.getAttribute('data-building-name') || '',
    type: el.getAttribute('data-building-type') || 'unknown'
  }));
});

// NEW: Extract travel destinations using data attributes
const locations = await this.page.evaluate(() => {
  const travelEls = document.querySelectorAll('[data-testid^="travel-"]');
  return Array.from(travelEls).map(el => ({
    id: el.getAttribute('data-testid')?.replace('travel-', ''),
    name: el.getAttribute('data-location-name') || '',
    type: el.getAttribute('data-location-type') || 'unknown'
  }));
});
```

**File:** `client/tests/playtests/comprehensive/AllActionsE2E.ts`

```typescript
// NEW: Extract actions using data attributes
const actions = await this.page.evaluate(() => {
  const actionEls = document.querySelectorAll('[data-testid^="action-"]');
  return Array.from(actionEls).map(el => ({
    id: el.getAttribute('data-testid')?.replace('action-', ''),
    name: el.getAttribute('data-action-name') || '',
    category: el.getAttribute('data-action-category') || 'unknown'
  }));
});

// NEW: Click action using data attribute
const clicked = await this.page.evaluate((actionId) => {
  const button = document.querySelector(`[data-testid="action-button-${actionId}"]`);
  if (button) {
    (button as HTMLElement).click();
    return true;
  }
  return false;
}, actionId);
```

---

## 🟡 MEDIUM PRIORITY - Improve Test Coverage (Est: 2 hours)

### Task 1: Update Test Expectations

**Current Problem:** Tests expect to find all 30 locations and all 46 actions in one view

**Reality:**
- Location page shows buildings at current location + connected locations only
- Actions page shows actions available at current location only

**Solution:** Update test flow

#### For Locations
```typescript
async testAllLocations() {
  const visited = new Set<string>();
  const queue = ['current']; // Start at current location

  while (queue.length > 0) {
    const locationId = queue.shift();

    // Get connected locations from this location
    const connected = await this.getConnectedLocations();

    // Test traveling to each connected location
    for (const dest of connected) {
      if (!visited.has(dest.id)) {
        await this.travelTo(dest.id);
        visited.add(dest.id);
        queue.push(dest.id);
      }
    }
  }

  return visited.size; // Number of locations discovered
}
```

#### For Actions
```typescript
async testAllActions() {
  // Travel to each location and collect actions
  const allActions = new Map<string, Action>();

  for (const location of this.visitedLocations) {
    await this.travelTo(location.id);
    const actions = await this.getActionsAtLocation();

    for (const action of actions) {
      allActions.set(action.id, action);
    }
  }

  return allActions.size; // Number of unique actions found
}
```

### Task 2: Add Building Entry Tests

```typescript
async testEnteringBuildings() {
  // At current location, get all buildings
  const buildings = await this.getAllBuildings();

  for (const building of buildings) {
    // Click building to open modal
    await this.clickBuilding(building.id);

    // Click "Enter Building" button
    await this.enterBuilding();

    // Verify we're inside (jobs, shops, NPCs visible)
    const insideBuilding = await this.verifyInsideBuilding();

    // Exit building
    await this.exitBuilding();

    this.results.push({
      building: building.name,
      accessible: insideBuilding
    });
  }
}
```

### Task 3: Add Action Execution Tests

```typescript
async testExecutingActions() {
  const actions = await this.getActionsAtLocation();

  for (const action of actions) {
    // Click "Attempt" button
    await this.clickAction(action.id);

    // Wait for deck game modal
    const deckGameAppeared = await this.waitForDeckGame();

    if (deckGameAppeared) {
      // Forfeit the game (don't actually play)
      await this.forfeitDeckGame();

      this.results.push({
        action: action.name,
        executable: true
      });
    } else {
      this.results.push({
        action: action.name,
        executable: false,
        error: 'Deck game did not appear'
      });
    }
  }
}
```

### Task 4: Add Job & Shop Tests

```typescript
async testJobsAndShops() {
  // Find a building with jobs (like Sheriff's Office)
  const building = await this.findBuildingWithJobs();

  if (building) {
    await this.enterBuilding(building.id);

    // Test performing a job
    const jobs = await this.getAvailableJobs();
    if (jobs.length > 0) {
      await this.performJob(jobs[0].id);
      // Verify job result appears
    }

    // Test shops
    const shops = await this.getAvailableShops();
    if (shops.length > 0) {
      await this.browseShop(shops[0].id);
      // Verify shop items appear
    }

    await this.exitBuilding();
  }
}
```

---

## 🟢 LOW PRIORITY - Nice-to-Have Features (Ongoing)

### Feature 1: Global Location Map

**Problem:** Users can't see all locations at once

**Solution:** Add `/game/map` page

**Benefits:**
- Better navigation
- Shows discovered vs. undiscovered locations
- Fast travel system
- Easier for E2E tests

**Estimated Effort:** 4-6 hours

#### Implementation
```tsx
// New file: client/src/pages/Map.tsx
export const Map: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());

  // Fetch all locations (discovered ones)
  useEffect(() => {
    api.get('/locations/discovered').then(res => {
      setLocations(res.data.data.locations);
      setDiscovered(new Set(res.data.data.discoveredIds));
    });
  }, []);

  return (
    <div className="map-container">
      <h1>Sangre Territory Map</h1>

      {/* Grid or visual map */}
      <div className="location-grid">
        {locations.map(loc => (
          <LocationCard
            key={loc.id}
            location={loc}
            isDiscovered={discovered.has(loc.id)}
            onTravel={() => travelTo(loc.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

**Backend Endpoint:**
```typescript
// server/src/routes/location.routes.ts
router.get('/discovered', requireAuth, async (req, res) => {
  // Return all locations player has visited
  const character = await Character.findById(req.character._id);
  const discoveredIds = character.discoveredLocations || [];

  const locations = await Location.find({
    _id: { $in: discoveredIds }
  });

  res.json({ success: true, data: { locations, discoveredIds } });
});
```

### Feature 2: Action Codex

**Problem:** Can't see all actions available in game

**Solution:** Add `/game/action-codex` page

**Benefits:**
- Players can browse all actions
- See locked/unlocked status
- Plan character progression
- Easier for E2E tests

**Estimated Effort:** 3-4 hours

#### Implementation
```tsx
// New file: client/src/pages/ActionCodex.tsx
export const ActionCodex: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    api.get('/actions/codex').then(res => {
      setActions(res.data.data.actions);
    });
  }, []);

  return (
    <div>
      <h1>Action Codex</h1>

      {/* Filter buttons */}
      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('unlocked')}>Unlocked</button>
        <button onClick={() => setFilter('locked')}>Locked</button>
      </div>

      {/* Action list with lock icons */}
      <div className="action-list">
        {actions
          .filter(a => filterAction(a, filter))
          .map(action => (
            <ActionCodexCard
              key={action.id}
              action={action}
              isUnlocked={checkUnlocked(action)}
            />
          ))}
      </div>
    </div>
  );
};
```

### Feature 3: Better Test Documentation

**Add:** `client/tests/playtests/README.md`

**Content:**
- How to run tests
- How to write new tests
- Test architecture explanation
- Common issues & solutions
- How to add test IDs to components

**Estimated Effort:** 1 hour

### Feature 4: Visual Regression Testing

**Tool:** Percy, Chromatic, or Playwright screenshots

**Benefits:**
- Catch visual bugs
- Ensure UI consistency
- Prevent regressions

**Estimated Effort:** 4-6 hours setup, ongoing maintenance

---

## 📊 Implementation Timeline

### Sprint 1: Fix E2E Tests (1 day)
- ✅ Fix navigation selectors (30 min)
- ✅ Add data-testid attributes (1 hour)
- ✅ Update test extraction logic (1 hour)
- ✅ Re-run tests and verify pass rate (30 min)
- ✅ Document test patterns (1 hour)
- ✅ Create test guide (1 hour)

**Expected Outcome:** 50-70% pass rate

### Sprint 2: Improve Test Coverage (2 days)
- ⏳ Add building entry tests (2 hours)
- ⏳ Add action execution tests (2 hours)
- ⏳ Add job/shop tests (2 hours)
- ⏳ Add travel flow tests (2 hours)
- ⏳ Update test reports (1 hour)

**Expected Outcome:** 80-90% pass rate

### Sprint 3: Nice-to-Have Features (1 week, optional)
- 🔲 Global map page (4-6 hours)
- 🔲 Action codex page (3-4 hours)
- 🔲 Visual regression tests (4-6 hours)
- 🔲 Test documentation (1-2 hours)
- 🔲 CI/CD integration (2-3 hours)

**Expected Outcome:** 95%+ pass rate

---

## 🎯 Success Metrics

### Phase 1: Quick Wins (Completed after Sprint 1)
- [ ] E2E tests can navigate to Location page
- [ ] E2E tests can navigate to Actions page
- [ ] E2E tests can extract buildings from page
- [ ] E2E tests can extract actions from page
- [ ] Test pass rate > 50%

### Phase 2: Comprehensive Testing (Completed after Sprint 2)
- [ ] E2E tests can enter buildings
- [ ] E2E tests can travel between locations
- [ ] E2E tests can attempt actions
- [ ] E2E tests can perform jobs
- [ ] Test pass rate > 80%

### Phase 3: Full Coverage (Completed after Sprint 3)
- [ ] All major user flows tested
- [ ] Visual regression testing in place
- [ ] CI/CD pipeline running tests
- [ ] Test documentation complete
- [ ] Test pass rate > 95%

---

## 🔧 Technical Debt to Address

### High Priority
1. **Add TypeScript types for test data**
   - LocationTestResult interface
   - ActionTestResult interface
   - BuildingTestResult interface

2. **Extract test utilities to shared module**
   - Navigation helpers
   - Data extraction helpers
   - Assertion helpers

3. **Add error screenshots**
   - Capture screenshot on test failure
   - Save to `test-results/` directory
   - Include in test reports

### Medium Priority
1. **Add test retries**
   - Network flakiness
   - Animation timing issues
   - Modal timing issues

2. **Add parallel test execution**
   - Run location tests and action tests in parallel
   - Reduce total test time

3. **Add test coverage metrics**
   - Track which pages are tested
   - Track which features are tested
   - Generate coverage reports

### Low Priority
1. **Add performance testing**
   - Page load times
   - API response times
   - Action execution times

2. **Add accessibility testing**
   - Axe-core integration
   - Keyboard navigation tests
   - Screen reader tests

---

## 📚 Resources & Documentation

### Test Files
- `client/tests/playtests/comprehensive/AllLocationsE2E.ts`
- `client/tests/playtests/comprehensive/AllActionsE2E.ts`
- `client/tests/playtests/comprehensive/runComprehensiveE2E.ts`

### Frontend Files
- `client/src/pages/Location.tsx` - Location page
- `client/src/pages/Actions.tsx` - Actions page
- `client/src/components/layout/Header.tsx` - Navigation
- `client/src/App.tsx` - Routing

### Documentation
- `E2E_TEST_RESULTS.md` - Initial test results
- `FRONTEND_AUDIT_FINDINGS.md` - Detailed frontend analysis
- `IMPLEMENTATION_ROADMAP.md` - This file

### Test Commands
```bash
# Run all E2E tests
npm run test:comprehensive:e2e

# Run only location tests
npm run test:locations:e2e

# Run only action tests
npm run test:actions:e2e

# Run in headless mode
npm run test:comprehensive:e2e:headless
```

---

## ✅ Checklist for Next Session

### Before Starting Work
- [ ] Read `FRONTEND_AUDIT_FINDINGS.md`
- [ ] Read `IMPLEMENTATION_ROADMAP.md`
- [ ] Understand the test selector issues
- [ ] Review current E2E test code

### Sprint 1 Tasks (Fix E2E Tests)
- [ ] Fix Location navigation selector (change "locations" → "location")
- [ ] Verify Actions navigation selector
- [ ] Add building data-testid attributes
- [ ] Add action data-testid attributes
- [ ] Add travel data-testid attributes
- [ ] Update E2E tests to use data attributes
- [ ] Re-run E2E tests
- [ ] Verify improved pass rate (target: 50%+)
- [ ] Document test patterns
- [ ] Create test writing guide

### Sprint 2 Tasks (Improve Coverage)
- [ ] Add building entry tests
- [ ] Add action execution tests
- [ ] Add job/shop tests
- [ ] Add travel flow tests
- [ ] Update test reports
- [ ] Verify pass rate (target: 80%+)

### Sprint 3 Tasks (Nice-to-Have)
- [ ] Consider adding global map page
- [ ] Consider adding action codex page
- [ ] Consider visual regression tests
- [ ] Write comprehensive test documentation
- [ ] Set up CI/CD integration

---

## 💡 Key Insights

### What We Learned
1. **Frontend is much more complete than tests indicated**
   - 37 pages implemented
   - Actions system fully functional
   - Location system fully functional

2. **Test selectors matter**
   - Small differences ("locations" vs "location") cause 100% failure
   - Data attributes make tests more reliable
   - Text-based matching is fragile

3. **UI structure is different than expected**
   - No master location list (locations discovered through travel)
   - Actions are location-specific
   - Buildings require navigation (enter/exit)

4. **Integration is solid**
   - Backend APIs work correctly
   - Frontend → Backend communication is good
   - State management is working

### What to Avoid
1. **Don't assume test failures mean missing features**
   - Verify manually first
   - Check test selectors
   - Review actual UI structure

2. **Don't over-engineer tests**
   - Start with simple navigation tests
   - Add complexity incrementally
   - Focus on user flows, not implementation details

3. **Don't skip test IDs**
   - Add data-testid from the start
   - Makes tests more maintainable
   - Prevents fragile CSS selector-based tests

---

## 🎉 Summary

### Current State
- ✅ Frontend: 90%+ complete
- ✅ Backend: 100% complete
- ❌ E2E Tests: Need selector fixes

### Next Steps
1. Fix test selectors (30 min) ← **START HERE**
2. Add data-testid attributes (1 hour)
3. Re-run tests and celebrate improved results! 🎉
4. Iterate on coverage improvements

### Expected Results After Fixes
- **Before:** 0% pass rate (0/76 features accessible)
- **After Sprint 1:** 50-70% pass rate (40-53 features accessible)
- **After Sprint 2:** 80-90% pass rate (61-68 features accessible)
- **After Sprint 3:** 95%+ pass rate (72+ features accessible)

**The game is in excellent shape! Just need to fix the tests to prove it!** 🚀
