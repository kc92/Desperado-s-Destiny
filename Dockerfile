# Dockerfile for Railway deployment
FROM node:20-slim

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
RUN cd server && npm run build:ci

# Expose port
EXPOSE 5001

# Start server
WORKDIR /app/server
CMD ["npm", "start"]
