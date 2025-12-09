"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./NotificationMenu.module.css";

type RequestItem = {
    _id: string;
    productName: string;
    price: number;
    status: string;
    paymentId: string;
    companyName?: string;
};

export default function NotificationMenu({ open }: { open: boolean }) {
    const [isClient, setIsClient] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [items, setItems] = useState<RequestItem[]>([]);

    // -------------------------
    // Mark component as client-side
    // -------------------------
    useEffect(() => {
        setIsClient(true);
    }, []);

    // -------------------------
    // Load userId (runs only after isClient = true)
    // -------------------------
    useEffect(() => {
        if (!isClient) return;

        const userStr = localStorage.getItem("currentUser");
        if (!userStr) return;

        try {
            const user = JSON.parse(userStr);
            setUserId(user._id);
        } catch { }
    }, [isClient]);

    // -------------------------
    // Load pending offers
    // -------------------------
    useEffect(() => {
        if (!userId) return;

        fetch(`/api/company-requests?userId=${userId}`)
            .then((res) => res.json())
            .then((data) => {
                const pending = data.filter(
                    (i: RequestItem) => i.status !== "paid"
                );
                setItems(pending);
            })
            .catch(() => setItems([]));
    }, [userId]);

    // -------------------------
    // Render safely
    // -------------------------
    if (!isClient) {
        return (
            <div
                className={`${styles.menu} ${open ? styles.open : ""}`}
            >
                <p className={styles.empty}>Loading…</p>
            </div>
        );
    }

    return (
        <div className={`${styles.menu} ${open ? styles.open : ""}`}>
            <h4 className={styles.title}>Pending Offers</h4>

            {items.length === 0 && (
                <p className={styles.empty}>No pending offers</p>
            )}

            <div className={styles.list}>
                {items.map((item) => (
                    <div key={item._id} className={styles.card}>
                        <div className={styles.info}>
                            <div className={styles.productName}>{item.productName}</div>
                            {item.companyName && (
                                <div className={styles.company}>
                                    {item.companyName}
                                </div>
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
