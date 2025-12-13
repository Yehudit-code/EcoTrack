"use client";

import { use, useEffect, useState } from "react";
import styles from "./Pay.module.css";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

interface PaymentDto {
  _id: string;
  amount: number;
  status: string;
  productName: string;
  companyName: string;
  userName: string;
  userEmail: string;
  userId: string;
  fullUser?: any;
}

export default function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const setUser = useUserStore((s) => s.setUser);

  const [payment, setPayment] = useState<PaymentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState({
    number: "",
    exp: "",
    cvv: "",
  });
  const [error, setError] = useState(false);

  // Load payment details
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/payments/${id}`);
      const data: PaymentDto = await res.json();

      // Optional: hydrate Zustand user if backend returned full user
      if (data.fullUser) {
        setUser(data.fullUser);
      }

      setPayment(data);

      if (data.status === "paid") {
        router.push(`/pay/success?userId=${data.userId}`);
        return;
      }

      setLoading(false);
    }

    load();
  }, [id, router, setUser]);

  function isValidCardNumber(num: string) {
    return /^\d{16}$/.test(num.replace(/\s+/g, ""));
  }

  function isValidExp(exp: string) {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
    const [mm, yy] = exp.split("/").map(Number);
    if (mm < 1 || mm > 12) return false;

    const now = new Date();
    const expDate = new Date(2000 + yy, mm);
    return expDate > now;
  }

  function isValidCVV(cvv: string) {
    return /^\d{3}$/.test(cvv);
  }

  async function handlePayment() {
    if (
      !isValidCardNumber(cardData.number) ||
      !isValidExp(cardData.exp) ||
      !isValidCVV(cardData.cvv)
    ) {
      showError();
      return;
    }

    const res = await fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: id }),
    });

    if (res.ok) {
      router.push(`/pay/success?userId=${payment!.userId}`);
    } else {
      showError();
    }
  }

  function showError() {
    setError(true);
    setTimeout(() => setError(false), 2500);
  }

  if (loading || !payment) {
    return <div className={styles.wrapper}>Loading...</div>;
  }

  const amount = payment.amount;
  const commission = amount * 0.1;
  const companyGets = amount - commission;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.errorPopup} ${error ? styles.show : ""}`}>
        Invalid credit card details — please check and try again
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>Complete Your Payment</h1>

        <div className={styles.section}>
          <div className={styles.label}>Customer:</div>
          <div className={styles.value}>{payment.userName}</div>

          <div className={styles.label}>Email:</div>
          <div className={styles.value}>{payment.userEmail}</div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Product:</div>
          <div className={styles.value}>{payment.productName}</div>

          <div className={styles.label}>Amount:</div>
          <div className={styles.value}>{amount} ₪</div>

          <div className={styles.subValue}>EcoTrack fee: 10%</div>
          <div className={styles.subValue}>
            Company receives: {companyGets} ₪
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Company:</div>
          <div className={styles.value}>{payment.companyName}</div>
        </div>

        <div className={styles.form}>
          <input
            className={styles.input}
            placeholder="Card Number"
            value={cardData.number}
            onChange={(e) =>
              setCardData({ ...cardData, number: e.target.value })
            }
          />

          <div className={styles.row}>
            <input
              className={styles.input}
              placeholder="MM/YY"
              value={cardData.exp}
              onChange={(e) =>
                setCardData({ ...cardData, exp: e.target.value })
              }
            />
            <input
              className={styles.input}
              placeholder="CVV"
              value={cardData.cvv}
              onChange={(e) =>
                setCardData({ ...cardData, cvv: e.target.value })
              }
            />
          </div>
        </div>

        <button className={styles.btnPay} onClick={handlePayment}>
          Pay Now
        </button>
      </div>
    </div>
  );
}
