'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from './Form.module.scss';
import { Button } from '@/components/atoms/Button/Button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';


async function verifyUrl(url: string): Promise<{ success: boolean; url?: string; title?: string; error?: string }> {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const response = await fetch('/api/verify-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    return { 
      success: response.ok && data.success, 
      url: data.url,
      title: data.title,
      error: data.error 
    };
  } catch (error) {
    console.error('Błąd podczas weryfikacji URL:', error);
    return { 
      success: false, 
      error: 'Wystąpił błąd podczas weryfikacji adresu URL' 
    };
  }
}


/* interface AuditViolation {
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
} */

/* interface AuditResults {
  summary: AuditSummary;
  violations: AuditViolation[];
}
 */
/* interface AuditResponse {
  success: boolean;
  url: string;
  email: string;
  name: string;
  results: AuditResults;
} */

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
      
      // Krok 1: Weryfikacja URL z Playwright
      setStatusMessage('Trwa weryfikacja strony...');
      
      const verifyResult = await verifyUrl(data.website);
    
      if (!verifyResult.success) {
        const websiteInput = document.getElementById('website');
        if (websiteInput) {
          websiteInput.focus();
        }
        
        setErrorField('website');
        setErrorMessage(verifyResult.error || 'Podany adres strony jest nieprawidłowy lub strona nie może być zaudytowana');
        setIsSubmitting(false);
        return;
      }
      
      // Krok 2: Dodanie do kolejki audytów
      setStatusMessage('Strona zweryfikowana. Dodawanie do kolejki audytów...');
      console.log("\x1b[33m%s\x1b[0m", "URL ok, rozpoczynam audyt");
      const payload = {
        url: verifyResult.url || data.website, // Używamy znormalizowanego URL z weryfikacji
        email: data.email,
        name: data.name
      };
      
      try {
        const queueResponse = await fetch('/api/queue-audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(payload)
        });
        
        const queueResult = await queueResponse.json();
        
        if (!queueResponse.ok || !queueResult.success) {
          setIsSuccess(false);
          setIsSubmitted(true);
          setStatusMessage(queueResult.error || 'Wystąpił błąd podczas dodawania audytu do kolejki. Spróbuj ponownie lub skontaktuj się z nami.');
          reset();
          setIsSubmitting(false);
          return; 
        }
        
        // Krok 3: Wyświetlenie komunikatu o sukcesie
        setIsSuccess(true);
        setIsSubmitted(true);
        setStatusMessage('Twój audyt został dodany do kolejki. Wyniki otrzymasz na podany adres email.');
        reset();
        setIsSubmitting(false);
        
      } catch (fetchError) {
        // ogolna obsluga bledow
        setIsSuccess(false);
        setIsSubmitted(true);
        
        if (fetchError instanceof Error && 
            (fetchError.message.includes('URL') || 
             fetchError.message.includes('adres') || 
             fetchError.message.includes('nieprawidłowy'))) {
          setStatusMessage('Podany adres strony jest nieprawidłowy lub strona nie istnieje. Sprawdź poprawność adresu i spróbuj ponownie.');
        } else if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          setStatusMessage('Przekroczono czas oczekiwania na odpowiedź serwera. Spróbuj ponownie później.');
        } else {
          setStatusMessage('Wystąpił błąd podczas dodawania audytu do kolejki. Spróbuj ponownie lub skontaktuj się z nami.');
        }
        
        reset();
        setIsSubmitting(false);
      }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsSuccess(false);
      setIsSubmitted(true);
      setStatusMessage('Wystąpił błąd podczas przetwarzania formularza. Spróbuj ponownie lub skontaktuj się z nami.');
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
                  : 'Nie udało się przeprowadzić audytu. Być może strona, którą chcesz sprawdzić, ma zabezpieczenia blokujące nasz automatyczny audyt.'}
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
            Wykonaj bezpłatny audyt dostępności Twojej strony
          </h2>
          <p className={styles.desc}>
            Sprawdź, czy Twoja strona jest zgodna z standardami dostępności WCAG 2.2. <br/>
            Audyt jest automatyczny i w ciągu kilku minut otrzymasz raport na podany adres e-mail.
          </p>
          <p>   Audyt może chwilkę potrwać, nie odświeżaj strony.</p>
        </div>
        
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className={styles.form}
            noValidate={true}
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
                Wykonaj audyt
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
