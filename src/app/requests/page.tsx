"use client";
import { useEffect, useState } from "react";
import styles from "./Requests.module.css";
import { useRouter } from "next/navigation";

export default function CompanyRequestsPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadUsers() {
              const res = await fetch(`/api/users`);
            const data = await res.json();
            setUsers(data);
            setLoading(false);
        }
        loadUsers();
    }, []);

    if (loading) return <div>טוען...</div>;

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>משתמשים רלוונטיים להצעת תשלום</h1>

            <div className={styles.list}>
                {users.map((u: any) => (
                    <div key={u._id} className={styles.card}>
                        <div className={styles.name}>{u.userName}</div>
                        <div className={styles.info}>צריכת חשמל: {u.consumption} קוט״ש</div>

                        <button
                            className={styles.btn}
                            onClick={() => router.push(`/company/requests/${u._id}`)}
                        >
                            צור הצעת תשלום
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
