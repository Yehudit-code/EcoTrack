"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

import styles from "./Pay.module.css";

import { ArrowLeft, LogOut, Phone, Calendar, Edit3 } from "lucide-react";

import ProfileAvatar from "@/app/components/Profile/ProfileAvatar";
import ProfileInfo from "@/app/components/Profile/ProfileInfo";
import ProfileCompanies from "@/app/components/Profile/ProfileCompanies";
import ProfileModal from "@/app/components/Profile/ProfileModal";

import {
  getUserProposalsCount,
  updateUserProfile,
  logoutUser,
} from "@/app/services/client/profile/profileService";

export default function ProfilePage() {
  const router = useRouter();

  const currentUser = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s._hasHydrated);
  const logoutStore = useUserStore((s) => s.logout);
  const setUser = useUserStore((s) => s.setUser);

  const [editData, setEditData] = useState<any>({});
  const [proposalsCount, setProposalsCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  /* ---------- Load profile data ---------- */
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
      getUserProposalsCount(currentUser._id)
        .then(setProposalsCount)
        .catch(() => setProposalsCount(0));
    }
  }, [currentUser, hasHydrated]);

  if (!hasHydrated)
    return <p className={styles.loading}>Loading profile...</p>;

  if (!currentUser)
    return <p className={styles.loading}>No user data.</p>;

  /* ---------- Save profile ---------- */
  const handleSave = async () => {
    try {
      const updatedUser = { ...currentUser, ...editData };

      await updateUserProfile(updatedUser);

      setUser(updatedUser);
      setIsEditing(false);
    } catch {
      alert("Error updating profile");
    }
  };

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore server error, continue client cleanup
    }

    logoutStore();
    localStorage.removeItem("ecotrack-user");
    router.replace("/signIn");
  };

  return (
    <div className={styles.profilePage}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        <ArrowLeft size={20} /> Back
      </button>

      <button className={styles.logoutBtn} onClick={handleLogout}>
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

            <button
              className={styles.editBtn}
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

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
