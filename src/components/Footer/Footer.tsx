'use client'
import styles from './Footer.module.scss'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          &copy; {currentYear} Seahorse. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
