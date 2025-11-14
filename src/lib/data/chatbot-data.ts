import { offers, type Offer } from './offers';
import { currentPromotions, getActivePromotions, type Promotion } from './promotions';
import { faqData, searchFAQ, type FAQItem } from './faq';

// Główna struktura danych dla chatbota
export interface ChatbotKnowledgeBase {
  offers: Offer[];
  promotions: Promotion[];
  faq: FAQItem[];
  contactInfo: ContactInfo;
  businessInfo: BusinessInfo;
}

export interface ContactInfo {
  website: string;
  email: string;
  phone?: string;
  workingHours: string;
  responseTime: string;
}

export interface BusinessInfo {
  name: string;
  specialization: string[];
  experience: string;
  certifications: string[];
  location: string;
}

// Dane kontaktowe i firmowe
export const contactInfo: ContactInfo = {
  website: 'wcag.co',
  email: 'kontakt@wcag.co',
  workingHours: 'Poniedziałek - Piątek, 9:00 - 17:00',
  responseTime: 'Odpowiadam na zapytania w ciągu 24 godzin w dni robocze'
};

export const businessInfo: BusinessInfo = {
  name: 'WCAG.co',
  specialization: [
    'Audyty dostępności WCAG 2.2',
    'Wdrożenia dostępności cyfrowej',
    'Tworzenie dostępnych stron internetowych',
    'Konsultacje w zakresie dostępności',
    'Szkolenia WCAG'
  ],
  experience: 'Specjalizuję się w dostępności cyfrowej i WCAG 2.2',
  certifications: [
    'Certyfikowany specjalista WCAG 2.2',
    'Ekspert dostępności cyfrowej'
  ],
  location: 'Polska (usługi online)'
};

// Główna baza wiedzy
export const chatbotKnowledgeBase: ChatbotKnowledgeBase = {
  offers,
  promotions: getActivePromotions(),
  faq: faqData,
  contactInfo,
  businessInfo
};

// Funkcje pomocnicze dla chatbota
export function findRelevantOffers(query: string): Offer[] {
  const searchTerm = query.toLowerCase();
  return offers.filter(offer => 
    offer.title.toLowerCase().includes(searchTerm) ||
    offer.description.toLowerCase().includes(searchTerm) ||
    offer.features.some(feature => feature.toLowerCase().includes(searchTerm))
  );
}

export function findRelevantPromotions(query: string): Promotion[] {
  const searchTerm = query.toLowerCase();
  return getActivePromotions().filter(promo => 
    promo.title.toLowerCase().includes(searchTerm) ||
    promo.description.toLowerCase().includes(searchTerm) ||
    promo.category.toLowerCase().includes(searchTerm)
  );
}

export function getQuickAnswers(query: string): string[] {
  const searchTerm = query.toLowerCase();
  const answers: string[] = [];

  // Sprawdź promocje
  if (searchTerm.includes('promocja') || searchTerm.includes('oferta specjalna') || searchTerm.includes('landing')) {
    const landingPromo = currentPromotions.find(p => p.category === 'landing' && p.isActive);
    if (landingPromo) {
      answers.push(`🎉 Aktualna promocja: ${landingPromo.title} za ${landingPromo.promotionalPrice} ${landingPromo.currency} (zamiast ${landingPromo.originalPrice})`);
    }
  }

  // Sprawdź ceny
  if (searchTerm.includes('cena') || searchTerm.includes('koszt') || searchTerm.includes('ile kosztuje')) {
    answers.push('💰 Cennik usług:');
    offers.forEach(offer => {
      answers.push(`• ${offer.title}: ${offer.price.amount} ${offer.price.currency}`);
    });
  }

  // Sprawdź czas realizacji
  if (searchTerm.includes('czas') || searchTerm.includes('ile trwa') || searchTerm.includes('termin')) {
    answers.push('⏱️ Typowe czasy realizacji:');
    answers.push('• Audyt dostępności: 3-5 dni roboczych');
    answers.push('• Wdrożenie dostępności: 1-4 tygodnie');
    answers.push('• Nowa strona dostępna: 2-6 tygodni');
  }

  return answers;
}

// Export wszystkich danych
export { offers, currentPromotions, faqData, searchFAQ };
