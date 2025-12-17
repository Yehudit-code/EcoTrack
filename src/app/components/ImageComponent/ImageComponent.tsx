'use client'; 

import React, { useState, useEffect } from 'react';
import styles from './ImageComponent.module.css';

interface Feature {
  id: string;
  reverse: boolean;
  image: string;
  alt: string;
  title: string;
  description: string;
  items: string[];
}

const featuresData: Feature[] = [
  {
    id: 'feature-transport',
    reverse: false,
    image: '/images/אופניים.png',
    alt: 'Eco Transport',
    title: 'Eco Transportation',
    description: 'Monitor eco-friendly transportation and reduce footprint...',
    items: ['Transport tracking', 'CO₂ calculation', 'Eco routes'],
  },
  {
    id: 'feature-environment',
    reverse: true,
    image: '/images/עלים.png',
    alt: 'Environmental Impact',
    title: 'Environmental Impact Assessment',
    description: 'Full analysis of your ecological footprint...',
    items: ['Impact scoring', 'Action plans', 'Behavior insights'],
  },
  {
    id: 'feature-water',
    reverse: false,
    image: '/images/מים.png',
    alt: 'Water Conservation',
    title: 'Smart Water Management',
    description: 'Advanced monitoring systems help reduce water consumption...',
    items: ['Real-time tracking', 'Leak detection', 'Usage optimization'],
  },
  {
    id: 'feature-energy',
    reverse: true,
    image: '/images/חשמל.png',
    alt: 'Energy Management',
    title: 'Energy Efficiency Analytics',
    description: 'Track peak consumption hours and energy-hungry devices...',
    items: ['Peak usage analysis', 'Device-level tracking', 'CO₂ calculation'],
  },
];

export default function Features() {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            setVisibleItems((prev) => new Set(prev).add(target.id));
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    featuresData.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.featuresWrapper}>
      {featuresData.map(({ id, reverse, image, alt, title, description, items }) => (
        <section
          key={id}
          id={id}
          className={`${styles.featureSection} ${reverse ? styles.reverse : ''} ${
            visibleItems.has(id) ? styles.visible : ''
          }`}
        >
          {id === 'feature-transport' || id === 'feature-water' ? (
            <>
              <div className={styles.featureImage} style={{ order: 2 }}>
                <img src={image} alt={alt} />
              </div>
              <div className={styles.featureText} style={{ order: 1 }}>
                <h3>{title}</h3>
                <p>{description}</p>
                <ul>
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className={styles.featureImage}>
                <img src={image} alt={alt} />
              </div>
              <div className={styles.featureText}>
                <h3>{title}</h3>
                <p>{description}</p>
                <ul>
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      ))}
    </div>
  );
}