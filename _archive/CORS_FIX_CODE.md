# CORS Fix - Code Changes Required

## File to Modify
`server/src/config/socket.ts`

## Current Code (Lines 31-53)
```typescript
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  try {
    logger.info('Initializing Socket.io server...');

    // Create Socket.io server with configuration
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          config.server.frontendUrl,
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173'
        ],
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e6, // 1MB
      allowEIO3: true
    });
```

## Fixed Code
```typescript
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  try {
    logger.info('Initializing Socket.io server...');

    // Define allowed origins (consistent with Express CORS configuration)
    const allowedOrigins = [
      config.server.frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173'
    ];

    // Create Socket.io server with configuration
    io = new SocketIOServer(httpServer, {
      cors: {
        // Use callback function for dynamic origin validation (NOT array)
        // This ensures consistent CORS handling across WebSocket and polling transports
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);

          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            // Reject origins not in allowlist
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e6, // 1MB
      allowEIO3: true
    });
```

## Key Changes
1. Define `allowedOrigins` array separately at function level
2. Replace `origin: [array]` with `origin: (origin, callback) => { ... }`
3. Implement same logic as Express CORS middleware in server.ts
4. Both WebSocket and polling transports will now properly handle CORS

## Why This Works
- Dynamic callback ensures engine.io polling transport respects origin validation
- No fallback to wildcard headers
- Consistent behavior across all request types
- Matches Express CORS pattern already proven to work

## Testing After Fix
```bash
# Browser test (from DevTools console)
fetch('http://localhost:5000/api/health', {
  credentials: 'include'
}).then(r => {
  console.log(r.headers.get('Access-Control-Allow-Origin'));
  // Should output: http://localhost:3000 (or matching origin)
  // NOT *
});

# curl baseline (should continue working)
curl -H "Origin: http://localhost:3000" http://localhost:5000/api/health -v
```

## Why Browser Was Seeing Wildcard
Array-based origins in Socket.io with credentials: true can cause engine.io (the HTTP transport layer) to default to `Access-Control-Allow-Origin: *` for compatibility. When browsers fall back to HTTP polling (instead of WebSocket), they get the wildcard header which then gets rejected by the browser security model.

curl directly hit the Express CORS middleware (which uses callback validation), so it worked correctly.
