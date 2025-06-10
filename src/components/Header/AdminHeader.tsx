'use client'
import { useRouter } from 'next/navigation'
import styles from './Header.module.scss'
import { Logo } from '../Logo/Logo'
import Link from 'next/link'
import { Button } from '../atoms/Button/Button'

export const AdminHeader = () => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Przekierowanie do strony logowania po wylogowaniu
        router.push('/admin/login')
      } else {
        console.error('Błąd wylogowania')
      }
    } catch (error) {
      console.error('Błąd wylogowania:', error)
    }
  }

  return (
    <header className={styles.wrapper}>
      <div className={styles.container}>
        <Logo href="/admin" className={styles.logoLink} />

        <div className={styles.menuDesktop}>
          <nav className={styles.navigation}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <Link href="/admin" className={styles.navLink}>Panel administratora</Link>
              </li>
            </ul>
          </nav>
          <div className={styles.accessibilityControls}>
            <Button 
              onClick={handleLogout} 
              className={styles.logoutButton}
            >
              Wyloguj
            </Button>
          </div>
        </div>

        <div className={styles.menuMobile}>
          <div className={styles.mobileMenuContent}>
            <nav className={styles.mobileNavigation}>
              <ul className={styles.mobileNavList}>
                <li className={styles.mobileNavItem}>
                  <Link href="/admin" className={styles.mobileNavLink}>Panel administratora</Link>
                </li>
              </ul>
            </nav>
            <div className={styles.accessibilityControlsMobile}>
              <button 
                onClick={handleLogout} 
                className={styles.logoutButton}
              >
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
