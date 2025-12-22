"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./NotificationMenu.module.css";
import { useUserStore } from "@/store/useUserStore";
import LeafSpinner from "../Loading/LeafSpinner";

type RequestItem = {
  _id: string;
  productName: string;
  price: number;
  status: string;
  paymentId: string;
  companyName?: string;
};

export default function NotificationMenu({ open }: { open: boolean }) {
  const user = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasHydrated || !user?._id) return;

    setLoading(true);

    fetch(`/api/company-requests?userId=${user._id}`)
      .then((res) => res.json())
      .then((data: RequestItem[]) => {
        const pending = Array.isArray(data)
          ? data.filter((req) => req.status !== "paid")
          : [];
        setItems(pending);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [hasHydrated, user?._id]);

  return (
    <div className={`${styles.menu} ${open ? styles.open : ""}`}>
      <h4 className={styles.title}>Pending Offers</h4>

      {loading && <LeafSpinner />}

      {!loading && items.length === 0 && (
        <p className={styles.empty}>No pending offers</p>
      )}

      <div className={styles.list}>
        {items.map((item) => (
          <div key={item._id} className={styles.card}>
            <div className={styles.info}>
              <div className={styles.productName}>{item.productName}</div>
              {item.companyName && (
                <div className={styles.company}>{item.companyName}</div>
              )}
            </div>

            <div className={styles.bottomRow}>
              <span className={styles.price}>{item.price}₪</span>
              <Link
                href={`/pay/${item.paymentId}`}
                className={styles.payButton}
              >
                Pay
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}