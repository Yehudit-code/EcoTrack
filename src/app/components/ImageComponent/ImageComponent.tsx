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
    description:
      'Transportation is a major part of our environmental footprint. ' +
      'EcoTrack helps you understand how you move, track emissions, ' +
      'and choose smarter, greener ways to travel every day.',
    items: [
      'Track daily and monthly transportation habits',
      'Automatically calculate CO₂ emissions',
      'Explore eco-friendly routes and alternatives',
    ],
  },
  {
    id: 'feature-environment',
    reverse: true,
    image: '/images/עלים.png',
    alt: 'Environmental Impact',
    title: 'Environmental Impact',
    description:
      'Understanding your environmental impact is the first step toward change. ' +
      'EcoTrack brings together data from your daily habits to help you make ' +
      'more responsible and informed decisions.',
    items: [
      'Clear environmental impact overview',
      'Personal sustainability score',
      'Actionable insights for improvement',
    ],
  },
  {
    id: 'feature-water',
    reverse: false,
    image: '/images/מים.png',
    alt: 'Water Conservation',
    title: 'Smart Water Management',
    description:
      'Water consumption often goes unnoticed. EcoTrack helps you monitor ' +
      'your water usage over time, spot inefficiencies, and build more ' +
      'sustainable daily habits.',
    items: [
      'Track water usage trends',
      'Identify unusual consumption patterns',
      'Encourage responsible water use',
    ],
  },
  {
    id: 'feature-energy',
    reverse: true,
    image: '/images/חשמל.png',
    alt: 'Energy Management',
    title: 'Energy Efficiency',
    description:
      'Energy usage affects both your costs and the environment. ' +
      'EcoTrack helps you understand when and how energy is consumed, ' +
      'so you can reduce waste and improve efficiency.',
    items: [
      'Analyze peak energy usage',
      'Understand high-consumption behaviors',
      'Reduce emissions through smarter energy use',
    ],
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
          className={`${styles.featureSection} ${reverse ? styles.reverse : ''} ${visibleItems.has(id) ? styles.visible : ''
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