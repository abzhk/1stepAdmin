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
import HelpDeskCard from "../../Components/DashboardComponent/HelpDeskCard.jsx";
import {MODULES, ACTIONS} from "../../constants/permission.js";
import PermissionGuard from "../../Components/PermissionGuard.jsx";

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
      label: "Add Article Category",
      color: "bg-purple-50 text-purple-600",
      onClick: () => navigate("/viewcat"),
    },
    {
      icon: MdArticle,
      label: "Article",
      color: "bg-indigo-50 text-indigo-600",
      onClick: () => navigate("/viewarticle"),
    },
    {
      icon: MdRateReview,
      label: "Claim Profile",
      color: "bg-green-50 text-green-600 border border-greenmuted/20",
      onClick: () => navigate("/admin-verify"),
       permission:{
        module: MODULES.Roles,
        action: ACTIONS.READ,
      }
    },
    {
      icon: TbReportSearch,
      label: "Reports",
      color: "bg-orange-50 text-orange-600  border border-greenmuted/20",
      onClick: () => navigate("/reportdashboard"),
       permission: {
    module: MODULES.REPORTS,
    action: ACTIONS.READ,
  },
    },
    {
      icon: FaUsers,
      label: "Roles & Access",
      color: "bg-pink-50 text-pink-600  border border-greenmuted/20",
      onClick: () => navigate("/create-Role"),
      permission:{
        module: MODULES.Roles,
        action: ACTIONS.READ,
      }
    },
    {
      icon: FaCog,
      label: "Master Data",
      color: "bg-gray-100 text-gray-600  border border-greenmuted/20",
      onClick: () => navigate("/master"),
      permissioon:{
        module: MODULES.MASTER_DATA,  
      action: ACTIONS.READ,
      }
    },
  ];

  return (
    <div className="min-h-screen p-4 bg-offwhite">
      <CardCountDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <StatisticsCard />
        </div>

        <div className="lg:col-span-1">
          <HelpDeskCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-4xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-subheading mb-5">Quick Actions</h3>

         <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
  {quickActions.map((action, index) => {
    const button = (
      <button
        onClick={action.onClick}
        className="flex flex-col items-center justify-center p-5 rounded-2xl 
                   bg-offwhite hover:bg-white 
                   border border-transparent hover:border-gray-200
                   transition-all duration-200 group"
      >
        <div
          className={`p-4 rounded-xl ${action.color} mb-3 group-hover:scale-110 transition`}
        >
          <action.icon className="text-xl" />
        </div>

        <span className="text-sm font-semibold text-greenmuted text-center">
          {action.label}
        </span>
      </button>
    );

    return action.permission ? (
      <PermissionGuard
        key={index}
        module={action.permission.module}
        action={action.permission.action}
      >
        {button}
      </PermissionGuard>
    ) : (
      <React.Fragment key={index}>
        {button}
      </React.Fragment>
    );
  })}
</div>
</div>

        {/* system Alert */}
        <div className="space-y-6">
          <SystemAlert />
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
