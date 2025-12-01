"use client";

import React, { useState, useEffect } from "react";
import styles from "./SocialSharing.module.css";
import dynamic from "next/dynamic";

const ConsumptionGraph = dynamic(() => import("../components/ConsumptionGraph"), { ssr: false });

type User = {
  _id: string;
  name: string;
  phone?: string;
  email: string;
  photo?: string;
  improvementScore?: number;
  talked?: boolean;
};


const DisplayUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  // קבלת הקטגוריה של החברה מהמשתמש המחובר
  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
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

  // הבאת המשתמשים עם הערך הגבוה ביותר בקטגוריה שנבחרה
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

  // 🔹 Toggle Talked state
  const toggleTalk = async (id: string) => {
    try {
      const res = await fetch(`/api/company/users/${id}/talked`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to update talk status");
      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, talked: data.talked } : u
        )
      );
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

  if (loading) return <p>טוען משתמשים...</p>;
  if (error) return <p>שגיאה: {error}</p>;
  if (!category) return <p>לא נבחרה קטגוריה עבור החברה שלך.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">המשתמשים המובילים בקטגוריה: {category}</h1>

      {/* רשימת משתמשים */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <p>לא נמצאו משתמשים בקטגוריה זו.</p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-4" onClick={() => openModal(user)}>
                <img
                  src={user.photo || "/default-user.png"}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border border-gray-300"
                />
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 min-w-[120px]">
                {/* גרף צריכה אמיתי - כאן יש להחליף לדאטה אמיתית */}
                <div className="w-28 h-12 bg-gray-100 rounded flex items-center justify-center">
                  <ConsumptionGraph data={[
                    { month: "9", value: user.improvementScore || 0 },
                    { month: "10", value: (user.improvementScore || 0) + 5 },
                    { month: "11", value: (user.improvementScore || 0) + 2 }
                  ]} />
                </div>
                <button
                  className={`px-4 py-1 rounded-full font-semibold shadow transition-colors duration-200 text-white ${
                    user.talked ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                  onClick={() => toggleTalk(user._id)}
                >
                  {user.talked ? "דיברתי ✓" : "דברתי"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">{selectedUser.name}</h2>
            <p>טלפון: {selectedUser.phone}</p>
            <p>מייל: {selectedUser.email}</p>
            <div className="mt-4 w-full h-32 bg-gray-100 rounded flex items-center justify-center">
              <ConsumptionGraph data={[
                { month: "9", value: selectedUser.improvementScore || 0 },
                { month: "10", value: (selectedUser.improvementScore || 0) + 5 },
                { month: "11", value: (selectedUser.improvementScore || 0) + 2 }
              ]} />
            </div>
            <button
              className="mt-4 w-full bg-green-500 text-white py-2 rounded font-semibold"
              onClick={() => alert("מעבר לדף יצירת הצעה")}
            >
              צור הצעת תשלום
            </button>
            <button
              className="mt-2 w-full bg-gray-300 text-black py-2 rounded"
              onClick={closeModal}
            >
              סגור
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayUsersPage;
