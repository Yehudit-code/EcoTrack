"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/Header/Header";
import CompanyHeader from "../components/CompanyHeader/CompanyHeader";
import Footer from "../components/Footer/Footer";
import ChatBubble from "../components/AIChat/ChatBubble";
import ChatWindow from "../components/AIChat/ChatWindow";
import styles from "./page.module.css";
import { useUserStore } from "@/store/useUserStore";

export default function HomePage() {
  const role = useUserStore((state) => state.user?.role ?? null); // Role from Zustand

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(new Set<string>());
  const [open, setOpen] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const intersectionCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setVisibleItems((prev) => new Set([...prev, entry.target.id]));
      }
    });
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(intersectionCallback, {
      threshold: 0.05,
      rootMargin: "200px 0px -100px 0px",
    });

    const elements = document.querySelectorAll('[id^="feature-"]');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [intersectionCallback]);

  const createObserverRef = useCallback((el: HTMLDivElement | null) => {
    if (el) observerRef.current?.observe(el);
  }, []);

  const dailyTips = [
    "Turn off the tap while brushing your teeth - save up to 8 liters per minute!",
    "Switch to LED bulbs - they use 75% less energy.",
    "Shorten your showers to save water.",
    "Unplug electronics when not in use.",
    "Use cold water for washing clothes.",
    "Walk or bike for short trips.",
    "Fix leaky faucets immediately.",
    "Use a programmable thermostat.",
    "Recycle properly.",
    "Choose reusable bags.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % dailyTips.length);
    }, 600000);

    return () => clearInterval(interval);
  }, [dailyTips.length]);

  return (
    <>
      {role === "company" ? <CompanyHeader /> : <Header />}

      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.heroSection}>
            <div className={styles.heroContent}>
              <h1 className={styles.mainTitle}>Welcome to EcoTrack</h1>
              <p className={styles.subtitle}>Your personal environmental companion</p>
              <p className={styles.heroDescription}>
                Track your consumption, get personalized tips, and see your environmental impact.
              </p>

              <div className={styles.heroActions}>
                <button className={styles.ctaButton}>Start Tracking Now</button>
                <button className={styles.learnMoreButton}>Learn More</button>
              </div>
            </div>
          </div>

          <div className={styles.categoriesSection}>
            <h2 className={styles.sectionTitle}>What You Can Track</h2>

            <div className={styles.categoriesGrid}>
              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>💧</div>
                <h3>Water Usage</h3>
                <p>Monitor your water consumption.</p>
              </div>

              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>⚡</div>
                <h3>Electricity</h3>
                <p>Track and reduce your energy footprint.</p>
              </div>

              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>🔥</div>
                <h3>Gas Usage</h3>
                <p>Monitor gas consumption.</p>
              </div>

              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>🚗</div>
                <h3>Transportation</h3>
                <p>Track travel habits and emissions.</p>
              </div>

              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>🗑️</div>
                <h3>Waste</h3>
                <p>Improve recycling and reduce waste.</p>
              </div>
            </div>
          </div>

          <div className={styles.dailyTipSection}>
            <h2 className={styles.sectionTitle}>Daily Eco Tip</h2>
            <div className={styles.tipCard}>
              <p className={styles.tipText}>{dailyTips[currentTipIndex]}</p>
            </div>
          </div>

          {/* Features */}
          <div className={styles.featuresSection}>
            <div
              id="feature-water"
              className={`${styles.featureRow} ${styles.slideLeft} ${
                visibleItems.has("feature-water") ? styles.visible : ""
              }`}
              ref={createObserverRef}
            >
              <div className={styles.featureImage}>
                <img src="/images/מים.png" alt="Water Conservation" />
              </div>
              <div className={styles.featureContent}>
                <h3>Smart Water Management</h3>
                <p>Advanced systems reduce water consumption significantly.</p>
              </div>
            </div>

            <div
              id="feature-energy"
              className={`${styles.featureRow} ${styles.slideRight} ${
                visibleItems.has("feature-energy") ? styles.visible : ""
              }`}
              ref={createObserverRef}
            >
              <div className={styles.featureContent}>
                <h3>Energy Analytics</h3>
                <p>Get insights into electricity usage and optimization.</p>
              </div>
              <div className={styles.featureImage}>
                <img src="/images/חשמל.png" alt="Energy Management" />
              </div>
            </div>

            <div
              id="feature-transport"
              className={`${styles.featureRow} ${styles.slideLeft} ${
                visibleItems.has("feature-transport") ? styles.visible : ""
              }`}
              ref={createObserverRef}
            >
              <div className={styles.featureImage}>
                <img src="/images/אופניים.png" alt="Eco Transport" />
              </div>
              <div className={styles.featureContent}>
                <h3>Sustainable Transportation</h3>
                <p>Track eco-friendly commuting habits.</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {open && <ChatWindow onClose={() => setOpen(false)} />}
      <ChatBubble onClick={() => setOpen(true)} />
      <Footer />
    </>
  );
}
