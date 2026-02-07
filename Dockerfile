# Multi-stage Dockerfile: build Next.js inside image, then run standalone output

# Build stage
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

# Runtime stage
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built output from builder
COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static/ ./.next/static/
COPY --from=builder /app/public/ ./public/

# Expose port and run standalone server
EXPOSE 3000
CMD ["node", "server.js"]
