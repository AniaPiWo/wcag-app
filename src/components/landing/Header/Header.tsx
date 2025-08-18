'use client'
import { useState, useEffect } from 'react'
import styles from './Header.module.scss'
import { ThemeSwitcher } from '@/components/atoms/ThemeSwitcher/ThemeSwitcher'
import { Logo } from '@/components/Logo/Logo'

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('')

  useEffect(() => {
    const header = document.querySelector('header')
    if (header) {
      setHeaderHeight(header.offsetHeight)
    }
    
    // Get initial theme
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'light'
    setCurrentTheme(initialTheme)

    const handleResize = () => {
      if (header) {
        setHeaderHeight(header.offsetHeight)
      }
    }

    const handleScroll = () => {
      const scrollThreshold = 50
      if (window.scrollY > scrollThreshold) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    
    // Observe theme changes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme') || 'light'
          setCurrentTheme(newTheme)
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    
    // Wywołaj funkcję raz, aby ustawić początkowy stan
    handleScroll()
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    const section = document.getElementById(sectionId)
    
    if (section) {

      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
      
      const sectionTop = section.getBoundingClientRect().top + window.pageYOffset
      const offsetTop = sectionTop - headerHeight - 20 
      

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
      <header className={`${styles.wrapper} ${isScrolled ? (currentTheme === 'dark' ? styles.scrolledDark : styles.scrolled) : ''}`}>
      <div className={styles.container}>
        <Logo ariaLabel="WCAG by Ania - strona główna" className={styles.logoLink} onClick={scrollToTop} />

        <div id="menu_glowne" className={styles.menuDesktop}>
          <nav className={styles.navigation}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <a href="#form" className={styles.navLink} onClick={(e) => scrollToSection(e, 'form')}>Bezpłatny audyt</a>
              </li>
              <li className={styles.navItem}>
                <a href="#Offer" className={styles.navLink} onClick={(e) => scrollToSection(e, 'Offer')}>Oferta</a>
              </li>     
              <li className={styles.navItem}>
                <a href="#aboutMe" className={styles.navLink} onClick={(e) => scrollToSection(e, 'aboutMe')}>O mnie</a>
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
                  <a href="#form" className={styles.mobileNavLink} onClick={(e) => scrollToSection(e, 'form')}>Bezpłatny audyt</a>
                </li>
                <li className={styles.mobileNavItem}>
                  <a href="#Offer" className={styles.mobileNavLink} onClick={(e) => scrollToSection(e, 'Offer')}>Oferta</a>
                </li>
                <li className={styles.mobileNavItem}>
                  <a href="#aboutMe" className={styles.mobileNavLink} onClick={(e) => scrollToSection(e, 'aboutMe')}>O mnie</a>
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
