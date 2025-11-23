"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./SocialSharing.module.css";
import Header from "@/app/components/Header/Header";
import { io, Socket } from "socket.io-client";

interface Saver {
    name: string;
    email: string;
    avgSaving: number;
    photo?: string | null;
}

interface CommentObj {
    text: string;
    userName: string;
    userPhoto?: string | null;
    createdAt?: string;
}

interface Post {
    _id?: string;
    userId: string;
    userName: string;
    userPhoto?: string | null;
    content: string;
    imageUrl?: string | null;
    createdAt?: string;

    likes: number;
    comments: CommentObj[];
    shares: number;
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
    const [savers, setSavers] = useState<Saver[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    const [newPostText, setNewPostText] = useState("");
    const [newPostImage, setNewPostImage] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");

    const [typingUser, setTypingUser] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const typingTimeoutRef = useRef<number | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // ⬇️ טוען משתמש נוכחי מ-localStorage (מפתח: "user")
    useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            if (stored) {
                setCurrentUser(JSON.parse(stored));
            }
        } catch {
            // מתעלמים
        }
    }, []);

    // ⬇️ scroll למטה בצ'אט כשמגיעות הודעות
    useEffect(() => {
        const el = messagesEndRef.current?.parentElement;
        if (!el) return;

        const isAtBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 50;

        if (isAtBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // ⬇️ טוען Best Savers
    useEffect(() => {
        fetch("/api/savers")
            .then((res) => res.json())
            .then((data) => (Array.isArray(data) ? setSavers(data) : setSavers([])))
            .catch(() => setSavers([]));
    }, []);

    // ⬇️ טוען פוסטים והודעות פעם אחת בהתחלה
    useEffect(() => {
        loadPosts();
        loadMessages();
    }, []);

    // ⬇️ חיבור ל-WebSocket (socket.io)
    useEffect(() => {
        const socket = io("http://localhost:4000", {
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("🔌 Socket connected");
        });

        // הודעה חדשה מהשרת
        socket.on("new_message", (msg: Message) => {
            setMessages((prev) => {
                const exists = prev.some(
                    (m) => String(m._id) === String(msg._id)
                );
                if (exists) return prev;
                return [...prev, msg];
            });
        });

        // מישהו מקליד
        socket.on("typing", (data: { userId: string; userName: string }) => {
            setTypingUser(data.userName);
            if (typingTimeoutRef.current) {
                window.clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = window.setTimeout(() => {
                setTypingUser(null);
            }, 2000);
        });

        socket.on("disconnect", () => {
            console.log("🔌 Socket disconnected");
        });

        return () => {
            socket.disconnect();
            if (typingTimeoutRef.current) {
                window.clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // ⬇️ העלאת תמונה לפוסט (כמו אינסטגרם)
    const handlePostImageUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setNewPostImage(reader.result as string); // base64
        };
        reader.readAsDataURL(file);
    };

    // ⬇️ יצירת פוסט חדש
    const handleCreatePost = async () => {
        if (!currentUser) {
            alert("Please sign in to create a post.");
            return;
        }
        if (!newPostText.trim() && !newPostImage) return;

        const body = {
            userId: currentUser._id,
            userName: currentUser.name,
            userPhoto: currentUser.photo,
            content: newPostText.trim(),
            imageUrl: newPostImage || null,
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
            setNewPostImage(null);
        } else {
            alert("Failed to create post");
        }
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

            // מוסיפים לעצמנו מיד
            setMessages((prev) => [...prev, created]);
            setNewMessage("");

            // משדרים דרך socket לשאר המשתמשים
            socketRef.current?.emit("send_message", created);
        } else {
            alert("Failed to send message");
        }
    };

    // ⬇️ שינוי טקסט בצ'אט + שידור typing
    const handleChatInputChange = (value: string) => {
        setNewMessage(value);
        if (!currentUser || !socketRef.current) return;

        socketRef.current.emit("typing", {
            userId: currentUser._id,
            userName: currentUser.name,
        });
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

    const loadPosts = () => {
        fetch("/api/posts")
            .then((res) => res.json())
            .then((data) => (Array.isArray(data) ? setPosts(data) : setPosts([])))
            .catch(() => setPosts([]));
    };

    const loadMessages = () => {
        fetch("/api/messages")
            .then((res) => res.json())
            .then((data) =>
                Array.isArray(data) ? setMessages(data) : setMessages([])
            )
            .catch(() => setMessages([]));
    };


    const likePost = async (postId: string) => {
        await fetch("/api/posts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId, action: "like" }),
        });
        loadPosts();
    };

    const sharePost = async (postId: string) => {
        await fetch("/api/posts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId, action: "share" }),
        });
        loadPosts();
    };

    const commentPost = async (postId: string, text: string) => {
        await fetch("/api/posts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                postId,
                action: "comment",
                comment: text,
                userName: currentUser?.name,
                userPhoto: currentUser?.photo,
            }),
        });
        loadPosts();
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
                            <li
                                key={i}
                                className={styles.saverItem}
                                style={{ animationDelay: `${i * 0.12}s` }}
                            >
                                <span className={`${styles.rankBadge} ${i === 0 ? styles.gold :
                                    i === 1 ? styles.silver :
                                        i === 2 ? styles.bronze : ""
                                    }`}>
                                    {i + 1}
                                </span>

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
                                className={styles.hiddenFile}
                                onChange={handlePostImageUpload}
                            />
                        </div>

                        {/* תצוגת תמונה לפני פרסום */}
                        {newPostImage && (
                            <div className={styles.previewWrapper}>
                                <img
                                    src={newPostImage}
                                    alt="preview"
                                    className={styles.previewImage}
                                />

                                <button
                                    type="button"
                                    className={styles.removeImageBtn}
                                    onClick={() => setNewPostImage(null)}
                                >
                                    ❌
                                </button>
                            </div>
                        )}

                        <div className={styles.createPostBottom}>
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
                                    <button type="button" onClick={() => likePost(String(post._id))}>👍 Like ({post.likes})</button>

                                    <button type="button" onClick={() => {
                                        const text = prompt("Write a comment:");
                                        if (text?.trim()) commentPost(String(post._id), text.trim());
                                    }}>
                                        💬 Comment ({post.comments?.length || 0})
                                    </button>

                                    <button type="button" onClick={() => sharePost(String(post._id))}>↗ Share ({post.shares})</button>

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
                                                isMe
                                                    ? styles.messageBubbleMe
                                                    : styles.messageBubbleOther
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

                            {/* typing indicator */}
                            {typingUser && (
                                <div className={styles.typingIndicator}>
                                    <span>{typingUser} is typing</span>
                                    <div className={styles.typingDots}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className={styles.chatInputRow}>
                            <input
                                type="text"
                                className={styles.chatInput}
                                placeholder="Write a message…"
                                value={newMessage}
                                onChange={(e) => handleChatInputChange(e.target.value)}
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
