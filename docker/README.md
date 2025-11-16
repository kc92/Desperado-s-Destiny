# DOCKER - Containerization Files

**Docker Configurations and Dockerfiles**

This directory contains Docker-related files for containerizing the application.

---

## Purpose

Containerize each service (backend, frontend, database, cache) for:
- Consistent development environments
- Easy deployment
- Isolated services
- Scalability

---

## Expected Files

### Backend Dockerfile

**`Dockerfile.server`** - Backend Node.js container
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY server/package*.json ./
RUN npm ci

# Copy source code
COPY server/ ./
COPY shared/ ../shared/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Security: Run as non-root user
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

---

### Frontend Dockerfile

**`Dockerfile.client`** - React build container
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY client/package*.json ./
RUN npm ci

# Copy source code
COPY client/ ./
COPY shared/ ../shared/

# Build React app
RUN npm run build

# Production stage - Nginx to serve static files
FROM nginx:alpine

# Copy built React app
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx config
COPY config/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

### Docker Compose

**`docker-compose.yml`** - Multi-container orchestration
```yaml
version: '3.8'

services:
  # Backend API
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
    container_name: dd-backend
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongodb:27017/desperados-destiny
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - mongodb
      - redis
    networks:
      - app-network
    restart: unless-stopped

  # Frontend (React)
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.client
    container_name: dd-frontend
    ports:
      - '80:80'
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  # MongoDB Database
  mongodb:
    image: mongo:6
    container_name: dd-mongodb
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db
      - ./docker/mongo-init:/docker-entrypoint-initdb.d
    environment:
      MONGO_INITDB_DATABASE: desperados-destiny
    networks:
      - app-network
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: dd-redis
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    networks:
      - app-network
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: dd-nginx
    ports:
      - '8080:80'
      - '443:443'
    volumes:
      - ./config/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./client/build:/usr/share/nginx/html
    depends_on:
      - backend
      - frontend
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
  redis-data:
```

---

### Development Docker Compose

**`docker-compose.dev.yml`** - Development environment with hot reload
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
      target: builder # Use build stage, not production
    command: npm run dev # Hot reload with nodemon
    volumes:
      - ./server:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
    ports:
      - '3000:3000'
      - '9229:9229' # Node debugger port

  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.client
      target: builder
    command: npm run dev # Vite dev server with HMR
    volumes:
      - ./client:/app
      - /app/node_modules
    ports:
      - '5173:5173' # Vite dev server

  mongodb:
    image: mongo:6
    ports:
      - '27017:27017'
    volumes:
      - mongo-dev-data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  mongo-dev-data:
```

---

### MongoDB Initialization

**`mongo-init/init.js`** - Initialize MongoDB with default data
```javascript
// Create database and collections
db = db.getSiblingDB('desperados-destiny');

// Create collections
db.createCollection('users');
db.createCollection('characters');
db.createCollection('gangs');
db.createCollection('territories');

// Create indexes
db.characters.createIndex({ userId: 1 }, { unique: true });
db.characters.createIndex({ name: 1 }, { unique: true });
db.gangs.createIndex({ name: 1 }, { unique: true });

print('Database initialized successfully');
```

---

### .dockerignore

**`.dockerignore`** - Exclude files from Docker build
```
node_modules
npm-debug.log
.env
.env.local
.env.production
dist
build
.git
.gitignore
README.md
*.md
.vscode
.idea
coverage
.DS_Store
```

---

## Docker Commands Cheat Sheet

### Development
```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Rebuild containers
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Production
```bash
# Start production containers
docker-compose up -d

# Stop production containers
docker-compose down

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart backend

# Scale backend instances
docker-compose up -d --scale backend=3
```

### Maintenance
```bash
# Remove all containers and volumes (WARNING: destroys data)
docker-compose down -v

# Prune unused images and containers
docker system prune -a

# Access MongoDB shell
docker exec -it dd-mongodb mongosh desperados-destiny

# Access Redis CLI
docker exec -it dd-redis redis-cli

# Access backend shell
docker exec -it dd-backend sh
```

---

## Multi-Stage Build Benefits

✅ **Smaller Images:** Production image doesn't include dev dependencies or source code
✅ **Faster Builds:** Docker caches layers, rebuilds only what changed
✅ **Security:** Fewer packages = smaller attack surface
✅ **Efficiency:** Separate build and runtime environments

---

## Network Architecture

```
┌─────────────────┐
│   Nginx :80     │ ← Public entry point
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───────┐
│React │  │ Backend  │
│ :80  │  │  :3000   │
└──────┘  └─┬──────┬─┘
             │      │
         ┌───▼──┐ ┌─▼────┐
         │Mongo │ │Redis │
         │:27017│ │:6379 │
         └──────┘ └──────┘

All containers communicate via app-network (bridge)
```

---

## Security Best Practices

✅ **Non-root user:** Run containers as non-root user
✅ **Minimal base images:** Use Alpine Linux (small, secure)
✅ **Secrets management:** Never hardcode secrets, use environment variables
✅ **Update regularly:** Keep base images updated
✅ **Scan images:** Use `docker scan` to detect vulnerabilities
✅ **Network isolation:** Use custom networks, not default bridge

---

**Status:** Phase 0 - Structure created, Dockerfiles to be created in Phase 1
**Next Steps:** Create Dockerfiles and docker-compose configurations during Phase 1

---

*Built by Kaine & Hawk*
*Last Updated: November 15, 2025*
