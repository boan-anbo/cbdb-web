# Multi-stage build for NestJS server
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY libs/cbdb-core/package*.json ./libs/cbdb-core/

# Copy workspace configuration
COPY .npmrc* ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/server ./apps/server
COPY libs/cbdb-core ./libs/cbdb-core

# Build @cbdb/core first
WORKDIR /app/libs/cbdb-core
RUN npm run build

# Build server
WORKDIR /app/apps/server
RUN npm run build:web

# Production stage
FROM node:20-alpine

# Install better-sqlite3 dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY libs/cbdb-core/package*.json ./libs/cbdb-core/

# Install production dependencies only
RUN npm ci --production

# Copy built applications
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/libs/cbdb-core/dist ./libs/cbdb-core/dist

# Copy CBDB database
COPY cbdb_sql_db/latest.db /app/cbdb_sql_db/latest.db

# Create directory for app database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=18019
ENV CBDB_PATH=/app/cbdb_sql_db/latest.db
ENV APP_DB_PATH=/app/data/cbdb-desktop.db
ENV API_PREFIX=api
ENV ENABLE_SWAGGER=false
ENV LOG_LEVEL=info

# Expose port
EXPOSE 18019

# Set working directory to server
WORKDIR /app/apps/server

# Start the server
CMD ["node", "dist/main"]