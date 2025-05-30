'use client'
import styles from "./PourWave.module.scss";

const principles = [
    {
      letter: "P",
      label: "Perceivable",
      labelPL: "Postrzegalny",
      description: "Treści muszą być możliwe do odebrania zmysłami – wizualnie lub alternatywnie.",
    },
    {
      letter: "O",
      label: "Operable",
      labelPL: "Operatywny",
      description: "Interfejs musi umożliwiać obsługę różnymi metodami, np. klawiaturą.",
    },
    {
      letter: "U",
      label: "Understandable",
      labelPL: "Zrozumiały",
      description: "Zawartość i interakcje powinny być jasne i przewidywalne.",
    },
    {
      letter: "R",
      label: "Robust",
      labelPL: "Solidny",
      description: "Treści powinny działać niezawodnie w różnych środowiskach i narzędziach.",
    },
  ];


export const PourWave = () => {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {principles.map((principle, index) => (
          <div key={index} className={styles.card}>
            <span className={styles.letter}>{principle.letter}</span>
            <h3 className={styles.title}>{principle.label}</h3>
            <span className={styles.labelPL}>{principle.labelPL}</span>
            <p className={styles.description}>{principle.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}