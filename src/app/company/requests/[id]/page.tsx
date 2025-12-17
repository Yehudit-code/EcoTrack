"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CreateRequest.module.css";
import emailjs from "@emailjs/browser";

import Toast from "@/app/components/Toast/Toast";
import { useUserStore } from "@/store/useUserStore";

export default function CreateRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  // Zustand user
  const currentUser = useUserStore((state) => state.user);

  // UI state
  const [user, setUser] = useState<any>(null);
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load user details (the target user, not company)
  useEffect(() => {
    async function loadUser() {
const res = await fetch(`/api/users/${id}`);

const raw = await res.text(); 
console.log("GET /api/users status:", res.status);
console.log("GET /api/users body:", raw);

if (!res.ok) {
  throw new Error(`Failed to load user (${res.status})`);
}

const data = raw ? JSON.parse(raw) : {};
setUser(data.user);
setLoading(false);

    }
    loadUser();
  }, [id]);

  // Handle sending offer
  async function handleSend() {
    if (!product || !price) {
      showToast("Please fill in all fields", "error");
      return;
    }

    // Ensure company user exists in Zustand
    if (!currentUser || !currentUser._id) {
      showToast("Company information is missing", "error");
      return;
    }

    // 1) Save request + payment in DB
    const saveRes = await fetch("/api/company-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: id,
        companyId: currentUser._id,
        userEmail: user.email,
        productName: product,
        price: Number(price),
      }),
    });

    if (!saveRes.ok) {
      showToast("Error saving request", "error");
      return;
    }

    const saveJson = await saveRes.json();
    const paymentId = saveJson.paymentId;

    // 2) Send email via EmailJS
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://ecotrack.com";

      const paymentLink = `${origin}/pay/${paymentId}`;

      await emailjs.send(
        "service_eo7p18q",
        "template_yh50ja8",
        {
          user_name: user.name,
          product_name: product,
          price: price,
          user_email: user.email,
          reply_to: user.email,
          payment_link: paymentLink,
        },
        "zvFzq-RxRb_BxCEqg"
      );
    } catch (err) {
      showToast("Error sending email", "error");
      return;
    }

    showToast("Offer sent successfully", "success");

    setTimeout(() => {
      router.push("/company/requests");
    }, 1200);
  }

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div className={styles.wrapper}>
      {toast && <Toast text={toast.text} type={toast.type} />}

      <div className={styles.card}>
        <h1 className={styles.title}>Create payment offer</h1>

        <div className={styles.label}>User name</div>
        <div className={styles.value}>{user?.name || "Not found"}</div>

        <div className={styles.inputGroup}>
          <label>Product name</label>
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Price (₪)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <button className={styles.btn} onClick={handleSend}>
          Send offer
        </button>
      </div>
    </div>
  );
}