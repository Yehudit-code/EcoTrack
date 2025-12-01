"use client";
import { useEffect, useState } from "react";
import styles from "./CreateRequest.module.css";
import { useRouter } from "next/navigation";

export default function CreateRequestPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null);
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const res = await fetch(`/api/users/${params.id}`);
      const data = await res.json();
      setUser(data);
      setLoading(false);
    }
    loadUser();
  }, [params.id]);

  async function handleSend() {
    if (!product || !price) return alert("נא למלא את כל השדות");

    const res = await fetch("/api/company-requests", {
      method: "POST",
      body: JSON.stringify({
        userId: params.id,
        companyId: "123", // מהלוגין של החברה
        productName: product,
        price: Number(price),
      }),
    });

    const data = await res.json();

    if (data?.success) {
      // שולחים מייל
      await fetch("/api/send-email", {
        method: "POST",
        body: JSON.stringify({
          to: user.email,
          subject: "הצעת תשלום חדשה מאת EcoTrack",
          html: `
            <h2>שלום ${user.name}</h2>
            <p>קיבלת הצעת תשלום עבור: <b>${product}</b></p>
            <p>סכום: ${price} ₪</p>
            <a href="https://your-site.com/pay/${data.paymentId}">
              לחץ כאן לתשלום
            </a>
          `,
        }),
      });

      router.push("/company/requests/sent");
    }
  }

  if (loading) return <div>טוען...</div>;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>יצירת הצעת תשלום</h1>

      <div className={styles.box}>
        <div className={styles.label}>שם משתמש:</div>
        <div className={styles.value}>{user.name}</div>

        <div className={styles.inputGroup}>
          <label>שם מוצר</label>
          <input value={product} onChange={e => setProduct(e.target.value)} />
        </div>

        <div className={styles.inputGroup}>
          <label>מחיר</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} />
        </div>

        <button className={styles.btnSend} onClick={handleSend}>
          שליחת הצעה
        </button>
      </div>
    </div>
  );
}
