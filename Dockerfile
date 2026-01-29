# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy prisma schema and generated client
COPY prisma ./prisma
COPY --from=builder /app/prisma/generated ./prisma/generated

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3333

# Start the application
CMD ["npm", "start"]
