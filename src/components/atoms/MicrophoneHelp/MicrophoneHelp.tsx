'use client';

import styles from './MicrophoneHelp.module.scss';

interface MicrophoneHelpProps {
  isVisible: boolean;
  onClose: () => void;
}

export const MicrophoneHelp = ({ isVisible, onClose }: MicrophoneHelpProps) => {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>🎤 Jak włączyć mikrofon?</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Zamknij pomoc"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Znajdź ikonę kłódki 🔒 w pasku adresu</h4>
              <p>Kliknij na ikonę kłódki lub informacji (ⓘ) obok adresu strony</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Otwórz ustawienia uprawnień</h4>
              <ul>
                <li><strong>Chrome:</strong> &quot;Ustawienia witryny&quot; → &quot;Mikrofon&quot;</li>
                <li><strong>Firefox:</strong> &quot;Uprawnienia&quot; → &quot;Mikrofon&quot;</li>
                <li><strong>Edge:</strong> &quot;Uprawnienia dla tej witryny&quot; → &quot;Mikrofon&quot;</li>
              </ul>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Zmień na &quot;Zezwól&quot;</h4>
              <p>Wybierz opcję &quot;Zezwól&quot; lub &quot;Zawsze zezwalaj&quot; dla mikrofonu</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Odśwież stronę</h4>
              <p>Naciśnij F5 lub Ctrl+R aby odświeżyć stronę</p>
            </div>
          </div>

          <div className={styles.note}>
            <strong>💡 Wskazówka:</strong> Funkcja dyktowania wymaga połączenia z internetem 
            i działa najlepiej w cichym otoczeniu.
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.okButton} onClick={onClose}>
            Rozumiem
          </button>
        </div>
      </div>
    </div>
  );
};
