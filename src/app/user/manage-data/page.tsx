"use client";

import { useEffect, useState } from "react";
import styles from "./ManageData.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MonthYearPicker from "./MonthYearPicker";

import {
  fetchUserConsumptionByEmail,
  createConsumption,
  updateConsumption,
  ConsumptionCategory,
  ConsumptionHabitDto,
} from "@/app/services/client/consumptionClient";

type MainCategory =
  | "Electricity"
  | "Water"
  | "Gas"
  | "Transportation"
  | "Waste";

const MAIN_CATEGORIES: MainCategory[] = [
  "Electricity",
  "Water",
  "Gas",
  "Transportation",
  "Waste",
];

interface FormState {
  [key: string]: string;
}

interface IdState {
  [key: string]: string | undefined;
}

interface MessageState {
  [key: string]: string | null;
}

interface LoadingState {
  [key: string]: boolean;
}

export default function ManageDataPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormState>({
    Electricity: "",
    Water: "",
    Gas: "",
    Transportation: "",
    Waste: "",
  });

  const [docIds, setDocIds] = useState<IdState>({});
  const [messages, setMessages] = useState<MessageState>({});
  const [loading, setLoading] = useState<LoadingState>({});

  /* ------------------------------ */
  /* LOAD USER EMAIL                */
  /* ------------------------------ */
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    let email = null;

    if (stored) {
      try {
        email = JSON.parse(stored).email || null;
      } catch {}
    }

    if (email) {
      setUserEmail(email);
      loadExistingData(email, selectedMonth, selectedYear);
    } else {
      setMessages((prev) => ({
        ...prev,
        global: "User e-mail is missing.",
      }));
    }
  }, []);


  /* ------------------------------ */
  /* LOAD DATA FOR SELECTED MONTH   */
  /* ------------------------------ */
  async function loadExistingData(email: string, month: number, year: number) {
    try {
      const data = await fetchUserConsumptionByEmail(
        email,
        undefined,
        month,
        year
      );

      const newValues: FormState = {
        Electricity: "",
        Water: "",
        Gas: "",
        Transportation: "",
        Waste: "",
      };

      const newIds: IdState = {};

      (data || []).forEach((item) => {
        if (MAIN_CATEGORIES.includes(item.category as MainCategory)) {
          newValues[item.category] = item.value?.toString() ?? "";
          newIds[item.category] = item._id;
        }
      });

      setFormValues(newValues);
      setDocIds(newIds);
    } catch {
      setMessages((prev) => ({
        ...prev,
        global: "Failed to load data for this month.",
      }));
    }
  }

  /* ------------------------------ */
  /* INPUT HANDLING                 */
  /* ------------------------------ */
  function handleInputChange(category: MainCategory, value: string) {
    setFormValues((prev) => ({ ...prev, [category]: value }));
    setMessages((prev) => ({ ...prev, [category]: null }));
  }

  /* ------------------------------ */
  /* SAVE DATA PER CATEGORY         */
  /* ------------------------------ */
  async function handleSave(category: MainCategory) {
    if (!userEmail) {
      setMessages((prev) => ({
        ...prev,
        [category]: "User e-mail is missing.",
      }));
      return;
    }

    const numericValue = Number(formValues[category]);
    if (Number.isNaN(numericValue) || numericValue < 0) {
      setMessages((prev) => ({
        ...prev,
        [category]: "Please enter a valid number.",
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, [category]: true }));

    try {
      const base = {
        userEmail,
        category: category as ConsumptionCategory,
        value: numericValue,
        month: selectedMonth,
        year: selectedYear,
      };

      const existingId = docIds[category];
      let saved: ConsumptionHabitDto;

      if (existingId) {
        saved = await updateConsumption({ ...base, _id: existingId });
      } else {
        saved = await createConsumption(base);
      }

      setDocIds((prev) => ({ ...prev, [category]: saved._id }));

      setMessages((prev) => ({
        ...prev,
        [category]: "Saved!",
      }));
    } catch (err: any) {
      setMessages((prev) => ({
        ...prev,
        [category]: err.message || "Failed to save.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [category]: false }));
    }
  }

  /* ------------------------------ */
  /* CARD RENDER                    */
  /* ------------------------------ */
  function renderCard(
    category: MainCategory,
    title: string,
    unitLabel: string,
    placeholder: string
  ) {
    return (
      <div className={styles.dataCard}>
        <h3>{title}</h3>

        <p className={styles.cardDescription}>
          Enter your monthly {title.toLowerCase()} usage.
        </p>

        <div className={styles.inputGroup}>
          <label>{unitLabel}</label>
          <input
            type="number"
            value={formValues[category]}
            onChange={(e) => handleInputChange(category, e.target.value)}
            placeholder={placeholder}
          />
        </div>

        <button
          className={styles.saveBtn}
          onClick={() => handleSave(category)}
          disabled={loading[category]}
        >
          {loading[category] ? "Saving…" : "Save Data"}
        </button>

        {messages[category] && (
          <p className={styles.statusMessage}>{messages[category]}</p>
        )}
      </div>
    );
  }

  /* ------------------------------ */
  /* PAGE UI                        */
  /* ------------------------------ */
  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contentBox}>
          <h1 className={styles.title}>Manage Consumption Data</h1>

          {/* NEW MONTH-YEAR PICKER */}
          <MonthYearPicker
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
              if (userEmail) loadExistingData(userEmail, m, y);
            }}
          />

          {/* CARDS */}
          <section className={styles.dataSection}>
            {renderCard(
              "Electricity",
              "Electricity",
              "Monthly electricity (kWh):",
              "Enter kWh"
            )}
            {renderCard("Water", "Water", "Monthly water (m³):", "Enter m³")}
            {renderCard("Gas", "Gas", "Monthly gas (m³):", "Enter m³")}
            {renderCard(
              "Transportation",
              "Transportation",
              "Monthly distance (km):",
              "Enter km"
            )}
            {renderCard("Waste", "Waste", "Weekly waste (kg):", "Enter kg")}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
