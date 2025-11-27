"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Profile.module.css";

// אייקונים מקצועיים
import {
  ArrowLeft,
  LogOut,
  Mail,
  Phone,
  User,
  Calendar,
  Building2,
  Edit3,
  Factory,
  Droplet,
  Bus,
  Recycle,
  Sun,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
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

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const handleSave = async () => {
    try {
      const updatedUser = { ...user, ...editData };

      const response = await fetch("/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update: " + data.error);
      }
    } catch (error) {
      alert("Error updating profile");
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
          <img
            src={user.photo || "/images/default-profile.png"}
            alt="Profile"
            className={styles.profileImg}
          />

          <div className={styles.userInfo}>
            <h2>{user.name}</h2>

            <p className={styles.email}>
              <Mail size={16} /> {user.email}
            </p>

            <p className={styles.role}>
              <User size={16} />
              {user.role === "company" ? " Company Account" : " Individual User"}
            </p>
          </div>
        </div>

        {/* תוכן */}
        <div className={styles.content}>
          {/* פרטים אישיים */}
          <div className={styles.section}>
            <h3>Personal Information</h3>

            <div className={styles.row}>
              <Phone size={18} />
              <span>Phone:</span>
              <strong>{user.phone || "Not provided"}</strong>
            </div>

            <div className={styles.row}>
              <Calendar size={18} />
              <span>Birth Date:</span>
              <strong>{user.birthDate || "—"}</strong>
            </div>

            <div className={styles.row}>
              <Calendar size={18} />
              <span>Member Since:</span>
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

          {/* חברות */}
          <div className={styles.section}>
            <h3>Connected Companies</h3>

            <div className={styles.companyList}>
              <div className={styles.row}>
                <Factory size={18} />
                Electricity: <strong>{c.electricity || "Not connected"}</strong>
              </div>

              <div className={styles.row}>
                <Droplet size={18} />
                Water: <strong>{c.water || "Not connected"}</strong>
              </div>

              <div className={styles.row}>
                <Bus size={18} />
                Transport: <strong>{c.transport || "Not connected"}</strong>
              </div>

              <div className={styles.row}>
                <Recycle size={18} />
                Recycling: <strong>{c.recycling || "Not connected"}</strong>
              </div>

              <div className={styles.row}>
                <Sun size={18} />
                Solar: <strong>{c.solar || "Not connected"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* מודאל עריכה — יישאר שלך */}
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
              value={editData.phone || ""}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
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

            <label>Electricity</label>
            <input
              type="text"
              value={editData.companies?.electricity || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  companies: { ...editData.companies, electricity: e.target.value },
                })
              }
            />

            <label>Water</label>
            <input
              type="text"
              value={editData.companies?.water || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  companies: { ...editData.companies, water: e.target.value },
                })
              }
            />

            <label>Transport</label>
            <input
              type="text"
              value={editData.companies?.transport || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  companies: { ...editData.companies, transport: e.target.value },
                })
              }
            />

            <label>Recycling</label>
            <input
              type="text"
              value={editData.companies?.recycling || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  companies: { ...editData.companies, recycling: e.target.value },
                })
              }
            />

            <label>Solar</label>
            <input
              type="text"
              value={editData.companies?.solar || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  companies: { ...editData.companies, solar: e.target.value },
                })
              }
            />

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
