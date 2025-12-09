export type ConsumptionCategory =
  | "Water"
  | "Electricity"
  | "Gas"
  | "Transportation"
  | "Waste";

export interface ConsumptionHabitDto {
  _id?: string;
  userEmail: string;
  category: ConsumptionCategory;
  value: number;
  month: number;
  year: number;
  previousValue?: number;
  improvementScore?: number;
  savingPercent?: number;
  tipsGiven?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  extra?: any;
}

const API_BASE = "/api/consumption";

/* ----------------------------------------
    Handle Server Responses
---------------------------------------- */
async function handleResponse<T>(res: Response): Promise<T> {
  const json: ApiResponse<T> = await res.json();

  if (!res.ok || json.success === false) {
    const msg = json.message || "Request failed";
    throw new Error(msg);
  }

  return json.data as T;
}

/* ----------------------------------------
    FETCH consumption by email + filters
---------------------------------------- */
export async function fetchUserConsumptionByEmail(
  userEmail: string,
  category?: ConsumptionCategory,
  month?: number,
  year?: number
): Promise<ConsumptionHabitDto[]> {
  const params = new URLSearchParams({ userEmail });

  if (category) params.append("category", category);
  if (month) params.append("month", String(month));
  if (year) params.append("year", String(year));

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  return handleResponse<ConsumptionHabitDto[]>(res);
}

/* ----------------------------------------
    Create new consumption
---------------------------------------- */
export interface ConsumptionUpsertInput {
  _id?: string;
  userEmail: string;
  category: ConsumptionCategory;
  value: number;
  month: number;
  year: number;
}

export async function createConsumption(
  input: ConsumptionUpsertInput
): Promise<ConsumptionHabitDto> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return handleResponse<ConsumptionHabitDto>(res);
}

/* ----------------------------------------
    Update existing consumption
---------------------------------------- */
export async function updateConsumption(
  input: ConsumptionUpsertInput & { _id: string }
): Promise<ConsumptionHabitDto> {
  const res = await fetch(API_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return handleResponse<ConsumptionHabitDto>(res);
}

/* ----------------------------------------
    NEW: Fetch consumption filtered by company category
---------------------------------------- */
export async function getFilteredConsumption(
  userId: string,
  companyEmail: string
): Promise<{
  data: ConsumptionHabitDto[];
  companyCategory: string;
}> {
  const res = await fetch(
    `/api/user-consumption/${userId}?companyEmail=${companyEmail}`,
    { cache: "no-store" }
  );

  const json = await res.json();

  if (!res.ok || json.success === false) {
    const msg = json.message || "Failed to fetch filtered consumption";
    throw new Error(msg);
  }

  return {
    data: json.data,
    companyCategory: json.companyCategory,
  };
}

// ----------------------------------------
// Fetch filtered user details for company dashboard
// ----------------------------------------
export async function fetchCompanyFilteredUserDetails(
  userId: string
): Promise<{
  user: any;
  consumption: any[];
  companyCategory: string;
}> {
  const res = await fetch(`/api/company/user-details/${userId}`, {
    method: "GET",
    credentials: "include", // חשוב ל-cookie ב-Vercel / דפדפן
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    const msg = json.message || "Failed to fetch user details";
    throw new Error(msg);
  }

  return {
    user: json.data.user,
    consumption: json.data.consumption,
    companyCategory: json.data.companyCategory,
  };
}
