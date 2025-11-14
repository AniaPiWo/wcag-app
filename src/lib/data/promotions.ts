export interface Promotion {
  id: string;
  title: string;
  description: string;
  originalPrice: string;
  promotionalPrice: string;
  currency: string;
  validUntil?: string;
  conditions: string[];
  isActive: boolean;
  category: 'audit' | 'implementation' | 'development' | 'landing';
}

export const currentPromotions: Promotion[] = [
  {
    id: 'landing-onepage-2025',
    title: 'Landing Page One-Page - Promocja',
    description: 'Audyt dostępności cyfrowej WCAG 2.2 strony typu landing page (jedna strona)',
    originalPrice: 'od 599',
    promotionalPrice: '499',
    currency: 'zł netto',
    validUntil: '',
    conditions: [

    ],
    isActive: true,
    category: 'audit'
  }
];

// Funkcja pomocnicza do pobierania aktywnych promocji
export function getActivePromotions(): Promotion[] {
  return currentPromotions.filter(promo => promo.isActive);
}

// Funkcja pomocnicza do pobierania promocji według kategorii
export function getPromotionsByCategory(category: Promotion['category']): Promotion[] {
  return currentPromotions.filter(promo => promo.isActive && promo.category === category);
}

// Funkcja pomocnicza do pobierania konkretnej promocji
export function getPromotionById(id: string): Promotion | undefined {
  return currentPromotions.find(promo => promo.id === id && promo.isActive);
}
