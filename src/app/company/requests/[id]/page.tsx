"use client";

import { useEffect, useState } from "react";
import styles from "./CreateRequest.module.css";
import { useUserStore } from "@/store/useUserStore";
import { fetchCompanyRequests } from "@/app/services/client/company/companyRequestsService";
import type { CompanyRequestItem } from "@/app/types/companyRequests";

/* ---------- Types ---------- */

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CompanyRequestItem[] };

type RequestStatus = CompanyRequestItem["status"];

/* ---------- Page ---------- */

export default function CompanyRequestsPage() {
  const user = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user || user.role !== "company") {
      setState({ status: "ready", data: [] });
      return;
    }

    fetchCompanyRequests(user._id)
      .then((data) => {
        setState({ status: "ready", data });
      })
      .catch(() => {
        setState({
          status: "error",
          message: "Failed to load payment requests",
        });
      });
  }, [hasHydrated, user?._id, user?.role]);

  if (state.status === "loading") {
    return <div className={styles.page}>Loading requests...</div>;
  }

  if (state.status === "error") {
    return <div className={styles.page}>{state.message}</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Payment offers sent</h1>

      {state.data.length === 0 ? (
        <div className={styles.empty}>
          You haven&apos;t sent any payment offers yet.
        </div>
      ) : (
        <div className={styles.list}>
          {state.data.map((req) => (
            <RequestCard key={req._id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function RequestCard({ request }: { request: CompanyRequestItem }) {
  return (
    <div className={styles.card}>
      <InfoRow label="Product" value={request.productName} />
      <InfoRow label="Price" value={`${request.price} ₪`} />
      <InfoRow
        label="User"
        value={
          request.userData?.name ||
          request.userData?.email ||
          request.userId
        }
      />
      <StatusRow status={request.status} />
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

const STATUS_MAP: Record<
  RequestStatus,
  { text: string; className: string }
> = {
  sent: {
    text: "Pending payment",
    className: styles.statusPending,
  },
  paid: {
    text: "Paid",
    className: styles.statusSuccess,
  },
  declined: {
    text: "Declined",
    className: styles.statusDeclined,
  },
};

function StatusRow({ status }: { status: RequestStatus }) {
  const { text, className } = STATUS_MAP[status];

  return (
    <div className={styles.statusRow}>
      <span className={styles.label}>Status</span>
      <span className={`${styles.status} ${className}`}>
        {text}
      </span>
    </div>
  );
}
