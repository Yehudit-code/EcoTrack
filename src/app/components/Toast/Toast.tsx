"use client";

import styles from "./Toast.module.css";

export default function Toast({
  text,
  type = "success",
}: {
  text: string;
  type?: "success" | "error";
}) {
  return (
    <div
      className={`${styles.toast} ${
        type === "error" ? styles.error : styles.success
      }`}
    >
      {text}
    </div>
  );
}
