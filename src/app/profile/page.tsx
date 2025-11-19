"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setEditData({
        ...parsed,
        companies: parsed.companies || {
          electricity: "",
          water: "",
          transport: "",
          recycling: "",
          solar: "",
        },
      });
    }
  }, []);

  const handleSave = async () => {
    try {
      const updatedUser = { ...user, ...editData };

      // שליחה לשרת
      const response = await fetch("/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        alert("✅ Profile updated successfully!");
      } else {
        alert("❌ Failed to update: " + data.error);
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert("❌ Error updating profile");
    }
  };


  if (!user) return <p className={styles.loading}>Loading profile...</p>;

  const c = user.companies || {};

  return (
    <div className={styles.profilePage}>
      {/* חזרה אחורה */}
      <button onClick={() => router.back()} className={styles.backButton}>
        ⬅ Back
      </button>

      <div className={styles.profileCard}>
        {/* תמונת פרופיל + פרטים */}
        <div className={styles.headerSection}>
          <img
            src={user.photo || "/images/default-profile.png"}
            alt="Profile"
            className={styles.profileImg}
          />
          <div className={styles.userInfo}>
            <h2>{user.name}</h2>
            <p className={styles.email}>{user.email}</p>
            <p className={styles.role}>
              {user.role === "company" ? "Company Account" : "Individual User"}
            </p>
          </div>
        </div>

        {/* פרטים כלליים */}
        <div className={styles.content}>
          {/* פרטים אישיים */}
          <div className={styles.detailsSection}>
            <h3>Personal Information</h3>
            <div className={styles.detailsGrid}>
              <div>
                <span className={styles.label}>📞 Phone:</span>
                <span className={styles.value}>{user.phone || "Not provided"}</span>
              </div>
              <div>
                <span className={styles.label}>🎂 Birth Date:</span>
                <span className={styles.value}>{user.birthDate || "—"}</span>
              </div>
              <div>
                <span className={styles.label}>📅 Member Since:</span>
                <span className={styles.value}>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div>
                <span className={styles.label}>👤 Role:</span>
                <span className={styles.value}>{user.role || "user"}</span>
              </div>
            </div>

            <button
              className={styles.editBtn}
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Profile
            </button>
          </div>

          {/* חברות לפי קטגוריה */}
          <div className={styles.companySection}>
            <h3>Connected Companies</h3>
            <div className={styles.companyCategory}>
              <p>⚡ Electricity: <span>{c.electricity || "Not connected"}</span></p>
              <p>💧 Water: <span>{c.water || "Not connected"}</span></p>
              <p>🚗 Transport: <span>{c.transport || "Not connected"}</span></p>
              <p>♻️ Recycling: <span>{c.recycling || "Not connected"}</span></p>
              <p>☀️ Solar: <span>{c.solar || "Not connected"}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* חלון עריכה */}
      {isEditing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h2>Edit Profile</h2>

            <label>Full Name</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />

            <label>Phone</label>
            <input
              type="text"
              value={editData.phone || ""}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />

            <label>Birth Date</label>
            <input
              type="date"
              value={editData.birthDate || ""}
              onChange={(e) =>
                setEditData({ ...editData, birthDate: e.target.value })
              }
            />

            <h3>Connected Companies</h3>
            <div className={styles.companyInputs}>
              <label>⚡ Electricity Company</label>
              <input
                type="text"
                placeholder="Enter company name"
                value={editData.companies?.electricity || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    companies: {
                      ...editData.companies,
                      electricity: e.target.value,
                    },
                  })
                }
              />

              <label>💧 Water Company</label>
              <input
                type="text"
                placeholder="Enter water supplier"
                value={editData.companies?.water || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    companies: { ...editData.companies, water: e.target.value },
                  })
                }
              />

              <label>🚗 Transport Service</label>
              <input
                type="text"
                placeholder="Enter transport company"
                value={editData.companies?.transport || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    companies: { ...editData.companies, transport: e.target.value },
                  })
                }
              />

              <label>♻️ Recycling Service</label>
              <input
                type="text"
                placeholder="Enter recycling provider"
                value={editData.companies?.recycling || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    companies: { ...editData.companies, recycling: e.target.value },
                  })
                }
              />

              <label>☀️ Solar Energy Company</label>
              <input
                type="text"
                placeholder="Enter solar company"
                value={editData.companies?.solar || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    companies: { ...editData.companies, solar: e.target.value },
                  })
                }
              />
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.saveBtn} onClick={handleSave}>
                💾 Save Changes
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsEditing(false)}
              >
                ✖ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
