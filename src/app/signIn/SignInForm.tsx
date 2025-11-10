"use client";

import React, { useState } from "react";
import { auth, googleProvider, facebookProvider, githubProvider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import styles from "./SignIn.module.css";

interface SignInFormProps {
    onSubmit?: (email: string, password: string) => void;
}

export default function SignInForm({ onSubmit }: SignInFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) onSubmit(email, password);
    };

    // התחברויות חיצוניות
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("✅ Google User:", result.user);
        } catch (error) {
            console.error("❌ Google Sign-in Error:", error);
        }
    };

    const handleFacebookSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            console.log("✅ Facebook User:", result.user);
        } catch (error) {
            console.error("❌ Facebook Sign-in Error:", error);
        }
    };

    const handleGithubSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, githubProvider);
            console.log("✅ GitHub User:", result.user);
        } catch (error) {
            console.error("❌ GitHub Sign-in Error:", error);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.inputField}

                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                />

                <button type="submit" className={styles.signInButton}>
                    Sign in
                </button>
            </form>

            <div className={styles.divider}>
                <span>or continue with</span>
            </div>

            <div className={styles.authButtons}>
                <button onClick={handleGoogleSignIn} className={`${styles.providerBtn} ${styles.googleBtn}`}>
                    <img src="images/google.png" alt="Google" className={styles.icon} />
                    Continue with Google
                </button>

                <button onClick={handleFacebookSignIn} className={`${styles.providerBtn} ${styles.facebookBtn}`}>
                    <img src="images/facebook.png" alt="Facebook" className={styles.icon} />
                    Continue with Facebook
                </button>

                <button onClick={handleGithubSignIn} className={`${styles.providerBtn} ${styles.githubBtn}`}>
                    <img src="images/github.png" alt="GitHub" className={styles.icon} />
                    Continue with GitHub
                </button>
            </div>
        </>
    );
}
