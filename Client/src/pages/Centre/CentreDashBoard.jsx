import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHospital, FaUserMd, FaCalendarCheck } from "react-icons/fa";
import CentreStats from "../../Components/CentreComponent/CentreStats";
import Appointmentstats from "../../Components/CentreComponent/Appointmentstats";
import { api } from "../../utils/api";
import { useEffect, useState } from "react";

const CentreDashBoard = () => {
  const navigate = useNavigate();
  const [centres, setCentres] = useState([]);
  const [totalCentres, setTotalCentres] = useState(0);
  const [totalProviders, setTotalProviders] = useState(0);
  const [stats,setStats]=useState({});
  const [upcomingSessions,setUpcomingSessions]=useState([]);


  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const data = await api("/api/provider/centre-list");

        setCentres(data.centres || []);
        setTotalCentres(data.totalCentres || 0);
        setTotalProviders(data.totalProviders);

        console.log("API DATA:", data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCentres();
  }, []);

  useEffect(()=>{
    const fetchStats = async()=>{
      try{
        const res= await api("/api/provider/centre-session");
        console.log("Centre Dashboard Stats:", res);
 setStats(res.stats);
      setUpcomingSessions(res.upcoming);
    } catch (err) {
      console.error(err);
    }
  };

  fetchStats();

      },[]);

  return (
    <div className="p-6 bg-offwhite min-h-screen">
      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Centres */}
        <div className="relative bg-white rounded-4xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-green-100 rounded-full"></div>

          <div className="relative flex justify-between items-start">
            <p className="text-gray-500 text-sm">Centres</p>
            <FaHospital className="text-green-700 text-xl z-10" />
          </div>

          <p className="text-3xl font-bold text-green-900 mt-3">
            {totalCentres}
          </p>

          <span className="mt-3 inline-block px-3 py-1 text-lg rounded-full bg-green-200 text-darkgreen">
            Active
          </span>
        </div>

        {/* Providers */}
        <div className="relative bg-white rounded-4xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-orange-100 rounded-full"></div>

          <div className="relative flex justify-between items-start">
            <p className="text-gray-500 text-sm">Providers</p>
            <FaUserMd className="text-orange-600 text-xl z-10" />
          </div>

          <p className="text-3xl font-bold text-green-900 mt-3">
            {totalProviders}
          </p>

          <span className="mt-3 inline-block px-3 py-1 text-lg rounded-full bg-orange-200 text-darkgreen">
            Active
          </span>
        </div>

        {/* Sessions */}
        <div className="relative bg-white rounded-4xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-yellow-100 rounded-full"></div>

          <div className="relative flex justify-between items-start">
            <p className="text-gray-500 text-sm">Sessions</p>
            <FaCalendarCheck className="text-yellow-600 text-xl z-10" />
          </div>

          <p className="text-3xl font-bold text-green-900 mt-3">
            {stats.total||"-"}
          </p>

          <span className="mt-3 inline-block px-3 py-1 text-lg rounded-full bg-yellow-100 text-darkgreen">
            On Track
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        {/* Centres Graph */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <CentreStats />
          {/* chart here */}
        </div>

        {/* Appointments Graph */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <Appointmentstats />
          {/* chart here */}
        </div>
      </div>

      {/* CENTRE TABLE */}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CENTRE TABLE */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md">
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-semibold text-green-900">Centre</h2>
            <button
              onClick={() => navigate("/centre-list")}
              className="text-sm px-4 py-2 bg-green-900 text-white rounded-xl"
            >
              View All →
            </button>
          </div>

          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-gray-400 text-xs uppercase text-left">
                <th>Centre</th>
                <th>Invited Provider</th>
                <th>Email</th>
                <th>Experience</th>
              </tr>
            </thead>

            <tbody>
              {centres.slice(0, 4).map((c) => (
                <tr key={c._id} className="bg-[#faf9f6]">
                  <td className="py-4 px-4 text-green-900">{c.fullName}</td>

                  

                  <td>{c.totalProviders || "-"}</td>
                  <td>{c.user?.email || "-"}</td>
<td>{c.experience || "-"}</td>
                  {/* <td>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* session */}
        <div className="bg-darkgreen rounded-3xl p-6 shadow-md h-full flex flex-col">
          <h2 className="text-lg font-semibold text-yellow mb-6">
            Sessions Completed
          </h2>

          <div className="bg-white/10 rounded-xl overflow-hidden flex-1 flex flex-col">
            <table className="w-full text-sm h-full">
              <thead>
                <tr className="text-gray-300 border-b border-white/10">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Sessions</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>

              <tbody className="h-full">
  {/* TODAY */}
  <tr className="border-b border-white/5 hover:bg-white/5 transition">
    <td className="py-3 px-4 text-white">Today</td>
    <td className="px-4 text-white font-medium">{stats.today}</td>
    <td className="px-4">
      <span className="px-2 py-1 rounded-full text-md font-bold bg-yellow text-black">
        On Progress
      </span>
    </td>
  </tr>

  {/* WEEK */}
  <tr className="border-b border-white/5 hover:bg-white/5 transition">
    <td className="py-3 px-4 text-white">This Week</td>
    <td className="px-4 text-white font-medium">{stats.week}</td>
    <td className="px-4">
      <span className="px-2 py-1 rounded-full text-md font-bold bg-yellow text-black">
       On Progress
      </span>
    </td>
  </tr>

  {/* MONTH */}
  <tr className="hover:bg-white/5 transition">
    <td className="py-3 px-4 text-white">This Month</td>
    <td className="px-4 text-white font-medium">{stats.month}</td>
    <td className="px-4">
      <span className="px-2 py-1 rounded-full text-md font-bold bg-yellow text-black">
        On Progress
      </span>
    </td>
  </tr>
</tbody>
            </table>
          </div>
        </div>
      </div>

      {/* upcoming session */}

      <div className="mt-10 bg-white rounded-3xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-green-900">
            Upcoming Sessions
          </h2>

          <button
            onClick={() => navigate("/upcoming-session")}
            className="flex items-center gap-2 text-sm px-4 py-2 bg-green-900 text-white rounded-xl hover:bg-green-800 transition"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wide">
                <th>Booking Id</th>
                <th>Provider</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
  {upcomingSessions.length === 0 ? (
    <tr>
      <td colSpan="5" className="text-center py-6 text-gray-400">
        No upcoming sessions
      </td>
    </tr>
  ) : (
    upcomingSessions.slice(0, 3).map((s) => (
      <tr
        key={s._id}
        className="bg-[#faf9f6] rounded-xl shadow-sm hover:shadow-md transition"
      >
        <td className="py-4 px-4 font-medium text-green-900 ">
          {s.bookingId || "-"}
        </td>

        <td className="px-4 text-gray-700">
          {s.provider?.fullName || "-"}
        </td>

        <td className="px-4 text-gray-700">
          {new Date(s.scheduledTime?.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>

        {/* Time */}
        <td className="px-4 text-gray-700">
          {s.scheduledTime?.slot || "-"}
        </td>

        {/* Status */}
        <td className="px-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              s.status === "approved"
                ? "bg-green-100 text-green-700"
                : s.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {s.status}
          </span>
        </td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CentreDashBoard;
