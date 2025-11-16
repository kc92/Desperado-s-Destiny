# Desperados Destiny - Backend Server

## Overview

Production-ready Node.js/TypeScript backend for the Desperados Destiny MMORPG. Built with Express.js, MongoDB, Redis, and Socket.io.

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x (Strict Mode)
- **Framework**: Express.js
- **Database**: MongoDB 6.x (Mongoose ODM)
- **Cache**: Redis 7.x
- **Real-time**: Socket.io 4.x
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
server/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.ts         # Environment config & validation
│   │   ├── database.ts      # MongoDB connection
│   │   └── redis.ts         # Redis connection
│   ├── controllers/         # Request handlers
│   │   └── health.controller.ts
│   ├── middleware/          # Express middleware
│   │   ├── asyncHandler.ts  # Async error wrapper
│   │   ├── errorHandler.ts  # Centralized error handling
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   ├── requestLogger.ts # HTTP request logging
│   │   └── index.ts         # Middleware exports
│   ├── models/              # Mongoose models (to be added)
│   ├── routes/              # API routes
│   │   ├── health.routes.ts
│   │   └── index.ts
│   ├── services/            # Business logic (to be added)
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── logger.ts        # Winston logger
│   │   └── responseHelpers.ts
│   └── server.ts            # Main server entry point
├── tests/                   # Test files
│   ├── setup.ts
│   ├── server.test.ts
│   └── middleware/
├── .env                     # Environment variables (local)
├── .env.example             # Environment template
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- MongoDB 6.x running locally or remotely
- Redis 7.x running locally or remotely

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment template:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/desperados-destiny
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

### Running the Server

#### Development Mode
```bash
npm run dev
```
Server will start on `http://localhost:5000` with hot reload enabled.

#### Production Build
```bash
npm run build
npm start
```

#### Type Checking
```bash
npm run typecheck
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status including database connections.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456,
    "services": {
      "database": {
        "status": "connected",
        "latency": 10
      },
      "redis": {
        "status": "connected",
        "latency": 5
      }
    },
    "version": "1.0.0",
    "environment": "development"
  }
}
```

### Root
```
GET /
```
Returns API information.

## Architecture Highlights

### Error Handling
- Centralized error handling middleware
- Custom `AppError` class for operational errors
- Automatic parsing of Mongoose validation errors
- Stack traces in development mode only

### Security
- Helmet for security headers
- CORS with configurable origins
- Rate limiting (global, auth, and API-specific)
- Input validation ready
- Cookie parsing with security options

### Logging
- Winston logger with multiple transports
- Different log levels per environment
- File rotation in production
- HTTP request logging with Morgan
- Structured JSON logging

### Database
- MongoDB with Mongoose ODM
- Connection pooling
- Automatic retry logic
- Health checks
- Graceful shutdown

### Redis
- Connection with automatic reconnection
- Health check endpoint
- Prepared for session storage and caching

### Type Safety
- Full TypeScript with strict mode
- No `any` types allowed
- Comprehensive type definitions
- API response types
- Request/Response extensions

### Testing
- Jest test framework
- Supertest for API testing
- In-memory MongoDB for tests
- Test setup and teardown
- Coverage reporting

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/desperados-destiny |
| `REDIS_URL` | Redis connection URL | redis://localhost:6379 |
| `JWT_SECRET` | Secret for JWT signing | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `LOG_LEVEL` | Winston log level | info |

## Development Guidelines

### Adding New Routes

1. Create route file in `src/routes/`:
```typescript
import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';

const router = Router();
router.get('/', getUsers);

export default router;
```

2. Add controller in `src/controllers/`:
```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware';
import { sendSuccess } from '../utils/responseHelpers';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  // Your logic here
  return sendSuccess(res, data);
});
```

3. Register route in `src/routes/index.ts`:
```typescript
import userRoutes from './user.routes';
router.use('/users', apiRateLimiter, userRoutes);
```

### Error Handling

Always use `asyncHandler` for async routes:
```typescript
export const myRoute = asyncHandler(async (req, res) => {
  // Errors automatically caught and passed to error middleware
  throw new AppError('Something went wrong', HttpStatus.BAD_REQUEST);
});
```

### Response Helpers

Use standardized response helpers:
```typescript
import { sendSuccess, sendCreated, sendError } from '../utils/responseHelpers';

// Success response
sendSuccess(res, data, 'Optional message');

// Created response (201)
sendCreated(res, data, 'Resource created');

// Error response
sendError(res, 'Error message', HttpStatus.BAD_REQUEST);
```

## Graceful Shutdown

The server handles graceful shutdown on:
- `SIGTERM` (Docker, Kubernetes)
- `SIGINT` (Ctrl+C)
- Uncaught exceptions
- Unhandled promise rejections

Shutdown process:
1. Close Socket.io connections
2. Stop accepting new requests
3. Close HTTP server
4. Disconnect from MongoDB
5. Disconnect from Redis
6. Exit process

## Performance Considerations

- Connection pooling for MongoDB (10 max, 2 min)
- Redis connection reuse
- Rate limiting to prevent abuse
- Request/response compression ready
- Static file serving ready

## Security Features

- Security headers via Helmet
- CORS protection
- Rate limiting (global and route-specific)
- Input validation framework ready
- JWT authentication ready
- Password hashing with bcrypt ready
- SQL injection protection (NoSQL)
- XSS protection via sanitization ready

## Next Steps

This backend foundation is production-ready. Next sprint should focus on:

1. Authentication system (JWT, refresh tokens)
2. User management (registration, login, profiles)
3. Game-specific models (Character, Destiny Deck, etc.)
4. Real-time game logic with Socket.io
5. Game state management
6. Battle/action resolution system

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify network connectivity

### Redis Connection Failed
- Ensure Redis is running: `redis-server`
- Check Redis URL in `.env`
- Verify network connectivity

### Port Already in Use
- Change `PORT` in `.env`
- Kill process using port: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)

### TypeScript Errors
- Run type checking: `npm run typecheck`
- Rebuild: `npm run build`
- Check `tsconfig.json` settings

## Contributing

- Follow TypeScript strict mode
- Write tests for new features
- Use ESLint rules
- Document complex logic
- Use meaningful commit messages

## License

UNLICENSED - Private Project
