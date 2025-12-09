"use client";
import React, { useState, useRef } from "react";
import styles from "./SignUp.module.css";
import Toast from "@/app/components/Toast/Toast";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import RoleModal from "@/app/components/Modals/RoleModal";
import CompanyCategoryModal from "@/app/components/Modals/CompanyCategoryModal";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    photo: "",
    companyCategory: "",
  });

  const [toast, setToast] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);



  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileClick = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === "company" && !formData.companyCategory) {
      setShowCategoryModal(true);
      return;
    }

    try {
      localStorage.clear();

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Registration failed");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem(
        "profilePic",
        data.user.photoURL || data.user.photo || "/images/default-profile.png"
      );

      showToast("🎉 You have successfully registered!");
      setTimeout(() => {
        window.location.href =
          data.user.role === "company" ? "/home" : "/home";
      }, 1000);

    } catch (err) {
      console.error("Signup error:", err);
      showToast("Something went wrong. Try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 1️⃣ בדיקה אם משתמש כבר קיים במערכת
      const checkRes = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
        credentials: "include",
      });

      const checkData = await checkRes.json();

      if (checkData.exists) {
        // 🔁 משתמש קיים – נעדכן אותו עם נתוני גוגל (בלי מודאל תפקיד)
        const res = await fetch("/api/social-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            role: checkData.user.role, // שומרים את התפקיד הקיים (user / company)
            companyCategory: checkData.user.companyCategory ?? null,
          }),
          credentials: "include",
        });

        const data = await res.json();
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        showToast("Welcome back!");
        setTimeout(() => {
          window.location.href = "/home";
        }, 900);
        return;
      }

      // 🆕 משתמש חדש – ממשיכים כרגיל ל־RoleModal
      setGoogleUser(user);
      setShowRoleModal(true);

    } catch (err) {
      console.error(err);
      showToast("Google error");
    }
  };


  const handleRoleSelected = (role: "user" | "company") => {
    googleUser.role = role;
    setShowRoleModal(false);

    if (role === "company") {
      setShowCategoryModal(true);
    } else {
      finishGoogleSignup(null);
    }
  };

  const handleCategorySelected = (category: string) => {
    googleUser.role = "company";
    googleUser.companyCategory = category;
    setShowCategoryModal(false);
    finishGoogleSignup(category);
  };

  const finishGoogleSignup = async (category: string | null) => {
    // ודא שהערכים נשמרים נכון
    if (category) {
      googleUser.role = "company";
      googleUser.companyCategory = category;
    }
    const res = await fetch("/api/social-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: googleUser.email,
        name: googleUser.displayName,
        photo: googleUser.photoURL,
        photoURL: googleUser.photoURL,
        provider: "google", role: googleUser.role,
        companyCategory: category,
      }),
      credentials: "include",
    });

    const data = await res.json();

    localStorage.setItem("currentUser", JSON.stringify(data.user));

    // לוג לפני הניווט
    console.log("role:", googleUser.role, "category:", googleUser.companyCategory);

    // ניווט אוטומטי לעמוד התצוגה אחרי הרשמה מוצלחת עם גוגל
    window.location.href =
      googleUser.role === "company" ? "/displa-user" : "/home";
  };


  return (
    <>
      {toast && <Toast text={toast} />}

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* ==== NEW IMAGE UPLOAD FIELD ==== */}
        {/* ==== NEW IMAGE UPLOAD FIELD (ICON ONLY CLICKABLE) ==== */}
        <div className={styles.fileRow}>
          <span className={styles.fileText}>
            {photoPreview ? "Image selected" : "Upload profile image"}
          </span>

          <button
            type="button"
            className={styles.iconButton}
            onClick={() => fileInputRef.current?.click()}
          >
            <img src="/images/upload.png" alt="upload" className={styles.uploadIcon} />
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            className={styles.hiddenInput}
          />
        </div>

        {photoPreview && (
          <img src={photoPreview} alt="Preview" className={styles.thumbPreview} />
        )}



        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={styles.inputField}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={styles.inputField}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className={styles.inputField}
          required
        />

        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className={styles.roleSelect}
        >
          <option value="user">User</option>
          <option value="company">Company</option>
        </select>

        {formData.role === "company" && (
          <select
            value={formData.companyCategory}
            onChange={(e) =>
              setFormData({ ...formData, companyCategory: e.target.value })
            }
            className={styles.roleSelect}
            required
          >
            <option value="">Select company category</option>
            <option value="electricity">Electricity</option>
            <option value="water">Water</option>
            <option value="transport">Transport</option>
            <option value="recycling">Recycling</option>
            <option value="solar">Solar</option>
          </select>
        )}


        <button type="submit" className={styles.signInButton}>Sign up</button>

        <p className={styles.consentText}>
          I allow my information to be used in accordance with utility providers in Israel.
        </p>

      </form>

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
      {showRoleModal && (
        <RoleModal onSelect={handleRoleSelected} />
      )}

      {showCategoryModal && (
        <CompanyCategoryModal onSelect={handleCategorySelected} />
      )}
    </>
  );
}
