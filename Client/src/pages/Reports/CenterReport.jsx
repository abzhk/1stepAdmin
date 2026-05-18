import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import dateFormatUtils from "../../utils/dateFormatUtils";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-700",
};

const CenterReport = () => {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate= useNavigate()

  const fetchAppointments = async (pageNumber = 1) => {
    try {
      const startIndex = (pageNumber - 1) * limit;

      const res = await api(
        `/api/provider/centre-appointments?limit=${limit}&startIndex=${startIndex}`
      );

      setAppointments(res.appointments);
      setTotal(res.total);
      setPage(pageNumber);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
  }, []);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-8 bg-offwhite min-h-screen">
      <button
              onClick={() => navigate("/reportdashboard")}
              className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
            >
              <IoIosArrowRoundBack size={22} />
              Back
            </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">


        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Centre Appointments
          </h1>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">

            <thead className="bg-offwhite text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Patient</th>
                <th className="px-6 py-4 text-left">Centre</th>
                <th className="px-6 py-4 text-left">Service</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Slot</th>
                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {appointments.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-8 text-gray-400"
                  >
                    No appointments found
                  </td>
                </tr>
              )}

              {appointments.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-gray-50 transition"
                >
          
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={item.patientDetails.profilePicture}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-800">
                      {item.patientName}
                    </span>
                  </td>

    
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {item.providerDetails.fullName}
                  </td>

                  
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.service.map((srv, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs "
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </td>

            
                  <td className="px-6 py-4 text-gray-600">
                    {dateFormatUtils(item.scheduledTime.date)}
                  </td>

            
                  <td className="px-6 py-4 text-gray-600">
                    {item.scheduledTime.slot}
                  </td>

        
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        statusColors[item.status] || "bg-gray-100"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        <div className="flex justify-end items-center gap-4 mt-6">

          <button
            disabled={page === 1}
            onClick={() => fetchAppointments(page - 1)}
            className={`px-4 py-2 rounded-md text-sm font-medium
              ${
                page === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-yellow text-white hover:bg-yellow"
              }`}
          >
            Prev
          </button>

          <span className="text-gray-600 text-sm">
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => fetchAppointments(page + 1)}
            className={`px-4 py-2 rounded-md text-sm font-medium
              ${
                page === totalPages || totalPages === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-yellow text-white hover:bg-yellow"
              }`}
          >
            Next
          </button>

        </div>

      </div>
    </div>
  );
};

export default CenterReport;