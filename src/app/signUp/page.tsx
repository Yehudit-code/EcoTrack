"use client";

import React, { useState } from "react";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import styles from "./SignUp.module.css";
import SignUpForm from "./SignUpForm";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);

  // ✅ התחברות עם Google
  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 🔹 בדיקה אם המשתמש כבר קיים
      const checkResponse = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        alert("😄 Welcome back!");
        window.location.href = "/home";
        return;
      }

      // 🔹 משתמש חדש → הוספה למסד הנתונים
      const saveResponse = await fetch("/api/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          email: user.email,
          name: user.displayName,
          photo: user.photoURL,
          role: "user", // אפשר לשנות לפי הצורך
        }),
      });

      const saveData = await saveResponse.json();

      if (saveResponse.ok) {
        alert("🎉 נרשמת בהצלחה דרך Google!");
        window.location.href = "/home";
      } else {
        alert(saveData.error || "Registration failed");
      }
    } catch (error) {
      console.error("❌ Google signup error:", error);
      alert("Something went wrong with Google signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2>
          Sign up to <span className={styles.logo}>EcoTrack</span>
        </h2>

        <div className={styles.authButtons}>
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className={`${styles.providerBtn} ${styles.googleBtn}`}
          >
            <img src="/images/google.png" alt="Google" className={styles.icon} />
            {loading ? "Connecting..." : "Continue with Google"}
          </button>

          <button className={`${styles.providerBtn} ${styles.appleBtn}`}>
            <img src="/images/apple.png" alt="Apple" className={styles.icon} />
            Continue with Apple
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
