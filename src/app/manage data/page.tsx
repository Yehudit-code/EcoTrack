import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

export default function ManageDataPage() {
  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contentBox}>
          <h1 className={styles.title}>ניהול נתונים</h1>
          
          <div className={styles.dataSection}>
            <div className={styles.dataCard}>
              <h3>צריכת חשמל</h3>
              <div className={styles.inputGroup}>
                <label>קילוואט שעה חודשי:</label>
                <input type="number" placeholder="הזן צריכה חודשית" />
              </div>
              <button className={styles.saveBtn}>שמור נתונים</button>
            </div>

            <div className={styles.dataCard}>
              <h3>צריכת מים</h3>
              <div className={styles.inputGroup}>
                <label>מ&quot;ק מים חודשי:</label>
                <input type="number" placeholder="הזן צריכה חודשית" />
              </div>
              <button className={styles.saveBtn}>שמור נתונים</button>
            </div>

            <div className={styles.dataCard}>
              <h3>תחבורה</h3>
              <div className={styles.inputGroup}>
                <label>ק&quot;מ נסיעה חודשי:</label>
                <input type="number" placeholder="הזן מרחק נסיעה" />
              </div>
              <button className={styles.saveBtn}>שמור נתונים</button>
            </div>

            <div className={styles.dataCard}>
              <h3>פסולת</h3>
              <div className={styles.inputGroup}>
                <label>ק&quot;ג פסולת שבועי:</label>
                <input type="number" placeholder="הזן כמות פסולת" />
              </div>
              <button className={styles.saveBtn}>שמור נתונים</button>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>footer</footer>
      
    </div>
  );
}