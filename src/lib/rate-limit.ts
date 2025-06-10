import rateLimit from 'express-rate-limit';
import { NextApiRequest, NextApiResponse } from 'next';

type RateLimitOptions = {
  windowMs?: number; // Okno czasowe w milisekundach
  max?: number; // Maksymalna liczba zapytań w oknie czasowym
  message?: string; // Wiadomość zwracana po przekroczeniu limitu
  standardHeaders?: boolean; // Czy dołączać standardowe nagłówki limitów
  legacyHeaders?: boolean; // Czy dołączać przestarzałe nagłówki limitów
};

export function createRateLimiter({
  windowMs = 60 * 1000, // domyślnie 1 minuta
  max = 10, // domyślnie 10 zapytań na minutę
  message = 'Zbyt wiele zapytań, spróbuj ponownie później',
  standardHeaders = true,
  legacyHeaders = false,
}: RateLimitOptions = {}) {
  const limiter = rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders,
    legacyHeaders,
  });

  return function applyRateLimit(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<void>((resolve, reject) => {
      limiter(req, res, (result: Error | undefined) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve();
      });
    });
  };
}

// Predefiniowane limitery
export const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuta
  max: 60, // 60 zapytań na minutę
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 10, // 10 prób logowania na 15 minut
  message: 'Zbyt wiele prób logowania, spróbuj ponownie za 15 minut',
});

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuta
  max: 30, // 30 zapytań na minutę
});
