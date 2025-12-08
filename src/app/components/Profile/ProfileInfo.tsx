"use client";
import React from "react";
import { Mail, User } from "lucide-react";
import styles from "@/app/profile/page.module.css";

export default function ProfileInfo({ user }: any) {
  return (
    <div className={styles.userInfo}>
      <h2>{user.name}</h2>

      <p className={styles.email}>
        <Mail size={16} /> {user.email}
      </p>

      <p className={styles.role}>
        <User size={16} />{" "}
        {user.role === "company" ? "Company Account" : "Individual User"}
      </p>
    </div>
  );
}
