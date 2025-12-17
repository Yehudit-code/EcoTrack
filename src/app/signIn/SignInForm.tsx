"use client";

import React, { useState } from "react";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import styles from "./SignIn.module.css";
import RoleModal from "@/app/components/Modals/RoleModal";
import CompanyCategoryModal from "@/app/components/Modals/CompanyCategoryModal";
import Toast from "@/app/components/Toast/Toast";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

export default function SignInForm() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [googleUser, setGoogleUser] = useState<any>(null);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  /* ===============================
     EMAIL + PASSWORD SIGN IN
  =============================== */
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Sign in failed");
        return;
      }

      const meRes = await fetch("/api/me", { credentials: "include" });
      const meData = await meRes.json();

      setUser(meData.user);
      router.push("/home");
    } catch {
      showToast("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     GOOGLE SIGN IN
  =============================== */
const handleGoogleSignIn = async () => {
  setLoading(true);

  try {
    const result = await signInWithPopup(auth, googleProvider);

    const checkRes = await fetch("/api/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: result.user.email }),
    });

    const checkData = await checkRes.json();

    if (checkData.exists) {
      const loginRes = await fetch("/api/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: result.user.email,
          name: result.user.displayName,
          photoURL: result.user.photoURL,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        showToast(loginData.error || "Google login failed");
        return;
      }

      setUser(loginData.user);
      router.push("/home");
      return;
    }

    // משתמש חדש
    setGoogleUser(result.user);
    setShowRoleModal(true);

  } catch {
    showToast("Google sign-in failed");
  } finally {
    setLoading(false);
  }
};



  /* ===============================
     FINISH GOOGLE SIGNUP (NEW USER)
  =============================== */
  const finishGoogleSignup = async (category: string | null) => {
    if (!googleUser) return;

    setLoading(true);

    try {
      const res = await fetch("/api/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.displayName,
          photoURL: googleUser.photoURL,
          role: googleUser.role,
          companyCategory: category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Google login failed");
        return;
      }

      const meRes = await fetch("/api/me", { credentials: "include" });
      const meData = await meRes.json();

      setUser(meData.user);
      router.push("/home");
    } catch {
      showToast("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     ROLE SELECTION
  =============================== */
  const handleRoleSelected = (role: "user" | "company") => {
  setGoogleUser((prev: any) => ({ ...prev, role }));
  setShowRoleModal(false);

  if (role === "company") {
    setShowCategoryModal(true);
  } else {
    finishGoogleSignup(null);
  }
};


  const handleCategorySelected = (category: string) => {
    setShowCategoryModal(false);
    finishGoogleSignup(category);
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <>
      {toast && <Toast text={toast} />}

      <form className={styles.form} onSubmit={handleEmailSignIn}>
        <label>Email</label>
        <input
          type="email"
          className={styles.inputField}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <label>Password</label>
        <input
          type="password"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button className={styles.signInButton} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className={styles.divider}>
        <span>or continue with</span>
      </div>

      <div className={styles.authButtons}>
        <button
          onClick={handleGoogleSignIn}
          className={`${styles.providerBtn} ${styles.googleBtn}`}
          disabled={loading}
        >
          <img src="/images/google.png" className={styles.icon} />
          Continue with Google
        </button>
      </div>

      {showRoleModal && <RoleModal onSelect={handleRoleSelected} />}
      {showCategoryModal && (
        <CompanyCategoryModal onSelect={handleCategorySelected} />
      )}
    </>
  );
}
