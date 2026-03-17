import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog, FaUsers } from "react-icons/fa";
import { TbCategoryPlus, TbReportSearch } from "react-icons/tb";
import { MdRateReview, MdArticle } from "react-icons/md";
import { api } from "../../utils/api.js";
import StatisticsCard from "../../Components/DashboardComponent/StatisticsCard.jsx";
import CardCountDashboard from "../../Components/DashboardComponent/CountCardDashboard.jsx";
import BarGraph from "../../Components/DashboardComponent/BarGraph.jsx";
import SystemAlert from "../../Components/DashboardComponent/SystemAlert.jsx";

const MainDashboard = () => {
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState([]);
  useEffect(() => {
    fetchRecentBookings();
  }, []);

  const fetchRecentBookings = async () => {
    try {
      const data = await api("/api/booking/recent");
      setRecentBookings(data.bookings || []);
    } catch (err) {
      console.error("Recent bookings fetch error:", err);
    }
  };

  const quickActions = [
    {
      icon: TbCategoryPlus,
      label: "Add Category",
      color: "bg-purple-100 text-purple-600",
      onClick: () => navigate("/viewcat"),
    },
    {
      icon: MdArticle,
      label: "Article",
      color: "bg-indigo-100 text-indigo-600",
      onClick: () => navigate("/viewarticle"),
    },
    {
      icon: MdRateReview,
      label: "Add Assessment",
      color: "bg-green-100 text-green-600",
      onClick: () => navigate("/addassessment"),
    },
    {
      icon: TbReportSearch,
      label: "Reports",
      color: "bg-orange-100 text-orange-600",
      onClick: () => navigate("/reportdashboard"),
    },
    {
      icon: FaUsers,
      label: "Roles & Access",
      color: "bg-pink-100 text-pink-600",
      onClick: () => navigate("/create-Role"),
    },
    {
      icon: FaCog,
      label: "Master Data",
      color: "bg-gray-100 text-gray-600",
      onClick: () => navigate("/master-data"),
    },
  ];

  return (
    <div className="min-h-screen p-4 bg-offwhite">
      {/* <div className="flex items-center justify-between mb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome Back 
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Here's what's happening today.
        </p>
      </div>
      </div> */}
      <CardCountDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          <StatisticsCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-4xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold mb-5">Quick Actions</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center justify-center p-5 rounded-2xl 
                             bg-gray-50 hover:bg-white 
                             border border-transparent hover:border-gray-200
                             transition-all duration-200 group"
              >
                <div
                  className={`p-4 rounded-xl ${action.color} mb-3 group-hover:scale-110 transition`}
                >
                  <action.icon className="text-xl" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <SystemAlert />
        </div>
      </div>

      {/* center table */}
      <div className="p-4 bg-white rounded-3xl shadow-md w-full mt-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">Centre List</p>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-darkgreen rounded-md">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white border-b">
                  Centre Name
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white border-b">
                  Address
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white border-b">
                  Location
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white border-b">
                  No of Providers
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-white border-b">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="bg-gray-100 hover:bg-gray-50 ">
                <td className="px-4 py-3 text-sm text-gray-600">Arun Centre</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  MG Road, Chennai
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Tamil Nadu</td>
                <td className="px-4 py-3 text-sm text-gray-600">12</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <button className="px-3 py-1 bg-darkgreen text-white rounded-lg hover:opacity-90">
                    View
                  </button>
                </td>
              </tr>

              <tr className="bg-gray-100 hover:bg-gray-50 ">
                <td className="px-4 py-3 text-sm text-gray-600">
                  Karthick Centre
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Anna Nagar, Chennaii
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Tamil Nadu</td>
                <td className="px-4 py-3 text-sm text-gray-600">8</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <button className="px-3 py-1 bg-darkgreen text-white rounded-lg hover:opacity-90">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-end items center mt-2">
            <button className="bg-yellow hover:bg-darkgreen rounded-lg h-10 w-20 gap-1 hover:text-white">
              prev
            </button>
            <span className="gap-1">page 1 of 1</span>
            <button className="bg-yellow hover:bg-darkgreen rounded-lg h-10 w-20 gap-1  hover:text-white">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
