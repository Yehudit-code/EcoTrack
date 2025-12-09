"use client";

import styles from "../page.module.css";
import ConsumptionGraph from "@/app/components/ConsumptionGraph";
import { useRouter } from "next/navigation";

export default function UserCard({ user, onToggleTalk }: any) {
  const router = useRouter();

  const goToUserDetails = () => {
    router.push(`/company/user-details/${user._id}`);
  };

  return (
    <div className={styles.card}>
      {/* Clicking the header now navigates to user details page */}
      <div className={styles.userHeader} onClick={goToUserDetails}>
        <img
          src={user.photo || "/default-user.png"}
          alt={user.name}
          className={styles.avatar}
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.src.includes("default-user.png")) {
              img.src = "/default-user.png";
            }
          }}
        />

        <div>
          <p className={styles.userName}>{user.name}</p>
          <p className={styles.userInfo}>{user.phone}</p>
          <p className={styles.userInfo}>{user.email}</p>
          <p className={styles.userInfo}>
            Current consumption: {user.value ?? "—"}
          </p>
        </div>
      </div>

      <div className={styles.graphBox}>
        <ConsumptionGraph
          data={(user.valuesByMonth || []).map((v: any) => ({
            month: v.month.toString(),
            value: v.value,
          }))}
        />
      </div>

      <button
        className={`${styles.talkButton} ${
          user.talked ? styles.talked : styles.notTalked
        }`}
        onClick={() => onToggleTalk(user.email)}
      >
        {user.talked ? "Talked ✓" : "Mark as Talked"}
      </button>
    </div>
  );
}
