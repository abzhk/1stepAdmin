import React, { useState, useEffect } from "react";
import { AiFillEye } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
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
    <div className="p-10 bg-green-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-black">Provider List</h1>

        <div className="relative w-72">
          <FiSearch className="absolute left-3 top-3 text-gray-500 text-lg" />
          <input
            type="text"
            placeholder="Search provider..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-400 text-white text-left">
              <th className="px-6 py-4">SL.NO</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Therapy Type</th>
              <th className="px-6 py-4 text-center">View</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  Loading providers...
                </td>
              </tr>
            ) : providers.length > 0 ? (
              providers.map((provider, index) => (
                <tr
                  key={provider._id}
                  className="border-b hover:bg-gray-50 transition"
                >

                  <td className="px-6 py-4 font-medium text-gray-700">
                    {(page - 1) * limit + index + 1}
                  </td>

 
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                      {(provider.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                    <span>{provider.fullName}</span>
                  </td>


                  <td className="px-6 py-4 text-gray-600">
                    {provider.address?.city || "-"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-2xl text-black text-sm bg-gray-100">
                      {Array.isArray(provider.therapytype)
                        ? provider.therapytype.join(", ")
                        : provider.therapytype || "-"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        navigate(`/provider-stats/${provider._id}`)
                      }
                      className="text-black hover:text-green-900 transition text-2xl"
                    >
                      <AiFillEye />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold">
            {providers.length ? (page - 1) * limit + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-semibold">
            {(page - 1) * limit + providers.length}
          </span>{" "}
          of <span className="font-semibold">{totalCount}</span> providers
        </p>

        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewProvider;
