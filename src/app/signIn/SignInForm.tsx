"use client";

import React, { useState } from "react";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import styles from "./SignIn.module.css";

/* 🔔 Toast component */
function Toast({ text }: { text: string }) {
    return <div className={styles.toast}>{text}</div>;
}

export default function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [googleUser, setGoogleUser] = useState<any>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /* ⬇️ פונקציה להצגת toast */
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    /* ---------------------------------------------------- */
    /* SIGN IN WITH EMAIL */
    /* ---------------------------------------------------- */
    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return showToast("נא למלא אימייל וסיסמה");

        setLoading(true);
        try {
            const res = await fetch("/api/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("currentUser", JSON.stringify(data.user));
                showToast("התחברת בהצלחה!");
                setTimeout(() => (window.location.href = "/home"), 900);
            } else {
                showToast(data.error || "שגיאת התחברות");
            }
        } catch {
            showToast("שגיאה בשרת");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------------------------------------------- */
    /* SIGN IN WITH GOOGLE */
    /* ---------------------------------------------------- */
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // בדיקה אם כבר קיים במאגר
            const checkRes = await fetch("/api/check-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email }),
            });

            const checkData = await checkRes.json();

            if (checkData.exists) {
                // משתמש קיים → כניסה רגילה
                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(checkData.user)
                );
                showToast("ברוך הבא בחזרה! 😊");
                setTimeout(() => (window.location.href = "/home"), 900);
            } else {
                // משתמש חדש → שלב 1: בחירת תפקיד
                setGoogleUser(user);
                setShowRoleModal(true);
            }
        } catch (err) {
            console.error(err);
            showToast("שגיאה בהתחברות");
        }
    };

    /* ---------------------------------------------------- */
    /* אחרי בחירת ROLE → שואלים על שיתוף מידע */
    /* ---------------------------------------------------- */
    const handleRoleSelected = (role: "user" | "company") => {
        googleUser.role = role;
        setShowRoleModal(false);

    };


    return (
        <>
            {/* Toast */}
            {toast && <Toast text={toast} />}

            {/* FORM */}
            <form className={styles.form} onSubmit={handleEmailSignIn}>
                <label>Email</label>
                <input
                    type="email"
                    className={styles.inputField}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />

                <label>Password</label>
                <input
                    type="password"
                    className={styles.inputField}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />

                <button className={styles.signInButton} disabled={loading}>
                    {loading ? "מתחבר..." : "Sign in"}
                </button>

                <p className={styles.consentText}>
                    I allow my information to be used in accordance with utility providers in israel
                </p>

            </form>

            {/* Google Button */}
            <div className={styles.divider}>
                <span>or continue with</span>
            </div>

            <div className={styles.authButtons}>
                <button
                    onClick={handleGoogleSignIn}
                    className={`${styles.providerBtn} ${styles.googleBtn}`}
                >
                    <img src="/images/google.png" className={styles.icon} />
                    Continue with Google
                </button>
            </div>

            {/* ROLE PICKER MODAL */}
            {showRoleModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalBox}>
                        <h3>מה סוג המשתמש שלך?</h3>
                        <div className={styles.modalButtons}>
                            <button onClick={() => handleRoleSelected("user")}>
                                משתמש רגיל
                            </button>
                            <button onClick={() => handleRoleSelected("company")}>
                                חברה
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
