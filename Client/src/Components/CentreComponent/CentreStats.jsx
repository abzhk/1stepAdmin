import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


const chartData = [
  { month: "Jan", centres: 2 },
  { month: "Feb", centres: 5 },
  { month: "Mar", centres: 8 },
  { month: "Apr", centres: 6 },
  { month: "May", centres: 10 },
];

const CentreStats = () => {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4 text-green-900">
        Centres Registered
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="month" />
          <YAxis hide />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="centres"
            stroke="#065f46"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default CentreStats;