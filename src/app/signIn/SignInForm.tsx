"use client";

import React, { useState } from "react";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import styles from "./SignIn.module.css";
import RoleModal from "@/app/components/Modals/RoleModal";
import CompanyCategoryModal from "@/app/components/Modals/CompanyCategoryModal";

import Toast from "@/app/components/Toast/Toast";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return showToast("Please enter email and password");
    setLoading(true);
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        showToast("Signed in successfully!");
        setTimeout(() => (window.location.href = "/home"), 900);
      } else {
        showToast(data.error || "error signing in");
      }
    } catch {
      showToast("error in server");
    } finally {
      setLoading(false);
    }
  };

 const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // בדיקה אם קיים
    const checkRes = await fetch("/api/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });

    const checkData = await checkRes.json();

    if (checkData.exists) {
      localStorage.setItem("currentUser", JSON.stringify(checkData.user));
      showToast("Welcome back!");
      setTimeout(() => (window.location.href = "/home"), 900);
      return;
    }

    setGoogleUser(user);
    setShowRoleModal(true);

  } catch (err) {
    console.error(err);
    showToast("Google error");
  }
};

const finishGoogleSignup = async (category: string | null) => {
  const res = await fetch("/api/social-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: googleUser.email,
      name: googleUser.displayName,
      photoURL: googleUser.photoURL,
      role: googleUser.role,
      companyCategory: category,
    }),
  });

  const data = await res.json();

  localStorage.setItem("currentUser", JSON.stringify(data.user));

  window.location.href =
    googleUser.role === "company" ? "home" : "/home";
};


 const handleRoleSelected = (role: "user" | "company") => {
  googleUser.role = role;
  setShowRoleModal(false);

  if (role === "company") {
    setShowCategoryModal(true);
  } else {
    finishGoogleSignup(null);
  }
};

const handleCategorySelected = (category: string) => {
  googleUser.companyCategory = category;
  setShowCategoryModal(false);

  finishGoogleSignup(category);
};

return (
  <>
    {/* 🟢 Toast כמו בשאר המערכת */}
    {toast && <Toast text={toast} />}

    <form className={styles.form} onSubmit={handleEmailSignIn}>
      <label>Email</label>
      <input
        type="email"
        className={styles.inputField}
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <label>Password</label>
      <input
        type="password"
        className={styles.inputField}
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <button className={styles.signInButton} disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className={styles.consentText}>
        I allow my information to be used in accordance with utility providers in israel
      </p>
    </form>

    <div className={styles.divider}>
      <span>or continue with</span>
    </div>

    <div className={styles.authButtons}>
      <button
        onClick={handleGoogleSignIn}
        className={`${styles.providerBtn} ${styles.googleBtn}`}
      >
        <img src="/images/google.png" className={styles.icon} />
        Continue with Google
      </button>
    </div>

    {/* 🔵 ROLE MODAL */}
    {showRoleModal && (
      <RoleModal onSelect={handleRoleSelected} />
    )}

    {/* 🟣 COMPANY CATEGORY MODAL */}
    {showCategoryModal && (
      <CompanyCategoryModal onSelect={handleCategorySelected} />
    )}
  </>
);
  
}
