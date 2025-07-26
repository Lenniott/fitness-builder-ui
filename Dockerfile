# Fitness Builder UI - Dockerfile
# 
# Requirements:
# - Multi-stage build for optimized production image
# - Lightweight server for static files
# - Environment-based API configuration
# 
# Flow:
# - Build stage: Compile React app with Vite
# - Runtime stage: Serve with serve package
# - Environment variables control API endpoints

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with environment variables
ARG VITE_API_BASE_URL_LOCAL
ARG VITE_API_BASE_URL_NETWORK
ARG VITE_API_BASE_URL_TAILSCALE
ENV VITE_API_BASE_URL_LOCAL=$VITE_API_BASE_URL_LOCAL
ENV VITE_API_BASE_URL_NETWORK=$VITE_API_BASE_URL_NETWORK
ENV VITE_API_BASE_URL_TAILSCALE=$VITE_API_BASE_URL_TAILSCALE
RUN npm run build

# Runtime stage
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Create app directory
WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8888

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8888/ || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "8888"] 