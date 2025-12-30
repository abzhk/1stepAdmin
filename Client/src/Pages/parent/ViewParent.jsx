import React, { useEffect, useState } from "react";
import { AiFillEye } from "react-icons/ai";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaChild } from "react-icons/fa";
import { CiPhone } from "react-icons/ci";
import { useNavigate, useOutletContext } from "react-router-dom";

function ViewParent() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParents, setTotalParents] = useState(0);

  const { searchTerm } = useOutletContext();

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

  const handleDelete = async (parentId) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/admin/parent/user/${parentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete parent");
      }
      setParents((prev) => prev.filter((parent) => parent._id !== parentId));
    } catch (error) {
      console.error("Delete parent error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-background  min-h-screen">

      {/* Error */}
      {error && (
        <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-500 font-medium text-lg">
            Loading parents...
          </div>
        ) : parents.length > 0 ? (
          parents.map((parent, index) => {
            return (
              <div
                key={parent._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300  flex flex-col justify-between  border-gray-100 "
              >
                {/* Card Header */}
                <div className=" mb-2 ">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-2  h-52">
                    {parent.userRef?.profilePicture && (
                      <img
                        src={parent.userRef?.profilePicture}
                        alt={parent.parentDetails?.fullName}
                        className="w-72 h-52 object-cover"
                      />
                    )}
                  </div>
                  <div className="p-1 ">
                    <div className="p-1  mb-2 ml-1">
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                        {parent.parentDetails?.fullName}
                      </h2>
                    </div>
                

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-700">
                    <div className="flex items-center text-gray-600 text-sm ml-2">
                      {/* <FaChild className="text-secondarytext mr-2 " /> */}
                      <span className="font-semibold">Child Name : </span>
                      <span>{parent.parentDetails?.childName}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm ml-2">
                      {/* <CiPhone className="text-blue-500 mr-2 " /> */}
                      <span className="font-semibold">Phone: </span>
                      <span>{parent.parentDetails?.phoneNumber}</span>
                    </div>
                  </div>
                  <div className=" flex items-center  gap-3 ml-2">
                    {/* View Button */}
                    <button
                      onClick={() =>
                        navigate(`/parent-stats-card/${parent.userRef?._id}`)
                      }
                      className="flex items-center  justify-center gap-2 px-4 py-2 rounded-2xl bg-button text-white font-medium shadow-md
               hover:bg-lighthov transition duration-150 w-40"
                    >
                      <AiFillEye className="text-xl" />
                      <span>View Details</span>
                    </button>

                    <button
                     onClick={() => navigate(`/parent/edit/${parent.userRef?._id}`)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl
                               bg-blue-50 text-blue-600 hover:bg-blue-100
                               transition shadow-sm"
                      title="Edit"
                    >
                      <FiEdit2 className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(parent.userRef?._id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl
                             bg-red-50 text-red-600 hover:bg-red-100
                             transition shadow-sm"
                      title="Delete"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                    </div>
                </div>
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
