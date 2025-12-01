"use client";
import { useEffect, useState } from "react";
import styles from "./Pay.module.css";
import { useRouter } from "next/navigation";

export default function PayPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState({
    number: "",
    exp: "",
    cvv: "",
  });
  const [error, setError] = useState(false);

  // Load payment info
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/payments/${params.id}`);
      const data = await res.json();
      setPayment(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handlePayment() {
    if (!cardData.number || !cardData.exp || !cardData.cvv) {
      showError();
      return;
    }

    const res = await fetch("/api/payments/confirm", {
      method: "POST",
      body: JSON.stringify({ paymentId: params.id, success: true }),
    });

    if (res.ok) {
      router.push("/pay/success");
    } else {
      showError();
      reloadPayment();
    }
  }

  function showError() {
    setError(true);
    setTimeout(() => setError(false), 2500);
  }

  async function reloadPayment() {
    const res = await fetch(`/api/payments/${params.id}`);
    const data = await res.json();
    setPayment(data);
  }

  if (loading || !payment) return <div className={styles.wrapper}>טוען...</div>;

  return (
    <div className={styles.wrapper}>
      {/* Error popup */}
      <div className={`${styles.errorPopup} ${error ? styles.show : ""}`}>
        התשלום נכשל — אנא בדקי את הפרטים ונסי שוב
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>תשלום עבור רכישה</h1>

        {/* חברה */}
        <div className={styles.section}>
          <div className={styles.label}>שם החברה:</div>
          <div className={styles.value}>{payment.companyId?.name}</div>
        </div>

        {/* מוצר & סכום */}
        <div className={styles.section}>
          <div className={styles.label}>מוצר:</div>
          <div className={styles.value}>{payment.requestId?.productName}</div>

          <div className={styles.label} style={{ marginTop: "10px" }}>
            סכום לתשלום:
          </div>
          <div className={styles.value}>{payment.amount} ₪</div>
        </div>

        {/* טופס אשראי */}
        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>מספר כרטיס</label>
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
              <label className={styles.label}>תוקף</label>
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
          שלם עכשיו
        </button>
      </div>
    </div>
  );
}
