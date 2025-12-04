"use client";

import React, { useState, useEffect } from "react";

const DisplayUser2 = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  // לא צריך קטגוריה כלל
  useEffect(() => {
    setCategory(null);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/company/users?all=true`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        console.log('API /api/company/users?all=true response:', data);
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <p>טוען נתונים...</p>;
  if (error) return <p>שגיאה: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">כל הנתונים מטבלת Consumptionhabits (ללא סינון)</h1>
      <ul>
        {users.length === 0 ? (
          <li>לא נמצאו נתונים בטבלה.</li>
        ) : (
          users.map((user, idx) => (
            <li key={user._id || idx} style={{direction: 'ltr', marginBottom: '16px', background: '#f9f9f9', padding: '8px', borderRadius: '8px'}}>
              <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{JSON.stringify(user, null, 2)}</pre>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default DisplayUser2;
