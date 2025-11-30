"use client";

import styles from "./Modal.module.css";

export default function RoleModal({ onSelect }: { onSelect: (role: "user" | "company") => void }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3>What type of user are you?</h3>

        <div className={styles.btnRow}>
          <button className={styles.modalBtn} onClick={() => onSelect("user")}>Regular User</button>
          <button className={styles.modalBtn} onClick={() => onSelect("company")}>Company</button>
        </div>
      </div>
    </div>
  );
}
