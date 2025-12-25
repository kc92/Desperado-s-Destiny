# Phase 2: API Breaking Fixes Plan

## Executive Summary

This plan addresses critical API mismatches between client and server that cause runtime failures. The issues fall into three categories:

1. **Property API**: Base path mismatch + missing endpoints (ALL property features broken)
2. **Gang API**: Method/path mismatches + missing endpoints (partial gang features broken)
3. **Missing Income Endpoints**: New endpoints needed for property income management

**Estimated Effort:** 2-3 hours
**Risk Level:** Medium (touches multiple route files)
**Breaking Changes:** None if done correctly (fixes existing broken calls)

---

## Issue 1: Property API Base Path Mismatch

### Problem
- **Client calls:** `/property/*` (e.g., `/property/listings`, `/property/my-properties`)
- **Server expects:** `/properties/*` (registered at line 286 of `routes/index.ts`)
- **Impact:** ALL 18+ property endpoints return 404

### Solution Options

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| A: Change client to `/properties` | Consistent with REST conventions (plural) | Requires updating ~18 client calls | **RECOMMENDED** |
| B: Change server to `/property` | Single file change | Non-standard REST naming | Not recommended |

### Implementation: Option A (Update Client)

**File:** `client/src/services/property.service.ts`

**Changes Required:**
```typescript
// Line ~285-500: Change all occurrences of '/property/' to '/properties/'

// Before:
apiClient.get('/property/listings')
apiClient.get('/property/my-properties')
apiClient.post('/property/purchase')
// etc...

// After:
apiClient.get('/properties/listings')
apiClient.get('/properties/my-properties')
apiClient.post('/properties/purchase')
// etc...
```

**Specific endpoints to update:**
1. `/property/listings` → `/properties/listings`
2. `/property/foreclosed` → `/properties/foreclosed`
3. `/property/{id}` → `/properties/{id}`
4. `/property/my-properties` → `/properties/my-properties`
5. `/property/loans` → `/properties/loans`
6. `/property/purchase` → `/properties/purchase`
7. `/property/{id}/upgrade-tier` → `/properties/{id}/upgrade-tier`
8. `/property/{id}/upgrade` → `/properties/{id}/upgrade`
9. `/property/{id}/hire` → `/properties/{id}/hire`
10. `/property/{id}/fire` → `/properties/{id}/fire`
11. `/property/{id}/storage/deposit` → `/properties/{id}/storage/deposit`
12. `/property/{id}/storage/withdraw` → `/properties/{id}/storage/withdraw`
13. `/property/loans/{id}/pay` → `/properties/loans/{id}/pay`
14. `/property/{id}/transfer` → `/properties/{id}/transfer`
15. `/property/{id}/collect-income` → `/properties/{id}/collect` (also rename)
16. `/property/income/overview` → NEW (see Issue 3)
17. `/property/income/collect-all` → NEW (see Issue 3)

---

## Issue 2: Gang API Mismatches

### 2.1 HTTP Method Mismatches

**Kick Member:**
- Client: `POST /gangs/:id/kick` with `{ characterId }` in body
- Server: `DELETE /:id/members/:characterId` with characterId in URL
- **Fix:** Update server to accept POST OR update client to use DELETE

**Promote Member:**
- Client: `POST /gangs/:id/promote` with `{ characterId, newRole }` in body
- Server: `PATCH /:id/members/:characterId/promote` with characterId in URL
- **Fix:** Update server to accept POST OR update client to use PATCH

### 2.2 Path Structure Differences

**Create Gang:**
- Client: `POST /gangs` with body
- Server: `POST /create` (relative to `/gangs` mount)
- **Fix:** Change server route from `/create` to `/` for POST

**Leave Gang:**
- Client: `POST /gangs/leave` (no gangId in URL)
- Server: `POST /:id/leave` (requires gangId)
- **Fix:** Add new route `POST /leave` that gets gangId from user's character

**Purchase Upgrade:**
- Client: `POST /gangs/:id/upgrades/purchase` with `{ upgradeType }` in body
- Server: `POST /:id/upgrades/:upgradeType` with upgradeType in URL
- **Fix:** Add new route that accepts body format

### 2.3 Missing Server Endpoints

| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `GET /gangs/current` | Get current user's gang | HIGH |
| `GET /gangs/check-name?name=X` | Check name availability | HIGH |
| `GET /gangs/check-tag?tag=X` | Check tag availability | HIGH |
| `GET /gangs/search-characters?q=X` | Search characters for invitation | MEDIUM |
| `GET /gangs/invitations/pending` | Get pending invitations for user | MEDIUM |
| `DELETE /gangs/invitations/:id` | Cancel a pending invitation | LOW |

### Implementation Details

**File:** `server/src/routes/gang.routes.ts`

**Add these new routes:**

```typescript
// Add at the top of route definitions (before /:id routes to prevent conflicts)

// GET /gangs/current - Get current user's gang
router.get('/current', asyncHandler(GangController.getCurrentGang));

// GET /gangs/check-name - Check if gang name is available
router.get('/check-name', asyncHandler(GangController.checkNameAvailability));

// GET /gangs/check-tag - Check if gang tag is available
router.get('/check-tag', asyncHandler(GangController.checkTagAvailability));

// GET /gangs/search-characters - Search characters for invitation
router.get('/search-characters', asyncHandler(GangController.searchCharacters));

// POST /gangs/leave - Leave current gang (without specifying gangId)
router.post('/leave', requireCsrfToken, asyncHandler(GangController.leaveCurrentGang));

// GET /gangs/invitations/pending - Get pending invitations for current user
router.get('/invitations/pending', asyncHandler(GangController.getPendingInvitations));

// DELETE /gangs/invitations/:id - Cancel invitation
router.delete('/invitations/:id', requireCsrfToken, asyncHandler(GangController.cancelInvitation));

// Change create route
router.post('/', requireCsrfToken, asyncHandler(GangController.create)); // Was /create

// Add alternative routes for client compatibility
router.post('/:id/kick', requireCsrfToken, asyncHandler(GangController.kickMember)); // Accepts body { characterId }
router.post('/:id/promote', requireCsrfToken, asyncHandler(GangController.promoteMember)); // Accepts body { characterId, role }
router.post('/:id/upgrades/purchase', requireCsrfToken, asyncHandler(GangController.purchaseUpgradeAlt)); // Accepts body { upgradeType }
```

**File:** `server/src/controllers/gang.controller.ts`

**Add these new controller methods:**

```typescript
// Get current user's gang
static async getCurrentGang(req: Request, res: Response): Promise<void> {
  const characterId = (req as any).character?._id;
  const gang = await GangService.getGangByCharacter(characterId);
  res.json({ success: true, data: gang });
}

// Check name availability
static async checkNameAvailability(req: Request, res: Response): Promise<void> {
  const { name } = req.query;
  const exists = await Gang.exists({ name: name as string, isActive: true });
  res.json({ success: true, data: { available: !exists } });
}

// Check tag availability
static async checkTagAvailability(req: Request, res: Response): Promise<void> {
  const { tag } = req.query;
  const exists = await Gang.exists({ tag: tag as string, isActive: true });
  res.json({ success: true, data: { available: !exists } });
}

// Search characters for invitation
static async searchCharacters(req: Request, res: Response): Promise<void> {
  const { q } = req.query;
  const characters = await Character.find({
    name: { $regex: q as string, $options: 'i' },
    gangId: { $exists: false }
  }).select('name level faction').limit(20);
  res.json({ success: true, data: characters });
}

// Leave current gang (without specifying gangId)
static async leaveCurrentGang(req: Request, res: Response): Promise<void> {
  const characterId = (req as any).character?._id;
  const character = await Character.findById(characterId);
  if (!character?.gangId) {
    throw new AppError('Not in a gang', HttpStatus.BAD_REQUEST);
  }
  await GangService.leaveGang(character.gangId.toString(), characterId);
  res.json({ success: true, message: 'Left gang successfully' });
}

// Get pending invitations for current user
static async getPendingInvitations(req: Request, res: Response): Promise<void> {
  const characterId = (req as any).character?._id;
  const invitations = await GangInvitation.find({
    targetCharacterId: characterId,
    status: 'pending'
  }).populate('gangId', 'name tag level');
  res.json({ success: true, data: invitations });
}

// Alternative kick endpoint accepting body
static async kickMember(req: Request, res: Response): Promise<void> {
  const { id: gangId } = req.params;
  const { characterId } = req.body;
  const requesterId = (req as any).character?._id;
  await GangService.kickMember(gangId, characterId, requesterId);
  res.json({ success: true, message: 'Member kicked successfully' });
}

// Alternative promote endpoint accepting body
static async promoteMember(req: Request, res: Response): Promise<void> {
  const { id: gangId } = req.params;
  const { characterId, role } = req.body;
  const requesterId = (req as any).character?._id;
  await GangService.promoteMember(gangId, characterId, role, requesterId);
  res.json({ success: true, message: 'Member promoted successfully' });
}

// Alternative upgrade purchase accepting body
static async purchaseUpgradeAlt(req: Request, res: Response): Promise<void> {
  const { id: gangId } = req.params;
  const { upgradeType } = req.body;
  const requesterId = (req as any).character?._id;
  await GangService.purchaseUpgrade(gangId, upgradeType, requesterId);
  res.json({ success: true, message: 'Upgrade purchased successfully' });
}
```

---

## Issue 3: Missing Property Income Endpoints

### Problem
Client expects income management endpoints that don't exist:
- `GET /properties/income/overview` - Get summary of all property income
- `POST /properties/income/collect-all` - Collect income from all properties at once

### Implementation

**File:** `server/src/routes/property.routes.ts`

```typescript
// Add before the /:propertyId routes

// GET /properties/income/overview - Get income summary for all properties
router.get('/income/overview', asyncHandler(PropertyController.getIncomeOverview));

// POST /properties/income/collect-all - Collect all pending income
router.post('/income/collect-all', requireCsrfToken, asyncHandler(PropertyController.collectAllIncome));
```

**File:** `server/src/controllers/property.controller.ts`

```typescript
// Get income overview for all properties
static async getIncomeOverview(req: Request, res: Response): Promise<void> {
  const characterId = (req as any).character?._id;

  const properties = await Property.find({ ownerId: characterId, isActive: true });

  const overview = {
    totalProperties: properties.length,
    totalPendingIncome: 0,
    propertiesByType: {} as Record<string, number>,
    properties: [] as Array<{
      id: string;
      name: string;
      type: string;
      pendingIncome: number;
      lastCollected: Date | null;
    }>
  };

  for (const property of properties) {
    const pendingIncome = property.calculatePendingIncome();
    overview.totalPendingIncome += pendingIncome;
    overview.propertiesByType[property.type] = (overview.propertiesByType[property.type] || 0) + 1;
    overview.properties.push({
      id: property._id.toString(),
      name: property.name,
      type: property.type,
      pendingIncome,
      lastCollected: property.lastIncomeCollection
    });
  }

  res.json({ success: true, data: overview });
}

// Collect all income from all properties
static async collectAllIncome(req: Request, res: Response): Promise<void> {
  const characterId = (req as any).character?._id;
  const { locationId } = req.body; // Optional: only collect from specific location

  const query: any = { ownerId: characterId, isActive: true };
  if (locationId) {
    query.locationId = locationId;
  }

  const properties = await Property.find(query);

  let totalCollected = 0;
  const collections: Array<{ propertyId: string; amount: number }> = [];

  for (const property of properties) {
    const pendingIncome = property.calculatePendingIncome();
    if (pendingIncome > 0) {
      await PropertyService.collectIncome(property._id.toString(), characterId);
      totalCollected += pendingIncome;
      collections.push({
        propertyId: property._id.toString(),
        amount: pendingIncome
      });
    }
  }

  res.json({
    success: true,
    data: {
      totalCollected,
      propertiesCollected: collections.length,
      collections
    }
  });
}
```

---

## Implementation Order

### Step 1: Property Base Path Fix (Client) - 15 minutes
1. Open `client/src/services/property.service.ts`
2. Find and replace `/property/` with `/properties/`
3. Also rename `collect-income` to `collect` to match server

### Step 2: Add Missing Property Income Endpoints (Server) - 30 minutes
1. Add routes to `server/src/routes/property.routes.ts`
2. Add controller methods to `server/src/controllers/property.controller.ts`
3. Add CSRF protection to POST endpoint

### Step 3: Fix Gang Create Route (Server) - 5 minutes
1. Change `router.post('/create', ...)` to `router.post('/', ...)`

### Step 4: Add Gang Missing Endpoints (Server) - 45 minutes
1. Add new routes before `/:id` routes
2. Add controller methods
3. Add validation schemas

### Step 5: Add Gang Alternative Routes (Server) - 20 minutes
1. Add POST `/kick` endpoint (alternative to DELETE)
2. Add POST `/promote` endpoint (alternative to PATCH)
3. Add POST `/upgrades/purchase` endpoint (alternative to URL param)

### Step 6: Add Gang Leave Without ID (Server) - 10 minutes
1. Add POST `/leave` endpoint that doesn't require gangId in URL

---

## Testing Checklist

### Property Tests
- [ ] GET `/properties/listings` returns property listings
- [ ] GET `/properties/my-properties` returns user's properties
- [ ] POST `/properties/purchase` creates a purchase
- [ ] GET `/properties/income/overview` returns income summary
- [ ] POST `/properties/income/collect-all` collects all income
- [ ] POST `/properties/:id/collect` collects from single property

### Gang Tests
- [ ] POST `/gangs` creates a new gang (was `/gangs/create`)
- [ ] GET `/gangs/current` returns user's gang
- [ ] GET `/gangs/check-name?name=X` checks availability
- [ ] GET `/gangs/check-tag?tag=X` checks availability
- [ ] POST `/gangs/leave` leaves gang without gangId
- [ ] POST `/gangs/:id/kick` with body `{ characterId }` works
- [ ] POST `/gangs/:id/promote` with body `{ characterId, role }` works
- [ ] POST `/gangs/:id/upgrades/purchase` with body `{ upgradeType }` works
- [ ] GET `/gangs/search-characters?q=X` returns matching characters
- [ ] GET `/gangs/invitations/pending` returns pending invitations

---

## Rollback Plan

If issues arise:
1. **Property**: Revert client `property.service.ts` to use `/property/`
2. **Gang**: New endpoints are additive; old endpoints still work
3. All changes can be reverted independently

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `client/src/services/property.service.ts` | Update base path from `/property/` to `/properties/` |
| `server/src/routes/property.routes.ts` | Add income overview and collect-all endpoints |
| `server/src/controllers/property.controller.ts` | Add getIncomeOverview and collectAllIncome methods |
| `server/src/routes/gang.routes.ts` | Add 7+ new routes, modify create route |
| `server/src/controllers/gang.controller.ts` | Add 8+ new controller methods |
