import React, { useEffect, useState } from "react";
import { AiFillEye } from "react-icons/ai";
import { FiEdit2, FiGrid, FiList } from "react-icons/fi";
import { useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";
import SortableHeader from "../../Components/SortableHeader";
import DeactivateModal from "../../Components/DeactivateModal.jsx";

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
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // ── Account lifecycle modal state ─────────────────────────────────────────
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalMode, setModalMode]       = useState("deactivate"); // "deactivate" | "reactivate"
  const [selectedUser, setSelectedUser] = useState(null);

  const getParents = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        limit: String(limit),
        startIndex: String((page - 1) * limit),
          sort: sortConfig.key,
  order: sortConfig.direction,
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
  }, [page, searchTerm, sortConfig]);

  const fromIndex = parents.length ? (page - 1) * limit + 1 : 0;
  const toIndex = (page - 1) * limit + parents.length;

  // Open the deactivate/reactivate modal for a parent's user account
  const openModal = (userRef, mode) => {
    setSelectedUser(userRef);
    setModalMode(mode);
    setModalOpen(true);
  };

  // Called by DeactivateModal on successful action — update local parent list state
  const handleModalSuccess = (updatedUser) => {
    if (!updatedUser) return;
    setParents((prev) =>
      prev.map((p) =>
        p.userRef?._id === updatedUser._id
          ? { ...p, userRef: { ...p.userRef, isActive: updatedUser.isActive, accountStatus: updatedUser.accountStatus } }
          : p
      )
    );
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
  <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-14">
    {Array.from({ length: 12 }).map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"
      >
        {/* Profile image */}
        <div className="w-full h-52 bg-gray-200" />

        <div className="p-4">

          {/* Name + Status */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="h-5 bg-gray-200 rounded w-3/4" />

            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>

          {/* Client Name */}
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />

          {/* Phone */}
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />

          {/* Buttons */}
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded-xl flex-1" />

            <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          </div>

        </div>
      </div>
    ))}
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
                         loading="lazy"
                         decoding="async"
                        className="w-full h-52 object-cover"
                      />
                    )}
                  </div>

                  <div className="p-2">

                    <div className="flex items-start justify-between">
                      <h2 className="font-semibold text-gray-900 text-lg">
                        {parent.parentDetails?.fullName}
                      </h2>

                      {/* Account status badge */}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        parent.userRef?.accountStatus === "deactivated" || !parent.userRef?.isActive
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {parent.userRef?.accountStatus === "deactivated" || !parent.userRef?.isActive
                          ? "Deactivated"
                          : "Active"}
                      </span>
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

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/parent-stats-card/${parent.userRef?._id}`
                          )
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-softpeach/60 text-white text-sm font-medium shadow hover:bg-lighthov transition flex-1"
                      >
                        <AiFillEye />
                        View
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

                      {/* Deactivate / Reactivate */}
                      {parent.userRef?.accountStatus === "deactivated" || !parent.userRef?.isActive ? (
                        <button
                          onClick={() => openModal(parent.userRef, "reactivate")}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-50 text-green-700 hover:bg-green-100 text-xs font-bold"
                          title="Reactivate account"
                        >
                          ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal(parent.userRef, "deactivate")}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold"
                          title="Deactivate account"
                        >
                          ✕
                        </button>
                      )}
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

            <thead className="bg-offwhite  text-cardfooter uppercase">
              <tr>
                <SortableHeader
  title="Parent"
  field="parentDetails.fullName"
  sortConfig={sortConfig}
  handleSort={handleSort}
/>

<SortableHeader
  title="Child"
  field="parentDetails.childName"
  sortConfig={sortConfig}
  handleSort={handleSort}
/>

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
                       loading="lazy"
                         decoding="async"
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
                   {/* Status badge */}
                   <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                     parent.userRef?.accountStatus === "deactivated" || !parent.userRef?.isActive
                       ? "bg-red-100 text-red-600"
                       : "bg-green-100 text-green-700"
                   }`}>
                     {parent.userRef?.accountStatus === "deactivated" || !parent.userRef?.isActive
                       ? "Deactivated"
                       : "Active"}
                   </span>
                 </td>

                 <td className="p-3">
                   {/* Deactivate / Reactivate action button */}
                   {parent.userRef?.accountStatus === "deactivated" || !parent.userRef?.isActive ? (
                     <button
                       onClick={() => openModal(parent.userRef, "reactivate")}
                       className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition"
                     >
                       Reactivate
                     </button>
                   ) : (
                     <button
                       onClick={() => openModal(parent.userRef, "deactivate")}
                       className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition"
                     >
                       Deactivate
                     </button>
                   )}
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

      {/* Account lifecycle modal */}
      <DeactivateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

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