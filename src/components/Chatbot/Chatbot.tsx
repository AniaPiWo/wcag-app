'use client';

import { useState, useRef, useEffect } from 'react';
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
      text: 'Cześć! Jestem asystentem WCAG.co. Jak mogę Ci pomóc w kwestiach dostępności cyfrowej?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Symulacja odpowiedzi bota (później zastąpić prawdziwym API)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Dziękuję za wiadomość! Obecnie jestem w fazie rozwoju. Wkrótce będę mógł odpowiedzieć na Twoje pytania dotyczące dostępności cyfrowej i WCAG 2.2.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className={styles.chatbot}>
      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerContent}>
              <div className={styles.botAvatar}>
                <Image 
                  src="/chatbot.svg" 
                  alt="Bot" 
                  className={styles.botIcon}
                  width={40}
                  height={40}
                />
              </div>
              <div className={styles.headerText}>
                <h3>Asystent WCAG</h3>
                <p>Pomoc w dostępności cyfrowej</p>
              </div>
            </div>
            <button
              className={styles.closeButton}
              onClick={toggleChat}
              aria-label="Zamknij chat"
            >
              ✕
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
                  <p>{message.text}</p>
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
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!inputValue.trim()}
              aria-label="Wyślij wiadomość"
            >
              <span className={styles.sendIcon}>➤</span>
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
