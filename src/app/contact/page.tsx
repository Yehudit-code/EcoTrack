"use client";

import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import styles from "./Contact.module.css";
import { useUserStore } from "@/store/useUserStore";
import Header from "../components/Header/Header";

export default function ContactPage() {
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state._hasHydrated);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Populate form from Zustand user
  useEffect(() => {
    if (!hasHydrated || !user) return;

    setName(user.name || "");
    setEmail(user.email || "");
  }, [user, hasHydrated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await emailjs.send(
        "service_eo7p18q",
        "template_vq7szdb",
        {
          company_name: name,
          company_email: email,
          message,
        },
        "zvFzq-RxRb_BxCEqg"
      );

      setSent(true);
      setMessage("");

      setTimeout(() => setSent(false), 3000);
    } catch (err: any) {
      alert("Error sending message: " + (err?.text || err?.message));
    }
  };

  return (
    <>
      <Header />

      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Contact EcoTrack</h1>

          <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Company Name</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  value={name}
                  disabled
                  className={styles.disabledInput}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email Address</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  disabled
                  className={styles.disabledInput}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Your Message</label>
              <textarea
                placeholder="Tell us what's on your mind..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={styles.textarea}
                required
              />
            </div>

            <button type="submit" className={styles.button}>
              Send Message
            </button>
          </form>

          {sent && (
            <p className={styles.success}>
              Message sent successfully!
            </p>
          )}
        </div>
      </div>
    </>
  );
}