export interface HabitDoc {
  userEmail: string;
  month: number;
  year: number;
  value: number;
}

export type LeanUser = {
  _id: any;
  email: string;
  name?: string;
  phone?: string;
  photo?: string;
  improvementScore?: number;
  talkedByCompanies?: Record<string, boolean>;
};
