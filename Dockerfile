# Dockerfile for Railway deployment
FROM node:20-slim

# Cache bust to force fresh build
ARG CACHEBUST=1

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Install dependencies without running scripts
RUN npm install --ignore-scripts
RUN cd shared && npm install --ignore-scripts
RUN cd server && npm install --ignore-scripts

# Copy source code
COPY shared/ ./shared/
COPY server/ ./server/

# Build shared package
RUN cd shared && npm run build

# Build server using swc (no type checking)
WORKDIR /app/server
RUN echo "=== FILES IN SRC ===" && ls -la src/ | head -20 && \
    echo "=== RUNNING BUILD ===" && npm run build:ci && \
    echo "=== FILES IN DIST ===" && ls -la dist/ | head -30 && \
    echo "=== CHECKING SERVER.JS ===" && ls -la dist/server.js

# Expose port
EXPOSE 5001

# Start server
WORKDIR /app/server
CMD ["node", "dist/server.js"]
