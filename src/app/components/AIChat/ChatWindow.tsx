"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // טוען היסטוריה מהלוקאל סטורג'
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eco_ai_chat");
      return saved ? JSON.parse(saved) : [
        { sender: "ai", text: "Hi! I'm your EcoTrack assistant 🌿\nHow can I help you today?" }
      ];
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // גלילה תמיד להודעה האחרונה
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("eco_ai_chat", JSON.stringify(messages));
  }, [messages, isTyping]);

  async function sendMessage() {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const newUserMsg: ChatMessage = { sender: "user", text: userText };
    const updatedMessages = [...messages, newUserMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/eco-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: updatedMessages,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || "The AI had trouble responding.";

      setMessages((prev) => [...prev, { sender: "ai", text: replyText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Network error – please try again later." }
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        <span>EcoTrack AI Assistant</span>
        <button className={styles.closeButton} onClick={onClose}>✖</button>
      </div>

      <div className={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} className={m.sender === "user" ? styles.userMsg : styles.aiMsg}>
            <span className={styles.msgText}>{m.text}</span>
          </div>
        ))}

        {/* אנימציית AI is typing */}
        {isTyping && (
          <div className={styles.aiMsg}>
            <div className={styles.typingIndicator}>
              <span></span><span></span><span></span>
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
