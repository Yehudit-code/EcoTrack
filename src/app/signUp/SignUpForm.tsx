"use client";
import React, { useState, useRef } from "react";
import styles from "./SignUp.module.css";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    photo: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 📸 העלאת תמונה
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

  const handleProfileClick = () => {
    fileInputRef.current?.click();
  };

  // 💾 שליחת הנתונים
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      // ✅ הצגת הודעה ברורה
      alert("🎉 נרשמת בהצלחה למערכת EcoTrack!");

      // Save user to localStorage
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Navigate by user type
      if (data.user.role === "company") {
        window.location.href = "/company-home";
      } else {
        window.location.href = "/home";
      }
    } catch (err) {
      console.error("❌ Signup error:", err);
      alert("Something went wrong. Try again.");
    }
  };


  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* 📸 תמונת פרופיל יפה */}
      <div className={styles.profileUpload}>
        <div className={styles.profileImageContainer} onClick={handleProfileClick}>
          {photoPreview ? (
            <img src={photoPreview} alt="Profile" className={styles.profileImage} />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.cameraIcon}>📷</span>
            </div>
          )}
          <div className={styles.overlay}>
            <span className={styles.changeText}>Change</span>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          ref={fileInputRef}
          className={styles.hiddenInput}
        />
      </div>

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
        onChange={(e) =>
          setFormData({ ...formData, password: e.target.value })
        }
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

      <button type="submit" className={styles.signInButton}>
        Sign up
      </button>
    </form>
  );
}
