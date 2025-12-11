"use client";

import Header from "../components/Header/Header";
import CompanyHeader from "../components/CompanyHeader/CompanyHeader";
import Footer from "../components/Footer/Footer";
import ContentBlock from "./components/ContentBlock";
import styles from "./page.module.css";
import { useUserStore } from "@/store/useUserStore";

export default function AboutPage() {
  // Get user directly from Zustand (persist handles hydration)
  const currentUser = useUserStore((state) => state.user);

  return (
    <>
      {/* Header based on role */}
      {currentUser?.role === "company" ? <CompanyHeader /> : <Header />}

      <div className={styles.pageContainer}>
        <main className={styles.container}>
          <div className={styles.contentWrapper}>
            <header className={styles.header}>
              <h1 className={styles.title}>About EcoTrack</h1>
              <div className={styles.titleUnderline}></div>
            </header>

            <section className={styles.content}>
              <ContentBlock
                title="Our Mission"
                text="EcoTrack provides intelligent environmental tracking solutions that help users reduce their ecological footprint using data-driven insights."
              />

              <ContentBlock
                title="Technology & Innovation"
                text="Our platform uses analytics and machine learning to convert complex environmental data into clear and actionable insights."
              />

              <ContentBlock
                title="Impact & Results"
                text="EcoTrack helps users reduce energy, water, and waste consumption through informed decisions."
              />

              <ContentBlock
                title="Our Commitment"
                text="We continuously improve our tools and maintain strong privacy and security standards."
              />
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
