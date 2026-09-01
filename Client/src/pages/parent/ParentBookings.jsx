import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dateFormatUtils from "../../utils/dateFormatUtils";
import {api} from "../../utils/api.js"

import  {
  formatTimeRangeAMPM,
} from "../../utils/dateHelpers.js";

const ParentBookings = () => {
  const { userId } = useParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");



        const data = await api(
          `/api/parent/bookings/${userId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
console.log("Fetched bookings:", data.bookings);
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  return (
    <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">Bookings</h3>
      </div>

      {loading && (
        <div className="p-6 text-gray-400">Loading bookings...</div>
      )}

      {error && (
        <div className="p-6 text-red-500">{error}</div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="p-6 text-gray-400">No bookings found</div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Slot</th>
                <th className="px-6 py-4 text-left">Provider</th>
                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b._id}
                  className="border-t border-gray-100 hover:bg-gray-50 text-table-text transition"
                >
                  <td className="px-6 py-4 font-medium">
                    {dateFormatUtils(b.scheduledTime?.date)}
                  </td>

                 
                   <td className="px-6 py-4">
  {b.appointment?.startTime
    ? formatTimeRangeAMPM(
        b.appointment.startTime,
        b.appointment.durationMinutes || 30
      )
    : "—"}
</td>

                  <td className="px-6 py-4">
                    {b.provider?.fullName || "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                      {b.status || "Booked"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentBookings;
