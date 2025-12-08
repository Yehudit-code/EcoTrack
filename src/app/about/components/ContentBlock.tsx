'use client';

import styles from '../page.module.css';

interface Props {
  title: string;
  text: string;
}

/* Reusable block for a section of text */
export default function ContentBlock({ title, text }: Props) {
  return (
    <div className={styles.textBlock}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.paragraph}>{text}</p>
    </div>
  );
}
