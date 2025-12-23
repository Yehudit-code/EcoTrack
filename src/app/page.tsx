"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <FontAwesomeIcon icon={faLeaf} className={styles.logoIcon} />
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
              Monitor and optimize your environmental impact with intelligent
              tracking, actionable insights, and personalized recommendations
              for a greener tomorrow.
            </p>

            <div className={styles.ctaButtons}>
              <Link href="/signUp">
                <button className={styles.primaryCta}>
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
