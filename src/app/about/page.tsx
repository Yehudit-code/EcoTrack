import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.container}>
        <div className={styles.contentWrapper}>
          <header className={styles.header}>
            <h1 className={styles.title}>About Us</h1>
            <div className={styles.titleUnderline}></div>
          </header>

          <section className={styles.content}>
            <div className={styles.textBlock}>
              <p className={styles.paragraph}>
                At our company, we believe that a greener future begins at home.
              </p>
            </div>

            <div className={styles.textBlock}>
              <p className={styles.paragraph}>
                Our goal is to make every home a smarter, more efficient, and eco-friendly environment — without compromising on comfort or quality of life.
              </p>
            </div>

            <div className={styles.textBlock}>
              <p className={styles.paragraph}>
                By combining innovative technology, environmental awareness, and practical solutions, we help people reduce energy consumption, save water, and prevent waste — one step at a time toward a cleaner, healthier world.
              </p>
            </div>

            <div className={styles.textBlock}>
              <p className={styles.paragraph}>
                We aim to inspire real change — change that starts with one small decision at home and grows into a community choosing to live smart, green, and with purpose.
              </p>
            </div>
          </section>

          <div className={styles.decorativeElement}>
            <div className={styles.leafIcon}>🌿</div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>footer</footer>
    </div>
  );
}
