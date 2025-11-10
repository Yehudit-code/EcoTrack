"use client";

import React, { useState } from "react";
import styles from "./SignIn.module.css";

interface SignInFormProps {
  onSubmit?: (email: string, password: string) => void;
}

export default function SignInForm({ onSubmit }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(email, password);
    console.log("User:", email, "Password:", password);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label htmlFor="email">Username or email address</label>
      <input
        id="email"
        type="text"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" className={styles.signInButton}>
        Sign in
      </button>
    </form>
  );
}
