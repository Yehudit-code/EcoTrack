"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./chat.module.css";
import { useChatStore } from "@/store/useChatStore";

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const messages = useChatStore((state) => state.messages);
  const isTyping = useChatStore((state) => state.isTyping);
  const addMessage = useChatStore((state) => state.addMessage);
  const setTyping = useChatStore((state) => state.setTyping);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage() {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();

    addMessage({ sender: "user", text: userText });
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/eco-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || "The AI had trouble responding.";

      addMessage({ sender: "ai", text: replyText });
    } catch {
      addMessage({
        sender: "ai",
        text: "Network error – please try again later.",
      });
    } finally {
      setTyping(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        <span>EcoTrack AI Assistant</span>
        <button className={styles.closeButton} onClick={onClose}>
          ✖
        </button>
      </div>

      <div className={styles.messages}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.sender === "user" ? styles.userMsg : styles.aiMsg}
          >
            <span className={styles.msgText}>{m.text}</span>
          </div>
        ))}

        {isTyping && (
          <div className={styles.aiMsg}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.inputField}
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button className={styles.sendButton} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
