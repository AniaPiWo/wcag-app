'use client'
import { useState, useEffect } from 'react'
import styles from './FontSizeChanger.module.scss'

const FONT_SIZES = {
  normal: 1,
  large: 1.25,
  extraLarge: 1.625
}

type FontSizeChangerProps = {
  showLabels?: boolean;
}

export const FontSizeChanger = ({ showLabels = false }: FontSizeChangerProps) => {
  const [currentSize, setCurrentSize] = useState<keyof typeof FONT_SIZES>('normal')

  useEffect(() => {
    const savedSize = localStorage.getItem('fontSize')
    if (savedSize && Object.keys(FONT_SIZES).includes(savedSize)) {
      setCurrentSize(savedSize as keyof typeof FONT_SIZES)
      applyFontSize(savedSize as keyof typeof FONT_SIZES)
    }
  }, [])

  const applyFontSize = (size: keyof typeof FONT_SIZES) => {
    const html = document.documentElement
    html.style.setProperty('--font-size-factor', FONT_SIZES[size].toString())
    localStorage.setItem('fontSize', size)
  }

  const changeFontSize = (size: keyof typeof FONT_SIZES) => {
    setCurrentSize(size)
    applyFontSize(size)
  }

  const increaseFontSize = () => {
    const sizes = Object.keys(FONT_SIZES) as Array<keyof typeof FONT_SIZES>
    const currentIndex = sizes.indexOf(currentSize)
    
    if (currentIndex < sizes.length - 1) {
      const newSize = sizes[currentIndex + 1]
      changeFontSize(newSize)
    }
  }

  const decreaseFontSize = () => {
    const sizes = Object.keys(FONT_SIZES) as Array<keyof typeof FONT_SIZES>
    const currentIndex = sizes.indexOf(currentSize)
    
    if (currentIndex > 0) {
      const newSize = sizes[currentIndex - 1]
      changeFontSize(newSize)
    }
  }

  return (
    <div className={styles.container}>
      {showLabels && <span className={styles.label}>Rozmiar czcionki:</span>}
      
      <div className={styles.buttonGroup}>
        <button 
          className={styles.button}
          onClick={decreaseFontSize}
          aria-label="Zmniejsz rozmiar czcionki"
          disabled={currentSize === 'normal'}
        >
          A<span className={styles.minus}>-</span>
        </button>
        
   
        
        <button 
          className={styles.button}
          onClick={increaseFontSize}
          aria-label="Zwiększ rozmiar czcionki"
          disabled={currentSize === 'extraLarge'}
        >
          A<span className={styles.plus}>+</span>
        </button>
      </div>
    </div>
  )
}
