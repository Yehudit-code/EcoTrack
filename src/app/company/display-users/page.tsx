"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useUserStore } from "@/store/useUserStore";
import UsersList from "./components/UsersList";
import {
  fetchUsersByCategory,
  toggleUserTalkStatus,
} from "@/app/services/client/company/userDisplayService";
import CompanyHeader from "@/app/components/CompanyHeader/CompanyHeader";
import LeafSpinner from "@/app/components/Loading/LeafSpinner";
import { useRouter } from "next/navigation";


export default function DisplayUsersPage() {
  const currentUser = useUserStore((state) => state.user);

  const [category, setCategory] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (currentUser?.companyCategory) {
      setCategory(currentUser.companyCategory);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!category) return;

    const load = async () => {
      setLoading(true);
      try {
        const allUsers = await fetchUsersByCategory(category);
        setUsers(allUsers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category]);

  const handleToggleTalk = async (email: string) => {
    try {
      const { talked } = await toggleUserTalkStatus(email);

      setUsers((prev) =>
        prev.map((u) =>
          u.email === email ? { ...u, talked } : u
        )
      );
    } catch (err: any) {
      alert(err.message || "Error updating talk status");
    }
  };

  if (loading) return <LeafSpinner />;
  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (!category) return <p className={styles.error}>Company category missing.</p>;

  return (
    <div className={styles.container}>
      <CompanyHeader />
      <div className={styles.topActions}>
        <button
          className={styles.offersLink}
          onClick={() => router.push("/company/requests")}
        >
          Offers
        </button>
      </div>

      <h1 className={styles.title}>Top users in category: {category}</h1>

      <UsersList
        users={users}
        onToggleTalk={handleToggleTalk}
      />
    </div>
  );
}
