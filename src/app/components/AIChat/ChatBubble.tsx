"use client";

import React from "react";
import styles from "./chat.module.css";

export default function ChatBubble({ onClick }: { onClick: () => void }) {
    return (
        <div className={styles.chatBubbleBox} onClick={onClick}>
            <img src="/images/ai.png" alt="AI" className={styles.chatBubbleIcon} />
        </div>
    );
}
