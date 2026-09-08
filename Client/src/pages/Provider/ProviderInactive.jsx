import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUser,
  FaPhone,
  FaCircle,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";


const ProviderInactive = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  const getInactiveProviders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api(`/api/provider/inactive-providers`);

      if (!data.success) throw new Error(data.message || "Failed");

      console.log("Inactive Providers API Response:", data.providers);

      setProviders(data.providers || []);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    getInactiveProviders();
  }, []);

  const handleActive = async (providerId) => {
    try {
      const data = await api(
        `/api/provider/admin/provider/status`,
        {
          method: "PUT",
          body: JSON.stringify({
            providerId,
            isActive: true,
          }),
        }
      );

      if (!data.success) {
        throw new Error(data.message || "Activation failed");
      }

      toast.success("Provider activated successfully");

      setProviders((prev) =>
        prev.filter((p) => p._id !== providerId)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (providerId) => {
    try {
      const data = await api(
        `/api/admin/providers/${providerId}`,
        {
          method: "DELETE",
        }
      );

      if (!data.success) {
        throw new Error(data.message || "Deletion failed");
      }

      toast.success("Provider deleted successfully");

      setShowDeleteModal(false);
      setSelectedProviderId(null);

      await getInactiveProviders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-offwhite">

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/allproviders")}
        className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Inactive Providers
      </h1>

      {/* Error */}
      {error && (
        <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading / Empty / Table */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : providers.length === 0 ? (
        <p className="text-gray-500">No inactive providers found</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm text-left">

            {/* Table Header */}
            <thead className="bg-offwhite/50 text-gray-700 uppercase text-xs">
              <tr>

                {/* Name Header */}
                <th className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaUser size={13} />
                    <span>Provider Name</span>
                  </div>
                </th>

                {/* Phone Header */}
                <th className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaPhone size={13} />
                    <span>Phone Number</span>
                  </div>
                </th>

                {/* Status Header */}
                <th className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaCircle size={11} />
                    <span>Status</span>
                  </div>
                </th>

                {/* Action Header */}
                <th className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <FaCheckCircle size={13} />
                    <span>Action</span>
                  </div>
                </th>

              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {providers.map((p) => {

                const providerName = p.fullName || "Unknown";

                const firstLetter = providerName
                  .charAt(0)
                  .toUpperCase();

                return (
                  <tr
                    key={p._id}
                    className="hover:bg-offwhite transition"
                  >

                    {/* Provider Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        {/* First Letter Avatar */}
                        <div className="w-9 h-9 rounded-full bg-green-50 text-darkgreen flex items-center justify-center font-semibold">
                          {firstLetter}
                        </div>

                        {/* Provider Name */}
                        <span className="font-medium text-gray-900">
                          {providerName}
                        </span>

                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {p.phone || "-"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                        <FaCircle size={7} />
                        Inactive
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-5">

                        {/* Activate */}
                        <button
                          onClick={() => handleActive(p._id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-darkgreen text-white hover:bg-green-700 transition"
                        >
                          <FaCheckCircle size={13} />
                          Activate
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setSelectedProviderId(p._id);
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                        >
                          <FaTrash size={13} />
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">

            <h2 className="text-lg font-semibold text-gray-800">
              Delete Provider
            </h2>

            <p className="text-gray-600 mt-2">
              Are you sure you want to delete this provider?
            </p>

            <div className="flex justify-end gap-3 mt-6">

              {/* Cancel */}
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProviderId(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              {/* Confirm Delete */}
              <button
                onClick={() => handleDelete(selectedProviderId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
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

export default ProviderInactive;

