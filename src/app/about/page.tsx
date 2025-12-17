'use client';

import Header from "@/app/components/Header/Header";
import CompanyHeader from "@/app/components/CompanyHeader/CompanyHeader";
import Footer from "../components/Footer/Footer";

import ContentBlock from "./components/ContentBlock";
import styles from "./page.module.css";
import { useUserStore } from "@/store/useUserStore";

export default function AboutPage() {

  const role = useUserStore((state) => state.user?.role);

  return (
    <>
      {/* --- Header according to user role --- */}
      {role === "company" ? <CompanyHeader /> : <Header />}

      <div className={styles.pageContainer}>
        <main className={styles.container}>
          <div className={styles.contentWrapper}>
            <header className={styles.header}>
              <h1 className={styles.title}>About EcoTrack</h1>
              <div className={styles.titleUnderline}></div>
            </header>

            <section className={styles.content}>
              <div className={styles.textBlock}>
                <h2 className={styles.sectionTitle}>Our Mission</h2>
                <p className={styles.paragraph}>
                  EcoTrack provides intelligent environmental tracking solutions that help individuals and organizations monitor, analyze, and reduce their ecological footprint through data-driven insights and actionable recommendations.
                </p>
              </div>

              <div className={styles.textBlock}>
                <h2 className={styles.sectionTitle}>Technology & Innovation</h2>
                <p className={styles.paragraph}>
                  Our platform leverages advanced analytics and machine learning to transform complex environmental data into clear, actionable insights. We make sustainability accessible through intuitive interfaces and personalized recommendations.
                </p>
              </div>

              <div className={styles.textBlock}>
                <h2 className={styles.sectionTitle}>Impact & Results</h2>
                <p className={styles.paragraph}>
                  Since our launch, EcoTrack has helped users reduce energy consumption by an average of 23%, decrease water usage by 18%, and minimize waste generation by 31% through informed decision-making and behavioral optimization.
                </p>
              </div>

              <div className={styles.textBlock}>
                <h2 className={styles.sectionTitle}>Our Commitment</h2>
                <p className={styles.paragraph}>
                  We are committed to continuous innovation in environmental technology, ensuring our solutions remain at the forefront of sustainability science while maintaining the highest standards of data privacy and security.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
