export async function fetchUsersByCategory(category: string) {
  const res = await fetch(`/api/company/users?category=${category}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return data.users || [];
}

export async function toggleUserTalkStatus(email: string) {
  const res = await fetch(
    `/api/company/users/${encodeURIComponent(email)}/talked`,
    { method: "PATCH" }
  );
  if (!res.ok) throw new Error("Failed to update talk status");
}
