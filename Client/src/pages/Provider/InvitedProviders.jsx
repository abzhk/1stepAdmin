import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api";

const InvitedProviders = () => {
  const { id } = useParams();
  

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchInvitedProviders = async () => {
      try {
        setLoading(true);
        setError("");


        const res = await api(
          `/api/invite/centres/${id}/invited-providers`
        );

        setData(res.data || []);
      } catch (err) {
        console.error("Invite fetch error:", err);
        setError(err.message || "Failed to load invited providers");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitedProviders();
  }, [id]);

  return (
    <div className="p-4 bg-white rounded-3xl shadow-md w-full mt-4">
      <p className="text-lg font-semibold text-gray-800 mb-4">
        Invited Providers
      </p>


      {error && (
        <div className="text-red-600 bg-red-100 p-3 rounded mb-3">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500 ">No invited providers found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-darkgreen">
              <tr>
                <th className="px-4 py-3 text-white text-sm text-left">Name</th>
                <th className="px-4 py-3 text-white text-sm text-left">Email</th>
                <th className="px-4 py-3 text-white text-sm text-left">Phone</th>
                <th className="px-4 py-3 text-white text-sm text-left">Status</th>
                <th className="px-4 py-3 text-white text-sm text-left">Fee</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                 
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img
                      src={item.providerProfile || "/default-avatar.png"}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium">
                      {item.providerName || "Invited (Not Joined)"}
                    </span>
                  </td>

                
                  <td className="px-4 py-3">
                    {item.providerEmail || item.invitedEmail}
                  </td>

               
                  <td className="px-4 py-3">
                    {item.providerPhone || "-"}
                  </td>

              
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full capitalize ${
                        item.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                
                  <td className="px-4 py-3">
                    ₹{item.consultationFee || "-"}
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

export default InvitedProviders;