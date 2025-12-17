"use client";

import styles from "../page.module.css";
import ConsumptionGraph from "@/app/components/ConsumptionGraph";
import { useRouter } from "next/navigation";

export default function UserCard({ user, onToggleTalk }: any) {
  const router = useRouter();
  console.log("Rendering UserCard for:", user);
  const goToUserDetails = () => {
    router.push(`/company/user-details/${user._id}`);
  };
  const maxValue =
    Math.max(
      ...(user.valuesByMonth || []).map((v: any) => v.value),
      1
    );

  return (
    <div className={styles.card}>
      {/* Clicking the header now navigates to user details page */}
      <div className={styles.userHeader} onClick={goToUserDetails}>
        <img
          src={user.photo || user.photoURL || "/images/default-profile.png"}
          alt={user.name}
          className={styles.avatar}
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.src.includes("/images/default-profile.png")) {
              img.src = "/images/default-profile.png";
            }
          }}
        />

        <div className={styles.userDetails}>
          <p className={styles.userName}>{user.name}</p>

          <div className={styles.userInfoList}>
            <p className={styles.userInfo}>{user.email}</p>
            <p className={styles.userInfo}>
              Average consumption: {Math.round(user.avgValue)}
            </p>
          </div>
        </div>

      </div>

      <div className={styles.graphBox}>
        <ConsumptionGraph
          data={(user.valuesByMonth || []).map((v: any) => {
            const normalized = (v.value / maxValue) * 100;
            return {
              month: v.month.toString(),
              value: Math.max(5, Math.round(normalized)), // 👈 מינימום נראה לעין
            };
          })}
        />
      </div>

      <button
        className={`${styles.talkButton} ${user.talked ? styles.talked : styles.notTalked
          }`}
        onClick={() => onToggleTalk(user.email)}
      >
        {user.talked ? "Talked ✓" : "Mark as Talked"}
      </button>
    </div>
  );
}
