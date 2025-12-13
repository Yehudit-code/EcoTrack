"use client";

import { useEffect, useState } from "react";
import styles from "./Requests.module.css";
import { useUserStore } from "@/store/useUserStore";

interface CompanyRequestItem {
  _id: string;
  productName: string;
  price: number;
  status: "sent" | "paid" | "declined";
  userId: string;
  userData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function CompanyRequestsPage() {
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state._hasHydrated);

  const [requests, setRequests] = useState<CompanyRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated || !user || user.role !== "company") {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(
          `/api/company-requests?companyId=${user._id}`
        );
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, hasHydrated]);

  if (loading) {
    return <div className={styles.page}>Loading requests...</div>;
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
              <div className={styles.row}>
                <span className={styles.label}>Product</span>
                <span className={styles.value}>{req.productName}</span>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>Price</span>
                <span className={styles.value}>{req.price} ₪</span>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>User</span>
                <span className={styles.value}>
                  {req.userData?.name ||
                    req.userData?.email ||
                    req.userId}
                </span>
              </div>

              <div className={styles.statusRow}>
                <span className={styles.label}>Status</span>
                <span
                  className={`${styles.status} ${
                    req.status === "sent"
                      ? styles.statusPending
                      : req.status === "paid"
                      ? styles.statusSuccess
                      : styles.statusDeclined
                  }`}
                >
                  {req.status === "sent" && "Pending payment"}
                  {req.status === "paid" && "Paid"}
                  {req.status === "declined" && "Declined"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
