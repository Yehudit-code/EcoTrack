import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

export default function IndicatorsPage() {
  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contentBox}>
          <h1 className={styles.title}>מדדים ונתונים</h1>
          
          <div className={styles.indicatorsGrid}>
            <div className={styles.indicatorCard}>
              <h3>חיסכון חודשי בחשמל</h3>
              <div className={styles.valueDisplay}>
                <span className={styles.value}>12%</span>
                <span className={styles.unit}>חיסכון</span>
              </div>
              <div className={styles.comparison}>
                <span className={styles.positive}>↑ 3% מהחודש הקודם</span>
              </div>
            </div>

            <div className={styles.indicatorCard}>
              <h3>חיסכון חודשי במים</h3>
              <div className={styles.valueDisplay}>
                <span className={styles.value}>8%</span>
                <span className={styles.unit}>חיסכון</span>
              </div>
              <div className={styles.comparison}>
                <span className={styles.positive}>↑ 1% מהחודש הקודם</span>
              </div>
            </div>

            <div className={styles.indicatorCard}>
              <h3>הפחתת פליטות פחמן</h3>
              <div className={styles.valueDisplay}>
                <span className={styles.value}>2.3</span>
                <span className={styles.unit}>טון CO2</span>
              </div>
              <div className={styles.comparison}>
                <span className={styles.positive}>↑ 0.4 טון מהחודש הקודם</span>
              </div>
            </div>

            <div className={styles.indicatorCard}>
              <h3>הפחתת פסולת</h3>
              <div className={styles.valueDisplay}>
                <span className={styles.value}>15%</span>
                <span className={styles.unit}>הפחתה</span>
              </div>
              <div className={styles.comparison}>
                <span className={styles.negative}>↓ 2% מהחודש הקודם</span>
              </div>
            </div>

            <div className={styles.indicatorCard}>
              <h3>דירוג סביבתי</h3>
              <div className={styles.valueDisplay}>
                <span className={styles.value}>A-</span>
                <span className={styles.unit}>דירוג</span>
              </div>
              <div className={styles.comparison}>
                <span className={styles.neutral}>ללא שינוי</span>
              </div>
            </div>

            <div className={styles.indicatorCard}>
              <h3>חיסכון כספי חודשי</h3>
              <div className={styles.valueDisplay}>
                <span className={styles.value}>₪287</span>
                <span className={styles.unit}>חיסכון</span>
              </div>
              <div className={styles.comparison}>
                <span className={styles.positive}>↑ ₪45 מהחודש הקודם</span>
              </div>
            </div>
          </div>

          <div className={styles.chartSection}>
            <h2>גרפי התקדמות</h2>
            <div className={styles.chartContainer}>
              <div className={styles.chart}>
                <p>גרף צריכת חשמל - 6 חודשים אחרונים</p>
              </div>
              <div className={styles.chart}>
                <p>גרף צריכת מים - 6 חודשים אחרונים</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>footer</footer>
    </div>
  );
}