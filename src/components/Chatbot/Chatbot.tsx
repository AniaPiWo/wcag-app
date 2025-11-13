'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Upewnij się że po każdej nowej wiadomości input jest dostępny
  useEffect(() => {
    if (!isSending && !isTyping && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isSending, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Funkcja do wyciągania danych kontaktowych z wiadomości
  const extractContactData = useCallback((messagesToCheck: Message[]) => {
    let userName = '';
    let userEmail = '';
    let userPhone = '';

    // Przeszukaj wiadomości w poszukiwaniu danych kontaktowych
    for (const message of messagesToCheck) {
      if (!message.isUser) continue;

      const text = message.text.toLowerCase();
      
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

      // Szukaj imienia (jeśli wiadomość zawiera tylko imię lub imię na początku)
      if (!userName && text.length < 50) {
        // Proste heurystyki dla imienia
        const words = message.text.trim().split(/\s+/);
        if (words.length === 1 && words[0].length > 2 && /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(words[0])) {
          userName = words[0];
        } else if (words.length >= 2 && words[0].length > 2 && /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(words[0])) {
          userName = words[0];
        }
      }
    }

    return { userName, userEmail, userPhone };
  }, []);

  // Funkcja zapisu sesji do bazy danych
  const saveSession = useCallback(async (messagesToSave: Message[] = unsavedMessages, endSession = false) => {
    if (messagesToSave.length === 0 && !endSession) return;

    try {
      // Wyciągnij dane kontaktowe z wszystkich wiadomości
      const allMessages = [...messages, ...messagesToSave];
      const contactData = extractContactData(allMessages);

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
          userName: contactData.userName || undefined,
          userEmail: contactData.userEmail || undefined,
          userPhone: contactData.userPhone || undefined,
          endSession
        }),
      });

      if (response.ok) {
        console.log(`💾 Zapisano ${messagesToSave.length} wiadomości do bazy`);
        setUnsavedMessages([]);
        lastSaveRef.current = new Date();
      }
    } catch (error) {
      console.error('Błąd zapisu sesji:', error);
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

    try {
      // Przygotuj wiadomości dla API (bez wiadomości systemowej)
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      // Wywołaj API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Błąd komunikacji z serwerem');
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
        
        // Dodaj wiadomości do unsaved buffer
        const newUnsaved = [userMessage, botMessage];
        setUnsavedMessages(prev => [...prev, ...newUnsaved]);
      } else {
        throw new Error('Brak odpowiedzi od asystenta');
      }
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Przepraszam, wystąpił błąd podczas przetwarzania Twojego pytania. Spróbuj ponownie za chwilę.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  return (
    <div className={styles.chatbot}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={styles.chatWindow}
          role="dialog"
          aria-labelledby="chat-header"
          aria-describedby="chat-messages"
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
              <div className={styles.headerText}>
                <h3 id="chat-header">SeBot - wirtualny asystent</h3>
                <p>Dostępność cyfrowa • WCAG 2.2</p>
              </div>
            </div>
            <button
              className={styles.closeButton}
              onClick={toggleChat}
              aria-label="Zamknij okno czatu"
              type="button"
            >
              <span aria-hidden="true">✕</span>
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
                  <div className={styles.messageText}>{message.text}</div>
                  <span className={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
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

          <form className={styles.inputForm} onSubmit={handleSendMessage}>
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
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!inputValue.trim() || isSending}
              aria-label={isSending ? "Wysyłanie..." : "Wyślij wiadomość"}
            >
              {isSending ? (
                <span className={styles.loadingIcon}>⏳</span>
              ) : (
                <span className={styles.sendIcon}>➤</span>
              )}
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
            aria-label="Otwórz chat"
            aria-expanded={isOpen}
          >
            <Image 
              src="/chatbot.svg" 
              alt="Chat" 
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
