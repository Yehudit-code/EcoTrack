"use client";

import React, { useState } from "react";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import styles from "./SignIn.module.css";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);

  // 🧩 התחברות רגילה (מייל + סיסמה)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // שמירת המשתמש בלוקאל סטורג'
      localStorage.setItem("user", JSON.stringify(data.user));

      // הודעה
      alert(`✅ Welcome back, ${data.user.name || "user"}!`);

      // ✅ הפניה לעמוד הבית
      window.location.href = "/home";

    } catch (error) {
      console.error("❌ Login error:", error);
      alert("An error occurred during login");
    }
  };

  // 🔹 התחברות עם גוגל (לא נוגעים)
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("✅ Google User:", user);

      const checkResponse = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        alert("ברוך הבא בחזרה! 😊");
        localStorage.setItem("user", JSON.stringify(checkData.user));
        window.location.href = "/home";
      } else {
        setGoogleUser(user);
        setShowRoleModal(true);
      }
    } catch (error) {
      console.error("❌ Google Sign-in Error:", error);
    }
  };

  const handleRoleSelect = async (role: "user" | "company") => {
    try {
      if (!googleUser) return;

      const response = await fetch("/api/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          email: googleUser.email,
          name: googleUser.displayName,
          photo: googleUser.photoURL,
          role,
        }),
      });

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(`נרשמת בהצלחה כ${role === "company" ? "חברה" : "משתמש רגיל"}!`);
      window.location.href = "/home";
    } catch (error) {
      console.error("❌ Error saving social login:", error);
    } finally {
      setShowRoleModal(false);
    }
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.inputField}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.inputField}
        />

        <button type="submit" className={styles.signInButton}>
          Sign in
        </button>
      </form>

      <div className={styles.divider}>
        <span>or continue with</span>
      </div>

      <div className={styles.authButtons}>
        <button
          onClick={handleGoogleSignIn}
          className={`${styles.providerBtn} ${styles.googleBtn}`}
        >
          <img src="images/google.png" alt="Google" className={styles.icon} />
          Continue with Google
        </button>
      </div>

      {showRoleModal && (
        <div className={styles.roleModal}>
          <div className={styles.roleBox}>
            <h3>האם אתה משתמש רגיל או חברה?</h3>
            <div className={styles.roleButtons}>
              <button onClick={() => handleRoleSelect("user")}>משתמש רגיל</button>
              <button onClick={() => handleRoleSelect("company")}>חברה</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
