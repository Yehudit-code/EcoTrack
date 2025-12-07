"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Profile.module.css";

// בחירת תמונת פרופיל
import { getProfileImage } from "@/app/lib/getProfileImage";

import {
  ArrowLeft,
  LogOut,
  Mail,
  Phone,
  User,
  Calendar,
  Edit3,
  Factory,
  Droplet,
  Bus,
  Recycle,
  Sun,
  ShoppingCart
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [proposalsCount, setProposalsCount] = useState<number>(0);

  const [editData, setEditData] = useState<any>({
    name: "",
    phone: "",
    birthDate: "",
    companies: {
      electricity: "",
      water: "",
      transport: "",
      recycling: "",
      solar: "",
    },
  });

  /* ----------------------------------------------------
      טעינת המשתמש מה־localStorage
  ---------------------------------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);

      setEditData({
        name: parsed.name || "",
        phone: parsed.phone || "",
        birthDate: parsed.birthDate || "",
        companies: parsed.companies || {
          electricity: "",
          water: "",
          transport: "",
          recycling: "",
          solar: "",
        },
      });

      // הבאת הצעות מחיר — רק למשתמש רגיל
      if (parsed.role === "user") {
        fetch(`/api/company-requests?userId=${parsed._id}`)
          .then(res => res.json())
          .then(data =>
            setProposalsCount(Array.isArray(data) ? data.length : (data?.length || 0))
          )
          .catch(() => setProposalsCount(0));
      }
    }
  }, []);

  /* ----------------------------------------------------
      התנתקות
  ---------------------------------------------------- */
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.clear();
    router.push("/");
  };

  /* ----------------------------------------------------
      שמירת עריכה
  ---------------------------------------------------- */
  const handleSave = async () => {
    const updatedUser = {
      ...user,
      ...editData,
      companies: { ...editData.companies }
    };

    const res = await fetch("/api/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } else {
      alert(data.error || "Update failed");
    }
  };

  if (!user) return <p className={styles.loading}>Loading profile...</p>;

  const c = user.companies || {};

  return (
    <div className={styles.profilePage}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        <ArrowLeft size={20} /> Back
      </button>

      <button onClick={handleLogout} className={styles.logoutBtn}>
        <LogOut size={18} /> Logout
      </button>

      <div className={styles.profileCard}>
        <div className={styles.headerSection}>

          {/* תמונת פרופיל אמיתית */}
          <img
            src={getProfileImage(user)}
            alt="Profile"
            className={styles.profileImg}
          />

          {/* עגלה — רק למשתמש רגיל */}
          {user.role === "user" && (
            <div style={{ position: "relative" }} title="Proposals">
              <ShoppingCart size={32} color="#2e7d32" />

              {proposalsCount > 0 && (
                <span className={styles.badge}>
                  {proposalsCount}
                </span>
              )}
            </div>
          )}

          <div className={styles.userInfo}>
            <h2>{user.name}</h2>

            <p className={styles.email}>
              <Mail size={16} /> {user.email}
            </p>

            <p className={styles.role}>
              <User size={16} />
              {user.role === "company"
                ? " Company Account"
                : " Individual User"}
            </p>
          </div>
        </div>

        {/* תוכן */}
        <div className={styles.content}>
          
          {/* פרטים אישיים */}
          <div className={styles.section}>
            <h3>Personal Information</h3>

            <div className={styles.row}>
              <Phone size={18} /> Phone: <strong>{user.phone || "Not provided"}</strong>
            </div>

            <div className={styles.row}>
              <Calendar size={18} /> Birth Date: <strong>{user.birthDate || "—"}</strong>
            </div>

            <div className={styles.row}>
              <Calendar size={18} /> Member Since:{" "}
              <strong>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </strong>
            </div>

            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

          {/* חברות — רק למשתמש רגיל */}
          {user.role === "user" && (
            <div className={styles.section}>
              <h3>Connected Companies</h3>

              <div className={styles.companyList}>
                <div className={styles.row}>
                  <Factory size={18} /> Electricity:
                  <strong>{c.electricity || "Not connected"}</strong>
                </div>

                <div className={styles.row}>
                  <Droplet size={18} /> Water:
                  <strong>{c.water || "Not connected"}</strong>
                </div>

                <div className={styles.row}>
                  <Bus size={18} /> Transport:
                  <strong>{c.transport || "Not connected"}</strong>
                </div>

                <div className={styles.row}>
                  <Recycle size={18} /> Recycling:
                  <strong>{c.recycling || "Not connected"}</strong>
                </div>

                <div className={styles.row}>
                  <Sun size={18} /> Solar:
                  <strong>{c.solar || "Not connected"}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* מודאל עריכה */}
      {isEditing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h2>Edit Profile</h2>

            <label>Full Name</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />

            <label>Phone</label>
            <input
              type="text"
              value={editData.phone}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
            />

            <label>Birth Date</label>
            <input
              type="date"
              value={editData.birthDate}
              onChange={(e) =>
                setEditData({ ...editData, birthDate: e.target.value })
              }
            />

            <h3>Connected Companies</h3>

            {Object.keys(editData.companies).map((key) => (
              <React.Fragment key={key}>
                <label>{key}</label>
                <input
                  type="text"
                  value={editData.companies[key]}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      companies: {
                        ...editData.companies,
                        [key]: e.target.value,
                      },
                    })
                  }
                />
              </React.Fragment>
            ))}

            <div className={styles.modalButtons}>
              <button className={styles.saveBtn} onClick={handleSave}>
                Save Changes
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
