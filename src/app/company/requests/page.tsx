"use client";

import { useEffect, useState } from "react";
import styles from "./Requests.module.css";
import { useUserStore } from "@/store/useUserStore";
import { fetchCompanyRequests } from "@/app/services/client/company/companyRequestsService";
import type { CompanyRequestItem } from "@/app/types/companyRequests";

export default function CompanyRequestsPage() {
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state._hasHydrated);

  const [requests, setRequests] = useState<CompanyRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guard: wait for hydration and valid company user
    if (!hasHydrated) return;

    if (!user || user.role !== "company") {
      setLoading(false);
      return;
    }

    const loadRequests = async () => {
      try {
        const data = await fetchCompanyRequests(user._id);
        setRequests(data);
      } catch (err) {
        setError("Failed to load payment requests");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [hasHydrated, user]);

  if (loading) {
    return <div className={styles.page}>Loading requests...</div>;
  }

  if (error) {
    return <div className={styles.page}>{error}</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Payment offers sent</h1>

      {requests.length === 0 ? (
        <div className={styles.empty}>
          You haven&apos;t sent any payment offers yet.
        </div>
      ) : (
        <div className={styles.list}>
          {requests.map((req) => (
            <div key={req._id} className={styles.card}>
              <InfoRow label="Product" value={req.productName} />
              <InfoRow label="Price" value={`${req.price} ₪`} />
              <InfoRow
                label="User"
                value={
                  req.userData?.name ||
                  req.userData?.email ||
                  req.userId
                }
              />
              <StatusRow status={req.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

function StatusRow({
  status,
}: {
  status: "sent" | "paid" | "declined";
}) {
  const statusClass =
    status === "sent"
      ? styles.statusPending
      : status === "paid"
      ? styles.statusSuccess
      : styles.statusDeclined;

  const statusText =
    status === "sent"
      ? "Pending payment"
      : status === "paid"
      ? "Paid"
      : "Declined";

  return (
    <div className={styles.statusRow}>
      <span className={styles.label}>Status</span>
      <span className={`${styles.status} ${statusClass}`}>
        {statusText}
      </span>
    </div>
  );
}
