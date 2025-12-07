"use client";
import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import CompanyHeader from "../components/CompanyHeader/CompanyHeader";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  // הבאת שם ומייל מהמשתמש המחובר
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setName(user.name || "");
          setEmail(user.email || "");
        } catch {}
      }
    }
  }, []);

  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await emailjs.send(
        "service_eo7p18q", // service ID
        "template_yh50ja8", // template ID
        {
          message: message
        },
        "zvFzq-RxRb_BxCEqg" // public key
      );
      setSent(true);
    } catch (err: any) {
      alert("Failed to send message. Error: " + (err?.text || err?.message || JSON.stringify(err)));
      console.error("EmailJS error:", err);
    }
  };

  return (
    <>
      <CompanyHeader />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md mt-8">
          <h1 className="text-2xl font-bold mb-4 text-center">Contact Us</h1>
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              disabled
              className="border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              disabled
              className="border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              required
            />
            <textarea
              placeholder="Message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="border rounded px-3 py-2"
              rows={4}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
            >
              Send
            </button>
          </form>
          {sent && (
            <p className="mt-4 text-green-600 text-center">Message sent! Thank you for contacting us.</p>
          )}
        </div>
      </div>
    </>
  );
}
