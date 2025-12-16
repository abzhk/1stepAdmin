import React, { useEffect, useState } from "react";
import { AiFillEye } from "react-icons/ai";
import { FiSearch} from "react-icons/fi";
import { FaChild } from "react-icons/fa";
import { CiPhone } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

function ViewParent() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParents, setTotalParents] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  const getParents = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        limit: String(limit),
        startIndex: String((page - 1) * limit),
      });

      if (searchTerm.trim()) params.append("searchTerm", searchTerm);

      const res = await fetch(
        `http://localhost:3001/api/parent/getallparents?${params.toString()}`
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");

      setParents(data.parents || []);
      setTotalPages(data.totalPages || 1);
      setTotalParents(data.totalParents || 0);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getParents();
  }, [page, searchTerm]);

  const fromIndex = parents.length ? (page - 1) * limit + 1 : 0;
  const toIndex = (page - 1) * limit + parents.length;

  return (
    <div className="p-4 md:p-10 bg-secondary  min-h-screen">

      <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-0">
          Parent 
        </h1>

        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-3 text-gray-500 text-lg" />
          <input
            type="text"
            placeholder="Search parent..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-icon focus:border-icon transition"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-500 font-medium text-lg">
            Loading parents...
          </div>
        ) : parents.length > 0 ? (
          parents.map((parent, index) => {
            const fullName =
              parent.parentDetails?.fullName ||
              parent.userRef?.username ||
              "-";
            const childName = parent.parentDetails?.childName || "-";
            const phone = parent.parentDetails?.phoneNumber || "-";

            return (
              <div
                key={parent._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-6 flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12  rounded-full bg-icon text-white flex items-center justify-center font-bold text-xl mr-4">
                    {fullName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                      {fullName}
                    </h2>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-700">
                 <div className="flex items-center text-gray-600 text-sm">
                                     <FaChild className="text-secondarytext mr-2 " />
                    <span className="font-semibold">Child Name : </span>
                     <span>{childName}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                                     <CiPhone className="text-blue-500 mr-2 " />
                    <span className="font-semibold">Phone: </span>
                    <span>{phone}</span>
                  </div>
                </div>

                {/* View Button */}
                <button
                   onClick={() => navigate(`/parent-stats-card/${parent.userRef._id}`)}
                  className="mt-2 flex items-center justify-center gap-2 bg-greenbtn text-white py-2 rounded-2xl font-medium hover:bg-lighthov transition duration-150 shadow-md"
                >
                  <AiFillEye className="text-xl" />
                  <span>View Details</span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500 font-medium text-lg">
            No results found
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-8 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-700 mb-4 md:mb-0">
          Showing <b>{fromIndex}</b> to <b>{toIndex}</b> of{" "}
          <b>{totalParents}</b>
        </p>

        <div className="flex gap-3 items-center">
          <button
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            ← Prev
          </button>

          <span className="text-sm font-semibold text-gray-800">
            Page {page} of {totalPages}
          </span>

          <button
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewParent;
