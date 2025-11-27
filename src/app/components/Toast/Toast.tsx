"use client";

import styles from "./Toast.module.css";

export default function Toast({ text }: { text: string }) {
  return <div className={styles.toast}>{text}</div>;
}
