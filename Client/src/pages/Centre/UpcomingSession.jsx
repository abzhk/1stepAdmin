import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";

const UpcomingSession = () => {
  const navigate = useNavigate();

  const data = [
    {
      id: 1,
      centre: "Step Therapy Centre",
      provider: "Dr. Arun",
      date: "02 Apr 2026",
      time: "10:00 AM",
      status: "Scheduled",
    },
    {
      id: 2,
      centre: "Care Rehab Clinic",
      provider: "Dr. Meena",
      date: "03 Apr 2026",
      time: "11:30 AM",
      status: "Pending",
    },
    {
      id: 3,
      centre: "Hope Therapy Hub",
      provider: "Dr. John",
      date: "04 Apr 2026",
      time: "02:00 PM",
      status: "Scheduled",
    },
    {
      id: 4,
      centre: "Wellness Centre",
      provider: "Dr. David",
      date: "05 Apr 2026",
      time: "09:30 AM",
      status: "Pending",
    },
    {
      id: 5,
      centre: "Step Therapy Centre",
      provider: "Dr. Priya",
      date: "06 Apr 2026",
      time: "01:00 PM",
      status: "Scheduled",
    },
    {
      id: 6,
      centre: "Care Rehab Clinic",
      provider: "Dr. Kumar",
      date: "07 Apr 2026",
      time: "03:00 PM",
      status: "Scheduled",
    },
  ];


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-6 bg-offwhite min-h-screen">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-darkgreen"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>

      <h1 className="text-2xl font-bold text-green-900 mb-6">
        Upcoming Sessions
      </h1>

      <div className="bg-white rounded-3xl p-6 shadow-md">

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">

            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wide">
                <th>Centre</th>
                <th>Provider</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((s) => (
                <tr
                  key={s.id}
                  className="bg-[#faf9f6] rounded-xl hover:shadow-md transition"
                >
                  <td className="py-4 px-4 text-green-900 font-medium rounded-l-xl">
                    {s.centre}
                  </td>

                  <td className="px-4">{s.provider}</td>
                  <td className="px-4">{s.date}</td>
                  <td className="px-4">{s.time}</td>

                  <td className="px-4 rounded-r-xl">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        s.status === "Scheduled"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        <div className="flex justify-end items-center gap-4 mt-6">

          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-xl ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-900 text-white hover:bg-green-800"
            }`}
          >
            Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-xl ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-900 text-white hover:bg-green-800"
            }`}
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
};

export default UpcomingSession;