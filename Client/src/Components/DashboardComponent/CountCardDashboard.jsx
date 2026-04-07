import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";
import {
  FaUserInjured,
  FaUserMd,
  FaCalendarCheck,
  FaBookOpen,
  FaCreditCard,
  FaBuilding,
} from "react-icons/fa";

const CountCardDashboard = () => {
  const [stats, setStats] = useState(null);
  // const [activeFilter, setActiveFilter] = useState("Today");
  const[subscription,setSubscription] =useState()
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchsubscription();
    fetchSessionCount();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api(`/api/track/stats`);
      setStats(data);
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchsubscription = async()=>{
    try{
      const data = await api(`/api/subscription/getcount`);
      setSubscription(data);
      console.log(data);
      
    }catch(err){
       console.error("Subscription count fetch error:", err);
    }
  }

  const fetchSessionCount = async () => {
  try {
    const data = await api(`/api/booking/sessions/count`);
    setSessionCount(data.totalSessions);
  } catch (err) {
    console.error("Session count fetch error:", err);
  }
};

  const statCards = [
    {
      icon: FaUserInjured,
      label: "Parents",
      value: stats?.totalParents || 0,
      badge: "Active",
      note: "0% from last month",
      iconBg: "bg-[#eef1eb]",
      badgeBg: "bg-[#dbe3d8]",
      badgeText: "text-[#35543c]",
      noteText: "text-[#8aa08f]",
    },
    {
      icon: FaUserMd,
      label: "Providers",
      value: stats?.totalIndividualProviders || 0,
      badge: "Active",
      note: "New provider updates",
      iconBg: "bg-[#f8efea]",
      badgeBg: "bg-[#f7d8cb]",
      badgeText: "text-[#8b5a46]",
      noteText: "text-[#b08e82]",
    },
    {
      icon: FaBuilding,
      label: "Centers",
      value: stats?.totalCentreProviders || 0,
      badge: "Active",
      note: "Growth in centers",
      iconBg: "bg-[#edf4f7]",
      badgeBg: "bg-[#dcecf2]",
      badgeText: "text-[#3c6473]",
      noteText: "text-[#85a2af]",
    },
    {
      icon: FaCalendarCheck,
      label: "Total Bookings",
      value: stats?.totalBookings || 0,
      badge: "On Track",
      note: "Excellent pace",
      iconBg: "bg-[#f8f1d8]",
      badgeBg: "bg-[#f3dd93]",
      badgeText: "text-[#715b12]",
      noteText: "text-[#9d8b4c]",
    },
    {
      icon: FaBookOpen,
      label: "Total Session",
      value: sessionCount || 0,
      badge: "On Track",
      note: "Steady session flow",
      iconBg: "bg-[#eef1eb]",
      badgeBg: "bg-[#dbe3d8]",
      badgeText: "text-[#35543c]",
      noteText: "text-[#8aa08f]",
    },
    {
      icon: FaCreditCard,
      label: "Subscribers",
      value: subscription?.total_active_subscribers,
      badge: "Stable",
      note: "Revenue performing well",
      iconBg: "bg-[#f5eee8]",
      badgeBg: "bg-[#ecd8c7]",
      badgeText: "text-[#7a5a43]",
      noteText: "text-[#aa917f]",
    },
  ];

  return (
    <div className="w-full">
      {/* Filter Buttons */}
      {/* <div className="inline-flex items-center bg-white rounded-[24px] p-2 gap-2 shadow-sm border border-[#ece8e1]">
        {["Today", "Weekly", "Monthly"].map((item) => (
          <button
            key={item}
            onClick={() => setActiveFilter(item)}
            className={`px-5 py-2.5 rounded-[16px] text-sm font-semibold transition-all duration-300 ${
              activeFilter === item
                ? "bg-[#234b36] text-white shadow-sm"
                : "bg-[#f7f4ef] text-[#5d6d63] hover:bg-[#ece6dc]"
            }`}
          >
            {item}
          </button>
        ))}
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
        {statCards.map((card, index) => (
          <div
            key={index}
           className="relative overflow-hidden bg-[#fcfbf8] border border-[#ece8e1] rounded-[34px] p-5 min-h-[150px] shadow-[0_4px_18px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#f3f0eb] rounded-full opacity-90"></div>
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#f7f4ef] rounded-bl-[80px]"></div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-[22px] font-semibold text-[#5a6b61] leading-none">
                  {card.label}
                </h3>

                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-[15px] font-semibold mt-5 ${card.badgeBg} ${card.badgeText}`}
                >
                  {card.badge}
                </div>

                <p className="text-[46px] font-bold text-[#1f4a38] leading-none mt-6">
                  {card.value}
                </p>

                {/* <p className={`text-[18px] mt-4 ${card.noteText}`}>
                  {card.note}
                </p> */}
              </div>

              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.iconBg} shadow-sm`}
              >
                <card.icon className="text-[#d18b32] text-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountCardDashboard;