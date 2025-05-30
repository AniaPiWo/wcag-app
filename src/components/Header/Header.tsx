'use client'
import { useState } from 'react'
import Link from 'next/link'
import styles from './Header.module.scss'
import { ThemeSwitcher } from '../atoms/ThemeSwitcher/ThemeSwitcher'

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  return (

      <header className={styles.wrapper}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink} aria-label="WCAG Strona główna">
          <div className={styles.logo}>
            WCAG
          </div>
        </Link>

        <div id="menu_glowne" className={styles.menuDesktop}>
          <div className={styles.accessibilityControls}>
            <ThemeSwitcher />
          </div>
        </div>

        <div className={styles.menuMobile}>
          <button className={styles.mobilebutton} onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? 'Close' : 'Menu'}
          </button>
          <div
            className={`${styles.mobileMenuContent} ${
              isMobileMenuOpen ? styles.menuOpen : ''
            }`}
          >
            <div className={styles.accessibilityControlsMobile}>
              <ThemeSwitcher showLabels={true} />
            </div>
          </div>
        </div>
      </div>
    </header>

  )
}
