import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Footer, Header, CookiesConsent } from "@/components";
import { ConditionalGoogleAnalytics } from "@/components/ConditionalGoogleAnalytics/ConditionalGoogleAnalytics";
import "./globals.scss";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audyt i wdrożenie dostępności cyfrowej WCAG 2.2 | Profesjonalne usługi",
  description: "Oferuję audyty dostępności stron internetowych zgodne z WCAG 2.2. Wykonuję wdrożenia i tworzę w pełni dostępne strony internetowe.",
  keywords: "WCAG 2.2, dostępność cyfrowa, audyt dostępności, wdrożenie WCAG, strony internetowe, e-commerce, dostępne strony",
  authors: [{ name: "Seahorse" }],
  creator: "Seahorse",
  publisher: "Seahorse",
  openGraph: {
    title: "Audyt i wdrożenie dostępności cyfrowej WCAG 2.2",
    description: "Profesjonalne usługi w zakresie dostępności cyfrowej. Audyty, wdrożenia i tworzenie dostępnych stron zgodnych z WCAG 2.2.",
    url: "https://wcag.co",
    siteName: "WCAG.co",
    locale: "pl_PL",
    type: "website",
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
    <html lang="pl" data-theme="light">
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
