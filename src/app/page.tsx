"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/collections", { cache: "no-store" });
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/logoEcoTrack.png" alt="Eco Track Logo" />
        </div>
        <div className={styles.authButtons}>
          <Link href="/signIn">
            <button className={styles.authButton}>Sign in</button>
          </Link>
          <Link href="/signUp">
            <button className={styles.authButton}>Sign up</button>
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <h1>The future of living <br /> starts at home</h1>
        <p>
          Technology changes, but sustainability lasts. With our platform, people, ideas, and smart tools unite to create greener, smarter homes for a better world.
        </p>

        <Link href="/signup">
          <button className={styles.getStartedButton}>Get Started</button>
        </Link>

        {/* מציג נתונים שהובאו מהשרת */}
        {products.length > 0 && (
          <section>
            <h2>Products:</h2>
            {products.map((p, i) => (
              <pre key={i}>{JSON.stringify(p, null, 2)}</pre>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
