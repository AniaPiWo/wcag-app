import styles from "./page.module.scss";
import { Hero, Offer, Form, AboutMe, GoToForm, FAQ } from "../components/index";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
          <Hero />
          <Form />
          <AboutMe />
          <Offer />
          <GoToForm />
          <FAQ />
      </main>
    </div>
  );
}
