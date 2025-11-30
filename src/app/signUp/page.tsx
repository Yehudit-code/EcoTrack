"use client";

import React, { useState } from "react";
import styles from "./SignUp.module.css";
import SignUpForm from "./SignUpForm";
import Toast from "@/app/components/Toast/Toast"; 

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className={styles.container}>
      {toast && <Toast text={toast} />}

      <div className={styles.formWrapper}>
        <h2>
          Sign up to <span className={styles.logo}>EcoTrack</span>
        </h2>

        <SignUpForm />
      </div>
    </div>
  );
}
