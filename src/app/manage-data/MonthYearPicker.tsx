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
    "January","February","March","April",
    "May","June","July","August",
    "September","October","November","December",
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
        📅 {months[selectedMonth - 1]} {selectedYear}
      </button>

      {open && (
        <div className={styles.pickerPopup}>
          <div className={styles.yearRow}>
            <button onClick={() => changeYear(-1)}>‹</button>
            <span>{selectedYear}</span>
            <button onClick={() => changeYear(1)}>›</button>
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
