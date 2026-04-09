import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const styles = {
    Open: "bg-yellow/20 text-yellow",
    "In Progress": "bg-peach/40 text-darkgreen",
    Resolved: "bg-greenmuted/30 text-darkgreen",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full w-fit ${styles[status]}`}
    >
      <span className="w-2 h-2 rounded-full bg-darkgreen"></span>
      {status}
    </span>
  );
};

// MOCK DATA (WITH RESPONSES)
const complaints = [
  {
    id: "1Step-001",
    name: "Ram",
    role: "Provider",
    subject: "Login Issue",
    status: "Open",
    date: "Thu Apr 02 2026",
    time: "10:30 AM",
    image: "https://via.placeholder.com/500",
    responses: [
      {
        text: "We are checking your issue. Please wait.",
        date: "Apr 2, 10:45 AM",
      },
    ],
  },
  {
    id: "1Step-002",
    name: "Mary",
    role: "Parent",
    subject: "Payment Failed",
    status: "In Progress",
    date: "Wed Apr 01 2026",
    time: "02:15 PM",
    image: null,
    responses: [
      {
        text: "Try again after clearing cache.",
        date: "Apr 1, 03:00 PM",
      },
    ],
  },
  {
    id: "1Step-003",
    name: "Alex",
    role: "Center",
    subject: "Dashboard Crash",
    status: "Resolved",
    date: "Tue Mar 31 2026",
    time: "11:00 AM",
    image: "https://via.placeholder.com/500",
    responses: [],
  },
];

const AllComplaints = () => {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  const filtered =
    filter === "All"
      ? complaints
      : complaints.filter((c) => c.status === filter);

  return (
    <div className="relative bg-offwhite min-h-screen p-6">
      
      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>

      {/* MAIN CONTENT */}
      <div className={`${selected ? "blur-sm" : ""} transition`}>

        <div className="bg-white rounded-3xl shadow border border-greenmuted/20 p-6">

          {/* HEADER */}
          <div className="p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-darkgreen">
                All Complaints
              </h2>
              <span className="bg-offwhite px-2 py-1 rounded text-sm">
                {filtered.length}
              </span>
            </div>

            {/* FILTER */}
            <div className="flex gap-2 bg-offwhite p-1 rounded-xl ">
              {["All", "Open", "In Progress", "Resolved"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    filter === tab
                      ? "bg-white shadow text-greenmuted text-sm"
                      : "text-greenmuted"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl border border-greenmuted/10">
            <table className="w-full text-sm rounded-2xl shadow-md">

              <thead className="bg-offwhite text-darkgreen text-xs uppercase">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-[#8fa797] uppercase tracking-wider">User</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-[#8fa797] uppercase tracking-wider">Subject</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-[#8fa797] uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-[#8fa797] uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-[#8fa797] uppercase tracking-wider">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-offwhite transition">

                    {/* USER */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-darkgreen text-white flex items-center justify-center">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-darkgreen">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SUBJECT */}
                    <td className="text-gray-600">{item.subject}</td>

                    {/* DATE */}
                    <td>
                      <p className="font-medium text-darkgreen">
                        {item.date}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.time}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    {/* ACTION */}
                    <td className="text-right pr-6">
                      <button
                        onClick={() => setSelected(item)}
                        className="text-darkgreen"
                      >
                        <FaEye />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMPTY */}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No complaints found
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        />
      )}

      {/* DRAWER */}
      {selected && (
        <div className="fixed top-0 right-0 h-full w-[400px] bg-white z-50 shadow-2xl p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-darkgreen">
              Complaint Details
            </h2>
            <button onClick={() => setSelected(null)}>✕</button>
          </div>

          {/* USER */}
          <div className="flex gap-3 items-center bg-offwhite p-4 rounded-xl mb-4">
            <div className="w-12 h-12 rounded-full bg-darkgreen text-white flex items-center justify-center">
              {selected.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-darkgreen">
                {selected.name}
              </p>
              <p className="text-sm text-gray-500">
                {selected.role}
              </p>
            </div>
          </div>

          {/* STATUS */}
          <div className="mb-4">
            <StatusBadge status={selected.status} />
          </div>

          {/* DATE */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-offwhite p-3 rounded-xl">
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium">{selected.date}</p>
            </div>
            <div className="bg-offwhite p-3 rounded-xl">
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-medium">{selected.time}</p>
            </div>
          </div>

          {/* SUBJECT */}
          <div className="mb-4">
            <p className="text-xs text-gray-500">Subject</p>
            <p className="font-medium text-darkgreen">
              {selected.subject}
            </p>
          </div>

         

          {/* IMAGE */}
          {selected.image && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Attachment</p>
              <img
                src={selected.image}
                className="w-full h-52 object-cover rounded-xl border"
              />
            </div>
          )}

 {/* RESPONSE PREVIEW */}
          {selected.responses && selected.responses.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">
                Admin Response
              </p>

              <div
                onClick={() => setShowMessage(true)}
                className="bg-greenmuted/20 p-3 rounded-xl cursor-pointer hover:bg-greenmuted/30"
              >
                <p className="text-sm text-darkgreen line-clamp-2">
                  {
                    selected.responses[
                      selected.responses.length - 1
                    ].text
                  }
                </p>
              </div>
            </div>
          )}



        </div>
      )}

      {/* MESSAGE POPUP */}
      {showMessage && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white w-[400px] rounded-2xl p-6 shadow-xl">

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-darkgreen">
                Admin Message
              </h3>
              <button onClick={() => setShowMessage(false)}>✕</button>
            </div>

            <div className="bg-offwhite p-4 rounded-xl">
              <p className="text-sm text-gray-700">
                {
                  selected.responses[
                    selected.responses.length - 1
                  ].text
                }
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {
                  selected.responses[
                    selected.responses.length - 1
                  ].date
                }
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
export default AllComplaints;