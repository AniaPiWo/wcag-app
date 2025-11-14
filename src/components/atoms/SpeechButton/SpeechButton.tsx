'use client';

import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import styles from './SpeechButton.module.scss';

interface SpeechButtonProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SpeechButton = ({ onTranscript, onError, disabled = false, className }: SpeechButtonProps) => {
  const [interimText, setInterimText] = useState('');
  
  const {
    isSupported,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    onResult: (result) => {
      if (result.isFinal) {
        onTranscript(result.transcript.trim());
        setInterimText('');
        resetTranscript();
      } else {
        setInterimText(result.transcript);
      }
    },
    onError: (errorMessage) => {
      console.error('Speech recognition error:', errorMessage);
      setInterimText('');
      onError?.(errorMessage); // Pass error to parent
    },
    language: 'pl-PL',
    continuous: false
  });

  // Auto-stop after 10 seconds of listening
  useEffect(() => {
    if (!isListening) return;

    const timeout = setTimeout(() => {
      stopListening();
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isListening, stopListening]);

  const handleClick = () => {
    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  if (!isSupported) {
    return null; // Hide button if not supported
  }

  const buttonClass = `
    ${styles.speechButton} 
    ${isListening ? styles.listening : ''} 
    ${disabled ? styles.disabled : ''} 
    ${error ? styles.error : ''} 
    ${className || ''}
  `.trim();

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={buttonClass}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={
          isListening 
            ? 'Zatrzymaj dyktowanie' 
            : 'Rozpocznij dyktowanie - naciśnij aby mówić'
        }
        aria-pressed={isListening}
      >
        <span className={styles.icon} aria-hidden="true">
          {isListening ? '●' : '🎤'}
        </span>
        
        {isListening && (
          <span className={styles.pulse} aria-hidden="true" />
        )}
      </button>


      {/* Visual feedback for interim text */}
      {interimText && (
        <div className={styles.interimText} aria-hidden="true">
          <span className={styles.interimLabel}>Rozpoznawanie:</span>
          <span className={styles.interimContent}>{interimText}</span>
        </div>
      )}

      {/* Error message - moved to parent component */}
    </div>
  );
};
