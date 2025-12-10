import React, { useState, useEffect } from "react";
import { AiFillEye } from "react-icons/ai";
import { FiSearch, FiMapPin, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function ViewProvider() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 9;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          limit: String(limit),
          startIndex: String((page - 1) * limit),
        });

        if (searchTerm.trim()) {
          params.append("searchTerm", searchTerm.trim());
        }

        const res = await fetch(
          `http://localhost:3001/api/provider/getProviders?${params.toString()}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch providers");
        }

        setProviders(data.providers || []);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [page, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <div className="p-4 md:p-10 bg-primary min-h-screen">
      {/* Top Header + Search */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Provider  ({totalCount})
        </h3>

        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search by name or city..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 text-red-700 bg-red-100 border border-red-300 px-4 py-3 rounded-xl">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Provider CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10 text-xl text-gray-500 font-medium">
            Loading providers...
          </div>
        ) : providers.length > 0 ? (
          providers.map((provider, index) => {
            const therapies = Array.isArray(provider.therapytype)
              ? provider.therapytype
              : provider.therapytype
              ? [provider.therapytype]
              : [];

            return (
              <div
                key={provider._id}
                className="bg-secondary rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-6 flex flex-col justify-between border border-gray-100"
              >
                {/* Card Header */}
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12  rounded-full bg-icon text-white flex items-center justify-center text-xl font-bold mr-4">
                    {(provider.fullName).charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {provider.fullName}
                    </h2>
                    {/* <p className="text-sm text-gray-500">
                      #{String((page - 1) * limit + index + 1).padStart(3, "0")}
                    </p> */}
                  </div>
                </div>

                {/* Provider Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <FiMapPin className="text-blue-500 mr-2 " />
                    <strong>City:</strong>
                    <span className="ml-1">{provider.address?.city }</span>
                  </div>

                  <div className="flex items-start text-gray-600 text-sm">
                    <FiUsers className="text-green-500 mt-0.5 mr-2 " />
                    <strong>Therapy:</strong>
                    <div className="flex flex-wrap gap-1 ml-1">
                      {therapies.length > 0 ? (
                        therapies.map((type, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          N/A
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => navigate(`/provider-stats/${provider._id}`)}
                  className="mt-4 flex items-center justify-center space-x-2 bg-greenbtn text-white py-2 rounded-2xl font-medium hover:bg-[#2d4a36] transition duration-150 shadow-md"
                >
                  <AiFillEye className="text-xl" />
                  <span>View Details</span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-10 text-xl text-gray-500 font-medium">
            No providers found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-8 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-4 md:mb-0">
          Showing{" "}
          <span className="font-semibold text-gray-800">
            {providers.length ? (page - 1) * limit + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-gray-800">
            {(page - 1) * limit + providers.length}
          </span>{" "}
          of <span className="font-semibold text-gray-800">{totalCount}</span> providers
        </p>

        <div className="flex gap-3 items-center">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((page) => page - 1)}
            disabled={page === 1}
          >
            ← Previous
          </button>

          <span className="text-sm font-semibold text-gray-700">
            Page {page} of {totalPages}
          </span>

          <button
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((page) => page + 1)}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewProvider;
