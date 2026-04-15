import React, { useEffect, useState } from "react";
import { FaHospital, FaUserMd, FaCalendarCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import CentreStats from "../../Components/CentreComponent/CentreStats";
import Appointmentstats from "../../Components/CentreComponent/Appointmentstats";
import { api } from "../../utils/api";

const StatCard = ({ title, value, badge, badgeColor, footer, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{
      y: -4,
      boxShadow: "0 10px 30px -10px rgba(45, 74, 54, 0.1)",
    }}
    className="bg-white p-6 rounded-[2rem] border border-greenmuted/20 flex flex-col justify-between h-44 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-offwhite rounded-bl-full -mr-4 -mt-4 opacity-50" />

    <div className="flex justify-between items-start z-10">
      <div>
        <h3 className="text-cardtitle mb-2">
          {title}
        </h3>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${badgeColor}`}>
          {badge}
        </span>
      </div>

      <div className="p-2.5 bg-offwhite rounded-xl text-green-900">
        {icon}
      </div>
    </div>

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

const CentreCard = () => {
  const [totalCentres, setTotalCentres] = useState(0);
  const [totalProviders, setTotalProviders] = useState(0);
  const [stats, setStats] = useState({});


  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const data = await api("/api/provider/centre-list");
        setTotalCentres(data.totalCentres || 0);
        setTotalProviders(data.totalProviders || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCentres();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api("/api/provider/centre-session");
        setStats(res.stats || {});
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard
          title="Centres"
          value={totalCentres}
          badge="Active"
          badgeColor="text-green-900 bg-green-200"
          icon={<FaHospital size={20} />}
          delay={0}
        />

        <StatCard
          title="Providers"
          value={totalProviders}
          badge="Active"
          badgeColor="text-orange-900 bg-orange-200"
          icon={<FaUserMd size={20} />}
          delay={0.1}
        />

        <StatCard
          title="Sessions"
          value={stats?.total || 0}
          badge="On Track"
          badgeColor="text-yellow-900 bg-yellow-200"
          footer={`${stats?.month || 0} this month`}
          icon={<FaCalendarCheck size={20} />}
          delay={0.2}
        />
      </div>

      {/* GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <div className="bg-white p-6 rounded-2xl shadow">
          <CentreStats />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <Appointmentstats />
        </div>
      </div>
    </div>
  );
};

export default CentreCard;