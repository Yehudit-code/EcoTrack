"use client";
import styles from "./SkeletonPost.module.css";

export default function SkeletonPost() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}></div>
        <div className={styles.meta}>
          <div className={styles.lineShort}></div>
          <div className={styles.lineLong}></div>
        </div>
      </div>

      <div className={styles.textLine}></div>
      <div className={styles.textLine}></div>

      <div className={styles.image}></div>

      <div className={styles.footer}>
        <div className={styles.footerBtn}></div>
        <div className={styles.footerBtn}></div>
        <div className={styles.footerBtn}></div>
      </div>
    </div>
  );
}
