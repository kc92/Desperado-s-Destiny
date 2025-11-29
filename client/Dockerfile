# Multi-stage Dockerfile for React Frontend
# Stage 1: Development
FROM node:18-alpine AS development

WORKDIR /app

# Copy shared package first (dependency)
COPY ./shared /app/shared

# Copy client package files
COPY ./client/package*.json ./

# Install all dependencies (using npm install for workspace compatibility)
RUN npm install

# Build shared package
RUN cd /app/shared && npm install && npm run build || true

# Copy client source code
COPY ./client .

# Expose Vite dev server port
EXPOSE 5173

# Start development server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 2: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 3: Production with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
