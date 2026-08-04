import React, { useState, useEffect } from "react";
import { AiFillEye } from "react-icons/ai";
import { FiEdit2, FiGrid, FiList } from "react-icons/fi";
import { useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";
import SortableHeader from "../../Components/SortableHeader";


function ProviderView() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { searchTerm } = useOutletContext();

  const [providerType, setProviderType] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortConfig, setSortConfig] = useState({
  key: "createdAt",
  direction: "desc",
});

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          limit: String(limit),
          startIndex: String((page - 1) * limit),
           sort: sortConfig.key,
  order: sortConfig.direction,
        });

        if (providerType) {
          params.append("providerType", providerType);
        }

        if (searchTerm.trim()) {
          params.append("searchTerm", searchTerm.trim());
        }

        const data = await api(`/api/provider/individual-list?${params}`);

        setProviders(data.providers || []);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [page, searchTerm, providerType, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const changeStatus = async (providerId, newStatus) => {
    try {
      setError("");

      const data = await api(`/api/provider/admin/provider/status`, {
        method: "PUT",
        body: JSON.stringify({
          providerId,
          isActive: newStatus,
        }),
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      toast.success(
        `Provider ${newStatus ? "activated" : "deactivated"}`
      );

      if (newStatus === false) {
        setProviders((prev) => prev.filter((p) => p._id !== providerId));
        setTotalCount((prev) => prev - 1);
      } else {
        setProviders((prev) =>
          prev.map((p) =>
            p._id === providerId ? { ...p, isActive: newStatus } : p
          )
        );
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Something went wrong");
      toast.error(error.message || "Failed to update status");
    }
  };

const handleSort = (key) => {
  const direction =
    sortConfig.key === key && sortConfig.direction === "asc"
      ? "desc"
      : "asc";

  setPage(1);

  setSortConfig({
    key,
    direction,
  });
};



  return (
    <div className="p-4 md:p-6 bg-offwhite min-h-screen">
      {error && (
        <div className="mb-6 text-red-700 bg-red-100 border border-red-300 px-4 py-3 rounded-xl">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6">

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg border ${
              viewMode === "grid"
                ? "bg-darkgreen text-white"
                : "bg-white text-gray-600"
            }`}
          >
            <FiGrid size={18} />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg border ${
              viewMode === "list"
                ? "bg-darkgreen text-white"
                : "bg-white text-gray-600"
            }`}
          >
            <FiList size={18} />
          </button>
        </div>

        <div className="flex gap-2">
          {/* <select
            value={providerType}
            onChange={(e) => {
              setProviderType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-lg mr-3"
          >
            <option value="">All</option>
            <option value="individual">Individual</option>
            <option value="centre">Centre</option>
          </select> */}

<button  onClick={() => navigate("/admin-verify")} className="px-4 py-2 rounded-xl text-white font-semibold shadow transition bg-darkgreen hover:bg-yellow hover:text-darkgreen">
            Claim Profile
          </button>
          <button
            onClick={() => navigate("/inactive-providers")}
            className="px-4 py-2 rounded-xl text-white font-semibold shadow transition bg-darkgreen hover:bg-yellow hover:text-darkgreen"
          >
            Inactive users
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-14">

          {loading ? (
            <div className="col-span-full text-center py-10 text-xl text-gray-500 font-medium">
              Loading providers...
            </div>
          ) : providers.length > 0 ? (
            providers.map((provider) => {
              const therapies = Array.isArray(provider.therapytype)
                ? provider.therapytype
                : provider.therapytype
                ? [provider.therapytype]
                : [];

              return (
                <div
                  key={provider._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100"
                >
                  <div>
                    {provider.profilePicture && (
                      <img
                        src={provider.profilePicture}
                        alt={provider.fullName}
                        className="w-full h-52 object-cover rounded-t-xl"
                      />
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <h2 className="font-semibold text-lg">
                        {provider.fullName}
                      </h2>

                      <button
                        onClick={() =>
                          changeStatus(provider._id, !provider.isActive)
                        }
                        className={`px-2 py-1 rounded-lg text-xs ${
                          provider.isActive
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {provider.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>

                    <div className="text-cardfooter uppercase mb-2">
                      <span>City : </span>{" "}
                      {provider.address?.city || "N/A"}
                    </div>

                    <div className="flex flex-wrap gap-6  mb-4">
                      {therapies.length > 0 ? (
                        therapies.map((type, i) => (
                          <span
                            key={i}
                            className="  rounded-full bg-tag text-cardfooter"
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          N/A
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/provider-stats/${provider._id}`)
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-softpeach/60 text-white text-sm"
                      >
                        <AiFillEye />
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/providers/edit/${provider._id}`)
                        }
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              No providers found
            </div>
          )}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-2xl px-6 py-6">
        <div className="bg-white rounded-xl shadow  overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-offwhite  text-cardfooter uppercase text-left">
  <tr>

  <SortableHeader
  title="Provider"
  field="fullName"
  sortConfig={sortConfig}
  handleSort={handleSort}
/>

<SortableHeader
  title="City"
  field="city"
  sortConfig={sortConfig}
  handleSort={handleSort}
/>


<th className="p-3">Session</th>
<th className="p-3">Status</th>
<th className="p-3 text-right">Actions</th>
</tr>
</thead>

            <tbody>
              {providers.map((provider) => (
                <tr key={provider._id} className=" hover:bg-offwhite text-table-text">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={provider.profilePicture}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    {provider.fullName}
                  </td>

                  <td className="p-3">{provider.address?.city}</td>

                  <td className="p-3">
                    {Array.isArray(provider.therapytype)
                      ? provider.therapytype.join(", ")
                      : provider.therapytype}
                  </td>

                 <td className="p-3">
  

    <button
      onClick={() =>
        changeStatus(provider._id, !provider.isActive)
      }
      className={`px-3 py-2 rounded-lg text-xs font-medium ${
        provider.isActive
          ? "bg-red-100 text-red-600"
          : "bg-green-100 text-green-600"
      }`}
    >
      {provider.isActive ? "Deactivate" : "Activate"}
    </button>
</td>

                  <td className="p-3 flex justify-end gap-2">
                    <button
                      onClick={() =>
                        navigate(`/provider-stats/${provider._id}`)
                      }
                      className="p-2 bg-gray-100 rounded-lg"
                    >
                      <AiFillEye />
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/providers/edit/${provider._id}`)
                      }
                      className="p-2 bg-darkgreen text-white rounded-lg"
                    >
                      <FiEdit2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-8 pt-4">
        <p className="text-sm text-gray-600 mb-4 md:mb-0">
          Showing {(page - 1) * limit + 1} to{" "}
          {(page - 1) * limit + providers.length} of {totalCount} providers
        </p>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg"
          >
            ← Previous
          </button>

          <span className="text-sm font-semibold">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProviderView;