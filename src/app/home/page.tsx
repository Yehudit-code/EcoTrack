'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ChatBubble from "../components/AIChat/ChatBubble";
import ChatWindow from "../components/AIChat/ChatWindow";
import styles from './page.module.css';

export default function HomePage() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(new Set<string>());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [open, setOpen] = useState(false);

  // Intersection Observer for scroll animations
  const intersectionCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        console.log(`Element ${entry.target.id} is now visible`);
        setVisibleItems(prev => new Set([...prev, entry.target.id]));
      }
    });
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(intersectionCallback, {
      threshold: 0.05,
      rootMargin: '200px 0px -100px 0px'
    });

    // Re-observe all existing elements
    const elements = document.querySelectorAll('[id^="feature-"]');
    elements.forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [intersectionCallback]);

  // Ref callback for Intersection Observer
  const createObserverRef = useCallback((el: HTMLDivElement | null) => {
    if (el && observerRef.current) {
      console.log('Observing element:', el.id);
      observerRef.current.observe(el);
    }
  }, []);

  // Debug function to manually trigger animations (for testing)
  useEffect(() => {
    console.log('Current visible items:', Array.from(visibleItems));
  }, [visibleItems]);

  const dailyTips = [
    'Turn off the tap while brushing your teeth - save up to 8 liters per minute!',
    'Switch to LED bulbs - they use 75% less energy than traditional bulbs',
    'Take shorter showers - reducing by 2 minutes saves 37 liters of water',
    'Unplug electronics when not in use - they consume energy even when off',
    'Use cold water for washing clothes - saves energy and preserves fabric colors',
    'Walk or bike for short trips - reduce emissions and improve your health',
    'Fix leaky faucets immediately - a single drip wastes 3,000 liters per year',
    'Use a programmable thermostat - save 10-15% on heating and cooling costs',
    'Recycle properly - one recycled aluminum can saves energy to power a TV for 3 hours',
    'Choose reusable bags - one person uses 500+ plastic bags per year on average'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) =>
        (prevIndex + 1) % dailyTips.length
      );
    }, 600000);

    return () => clearInterval(interval);
  }, [dailyTips.length]);



  return (
    <>
      <Header />
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.heroSection}>
            <div className={styles.heroContent}>
              <h1 className={styles.mainTitle}>Welcome to EcoTrack</h1>
              <p className={styles.subtitle}>Your personal environmental companion for sustainable living</p>
              <p className={styles.heroDescription}>
                Join thousands of users who are already making a positive impact on the environment.
                Track your consumption, get personalized tips, and see your progress towards a greener lifestyle.
              </p>
              <div className={styles.heroActions}>
                <button className={styles.ctaButton}>Start Tracking Now</button>
                <button className={styles.learnMoreButton}>Learn More</button>
              </div>
            </div>
          </div>

           

          <div className={styles.featuresSection}>
           

            <div
              id="feature-water"
              className={`${styles.featureRow} ${styles.slideLeft} ${visibleItems.has('feature-water') ? styles.visible : ''}`}
              ref={createObserverRef}
            >
              <div className={styles.featureImage}>
                <img src="/images/מים.png" alt="Water Conservation" width={22} height={22} />
                <div className={styles.imageOverlay}>
                  <h3 className={styles.smallText}>Water Conservation</h3>
                </div>
              </div>
              <div className={styles.featureContent}>
                <h3 className={styles.smallText}>Smart Water Management</h3>
                <p className={styles.smallText}>
                  Advanced monitoring systems help reduce water consumption by up to 40% in residential homes.
                  Our intelligent sensors track usage patterns and provide real-time alerts for leaks or
                  excessive consumption, helping you save both water and money.
                </p>
                <ul>
                  <li>Real-time consumption tracking</li>
                  <li>Leak detection alerts</li>
                  <li>Usage optimization recommendations</li>
                </ul>
              </div>
            </div>

            <div
              id="feature-energy"
              className={`${styles.featureRow} ${styles.slideRight} ${visibleItems.has('feature-energy') ? styles.visible : ''}`}
              ref={createObserverRef}
            >
              <div className={styles.featureContent}>
                <h3 className={styles.smallText}>Energy Efficiency Analytics</h3>
                <p className={styles.smallText}>
                  Comprehensive analytics provide deep insights into energy usage patterns and optimization
                  opportunities. Track peak consumption hours, identify energy-hungry devices, and receive
                  personalized recommendations to reduce your carbon footprint.
                </p>
                <ul>
                  <li>Peak hour consumption analysis</li>
                  <li>Device-level energy tracking</li>
                  <li>Carbon footprint calculation</li>
                </ul>
              </div>
              <div className={styles.featureImage}>
                <img src="/images/חשמל.png" alt="Energy Management" width={22} height={22} />
                <div className={styles.imageOverlay}>
                  <h3 className={styles.smallText}>Energy Management</h3>
                </div>
              </div>
            </div>

            <div
              id="feature-transport"
              className={`${styles.featureRow} ${styles.slideLeft} ${visibleItems.has('feature-transport') ? styles.visible : ''}`}
              ref={createObserverRef}
            >
              <div className={styles.featureImage}>
                <img src="/images/אופניים.png" alt="Sustainable Transportation" width={22} height={22} />
                <div className={styles.imageOverlay}>
                  <h3 className={styles.smallText}>Eco Transportation</h3>
                </div>
              </div>
              <div className={styles.featureContent}>
                <h3 className={styles.smallText}>Sustainable Mobility Tracking</h3>
                <p className={styles.smallText}>
                  Monitor and encourage eco-friendly transportation choices to significantly reduce your
                  carbon footprint. Track cycling distances, public transport usage, and walking routes
                  while calculating the environmental impact of your daily commute.
                </p>
                <ul>
                  <li>Multi-modal transport tracking</li>
                  <li>CO2 emissions calculation</li>
                  <li>Eco-friendly route suggestions</li>
                </ul>
              </div>
            </div>

            <div
              id="feature-environment"
              className={`${styles.featureRow} ${styles.slideRight} ${visibleItems.has('feature-environment') ? styles.visible : ''}`}
              ref={createObserverRef}
            >
              <div className={styles.featureContent}>
                <h3 className={styles.smallText}>Environmental Impact Assessment</h3>
                <p className={styles.smallText}>
                  Comprehensive tracking of your complete environmental footprint with actionable
                  recommendations for improvement. Our advanced algorithms analyze your consumption
                  patterns and provide personalized strategies for sustainable living.
                </p>
                <ul>
                  <li>Holistic impact analysis</li>
                  <li>Sustainability scoring</li>
                  <li>Personalized action plans</li>
                </ul>
              </div>
              <div className={styles.featureImage}>
                <img src="/images/עלים.png" alt="Environmental Impact" width={22} height={22} />
                <div className={styles.imageOverlay}>
                  <h3 className={styles.smallText}>Environmental Impact</h3>
                </div>
              </div>
            </div>

            <div className={styles.aboutSection}>
              <div className={styles.aboutContent}>
                <h2>About EcoTrack</h2>
                <p className={styles.aboutText}>
                  EcoTrack is a cutting-edge environmental monitoring platform designed to help individuals
                  and families make informed decisions about their ecological footprint. Our innovative
                  technology combines real-time data collection with intelligent analytics to provide
                  actionable insights for sustainable living.
                </p>
                <p className={styles.aboutText}>
                  Founded on the principles of environmental responsibility and technological innovation,
                  EcoTrack empowers users to track their water usage, energy consumption, transportation
                  habits, and waste generation. Through detailed reporting and personalized recommendations,
                  we make sustainability accessible and achievable for everyone.
                </p>
                <p className={styles.aboutText}>
                  Join thousands of users who have already reduced their environmental impact by an average
                  of 35% within the first six months of using EcoTrack. Together, we can create a more
                  sustainable future for generations to come.
                </p>
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
