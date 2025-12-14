"use client";

import styles from "@/app/user/indicators/page.module.css"; 

interface SimpleLineChartProps {
  data: { month: string; value: number }[];
  color: string;
}

export default function SimpleLineChart({ data, color }: SimpleLineChartProps) {

  if (!data.length) {
    return (
      <div className={styles.noDataContainer}>
        <div className={styles.noDataIcon}>📊</div>
        <p className={styles.noDataText}>No data available yet</p>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = data
    .map((d, i) => {
      const x =
        data.length > 1 ? (i / (data.length - 1)) * 200 : 100;
      const y = 80 - ((d.value - min) / range) * 60;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={styles.chartSvg}>
      <svg width="220" height="100" viewBox="0 0 220 100">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        {data.map((d, i) => {
          const x =
            data.length > 1 ? (i / (data.length - 1)) * 200 : 100;
          const y = 80 - ((d.value - min) / range) * 60;
          return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
        })}
      </svg>

      <div className={styles.chartLabels}>
        {data.map((d, i) => (
          <span key={i} className={styles.monthLabel}>
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
}
