"use client";

import React from "react";
import SignUpForm from "./SignUpForm";
import styles from "./SignUp.module.css";

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2>
          Sign up to <span className={styles.logo}>EcoTrack</span>
        </h2>

        <div className={styles.authButtons}>
          <button className={`${styles.providerBtn} ${styles.googleBtn}`}>
            <img src="/images/google.png" alt="Google" className={styles.icon} />
            Continue with Google
          </button>
        </div>

        <div className={styles.divider}>
          <span>or sign up with email</span>
        </div>

        <SignUpForm />
      </div>
    </div>
  );
}
