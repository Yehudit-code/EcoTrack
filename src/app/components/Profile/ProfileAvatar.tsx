"use client";
import React from "react";
import { ShoppingCart } from "lucide-react";
import styles from "@/app/profile/page.module.css";

export default function ProfileAvatar({ photo, role, proposalsCount }: any) {
  return (
    <div className={styles.avatarWrap}>
      <img
        src={photo || "/images/default-profile.png"}
        alt="Profile"
        className={styles.profileImg}
      />

      {role === "user" && (
        <div className={styles.cartWrap}>
          <ShoppingCart size={32} color="#2e7d32" />
          {proposalsCount > 0 && (
            <span className={styles.proposalBadge}>{proposalsCount}</span>
          )}
        </div>
      )}
    </div>
  );
}
