"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./ManageData.module.css";

export default function MonthYearPicker({
  selectedMonth,
  selectedYear,
  onChange,
}: {
  selectedMonth: number;
  selectedYear: number;
  onChange: (month: number, year: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function changeYear(offset: number) {
    onChange(selectedMonth, selectedYear + offset);
  }

  return (
    <div className={styles.pickerContainer} ref={containerRef}>
      <button
        className={styles.pickerButton}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {months[selectedMonth - 1]} {selectedYear}
      </button>

      {open && (
        <div className={styles.pickerPopup}>
          <div className={styles.yearRow}>
            <button onClick={() => changeYear(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span>{selectedYear}</span>
            <button onClick={() => changeYear(1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className={styles.monthGrid}>
            {months.map((m, i) => (
              <button
                key={i}
                className={`${styles.monthItem} ${
                  selectedMonth === i + 1 ? styles.activeMonth : ""
                }`}
                onClick={() => {
                  onChange(i + 1, selectedYear);
                  setOpen(false);
                }}
              >
                {m.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}