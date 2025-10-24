'use client'
import { useState, useEffect } from 'react'
import styles from './ThemeSwitcher.module.scss'
import { IoSunnyOutline, IoMoon } from "react-icons/io5";

type ThemeSwitcherProps = {
  showLabels?: boolean;
}

export const ThemeSwitcher = ({ }: ThemeSwitcherProps) => {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Ładowanie zapisanego theme z localStorage
    const savedTheme = localStorage.getItem('theme')
    const initialTheme = savedTheme || document.documentElement.getAttribute('data-theme') || 'dark'
    
    document.documentElement.setAttribute('data-theme', initialTheme)
    setTheme(initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', newTheme)
    setTheme(newTheme)
    
    // Zapisywanie wybranego theme w localStorage
    localStorage.setItem('theme', newTheme)
  }

  return (
    <div className={styles.themeSwitchContainer}>
      <button
        className={styles.themeSwitch}
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny'}
        role="switch"
        aria-checked={theme === 'dark'}
      >
        <span className={styles.slider}>
          <span className={styles.switchKnob}>
            {theme === 'light' ? (
              <IoSunnyOutline className={styles.icon} />
            ) : (
              <IoMoon className={styles.icon} />
            )}
          </span>
        </span>
      </button>
    </div>
  )
}
