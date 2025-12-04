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
  ShoppingCart,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [proposalsCount, setProposalsCount] = useState<number>(0);

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
      // Fetch proposals count if user
      if (parsed.role === "user") {
        fetch(`/api/company-requests?userId=${parsed._id}`)
          .then(res => res.json())
          .then(data => setProposalsCount(Array.isArray(data) ? data.length : (data?.length || 0)))
          .catch(() => setProposalsCount(0));
      }
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
      {/* חזרה */}
      <button onClick={() => router.back()} className={styles.backBtn}>
        <ArrowLeft size={20} /> Back
      </button>

      {/* לוגאאוט */}
      <button onClick={handleLogout} className={styles.logoutBtn}>
        <LogOut size={18} /> Logout
      </button>

      <div className={styles.profileCard}>
        {/* כותרת */}
        <div className={styles.headerSection}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={user.photo || "/images/default-profile.png"}
              alt="Profile"
              className={styles.profileImg}
            />
            {user.role === "user" && (
              <div style={{ position: 'relative', marginLeft: 8, cursor: 'pointer' }} title="Proposals Inbox">
                <ShoppingCart size={32} color="#2e7d32" />
                {proposalsCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: '#e53935',
                    color: '#fff',
                    borderRadius: '50%',
                    padding: '2px 7px',
                    fontSize: 13,
                    fontWeight: 700,
                    minWidth: 22,
                    textAlign: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
                  }}>{proposalsCount}</span>
                )}
              </div>
            )}
          </div>
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
