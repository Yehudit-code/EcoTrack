"use client";

import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import Header from "@/app/components/Header/Header";
import styles from "./Contact.module.css";
import { useUserStore } from "@/store/useUserStore";

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
            <input
              type="text"
              value={name}
              disabled
              className={styles.disabledInput}
            />

            <input
              type="email"
              value={email}
              disabled
              className={styles.disabledInput}
            />

            <textarea
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.textarea}
              required
            />

            <button type="submit" className={styles.button}>
              Send
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
