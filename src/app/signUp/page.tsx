"use client";

import React, { useState } from "react";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
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

  // ⭐ התחברות עם Google
  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 🧹 מנקים לוקל סטורג’
      localStorage.clear();

      // בדיקה אם המשתמש קיים
      const checkResponse = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const checkData = await checkResponse.json();

      // משתמש קיים
      if (checkData.exists) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: "user",
          })
        );

        localStorage.setItem(
          "profilePic",
          user.photoURL || "/images/default-profile.png"
        );

        showToast("😄 Welcome back!");

        setTimeout(() => (window.location.href = "/home"), 1000);
        return;
      }

      // משתמש חדש — שמירה במסד
      const saveResponse = await fetch("/api/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          role: "user",
        }),
      });

      const saveData = await saveResponse.json();

      if (saveResponse.ok) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: "user",
          })
        );

        localStorage.setItem(
          "profilePic",
          user.photoURL || "/images/default-profile.png"
        );

        showToast("🎉 נרשמת בהצלחה דרך Google!");
        setTimeout(() => (window.location.href = "/home"), 1000);
      } else {
        showToast(saveData.error || "Registration failed");
      }
    } catch (error) {
      console.error("❌ Google signup error:", error);
      showToast("Something went wrong with Google signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ⭐ הצגת טוסט */}
      {toast && <Toast text={toast} />}

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
