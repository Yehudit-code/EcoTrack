export interface IUser {
  _id: string;
  email: string;
  role: "user" | "company";
  name?: string;
  phone?: string;
  birthDate?: string;
  photo?: string;
  createdAt?: string;

  companies?: {
    electricity?: string;
    water?: string;
    transport?: string;
    recycling?: string;
    solar?: string;
  };
}
