"use client";

import React from "react";
import styles from "./chat.module.css";

type ChatBubbleProps = {
  onClick: () => void;
  isOpen: boolean;
};

export default function ChatBubble({ onClick, isOpen }: ChatBubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.chatBubbleBox} ${
        isOpen ? styles.open : ""
      }`}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      <img
        src="/images/ai.png"
        alt="AI Assistant"
        className={styles.chatBubbleIcon}
      />
    </button>
  );
}
