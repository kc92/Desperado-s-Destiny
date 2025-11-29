# Security Testing Quick Reference

## Quick Start

```bash
# Run all security tests
npm test -- tests/security/

# Run specific test file
npm test -- tests/security/ownership.test.ts

# Run with coverage
npm test -- --coverage tests/security/
```

## Test Categories

### 1. Character Ownership (24 tests)
Tests that users can only access their own characters.

```typescript
// Prevent access to other users' characters
const userA = await setupCompleteGameState(app, 'usera@example.com');
const userB = await setupCompleteGameState(app, 'userb@example.com');

const response = await apiGet(
  app,
  `/api/characters/${userB.character._id}`,
  userA.token
);

expect(response.status).toBe(403);
```

### 2. Gang Permissions (28+ tests)
Tests role-based permissions in gang system.

```typescript
// Only leaders can disband gangs
const { gang, member } = await createGangWithMembers();

const response = await apiDelete(
  app,
  `/api/gangs/${gang._id}`,
  member.token
);

expect(response.status).toBe(403);
```

### 3. Admin Access (18+ tests)
Tests admin-only endpoint restrictions.

```typescript
// Regular users cannot access admin routes
const regularUser = await setupCompleteGameState(app);

const response = await apiGet(
  app,
  '/api/admin/users',
  regularUser.token
);

expect(response.status).toBe(403);
```

## Common Test Patterns

### Pattern 1: Unauthorized Access Prevention
```typescript
it('should prevent unauthorized access', async () => {
  const userA = await setupCompleteGameState(app, 'usera@example.com');
  const userB = await setupCompleteGameState(app, 'userb@example.com');

  const response = await apiGet(
    app,
    `/api/resource/${userB.resource._id}`,
    userA.token
  );

  expect(response.status).toBe(403);
  expectError(response, 403);
});
```

### Pattern 2: Authorized Access Allowed
```typescript
it('should allow authorized access', async () => {
  const user = await setupCompleteGameState(app);

  const response = await apiGet(
    app,
    `/api/resource/${user.resource._id}`,
    user.token
  );

  expect(response.status).toBe(200);
  expectSuccess(response);
});
```

### Pattern 3: Role-Based Permission Check
```typescript
it('should enforce role permissions', async () => {
  const { gang, member, officer, leader } = await createGangWithMembers();

  // Member should fail
  const memberRes = await apiPost(
    app,
    `/api/gangs/${gang._id}/action`,
    {},
    member.token
  );
  expect(memberRes.status).toBe(403);

  // Officer/Leader should succeed
  const leaderRes = await apiPost(
    app,
    `/api/gangs/${gang._id}/action`,
    {},
    leader.token
  );
  expect([200, 400]).toContain(leaderRes.status);
});
```

## Test Helpers Cheat Sheet

### User & Character Setup
```typescript
// Create complete game state (user + character)
const { user, character, token } = await setupCompleteGameState(app);

// Create multiple users
const userA = await setupCompleteGameState(app, 'usera@example.com');
const userB = await setupCompleteGameState(app, 'userb@example.com');

// Create admin user
const { admin, token } = await createAdminUser();
```

### API Requests
```typescript
// GET request
const res = await apiGet(app, '/api/endpoint', token);

// POST request
const res = await apiPost(app, '/api/endpoint', { data }, token);

// PATCH request
const res = await apiPatch(app, '/api/endpoint', { data }, token);

// DELETE request
const res = await apiDelete(app, '/api/endpoint', token);
```

### Assertions
```typescript
// Expect success (200-299)
expectSuccess(response);

// Expect error
expectError(response, 403);

// Expect specific status
expect(response.status).toBe(403);

// Expect error message
expect(response.body.error).toMatch(/permission/i);
```

### Database Operations
```typescript
// Clear database before test
beforeEach(async () => {
  await clearDatabase();
});

// Check database state
const character = await Character.findById(characterId);
expect(character?.gold).toBe(expectedGold);
```

## Expected Status Codes

| Code | Meaning | When to Expect |
|------|---------|---------------|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST (create) |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |

## Common Test Scenarios

### ✅ Ownership Verification
```typescript
// User A cannot access User B's character
it('should prevent cross-user access', async () => {
  const userA = await setupCompleteGameState(app, 'usera@example.com');
  const userB = await setupCompleteGameState(app, 'userb@example.com');

  const response = await apiGet(
    app,
    `/api/characters/${userB.character._id}`,
    userA.token
  );

  expect(response.status).toBe(403);
});
```

### ✅ Role Permission Check
```typescript
// Only leaders can disband gang
it('should restrict action to leaders', async () => {
  const { gang, member } = await createGangWithMembers();

  const response = await apiDelete(
    app,
    `/api/gangs/${gang._id}`,
    member.token
  );

  expect(response.status).toBe(403);
});
```

### ✅ Admin Access Control
```typescript
// Regular users cannot access admin routes
it('should block non-admin access', async () => {
  const regularUser = await setupCompleteGameState(app);

  const response = await apiGet(
    app,
    '/api/admin/users',
    regularUser.token
  );

  expect(response.status).toBe(403);
});
```

### ✅ Token Validation
```typescript
// No token = 401
it('should reject missing token', async () => {
  const response = await apiGet(app, '/api/characters/123');
  expect(response.status).toBe(401);
});

// Invalid token = 401
it('should reject invalid token', async () => {
  const response = await apiGet(
    app,
    '/api/characters/123',
    'invalid.token.here'
  );
  expect(response.status).toBe(401);
});
```

## Debugging Failed Tests

### Test fails with 429 (Rate Limit)
**Cause:** Character creation rate limited to 3/hour
**Solution:** Wait or use existing setup helpers

### Test fails with 404
**Cause:** Endpoint not implemented yet
**Solution:** Tests should pass on 404 (not implemented) but fail on 403

### Test fails with 409 (Conflict)
**Cause:** Duplicate character name or email
**Solution:** Use unique emails in setupCompleteGameState

### Database not clean between tests
**Cause:** clearDatabase not called
**Solution:** Add beforeEach with clearDatabase

## Writing New Security Tests

### 1. Identify the security requirement
- What resource needs protection?
- Who should have access?
- What permissions are required?

### 2. Write negative tests first
Test that unauthorized actions are blocked:
```typescript
it('should prevent unauthorized action', async () => {
  // Setup unauthorized user
  // Attempt action
  // Expect 403
});
```

### 3. Write positive tests
Test that authorized actions succeed:
```typescript
it('should allow authorized action', async () => {
  // Setup authorized user
  // Attempt action
  // Expect success
});
```

### 4. Add edge cases
Test boundary conditions:
```typescript
it('should handle edge case', async () => {
  // Invalid ID
  // Missing data
  // Concurrent access
  // etc.
});
```

## Best Practices

### ✅ DO
- Clear database before each test
- Use unique emails for each user
- Test both success and failure cases
- Verify database state after operations
- Use descriptive test names
- Group related tests in describe blocks

### ❌ DON'T
- Reuse users across tests (causes conflicts)
- Skip database cleanup
- Test multiple things in one test
- Ignore edge cases
- Use hardcoded IDs
- Rely on test execution order

## Quick Debugging

```typescript
// Print response for debugging
console.log('Status:', response.status);
console.log('Body:', response.body);

// Check database state
const user = await User.findById(userId);
console.log('User:', user);

// Verify token
const decoded = verifyToken(token);
console.log('Token:', decoded);
```

## Test Execution Tips

### Run single test
```bash
npm test -- tests/security/ownership.test.ts -t "should prevent access"
```

### Run with verbose output
```bash
npm test -- tests/security/ --verbose
```

### Run in watch mode
```bash
npm test -- tests/security/ --watch
```

### Run with coverage threshold
```bash
npm test -- tests/security/ --coverage --coverageThreshold='{"global":{"branches":80}}'
```

## Common Assertions

```typescript
// Status codes
expect(response.status).toBe(200);
expect(response.status).toBeGreaterThanOrEqual(400);
expect([200, 404]).toContain(response.status);

// Response body
expect(response.body.success).toBe(true);
expect(response.body.error).toMatch(/permission/i);
expect(response.body.data).toBeDefined();

// Database state
expect(character?.gold).toBe(5000);
expect(character?.isActive).toBe(true);
expect(gang.members).toHaveLength(3);

// Arrays
expect(characters).toHaveLength(1);
expect(ids).not.toContain(forbiddenId);
```

## Need Help?

- **Documentation:** `tests/security/README.md`
- **Examples:** All files in `tests/security/`
- **Helpers:** `tests/helpers/`
- **Report Issues:** Create issue with "security-test" label

## Security Contacts

Report vulnerabilities to: security@desperadosdestiny.com
