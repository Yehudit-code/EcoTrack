"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import { useUserStore } from "@/store/useUserStore";

const ConsumptionGraph = dynamic(
  () => import("@/app/components/ConsumptionGraph"),
  { ssr: false }
);

type User = {
  _id?: string;
  name: string;
  phone?: string;
  email: string;
  photo?: string;
  improvementScore?: number;
  talked?: boolean;
  value?: number;
  valuesByMonth?: { month: number; year: number; value: number }[];
};

export default function DisplayUsersPage() {
const currentUser = useUserStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.companyCategory) {
      setCategory(currentUser.companyCategory);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!category) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/company/users?category=${category}`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users?.slice(0, 3) || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [category]);

  const memoUsers = useMemo(() => users, [users]);

  const toggleTalk = async (email: string) => {
    try {
      const res = await fetch(
        `/api/company/users/${encodeURIComponent(email)}/talked`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Failed to update talk status");

      if (category) {
        const refresh = await fetch(`/api/company/users?category=${category}`);
        if (refresh.ok) {
          const data = await refresh.json();
          setUsers(data.users?.slice(0, 3) || []);
        }
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  if (loading) return <p className={styles.loading}>Loading users...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (!category) return <p className={styles.error}>Company category missing.</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Top users in category: {category}</h1>

      <div className={styles.userList}>
        {memoUsers.length === 0 ? (
          <p className={styles.noUsers}>No users found.</p>
        ) : (
          memoUsers.map((user) => (
            <div key={user.email} className={styles.card}>
              <div className={styles.userHeader} onClick={() => openModal(user)}>
                <img
                  src={user.photo || "/default-user.png"}
                  alt={user.name}
                  className={styles.avatar}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.src.includes("default-user.png")) {
                      img.src = "/default-user.png";
                    }
                  }}
                />
                <div>
                  <p className={styles.userName}>{user.name}</p>
                  <p className={styles.userInfo}>{user.phone}</p>
                  <p className={styles.userInfo}>{user.email}</p>
                  <p className={styles.userInfo}>Current consumption: {user.value ?? "—"}</p>
                </div>
              </div>

              <div className={styles.graphBox}>
                <ConsumptionGraph
                  data={(user.valuesByMonth || []).map((v) => ({
                    month: v.month.toString(),
                    value: v.value,
                  }))}
                />
              </div>

              <button
                className={`${styles.talkButton} ${
                  user.talked ? styles.talked : styles.notTalked
                }`}
                onClick={() => toggleTalk(user.email)}
              >
                {user.talked ? "Talked ✓" : "Mark as Talked"}
              </button>
            </div>
          ))
        )}
      </div>

      {modalOpen && selectedUser && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{selectedUser.name}</h2>
            <p>{selectedUser.phone}</p>
            <p>{selectedUser.email}</p>
            <p>Current consumption: {selectedUser.value ?? "—"}</p>

            <div className={styles.modalGraph}>
              <ConsumptionGraph
                data={(selectedUser.valuesByMonth || []).map((v) => ({
                  month: v.month.toString(),
                  value: v.value,
                }))}
              />
            </div>

            <button className={styles.proposalBtn}>
              Create Payment Proposal
            </button>

            <button className={styles.closeBtn} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
