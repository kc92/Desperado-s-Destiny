# Sentry Integration - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Packages (1 minute)

```bash
# Install client package
cd client
npm install @sentry/react

# Install server packages
cd ../server
npm install @sentry/node @sentry/profiling-node
```

### Step 2: Create Sentry Projects (2 minutes)

1. Go to https://sentry.io and create a free account
2. Create a new organization (e.g., "desperados-destiny")
3. Create two projects:
   - Project 1: Name: `client`, Platform: `React`
   - Project 2: Name: `server`, Platform: `Node.js`
4. Copy the DSN from each project's "Settings > Client Keys (DSN)"

### Step 3: Configure Environment Variables (1 minute)

Edit your `.env` file (or create from `.env.example`):

```bash
# Server Sentry DSN (from server project)
SENTRY_DSN=https://xxxxxxxxx@xxxxxxx.ingest.sentry.io/xxxxxxx

# Client Sentry DSN (from client project)
VITE_SENTRY_DSN=https://xxxxxxxxx@xxxxxxx.ingest.sentry.io/xxxxxxx
```

### Step 4: Restart Development Servers (30 seconds)

```bash
# Stop current servers (Ctrl+C)

# Start client
cd client
npm run dev

# Start server (in new terminal)
cd server
npm run dev
```

### Step 5: Test Integration (30 seconds)

Create a test error to verify everything works:

**Test Client**:
```typescript
// Add temporarily to any React component
<button onClick={() => { throw new Error('Test Sentry Client'); }}>
  Test Error
</button>
```

**Test Server**:
```typescript
// Add temporarily to server/src/routes/index.ts
router.get('/test-error', (req, res) => {
  throw new Error('Test Sentry Server');
});
```

Visit the endpoints and check your Sentry dashboard at:
- https://sentry.io/organizations/[your-org]/issues/

## Verification Checklist

- [ ] Client package installed (`@sentry/react`)
- [ ] Server packages installed (`@sentry/node`, `@sentry/profiling-node`)
- [ ] Two Sentry projects created
- [ ] `.env` file updated with both DSNs
- [ ] Development servers restarted
- [ ] Test error appears in Sentry dashboard
- [ ] Both client and server errors visible

## Console Output Verification

When Sentry is properly initialized, you should see:

**Client Console**:
```
Sentry initialized for environment: development
```

**Server Console**:
```
Sentry initialized for environment: development
```

If you don't see these messages, Sentry DSNs may be missing or incorrect.

## Common Issues

### Issue: "Sentry DSN not configured"
**Solution**: Check that your `.env` file has `SENTRY_DSN` and `VITE_SENTRY_DSN` set

### Issue: Errors not appearing in Sentry
**Solution**:
1. Verify DSN values are correct
2. Check network tab for Sentry API calls
3. Wait 30 seconds for processing
4. Check Sentry project settings (not archived/disabled)

### Issue: TypeScript errors after installation
**Solution**: Restart your TypeScript server or IDE

## Next Steps

Once basic integration is working:

1. **Set User Context**: Call `setUserContext()` when users log in
2. **Add Breadcrumbs**: Track important user actions
3. **Configure Alerts**: Set up email/Slack alerts for errors
4. **Review Errors**: Check Sentry dashboard daily
5. **Optimize**: Adjust sample rates if needed

## Resources

- Full Documentation: `docs/SENTRY_INTEGRATION.md`
- Implementation Summary: `SENTRY_INTEGRATION_SUMMARY.md`
- Package Details: `SENTRY_PACKAGES.md`

## Support

Sentry documentation:
- React: https://docs.sentry.io/platforms/javascript/guides/react/
- Node.js: https://docs.sentry.io/platforms/node/
- Express: https://docs.sentry.io/platforms/node/guides/express/

## Free Tier Limits

- 5,000 errors per month
- 10,000 performance units per month
- 50 session replays per month

With our configured sample rates, these limits should be sufficient for development and small production deployments.
