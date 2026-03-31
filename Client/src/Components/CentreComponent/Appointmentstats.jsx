import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const appointmentChart = [
  { month: "Jan", appointments: 92 },
  { month: "Feb", appointments: 20 },
  { month: "Mar", appointments: 18 },
  { month: "Apr", appointments: 25 },
  { month: "May", appointments: 30 },
  { month: "Jun", appointments: 40 },
  { month: "Jul", appointments: 30 },
  { month: "Aug", appointments: 60 },
  { month: "Sep", appointments: 30 },
  { month: "Oct", appointments: 90 },
  { month: "Nov", appointments: 120 },
  { month: "Dec", appointments: 150 },
];

const AppointmentStats = () => {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4 text-green-900">
        Appointments
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={appointmentChart}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="appointments" fill="#f2a794" radius={[8, 8, 0, 0]} barSize={15} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default AppointmentStats;
