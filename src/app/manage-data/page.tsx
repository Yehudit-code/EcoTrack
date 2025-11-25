"use client";

import { useEffect, useState } from "react";
import styles from "./ManageData.module.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

import {
  fetchUserConsumptionByEmail,
  createConsumption,
  updateConsumption,
  ConsumptionHabitDto,
  ConsumptionCategory,
} from "@/app/services/client/consumptionClient";

// ⭐ עכשיו כולל Gas
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

  // --------------------------
  // LOAD USER EMAIL FROM LOCALSTORAGE
  // --------------------------
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    let emailFromStorage = null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        emailFromStorage = parsed.email || null;
      } catch {
        console.error("Failed to parse currentUser");
      }
    }

    if (emailFromStorage) {
      setUserEmail(emailFromStorage);
      loadExistingData(emailFromStorage);
    } else {
      setMessages((prev) => ({
        ...prev,
        global: "User e-mail is missing. Please sign in again.",
      }));
    }
  }, []);

  // --------------------------
  // LOAD EXISTING DATA
  // --------------------------
  async function loadExistingData(email: string) {
    try {
      const data = await fetchUserConsumptionByEmail(email);

      const newValues = { ...formValues };
      const newIds = { ...docIds };

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
        global: "Failed to load existing data.",
      }));
    }
  }

  // --------------------------
  // INPUT CHANGE
  // --------------------------
  function handleInputChange(category: MainCategory, value: string) {
    setFormValues((prev) => ({ ...prev, [category]: value }));
    setMessages((prev) => ({ ...prev, [category]: null }));
  }

  // --------------------------
  // SAVE BUTTON (One category each)
  // --------------------------
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
      const baseInput = {
        userEmail,
        category: category as ConsumptionCategory,
        value: numericValue,
      };

      const existingId = docIds[category];
      let saved: ConsumptionHabitDto;

      if (existingId) {
        saved = await updateConsumption({ ...baseInput, _id: existingId });
      } else {
        saved = await createConsumption(baseInput);
      }

      setDocIds((prev) => ({ ...prev, [category]: saved._id }));
      setMessages((prev) => ({ ...prev, [category]: "Saved successfully!" }));
    } catch (err: any) {
      setMessages((prev) => ({
        ...prev,
        [category]: err.message || "Failed to save.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [category]: false }));
    }
  }

  // --------------------------
  // RENDER CARD UI
  // --------------------------
  function renderCard(
    category: MainCategory,
    title: string,
    unit: string,
    placeholder: string
  ) {
    return (
      <div className={styles.dataCard}>
        <h3>{title}</h3>
        <p className={styles.cardDescription}>
          Enter your monthly {title.toLowerCase()} usage.
        </p>

        <div className={styles.inputGroup}>
          <label htmlFor={category}>{unit}</label>
          <input
            id={category}
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

  // --------------------------
  // PAGE UI
  // --------------------------
  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contentBox}>
          <h1 className={styles.title}>Manage Consumption Data</h1>

          <section className={styles.dataSection}>
            {renderCard(
              "Electricity",
              "Electricity",
              "Monthly electricity (kWh):",
              "Enter kWh"
            )}
            {renderCard(
              "Water",
              "Water",
              "Monthly water (m³):",
              "Enter m³"
            )}
            {renderCard("Gas", "Gas", "Monthly gas (m³):", "Enter m³")}
            {renderCard(
              "Transportation",
              "Transportation",
              "Monthly distance (km):",
              "Enter km"
            )}
            {renderCard(
              "Waste",
              "Waste",
              "Weekly waste (kg):",
              "Enter kg"
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
