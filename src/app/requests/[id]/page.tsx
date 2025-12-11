"use client";

import { useEffect, useState, use } from "react";
import styles from "./CreateRequest.module.css";
import { useRouter } from "next/navigation";
import emailjs from "@emailjs/browser";
import Toast from "@/app/components/Toast/Toast";

export default function CreateRequestPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const { id } = use(params);

    const [user, setUser] = useState<any>(null);
    const [product, setProduct] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(true);

    const [toast, setToast] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);

    const showToast = (text: string, type: "success" | "error" = "success") => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        async function loadUser() {
            const res = await fetch(`/api/users/${id}`);
            const data = await res.json();
            setUser(data.user);
            setLoading(false);
        }
        loadUser();
    }, [id]);

    async function handleSend() {
        if (!product || !price) {
            showToast("Please fill in all fields", "error");
            return;
        }

        const currentUser = JSON.parse(
            localStorage.getItem("currentUser") || "{}"
        );

        if (!currentUser._id) {
            showToast("Company information is missing", "error");
            return;
        }

        // 1️⃣ Save request + payment in DB
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

        console.log("📩 FULL server response:", saveJson);
        console.log("🆔 Payment ID from server:", paymentId);

        // 2️⃣ Send email via EmailJS
        try {
            const origin =
                typeof window !== "undefined"
                    ? window.location.origin
                    : "https://ecotrack.com"; // fallback
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
            console.log(err);
            showToast("Error sending email", "error");
            return;
        }

        showToast("Offer sent successfully!", "success");

        setTimeout(() => {
            router.push("/requests");
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
