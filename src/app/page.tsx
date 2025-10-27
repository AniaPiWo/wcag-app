import type { Metadata } from "next";
import dynamic from 'next/dynamic';
import styles from "./page.module.scss";
import { Hero, Form, WhyWorth } from "../components/index";

// Lazy load komponentów poniżej fold (below the fold)
const Offer = dynamic(() => import("../components/index").then(mod => ({ default: mod.Offer })), {
  loading: () => <div style={{ minHeight: '400px' }} />
});
const AboutMe = dynamic(() => import("../components/index").then(mod => ({ default: mod.AboutMe })), {
  loading: () => <div style={{ minHeight: '400px' }} />
});
const MyProjects = dynamic(() => import("../components/index").then(mod => ({ default: mod.MyProjects })), {
  loading: () => <div style={{ minHeight: '500px' }} />
});
const FAQ = dynamic(() => import("../components/index").then(mod => ({ default: mod.FAQ })), {
  loading: () => <div style={{ minHeight: '400px' }} />
});
const GoToForm = dynamic(() => import("../components/index").then(mod => ({ default: mod.GoToForm })), {
  loading: () => <div style={{ minHeight: '200px' }} />
});

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
