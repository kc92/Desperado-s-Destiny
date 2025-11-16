# Desperados Destiny Backend - Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:

- [ ] Node.js 18.x or higher installed (`node --version`)
- [ ] npm 9.x or higher installed (`npm --version`)
- [ ] MongoDB 6.x installed and running (`mongod --version`)
- [ ] Redis 7.x installed and running (`redis-cli ping` should return `PONG`)

## Installation Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

This will install all required packages including:
- Express.js (Web framework)
- Mongoose (MongoDB ODM)
- Redis client
- Socket.io (Real-time communication)
- TypeScript and all type definitions
- Testing framework (Jest)
- Security packages (Helmet, CORS)

### 2. Configure Environment

The `.env` file has already been created with development defaults. Verify the settings:

```bash
cat .env
```

Key settings to verify:
- `MONGODB_URI` - Should point to your local MongoDB
- `REDIS_URL` - Should point to your local Redis
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

### 3. Start MongoDB (if not running)

**Windows:**
```bash
# Start MongoDB as a service
net start MongoDB

# Or run manually
mongod --dbpath C:\data\db
```

**Mac/Linux:**
```bash
# Start MongoDB service
brew services start mongodb-community@6.0

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

### 4. Start Redis (if not running)

**Windows:**
```bash
# Start Redis (if installed via WSL or manually)
redis-server
```

**Mac/Linux:**
```bash
# Start Redis service
brew services start redis

# Or run manually
redis-server
```

### 5. Verify TypeScript Compilation

```bash
npm run build
```

Should complete without errors and create a `dist/` directory.

### 6. Run Tests (Optional)

```bash
npm test
```

All tests should pass. This verifies:
- Server startup
- Database connections
- Middleware functionality
- API endpoints

### 7. Start Development Server

```bash
npm run dev
```

You should see output like:
```
[INFO] Starting Desperados Destiny server...
[INFO] Environment: development
[INFO] Attempting to connect to MongoDB...
[INFO] MongoDB connected successfully
[INFO] Attempting to connect to Redis...
[INFO] Redis connected successfully
[INFO] Socket.io initialized
[INFO] Server running on port 5000
[INFO] Health check available at http://localhost:5000/api/health
```

## Verification

### Test the Server

Open a browser or use curl to test the endpoints:

**1. Root endpoint:**
```bash
curl http://localhost:5000/
```

Expected response:
```json
{
  "success": true,
  "message": "Desperados Destiny API Server",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**2. Health check endpoint:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 10.123,
    "services": {
      "database": {
        "status": "connected",
        "latency": 5
      },
      "redis": {
        "status": "connected",
        "latency": 2
      }
    },
    "version": "1.0.0",
    "environment": "development"
  }
}
```

If both endpoints return successfully, the server is running correctly!

## Common Issues

### MongoDB Connection Failed

**Error:** `Failed to connect to MongoDB`

**Solution:**
1. Ensure MongoDB is running: `mongod` or `brew services start mongodb-community@6.0`
2. Check the connection string in `.env`
3. Verify MongoDB is listening on port 27017: `lsof -i :27017` (Mac/Linux) or `netstat -an | findstr 27017` (Windows)

### Redis Connection Failed

**Error:** `Failed to connect to Redis`

**Solution:**
1. Ensure Redis is running: `redis-server` or `brew services start redis`
2. Test Redis: `redis-cli ping` (should return `PONG`)
3. Check the Redis URL in `.env`
4. Verify Redis is listening on port 6379

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
1. Change the port in `.env`: `PORT=5001`
2. Or kill the process using port 5000:
   - Mac/Linux: `lsof -ti:5000 | xargs kill -9`
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`

### TypeScript Compilation Errors

**Error:** TypeScript compilation fails

**Solution:**
1. Ensure you're using Node.js 18+: `node --version`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Clear TypeScript cache: `rm -rf dist`
4. Rebuild: `npm run build`

## Development Workflow

### Hot Reload

The development server uses `nodemon` for automatic restart on file changes:

1. Start dev server: `npm run dev`
2. Edit any `.ts` file in `src/`
3. Server automatically restarts
4. Test your changes

### Adding New Features

See `README_BACKEND.md` for detailed instructions on:
- Adding new routes
- Creating controllers
- Defining models
- Implementing services
- Writing tests

### Code Quality

Before committing:

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Type check
npm run typecheck
```

## Production Build

To create a production build:

```bash
# Build TypeScript
npm run build

# Set environment to production
export NODE_ENV=production  # Mac/Linux
set NODE_ENV=production     # Windows

# Start production server
npm start
```

## Next Steps

1. Review `README_BACKEND.md` for architecture details
2. Explore the codebase:
   - `src/server.ts` - Main server file
   - `src/config/` - Configuration
   - `src/middleware/` - Middleware
   - `src/routes/` - API routes
3. Start building game features!

## Need Help?

- Check `README_BACKEND.md` for detailed documentation
- Review existing code for examples
- Check logs in development mode for debugging

## Success Checklist

- [x] Dependencies installed
- [x] Environment configured
- [x] MongoDB running and connected
- [x] Redis running and connected
- [x] TypeScript compiling without errors
- [x] Tests passing
- [x] Dev server running
- [x] Health check endpoint responding
- [x] Ready to develop!

Congratulations! Your Desperados Destiny backend is up and running!
