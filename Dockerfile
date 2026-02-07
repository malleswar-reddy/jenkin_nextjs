# Runtime-only Docker image; expects prebuilt Next.js artifacts present in the context
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built output (ensure you ran `npm run build` on host before building this image)
COPY next.config.ts ./
COPY .next/standalone/ ./
COPY .next/static/ ./.next/static/
COPY public/ ./public/

# Expose port and run standalone server
EXPOSE 3000
CMD ["node", "server.js"]
