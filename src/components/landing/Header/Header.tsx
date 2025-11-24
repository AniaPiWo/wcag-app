'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import styles from './Header.module.scss'
import { ThemeSwitcher } from '@/components/atoms/ThemeSwitcher/ThemeSwitcher'
import { Logo } from '@/components/Logo/Logo'

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('')
  const [activeSection, setActiveSection] = useState('')
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  
  // Sprawdź czy jesteśmy na stronie głównej
  const isHomePage = pathname === '/'

  useEffect(() => {
    const header = document.querySelector('header')
    if (header) {
      setHeaderHeight(header.offsetHeight)
    }
    
    // Get initial theme
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark'
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

      // Scroll spy functionality - tylko na stronie głównej
      if (isHomePage) {
        const sections = ['form', 'Offer', 'aboutMe', 'faq']
        const scrollPosition = window.scrollY + headerHeight + 100

        let currentSection = ''
        
        for (const sectionId of sections) {
          const section = document.getElementById(sectionId)
          if (section) {
            const sectionTop = section.offsetTop
            const sectionBottom = sectionTop + section.offsetHeight
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
              currentSection = sectionId
              break
            }
          }
        }
        
        setActiveSection(currentSection)
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
    
    handleScroll()
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [headerHeight, isHomePage])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        mobileButtonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

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

  const handleContactClick = useCallback(() => {
    setTimeout(() => {
      const emailParts = ['biuro', 'wcag.co'];
  
      const subject = encodeURIComponent("Zapytanie o audyt WCAG");
      const body = encodeURIComponent(
        "Dzień dobry,\n\nProszę o kontakt w sprawie audytu dostępności mojej strony internetowej.\n\nAdres strony: \n\nPozdrawiam,\n"
      );
  
      window.location.href = `mailto:${emailParts[0]}@${emailParts[1]}?subject=${subject}&body=${body}`;
    }, 500);
  }, []);

  return (
    <header className={`${styles.wrapper} ${isScrolled ? (currentTheme === 'dark' ? styles.scrolledDark : styles.scrolled) : ''}`}>
      <div className={styles.container}>
        <Logo ariaLabel="WCAG by Ania - strona główna" className={styles.logoLink} onClick={scrollToTop} />

        <div id="menu_glowne" className={styles.menuDesktop}>
          <nav className={styles.navigation} aria-label="Menu główne">
            <ul className={styles.navList}>
              {isHomePage && (
                <>
                  <li className={styles.navItem}>
                    <a href="#form" className={`${styles.navLink} ${activeSection === 'form' ? styles.active : ''}`} onClick={(e) => scrollToSection(e, 'form')}>Bezpłatny audyt</a>
                  </li>
                  <li className={styles.navItem}>
                    <a href="#Offer" className={`${styles.navLink} ${activeSection === 'Offer' ? styles.active : ''}`} onClick={(e) => scrollToSection(e, 'Offer')}>Oferta</a>
                  </li>     
                  <li className={styles.navItem}>
                    <a href="#aboutMe" className={`${styles.navLink} ${activeSection === 'aboutMe' ? styles.active : ''}`} onClick={(e) => scrollToSection(e, 'aboutMe')}>O mnie</a>
                  </li>
                  <li className={styles.navItem}>
                    <a href="#faq" className={`${styles.navLink} ${activeSection === 'faq' ? styles.active : ''}`} onClick={(e) => scrollToSection(e, 'faq')}>FAQ</a>
                  </li>
                </>
              )}
              <li className={styles.navItem}>
                <button className={styles.contactBtn} onClick={handleContactClick}>Kontakt</button>
              </li>
            </ul>
          </nav>
          <div className={styles.accessibilityControls}>
            <ThemeSwitcher />
          </div>
        </div>

        <div className={styles.menuMobile}>
          <button ref={mobileButtonRef} className={styles.mobilebutton} onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? 'Zamknij' : 'Menu'}
          </button>
          <div
            ref={mobileMenuRef}
            className={`${styles.mobileMenuContent} ${
              isMobileMenuOpen ? styles.menuOpen : ''
            }`}
          >
            <nav className={styles.mobileNavigation} aria-label="Menu mobilne">
              <ul className={styles.mobileNavList}>
                {isHomePage && (
                  <>
                    <li className={styles.mobileNavItem}>
                      <a href="#form" className={`${styles.mobileNavLink} ${activeSection === 'form' ? styles.activeMobile : ''}`} onClick={(e) => scrollToSection(e, 'form')}>Bezpłatny audyt</a>
                    </li>
                    <li className={styles.mobileNavItem}>
                      <a href="#Offer" className={`${styles.mobileNavLink} ${activeSection === 'Offer' ? styles.activeMobile : ''}`} onClick={(e) => scrollToSection(e, 'Offer')}>Oferta</a>
                    </li>
                    <li className={styles.mobileNavItem}>
                      <a href="#aboutMe" className={`${styles.mobileNavLink} ${activeSection === 'aboutMe' ? styles.activeMobile : ''}`} onClick={(e) => scrollToSection(e, 'aboutMe')}>O mnie</a>
                    </li>
                    <li className={styles.mobileNavItem}>
                      <a href="#faq" className={`${styles.mobileNavLink} ${activeSection === 'faq' ? styles.activeMobile : ''}`} onClick={(e) => scrollToSection(e, 'faq')}>FAQ</a>
                    </li>
                  </>
                )}
                <li className={styles.mobileNavItem}>
                  <button className={styles.mobileContactBtn} onClick={handleContactClick}>Kontakt</button>
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