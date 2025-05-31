'use client';
import React, { useState, useRef } from 'react';
import styles from './Form.module.scss';
import { Button } from '../atoms/Button/Button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';

// walidacja url, akceptuje www i bez www
const websiteSchema = z.string()
  .nonempty('Podaj adres strony internetowej')
  .refine(
    (val) => {
      const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,})([/\w .-]*)*\/?$/;
      
      return urlPattern.test(val) || domainPattern.test(val);
    },
    { message: 'Niepoprawny adres strony' }
  )
  .transform((val) => {
    if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
      return `https://${val}`;
    }
    return val;
  });

// walidacja formularza
const FormSchema = z.object({
  name: z
    .string()
    .nonempty('Podaj swoje imię')
    .min(2, 'Imię jest zbyt krótkie'),
  email: z
    .string()
    .nonempty('Podaj adres e-mail')
    .email('Niepoprawny adres e-mail'),
  website: websiteSchema,
  honeypot: z.string().max(0, 'Bot detected'),
});

type FormInputs = z.infer<typeof FormSchema>;

export const Form = () => {
  const [errorField, setErrorField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const wrapperRef = useRef<HTMLElement>(null);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      setIsSubmitting(true);
      setErrorField(null);
      setErrorMessage(null);
      
      console.log('Wysyłanie danych do audytu:', data);
      
      const payload = {
        url: data.website,
        email: data.email,
        name: data.name
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 sekund timeout
      
      try {
        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Wystąpił błąd podczas przeprowadzania audytu');
        }
        
        console.log('Wyniki audytu:', result);
        
        // Sukces - pokaż komunikat z podziękowaniem
        setIsSuccess(true);
        setIsSubmitted(true);
        reset();
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          console.error('Błąd połączenia z API:', fetchError);
          throw new Error('Nie można połączyć się z serwerem audytu. Sprawdź połączenie internetowe i spróbuj ponownie.');
        }
        
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          throw new Error('Przekroczono czas oczekiwania na odpowiedź serwera. Spróbuj ponownie później.');
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error('Błąd podczas przeprowadzania audytu:', error);
      
      // Błąd - pokaż komunikat o niepowodzeniu
      setIsSuccess(false);
      setIsSubmitted(true);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (formErrors: FieldErrors<FormInputs>) => {

    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    

    if (formErrors.name) {
      setErrorField('name');
      setErrorMessage(formErrors.name.message || 'Błąd w polu imię');
    } else if (formErrors.email) {
      setErrorField('email');
      setErrorMessage(formErrors.email.message || 'Błąd w polu email');
    } else if (formErrors.website) {
      setErrorField('website');
      setErrorMessage(formErrors.website.message || 'Błąd w polu adres strony');
    } else {
      return;
    }
    

    const timeout = setTimeout(() => {
      setErrorField(null);
      setErrorMessage(null);
    }, 3000);
    
    setErrorTimeout(timeout);
  };

  return (
    <div className={styles.fullBackground}>
      <div className={styles.gridBackground} />
      <section id="Form" ref={wrapperRef} className={styles.wrapper}>

        
        {isSubmitted ? (
          <div className={styles.thankYou}>
            <div className={styles.text}>
              <h2 className={styles.title}>
                {isSuccess ? 'Dziękujemy za zamówienie audytu!' : 'Upss coś poszło nie tak...'}
              </h2>
              <p className={styles.desc}>
                {isSuccess 
                  ? 'Raport zostanie wysłany na podany adres e-mail w ciągu kilku minut.' 
                  : 'Spróbuj ponownie później!'}
              </p>
              {isSuccess && (
                <p className={styles.desc}>Sprawdź swoją skrzynkę odbiorczą (oraz folder spam).</p>
              )}
              <Button 
                onClick={() => setIsSubmitted(false)}
                aria-label="Powrót do formularza"
                variant="primary"
              >
                {isSuccess ? 'OK!' : 'Spróbuj ponownie'}
              </Button>
            </div>
          </div>
        ) : (
          <>
          <div className={styles.text}>
          <h2 className={styles.title}>
            Zamów bezpłatny audyt dostępności
          </h2>
          <p className={styles.desc}>
            Sprawdź, czy Twoja strona jest zgodna z standardami dostępności WCAG 2.2. <br/>
            Audyt jest automatyczny i w kilka minut otrzymasz raport na podany adres e-mail.
          </p>
        </div>
        
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className={styles.form}
            noValidate
          >
            <div className={styles.inputWrapper}>
              <div style={{ position: 'relative' }}>
                <label htmlFor="name" className={styles.srOnly}>Twoje imię</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Twoje imię"
                  className={`${styles.input} ${errorField === 'name' ? styles.inputError : ''}`}
                  {...register('name')}
                  disabled={isSubmitting}
                  aria-invalid={errorField === 'name' ? 'true' : 'false'}
                  aria-describedby={errorField === 'name' ? 'name-error' : undefined}
                />
                {errorField === 'name' && errorMessage && (
                  <div id="name-error" className={styles.tooltip} role="alert">
                    {errorMessage}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <label htmlFor="email" className={styles.srOnly}>Twój adres e-mail</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Twój adres e-mail"
                  className={`${styles.input} ${errorField === 'email' ? styles.inputError : ''}`}
                  {...register('email')}
                  disabled={isSubmitting}
                  aria-invalid={errorField === 'email' ? 'true' : 'false'}
                  aria-describedby={errorField === 'email' ? 'email-error' : undefined}
                />
                {errorField === 'email' && errorMessage && (
                  <div id="email-error" className={styles.tooltip} role="alert">
                    {errorMessage}
                  </div>
                )}
              </div>
              
              <div style={{ position: 'relative' }}>
                <label htmlFor="website" className={styles.srOnly}>Adres Twojej strony internetowej</label>
                <input
                  id="website"
                  type="text" 
                  placeholder="Adres Twojej strony internetowej"
                  className={`${styles.input} ${errorField === 'website' ? styles.inputError : ''}`}
                  {...register('website')}
                  disabled={isSubmitting}
                  aria-invalid={errorField === 'website' ? 'true' : 'false'}
                  aria-describedby={errorField === 'website' ? 'website-error' : undefined}
                />
       
                {errorField === 'website' && errorMessage && (
                  <div id="website-error" className={styles.tooltip} role="alert">
                    {errorMessage}
                  </div>
                )}
              </div>

              <div className={styles.honeypotWrapper}>
                <label htmlFor="honeypot" className={styles.srOnly}>Pozostaw to pole puste (pole antyspamowe)</label>
                <input
                  id="honeypot"
                  type="text"
                  className={styles.honeypot}
                  {...register('honeypot')}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
              </div>
            </div>

            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Zamów audyt
            </Button>

            <p className={styles.info}>
              Dane wykorzystam wyłącznie do przesłania audytu. Żadnych newsletterów i spamu.
            </p>
          </form>
          </>
        )}
      </section>
    </div>
  );
};
