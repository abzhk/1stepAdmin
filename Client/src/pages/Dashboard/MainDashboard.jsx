import React, { useState,useEffect } from "react";


import {
  FaUserInjured,
  FaUserMd,
  FaHospital,
  FaClock,
  FaCalendarCheck,
  FaBookOpen,
  FaCreditCard,
  FaBuilding
} from "react-icons/fa";

const MainDashboard = () => {
  

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
       const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/track/stats`, {
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
 const API = import.meta.env.VITE_API_URL;
    const res = await fetch(
      `${API}/api/admin/parents-providers/list?${params.toString()}`,
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
 const API = import.meta.env.VITE_API_URL;
    const res = await fetch(`${API}/api/booking/recent`, {
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
 const statCards = [
    {
      icon: FaUserInjured,
      label: "Total Patients",
      value: stats?.totalParents || 0,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: FaUserMd,
      label: "Healthcare Providers",
      value: stats?.totalProviders || 0,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: FaCalendarCheck,
      label: "Total Bookings",
      value: stats?.totalBookings || 0,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      icon: FaBookOpen,
      label: "Active Courses",
      value: stats?.lessonsCount || 0,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      icon: FaBuilding,
      label: "Healthcare Centers",
      value: stats?.totalCentreProviders || 0,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    {
      icon: FaCreditCard,
      label: "Active Subscriptions",
      value: 0,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
  ];


  return (
    <div>
  
    <div className="min-h-screen p-6 bg-offwhite">
      <div className="flex gap-4 mb-4 h-44">
        <div className="flex flex-col w-full p-4 rounded-2xl shadow-md border border-gray-200 min-w-[280px] ">
           <div className="">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 ">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`text-lg ${stat.iconColor}`} />
                </div>
                {/* <span className="text-xs font-medium text-gray-400">Today</span> */}
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
        </div>
        </div>
        </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-surface p-6 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto bg-white">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr className=" bg-primary text-white">
                {/* <th className="px-6 py-3 font-semibold">Sl.No</th> */}
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
                  {/* <td className="px-6 py-4">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td> */}
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
