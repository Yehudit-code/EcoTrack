"use client";

import React from "react";
import styles from "@/app/profile/page.module.css";

export default function ProfileModal({ editData, setEditData, onSave, onCancel }: any) {
  const fields = ["electricity", "water", "transport", "recycling", "solar"];

  return (
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
