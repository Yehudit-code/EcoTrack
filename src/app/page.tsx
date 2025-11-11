"use client";

import { useEffect, useState } from "react";

export default function Home() {
    const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api", { cache: "no-store" });

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
      <main >
        <h1>Welcome to EcoTrack</h1>
                {products.map((p, i) => (
          <div key={i}>
            <h2>{p.name}</h2>
            <p>{p.email}</p>
            <p>{p.role}</p>
            <p>{p.country}</p>
          </div>
        ))}

      </main>
  );
}
