import React from "react";
import { ResponsiveLine } from '@nivo/line';

interface NivoLineGraphProps {
  data: { month: string; value: number }[];
}

const NivoLineGraph: React.FC<NivoLineGraphProps> = ({ data }) => {
  // Nivo expects an array of series, each with id and data
  const nivoData = [
    {
      id: 'צריכה',
      color: 'hsl(120, 70%, 40%)',
      data: data.map((d) => ({ x: d.month, y: d.value })),
    },
  ];

  return (
    <div style={{ width: '100%', height: 60 }}>
      <ResponsiveLine
        data={nivoData}
        margin={{ top: 10, right: 10, bottom: 20, left: 30 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: 'bottom',
          tickSize: 0,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendOffset: 36,
          legendPosition: 'middle',
        } as any}
        axisLeft={null}
        enableGridX={false}
        enableGridY={false}
        colors={{ scheme: 'category10' }}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        enableArea={true}
        areaOpacity={0.15}
        isInteractive={true}
        animate={true}
      />
    </div>
  );
};

export default NivoLineGraph;
