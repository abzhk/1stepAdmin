import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const InActiveCentre = () => {
  const [centres, setCentres] = useState([]);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCentreId, setSelectedCentreId] = useState(null);

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
        setCentres((prev) => prev.filter((c) => c._id !== centre._id));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to activate centre");
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await api(
        `/api/provider/centre/${selectedCentreId}`,
        "DELETE",
      );

      if (res.success) {
        setCentres((prev) => prev.filter((c) => c._id !== selectedCentreId));

        toast.success("Centre deleted successfully"); 
        setShowDeleteModal(false);
        setSelectedCentreId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete centre");
    }
  };

  return (
    <div className="p-6 bg-[#f8f6f2] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">Inactive Centres</h1>
      </div>
      <button
        onClick={() => navigate("/centre-list")}
        className="px-4 py-2  text-darkgreen rounded-xl"
      >
        ← Back
      </button>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4  rounded-2xl">
        <table className="w-full text-sm p-4 rounded-2xl">
          <thead className="bg-offwhite text-cardfooter uppercase text-xs">
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
                <td colSpan="4" className="text-center p-6 text-cardfooter uppercase">
                  No inactive centres found
                </td>
              </tr>
            ) : (
              centres.map((c) => (
                <tr key={c._id} className=" hover:bg-offwhite/50 text-table-text">
                  <td className="p-3 font-medium text-green-900">
                    {c.fullName}
                  </td>

                  <td className="p-3 text-gray-700">{c.email || "-"}</td>

                  <td className="p-3 text-gray-700">{c.phone || "-"}</td>

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
                      onClick={() => {
                        setSelectedCentreId(c._id);
                        setShowDeleteModal(true);
                      }}
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Delete Centre
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this centre?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InActiveCentre;
