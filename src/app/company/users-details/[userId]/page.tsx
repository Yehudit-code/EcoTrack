"use client";

import { useEffect, useState } from "react";
import styles from "./details.module.css";
import SimpleLineChart from "@/app/components/charts/SimpleLineChart"; // את אותו רכיב מה־Indicators

export default function UserDetailsPage({ params }: { params: { userId: string } }) {
  const { userId } = params;

  const [category, setCategory] = useState("Electricity"); // כאן בהמשך תקבלי מהחברה
  const [consumption, setConsumption] = useState([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // שליפת נתוני בסיס של המשתמש
  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      setUser(data.user);
    };
    loadUser();
  }, [userId]);

  // שליפת נתוני צריכה לפי קטגוריה
  useEffect(() => {
    const loadConsumption = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/company/user-consumption/${userId}?category=${category}`
        );
        const data = await res.json();
        if (data.success) {
          const mapped = data.data.map((d: any) => ({
            month: `${d.month}/${d.year}`,
            value: d.value,
          }));
          setConsumption(mapped);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    loadConsumption();
  }, [category, userId]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Details</h1>

      {user && (
        <div className={styles.userInfoBox}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Country:</strong> {user.country}</p>
        </div>
      )}

      <div className={styles.categorySelect}>
        <label>Select category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Water">Water</option>
          <option value="Electricity">Electricity</option>
          <option value="Gas">Gas</option>
          <option value="Transportation">Transportation</option>
          <option value="Waste">Waste</option>
        </select>
      </div>

      <div className={styles.chartCard}>
        {loading ? (
          <div>Loading chart...</div>
        ) : (
          <SimpleLineChart
            data={consumption}
            color="#3b6e3b"
          />
        )}
      </div>

      <button
        className={styles.createOfferBtn}
        onClick={() => (window.location.href = `/company/create-offer/${userId}`)}
      >
        צור הצעת תשלום
      </button>
    </div>
  );
}
