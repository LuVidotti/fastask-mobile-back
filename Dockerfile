# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy tsconfig for build
COPY tsconfig.json ./

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only and clean cache
RUN npm ci --omit=dev && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/cache/apk/*

# Copy prisma schema and generated client from builder
COPY --from=builder /app/prisma ./prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3333

# Start the application directly with node (not npm)
CMD ["node", "dist/src/server.js"]
