"use client";

import { useEffect, useState, use } from "react";
import styles from "./CreateRequest.module.css";
import { useRouter } from "next/navigation";

export default function CreateRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  // חובה! פותח את ה-Promise של params
  const { id } = use(params);

  const [user, setUser] = useState<any>(null);
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      console.log("FETCHING USER:", `/api/users/${id}`);

      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();

      console.log("USER RESPONSE:", data);

      setUser(data);
      setLoading(false);
    }

    loadUser();
  }, [id]);

  async function handleSend() {
    if (!product || !price) return alert("נא למלא את כל השדות");

    await fetch("/api/company-requests", {
      method: "POST",
      body: JSON.stringify({
        userId: id,
        companyId: "123",
        productName: product,
        price: Number(price),
      }),
    });

    alert("הצעת התשלום נשלחה!");
    router.push("/company/requests");
  }

  if (loading) return <div>טוען...</div>;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>יצירת הצעת תשלום</h1>

      <div className={styles.card}>
        <div className={styles.label}>שם משתמש:</div>
        <div className={styles.value}>{user?.name || "לא נמצא"}</div>

        <div className={styles.inputGroup}>
          <label>שם מוצר</label>
          <input value={product} onChange={(e) => setProduct(e.target.value)} />
        </div>

        <div className={styles.inputGroup}>
          <label>מחיר (ב₪)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>

        <button className={styles.btn} onClick={handleSend}>שליחת הצעה</button>
      </div>
    </div>
  );
}
