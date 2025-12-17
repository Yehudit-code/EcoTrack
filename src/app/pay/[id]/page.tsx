"use client";

import { use, useEffect, useState } from "react";
import styles from "./Pay.module.css";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore"; // ← הוספנו

interface PaymentDto {
  _id: string;
  amount: number;
  status: string;
  productName: string;
  companyName: string;
  userName: string;
  userEmail: string;
  userId: string;
}

export default function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const setUser = useUserStore((s) => s.setUser); // ← Zustand setter

  const [payment, setPayment] = useState<PaymentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState({
    number: "",
    exp: "",
    cvv: "",
  });
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/payments/${id}`);
      const data = await res.json();

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
    const digits = num.replace(/\s+/g, "");
    return /^\d{16}$/.test(digits);
  }

  function isValidExp(exp: string) {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;

    const [mm, yy] = exp.split("/").map((v) => parseInt(v, 10));
    if (mm < 1 || mm > 12) return false;

    const now = new Date();
    const year = 2000 + yy;
    const expDate = new Date(year, mm);

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

  const amount = payment.amount || 0;
  const commission = amount * 0.1;
  const companyGets = amount - commission;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.errorPopup} ${error ? styles.show : ""}`}>
        Invalid credit card details — please check and try again
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>Complete Your Payment</h1>

        {/* User Info */}
        <div className={styles.section}>
          <div className={styles.label}>Customer:</div>
          <div className={styles.value}>{payment.userName}</div>

          <div className={styles.label} style={{ marginTop: "6px" }}>
            Email:
          </div>
          <div className={styles.value}>{payment.userEmail}</div>
        </div>

        {/* Product */}
        <div className={styles.section}>
          <div className={styles.label}>Product:</div>
          <div className={styles.value}>{payment.productName}</div>

          <div className={styles.label} style={{ marginTop: "10px" }}>
            Amount:
          </div>
          <div className={styles.value}>{amount} ₪</div>

          <div className={styles.subValue}>EcoTrack fee: 10%</div>
          <div className={styles.subValue}>
            Company receives: {companyGets} ₪
          </div>
        </div>

        {/* Company */}
        <div className={styles.section}>
          <div className={styles.label}>Company:</div>
          <div className={styles.value}>{payment.companyName}</div>
        </div>

        {/* Payment form */}
        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Card Number</label>
            <input
              className={styles.input}
              placeholder="xxxx xxxx xxxx xxxx"
              maxLength={19}
              value={cardData.number}
              onChange={(e) =>
                setCardData({ ...cardData, number: e.target.value })
              }
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Expiry</label>
              <input
                className={styles.input}
                placeholder="MM/YY"
                maxLength={5}
                value={cardData.exp}
                onChange={(e) =>
                  setCardData({ ...cardData, exp: e.target.value })
                }
              />
            </div>

            <div className={styles.inputGroup} style={{ width: "100px" }}>
              <label className={styles.label}>CVV</label>
              <input
                className={styles.input}
                placeholder="123"
                maxLength={3}
                value={cardData.cvv}
                onChange={(e) =>
                  setCardData({ ...cardData, cvv: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <button className={styles.btnPay} onClick={handlePayment}>
          Pay Now
        </button>
      </div>
    </div>
  );
}
