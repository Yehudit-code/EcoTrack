"use client";

import React from "react";
import styles from "@/app/profile/page.module.css";

export default function ProfileModal({ editData, setEditData, onSave, onCancel, role }: any) {
  const fields = ["electricity", "water", "transport", "recycling", "solar"];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h2>Edit Profile</h2>

        {/* Name */}
        <label>Full Name</label>
        <input
          type="text"
          value={editData.name}
          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
        />

        {/* Phone */}
        <label>Phone</label>
        <input
          type="text"
          value={editData.phone || ""}
          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
        />

        {/* ❌ לא מציגים תאריך לידה לחברות */}
        {role === "user" && (
          <>
            <label>Birth Date</label>
            <input
              type="date"
              value={editData.birthDate || ""}
              onChange={(e) =>
                setEditData({ ...editData, birthDate: e.target.value })
              }
            />
          </>
        )}

        {/* ❌ לחברה לא מציגים חיבורי חברות */}
        {role === "user" && (
          <>
            <h3>Connected Companies</h3>

            {fields.map((f) => (
              <div key={f}>
                <label>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                <input
                  type="text"
                  value={editData.companies?.[f] || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      companies: {
                        ...editData.companies,
                        [f]: e.target.value,
                      },
                    })
                  }
                />
              </div>
            ))}
          </>
        )}

        {/* ⭐ פרטי בנק — רק לחברה */}
        {role === "company" && (
          <>
            <h3>Bank Account Details</h3>

            <label>Bank Name</label>
            <input
              type="text"
              value={editData.bankName || ""}
              onChange={(e) => setEditData({ ...editData, bankName: e.target.value })}
            />

            <label>Branch Number</label>
            <input
              type="text"
              value={editData.branch || ""}
              onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
            />

            <label>Account Number</label>
            <input
              type="text"
              value={editData.accountNumber || ""}
              onChange={(e) => setEditData({ ...editData, accountNumber: e.target.value })}
            />

            <label>Account Owner</label>
            <input
              type="text"
              value={editData.accountOwner || ""}
              onChange={(e) => setEditData({ ...editData, accountOwner: e.target.value })}
            />
          </>
        )}

        <div className={styles.modalButtons}>
          <button className={styles.saveBtn} onClick={onSave}>
            Save Changes
          </button>

          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
