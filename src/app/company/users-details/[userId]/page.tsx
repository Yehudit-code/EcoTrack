"use client";

import { useEffect, useState } from "react";
import SimpleLineChart from "@/app/components/charts/SimpleLineChart";

export default function UserDetailsPage({ params }: { params: { userId: string } }) {
  const { userId } = params;

  const [consumption, setConsumption] = useState([]);
  const [user, setUser] = useState<any>(null);
  const [companyCategory, setCompanyCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load selected user basic info
  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      setUser(data.user);
    };
    loadUser();
  }, [userId]);

  // Load filtered consumption by company's category
  useEffect(() => {
    const loadConsumption = async () => {
      setLoading(true);

      const companyEmail = localStorage.getItem("email"); // Logged company user
      if (!companyEmail) {
        console.error("No company email found in localStorage");
        setLoading(false);
        return;
      }

      try {
        // Fetch only relevant category (server automatically filters)
        const res = await fetch(
          `/api/user-consumption/${userId}?companyEmail=${companyEmail}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (data.success) {
          setCompanyCategory(data.companyCategory); // Set category returned by server

          // Map data for chart
          const mapped = data.data.map((d: any) => ({
            month: `${d.month}/${d.year}`,
            value: d.value,
          }));

          setConsumption(mapped);
        }
      } catch (err) {
        console.error("Failed to load filtered consumption", err);
      }

      setLoading(false);
    };

    loadConsumption();
  }, [userId]);

  return (
    <div>
      <h1>User Details</h1>

      {/* User info */}
      {user && (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Country:</strong> {user.country}</p>
        </div>
      )}

      {/* Show company category */}
      {companyCategory && (
        <p><strong>Category displayed:</strong> {companyCategory}</p>
      )}

      {/* Graph */}
      <div>
        {loading ? (
          <div>Loading chart...</div>
        ) : (
          <SimpleLineChart data={consumption} color="#3b6e3b" />
        )}
      </div>

      {/* Create offer */}
      <button
        onClick={() => (window.location.href = `/company/create-offer/${userId}`)}
      >
       Create offer payment-----
      </button>
    </div>
  );
}
