import type { Metadata } from "next";
import styles from "./page.module.scss";
import { Hero, Offer, Form, AboutMe, GoToForm, FAQ, MyProjects, WhyWorth } from "../components/index";

export const metadata: Metadata = {
  title: "Audyt i wdrożenie dostępności cyfrowej WCAG 2.2 | Profesjonalne usługi",
   description: "Wykonuję audyty dostępności stron internetowych zgodne z WCAG 2.2. Wykonuję wdrożenia i tworzę w pełni dostępne strony internetowe.",
  keywords: "WCAG 2.2, dostępność cyfrowa, audyt dostępności, wdrożenie WCAG, strony internetowe, e-commerce, dostępne strony",
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

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
          <Hero />
          <Form />
          <WhyWorth />
          <Offer />
          <AboutMe />
          <MyProjects />
          <FAQ />
          <GoToForm />
      </main>
    </div>
  );
}
