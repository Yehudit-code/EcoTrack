import type { PaymentDto } from "@/app/types/payment";

/**
 * Fetch payment details by payment id
 */
export async function getPaymentById(
  paymentId: string
): Promise<PaymentDto> {
  const res = await fetch(`/api/payments/${paymentId}`);

  if (!res.ok) {
    throw new Error("Failed to load payment");
  }

  return res.json();
}

/**
 * Confirm payment
 */
export async function confirmPayment(
  paymentId: string
): Promise<void> {
  const res = await fetch("/api/payments/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  });

  if (!res.ok) {
    throw new Error("Payment confirmation failed");
  }
}
