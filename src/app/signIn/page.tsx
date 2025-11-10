"use client";

import React from "react";
import SignInForm from "./SignInForm";
import styles from "./SignIn.module.css";

export default function SignInPage() {
  const handleSignIn = (email: string, password: string) => {
    console.log("Email:", email, "Password:", password);
    // כאן בעתיד תוכלי לחבר את ה-API
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2>
          Sign in to <span className={styles.logo}>EcoTrack</span>
        </h2>

        <SignInForm onSubmit={handleSignIn} />

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button className={styles.googleBtn}>
          <img src="/google-icon.svg" alt="Google" />
          Continue with Google
        </button>

        <button className={styles.appleBtn}>
          <img src="/apple-icon.svg" alt="Apple" />
          Continue with Apple
        </button>
      </div>
    </div>
  );
}
