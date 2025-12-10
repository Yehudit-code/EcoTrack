"use client";

import styles from "./page.module.css";
import Link from "next/link";

export default function HomePage() {

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 100 100" className={styles.logoIcon}>
            <path d="M30 70 Q50 20 70 70 Q50 50 30 70" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2"/>
            <circle cx="35" cy="65" r="3" fill="#66BB6A"/>
            <circle cx="50" cy="35" r="2" fill="#81C784"/>
            <circle cx="65" cy="65" r="3" fill="#66BB6A"/>
          </svg>
          <span className={styles.logoText}>EcoTrack</span>
        </div>
        <div className={styles.authButtons}>
          <Link href="/signIn">
            <button className={styles.authButton}>Sign In</button>
          </Link>
          <Link href="/signUp">
            <button className={styles.primaryButton}>Sign Up</button>
          </Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              The Future of Sustainable Living
              <span className={styles.highlight}> Starts Here</span>
            </h1>
            
            <p className={styles.heroDescription}>
              Monitor and optimize your environmental impact with intelligent tracking, 
              actionable insights, and personalized recommendations for a greener tomorrow.
            </p>

            <div className={styles.ctaButtons}>
              <Link href="/signUp">
                <button className={styles.primaryCta}>
                  Get Started Free
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
                  </svg>
                </button>
              </Link>
            </div>

          </div>
        </div>
      </section>


    </div>
  );
}
