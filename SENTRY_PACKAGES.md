# Sentry Package Installation Guide

## Required Packages

### Client Packages
```bash
cd client
npm install @sentry/react
```

**Package Details**:
- `@sentry/react`: Latest stable version (7.x)
- Includes Sentry browser SDK and React-specific integrations
- Provides Error Boundary, hooks, and React integration

### Server Packages
```bash
cd server
npm install @sentry/node @sentry/profiling-node
```

**Package Details**:
- `@sentry/node`: Latest stable version (7.x)
- Includes Sentry Node.js SDK and Express integrations
- `@sentry/profiling-node`: CPU profiling support for Node.js

## Optional Development Packages

### Client Source Map Upload (Optional)
```bash
cd client
npm install --save-dev @sentry/vite-plugin
```

**Usage**: Automatically upload source maps during production builds

**Configuration** (add to `vite.config.ts`):
```typescript
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default {
  build: {
    sourcemap: true,
  },
  plugins: [
    sentryVitePlugin({
      org: "your-org-slug",
      project: "desperados-destiny-client",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
};
```

### Server Source Map Upload (Optional)
```bash
cd server
npm install --save-dev @sentry/cli
```

**Usage**: Upload TypeScript source maps for better stack traces

**Configuration** (add to `package.json`):
```json
{
  "scripts": {
    "sentry:upload": "sentry-cli sourcemaps upload --org your-org --project desperados-destiny-server ./dist"
  }
}
```

## Verification

After installation, verify packages are installed:

```bash
# Client
cd client
npm list @sentry/react

# Server
cd server
npm list @sentry/node
npm list @sentry/profiling-node
```

## Package Versions

As of implementation:
- `@sentry/react`: ^7.99.0 (or latest 7.x)
- `@sentry/node`: ^7.99.0 (or latest 7.x)
- `@sentry/profiling-node`: ^7.99.0 (or latest 7.x)

Use `@latest` to get the newest stable version:
```bash
npm install @sentry/react@latest
npm install @sentry/node@latest @sentry/profiling-node@latest
```

## Total Installation Time
- Client: ~30 seconds
- Server: ~30 seconds
- Total: ~1 minute

## Post-Installation

After installing packages:
1. Update `.env` with Sentry DSNs
2. Restart development servers
3. Test error tracking
4. Check Sentry dashboard for events
