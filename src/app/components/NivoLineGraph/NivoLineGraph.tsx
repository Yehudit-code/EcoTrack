import React from "react";
import { ResponsiveLine } from "@nivo/line";
import styles from "./NivoLineGraph.module.css";

interface NivoLineGraphProps {
  data: { month: string; value: number }[];
}

const NivoLineGraph: React.FC<NivoLineGraphProps> = ({ data }) => {
  const nivoData = [
    {
      id: "Consumption",
      data: data.map((d) => ({ x: d.month, y: d.value })),
    },
  ];

  return (
    <div className={styles.graphWrapper}>
      <ResponsiveLine
        data={nivoData}
        margin={{ top: 12, right: 16, bottom: 18, left: 24 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}

        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={null}

        enableGridX={false}
        enableGridY={false}

        colors={["#4caf50"]}
        lineWidth={3}

        pointSize={6}
        pointColor="#ffffff"
        pointBorderWidth={2}
        pointBorderColor="#4caf50"

        enableArea
        areaOpacity={0.18}
        areaBaselineValue={0}

        useMesh
        isInteractive
        animate
        motionConfig="gentle"

        tooltip={({ point }) => (
          <div className={styles.tooltip}>
            <div className={styles.tooltipMonth}>
              Month {point.data.x}
            </div>
            <div className={styles.tooltipValue}>
              {point.data.y}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default NivoLineGraph;
