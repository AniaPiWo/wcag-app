import styles from "./page.module.scss";
import { Hero, Offer, Form, AboutMe, GoToForm, FAQ, MyProjects } from "../components/index";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
          <Hero />
          <Form />
          <Offer />
          <MyProjects />
          <AboutMe />
          <FAQ />
          <GoToForm />
      </main>
    </div>
  );
}
