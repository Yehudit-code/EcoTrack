"use client";
import styles from "./Success.module.css";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Payment completed successfully</h1>

        <p className={styles.text}>
          Thank you for making your payment through EcoTrack.
          <br />
          The company will contact you soon to continue the process.
        </p>

        <button
          className={styles.button}
          onClick={() => router.push("/profile")}
        >
          Back to my profile
        </button>
      </div>
    </div>
  );
}
