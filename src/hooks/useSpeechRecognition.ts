'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseSpeechRecognitionProps {
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

interface SpeechRecognitionHook {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = ({
  onResult,
  onError,
  language = 'pl-PL',
  continuous = true
}: UseSpeechRecognitionProps = {}): SpeechRecognitionHook => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
      }
    }
  }, []);

  // Configure speech recognition
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    // Configuration
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('🎤 Rozpoznawanie mowy rozpoczęte');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        if (result.isFinal) {
          finalTranscript += transcript;
          maxConfidence = Math.max(maxConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        setConfidence(maxConfidence);
        
        onResult?.({
          transcript: finalTranscript,
          confidence: maxConfidence,
          isFinal: true
        });
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
        
        onResult?.({
          transcript: interimTranscript,
          confidence: 0,
          isFinal: false
        });
      }
    };

    recognition.onerror = (event: any) => {
      const errorMessage = getErrorMessage(event.error);
      setError(errorMessage);
      setIsListening(false);
      onError?.(errorMessage);
      console.error('🎤 Błąd rozpoznawania mowy:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Rozpoznawanie mowy zakończone');
    };

    return () => {
      if (recognition) {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
      }
    };
  }, [language, continuous, onResult, onError]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'Nie wykryto mowy. Spróbuj ponownie.';
      case 'audio-capture':
        return 'Brak dostępu do mikrofonu. Sprawdź uprawnienia.';
      case 'not-allowed':
        return 'Dostęp do mikrofonu został odrzucony. Kliknij ikonę kłódki w pasku adresu i włącz mikrofon.';
      case 'network':
        return 'Błąd sieci. Sprawdź połączenie internetowe.';
      case 'service-not-allowed':
        return 'Usługa rozpoznawania mowy jest niedostępna.';
      case 'bad-grammar':
        return 'Błąd gramatyki rozpoznawania mowy.';
      case 'language-not-supported':
        return 'Język nie jest obsługiwany.';
      default:
        return `Nieznany błąd rozpoznawania mowy: ${error}`;
    }
  };

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    setError(null);
    setTranscript('');
    setConfidence(0);

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('🎤 Błąd uruchamiania rozpoznawania:', error);
      setError('Nie można uruchomić rozpoznawania mowy');
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('🎤 Błąd zatrzymywania rozpoznawania:', error);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
};
