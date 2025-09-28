# Multi-stage build for React frontend
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/desktop/package*.json ./apps/desktop/
COPY libs/cbdb-core/package*.json ./libs/cbdb-core/

# Copy workspace configuration
COPY .npmrc* ./
COPY tsconfig*.json ./

# Copy web-specific npm config to skip electron-builder
COPY deployment/web/frontend/.npmrc.web ./.npmrc

# Install dependencies (skip electron-builder postinstall)
RUN npm ci --ignore-scripts

# Copy source code
COPY apps/desktop ./apps/desktop
COPY libs/cbdb-core ./libs/cbdb-core

# Copy public assets (favicon, icons, manifest, GIS data)
COPY apps/desktop/public ./apps/desktop/public

# Copy web-specific Vite config
COPY deployment/web/frontend/vite.config.mts ./apps/desktop/vite.config.mts

# Build @cbdb/core first
WORKDIR /app/libs/cbdb-core
RUN npm run build

# Build frontend for web (no Electron)
WORKDIR /app/apps/desktop
RUN npx vite build --config vite.config.mts

# Production stage with nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY deployment/web/frontend/nginx.conf /etc/nginx/conf.d/

# Copy built React app
COPY --from=builder /app/apps/desktop/dist/render /usr/share/nginx/html

# Replace manifest with web-specific version
COPY deployment/web/frontend/manifest.web.json /usr/share/nginx/html/manifest.json

# Create runtime config script
RUN echo 'window.API_CONFIG = { API_URL: "/api" };' > /usr/share/nginx/html/config.js

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]