"use client";

import styles from "./Modal.module.css";

const categories = [
  "electricity",
  "water",
  "transport",
  "recycling",
  "solar",
];

export default function CompanyCategoryModal({
  onSelect,
}: {
  onSelect: (category: string) => void;
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3>Select your company category</h3>

        <div className={styles.categories}>
          {categories.map((cat) => (
            <button key={cat} className={styles.catBtn} onClick={() => onSelect(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
