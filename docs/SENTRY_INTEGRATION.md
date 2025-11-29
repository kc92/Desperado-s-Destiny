# Sentry Error Tracking Integration

This document describes the Sentry error tracking integration for Desperados Destiny.

## Overview

Sentry is integrated into both the client (React) and server (Node.js/Express) to provide comprehensive error tracking, performance monitoring, and debugging capabilities.

## Features

### Client-Side (React)
- Automatic error capturing for unhandled exceptions
- React Error Boundary integration
- Browser performance tracing
- Session replay (optional)
- User feedback collection
- Breadcrumb tracking for user actions
- Source map support for stack traces

### Server-Side (Node.js)
- Automatic error capturing for unhandled exceptions
- Express middleware integration
- Performance monitoring with tracing
- CPU profiling
- Request data capture
- User context tracking
- Breadcrumb tracking for server events

## Setup

### 1. Install Sentry Packages

#### Client
```bash
cd client
npm install @sentry/react
```

#### Server
```bash
cd server
npm install @sentry/node @sentry/profiling-node
```

### 2. Create Sentry Projects

1. Create a Sentry account at https://sentry.io
2. Create two projects:
   - **desperados-destiny-client** (Platform: React)
   - **desperados-destiny-server** (Platform: Node.js)
3. Copy the DSN from each project's settings

### 3. Configure Environment Variables

Update your `.env` file with the Sentry DSNs:

```bash
# Server-side Sentry DSN
SENTRY_DSN=https://your-server-dsn@sentry.io/your-project-id

# Client-side Sentry DSN (must start with VITE_)
VITE_SENTRY_DSN=https://your-client-dsn@sentry.io/your-project-id

# Optional: Release versions
SENTRY_RELEASE=desperados-destiny-server@1.0.0
VITE_SENTRY_RELEASE=desperados-destiny-client@1.0.0

# Optional: Disable in development
SENTRY_DISABLE_IN_DEV=false
VITE_SENTRY_DISABLE_IN_DEV=false
```

## Usage

### Client-Side

#### Automatic Error Capture

Sentry is initialized automatically in `client/src/main.tsx` and will capture:
- Unhandled JavaScript errors
- Unhandled promise rejections
- React component errors (via ErrorBoundary)

#### Manual Error Capture

```typescript
import { captureException, captureMessage, addBreadcrumb } from './config/sentry';

// Capture an exception with context
try {
  riskyOperation();
} catch (error) {
  captureException(error, {
    action: 'riskyOperation',
    userId: user.id,
  });
}

// Capture a message
captureMessage('Something important happened', 'info');

// Add breadcrumb for debugging
addBreadcrumb('User clicked button', 'user-action', {
  buttonId: 'submit-form',
});
```

#### Setting User Context

```typescript
import { setUserContext } from './config/sentry';

// When user logs in
setUserContext({
  id: user.id,
  username: user.username,
  email: user.email,
});

// When user logs out
setUserContext(null);
```

#### Using ErrorBoundary

The ErrorBoundary component is already integrated with Sentry:

```tsx
import { ErrorBoundary } from './components/errors/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary showDialog={true}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Server-Side

#### Automatic Error Capture

Sentry is initialized automatically in `server/src/server.ts` and will capture:
- Unhandled exceptions
- Unhandled promise rejections
- Express route errors
- Middleware errors

#### Manual Error Capture

```typescript
import { captureException, captureMessage, addBreadcrumb } from './config/sentry';

// Capture an exception with context
try {
  await riskyDatabaseOperation();
} catch (error) {
  captureException(error, {
    user: { id: req.user?.id, username: req.user?.username },
    tags: { operation: 'database', table: 'users' },
    extra: { query: 'SELECT * FROM users' },
    level: 'error',
  });
  throw error;
}

// Capture a message
captureMessage('Important server event', 'warning');

// Add breadcrumb
addBreadcrumb('Database query executed', 'database', {
  query: 'SELECT * FROM users',
  duration: 125,
});
```

#### Setting User Context in Middleware

```typescript
import { setUserContext } from './config/sentry';

// In your auth middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    setUserContext({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    });
  }
  next();
}
```

## Configuration

### Sample Rates

#### Production
- **Traces**: 10% of transactions
- **Profiles**: 10% of transactions
- **Replays**: 1% of sessions, 50% on errors

#### Development
- **Traces**: 100% of transactions
- **Profiles**: 100% of transactions
- **Replays**: 10% of sessions, 100% on errors

### Error Filtering

Both client and server configurations include filters to:
- Ignore expected network errors
- Ignore browser extension errors
- Ignore temporary database connection errors
- Allow disabling in development mode

## Performance Monitoring

### Client
- Page load times
- Component render times
- API request durations
- User interaction timing

### Server
- API endpoint performance
- Database query performance
- Middleware execution time
- CPU profiling

## Best Practices

### 1. Add Context to Errors

```typescript
captureException(error, {
  user: { id: user.id },
  tags: { feature: 'combat-system' },
  extra: { combatState: currentState },
});
```

### 2. Use Breadcrumbs

```typescript
// Track user flow
addBreadcrumb('Started combat', 'game-action', {
  enemyId: enemy.id,
  playerHealth: player.health,
});
```

### 3. Set User Context

Always set user context when available to track errors by user.

### 4. Use Appropriate Severity Levels

- `fatal`: Application crash
- `error`: Exceptions and errors
- `warning`: Unexpected but handled situations
- `info`: Informational messages
- `debug`: Debug information

### 5. Sanitize Sensitive Data

Never send passwords, tokens, or PII to Sentry. The configuration already filters request bodies, but be careful with custom context.

### 6. Test in Development

Sentry works in development mode by default. Test your error handling before deploying.

## Source Maps

### Client (Vite)

Source maps are automatically generated during build. To upload to Sentry:

```bash
npm install --save-dev @sentry/vite-plugin

# Update vite.config.ts
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default {
  build: {
    sourcemap: true,
  },
  plugins: [
    sentryVitePlugin({
      org: "your-org",
      project: "desperados-destiny-client",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
};
```

### Server (TypeScript)

Source maps are generated by TypeScript. To upload:

```bash
npm install --save-dev @sentry/cli

# Add to package.json scripts
"sentry:upload": "sentry-cli sourcemaps upload --org your-org --project desperados-destiny-server ./dist"
```

## Monitoring Dashboard

Access your Sentry dashboard at:
- Client: https://sentry.io/organizations/[org]/projects/desperados-destiny-client
- Server: https://sentry.io/organizations/[org]/projects/desperados-destiny-server

### Key Metrics to Monitor

1. **Error Rate**: Track increases in error frequency
2. **Affected Users**: Number of unique users experiencing errors
3. **Performance**: Track slow transactions and endpoints
4. **Release Health**: Compare error rates across releases
5. **Alerts**: Set up alerts for critical errors

## Troubleshooting

### Sentry Not Initialized

Check that environment variables are set correctly:
```bash
echo $SENTRY_DSN          # Server
echo $VITE_SENTRY_DSN     # Client
```

### Errors Not Appearing

1. Check Sentry is not disabled in development
2. Verify DSN is correct
3. Check network tab for Sentry API calls
4. Review console for Sentry initialization messages

### Source Maps Not Working

1. Ensure source maps are generated during build
2. Upload source maps to Sentry
3. Verify release names match between app and uploaded maps

## Security Considerations

1. **DSN is Public**: The client DSN is visible in the frontend. This is expected and safe.
2. **Rate Limiting**: Sentry has built-in rate limiting to prevent abuse.
3. **Data Scrubbing**: Sensitive data is automatically scrubbed by Sentry.
4. **Access Control**: Limit Sentry project access to team members only.

## Cost Management

Free tier includes:
- 5,000 errors/month
- 10,000 performance units/month
- 50 replays/month

Tips to stay within limits:
- Use appropriate sample rates
- Filter out non-critical errors
- Set up spike protection
- Monitor usage in Sentry dashboard

## Additional Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Node.js Documentation](https://docs.sentry.io/platforms/node/)
- [Sentry Express Integration](https://docs.sentry.io/platforms/node/guides/express/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
