import React, { useState,useEffect } from "react";


import {
  FaUserInjured,
  FaUserMd,
  FaHospital,
  FaClock,
  FaCalendarCheck,
} from "react-icons/fa";

const MainDashboard = () => {
 

  const recentActivities = [
    {id: 1,time: "2m ago",text: "Appointment booked — Abi",type: "appointment",},
    {id: 2,time: "15m ago",text: "Provider onboarding — Arun",type: "provider",},
    {id: 3,time: "1h ago",text: "Profile updated — Jenish",type: "profile",},
    {id: 4,time: "3h ago",text: "Appointment cancelled — Kumar",type: "appointment",},
    {id: 5,time: "1d ago",text: "New clinic added — Vibin Clinic",type: "clinic",},
  ];
  

  const [stats, setStats] = useState(null);
const [recentBookings, setRecentBookings] = useState([]);

 const [parents, setParents] = useState([]);
const [providers, setProviders] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 4;


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

useEffect(() => {
  fetchParentandProvider();
}, [currentPage]);

const fetchParentandProvider = async () => {
  try {
    setLoading(true);
    setError("");

    const startIndex = (currentPage - 1) * itemsPerPage;

    const params = new URLSearchParams({
      limit: itemsPerPage,
      startIndex,
    });

    const res = await fetch(
      `http://localhost:3001/api/admin/parents-providers/list?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    setParents(data.parents || []);
    setProviders(data.providers || []);
  } catch (err) {
    setError(err.message || "Failed to load data");
  } finally {
    setLoading(false);
  }
};

const tableData = [
    ...parents.map((p) => ({
      name: p.userRef?.username ,
      email: p.userRef?.email ,
      role: "Patient",
    })),
    ...providers.map((p) => ({
      name: p.fullName ,
      email: p.email,
      role: "Provider",
    })),
  ];


const totalPages = Math.max(1, Math.ceil(tableData.length / itemsPerPage));

useEffect(() => {
  fetchRecentBookings();
}, []);


const fetchRecentBookings = async () => {
  try {
    const res = await fetch("http://localhost:3001/api/booking/recent", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to load recent bookings");
      return;
    }

    setRecentBookings(data.bookings || []);
  } catch (err) {
    console.error("Recent bookings fetch error:", err);
  }
};


  return (
    <div>
  
    <div className="min-h-screen p-6 bg-background">
      <div className="flex gap-4 mb-8 h-44">
        <div className="flex flex-col bg-gradient-to-l from-white to-gray-50 p-6 rounded-2xl shadow-md border border-gray-200 min-w-[280px] ">
          <div className="flex items-center gap-3 mb-2">
            <FaUserInjured className="text-black text-3xl" />
            <h2 className="text-xl font-semibold text-maintext">Patients</h2>
          </div>
          <p className="text-gray-600 text-2xl font-semibold mt-12"> {stats?.totalParents}</p>
        </div>

        <div className="flex-col bg-gradient-to-l from-white to-gray-50  p-6 rounded-2xl shadow-xl border border-gray-200 min-w-[280px]">
          <div className="flex items-center gap-3 mb-2">
            <FaUserMd className="text-black text-3xl" />
            <h2 className="text-xl font-semibold text-maintext">Providers</h2>
          </div>
          <p className="text-gray-600 text-2xl font-semibold mt-12">{stats?.totalProviders}</p>
        </div>

        <div className="flex-col  bg-gradient-to-l from-white to-gray-50  p-6 rounded-2xl shadow-xl border border-gray-200 min-w-[280px]">
          <div className="flex items-center gap-3 mb-2">
            <FaHospital className="text-black text-3xl" />
            <h2 className="text-xl font-semibold text-maintext">Bookings</h2>
          </div>
          <p className="text-gray-600 text-2xl font-semibold mt-12">{stats?.totalBookings}</p>
        </div>
        
<div className="flex-col  bg-gradient-to-l from-white to-gray-50  p-6 rounded-2xl shadow-xl border border-gray-200 min-w-[280px]">
          <div className="flex items-center gap-3 mb-2">
            <FaHospital className="text-black text-3xl" />
            <h2 className="text-xl font-semibold text-maintext">Cources</h2>
          </div>
          <p className="text-gray-600 text-2xl font-semibold mt-12">{stats?.lessonsCount}</p>
        </div>



      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-surface p-6 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto bg-white">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr className=" bg-primary text-white">
                <th className="px-6 py-3 font-semibold">Sl.No</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Role</th>
              </tr>
            </thead>
              <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-red-500">
                  {error}
                </td>
              </tr>
            ) : tableData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  No records found
                </td>
              </tr>
            ) : (
              tableData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{item.email}</td>
                  <td className="px-6 py-4">{item.role}</td>
                </tr>
              ))
            )}
          </tbody>
          </table>

         <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Prev
          </button>

          <span className="px-3 py-2 bg-gray-100 rounded">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
        </div>

        <div className="flex gap-6">
          <aside className="w-80  space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <span className="text-sm text-gray-500">Live</span>
              </div>

             <ul className="space-y-3">
  {recentBookings.length === 0 ? (
    <p className="text-gray-500 text-sm">No recent activity</p>
  ) : (
    recentBookings.slice(0, 5).map((book) => (
      <li key={book._id} className="flex items-start gap-3 py-1.5">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 text-green-700">
          <FaClock />
        </div>

        <div className="flex-1">
          <p className="text-sm font-normal">
            {book.patientDetails?.username} booked  with {book.providerDetails?.fullName}
          </p>

        </div>
      </li>
    ))
  )}
</ul>


              {/* <button className="mt-4 w-full text-sm px-3 py-2 rounded-lg bg-greenbtn text-white shadow">
                View all
              </button> */}
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <FaCalendarCheck className="text-2xl text-green-700" />
                <h3 className="text-lg font-semibold">Appointments</h3>
              </div>
              <p className="text-sm text-gray-600">
                Next: Will — Today, 4:30 PM
              </p>
              <p className="text-sm text-gray-500 mt-2">
                2 new bookings • 1 cancellation
              </p>
              <button className="mt-4 w-full text-sm px-3 py-2 rounded-lg bg-button text-white shadow">
                Manage
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MainDashboard;
