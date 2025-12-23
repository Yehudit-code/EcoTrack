import { ResponsiveBar } from "@nivo/bar";
import React from "react";
import styles from "./ConsumptionGraph.module.css";

interface ConsumptionGraphProps {
  data: {
    month: string;
    value: number;
    realValue: number;
    isLast?: number;
  }[];
}

const ConsumptionGraph: React.FC<ConsumptionGraphProps> = ({ data }) => {
  return (
    <div className={styles.graphWrapper}>
      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="month"
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        padding={0.45}

        colors={({ data }) =>
          data.isLast === 1 ? "#4caf50" : "#a5d6a7"
        }

        borderRadius={16}
        enableLabel={false}

        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={null}

        tooltip={({ data }) => (
          <div className={styles.tooltip}>
            <div className={styles.tooltipMonth}>
              Month {data.month}
            </div>
            <div className={styles.tooltipValue}>
              {data.realValue}
            </div>
          </div>
        )}

        theme={{
          background: "transparent",
          grid: {
            line: {
              stroke: "#e8f5e9",
              strokeDasharray: "4 4",
            },
          },
        }}

        animate
        motionConfig="gentle"
        layers={["grid", "bars"]}
      />
    </div>
  );
};

export default ConsumptionGraph;
