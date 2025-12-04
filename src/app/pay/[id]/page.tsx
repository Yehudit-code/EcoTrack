"use client";

import { use, useEffect, useState } from "react";
import styles from "./Pay.module.css";
import { useRouter } from "next/navigation";

interface PaymentDto {
  _id: string;
  amount: number;
  ecoTrackFee?: number;
  companyRevenue?: number;
  status: string;
  productName?: string;
  companyName?: string;
}

export default function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 👇 שימוש נכון ב-use כדי לפתור את ה"שגיאת Promise"
  const { id } = use(params);

  const router = useRouter();

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
      setPayment(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handlePayment() {
    if (!cardData.number || !cardData.exp || !cardData.cvv) {
      showError();
      return;
    }

    const res = await fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: id }),
    });

    if (res.ok) {
      router.push("/pay/success");
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

  const productName = payment.productName || "Unknown";
  const companyName = payment.companyName || "Unknown company";

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.errorPopup} ${error ? styles.show : ""}`}>
        Payment failed — please check details and try again
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>Complete Your Payment</h1>

        <div className={styles.section}>
          <div className={styles.label}>Company:</div>
          <div className={styles.value}>{companyName}</div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Product:</div>
          <div className={styles.value}>{productName}</div>

          <div className={styles.label} style={{ marginTop: "10px" }}>
            Amount:
          </div>
          <div className={styles.value}>{amount} ₪</div>

          <div className={styles.subValue}>EcoTrack fee: 10%</div>
          <div className={styles.subValue}>
            Company receives: {companyGets} ₪
          </div>
        </div>

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
