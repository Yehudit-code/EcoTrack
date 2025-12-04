import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ConsumptionGraphProps {
  data: { month: string; value: number }[];
}

const ConsumptionGraph: React.FC<ConsumptionGraphProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={60}>
    <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
      <XAxis dataKey="month" hide />
      <YAxis hide domain={[0, 'dataMax + 10']} />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#3b6e3b" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export default ConsumptionGraph;
