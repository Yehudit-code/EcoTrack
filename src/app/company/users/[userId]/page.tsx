"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUserDetails } from "@/app/services/client/company";

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<any>(null);
  const [consumption, setConsumption] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function load() {
      try {
        const result = await fetchUserDetails(userId);
        setUser(result.user);
        setConsumption(result.consumption);
      } catch (error) {
        console.error("Failed to load user details:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <main className="min-h-screen px-10 py-8 bg-[#fdfbf4]">
      <h1 className="text-2xl font-bold mb-6 text-emerald-800">
        User Details
      </h1>

      {/* User Info */}
      <section className="mb-8 rounded-xl bg-white shadow p-6 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-emerald-900">
          Basic Information
        </h2>
        <p><strong>Email:</strong> {user.email}</p>
        {user.country && <p><strong>Country:</strong> {user.country}</p>}
      </section>

      {/* Consumption */}
      <section className="mb-8 rounded-xl bg-white shadow p-6">
        <h2 className="text-lg font-semibold text-emerald-900 mb-4">
          Consumption Summary
        </h2>

        {consumption.length === 0 ? (
          <p>No consumption data yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Category</th>
                <th className="py-2">Total</th>
                <th className="py-2">Average</th>
              </tr>
            </thead>
            <tbody>
              {consumption.map((item) => (
                <tr key={item.category} className="border-b">
                  <td className="py-2">{item.category}</td>
                  <td className="py-2">{item.totalValue}</td>
                  <td className="py-2">
                    {item.avgValue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Offer button */}
      <section className="flex justify-end">
        <a
          href={`/company/offers/create?userId=${userId}`}
          className="px-6 py-3 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
        >
          Create Payment Offer
        </a>
      </section>
    </main>
  );
}
