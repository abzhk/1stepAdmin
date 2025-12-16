import React, { useState,useEffect } from "react";

import {
  FaUserInjured,
  FaUserMd,
  FaHospital,
  FaClock,
  FaCalendarCheck,
} from "react-icons/fa";

const MainDashboard = () => {
  const tableData = [
    { name: "Abi", email: "abi@gmail.com", role: "Patient", status: "Active" },
    {name: "Arun",email: "aruns76@gmail.com",role: "Provider",status: "Pending",},
    {name: "Jenish",email: "jenish07@gmail.com",role: "Patient",status: "Inactive",},
    {name: "Kumar", email: "kumar@gmail.com",role: "Patient",status: "Inactive",},
    {name: "vijin",email: "vijin@gmail.com",role: "Patient",status: "Inactive",},
    {name: "Vibin",email: "vibin@gmail.com",role: "Patient",status: "Inactive",},
  ];

  const recentActivities = [
    {id: 1,time: "2m ago",text: "Appointment booked — Abi",type: "appointment",},
    {id: 2,time: "15m ago",text: "Provider onboarding — Arun",type: "provider",},
    {id: 3,time: "1h ago",text: "Profile updated — Jenish",type: "profile",},
    {id: 4,time: "3h ago",text: "Appointment cancelled — Kumar",type: "appointment",},
    {id: 5,time: "1d ago",text: "New clinic added — Vibin Clinic",type: "clinic",},
  ];

  const [stats, setStats] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);



useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/track/stats", {
        method: "GET",
        credentials: "include",  
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load stats");
        return;
      }

      setStats(data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setError("Something went wrong");
    } finally {
    }
  };

  fetchStats();
}, []);

  return (
    <div className="min-h-screen p-6 bg-secondary">
      <div className="flex gap-4 mb-8 h-44">
        <div className="flex flex-col bg-white p-6 rounded-2xl shadow-xl border border-gray-200 min-w-[300px] ">
          <div className="flex items-center gap-3 mb-2">
            <FaUserInjured className="text-black text-3xl" />
            <h2 className="text-xl font-semibold text-maintext">Patients</h2>
          </div>
          <p className="text-gray-600 text-2xl font-semibold mt-12"> {stats?.totalParents}</p>
        </div>

        <div className="flex-col bg-white p-6 rounded-2xl shadow-xl border border-gray-200 min-w-[300px]">
          <div className="flex items-center gap-3 mb-2">
            <FaUserMd className="text-black text-3xl" />
            <h2 className="text-xl font-semibold text-maintext">Providers</h2>
          </div>
          <p className="text-gray-600 text-2xl font-semibold mt-12">{stats?.totalProviders}</p>
        </div>

        <div className="flex-col  bg-white p-6 rounded-2xl shadow-xl border border-gray-200 min-w-[300px]">
          <div className="flex items-center gap-3 mb-2">
            <FaHospital className="text-black text-3xl" />
            <h2 className="text-xl font-semibold text-maintext">Bookings</h2>
          </div>
          <p className="text-gray-600 text-2xl font-semibold mt-12">{stats?.totalBookings}</p>
        </div>
        
<div className="flex-col  bg-white p-6 rounded-2xl shadow-xl border border-gray-200 min-w-[300px]">
          <div className="flex items-center gap-3 mb-2">
            <FaHospital className="text-black text-3xl" />
            <h2 className="text-xl font-semibold text-maintext">Cources</h2>
          </div>
          <p className="text-gray-600 text-2xl font-semibold mt-12">{stats?.lessonsCount}</p>
        </div>



      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-surface p-6 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr className=" bg-[#9dc7b9] text-white">
                <th className="px-6 py-3 font-semibold">Sl.No</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4"> {indexOfFirstItem + index + 1}</td>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{item.email}</td>
                  <td className="px-6 py-4">{item.role}</td>
                  <td className="px-6 py-4">
                    <span>{item.status}</span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-4">
                      <button className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition">
                        View
                      </button>

                      <button className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end items-center gap-3 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-black shadow hover:opacity-90 transition"
            >
              Prev
            </button>

            <span className="px-3 py-1 bg-gray-200 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:bg-gray-400 transition "
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="w-80 flex-shrink-0 space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <span className="text-sm text-gray-500">Live</span>
              </div>

              <ul className="space-y-3">
                {recentActivities.map((act) => (
                  <li key={act.id} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 text-green-700">
                      <FaClock />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{act.text}</p>
                      <p className="text-xs text-gray-500">{act.time}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <button className="mt-4 w-full text-sm px-3 py-2 rounded-lg bg-greenbtn text-white shadow">
                View all
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <FaCalendarCheck className="text-2xl text-green-700" />
                <h3 className="text-lg font-semibold">Appointments</h3>
              </div>
              <p className="text-sm text-gray-600">
                Next: Abi — Today, 4:30 PM
              </p>
              <p className="text-sm text-gray-500 mt-2">
                2 new bookings • 1 cancellation
              </p>
              <button className="mt-4 w-full text-sm px-3 py-2 rounded-lg bg-gradient-to-r from-[#fbbf24] to-[#fbbf24] text-black shadow">
                Manage
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
