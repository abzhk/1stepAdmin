import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../utils/api";

const CentreStats = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await api("/api/provider/centre-stats");

      const apiData = res.data ? res.data : res;

      const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
      ];

      const fullData = months.map((month) => {
        const found = apiData.find((m) => m.month === month);
        return found || { month, centres: 0 };
      });

      setChartData(fullData);
    } catch (err) {
      console.error(err);
    }
  };

  fetchStats();
}, []);
  return (
    <>
      <h2 className="text-subheading mb-4">
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