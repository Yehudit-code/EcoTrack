import styles from './page.module.css';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          {/* עדכון לשם הקובץ החדש */}
          <img src="/logoEcoTrack.png" alt="Eco Track Logo" />
          <span>ECO TRACK</span>
        </div>
        <div className={styles.authButtons}>
          <Link href="/signin"><button className={styles.button}>Sign in</button></Link>
          <Link href="/signup"><button className={styles.button}>Sign up</button></Link>
        </div>
      </header>

      <main className={styles.main}>
        <h1>The future of living <br /> starts at home</h1>
        <p>
          Technology changes, but sustainability lasts. With our platform, people, ideas, and smart tools unite to create greener, smarter homes for a better world.
        </p>
      </main>
    </div>
  );
}
