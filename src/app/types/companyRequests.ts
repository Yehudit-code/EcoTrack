export interface CompanyRequestItem {
  _id: string;
  productName: string;
  price: number;
  status: "sent" | "paid" | "declined";
  userId: string;
  userData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}


