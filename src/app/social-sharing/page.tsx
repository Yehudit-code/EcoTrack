"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SocialSharing.module.css";
import Header from "@/app/components/Header/Header";


interface Saver {
    name: string;
    email: string;
    avgSaving: number;
    photo?: string | null;
}

interface Post {
    _id?: string;
    userId: string;
    userName: string;
    userPhoto?: string | null;
    content: string;
    imageUrl?: string | null;
    createdAt?: string;
}

interface Message {
    _id?: string;
    userId: string;
    userName: string;
    userPhoto?: string | null;
    message: string;
    createdAt?: string;
}

interface CurrentUser {
    _id: string;
    name: string;
    email: string;
    photo?: string;
}

export default function SocialSharingPage() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [postImageFile, setPostImageFile] = useState<string | null>(null);

    const [savers, setSavers] = useState<Saver[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    const [newPostText, setNewPostText] = useState("");
    const [newPostImage, setNewPostImage] = useState("");
    const [newMessage, setNewMessage] = useState("");

    // ⬇️ טוען משתמש נוכחי מ-localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("currentUser");
            if (stored) {
                setCurrentUser(JSON.parse(stored));
            }
        } catch {
            // מתעלמים
        }
    }, []);

    // ⬇️ טוען Best Savers
    useEffect(() => {
        fetch("/api/savers")
            .then((res) => res.json())
            .then((data) => (Array.isArray(data) ? setSavers(data) : setSavers([])))
            .catch(() => setSavers([]));
    }, []);

    // ⬇️ טוען פוסטים
    const loadPosts = () => {
        fetch("/api/posts")
            .then((res) => res.json())
            .then((data) => (Array.isArray(data) ? setPosts(data) : setPosts([])))
            .catch(() => setPosts([]));
    };

    // ⬇️ טוען הודעות
    const loadMessages = () => {
        fetch("/api/messages")
            .then((res) => res.json())
            .then((data) =>
                Array.isArray(data) ? setMessages(data) : setMessages([])
            )
            .catch(() => setMessages([]));
    };

    useEffect(() => {
        loadPosts();
        loadMessages();

        // Polling לצ'אט כל כמה שניות (אפשר לשפר בעתיד ל-WebSocket)
        const interval = setInterval(() => {
            loadMessages();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // ⬇️ יצירת פוסט חדש
    const handleCreatePost = async () => {
        if (!currentUser) {
            alert("Please sign in to create a post.");
            return;
        }
        if (!newPostText.trim()) return;

        const body = {
            userId: currentUser._id,
            userName: currentUser.name,
            userPhoto: currentUser.photo,
            content: newPostText.trim(),
            imageUrl: newPostImage.trim() || null,
        };

        const res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            const created = await res.json();
            setPosts((prev) => [created, ...prev]);
            setNewPostText("");
            setNewPostImage("");
        } else {
            alert("Failed to create post");
        }
    };

    // העלאת תמונה לפוסט (כמו אינסטגרם)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPostImageFile(reader.result as string); // base64
            setNewPostImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };


    // ⬇️ שליחת הודעה בצ'אט
    const handleSendMessage = async () => {
        if (!currentUser) {
            alert("Please sign in to send a message.");
            return;
        }
        if (!newMessage.trim()) return;

        const body = {
            userId: currentUser._id,
            userName: currentUser.name,
            userPhoto: currentUser.photo,
            message: newMessage.trim(),
        };

        const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            const created = await res.json();
            setMessages((prev) => [...prev, created]);
            setNewMessage("");
        } else {
            alert("Failed to send message");
        }
    };

    const formatTime = (iso?: string) => {
        if (!iso) return "";
        const d = new Date(iso);
        return d.toLocaleString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
        });
    };

    return (

        <div className={styles.page}>
            <Header />
            <div className={styles.container}>
                {/* LEFT – BEST SAVERS */}
                <div className={styles.leftColumn}>
                    <h3 className={styles.columnTitle}>The best savers 🏆</h3>
                    <ul className={styles.saversList}>
                        {savers.map((u, i) => (
                            <li key={i} className={styles.saverItem}>
                                <span className={styles.rankBadge}>{i + 1}</span>
                                <img
                                    src={u.photo || "/defaultUser.png"}
                                    className={styles.saverAvatar}
                                    alt={u.name}
                                />
                                <div className={styles.saverInfo}>
                                    <span className={styles.saverName}>{u.name}</span>
                                    <span className={styles.saverSaving}>
                                        Saved {u.avgSaving}% on average
                                    </span>
                                </div>
                            </li>
                        ))}
                        {savers.length === 0 && (
                            <li className={styles.emptyText}>No data yet…</li>
                        )}
                    </ul>
                </div>

                {/* CENTER – POSTS FEED */}
                <div className={styles.centerColumn}>
                    <h3 className={styles.columnTitle}>Community feed ✨</h3>

                    {/* Create Post Box */}
                    <div className={styles.createPostCard}>
                        <div className={styles.createPostTop}>
                            <img
                                src={currentUser?.photo || "/defaultUser.png"}
                                alt="me"
                                className={styles.createAvatar}
                            />
                            <textarea
                                className={styles.postTextarea}
                                placeholder="Share your eco achievement… 💡"
                                value={newPostText}
                                onChange={(e) => setNewPostText(e.target.value)}
                            />
                        </div>
                        {postImageFile && (
                            <img src={postImageFile} alt="preview" className={styles.previewImage} />
                        )}

                        <div className={styles.createPostBottom}>

                            {/* אייקון מצלמה להעלאת תמונה */}
                            <button
                                type="button"
                                className={styles.imageUploadBtn}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                📷
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                className={styles.hiddenFile}
                            />

                            <button
                                className={styles.postButton}
                                type="button"
                                onClick={handleCreatePost}
                            >
                                Post
                            </button>
                        </div>

                    </div>

                    {/* Posts List */}
                    <div className={styles.postsList}>
                        {posts.map((post) => (
                            <div key={String(post._id)} className={styles.postCard}>
                                <div className={styles.postHeader}>
                                    <img
                                        src={post.userPhoto || "/defaultUser.png"}
                                        alt={post.userName}
                                        className={styles.postAvatar}
                                    />
                                    <div className={styles.postMeta}>
                                        <span className={styles.postUser}>{post.userName}</span>
                                        <span className={styles.postTime}>
                                            {formatTime(post.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.postContent}>{post.content}</div>

                                {post.imageUrl && (
                                    <div className={styles.postImageWrapper}>
                                        <img
                                            src={post.imageUrl}
                                            alt="post"
                                            className={styles.postImage}
                                        />
                                    </div>
                                )}

                                <div className={styles.postActions}>
                                    <button type="button">👍 Like</button>
                                    <button type="button">💬 Comment</button>
                                    <button type="button">↗ Share</button>
                                </div>
                            </div>
                        ))}
                        {posts.length === 0 && (
                            <div className={styles.emptyText}>
                                No posts yet… Be the first to share! 🌱
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT – TELEGRAM STYLE CHAT */}
                <div className={styles.rightColumn}>
                    <h3 className={styles.columnTitle}>Community chat 💬</h3>

                    <div className={styles.chatCard}>
                        <div className={styles.messagesArea}>
                            {messages.map((m) => {
                                const isMe =
                                    currentUser && m.userId === currentUser._id.toString();
                                return (
                                    <div
                                        key={String(m._id)}
                                        className={
                                            isMe ? styles.messageRowMe : styles.messageRowOther
                                        }
                                    >
                                        {!isMe && (
                                            <img
                                                src={m.userPhoto || "/defaultUser.png"}
                                                className={styles.chatAvatar}
                                                alt={m.userName}
                                            />
                                        )}
                                        <div
                                            className={
                                                isMe ? styles.messageBubbleMe : styles.messageBubbleOther
                                            }
                                        >
                                            {!isMe && (
                                                <div className={styles.messageName}>{m.userName}</div>
                                            )}
                                            <div className={styles.messageText}>{m.message}</div>
                                            <div className={styles.messageTime}>
                                                {formatTime(m.createdAt)}
                                            </div>
                                        </div>
                                        {isMe && (
                                            <img
                                                src={m.userPhoto || "/defaultUser.png"}
                                                className={styles.chatAvatar}
                                                alt={m.userName}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                            {messages.length === 0 && (
                                <div className={styles.emptyText}>
                                    No messages yet… say hi 👋
                                </div>
                            )}
                        </div>

                        <div className={styles.chatInputRow}>
                            <input
                                type="text"
                                className={styles.chatInput}
                                placeholder="Write a message…"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <button
                                className={styles.chatSendButton}
                                type="button"
                                onClick={handleSendMessage}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
