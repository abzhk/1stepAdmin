import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const InActiveCentre = () => {
  const [centres, setCentres] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchInactive = async () => {
      try {
        const res = await api("/api/provider/centre/inactive-list");
        console.log("INACTIVE:", res);
        setCentres(res.centres || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInactive();
  }, []);

  const handleActivate = async (centre) => {
  try {
    const res = await api("/api/provider/centre/set-active-status", {
      method: "PUT",
      body: JSON.stringify({
        centreId: centre._id,
        isActive: true,
      }),
    });

    if (res.success) {
      setCentres((prev) =>
        prev.filter((c) => c._id !== centre._id)
      );
    }
  } catch (err) {
    console.error(err);
    alert("Activation failed");
  }
};
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this centre?")) return;

    try {
      const res = await api(`/api/provider/centre/${id}`, "DELETE");

      if (res.success) {
        setCentres((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 bg-[#f8f6f2] min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">
          Inactive Centres
        </h1>

       
      </div>
       <button
          onClick={() => navigate("/centre-list")}
          className="px-4 py-2  text-darkgreen rounded-xl"
        >
          ← Back
        </button>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">Centre Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {centres.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-6 text-gray-400">
                  No inactive centres found
                </td>
              </tr>
            ) : (
              centres.map((c) => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  
                  <td className="p-3 font-medium text-green-900">
                    {c.fullName}
                  </td>

                  <td className="p-3 text-gray-700">
                    {c.email || "-"}
                  </td>

                  <td className="p-3 text-gray-700">
                    {c.phone || "-"}
                  </td>

                  {/* Actions */}
                  <td className="p-3 flex gap-2">
                    
                    {/* Activate */}
                    <button
                      onClick={() => handleActivate(c)}
                      className="px-3 py-1 bg-darkgreen text-white rounded-lg hover:bg-green-600"
                    >
                      Active
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>

                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default InActiveCentre;