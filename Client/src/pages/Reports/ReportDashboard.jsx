import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TbReportSearch,
  TbUsers,
  TbBuildingCommunity,
  TbCalendarStats
} from "react-icons/tb";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { api } from "../../utils/api.js";

const ReportsDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalParents: 0,
    totalProviders: 0,
    totalBookings: 0
  });

  const [loading, setLoading] = useState(true);

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const parents = await fetchParentsCount();
      const providers = await fetchProvidersCount();
      const bookings = await fetchBookingsCount();

      setStats({
        totalParents: parents,
        totalProviders: providers,
        totalBookings: bookings
      });

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentsCount = async () => {
    try {
      const data = await api("/api/parent/getallparents?limit=1");
      return data.totalParents || 0;
    } catch (error) {
      console.error("Error fetching parents:", error);
      return 0;
    }
  };

  const fetchProvidersCount = async () => {
    try {
      const data = await api("/api/provider/getproviders?limit=1");
      return data.totalCount || 0;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return 0;
    }
  };

  const fetchBookingsCount = async () => {
    try {
      const data = await api("/api/bookings/getbookings?limit=1");
      return data.totalCount || 0;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return 0;
    }
  };

  const pieData = [
    { name: "Parents", value: stats.totalParents },
    { name: "Providers", value: stats.totalProviders },
    { name: "Bookings", value: stats.totalBookings }
  ];

  const total =
    stats.totalParents + stats.totalProviders + stats.totalBookings;

  const reports = [
    {
      icon: TbReportSearch,
      label: "User Report",
      description: "View and export user reports",
      color: "bg-orange-100 text-orange-600",
      onClick: () => navigate("/report")
    },
    {
      icon: TbCalendarStats,
      label: "Center Appointments",
      description: "View booking analytics",
      color: "bg-blue-100 text-blue-600",
      onClick: () => navigate("/center-report")
    }
  ];

  const statCards = [
    {
      icon: TbUsers,
      label: "Total Parents",
      value: stats.totalParents,
      color: "bg-green-100 text-green-600"
    },
    {
      icon: TbBuildingCommunity,
      label: "Total Providers",
      value: stats.totalProviders,
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: TbCalendarStats,
      label: "Total Bookings",
      value: stats.totalBookings,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <div className="p-6 bg-offwhite min-h-screen">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Reports Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          View analytics and generate reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? "..." : stat.value ?? 0}
                </p>
              </div>

              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Overview
              </h2>

              <span className="text-xs text-gray-400">
                Live Data
              </span>
            </div>

            <div className="relative h-[320px]">

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: "10px"
                    }}
                  />

                </PieChart>
              </ResponsiveContainer>

              {/* Center Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-gray-500 text-sm">
                  Total
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {loading ? "..." : total}
                </p>
              </div>

            </div>

          </div>
        </div>

   
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Available Reports
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report, index) => (
                <div
                  key={index}
                  onClick={report.onClick}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer hover:border-gray-300"
                >

                  <div className="flex items-start gap-4">

                    <div className={`p-3 rounded-xl ${report.color}`}>
                      <report.icon size={24} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {report.label}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {report.description}
                      </p>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsDashboard;