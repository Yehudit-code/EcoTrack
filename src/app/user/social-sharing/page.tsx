"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./SocialSharing.module.css";
import Header from "@/app/components/Header/Header";
import { io, Socket } from "socket.io-client";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

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

  // יכול להיות או מספר (ישן) או מערך userIds (חדש)
  likes: number | string[];
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

  // 🎯 אמוג'י פוסט + צ'אט
  const [showPostEmoji, setShowPostEmoji] = useState(false);
  const [showChatEmoji, setShowChatEmoji] = useState(false);

  // 💬 תגובות לפוסט
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    getSavers().then((data) =>
      Array.isArray(data) ? setSavers(data) : setSavers([])
    );
  }, []);

  useEffect(() => {
    loadPosts();
    loadMessages();
  }, []);

  const loadPosts = async () => {
    const data = await getPosts();
    setPosts(Array.isArray(data) ? data : []);
  };

  const loadMessages = async () => {
    const data = await getMessages();
    setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket connected");
    });

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (data) => {
      setTypingUser(data.userName);
      setTimeout(() => setTypingUser(null), 2000);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ⭐ יצירת פוסט
  const handleCreatePost = async () => {
    if (!currentUser) return;
    if (!newPostText.trim() && !newPostImage) return;

    const created = await createPost({
      userId: currentUser._id,
      userName: currentUser.name,
      userPhoto: currentUser.photo,
      content: newPostText,
      imageUrl: newPostImage,
    });

    setPosts((prev) => [created, ...prev]);

    setNewPostText("");
    setNewPostImage(null);
    setShowPostEmoji(false);
  };

  // ⭐ לייק לפי משתמש אחד
  const likePost = async (id: string) => {
    if (!currentUser) return;

    const updated = await updatePost("like", {
      postId: id,
      userId: currentUser._id,
    });

    setPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
  };

  // ⭐ תגובה לפוסט
  const commentPost = async (id: string, text: string) => {
    if (!currentUser) return;
    if (!text.trim()) return;

    const updated = await updatePost("comment", {
      postId: id,
      comment: text,
      userName: currentUser?.name,
      userPhoto: currentUser?.photo,
    });

    setPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
  };

  // ⭐ שיתוף אמיתי
  const sharePost = async (id: string) => {
    const shareUrl = `${window.location.origin}/social-sharing?post=${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "EcoTrack – Community post",
          text: "Check out this eco-saving post on EcoTrack 🌱",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Post link copied to clipboard");
      }
    } catch (err) {
      console.log("Share cancelled or failed:", err);
    }

    const updated = await updatePost("share", { postId: id });

    setPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
  };

  // ⭐ שליחת הודעה בצ׳אט
  const handleSendMessage = async () => {
    if (!currentUser) return;
    if (!newMessage.trim()) return;

    const created = await sendMessage({
      userId: currentUser._id,
      userName: currentUser.name,
      userPhoto: currentUser.photo,
      message: newMessage.trim(),
    });

    setMessages((prev) => [...prev, created]);
    setNewMessage("");
    setShowChatEmoji(false);

    socketRef.current?.emit("send_message", created);
  };

  // ⭐ פורמט זמן
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

  const handlePostEmojiClick = (emojiData: EmojiClickData) => {
    setNewPostText((prev) => prev + emojiData.emoji);
  };

  const handleChatEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>

        {/* ---------------- LEFT ---------------- */}
        <div className={styles.leftColumn}>
          <h3 className={styles.columnTitle}>The best savers 🏆</h3>

          <div className={styles.card}>
            <ul className={styles.saversList}>
              {savers.map((u, i) => (
                <li key={i} className={styles.saverItem}>
                  <span
                    className={`
                      ${styles.rankBadge}
                      ${i === 0
                        ? styles.rank1
                        : i === 1
                          ? styles.rank2
                          : i === 2
                            ? styles.rank3
                            : styles.rankOther
                      }
                    `}
                  >
                    {i + 1}
                  </span>

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

              {savers.length === 0 && (
                <li className={styles.emptyText}>No data yet…</li>
              )}
            </ul>
          </div>
        </div>

        {/* ---------------- CENTER ---------------- */}
        <div className={styles.centerColumn}>
          <h3 className={styles.columnTitle}>Community feed ✨</h3>

          {/* יצירת פוסט */}
          <div className={styles.createPostCard}>
            <div className={styles.createPostTop}>
              <img
                src={currentUser?.photo || "/images/default-profile.png"}
                className={styles.createAvatar}
              />

              <div className={styles.postInputWrapper}>
                <textarea
                  className={styles.postTextarea}
                  placeholder="Share your eco achievement… 💡"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                />

                <div className={styles.postIcons}>
                  <button
                    type="button"
                    className={styles.emojiBtn}
                    onClick={() => setShowPostEmoji((prev) => !prev)}
                  >
                    😀
                  </button>

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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () =>
                        setNewPostImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>


                {showPostEmoji && (
                  <div className={styles.emojiPickerPost}>
                    <EmojiPicker onEmojiClick={handlePostEmojiClick} />
                  </div>
                )}
              </div>
            </div>

            {newPostImage && (
              <div className={styles.previewWrapper}>
                <img src={newPostImage} className={styles.previewImage} />
                <button
                  className={styles.removeImageBtn}
                  onClick={() => setNewPostImage(null)}
                >
                  ❌
                </button>
              </div>
            )}

            <button className={styles.postButton} onClick={handleCreatePost}>
              Post
            </button>
          </div>

          {/* פוסטים */}
          <div className={styles.postsList}>
            {posts.map((post) => {
              const likesCount = Array.isArray(post.likes)
                ? post.likes.length
                : post.likes ?? 0;

              const isLiked =
                currentUser &&
                Array.isArray(post.likes) &&
                post.likes.includes(currentUser._id);

              return (
                <div key={post._id} className={styles.postCard}>
                  <div className={styles.postHeader}>
                    <img
                      src={post.userPhoto || "/images/default-profile.png"}
                      className={styles.postAvatar}
                    />
                    <div className={styles.postMeta}>
                      <div className={styles.postUser}>{post.userName}</div>
                      <div className={styles.postTime}>{formatTime(post.createdAt)}</div>
                    </div>
                  </div>

                  <div className={styles.postContent}>{post.content}</div>

                  {post.imageUrl && (
                    <div className={styles.postImageWrapper}>
                      <img src={post.imageUrl} className={styles.postImage} />
                    </div>
                  )}

                  <div className={styles.postActions}>
                    <button
                      onClick={() => likePost(post._id!)}
                      className={isLiked ? styles.likedBtn : undefined}
                    >
                      {isLiked ? "💙 Liked" : "👍 Like"} ({likesCount})
                    </button>

                    <button
                      onClick={() =>
                        setOpenCommentsPostId(
                          openCommentsPostId === post._id ? null : post._id!
                        )
                      }
                    >
                      💬 Comment ({post.comments?.length ?? 0})
                    </button>

                    <button onClick={() => sharePost(post._id!)}>
                      ↗ Share ({post.shares ?? 0})
                    </button>
                  </div>

                  {/* קופסת תגובות */}
                  {openCommentsPostId === post._id && (
                    <div className={styles.commentsBox}>
                      <div className={styles.commentsList}>
                        {post.comments.map((c, i) => (
                          <div key={i} className={styles.commentItem}>
                            <img
                              src={
                                c.userPhoto || "/images/default-profile.png"
                              }
                              className={styles.commentAvatar}
                            />
                            <div>
                              <div className={styles.commentUser}>
                                {c.userName}
                              </div>
                              <div className={styles.commentText}>
                                {c.text}
                              </div>
                            </div>
                          </div>
                        ))}

                        {(!post.comments || post.comments.length === 0) && (
                          <div className={styles.emptyComments}>
                            No comments yet…
                          </div>
                        )}
                      </div>

                      <div className={styles.commentInputRow}>
                        <input
                          type="text"
                          className={styles.commentInput}
                          placeholder="Write a comment…"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              commentPost(post._id!, commentText);
                              setCommentText("");
                            }
                          }}
                        />
                        <button
                          className={styles.sendCommentBtn}
                          onClick={() => {
                            commentPost(post._id!, commentText);
                            setCommentText("");
                          }}
                        >
                          ➤
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {posts.length === 0 && (
              <div className={styles.emptyText}>No posts yet…</div>
            )}
          </div>
        </div>

        {/* ---------------- RIGHT ---------------- */}
        <div className={styles.rightColumn}>
          <h3 className={styles.columnTitle}>Community chat 💬</h3>

          <div className={styles.chatCard}>
            <div className={styles.messagesArea}>
              {messages.map((m) => {
                const isMe = currentUser?._id === m.userId;

                return (
                  <div
                    key={m._id}
                    className={
                      isMe ? styles.messageRowMe : styles.messageRowOther
                    }
                  >
                    {!isMe && (
                      <img
                        src={m.userPhoto || "/images/default-profile.png"}
                        className={styles.chatAvatar}
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
                        <div className={styles.messageName}>
                          {m.userName}
                        </div>
                      )}
                      <div className={styles.messageText}>{m.message}</div>
                      <div className={styles.messageTime}>
                        {formatTime(m.createdAt)}
                      </div>
                    </div>

                    {isMe && (
                      <img
                        src={m.userPhoto || "/images/default-profile.png"}
                        className={styles.chatAvatar}
                      />
                    )}
                  </div>
                );
              })}

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
              <button
                type="button"
                className={styles.emojiBtn}
                onClick={() => setShowChatEmoji((prev) => !prev)}
              >
                😀
              </button>

              {showChatEmoji && (
                <div className={styles.emojiPickerChat}>
                  <EmojiPicker onEmojiClick={handleChatEmojiClick} />
                </div>
              )}

              <input
                type="text"
                className={styles.chatInput}
                placeholder="Write a message…"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);

                  socketRef.current?.emit("typing", {
                    userName: currentUser?.name,
                  });

                  if (typingTimeoutRef.current)
                    clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = window.setTimeout(() => {
                    socketRef.current?.emit("typing", { userName: null });
                  }, 1200);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />

              <button
                className={styles.chatSendButton}
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
