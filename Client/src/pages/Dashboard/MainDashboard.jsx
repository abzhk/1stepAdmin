import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserInjured,
  FaUserMd,
  FaClock,
  FaCalendarCheck,
  FaBookOpen,
  FaCreditCard,
  FaBuilding,
  FaChartLine,
  FaCog,
  FaUsers,
  FaEye
} from "react-icons/fa";
import { TbCategoryPlus, TbReportSearch } from "react-icons/tb";
import { MdRateReview, MdArticle } from "react-icons/md";
import {api} from "../../utils/api.js";

const MainDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  // const [pendingApprovals, setPendingApprovals] = useState({
  //   articles: 0,
  //   providers: 0,
  //   assessments: 0
  // });

  useEffect(() => {
    fetchStats();
    fetchRecentBookings();

  }, []);

  const fetchStats = async () => {
    try {
const data = await api(`/api/track/stats`);
              setStats(data);
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const data = await api('/api/booking/recent');
        setRecentBookings(data.bookings || []);
      }
    catch (err) {
      console.error("Recent bookings fetch error:", err);
    }
  };

  // const fetchPendingApprovals = async () => {
  //   try {
  //     const API = import.meta.env.VITE_API_URL;
  //     const res = await fetch(`${API}/api/admin/pending-approvals`, {
  //       method: "GET",
  //       credentials: "include",
  //     });
  //     const data = await res.json();
      
  //     if (res.ok) {
  //       setPendingApprovals(data);
  //     }
  //   } catch (err) {
  //     console.error("Pending approvals fetch error:", err);
  //   }
  // };

  const statCards = [
    {
      icon: FaUserInjured,
      label: "Parents",
      value: stats?.totalParents || 0,
      bgColor: "bg-yellow",
      iconColor: "text-darkgreen",
    },
    {
      icon: FaUserMd,
      label: "Providers",
      value: stats?.totalIndividualProviders || 0,
      bgColor: "bg-yellow",
      iconColor: "text-darkgreen",
    },
    {
      icon: FaCalendarCheck,
      label: "Bookings",
      value: stats?.totalBookings || 0,
      bgColor: "bg-yellow",
      iconColor: "text-darkgreen",
    },
    {
      icon: FaBookOpen,
      label: "Courses",
      value: stats?.lessonsCount || 0,
      bgColor: "bg-yellow",
      iconColor: "text-darkgreen",
    },
    {
      icon: FaBuilding,
      label: "Centers",
      value: stats?.totalCentreProviders || 0,
      bgColor: "bg-yellow",
      iconColor: "text-darkgreen",
    },
    {
      icon: FaCreditCard,
      label: "Subscriptions",
      value: stats?.activeSubscriptions || 0,
      bgColor: "bg-yellow",
      iconColor: "text-darkgreen",
    },
  ];

  const quickActions = [
    {
      icon: TbCategoryPlus,
      label: "Add Category",
      color: "bg-purple-100 text-purple-600",
      onClick: () => navigate("/viewcat")
    },
    {
      icon: MdArticle,
      label: "Article",
      color: "bg-indigo-100 text-indigo-600",
      onClick: () => navigate("/viewarticle")
    },
    {
      icon: MdRateReview,
      label: "Add Assessment",
      color: "bg-green-100 text-green-600",
      onClick: () => navigate("/addassessment")
    },
    {
      icon: TbReportSearch,
      label: "Reports",
      color: "bg-orange-100 text-orange-600",
      onClick: () => navigate("/reportdashboard")
    },
    {
      icon: FaUsers,
      label: "Roles & Access",
      color: "bg-pink-100 text-pink-600",
      onClick: () => navigate("/create-Role")
    },
    {
      icon: FaCog,
      label: "Master Data",
      color: "bg-gray-100 text-gray-600",
      onClick: () => navigate("/master-data")
    }
  ];

  const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-700";

    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    case "completed":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

  return (
    <div className="min-h-screen p-6 bg-offwhite">
      <div className="flex items-center justify-between mb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome Back 
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Here's what's happening today.
        </p>
      </div>
      </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
  {statCards.map((stat, index) => (
    <div
      key={index}
      className="relative overflow-hidden bg-white rounded-4xl border border-gray-100 p-6 
                 shadow-sm hover:shadow-lg hover:-translate-y-1
                 transition-all duration-300 group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 
                      bg-green-50 
                      rounded-bl-[60px] 
                      opacity-90">
      </div>

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">
            {stat.label}
          </p>
          <p className="text-3xl font-bold text-gray-800 tracking-tight">
            {stat.value.toLocaleString()}
          </p>
        </div>

        <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition`}>
          <stat.icon className={`text-xl ${stat.iconColor}`} />
        </div>
      </div>
    </div>
  ))}
</div>

      {/* Pending Approvals */}
      {/* {(pendingApprovals.articles > 0 ||
        pendingApprovals.providers > 0 ||
        pendingApprovals.assessments > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg">
          <div className="flex items-center gap-3">
            <FaClock className="text-yellow-500" />
            <p className="text-sm text-yellow-700">
              <span className="font-bold">Pending Approvals:</span>
              {pendingApprovals.articles > 0 && ` ${pendingApprovals.articles} Articles`}
              {pendingApprovals.providers > 0 && ` • ${pendingApprovals.providers} Providers`}
              {pendingApprovals.assessments > 0 && ` • ${pendingApprovals.assessments} Assessments`}
            </p>
          </div>
        </div>
      )} */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <div className="space-y-6">

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
                  <div className={`p-4 rounded-xl ${action.color} mb-3 group-hover:scale-110 transition`}>
                    <action.icon className="text-xl" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* Articles */}
          <div className="bg-white rounded-4xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Articles</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Manage and review all articles
                </p>
              </div>

              <button
                onClick={() => navigate("/list-view-article")}
                className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition"
              >
                <FaEye className="text-sm" />
                View All
              </button>
            </div>
          </div>

          {/* Assessments */}
          <div className="bg-white rounded-4xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Assessments</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Review and manage assessments
                </p>
              </div>

              <button
                onClick={() => navigate("/providerassessment")}
                className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition"
              >
                <FaEye className="text-sm" />
                View All
              </button>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-4xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Bookings</h3>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                Live
              </span>
            </div>

            <ul className="space-y-3">
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                recentBookings.slice(0, 5).map((book) => (
                  <li key={book._id} className="flex items-start gap-3 py-1.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-700">
                      <FaClock className="text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {book.patientDetails?.username}
                      </p>
                     <p className="inline-flex items-center text-xs font-semibold rounded-2xl text-gray bg-blue-50 px-2.5 py-1 ">
  with {book.providerDetails?.fullName}
</p>
                    </div>
                    <span
  className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
    book.status
  )}`}
>
  {book.status}
</span>
                  </li>
                ))
              )}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MainDashboard;