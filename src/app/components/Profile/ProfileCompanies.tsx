"use client";
import React from "react";
import { Factory, Droplet, Bus, Recycle, Sun } from "lucide-react";
import styles from "@/app/profile/page.module.css";

export default function ProfileCompanies({ companies }: any) {
  const c = companies || {};

  return (
    <div className={styles.section}>
      <h3>Connected Companies</h3>

      <div className={styles.companyList}>
        <div className={styles.row}>
          <Factory size={18} /> Electricity:
          <strong>{c.electricity || "Not connected"}</strong>
        </div>

        <div className={styles.row}>
          <Droplet size={18} /> Water:
          <strong>{c.water || "Not connected"}</strong>
        </div>

        <div className={styles.row}>
          <Bus size={18} /> Transport:
          <strong>{c.transport || "Not connected"}</strong>
        </div>

        <div className={styles.row}>
          <Recycle size={18} /> Recycling:
          <strong>{c.recycling || "Not connected"}</strong>
        </div>

        <div className={styles.row}>
          <Sun size={18} /> Solar:
          <strong>{c.solar || "Not connected"}</strong>
        </div>
      </div>
    </div>
  );
}
