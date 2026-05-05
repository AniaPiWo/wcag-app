# WCAG Audit App

Narzędzie do automatycznych i manualnych audytów dostępności stron internetowych zgodnych ze standardem WCAG 2.2. Aplikacja jest dostępna pod adresem [wcag.co](https://wcag.co).

## Funkcjonalności

- **Automatyczny audyt** — skanowanie strony przez Playwright + axe-core, wyniki wysyłane emailem
- **Analiza AI** — podsumowanie wyników audytu przez GPT-4o w języku polskim
- **Manualny audyt WCAG** — panel admina z checklistą kryteriów na poziomach A, AA, AAA
- **Raport dla klienta** — generowanie raportu PDF z wynikami audytu manualnego
- **Chatbot** — asystent dostępności oparty na GPT-4o
- **Panel admina** — zarządzanie audytami automatycznymi i manualnymi, podgląd sesji chatu

## Stack technologiczny

| Warstwa | Technologia |
|---------|------------|
| Framework | Next.js 15 (App Router) |
| Język | TypeScript |
| Baza danych | PostgreSQL (CockroachDB) + Prisma ORM |
| Audyt dostępności | Playwright + axe-core |
| AI | OpenAI GPT-4o |
| Email | Resend |
| Autentykacja | JWT (jose) — sesja admina |
| Stylowanie | SCSS Modules |
| Walidacja formularzy | React Hook Form + Zod |
| PDF | @react-pdf/renderer |

## Wymagania

- Node.js 20+
- PostgreSQL (lub CockroachDB)
- Konto OpenAI
- Konto Resend

## Uruchomienie lokalne

```bash
# Instalacja zależności
npm install

# Konfiguracja zmiennych środowiskowych
cp .env.example .env
# Uzupełnij wartości w .env

# Generowanie klienta Prisma i migracja bazy danych
npx prisma migrate dev

# Uruchomienie serwera deweloperskiego
npm run dev
```

Aplikacja dostępna pod `http://localhost:3000`.

## Zmienne środowiskowe

```env
# Baza danych
DATABASE_URL=postgresql://...

# Autentykacja admina
SESSION_SECRET=        # min. 32 znaki, wygeneruj: openssl rand -base64 32
ADMIN_LOGIN=
ADMIN_PASSWORD_HASH=   # hash bcrypt, wygeneruj: npm run generate-password
API_SECRET_KEY=

# OpenAI
OPENAI_API_KEY=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Google Analytics (opcjonalne)
NEXT_PUBLIC_GA_ID=
```

Aby wygenerować hash hasła admina:

```bash
npm run generate-password
```

## Struktura projektu

```
src/
├── app/
│   ├── admin/          # Panel administracyjny (chroniony JWT)
│   ├── api/            # Route handlers
│   │   ├── audit/      # Automatyczny audyt (Playwright + axe-core)
│   │   ├── queue-audit/# Kolejkowanie audytów
│   │   ├── chat/       # Chatbot AI
│   │   └── email/      # Wysyłka emaili
│   └── page.tsx        # Landing page
├── components/
│   ├── atoms/          # Komponenty bazowe (Button, ThemeSwitcher...)
│   └── landing/        # Sekcje strony głównej
├── lib/
│   ├── ai/             # Integracja OpenAI
│   ├── auth/           # Sesja admina (JWT)
│   ├── db/             # Warstwa dostępu do danych
│   └── wcag_checklist/ # Checklisty WCAG A / AA / AAA
└── middleware.ts        # Ochrona tras /admin, nagłówki bezpieczeństwa
```

## Bezpieczeństwo

- Trasy `/admin/*` chronione przez middleware JWT
- CSRF protection dla mutujących żądań
- Nagłówki bezpieczeństwa: CSP, HSTS, X-Frame-Options, Permissions-Policy
- Timing-safe compare dla API key
- Walidacja i sanitizacja danych wejściowych przez Zod
- SSRF protection w endpoincie proxy
