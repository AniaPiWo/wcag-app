'use client'
import { useState, useEffect } from 'react'
import styles from './ThemeSwitcher.module.scss'

type ThemeSwitcherProps = {
  showLabels?: boolean;
}

export const ThemeSwitcher = ({ showLabels = false }: ThemeSwitcherProps) => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light'
    setTheme(currentTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', newTheme)
    setTheme(newTheme)
  }

  return (
    <div className={styles.themeSwitchContainer}>
      {showLabels && <span className={styles.themeLabel}>Jasny</span>}
      <button 
        className={styles.themeSwitch}
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny'}
        role="switch"
        aria-checked={theme === 'dark'}
      >
        <span className={styles.slider}>
          <span className={styles.switchKnob}></span>
        </span>
      </button>
      {showLabels && <span className={styles.themeLabel}>Ciemny</span>}
    </div>
  )
}
