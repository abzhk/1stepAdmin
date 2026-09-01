import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHospital, FaUserMd, FaCalendarCheck } from "react-icons/fa";
import CentreStats from "../../Components/CentreComponent/CentreStats";
import Appointmentstats from "../../Components/CentreComponent/Appointmentstats";
import { api } from "../../utils/api";
import { useEffect, useState } from "react";
import CentreCard from "./CentreCard";
import  dateFormatUtils  from "../../utils/dateFormatUtils";
import {formatTimeRangeAMPM,} from "../../utils/dateHelpers";


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

        // console.log("centre-list:", data);
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
        // console.log("Centre Dashboard Stats:", res);
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
      <CentreCard/>

      {/* CENTRE TABLE */}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CENTRE TABLE */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md">
          <div className="flex justify-between mb-6">
            <h2 className="text-subheading">Centre</h2>
            <button
              onClick={() => navigate("/centre-list")}
              className="text-sm px-4 py-2 bg-darkgreen text-white rounded-xl"
            >
              View All →
            </button>
          </div>

          <table className="w-full border-separate border-spacing-y-3">
            <thead className="bg-offwhite  rounded-2xl">
              <tr className=" text-cardfooter uppercase text-left">
                <th className="px-4 py-3">Centre</th>
                <th className="px-4 py-3">Invited Provider</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Experience</th>
              </tr>
            </thead>

            <tbody>
              {centres.slice(0, 4).map((c) => (
                <tr key={c._id} className="bg-white hover:bg-offwhite transition-colors duration-200">
                  <td className="py-4 px-4 text-table-text">{c.fullName}</td>

                  

                  <td className="text-table-text">{c.totalProviders || "-"}</td>
                  <td className="text-table-text">{c.userRef?.email || "-"}</td>
                  <td className="text-table-text text-center">{c.experience || "-"}</td>
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
          <h2 className="text-subheading text-yellow mb-6">
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
          <h2 className="text-subheading">
            Upcoming Sessions
          </h2>

          {/* <button
            onClick={() => navigate("/upcoming-session")}
            className="flex items-center gap-2 text-sm px-4 py-2 bg-green-900 text-white rounded-xl hover:bg-green-800 transition"
          >
            View All →
          </button> */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead className="bg-offwhite">
              <tr className="text-cardfooter uppercase tracking-wide">
                <th className="px-4 py-3">Booking Id</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
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
    upcomingSessions.slice(0, 5).map((s) => (
      <tr
        key={s._id}
        className="bg-white hover:bg-offwhite rounded-xl  hover:shadow-md transition text-table-text"
      >
        <td className="py-4 px-4  ">
          {s.bookingId || "-"}
        </td>

        <td className="px-4 text-gray-700">
          {s.provider?.fullName || "-"}
        </td>

        <td className="px-4 text-gray-700">
  {dateFormatUtils(s.scheduledTime?.date)}
</td>

        {/* Time */}
        <td className="px-4 text-gray-700">
  {s.appointment?.startTime
  ? formatTimeRangeAMPM(
      s.appointment.startTime,
      s.appointment.durationMinutes || 30
    )
  : "—"}
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
