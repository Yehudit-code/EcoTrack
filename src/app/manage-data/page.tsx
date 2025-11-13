"use client";
import { useState } from "react";
import styles from "./ManageData.module.css";

export default function ManageData() {
  const [month, setMonth] = useState("");
  const [formData, setFormData] = useState({
    electricity: "",
    water: "",
    transport: "",
    waste: "",
  });
  const [message, setMessage] = useState("");

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save or update consumption data
  const handleSave = async () => {
    if (!month) return setMessage("Please select a month.");
    const [year, monthNum] = month.split("-").map(Number);
    const userId = "67654abc1234"; // temporary placeholder

    try {
      const categories = [
        { name: "Electricity", key: "electricity" },
        { name: "Water", key: "water" },
        { name: "Transportation", key: "transport" },
        { name: "Waste", key: "waste" },
      ];

      // Loop through categories and send API requests
      for (const cat of categories) {
        const payload = {
          userId,
          category: cat.name,
          value: Number((formData as any)[cat.key]),
          month: monthNum,
          year,
        };

        const res = await fetch("/api/consumption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // If already exists, update instead
        if (res.status !== 201) {
          const getRes = await fetch(`/api/consumption?userId=${userId}&category=${cat.name}`);
          const items = await getRes.json();
          const existing = items.find((i: any) => i.month === monthNum && i.year === year);
          if (existing?._id) {
            await fetch("/api/consumption", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ _id: existing._id, ...payload }),
            });
          }
        }
      }

      setMessage("Data saved successfully!");
    } catch (err) {
      setMessage("Error saving data.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>EcoTrack | Manage Data</header>

      <section className={styles.card}>
        <h2 className={styles.title}>Enter Monthly Consumption Data</h2>

        <div className={styles.monthSelector}>
          <label htmlFor="month">Month:</label>
          <input type="month" id="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>

        <div className={styles.formGrid}>
          <input name="electricity" type="number" placeholder="Electricity (kWh)" value={formData.electricity} onChange={handleChange} />
          <input name="water" type="number" placeholder="Water (Liters)" value={formData.water} onChange={handleChange} />
          <input name="transport" type="number" placeholder="Transportation (KM)" value={formData.transport} onChange={handleChange} />
          <input name="waste" type="number" placeholder="Waste (KG)" value={formData.waste} onChange={handleChange} />
        </div>

        <div className={styles.buttons}>
          <button onClick={handleSave} className={styles.saveBtn}>Save / Update</button>
        </div>

        {message && <p className={styles.message}>{message}</p>}
      </section>

      <footer className={styles.footer}>
        Home | Manage Data | Indicators | Social Sharing | About
      </footer>
    </div>
  );
}