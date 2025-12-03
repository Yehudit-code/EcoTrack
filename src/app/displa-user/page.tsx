"use client";

import React, { useState, useEffect } from "react";
import styles from "./SocialSharing.module.css";
import dynamic from "next/dynamic";

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
  maxValue?: number;
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
  const toggleTalk = async (email: string) => {
    try {
      const res = await fetch(`/api/company/users/${encodeURIComponent(email)}/talked`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to update talk status");
      // אחרי עדכון, רענן את רשימת המשתמשים מהשרת כדי לקבל את הערך החדש
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

  if (loading) return <p>טוען משתמשים...</p>;
  if (error) return <p>שגיאה: {error}</p>;
  if (!category) return <p>לא נבחרה קטגוריה עבור החברה שלך.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">המשתמשים המובילים בקטגוריה: {category}</h1>

      {/* רשימת משתמשים */}
      <div className="flex flex-col gap-8 items-center w-full max-w-2xl mx-auto">
        {users.length === 0 ? (
          <p className="w-full text-center">לא נמצאו משתמשים בקטגוריה זו.</p>
        ) : (
          users.map((user) => (
            <div
              key={user.email}
              className="flex flex-col w-full bg-white shadow rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition-all border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4" onClick={() => openModal(user)}>
                <img
                  src={user.photo || "/default-user.png"}
                  alt={user.name}
                  className="w-16 h-16 rounded-full border border-gray-300"
                  onError={e => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== window.location.origin + "/default-user.png") {
                      target.src = "/default-user.png";
                    }
                  }}
                />
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-700">צריכה נוכחית: {user.value ?? '—'}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="w-full flex items-center justify-center">
                  <div className="w-40 h-16 flex items-center justify-center">
                    <ConsumptionGraph data={(user.valuesByMonth || []).map(v => ({ month: v.month.toString(), value: v.value }))} />
                  </div>
                </div>
                <button
                  className={`mt-2 px-4 py-1 rounded-full font-semibold shadow transition-colors duration-200 text-white ${
                    user.talked ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                  onClick={() => toggleTalk(user.email)}
                >
                  {user.talked ? "Talked ✓" : "Mark as Talked"}
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
            <p>צריכה נוכחית: {selectedUser.value ?? '—'}</p>
            <div className="mt-4 w-full h-32 bg-gray-100 rounded flex items-center justify-center">
              <ConsumptionGraph data={(selectedUser.valuesByMonth || []).map(v => ({ month: v.month.toString(), value: v.value }))} />
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
