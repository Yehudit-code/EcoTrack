"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

import styles from "./page.module.css";

import { ArrowLeft, LogOut, Phone, Calendar, Edit3 } from "lucide-react";

import ProfileAvatar from "@/app/components/Profile/ProfileAvatar";
import ProfileInfo from "@/app/components/Profile/ProfileInfo";
import ProfileCompanies from "@/app/components/Profile/ProfileCompanies";
import ProfileModal from "@/app/components/Profile/ProfileModal";

export default function ProfilePage() {
  const router = useRouter();

  const currentUser = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s._hasHydrated);
  const logout = useUserStore((s) => s.logout);
  const setUser = useUserStore((s) => s.setUser);

  const [editData, setEditData] = useState<any>({});
  const [proposalsCount, setProposalsCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Load data once hydrated
  useEffect(() => {
    if (!hasHydrated || !currentUser) return;

    setEditData({
      ...currentUser,
      companies: currentUser.companies || {
        electricity: "",
        water: "",
        transport: "",
        recycling: "",
        solar: "",
      },
    });

    if (currentUser.role === "user") {
      fetch(`/api/company-requests?userId=${currentUser._id}`)
        .then((res) => res.json())
        .then((data) => setProposalsCount(Array.isArray(data) ? data.length : 0));
    }
  }, [currentUser, hasHydrated]);

  if (!hasHydrated)
    return <p className={styles.loading}>Loading profile...</p>;

  if (!currentUser)
    return <p className={styles.loading}>No user data.</p>;

  const handleSave = async () => {
    try {
      const updatedUser = { ...currentUser, ...editData };

      const res = await fetch("/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) {
        alert("Failed to update profile");
        return;
      }

      setUser(updatedUser);
      setIsEditing(false);
    } catch {
      alert("Error updating profile");
    }
  };

  return (
    <div className={styles.profilePage}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        <ArrowLeft size={20} /> Back
      </button>

      <button
        className={styles.logoutBtn}
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        <LogOut size={18} /> Logout
      </button>

      <div className={styles.profileCard}>
        <div className={styles.headerSection}>
          <ProfileAvatar
            photo={currentUser.photo}
            role={currentUser.role}
            proposalsCount={proposalsCount}
          />

          <ProfileInfo user={currentUser} />
        </div>

        <div className={styles.content}>
          {/* Personal info */}
          <div className={styles.section}>
            <h3>Personal Information</h3>

            <div className={styles.row}>
              <Phone size={18} /> Phone:
              <strong>{currentUser.phone || "Not provided"}</strong>
            </div>

            <div className={styles.row}>
              <Calendar size={18} /> Birth Date:
              <strong>{currentUser.birthDate || "—"}</strong>
            </div>

            <div className={styles.row}>
              <Calendar size={18} /> Member Since:
              <strong>
                {currentUser.createdAt
                  ? new Date(currentUser.createdAt).toLocaleDateString()
                  : "—"}
              </strong>
            </div>

            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

          {/* Companies */}
          <ProfileCompanies companies={currentUser.companies} />
        </div>
      </div>

      {isEditing && (
        <ProfileModal
          editData={editData}
          setEditData={setEditData}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
