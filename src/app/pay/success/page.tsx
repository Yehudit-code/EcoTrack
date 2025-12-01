"use client";
import styles from "./Success.module.css";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>התשלום בוצע בהצלחה</h1>

        <p className={styles.text}>
          תודה שבחרת לבצע את התשלום דרך EcoTrack.
          <br />
          החברה תיצור איתך קשר בהקדם להמשך תהליך הטיפול.
        </p>

        <button
          className={styles.button}
          onClick={() => router.push("/profile")}
        >
          חזרה לאזור האישי
        </button>
      </div>
    </div>
  );
}
