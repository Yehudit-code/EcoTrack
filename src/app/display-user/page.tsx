"use client";

import CompanyHeader from "../components/CompanyHeader/CompanyHeader";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";

import styles from "./DisplayUsers.module.css";
import LeafSpinner from "../components/Loading/LeafSpinner";
const ConsumptionGraph = dynamic(() => import("../components/ConsumptionGraph"), { ssr: false });

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

const DisplayUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCategory(user.companyCategory || null);
      } catch {
        setCategory(null);
      }
    } else {
      setCategory(null);
    }
  }, []);

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

  const toggleTalk = async (email: string, currentTalked?: boolean) => {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talked: !currentTalked })
      });

      if (!res.ok) throw new Error("Failed to update talk status");

      if (category) {
        const usersRes = await fetch(`/api/company/users?category=${category}`);
        if (usersRes.ok) {
          const data = await usersRes.json();
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

  if (loading) return <LeafSpinner />;
  if (error) return <p>Error: {error}</p>;
  if (!category) return <p>No category selected for your company.</p>;

  return (
    <>
      <CompanyHeader />

      <div className={styles.pageWrapper}>
        <div className={styles.topIconArea}>
          <Link href="/requests">
            <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
          </Link>
        </div>

        <h1 className={styles.pageTitle}>Top users in category: {category}</h1>

        <div className={styles.userList}>
          {users.length === 0 ? (
            <p>No users found in this category.</p>
          ) : (
            users.map((user) => (
              <div
                key={user.email}
                className={styles.userCard}
              >
                <div className={styles.userHeader} onClick={() => openModal(user)}>
                  <img
                    src={user.photo || "/default-user.png"}
                    alt={user.name}
                    className={styles.userImg}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== window.location.origin + "/default-user.png") {
                        target.src = "/default-user.png";
                      }
                    }}
                  />

                  <div>
                    <p className={styles.userName}>{user.name}</p>
                    <p className={styles.userDetail}>{user.phone}</p>
                    <p className={styles.userDetail}>{user.email}</p>
                  </div>
                </div>

                <div className={styles.graphWrapper}>
                  <div className={styles.graphContainer}>
                    <ConsumptionGraph
                      data={(user.valuesByMonth || []).map((v) => ({
                        month: v.month.toString(),
                        value: v.value
                      }))}
                    />
                  </div>

                  <button
                    className={`${styles.button} ${
                      user.talked ? styles.btnContacted : styles.btnNotContacted
                    }`}
                    onClick={() => toggleTalk(user.email, user.talked)}
                  >
                    {user.talked ? "Contacted" : "Not Contacted"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {modalOpen && selectedUser && (
          <div className={styles.modalBackdrop} onClick={closeModal}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>{selectedUser.name}</h2>

              <p>Phone: {selectedUser.phone}</p>
              <p>Email: {selectedUser.email}</p>

              <div className={styles.modalGraph}>
                <ConsumptionGraph
                  data={(selectedUser.valuesByMonth || []).map((v) => ({
                    month: v.month.toString(),
                    value: v.value
                  }))}
                />
              </div>

              <button className={styles.modalBtnPrimary}>
                Create Payment Proposal
              </button>

              <button className={styles.modalBtnSecondary} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DisplayUsersPage;
