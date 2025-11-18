/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SpeechButton } from '@/components/atoms/SpeechButton/SpeechButton';
import styles from './Chatbot.module.scss';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Witaj! Jestem Twoim wirtualnym asystentem 😊\n\n🎯 Pomogę Ci z:\n• Wycenami usług dostępności\n• Informacjami o WCAG 2.2\n• Aktualnymi promocjami\n• Terminami realizacji\n\n💬 Zadaj pytanie lub napisz "kontakt" jeśli chcesz zostawić wiadomość!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [screenReaderMessage, setScreenReaderMessage] = useState('');
  const [hasAnnouncedInstructions, setHasAnnouncedInstructions] = useState(false);
  // Dane kontaktowe - używamy ref dla logiki, state dla UI (jeśli potrzebny)
  const [, setContactData] = useState<{userName?: string, userEmail?: string, userPhone?: string}>({});
  const contactDataRef = useRef<{userName?: string, userEmail?: string, userPhone?: string}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Session management dla zapisu rozmów
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('wcag-chat-session');
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('wcag-chat-session', id);
      }
      return id;
    }
    return crypto.randomUUID();
  });
  const [unsavedMessages, setUnsavedMessages] = useState<Message[]>([]);
  const lastSaveRef = useRef<Date>(new Date());

  // Auto-scroll to newest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Announce instructions only once when chat opens
      if (!hasAnnouncedInstructions) {
        // Delay to ensure live region is ready
        setTimeout(() => {
          setScreenReaderMessage('Witaj w chacie z SeBot! Wpisz wiadomość i naciśnij Enter aby wysłać. Użyj mikrofonu aby włączyć dyktowanie. Naciśnij Escape aby zamknąć okno czatu.');
          setHasAnnouncedInstructions(true);
          
          // Clear instructions after announcement
          setTimeout(() => {
            setScreenReaderMessage('');
          }, 8000);
        }, 200);
      }
      
      // Focus input when chat opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, hasAnnouncedInstructions]);

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);



  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Reset instructions flag when closing chat
    if (!newIsOpen) {
      setHasAnnouncedInstructions(false);
    }
  };

  // Funkcja do wyciągania danych kontaktowych z wiadomości
  const extractContactData = useCallback((messagesToCheck: Message[]) => {
    let userName = '';
    let userEmail = '';
    let userPhone = '';

    // Przeszukaj wiadomości w poszukiwaniu danych kontaktowych
    for (const message of messagesToCheck) {
      if (!message.isUser) continue;

      
      // Szukaj emaila
      const emailMatch = message.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && !userEmail) {
        userEmail = emailMatch[0];
      }

      // Szukaj telefonu (różne formaty)
      const phoneMatch = message.text.match(/(?:\+48\s?)?(?:\d{3}[\s-]?\d{3}[\s-]?\d{3}|\d{9})/);
      if (phoneMatch && !userPhone) {
        userPhone = phoneMatch[0];
      }

      // Szukaj imienia - AI będzie rozpoznawać podczas rozmowy
      if (!userName) {
        const messageText = message.text.trim();
        
        // Podstawowe wzorce dla bezpośredniego podawania imienia
        const directNamePatterns = [
          // "mam na imię/imie ania", "nazywam się anna", "jestem piotr"
          /(?:mam na imi[eę]|nazywam się|jestem|to ja|zowę się)\s+([a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]{2,})/i,
          // "my name is john", "i am sarah", "i'm mike"
          /(?:my name is|i am|i'm|call me)\s+([a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]{2,})/i,
          // "imię: anna" lub "name: john"
          /(?:imi[eę]|name)\s*[:=]\s*([a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]{2,})/i
        ];
        
        for (const pattern of directNamePatterns) {
          const match = messageText.match(pattern);
          if (match) {
            userName = match[1];
            break;
          }
        }
        
        // Jeśli nie znaleziono przez wzorce, sprawdź czy to pojedyncze słowo (imię)
        if (!userName && messageText.length < 50) {
          const words = messageText.split(/\s+/);
          // Tylko pojedyncze słowo może być imieniem
          if (words.length === 1 && words[0].length > 2 && /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(words[0])) {
            userName = words[0];
          }
        }
      }
    }

    return { userName, userEmail, userPhone };
  }, []);

  // Funkcja zapisu sesji do bazy danych
  const saveSession = useCallback(async (messagesToSave: Message[] = unsavedMessages, endSession = false) => {
    if (messagesToSave.length === 0 && !endSession) return;

    // Wyciągnij dane kontaktowe z wszystkich wiadomości
    const allMessages = [...messages, ...messagesToSave];
    const extractedContactData = extractContactData(allMessages);
    
    // Połącz dane kontaktowe (nowe + istniejące)
    const finalContactData = {
      userName: extractedContactData.userName || contactDataRef.current.userName,
      userEmail: extractedContactData.userEmail || contactDataRef.current.userEmail,
      userPhone: extractedContactData.userPhone || contactDataRef.current.userPhone
    };
    
    // Zaktualizuj dane kontaktowe tylko jeśli się zmieniły
    const hasChanges = 
      finalContactData.userName !== contactDataRef.current.userName ||
      finalContactData.userEmail !== contactDataRef.current.userEmail ||
      finalContactData.userPhone !== contactDataRef.current.userPhone;
    
    if (hasChanges) {
      contactDataRef.current = finalContactData;
      setContactData(finalContactData);
    }


    try {

      const response = await fetch('/api/chat/save-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          messages: messagesToSave.map(msg => ({
            role: msg.isUser ? 'USER' : 'ASSISTANT',
            content: msg.text,
            timestamp: msg.timestamp.toISOString(),
            metadata: msg.isUser ? null : { messageId: msg.id }
          })),
          userAgent: navigator.userAgent,
          userName: finalContactData.userName || null,
          userEmail: finalContactData.userEmail || null,
          userPhone: finalContactData.userPhone || null,
          endSession
        }),
      });

      if (response.ok) {
        
        // Wyczyść unsaved buffer
        setUnsavedMessages([]);
        lastSaveRef.current = new Date();
      }
    } catch (error) {
      console.error('❌ Błąd podczas zapisu sesji:', error);
    }
  }, [sessionId, unsavedMessages, messages, extractContactData]);

  // Automatyczny zapis wsadowy - co 5 wiadomości lub co 2 minuty
  useEffect(() => {
    if (unsavedMessages.length === 0) return;

    const shouldSaveByCount = unsavedMessages.length >= 5;
    const shouldSaveByTime = Date.now() - lastSaveRef.current.getTime() > 2 * 60 * 1000; // 2 minuty

    if (shouldSaveByCount || shouldSaveByTime) {
      saveSession();
    }
  }, [unsavedMessages, saveSession]);

  // Zapis przy zamknięciu przeglądarki
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (unsavedMessages.length > 0) {
        saveSession(unsavedMessages, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedMessages, saveSession]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    setIsTyping(true);
    
    // Announce sending message
    setScreenReaderMessage('Wysyłanie wiadomości...');

    try {
      // Przygotuj wiadomości dla API (bez wiadomości systemowej)
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      // Aktualizuj dane kontaktowe przed wywołaniem API
      const currentContactData = extractContactData([...messages, userMessage]);
      const mergedContactData = {
        userName: currentContactData.userName || contactDataRef.current.userName,
        userEmail: currentContactData.userEmail || contactDataRef.current.userEmail,
        userPhone: currentContactData.userPhone || contactDataRef.current.userPhone
      };


      // Wywołaj API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          contactData: mergedContactData,
          sessionId,
          extractContactData: true, // Instrukcja dla AI żeby rozpoznawał dane kontaktowe
          instructions: "Podczas rozmowy automatycznie rozpoznawaj i zapamiętuj imię użytkownika, adres email i numer telefonu. Jeśli użytkownik poda swoje imię w naturalny sposób podczas rozmowy, zapamiętaj je."
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [chat-api] Błąd HTTP:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: response.url
        });
        throw new Error(`Błąd komunikacji z serwerem: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.message) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Sprawdź czy AI rozpoznał nowe dane kontaktowe
        if (data.extractedContactData) {
          const aiContactData = data.extractedContactData;
          const updatedContactData = {
            userName: aiContactData.userName || contactDataRef.current.userName,
            userEmail: aiContactData.userEmail || contactDataRef.current.userEmail,
            userPhone: aiContactData.userPhone || contactDataRef.current.userPhone
          };
          
          // Zaktualizuj dane kontaktowe jeśli AI coś rozpoznał
          const hasAiChanges = 
            (aiContactData.userName && aiContactData.userName !== contactDataRef.current.userName) ||
            (aiContactData.userEmail && aiContactData.userEmail !== contactDataRef.current.userEmail) ||
            (aiContactData.userPhone && aiContactData.userPhone !== contactDataRef.current.userPhone);
          
          if (hasAiChanges) {
            contactDataRef.current = updatedContactData;
            setContactData(updatedContactData);
          }
        }
        
        // Announce bot response
        setScreenReaderMessage(`SeBot odpowiada: ${botMessage.text}`);
        
        // Clear announcement after reading
        setTimeout(() => {
          setScreenReaderMessage('');
        }, 100);
        
        // Focus back to input after bot response (safe timing)
        setTimeout(() => {
          if (inputRef.current && isOpen) {
            inputRef.current.focus();
          }
        }, 1500);
        
        // Dodaj wiadomości do unsaved buffer
        const newUnsaved = [userMessage, botMessage];
        setUnsavedMessages(prev => [...prev, ...newUnsaved]);
        
        // Sprawdź czy wykryto nowe dane kontaktowe i zapisz natychmiast
        const allMessagesWithNew = [...messages, userMessage, botMessage];
        const newContactData = extractContactData(allMessagesWithNew);
        const hasNewContactData = 
          (newContactData.userName && newContactData.userName !== contactDataRef.current.userName) ||
          (newContactData.userEmail && newContactData.userEmail !== contactDataRef.current.userEmail) ||
          (newContactData.userPhone && newContactData.userPhone !== contactDataRef.current.userPhone);
        
        if (hasNewContactData) {
          // Natychmiastowy zapis gdy wykryto nowe dane kontaktowe
          setTimeout(() => {
            saveSession(newUnsaved);
          }, 100);
        }
      } else {
        throw new Error('Brak odpowiedzi od asystenta');
      }
    } catch (error) {
      console.error('❌ [chat-api] Błąd wysyłania wiadomości:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Przepraszam, wystąpił błąd podczas przetwarzania Twojego pytania. Spróbuj ponownie za chwilę.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Announce error
      setScreenReaderMessage(`Błąd: ${errorMessage.text}`);
      
      // Clear announcement after reading
      setTimeout(() => {
        setScreenReaderMessage('');
      }, 100);
      
      // Focus back to input after error (safe timing)
      setTimeout(() => {
        if (inputRef.current && isOpen) {
          inputRef.current.focus();
        }
      }, 1500);
      
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleSpeechTranscript = (transcript: string) => {
    if (transcript.trim()) {
      setInputValue(prev => {
        const newValue = prev ? `${prev} ${transcript}` : transcript;
        return newValue;
      });
      
      // Focus input after speech
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };


  return (
    <div className={styles.chatbot}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className={styles.chatWindow}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-header"
        >
          <div className={styles.chatHeader}>
            <div className={styles.headerContent}>
              <div className={styles.botAvatar}>
                <Image 
                  src="/chatbot.svg" 
                  alt="Ikona asystenta WCAG.co" 
                  className={styles.botIcon}
                  width={40}
                  height={40}
                />
              </div>
              <div className={styles.botInfo}>
                <h2 id="chat-header" className={styles.botName}>SeBot</h2>
                <span className={styles.botStatus}>Twój wirtualny asystent</span>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              className={styles.closeButton}
              onClick={toggleChat}
              type="button"
            >
              <span>✕</span>
            </button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.isUser ? styles.userMessage : styles.botMessage
                }`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>
                    {message.text}
                  </div>
                  <div className={styles.messageFooter}>
                    <span className={styles.timestamp}>
                      {message.timestamp.toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Live region for screen reader announcements */}
          <div 
            className={styles.srOnly} 
            role="status" 
            aria-live="assertive" 
            aria-atomic="true"
          >
            {screenReaderMessage}
          </div>

          <form className={styles.inputForm} onSubmit={handleSendMessage}>
            <div className={styles.inputContainer}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Napisz wiadomość..."
                className={styles.messageInput}
                maxLength={500}
                disabled={isSending}
              />
{/*               <SpeechButton
                onTranscript={handleSpeechTranscript}
                disabled={isSending}
                className={styles.speechButton}
              /> */}
            </div>
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!inputValue.trim() || isSending}
            >
              <span className={styles.sendIcon}>
                <div className={styles.sendArrow}></div>
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Chat Toggle Button - ukryty gdy chat jest otwarty */}
      {!isOpen && (
        <div className={styles.chatToggleContainer}>
          <button
            className={styles.chatToggle}
            onClick={toggleChat}
          >
            <Image 
              src="/chatbot.svg" 
              alt="Ikona chatbota - wirtualny asystent" 
              className={styles.chatIcon}
              width={56}
              height={56}
            />
            <span className={styles.chatIndicator}></span>
          </button>
        </div>
      )}
    </div>
  );
}
