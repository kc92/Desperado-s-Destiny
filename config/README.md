# CONFIG - Configuration Files

**Environment-Specific Configuration**

This directory contains configuration files for different deployment environments and services.

---

## Purpose

Centralized location for:
- Environment-specific configurations
- Service configurations (Nginx, PM2, Docker)
- CI/CD pipeline configurations
- Development tool configurations

---

## Expected Files

### Environment Configurations

**`.env.example`** - Template for environment variables
```env
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/desperados-destiny
MONGODB_TEST_URI=mongodb://localhost:27017/desperados-destiny-test

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Premium/Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (future)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**`.env.development`** - Development environment variables
**`.env.staging`** - Staging environment variables
**`.env.production`** - Production environment variables (never committed to git)

---

### Nginx Configuration

**`nginx.conf`** - Nginx reverse proxy configuration
```nginx
upstream backend {
  server backend:3000;
}

server {
  listen 80;
  server_name desperados-destiny.com;

  # Static files (React build)
  location / {
    root /var/www/client/build;
    try_files $uri /index.html;
  }

  # API routes
  location /api/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Socket.io WebSocket
  location /socket.io/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

---

### PM2 Configuration

**`pm2.config.js`** - PM2 process manager configuration
```javascript
module.exports = {
  apps: [
    {
      name: 'desperados-backend',
      script: './server/dist/index.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
```

---

### Docker Configuration

**`docker-compose.yml`** - Multi-container Docker setup
```yaml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/desperados
      - REDIS_HOST=redis
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:6
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf
      - ./client/build:/var/www/client/build
    depends_on:
      - backend

volumes:
  mongo-data:
```

---

### ESLint Configuration

**`eslint.config.js`** - Shared ESLint configuration
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // Custom rules
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

---

### Prettier Configuration

**`prettier.config.js`** - Code formatting configuration
```javascript
module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'auto',
};
```

---

### Jest Configuration

**`jest.config.js`** - Testing configuration
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server/tests', '<rootDir>/client/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'server/src/**/*.ts',
    'client/src/**/*.ts',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

---

## Security Notes

⚠️ **NEVER commit sensitive data:**
- `.env.production` should NEVER be committed
- Keep API keys, passwords, and secrets out of version control
- Use environment variables for all secrets
- Add `.env*` to `.gitignore` (except `.env.example`)

✅ **Best Practices:**
- Use `.env.example` as a template (with placeholder values)
- Store production secrets in hosting platform's environment variables
- Rotate secrets regularly
- Use different secrets for dev/staging/prod

---

**Status:** Phase 0 - Structure created, configuration files to be added in Phase 1
**Next Steps:** Create configuration files during Phase 1 setup

---

*Built by Kaine & Hawk*
*Last Updated: November 15, 2025*
