"use client";

import React, { useState } from "react";
import { auth, googleProvider, facebookProvider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import styles from "./SignIn.module.css";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to sign in");
        return;
      }

      setMessage("✅ Sign-in successful!");
      console.log("User data:", data.user);
    } catch (error) {
      console.error("❌ Error during sign-in:", error);
      setMessage("Something went wrong");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // שליחה לשרת לוודא קיום המשתמש
      await fetch("/api/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          email: user.email,
          name: user.displayName,
          photo: user.photoURL,
        }),
      });

      setMessage("✅ Google sign-in successful!");
    } catch (error) {
      console.error("❌ Google Sign-in Error:", error);
      setMessage("Google sign-in failed");
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      await fetch("/api/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "facebook",
          email: user.email,
          name: user.displayName,
          photo: user.photoURL,
        }),
      });

      setMessage("✅ Facebook sign-in successful!");
    } catch (error) {
      console.error("❌ Facebook Sign-in Error:", error);
      setMessage("Facebook sign-in failed");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.inputField}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.inputField}
          required
        />

        <button type="submit" className={styles.signInButton}>
          Sign in
        </button>
      </form>

      <div className={styles.divider}>
        <span>or continue with</span>
      </div>

      <div className={styles.authButtons}>
        <button onClick={handleGoogleSignIn} className={`${styles.providerBtn} ${styles.googleBtn}`}>
          <img src="images/google.png" alt="Google" className={styles.icon} />
          Continue with Google
        </button>

        <button onClick={handleFacebookSignIn} className={`${styles.providerBtn} ${styles.facebookBtn}`}>
          <img src="images/facebook.png" alt="Facebook" className={styles.icon} />
          Continue with Facebook
        </button>
      </div>

      {message && <p style={{ color: message.includes("✅") ? "green" : "red" }}>{message}</p>}
    </>
  );
}
