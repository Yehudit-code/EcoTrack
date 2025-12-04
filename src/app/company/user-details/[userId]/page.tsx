"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCompanyFilteredUserDetails } from "@/app/services/client/consumptionClient";
import styles from "./page.module.css";

export default function UserDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
  const { userId } = use(params);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [companyCategory, setCompanyCategory] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const stored = localStorage.getItem("currentUser");
        if (!stored) {
          router.push("/signIn");
          return;
        }

        const currentUser = JSON.parse(stored);

        const response = await fetchCompanyFilteredUserDetails(
          userId,
          currentUser.email
        );

        setUser(response.user);
        setCompanyCategory(response.companyCategory);
        setRecords(response.consumption || []);
      } catch (err) {
        console.error("Error loading details:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, router]);

  if (loading) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Details</h1>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Basic Information</h2>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          Consumption — {companyCategory}
        </h2>

        {records.length === 0 ? (
          <p>No data available for this category.</p>
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
