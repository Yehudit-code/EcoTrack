"use client";
import styles from "./SkeletonSaver.module.css";

export default function SkeletonSaver() {
  return (
    <div className={styles.row}>
      <div className={styles.avatar}></div>

      <div className={styles.textArea}>
        <div className={styles.nameLine}></div>
        <div className={styles.savingLine}></div>
      </div>
    </div>
  );
}
