# CORS Header Override Investigation Summary

## Issue Description
- Browser requests: Seeing `Access-Control-Allow-Origin: *` (INCORRECT - should be origin-specific)
- curl requests: Showing `Access-Control-Allow-Origin: http://localhost:3000` (CORRECT)
- This suggests different middleware/handlers are processing browser vs curl requests

## Code Review Findings

### 1. Express CORS Middleware (server.ts lines 65-80)
- **Status:** Correctly configured
- **Configuration:** Dynamic origin validation function
- **Behavior:** Checks origin against allowedOrigins array, sets specific origin
- **Supports credentials:** YES (credentials: true)
- **Potential Issue:** Correct - no wildcard

### 2. Socket.io CORS Configuration (socket.ts lines 37-46)
- **Status:** POTENTIAL CULPRIT - ARRAY-BASED ORIGIN
- **Configuration:** `origin: [ list of URLs ]`
- **Issue:** Array-based origins with `credentials: true` is PROBLEMATIC
- **Problem:** socket.io@4.8.1 may have handling issues with array origins + credentials
- **Related:** Socket.io polls via engine.io which has own CORS handling

### 3. Socket.io + engine.io + cors package
- Three instances of cors@2.8.5 in dependency tree
- engine.io@6.6.4 has built-in CORS handling
- Socket.io polling transport MAY default to wildcard for compatibility

## Root Cause Analysis

### Most Likely Causes (in order of probability):

1. **Socket.io Polling Transport Default**
   - Socket.io's HTTP polling fallback (engine.io) may be setting `Access-Control-Allow-Origin: *`
   - This happens when origin is an ARRAY with credentials: true
   - Some browsers use polling instead of WebSocket, getting wildcard headers
   - curl tests may bypass polling entirely

2. **Socket.io Origin Array Handling Bug**
   - Socket.io with array-based origins + credentials may have known issues
   - Version 4.8.1 might not properly validate array origins in all transports
   - Browser's XMLHttpRequest/fetch might trigger different code path than curl

3. **Missing socket.io CORS Function Callback**
   - Unlike Express CORS which uses a callback function for validation
   - Socket.io CORS with array origins lacks dynamic validation
   - Fallback behavior unclear when origin not in array

## Affected Code Locations

1. `/server/src/config/socket.ts` lines 36-53
   - Socket.io initialization with array-based CORS
   - May need to switch to function-based origin validation

2. `/server/src/server.ts` lines 65-80
   - Express CORS is correct
   - But Express middleware doesn't protect Socket.io polling endpoints

## Recommended Fixes to Investigate

1. **Option A: Convert Socket.io CORS to Function-Based Validation (Parallel to Express)**
   ```typescript
   cors: {
     origin: (origin, callback) => {
       if (!origin) return callback(null, true);
       if (allowedOrigins.includes(origin)) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true,
     methods: ['GET', 'POST']
   }
   ```

2. **Option B: Disable HTTP Polling**
   ```typescript
   transports: ['websocket']  // Remove 'polling'
   ```

3. **Option C: Update Socket.io CORS to use origin: true**
   - This makes Socket.io auto-detect origin (may not work with credentials)

4. **Option D: Check Socket.io Version**
   - Current: 4.8.1
   - Latest: Should check if upgrade fixes CORS issues

## Testing Instructions

To verify the fix:

1. Browser test (CORS should show origin, not wildcard):
   ```bash
   # From browser console
   fetch('http://localhost:5000/api/auth/me', {
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' }
   })
   // Check Network tab - Access-Control-Allow-Origin should be specific origin
   ```

2. curl test (baseline - should continue working):
   ```bash
   curl -H "Origin: http://localhost:3000" \
     http://localhost:5000/api/auth/me \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type"
   ```

## Socket.io CORS with Credentials Warning

When using `credentials: true` in Socket.io CORS:
- Origin MUST be specific (not wildcard '*')
- Browser will reject wildcard + credentials combination
- BUT some transports (polling) might silently fall back to wildcard
- This creates the exact symptom we're seeing: Browser sees wildcard, curl doesn't
