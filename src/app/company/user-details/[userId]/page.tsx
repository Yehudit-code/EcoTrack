"use client";

import { use, useEffect, useState } from "react";
import styles from "./page.module.css";
import { fetchCompanyFilteredUserDetails } from "@/app/services/client/consumptionClient";

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // Next.js 16 — params is a Promise
  const { userId } = use(params);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [category, setCategory] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
  async function load() {
    try {
      const response = await fetchCompanyFilteredUserDetails(userId);

      // כאן אין success → פשוט מקבלים את התוצאה
      setUser(response.user);
      setCategory(response.companyCategory);
      setRecords(response.consumption);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  }

  load();
}, [userId]);
  // =========== UI Rendering ===========

  if (loading) return <div className={styles.container}>Loading...</div>;

  if (error)
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Error</h1>
        <p>{error}</p>
      </div>
    );

  if (!user)
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>User not found</h1>
      </div>
    );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Details</h1>

      {/* User Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Basic Information</h2>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Country:</strong> {user.country || "N/A"}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Consumption Table */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          Consumption — {category || "Unknown"}
        </h2>

        {records.length === 0 ? (
          <p>No data available for this user in this category.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Month</th>
                <th className={styles.th}>Year</th>
                <th className={styles.th}>Value</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, index) => (
                <tr key={index}>
                  <td className={styles.td}>{rec.month}</td>
                  <td className={styles.td}>{rec.year}</td>
                  <td className={styles.td}>{rec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.btnContainer}>
        <button className={styles.button}>Create Payment Offer</button>
      </div>
    </div>
  );
}
