'use client'
import { useState, useEffect } from 'react'
import styles from './ThemeSwitcher.module.scss'
import { IoSunnyOutline, IoMoon } from "react-icons/io5";

type ThemeSwitcherProps = {
  showLabels?: boolean;
}

export const ThemeSwitcher = ({ }: ThemeSwitcherProps) => {
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
