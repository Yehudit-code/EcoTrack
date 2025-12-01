/* ----------------------------------------
    Types
---------------------------------------- */

export interface UserBasicDto {
  _id: string;
  email: string;
  name?: string;
  country?: string;
  createdAt?: string;
}

export interface UserConsumptionSummary {
  category: string;
  totalValue: number;
  avgValue: number;
}

export interface UserDetailsResponse {
  user: UserBasicDto;
  consumption: UserConsumptionSummary[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  extra?: any;
}

const API_BASE = "/api/company/users";

async function handleResponse<T>(res: Response): Promise<T> {
  const json: ApiResponse<T> = await res.json();

  if (!res.ok || json.success === false) {
    const msg = json.message || "Request failed";
    throw new Error(msg);
  }

  return json.data as T;
}

/* ----------------------------------------
    FETCH: Get user details + summary
    GET /api/company/users/:userId/details
---------------------------------------- */
export async function fetchUserDetails(
  userId: string
): Promise<UserDetailsResponse> {
  const res = await fetch(`${API_BASE}/${userId}/details`, {
    method: "GET",
    cache: "no-store",
  });

  return handleResponse<UserDetailsResponse>(res);
}
