"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./SocialSharing.module.css";
import Header from "@/app/components/Header/Header";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import Pusher from "pusher-js";

import {
  getSavers,
  getPosts,
  getMessages,
  createPost,
  updatePost,
  sendMessage,
} from "@/app/services/server/social";
import SkeletonPost from "@/app/components/Skeleton/SkeletonPost";
import SkeletonSaver from "@/app/components/Skeleton/SkeletonSaver";
import { useUserStore } from "@/store/useUserStore";
import { Suspense } from "react";
import SocialSharingClient from "./SocialSharingClient";

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
  const currentUser = useUserStore((state) => state.user);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const [typingUser, setTypingUser] = useState<string | null>(null);

  const [showPostEmoji, setShowPostEmoji] = useState(false);
  const [showChatEmoji, setShowChatEmoji] = useState(false);

  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [sharedPostId, setSharedPostId] = useState<string | null>(null);

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
    if (messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!sharedPostId || posts.length === 0) return;

    const el = document.getElementById(`post-${sharedPostId}`);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [sharedPostId, posts]);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_PUSHER_KEY ||
      !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ) {
      console.error("❌ Missing Pusher env vars");
      return;
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe("chat-channel");

    channel.bind("new-message", (msg: Message) => {
      setMessages((prev) => {
        if (msg.userId === currentUser?._id) return prev;
        return [...prev, msg];
      });
    });


    channel.bind("typing", (data: { userName: string | null }) => {
      if (data.userName) {
        setTypingUser(data.userName);
        setTimeout(() => setTypingUser(null), 1500);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);


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

    setPosts((prev) => {
      const exists = prev.some(p => p._id === created._id);
      return exists ? prev : [created, ...prev];
    });

    setNewPostText("");
    setNewPostImage(null);
    setShowPostEmoji(false);
  };

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

  const sharePost = async (id: string) => {
    const shareUrl = `${window.location.origin}/user/social-sharing?post=${id}`;

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

  const handleSendMessage = async () => {
    if (!currentUser) return;
    if (!newMessage.trim()) return;

    // 🔹 הודעה זמנית (Optimistic UI)
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      userId: currentUser._id,
      userName: currentUser.name,
      userPhoto: currentUser.photo,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    // 🔹 מציגים מייד בצ’אט
    setMessages((prev) => [...prev, tempMessage]);

    setNewMessage("");
    setShowChatEmoji(false);

    try {
      await sendMessage({
        userId: currentUser._id,
        userName: currentUser.name,
        userPhoto: currentUser.photo,
        message: tempMessage.message,
      });
    } catch (err) {
      console.error("❌ Failed to send message", err);
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
                <>
                  <SkeletonSaver />
                  <SkeletonSaver />
                  <SkeletonSaver />
                </>
              )}
            </ul>
          </div>
        </div>

        {/* ---------------- CENTER ---------------- */}
        <Suspense fallback={null}>
          <SocialSharingClient onPostIdDetected={setSharedPostId} />
        </Suspense>

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
                <div
                  key={post._id}
                  id={`post-${post._id}`}
                  className={`${styles.postCard} ${sharedPostId === post._id ? styles.highlightedPost : ""
                    }`}

                >
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
                          <div className={styles.noComments}>
                            No comments yet. Start the conversation 💬
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
              <>
                <SkeletonPost />
                <SkeletonPost />
                <SkeletonPost />
              </>
            )}
          </div>
        </div>

        {/* ---------------- RIGHT ---------------- */}
        <div className={styles.rightColumn}>
          <h3 className={styles.columnTitle}>Community chat 💬</h3>

          <div className={styles.chatCard}>
            <div className={styles.messagesArea} ref={messagesContainerRef}>
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

                  fetch("/api/chat/typing", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userName: currentUser?.name }),
                  });

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