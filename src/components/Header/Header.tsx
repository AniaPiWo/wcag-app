'use client'
import { useState, useEffect } from 'react'
import styles from './Header.module.scss'
import { ThemeSwitcher } from '../atoms/ThemeSwitcher/ThemeSwitcher'
import { Logo } from '../Logo/Logo'

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    // Pobierz wysokość nagłówka po załadowaniu strony
    const header = document.querySelector('header')
    if (header) {
      setHeaderHeight(header.offsetHeight)
    }

    // Aktualizuj wysokość nagłówka przy zmianie rozmiaru okna
    const handleResize = () => {
      if (header) {
        setHeaderHeight(header.offsetHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }
  
  // Funkcja do płynnego przewijania z uwzględnieniem wysokości nagłówka
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    const section = document.getElementById(sectionId)
    
    if (section) {
      // Zamknij menu mobilne, jeśli jest otwarte
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
      
      // Oblicz pozycję sekcji z uwzględnieniem wysokości nagłówka
      const sectionTop = section.getBoundingClientRect().top + window.pageYOffset
      const offsetTop = sectionTop - headerHeight - 20 // 20px dodatkowego marginesu
      
      // Przewiń do sekcji
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  return (

      <header className={styles.wrapper}>
      <div className={styles.container}>
        <Logo href="/" className={styles.logoLink} />

        <div id="menu_glowne" className={styles.menuDesktop}>
          <nav className={styles.navigation}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <a href="#form" className={styles.navLink} onClick={(e) => scrollToSection(e, 'form')}>Audyt</a>
              </li>
              <li className={styles.navItem}>
                <a href="#aboutMe" className={styles.navLink} onClick={(e) => scrollToSection(e, 'aboutMe')}>O mnie</a>
              </li>
              <li className={styles.navItem}>
                <a href="#Offer" className={styles.navLink} onClick={(e) => scrollToSection(e, 'Offer')}>Oferta</a>
              </li>
              <li className={styles.navItem}>
                <a href="#faq" className={styles.navLink} onClick={(e) => scrollToSection(e, 'faq')}>FAQ</a>
              </li>
            </ul>
          </nav>
          <div className={styles.accessibilityControls}>
            <ThemeSwitcher />
          </div>
        </div>

        <div className={styles.menuMobile}>
          <button className={styles.mobilebutton} onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? 'Zamknij' : 'Menu'}
          </button>
          <div
            className={`${styles.mobileMenuContent} ${
              isMobileMenuOpen ? styles.menuOpen : ''
            }`}
          >
            <nav className={styles.mobileNavigation}>
              <ul className={styles.mobileNavList}>
                <li className={styles.mobileNavItem}>
                  <a href="#form" className={styles.mobileNavLink} onClick={(e) => scrollToSection(e, 'form')}>Audyt</a>
                </li>
                <li className={styles.mobileNavItem}>
                  <a href="#aboutMe" className={styles.mobileNavLink} onClick={(e) => scrollToSection(e, 'aboutMe')}>O mnie</a>
                </li>
                <li className={styles.mobileNavItem}>
                  <a href="#Offer" className={styles.mobileNavLink} onClick={(e) => scrollToSection(e, 'Offer')}>Oferta</a>
                </li>
                <li className={styles.mobileNavItem}>
                  <a href="#faq" className={styles.mobileNavLink} onClick={(e) => scrollToSection(e, 'faq')}>FAQ</a>
                </li>
              </ul>
            </nav>
            <div className={styles.accessibilityControlsMobile}>
              <ThemeSwitcher showLabels={true} />
            </div>
          </div>
        </div>
      </div>
    </header>

  )
}
