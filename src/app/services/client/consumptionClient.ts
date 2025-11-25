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
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  extra?: string;
}

const API_BASE = "/api/consumption";

function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json: ApiResponse<T> = await res.json();

  if (!res.ok || json.success === false) {
    const msg = json.message || "Request failed";
    throw new Error(msg);
  }

  // ok() עוטף את הנתונים ב-data
  return (json.data as T) ?? (json as unknown as T);
}

export async function fetchUserConsumptionByEmail(
  userEmail: string,
  category?: ConsumptionCategory
): Promise<ConsumptionHabitDto[]> {
  const params = new URLSearchParams({ userEmail });
  if (category) params.append("category", category);

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  return handleResponse<ConsumptionHabitDto[]>(res);
}

export interface ConsumptionUpsertInput {
  _id?: string;
  userEmail: string;
  category: ConsumptionCategory;
  value: number;
}

export async function createConsumption(
  input: ConsumptionUpsertInput
): Promise<ConsumptionHabitDto> {
  const { month, year } = getCurrentMonthYear();

  const payload = {
    ...input,
    month,
    year,
  };

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<ConsumptionHabitDto>(res);
}

export async function updateConsumption(
  input: ConsumptionUpsertInput & { _id: string }
): Promise<ConsumptionHabitDto> {
  const { month, year } = getCurrentMonthYear();

  const payload = {
    ...input,
    month,
    year,
  };

  const res = await fetch(API_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<ConsumptionHabitDto>(res);
}
