"use client";

import { useEffect, useState } from "react";
import styles from "./ManageData.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MonthYearPicker from "./MonthYearPicker";
import { useUserStore } from "@/store/useUserStore";

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

  const user = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

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

  /* ------------------------------
     Load data after hydration
  ------------------------------ */
  useEffect(() => {
    if (!hasHydrated) return;

    if (!user?.email) {
      setMessages({ global: "User e-mail is missing." });
      return;
    }

    loadExistingData(user.email, selectedMonth, selectedYear);
  }, [hasHydrated, user, selectedMonth, selectedYear]);

  async function loadExistingData(
    email: string,
    month: number,
    year: number
  ) {
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
      setMessages({ global: "Failed to load data for this month." });
    }
  }

  function handleInputChange(category: MainCategory, value: string) {
    setFormValues((prev) => ({ ...prev, [category]: value }));
    setMessages((prev) => ({ ...prev, [category]: null }));
  }

  async function handleSave(category: MainCategory) {
    if (!user?.email) {
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
        userEmail: user.email,
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
      setMessages((prev) => ({ ...prev, [category]: "Saved." }));
    } catch (err: any) {
      setMessages((prev) => ({
        ...prev,
        [category]: err.message || "Failed to save.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [category]: false }));
    }
  }

  function renderCard(
    category: MainCategory,
    title: string,
    unitLabel: string,
    placeholder: string
  ) {
    return (
      <div className={styles.dataCard}>
        <h3>{title}</h3>

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
          {loading[category] ? "Saving..." : "Save Data"}
        </button>

        {messages[category] && (
          <p className={styles.statusMessage}>{messages[category]}</p>
        )}
      </div>
    );
  }

  if (!hasHydrated) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contentBox}>

          <h1 className={styles.title}>Manage Consumption Data</h1>

          <MonthYearPicker
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />

          {messages.global && (
            <p className={styles.globalMessage}>{messages.global}</p>
          )}

          <section className={styles.dataSection}>
            {renderCard("Electricity", "Electricity", "kWh", "Enter kWh")}
            {renderCard("Water", "Water", "m³", "Enter m³")}
            {renderCard("Gas", "Gas", "m³", "Enter m³")}
            {renderCard("Transportation", "Transportation", "km", "Enter km")}
            {renderCard("Waste", "Waste", "kg", "Enter kg")}
          </section>

        </div>
      </main>


      <Footer />
    </div>
  );
}
