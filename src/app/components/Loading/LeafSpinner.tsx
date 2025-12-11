"use client";
import styles from "./LeafSpinner.module.css";

export default function LeafSpinner() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.leaf}></div>
    </div>
  );
}
