# Multi-stage build dla aplikacji WCAG z Playwright
# Stage 1: Build
FROM node:20-slim AS builder

# Instalacja zależności systemowych dla buildu
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików package
COPY package*.json ./
COPY prisma ./prisma/

# Instalacja wszystkich zależności (potrzebne do buildu)
RUN npm ci

# Kopiowanie reszty aplikacji
COPY . .

# Budowanie aplikacji Next.js
RUN npm run build

# Usunięcie dev dependencies po buildzie
RUN npm prune --omit=dev

# Stage 2: Production z Playwright
FROM mcr.microsoft.com/playwright:v1.54.1-noble

# Instalacja Node.js 20
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie node_modules i buildu z poprzedniego stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/prisma ./prisma

# Ustawienie zmiennych środowiskowych
ENV NODE_ENV=production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Expose port (Railway może nadpisać przez zmienną środowiskową PORT)
EXPOSE 8080

# Uruchomienie aplikacji
CMD ["npm", "start"]
