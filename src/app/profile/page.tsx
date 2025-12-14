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
  const logoutStore = useUserStore((s) => s.logout);
  const setUser = useUserStore((s) => s.setUser);

  const [editData, setEditData] = useState<any>({});
  const [proposalsCount, setProposalsCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

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
        .then((data) =>
          setProposalsCount(Array.isArray(data) ? data.length : 0)
        );
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

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}

    logoutStore();
    localStorage.removeItem("ecotrack-user");

    // Redirect to sign-in
    router.replace("/");
  };

  return (
    <div className={styles.pageBackground}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        <ArrowLeft size={20} /> Back
      </button>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <LogOut size={18} /> Logout
      </button>

      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>

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

            {/* PERSONAL INFO */}
            <div className={styles.section}>
              <h3>Personal Information</h3>

              <div className={styles.row}>
                <Phone size={18} /> Phone:
                <strong>{currentUser.phone || "Not provided"}</strong>
              </div>

              {/* hide birth date for companies */}
              {currentUser.role === "user" && (
                <div className={styles.row}>
                  <Calendar size={18} /> Birth Date:
                  <strong>{currentUser.birthDate || "—"}</strong>
                </div>
              )}

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

            {/* COMPANIES — only for users */}
            {currentUser.role === "user" && (
              <ProfileCompanies
                companies={currentUser.companies}
                role={currentUser.role}
              />
            )}

            {/* BANK INFO — only for company */}
            {currentUser.role === "company" && (
              <div className={styles.section}>
                <h3>Bank Account Details</h3>

                <div className={styles.row}>
                  Bank Name:
                  <strong>{currentUser.bankName || "Not provided"}</strong>
                </div>

                <div className={styles.row}>
                  Branch:
                  <strong>{currentUser.branch || "Not provided"}</strong>
                </div>

                <div className={styles.row}>
                  Account Number:
                  <strong>{currentUser.accountNumber || "Not provided"}</strong>
                </div>

                <div className={styles.row}>
                  Account Owner:
                  <strong>{currentUser.accountOwner || "Not provided"}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <ProfileModal
          editData={editData}
          setEditData={setEditData}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          role={currentUser.role}
        />
      )}
    </div>
  );
}
