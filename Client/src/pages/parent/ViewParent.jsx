import React, { useEffect, useState } from "react";
import { AiFillEye } from "react-icons/ai";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaChild } from "react-icons/fa";
import { CiPhone } from "react-icons/ci";
import { useNavigate, useOutletContext } from "react-router-dom";
import {api} from "../../utils/api.js"
import toast from "react-hot-toast";

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

      const data = await api(`/api/parent/getallparents?${params.toString()}`);


      setParents(data.parents || []);
      setTotalPages(data.totalPages || 1);
      setTotalParents(data.totalParents || 0);
    } catch (err) {
      setError(err.message);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    getParents();
  }, [page, searchTerm]);

  const fromIndex = parents.length ? (page - 1) * limit + 1 : 0;
  const toIndex = (page - 1) * limit + parents.length;

  const changeStatus = async (userId, newStatus) => {
    try {
      

      const data = await api(`/api/parent/admin/parent/status`, {
        method: "PUT",
        body: JSON.stringify({
          userId,
          isActive: newStatus,
        }),
      });
if (!data.success) {
  throw new Error(data.message);
}
toast.success(`Parent ${newStatus ? "activated" : "deactivated"}`);

      setParents((prev) =>
        prev.map((p) =>
          p.userRef?._id === userId
            ? { ...p, userRef: { ...p.userRef, isActive: newStatus } }
            : p,
        ),
      );
    } catch (err) {
     console.log(err);
      setError(err.message || "Failed to update status");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-offwhite  min-h-screen">
      {/* Error */}
      {error && (
        <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

<div className="flex justify-end mb-6">
  <button  onClick={() => navigate("/inactive-parents")} className="px-4 py-2 rounded-xl font-semibold shadow transition bg-yellow">Inactive users
    </button>
</div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-14">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-500 font-medium text-lg">
            Loading parents...
          </div>
        ) : parents.length > 0 ? (
          parents.map((parent) => {
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
                   {/* <button
                        onClick={() =>
                          changeStatus(
                            parent.userRef?._id,
                            !parent.userRef?.isActive,
                          )
                        }
                        className={`px-3 py-2 rounded-xl text-sm font-medium shadow-sm transition
                     ${
                       parent.userRef?.isActive
                         ? "bg-red-50 text-red-600 hover:bg-red-100"
                         : "bg-green-50 text-green-600 hover:bg-green-100"
                     }`}
                      >
                        {parent.userRef?.isActive ? "Deactivate" : "Activate"}
                      </button> */}
                  <div className="p-1 ">
                     <div className="flex items-start justify-between">
                  <h2 className="font-semibold text-gray-900 text-lg leading-snug">
                    {parent.parentDetails?.fullName}
                  </h2>

                  <button
                        onClick={() =>
                          changeStatus(
                            parent.userRef?._id,
                            !parent.userRef?.isActive,
                          )
                        }
                        className={`text-xs px-3 py-1 rounded-full font-medium
                     ${
                       parent.userRef?.isActive
                         ? "bg-red-50 text-red-600 hover:bg-red-100"
                         : "bg-green-50 text-green-600 hover:bg-green-100"
                     }`}
                      >
                        {parent.userRef?.isActive ? "Deactivate" : "Activate"}
                      </button>
                </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4 text-sm  mt-4">
                      <div className="flex items-center  text-sm gap-2">
                        {/* <FaChild className="text-secondarytext mr-2 " /> */}
                        <span className="font-semibold">Client Name : </span>
                        <span>{parent.parentDetails?.childName}</span>
                      </div>
                      <div className="flex items-center  text-sm gap-2">
                        {/* <CiPhone className="text-blue-500 mr-2 " /> */}
                        <span className="font-semibold">Phone: </span>
                        <span>{parent.parentDetails?.phoneNumber}</span>
                      </div>
                    </div>
                    <div className=" flex items-center justify-center  gap-3 ">
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
                        onClick={() =>
                          navigate(`/parent/edit/${parent.userRef?._id}`)
                        }
                        className="w-10 h-10 flex items-center justify-center rounded-xl
                               bg-blue-50 text-blue-600 hover:bg-blue-100
                               transition shadow-sm"
                        title="Edit"
                      >
                        <FiEdit2 className="text-lg" />
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
