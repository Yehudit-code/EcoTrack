import type { CompanyRequestItem } from "@/app/types/companyRequests";

export async function fetchCompanyRequests(
  companyId: string
): Promise<CompanyRequestItem[]> {
  const res = await fetch(
    `/api/company-requests?companyId=${companyId}`,
    { credentials: "include" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch company requests");
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
