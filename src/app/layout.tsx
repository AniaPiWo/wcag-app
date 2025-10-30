import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Footer, Header, CookiesConsent } from "@/components";
import { ConditionalGoogleAnalytics } from "@/components/ConditionalGoogleAnalytics/ConditionalGoogleAnalytics";
import "./globals.scss";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Pokazuj fallback font natychmiast, potem swap
  preload: true, // Preload font dla szybszego ładowania
  fallback: ['system-ui', 'arial'], // Fallback fonts
});

export const metadata: Metadata = {
  metadataBase: new URL('https://wcag.co'),
  title: "Audyt i wdrożenie dostępności cyfrowej WCAG 2.2 | Profesjonalne usługi",
  description: "Wykonuję audyty dostępności stron internetowych zgodne z WCAG 2.2. Wykonuję wdrożenia i tworzę w pełni dostępne strony internetowe.",
  keywords: "WCAG 2.2, dostępność cyfrowa, audyt dostępności, wdrożenie WCAG, strony internetowe, e-commerce, dostępne strony",
  authors: [{ name: "Seahorse" }],
  creator: "Seahorse",
  publisher: "Seahorse",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Audyt i wdrożenie dostępności cyfrowej WCAG 2.2",
    description: "Profesjonalne usługi w zakresie dostępności cyfrowej. Audyty, wdrożenia i tworzenie dostępnych stron zgodnych z WCAG 2.2.",
    url: "https://wcag.co",
    siteName: "WCAG.co",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: '/images/wcag.png',
        width: 1200,
        height: 630,
        alt: 'WCAG.co - Audyt i wdrożenie dostępności cyfrowej',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Resource hints dla lepszej wydajności */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        <meta
          name="description"
          content="Przeprowadzam profesjonalne audyty dostępności stron internetowych zgodne z WCAG 2.2. Pomagam wdrożyć rozwiązania, które zapewniają pełną dostępność i zgodność z przepisami."
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
     <body className={geistSans.className}>
        <CookiesConsent />
        <Header />
        {children}
        <Footer />
        <ConditionalGoogleAnalytics gaId="G-KXXM92H52S" />
      </body>
    </html>
  );
}
