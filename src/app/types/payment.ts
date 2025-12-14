export interface PaymentDto {
  _id: string;
  amount: number;
  status: string;
  productName: string;
  companyName: string;
  userName: string;
  userEmail: string;
  userId: string;
  fullUser?: any;
}
