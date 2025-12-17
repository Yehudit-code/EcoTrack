'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';

import Header from '../components/Header/Header';
import CompanyHeader from '../components/CompanyHeader/CompanyHeader';
import Footer from '../components/Footer/Footer';
import ChatBubble from '../components/AIChat/ChatBubble';
import ChatWindow from '../components/AIChat/ChatWindow';
import ImageComponent from '../components/ImageComponent/ImageComponent';

import styles from './page.module.css';
import { useUserStore } from '@/store/useUserStore';

export default function HomePage() {
  const { user, _hasHydrated } = useUserStore();
  const role = user?.role ?? null;

  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  const intersectionCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleItems((prev) => new Set([...prev, entry.target.id]));
        }
      });
    },
    []
  );

  useEffect(() => {
    if (!_hasHydrated) return;

    observerRef.current = new IntersectionObserver(intersectionCallback, {
      threshold: 0.05,
      rootMargin: "200px 0px -100px 0px",
    });

    const elements = document.querySelectorAll("[id^='feature-']");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [_hasHydrated, intersectionCallback]);

  if (!_hasHydrated) return null;

  return (
    <>
      {role === 'company' ? <CompanyHeader /> : <Header />}

      <ImageComponent />

      <section className={styles.heroSection}></section>

      {role === 'user' && (
        <section className={styles.infoBoxesSection}>
          <h2 className={styles.infoBoxesTitle}>How to Use EcoTrack</h2>

          <div className={styles.infoBoxesGrid}>
            <div
              className={styles.infoBox}
              onClick={() => router.push('/manage-data')}
            >
              <h3>Manage Data</h3>
              <p>
                Enter your monthly energy, water, and transport consumption
                easily.
              </p>
            </div>

            <div
              className={styles.infoBox}
              onClick={() => router.push('/user/indicators')}
            >
              <h3>Live Consumption</h3>
              <p>
                Track your usage in real time and compare between months.
              </p>
            </div>

            <div
              className={styles.infoBox}
              onClick={() => router.push('/social-sharing')}
            >
              <h3>Social Sharing</h3>
              <p>
                Share posts, interact, and get inspired by the eco community.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.featuresSection}>
            <div
              id="feature-water"
              className={`${styles.featureRow} ${styles.slideLeft} ${
                visibleItems.has('feature-water') ? styles.visible : ''
              }`}
            >
              <div className={styles.featureImage}>
                <img src="/images/מים.png" alt="Water Conservation" />
              </div>
              <div className={styles.featureContent}>
                <h3>Smart Water Management</h3>
                <p>
                  Advanced systems help reduce water consumption significantly.
                </p>
              </div>
            </div>

            <div
              id="feature-energy"
              className={`${styles.featureRow} ${styles.slideRight} ${
                visibleItems.has('feature-energy') ? styles.visible : ''
              }`}
            >
              <div className={styles.featureContent}>
                <h3>Energy Analytics</h3>
                <p>
                  Get insights into electricity usage and optimize your energy.
                </p>
              </div>
              <div className={styles.featureImage}>
                <img src="/images/חשמל.png" alt="Energy Management" />
              </div>
            </div>

            <div
              id="feature-transport"
              className={`${styles.featureRow} ${styles.slideLeft} ${
                visibleItems.has('feature-transport') ? styles.visible : ''
              }`}
            >
              <div className={styles.featureImage}>
                <img src="/images/אופניים.png" alt="Eco Transport" />
              </div>
              <div className={styles.featureContent}>
                <h3>Sustainable Transportation</h3>
                <p>Track eco-friendly commuting habits and reduce emissions.</p>
              </div>
            </div>
          </div>

          <div className={styles.videosSection}>
            <div className={styles.videosOverlayText}>
              <h2 className={styles.overlayGreen}>Let's keep our world</h2>
              <h2 className={styles.overlayWhite}>CLEAN</h2>
            </div>

            <div className={styles.videosContainer}>
              <div className={styles.videoWrapper}>
                <iframe
                  src="https://www.youtube.com/embed/2H_YyklnpFM?autoplay=1&mute=1&loop=1&playlist=2H_YyklnpFM"
                  title="Eco Video 1"
                  allow="autoplay"
                />
              </div>

              <div className={styles.videoWrapper}>
                <iframe
                  src="https://www.youtube.com/embed/au1M6TggB_U?autoplay=1&mute=1&loop=1&playlist=au1M6TggB_U"
                  title="Eco Video 2"
                  allow="autoplay"
                />
              </div>

              <div className={styles.videoWrapper}>
                <iframe
                  src="https://www.youtube.com/embed/G9NRzrx7m4U?autoplay=1&mute=1&loop=1&playlist=G9NRzrx7m4U"
                  title="Eco Video 3"
                  allow="autoplay"
                />
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