FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build time
ENV NEXT_TELEMETRY_DISABLED=1

# Firebase Configuration (build-time)
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

# API Configuration (build-time)
ARG NEXT_PUBLIC_API_URL

# Set environment variables for build
ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBl6opoMvsIC7CSYu3gQeYfwDPWDkt1_S8
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=medicos-392d0.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=medicos-392d0
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=medicos-392d0.appspot.com
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef1234567890
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
ENV NEXT_PUBLIC_API_URL=https://api.medicosprep.in/api

# Install Playwright dependencies for PDF generation
RUN npm run postinstall

# Build the application
RUN npm run build

FROM base AS runner
WORKDIR /app

# Install necessary packages for Puppeteer/Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Runtime environment variables
# Firebase Configuration
ENV NEXT_PUBLIC_FIREBASE_API_KEY=""
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
ENV NEXT_PUBLIC_FIREBASE_APP_ID=""
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=""

# API Configuration
ENV NEXT_PUBLIC_API_URL=""

# Puppeteer/Chromium Configuration
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROME_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROMIUM_PATH=/usr/bin/chromium-browser
ENV GOOGLE_CHROME_SHIM=/usr/bin/chromium-browser

# Chromium remote pack URL (optional override)
ENV CHROMIUM_REMOTE_PACK_URL=""

# Browserless API Key (for external browser service if needed)
ENV BROWSERLESS_API_KEY=""

# Vercel-specific environment variables (if deploying to Vercel-compatible platform)
ENV VERCEL=""
ENV VERCEL_ENV=""

# Library path for Chromium dependencies
ENV LD_LIBRARY_PATH="/usr/lib:/lib"

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
