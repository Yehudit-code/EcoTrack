"use client";

import React from "react";
import SignInForm from "./SignInForm";
import styles from "./SignIn.module.css";

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2>
          Sign in to <span className={styles.logo}>EcoTrack</span>
        </h2>

        <SignInForm /> {/* כאן הכל */}
      </div>
    </div>
  );
}
