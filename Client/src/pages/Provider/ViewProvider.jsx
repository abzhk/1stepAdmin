import React, { useState, useEffect } from "react";
import { AiFillEye } from "react-icons/ai";
import { FiSearch, FiMapPin, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {  useOutletContext } from "react-router-dom";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";


function ViewProvider() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [deleteId, setDeleteId] = useState(null);
  const { searchTerm } = useOutletContext();


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

        const data = await api(
  `/api/provider/getProviders?${params.toString()}`
);


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

  // const handleDelete = async (providerId) => {
  //   try {
  //     const res = await fetch(
  //       `http://localhost:3001/api/admin/providers/${providerId}`,
  //       {
  //         method: "DELETE",
  //         credentials: "include",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     const data = await res.json();

  //     if (!res.ok) {
  //       throw new Error(data.message || "Failed to delete provider");
  //     }

  //     setProviders((prev) =>
  //       prev.filter((provider) => provider._id !== providerId)
  //     );

  //     setTotalCount((prev) => prev - 1);
  //   } catch (error) {
  //     alert(error.message || "Something went wrong while deleting provider");
  //   }
  // };

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

      if(!data.success){
        throw new Error(data.message || "Failed to update status");
      }
      toast.success(`Provider ${newStatus ? "activated" : "deactivated"}`);

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
      // alert(error.message);
      console.log(error);
       setError(error.message || "Something went wrong");
       toast.error(error.message || "Failed to update status");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-offwhite  min-h-screen ">
      {error && (
        <div className="mb-6 text-red-700 bg-red-100 border border-red-300 px-4 py-3 rounded-xl">
          <strong>Error:</strong> {error}
        </div>
      )}
      <div className="flex justify-end mb-6">
  <button  onClick={() => navigate("/inactive-providers")} className="px-4 py-2 rounded-xl font-semibold shadow transition bg-yellow">Inactive users
    </button>
</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-14 w-305">
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
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300  flex flex-col justify-between border border-gray-100"
              >
                {/* Card Header */}
                <div className="flex items-start mb-2 ">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden ">
                    {provider.profilePicture && (
                      <img
                        src={provider.profilePicture}
                        alt={provider.fullName}
                        className="w-74 h-52 object-cover"
                      />
                    )}
                  </div>
                </div> 
                <div className="flex item-center ">
                  
              
                    </div>
                <div className="p-1 ">
 <div className=" mb-2">
<div className="flex items-start justify-between">
                  <h2 className="font-semibold text-gray-900 text-lg leading-snug">
                    {provider.fullName}
                  </h2>

                  <button
                      onClick={() =>
                        changeStatus(provider._id, !provider.isActive)
                      }
                      className={`px-1 py-1 rounded-xl text-sm font-medium shadow-sm transition
  ${
    provider.isActive
      ? "bg-red-50 text-red-600 hover:bg-red-100"
      : "bg-green-50 text-green-600 hover:bg-green-100"
  }`}
                    >
                      {provider.isActive ? "Deactivate" : "Activate"}
                    </button>
                </div>
                </div>


                  {/* <div className="p-1 mt-2">
                    <h2 className="text-xl  font-semibold text-textcol mb-2 ml-1">
                      {provider.fullName}
                    </h2>
                  </div> */}

                  {/* Provider Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600 text-sm ">
                      {/* <FiMapPin className="text-blue-500 mr-2 " /> */}
                      <strong>City:</strong>
                      <span className="ml-1">{provider.address?.city}</span>
                    </div>

                    <div className="flex items-start text-gray-600 text-sm ">
                      {/* <FiUsers className="text-green-500 mt-0.5 mr-2 " /> */}
                      <strong>Session:</strong>
                      <div className="flex flex-wrap gap-1 ml-1">
                        {therapies.length > 0 ? (
                          therapies.map((type, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-tag text-darkgreen"
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
                  <div className="flex items-center  justify-center  gap-3 ">
                    <button
                      onClick={() =>
                        navigate(`/provider-stats/${provider._id}`)
                      }
                      className="flex items-center  justify-center gap-2 px-4 py-2 rounded-2xl bg-button text-white font-medium shadow-md
               hover:bg-lighthov transition duration-150 w-40"
                    >
                      <AiFillEye className="text-lg" />
                      <span className="text-sm">View Details</span>
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/providers/edit/${provider._id}`)
                      }
                      className="w-10 h-10 flex items-center justify-center rounded-xl
               bg-blue-50 text-blue-600 hover:bg-blue-100
               transition shadow-sm"
                      title="Edit"
                    >
                      <FiEdit2 className="text-lg" />
                    </button>
                   

                    {/* {deleteId && (
                    <div className="fixed inset-0  flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Confirm Delete
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Are you sure you want to delete this provider?
                        </p>

                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setDeleteId(null)}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={() => {
                              handleDelete(deleteId);
                              setDeleteId(null);
                            }}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                          
                        </div>
                      </div>
                    </div>
                    
                  )} */}
                  </div>
                </div>
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
          of <span className="font-semibold text-gray-800">{totalCount}</span>{" "}
          providers
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
