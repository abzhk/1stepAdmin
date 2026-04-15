import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";
import { motion } from "framer-motion";
import {
  FaUserInjured,
  FaUserMd,
  FaCalendarCheck,
  FaBookOpen,
  FaCreditCard,
  FaBuilding,
} from "react-icons/fa";

const StatCard = ({ title, value, badge, badgeColor, footer, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{
      y: -4,
      boxShadow: "0 10px 30px -10px rgba(45, 74, 54, 0.1)",
    }}
    className="bg-white p-7 rounded-[2rem] border border-greenmuted/20 flex flex-col justify-between h-44 relative overflow-hidden"
  >

    <div className="absolute top-0 right-0 w-24 h-24 bg-offwhite rounded-bl-full -mr-4 -mt-4 pointer-events-none opacity-50" />

    {/* Header */}
    <div className="flex justify-between items-start z-10">
      <div>
        <h3 className="text-cardtitle mb-2">
          {title}
        </h3>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-bold ${badgeColor}`}
        >
          {badge}
        </span>
      </div>

      <div className="p-3 bg-offwhite rounded-xl text-darkgreen">
        {icon}
      </div>
    </div>

    {/* Value */}
    <div className="z-10">
      <div className="text-value mb-1 tracking-tight">
        {value}
      </div>

      {footer && (
        <div className="text-cardfooter">
          {footer}
        </div>
      )}
    </div>
  </motion.div>
);

const CountCardDashboard = () => {
  const [stats, setStats] = useState(null);
  const [subscription, setSubscription] = useState();
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
      console.error(err);
    }
  };

  const fetchsubscription = async () => {
    try {
      const data = await api(`/api/subscription/getcount`);
      setSubscription(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessionCount = async () => {
    try {
      const data = await api(`/api/booking/sessions/count`);
      setSessionCount(data.totalSessions);
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    {
      title: "Parents",
      value: stats?.totalParents || 0,
      badge: "Active",
      badgeColor: "text-[#2d4a36] bg-[#dbe3d8]",
      footer: "Users registered",
      icon: <FaUserInjured />,
    },
    {
      title: "Providers",
      value: stats?.totalIndividualProviders || 0,
      badge: "Active",
      badgeColor: "text-[#8b5a46] bg-[#f7d8cb]",
      footer: "Service providers",
      icon: <FaUserMd />,
    },
    {
      title: "Centers",
      value: stats?.totalCentreProviders || 0,
      badge: "Active",
      badgeColor: "text-[#3c6473] bg-[#dcecf2]",
      footer: "Growth in centers",
      icon: <FaBuilding />,
    },
    {
      title: "Bookings",
      value: stats?.totalBookings || 0,
      badge: "On Track",
      badgeColor: "text-[#715b12] bg-[#f3dd93]",
      footer: "Excellent pace",
      icon: <FaCalendarCheck />,
    },
    {
      title: "Sessions",
      value: sessionCount || 0,
      badge: "Stable",
      badgeColor: "text-[#35543c] bg-[#dbe3d8]",
      footer: "Steady sessions",
      icon: <FaBookOpen />,
    },
    {
      title: "Subscribers",
      value: subscription?.total_active_subscribers || 0,
      badge: "Revenue",
      badgeColor: "text-[#7a5a43] bg-[#ecd8c7]",
      footer: "Performing well",
      icon: <FaCreditCard />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
      {statCards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          badge={card.badge}
          badgeColor={card.badgeColor}
          footer={card.footer}
          icon={card.icon}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};

export default CountCardDashboard;