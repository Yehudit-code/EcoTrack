import type { IUser } from "@/app/types/user";

/**
 * Get company proposals count for a user
 */
export async function getUserProposalsCount(
  userId: string
): Promise<number> {
  const res = await fetch(`/api/company-requests?userId=${userId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch proposals");
  }

  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  updatedUser: IUser
): Promise<IUser> {
  const res = await fetch("/api/update-profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedUser),
  });

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  return updatedUser;
}

/**
 * Logout user (invalidate server session)
 */
export async function logoutUser(): Promise<void> {
  const res = await fetch("/api/logout", { method: "POST" });

  if (!res.ok) {
    throw new Error("Logout failed");
  }
}
