# Dockerfile dla aplikacji WCAG z Playwright
FROM node:20-slim

# Instalacja zależności systemowych wymaganych przez Playwright
RUN apt-get update && apt-get install -y \
    # Podstawowe narzędzia
    wget \
    gnupg \
    ca-certificates \
    # Zależności Playwright
    libglib2.0-0 \
    libgobject-2.0-0 \
    libnspr4 \
    libnss3 \
    libnssutil3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libexpat1 \
    libatspi2.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxcb1 \
    libxkbcommon0 \
    libasound2 \
    libcups2 \
    libdrm2 \
    libxshmfence1 \
    libpango-1.0-0 \
    libcairo2 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików package
COPY package*.json ./
COPY prisma ./prisma/

# Instalacja wszystkich zależności (potrzebne do buildu)
RUN npm ci

# Instalacja przeglądarek Playwright z zależnościami systemowymi
RUN npx playwright install --with-deps chromium

# Kopiowanie reszty aplikacji
COPY . .

# Budowanie aplikacji Next.js
RUN npm run build

# Usunięcie dev dependencies po buildzie
RUN npm prune --omit=dev

# Ustawienie zmiennych środowiskowych
ENV NODE_ENV=production

# Expose port (Railway może nadpisać przez zmienną środowiskową PORT)
EXPOSE 8080

# Uruchomienie aplikacji
CMD ["npm", "start"]
