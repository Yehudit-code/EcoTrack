"use client";

import React, { useState } from "react";
import styles from "./chat.module.css";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hi! I'm your EcoTrack assistant 🌿\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const userText = input;
    const userMsg: ChatMessage = { sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/eco-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      let replyText = "";

      if (!res.ok) {
        // במקרה של שגיאה בשרת – נציג הודעה יפה
        replyText =
          "The EcoTrack AI had trouble responding right now. Please try again later.";
      } else {
        const data = await res.json();
        replyText = data.reply ?? "The AI sent an empty response.";
      }

      const aiMsg: ChatMessage = { sender: "ai", text: replyText };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const aiMsg: ChatMessage = {
        sender: "ai",
        text: "Network error – please check your connection and try again.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        <span>EcoTrack AI Assistant</span>
        <button onClick={onClose}>✖</button>
      </div>

      <div className={styles.messages}>
        {messages.map((m, index) => (
          <div
            key={index}
            className={m.sender === "user" ? styles.userMsg : styles.aiMsg}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className={styles.inputArea}>
        <input
          className={styles.inputField}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about saving water, electricity, transport, or waste..."
        />
        <button className={styles.sendButton} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
