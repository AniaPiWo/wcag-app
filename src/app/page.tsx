import styles from "./page.module.scss";
import { Hero, Offer, Form, AboutMe, GoToForm, FAQ, MyProjects, WhyWorth } from "../components/index";

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
