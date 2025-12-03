
import { ResponsiveBar } from '@nivo/bar';
import React from "react";


interface ConsumptionGraphProps {
  data: { month: string; value: number }[];
}


const ConsumptionGraph: React.FC<ConsumptionGraphProps> = ({ data }) => {
  // Nivo expects keys for the bar chart
  return (
    <div style={{ height: 100, width: '100%', background: 'transparent' }}>
      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="month"
        margin={{ top: 10, right: 10, bottom: 20, left: 20 }}
        padding={0.18}
        colors={["#7fc97f"]}
        enableLabel={false}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 6,
          tickRotation: 0,
          legend: '',
          legendPosition: 'middle',
          legendOffset: 32,
        }}
        axisLeft={null}
        tooltip={({ value, indexValue }) => (
          <div style={{ background: '#f8fff8', padding: '4px 10px', border: '1px solid #b2dfb2', borderRadius: 8, color: '#3b6e3b', fontWeight: 500 }}>
            <span style={{ fontSize: 13 }}>{indexValue}: {value}</span>
          </div>
        )}
        theme={{
          background: 'transparent',
          grid: {
            line: {
              stroke: '#e0e0e0',
              strokeWidth: 1,
            },
          },
          tooltip: {
            container: {
              fontSize: 13,
              background: '#f8fff8',
            },
          },
        }}
        borderRadius={8}
        animate={true}
        motionConfig="gentle"
        layers={['grid','axes','bars','markers','legends']}
      />
    </div>
  );
};


export default ConsumptionGraph;
