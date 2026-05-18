import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { api } from "../../utils/api";

const AppointmentStats = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await api("/api/provider/appointments/monthly");
        setChartData(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchChart();
  }, []);

  return (
    <>
      <h2 className="text-subheading mb-4 ">
        Appointments
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Bar
            dataKey="appointments"
            fill="#f2a794"
            radius={[8, 8, 0, 0]}
            barSize={15}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default AppointmentStats;