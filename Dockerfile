# Multi-stage Dockerfile: build Next.js inside image, then run standalone output

# Build stage (full Node for tooling)
FROM node:20 AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependency manifests and install (including dev for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the entire project
COPY . .

# Generate Prisma client and build Next.js
RUN npx prisma@5 generate
RUN npm run build

# Runtime stage (slim Node to reduce image size)
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install openssl for Prisma
USER root
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Use non-root user
USER node

# Copy built output from builder (standalone already includes required node_modules)
COPY --chown=node:node --from=builder /app/.next/standalone/ ./
COPY --chown=node:node --from=builder /app/.next/static/ ./.next/static/
COPY --chown=node:node --from=builder /app/public/ ./public/

# Expose port and run standalone server
EXPOSE 3000
CMD ["node", "server.js"]
