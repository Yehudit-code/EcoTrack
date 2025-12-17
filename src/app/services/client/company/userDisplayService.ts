// src/app/services/client/company/userDisplayService.ts

export async function fetchUsersByCategory(category: string) {
  const res = await fetch(`/api/company/users?category=${encodeURIComponent(category)}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();
  return data.users || [];
}

export async function toggleUserTalkStatus(email: string): Promise<{ talked: boolean }> {
  const res = await fetch(
    `/api/company/users/${encodeURIComponent(email)}/talked`,
    { method: "PATCH" }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update talk status");
  }

  const data = await res.json();
  return { talked: data.talked };
}
