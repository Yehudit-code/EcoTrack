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
          <div style={{ height: '40px' }} aria-hidden="true" />

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
          <div style={{ height: '40px' }} aria-hidden="true" />

        </section>
      )}


      {/* Spacer for visual gap between info boxes and videos section */}
      <div style={{ height: '100px' }} aria-hidden="true" />



      {/* ---------- VIDEOS SECTION ---------- */}
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


      {role === "user" && (
        <>
          {open && <ChatWindow onClose={() => setOpen(false)} />}
          <ChatBubble onClick={() => setOpen(true)} />
        </>
      )}


      <div style={{ height: '80px' }} aria-hidden="true" />


      <Footer />
    </>
  );
}