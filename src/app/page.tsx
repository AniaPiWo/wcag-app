import styles from "./page.module.scss";
import { Hero, Offer, Form, AboutMe, GoToForm } from "../components/index";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
          <Hero />
          <Form />
          <AboutMe />
          <Offer />
          <GoToForm />
      </main>
    </div>
  );
}
