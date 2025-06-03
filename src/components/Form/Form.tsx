'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from './Form.module.scss';
import { Button } from '../atoms/Button/Button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';


async function checkUrlExists(url: string): Promise<{ exists: boolean; error?: string }> {
  try {

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    

    const response = await fetch('/api/check-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    return { exists: response.ok, error: data.error };
  } catch (error) {
    console.error('Błąd podczas sprawdzania URL:', error);
    return { exists: false, error: 'Wystąpił błąd podczas sprawdzania adresu URL' };
  }
}


interface AuditViolation {
  id: string;
  impact: string;
  tags: string[];
  description: string;
  help: string;
  nodes: Array<{ [key: string]: unknown }>;
}

interface AuditSummary {
  url: string;
  totalIssuesCount: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  passedRules: number;
  incompleteRules: number;
  timestamp: string;
}

interface AuditResults {
  summary: AuditSummary;
  violations: AuditViolation[];
}

interface AuditResponse {
  success: boolean;
  url: string;
  email: string;
  name: string;
  results: AuditResults;
}

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
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isContactLoading, setIsContactLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const wrapperRef = useRef<HTMLElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const statusMessageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isSubmitted && !isSubmitting) {
      setTimeout(() => {
        if (statusMessageRef.current) {
          statusMessageRef.current.textContent = "Formularz został wysłany pomyślnie. Dziękujemy!";
        }
      }, 500);
    }
  }, [isSubmitted, isSubmitting]);
  
  // napisz do mnie
  const handleContactClick = () => {
    setIsContactLoading(true);
    const emailParts = ['biuro', 'wcag.co'];
    window.location.href = `mailto:${emailParts[0]}@${emailParts[1]}?subject=Prośba o automatyczny audyt WCAG`;
    setTimeout(() => setIsContactLoading(false), 1000);
  };

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
      

      const urlCheckResult = await checkUrlExists(data.website);
      
      if (!urlCheckResult.exists) {

        const websiteInput = document.getElementById('website');
        if (websiteInput) {
          websiteInput.focus();
        }
        
        setErrorField('website');
        setErrorMessage(urlCheckResult.error || 'Podany adres strony jest nieprawidłowy lub strona nie istnieje. Sprawdź poprawność adresu.');
        setIsSubmitting(false);
        return;
      }
      

      setStatusMessage('');
      setTimeout(() => {
        setStatusMessage('Trwa wysyłanie formularza, proszę czekać...');
      }, 50);
      
      console.log('Wysyłanie danych do audytu:', data); // debug
      
      const payload = {
        url: data.website,
        email: data.email,
        name: data.name
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // timeout
      
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
        
        const responseData = await response.json();
        
        if (!response.ok) {

          console.error('Błąd z serwera:', responseData.error);
          setIsSuccess(false);
          setIsSubmitted(true);

          setStatusMessage('');
          setTimeout(() => {
            setStatusMessage(responseData.error || 'Wystąpił błąd podczas przeprowadzania audytu. Spróbuj ponownie lub skontaktuj się z nami.');
          }, 50);
          reset();
          setIsSubmitting(false);
          return; 
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = responseData as AuditResponse;
        
        console.log('Wyniki audytu:', result); // debug
        
        setIsSuccess(true);
        setIsSubmitted(true);

        setStatusMessage('');
        setTimeout(() => {
          setStatusMessage('Formularz został wysłany.');
        }, 50);
        reset();
        

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Ogólna obsługa błędów połączenia
        if (fetchError instanceof Error) {
          console.error('Błąd podczas wykonywania żądania:', fetchError);
          setIsSuccess(false);
          setIsSubmitted(true);
    
          setStatusMessage('');
          setTimeout(() => {
            setStatusMessage('Wystąpił błąd podczas przeprowadzania audytu. Spróbuj ponownie lub skontaktuj się z nami.');
          }, 50);
          reset();
          setIsSubmitting(false);
          return;
        }
        

        if (fetchError instanceof Error && 
            (fetchError.message.includes('URL') || 
             fetchError.message.includes('adres') || 
             fetchError.message.includes('nieprawidłowy'))) {
          console.error('Błąd adresu URL:', fetchError);
          setIsSuccess(false);
          setIsSubmitted(true);
          setStatusMessage('Podany adres strony jest nieprawidłowy lub strona nie istnieje. Sprawdź poprawność adresu i spróbuj ponownie.');
          reset();
          setIsSubmitting(false);
          return;   
        }
        
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          console.error('Przekroczono czas oczekiwania:', fetchError);
          setIsSuccess(false);
          setIsSubmitted(true);
          setStatusMessage('Przekroczono czas oczekiwania na odpowiedź serwera. Spróbuj ponownie później.');
          reset();
          setIsSubmitting(false);
          return;   
        }
        

        console.error('Nieobsłużony błąd:', fetchError);
        setIsSuccess(false);
        setIsSubmitted(true);
        setStatusMessage('Wystąpił nieoczekiwany błąd podczas przeprowadzania audytu. Spróbuj ponownie lub skontaktuj się z nami.');
        reset();
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Błąd podczas przeprowadzania audytu:', error);
      
      setIsSuccess(false);
      setIsSubmitted(true);
      setStatusMessage('Wystąpił błąd podczas przeprowadzania audytu. Spróbuj ponownie lub skontaktuj się z nami.');
      reset();
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
    <section className={styles.fullBackground} ref={wrapperRef} id="form">
      {/* Komunikat dla czytników ekranu o wysłaniu formularza */}
      {isSubmitted && !isSubmitting && isSuccess && (
        <div aria-live="assertive" className="sr-only" role="alert">
          Formularz został wysłany pomyślnie
        </div>
      )}
      
      {/* Komunikat dla czytników ekranu o błędzie */}
      {isSubmitted && !isSubmitting && !isSuccess && (
        <div aria-live="assertive" className="sr-only" role="alert">
          Wystąpił błąd podczas wysyłania formularza. {statusMessage}
        </div>
      )}
      <div className={styles.gridBackground} />
      <div className={styles.wrapper}>

        
        {isSubmitted ? (
          <div className={styles.thankYou}>
            <div 
              className={styles.text}
              ref={statusRef}
              role="status"
              aria-live="polite"
            >
              <div className="sr-only">{statusMessage}</div>
              <h2 className={styles.title}>
                {isSuccess ? 'Dziękujemy za zamówienie audytu!' : 'Upss,  coś poszło nie tak...'}
              </h2>
              <p className={styles.desc}>
                {isSuccess 
                  ? 'Raport zostanie wysłany na podany adres e-mail w ciągu kilku minut.' 
                  : 'Nie udało się przeprowadzić audytu. Być może strona, którą chcesz sprawdzić, ma zabezpieczenia, które blokują nasz automatyczny audyt.'}
              </p>
              <p className={styles.desc}>
                {isSuccess 
                  ? 'Sprawdź swoją skrzynkę odbiorczą (oraz folder spam).' 
                  : 'Napisz do mnie, a wykonam dla Ciebie automatyczny audyt bez żadnych opłat!'}
              </p>
              <div className={styles.buttonContainer}>
              
                <Button 
                  onClick={isSuccess ? () => {
                    setIsSubmitted(false);
                    setIsSuccess(false);
                    setStatusMessage('');
                    setIsSubmitting(false);
                    reset();
                  } : handleContactClick}
                  aria-label={isSuccess ? "Powrót do formularza" : "Napisz do mnie"}  
                  variant="primary"
                  isLoading={!isSuccess && isContactLoading}
                >
                  {isSuccess ? 'OK!' : 'Napisz do mnie'}
                </Button>
                {!isSuccess && (
                  <Button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setIsSuccess(false);
                      setStatusMessage('');
                      setIsSubmitting(false);
                      reset();
                    }}
                    aria-label="Powrót do formularza"
                    variant="secondary"
                  >
                    Powrót
                  </Button>
                )}
              </div>
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

            <div>
              <div 
                className={styles.srOnly} 
                aria-live="assertive" 
                role="alert" 
                id="form-status-message"
                ref={statusMessageRef}
              >
                {statusMessage && statusMessage}
              </div>
              
              <div 
                className={styles.srOnly} 
                aria-live="assertive" 
                role="alert" 
                id="url-error-message"
              >
                {errorField === 'website' && errorMessage}
              </div>
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
                isLoading={isSubmitting}
                loadingText="Audytuję..."
                aria-busy={isSubmitting}
              >
                Zamów audyt
              </Button>
            </div>

            <p className={styles.info}>
              Dane wykorzystam wyłącznie do przesłania audytu. Żadnych newsletterów i spamu.
            </p>
          </form>
          </>
        )}
      </div>
    </section>
  );
};
