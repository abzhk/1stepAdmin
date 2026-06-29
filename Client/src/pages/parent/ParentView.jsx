import React, { useEffect, useState } from "react";
import { AiFillEye } from "react-icons/ai";
import { FiEdit2, FiGrid, FiList } from "react-icons/fi";
import { useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";

function ParentView() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParents, setTotalParents] = useState(0);

  const [viewMode, setViewMode] = useState("grid");

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

      const data = await api(`/api/parent/getallparents?${params}`);

      setParents(data.parents || []);
      setTotalPages(data.totalPages || 1);
      setTotalParents(data.totalParents || 0);
    } catch (err) {
      setError(err.message);
    } finally {
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
            : p
        )
      );
    } catch (err) {
      console.log(err);
      setError(err.message || "Failed to update status");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-offwhite min-h-screen">

      {/* Error */}
      {error && (
        <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded-lg border border-red-200">
          {error}
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

        <button
          onClick={() => navigate("/inactive-parents")}
          className="px-4 py-2 rounded-xl font-semibold text-white shadow transition bg-darkgreen hover:bg-yellow hover:text-darkgreen"
        >
          Inactive users
        </button>
      </div>

      {/* GRID VIEW */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-14">

          {loading ? (
            <div className="col-span-full text-center py-10 text-gray-500 font-medium text-lg">
              Loading parents...
            </div>
          ) : parents.length > 0 ? (
            parents.map((parent) => (
              <div
                key={parent._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition flex flex-col justify-between border-gray-100"
              >

                <div>

                  <div className="bg-white rounded-xl  overflow-hidden mb-2 h-52">
                    {parent.userRef?.profilePicture && (
                      <img
                        src={parent.userRef?.profilePicture}
                        alt={parent.parentDetails?.fullName}
                        className="w-full h-52 object-cover"
                      />
                    )}
                  </div>

                  <div className="p-2">

                    <div className="flex items-start justify-between">
                      <h2 className="font-semibold text-gray-900 text-lg">
                        {parent.parentDetails?.fullName}
                      </h2>

                      <button
                        onClick={() =>
                          changeStatus(
                            parent.userRef?._id,
                            !parent.userRef?.isActive
                          )
                        }
                        className={`text-xs px-3 py-1 rounded-full font-medium
                        ${
                          parent.userRef?.isActive
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {parent.userRef?.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>

                    <div className="space-y-2 mb-4 text-sm mt-4">
                      <div className="flex gap-2">
                        <span className="text-cardfooter uppercase">
                          Client Name :
                        </span>
                        <span className="text-cardfooter uppercase px-2">
                          {parent.parentDetails?.childName}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-cardfooter uppercase">
                          Phone:
                        </span>
                        <span className="text-cardfooter">
                          {parent.parentDetails?.phoneNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/parent-stats-card/${parent.userRef?._id}`
                          )
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-softpeach/60 text-white text-sm font-medium shadow hover:bg-lighthov transition w-full"
                      >
                        <AiFillEye />
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/parent/edit/${parent.userRef?._id}`
                          )
                        }
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500 font-medium text-lg">
              No results found
            </div>
          )}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white px-6 py-6 rounded-2xl">
        <div className="bg-white rounded-xl shadow  overflow-hidden">
          <table className="w-full text-sm">

            <thead className="bg-offwhite text-gray-700  text-cardfooter uppercase">
              <tr>
                <th className="p-3 text-left">Parent</th>
                <th className="p-3 text-left">Child</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {parents.map((parent) => (
                <tr
                  key={parent._id}
                  className=" hover:bg-offwhite text-table-text"
                >

                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={parent.userRef?.profilePicture}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    {parent.parentDetails?.fullName}
                  </td>

                  <td className="p-3">
                    {parent.parentDetails?.childName}
                  </td>

                  <td className="p-3">
                    {parent.parentDetails?.phoneNumber}
                  </td>

                 <td className="p-3">

    <button
      onClick={() =>
        changeStatus(
          parent.userRef?._id,
          !parent.userRef?.isActive
        )
      }
      className={`px-3 py-2 rounded-lg text-xs font-medium ${
        parent.userRef?.isActive
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-green-100 text-green-600 hover:bg-green-200"
      }`}
    >
      {parent.userRef?.isActive ? "Deactivate" : "Activate"}
    </button>

</td>

                  <td className="p-3 flex justify-end gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/parent-stats-card/${parent.userRef?._id}`
                        )
                      }
                      className="p-2 bg-gray-100 rounded-lg"
                    >
                      <AiFillEye />
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/parent/edit/${parent.userRef?._id}`
                        )
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
      <div className="flex flex-col md:flex-row items-center justify-between mt-8 pt-4  border-gray-200">

        <p className="text-sm text-gray-700 mb-4 md:mb-0">
          Showing <b>{fromIndex}</b> to <b>{toIndex}</b> of{" "}
          <b>{totalParents}</b>
        </p>

        <div className="flex gap-3 items-center">

          <button
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white hover:bg-gray-100 transition disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            ← Prev
          </button>

          <span className="text-sm font-semibold text-gray-800">
            Page {page} of {totalPages}
          </span>

          <button
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white hover:bg-gray-100 transition disabled:opacity-50"
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

export default ParentView;