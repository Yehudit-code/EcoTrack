"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./SocialSharing.module.css";
import Header from "@/app/components/Header/Header";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "@/store/useUserStore";

import {
  getSavers,
  getPosts,
  getMessages,
  createPost,
  updatePost,
  sendMessage,
} from "@/app/services/server/social";

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

export default function SocialSharingPage() {
  const user = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  const [savers, setSavers] = useState<Saver[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  /* ------------------------------
     Initial data load
  ------------------------------ */
  useEffect(() => {
    if (!hasHydrated) return;

    getSavers().then((data) => {
      setSavers(Array.isArray(data) ? data : []);
    });

    loadPosts();
    loadMessages();
  }, [hasHydrated]);

  async function loadPosts() {
    const data = await getPosts();
    setPosts(Array.isArray(data) ? data : []);
  }

  async function loadMessages() {
    const data = await getMessages();
    setMessages(Array.isArray(data) ? data : []);
  }

  /* ------------------------------
     Socket connection
  ------------------------------ */
  useEffect(() => {
    if (!hasHydrated) return;

    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (data) => {
      setTypingUser(data.userName);
      setTimeout(() => setTypingUser(null), 2000);
    });

    return () => {
      socket.disconnect();
    };
  }, [hasHydrated]);

  /* ------------------------------
     Create post
  ------------------------------ */
  async function handleCreatePost() {
    if (!user) return;
    if (!newPostText.trim() && !newPostImage) return;

    const created = await createPost({
      userId: user._id,
      userName: user.name,
      userPhoto: user.photo,
      content: newPostText,
      imageUrl: newPostImage,
    });

    setPosts((prev) => [created, ...prev]);
    setNewPostText("");
    setNewPostImage(null);
  }

  async function likePost(id: string) {
    const updated = await updatePost("like", { postId: id });
    setPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
  }

  async function commentPost(id: string, text: string) {
    if (!user) return;

    const updated = await updatePost("comment", {
      postId: id,
      comment: text,
      userName: user.name,
      userPhoto: user.photo,
    });

    setPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
  }

  async function sharePost(id: string) {
    const updated = await updatePost("share", { postId: id });
    setPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
  }

  /* ------------------------------
     Send chat message
  ------------------------------ */
  async function handleSendMessage() {
    if (!user) return;
    if (!newMessage.trim()) return;

    const created = await sendMessage({
      userId: user._id,
      userName: user.name,
      userPhoto: user.photo,
      message: newMessage.trim(),
    });

    setMessages((prev) => [...prev, created]);
    setNewMessage("");

    socketRef.current?.emit("send_message", created);
  }

  function formatTime(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  }

  if (!hasHydrated) {
    return <div className={styles.page}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        {/* LEFT */}
        <div className={styles.leftColumn}>
          <h3 className={styles.columnTitle}>The best savers</h3>

          <ul className={styles.saversList}>
            {savers.map((u, i) => (
              <li key={i} className={styles.saverItem}>
                <span className={styles.rankBadge}>{i + 1}</span>
                <img
                  src={u.photo || "/images/default-profile.png"}
                  className={styles.saverAvatar}
                />
                <div>
                  <div className={styles.saverName}>{u.name}</div>
                  <div className={styles.saverSaving}>
                    Saved {u.avgSaving}% on average
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* CENTER */}
        <div className={styles.centerColumn}>
          <h3 className={styles.columnTitle}>Community feed</h3>

          <div className={styles.createPostCard}>
            <img
              src={user?.photo || "/images/default-profile.png"}
              className={styles.createAvatar}
            />

            <textarea
              className={styles.postTextarea}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className={styles.imageUploadBtn}
            >
              Upload image
            </button>

            <input
              type="file"
              ref={fileInputRef}
              className={styles.hiddenFile}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () =>
                  setNewPostImage(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />

            <button onClick={handleCreatePost} className={styles.postButton}>
              Post
            </button>
          </div>

          <div className={styles.postsList}>
            {posts.map((post) => (
              <div key={post._id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <img
                    src={post.userPhoto || "/images/default-profile.png"}
                    className={styles.postAvatar}
                  />
                  <div>
                    <div>{post.userName}</div>
                    <div>{formatTime(post.createdAt)}</div>
                  </div>
                </div>

                <div>{post.content}</div>

                <div className={styles.postActions}>
                  <button onClick={() => likePost(post._id!)}>
                    Like ({post.likes})
                  </button>
                  <button
                    onClick={() => {
                      const text = prompt("Write a comment");
                      if (text) commentPost(post._id!, text);
                    }}
                  >
                    Comment ({post.comments?.length ?? 0})
                  </button>
                  <button onClick={() => sharePost(post._id!)}>
                    Share ({post.shares})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.rightColumn}>
          <h3 className={styles.columnTitle}>Community chat</h3>

          <div className={styles.chatCard}>
            <div className={styles.messagesArea}>
              {messages.map((m) => {
                const isMe = user?._id === m.userId;
                return (
                  <div
                    key={m._id}
                    className={
                      isMe
                        ? styles.messageRowMe
                        : styles.messageRowOther
                    }
                  >
                    <div>{m.message}</div>
                    <div>{formatTime(m.createdAt)}</div>
                  </div>
                );
              })}

              {typingUser && (
                <div className={styles.typingIndicator}>
                  {typingUser} is typing
                </div>
              )}
            </div>

            <div className={styles.chatInputRow}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSendMessage()
                }
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
