import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contentBox}>
          <div className={styles.graph}></div>

          <div className={styles.infoSection}>
            <div className={styles.tipBox}>
              <p>הטיפ היומי שלך הוא:</p>
              <p className={styles.tipText}>
                &quot;תחסוך יותר - תשמור על עצמך ובין על סביבתך&quot;
              </p>
            </div>

            <div className={styles.scoreBox}>
              <p>ממוצע החיסכון החודשי שלך: <b>0.78</b></p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>footer</footer>
    </div>
  );
}
