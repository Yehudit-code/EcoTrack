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
    FETCH by email + optional category + month + year
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
    Create new consumption with selected month/year
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
    Update existing document
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
