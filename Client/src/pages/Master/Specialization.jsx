import React, { useEffect, useState, useRef } from "react";
import { api } from "../../utils/api.js";
import dateFormatUtils from "../../utils/dateFormatUtils.js";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import SortableHeader from "../../Components/SortableHeader";

const Specialization = () => {
  const [specializations, setSpecializations] = useState([]);

  const { searchTerm } = useOutletContext();

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const limit = 10;
  const [loading, setLoading] = useState(false);

  const formRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({
  key: "order",
  direction: "asc",
});

 const [formData, setFormData] = useState({
  code: "",
  name: "",
  description: "",
  order: 0,
  isActive: true,
});

  const [editId, setEditId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

useEffect(() => {
  fetchSpecializations(page, searchTerm, sortConfig);
}, [page, searchTerm, sortConfig]);
  // FETCH

 const fetchSpecializations = async (
  pageNo = page,
  search = searchTerm,
  sort = sortConfig
) => {
  setLoading(true);

  try {
    const res = await api(
      `/api/specialization/pagination?page=${pageNo}&limit=${limit}&search=${encodeURIComponent(
        search
      )}&sortBy=${sort.key}&sortOrder=${sort.direction}`
    );

    setSpecializations(res.data || []);
    setPagination(res.pagination || {});
  } catch (error) {
    console.error(error);
    toast.error("Failed to load specializations");
  } finally {
    setLoading(false);
  }
};


  const handleChange = (e) => {
   const { name, value, type, checked } = e.target;

setFormData((prev) => ({
  ...prev,
  [name]: type === "checkbox" ? checked : value,
}));;
  };


  // CREATE / UPDATE


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
  code: formData.code.trim(),
  name: formData.name.trim(),
  description: formData.description.trim(),
  order: Number(formData.order),
  isActive: formData.isActive,
};

      if (editId) {
        await api(`/api/specialization/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        toast.success("Specialization updated successfully");
      } else {
        await api("/api/specialization", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        toast.success("Specialization created successfully");
      }

    setFormData({
  code: "",
  name: "",
  description: "",
  order: 0,
  isActive: true,
});

      setEditId(null);

      fetchSpecializations();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  // EDIT


  const handleEdit = (item) => {
    setEditId(item._id);

   setFormData({
  code: item.code || "",
  name: item.name || "",
  description: item.description || "",
  order: item.order ?? 0,
  isActive: item.isActive,
});

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };


  // DELETE

  const handleDelete = async () => {
    try {
      await api(`/api/specialization/${deleteId}`, {
        method: "DELETE",
      });

      toast.success("Specialization deleted successfully");

      fetchSpecializations();

      setDeleteId(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete specialization");
    }
  };

  // SEARCH

  const filteredSpecializations = specializations.filter((item) => {
    const search = searchTerm?.toLowerCase() || "";

    return (
      item.name?.toLowerCase().includes(search) ||
      item.code?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      (item.isActive ? "active" : "inactive").includes(search)
    );
  });

const handleSort = (key) => {
  const direction =
    sortConfig.key === key && sortConfig.direction === "asc"
      ? "desc"
      : "asc";

  const newSort = {
    key,
    direction,
  };

  setSortConfig(newSort);

  fetchSpecializations(1, searchTerm, newSort);
};

    return (
    <div className="min-h-screen bg-offwhite">
      <div className="mx-auto">

        {/*  FORM */}

        <PermissionGuard
          module={MODULES.MASTER_DATA}
          action={ACTIONS.CREATE}
        >
          <div
            ref={formRef}
            style={{ scrollMarginTop: "160px" }}
            className="bg-white p-6 rounded-2xl shadow-md mb-8"
          >
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-4"
            >
              {/* Name */}

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Specialization Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  className="rounded-lg px-3 py-2 bg-offwhite"
                />
              </div>

              {/* Code */}

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Code
                </label>

                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  maxLength={50}
                  required
                  className="rounded-lg px-3 py-2 bg-offwhite"
                />
              </div>

              {/* Description */}

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Description
                </label>

                <textarea
                  name="description"
                  rows={3}
                  maxLength={500}
                  value={formData.description}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                />
              </div>

              {/* Order */}

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Order
                </label>

                <input
                  type="number"
                  name="order"
                  min={0}
                  value={formData.order}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                />
              </div>
              <div className="flex items-center mt-6 rounded-lg px-3 py-2 bg-offwhite">
  <input
    type="checkbox"
    name="isActive"
    checked={formData.isActive}
    onChange={handleChange}
    className="mr-2"
  />
  <label className="text-sm font-medium">
    Active
  </label>
</div>

              {/* Submit */}

             <div className="col-span-2 flex justify-end gap-3">

                {editId && (
  <button
    type="button"
    onClick={() => {
      setEditId(null);
      setFormData({
        code: "",
        name: "",
        description: "",
        order: 0,
        isActive: true,
      });
    }}
    className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
  >
    Cancel
  </button>
)}
                <button
                  type="submit"
                  className="bg-peach text-white px-6 py-2 rounded-lg hover:bg-darkgreen transition"
                >
                  {editId ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </PermissionGuard>

        {/* TABLE*/}

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-tabheading mb-4">
            Existing Specializations
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">

            <thead>
  <tr className="bg-offwhite text-left text-sm">
    <th className="p-3">Sl.No</th>

    <SortableHeader
      title="Specialization"
      field="name"
      sortConfig={sortConfig}
      handleSort={handleSort}
    />

    <SortableHeader
      title="Code"
      field="code"
      sortConfig={sortConfig}
      handleSort={handleSort}
    />

    <SortableHeader
      title="Order"
      field="order"
      sortConfig={sortConfig}
      handleSort={handleSort}
    />

    <SortableHeader
      title="Status"
      field="status"
      sortConfig={sortConfig}
      handleSort={handleSort}
    />

    <SortableHeader
      title="Created At"
      field="createdAt"
      sortConfig={sortConfig}
      handleSort={handleSort}
    />

    <th className="p-3">Action</th>
  </tr>
</thead>

              <tbody>

                {specializations.map((item, index) => (
                  <tr
                    key={item._id}
                    className="hover:bg-offwhite text-table-text"
                  >
                    <td className="p-3">
                      {(page - 1) * limit + index + 1}
                    </td>

                    <td className="p-3">
                      {item.name}
                    </td>

                    <td className="p-3">
                      {item.code}
                    </td>

                    <td className="p-3">
                      {item.order}
                    </td>

                    <td className="p-3">
                      {item.isActive ? "Active" : "Inactive"}
                    </td>

                    <td className="p-3">
                      {dateFormatUtils(item.createdAt)}
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">

                        <PermissionGuard
                          module={MODULES.MASTER_DATA}
                          action={ACTIONS.UPDATE}
                        >
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-4 py-2 bg-darkgreen text-white rounded-lg"
                          >
                            Edit
                          </button>
                        </PermissionGuard>

                        <PermissionGuard
                          module={MODULES.MASTER_DATA}
                          action={ACTIONS.DELETE}
                        >
                          <button
                            onClick={() => {
                              setDeleteId(item._id);
                              setShowDeleteModal(true);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg"
                          >
                            Delete
                          </button>
                        </PermissionGuard>

                      </div>
                    </td>
                  </tr>
                ))}

                {specializations.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-4 text-center text-gray-500"
                    >
                      No Specializations Found
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>
        </div>

                {/* ================= DELETE MODAL ================= */}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-lg">

              <h2 className="text-lg font-semibold mb-2">
                Delete Specialization
              </h2>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this specialization?
              </p>

              <div className="flex justify-end gap-3">

                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white"
                >
                  Delete
                </button>

              </div>

            </div>
          </div>
        )}

        {/* PAGINATION */}

        <div className="flex justify-end items-center gap-4 mt-5">

          <button
            disabled={!pagination.hasPrevPage  || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded-2xl disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {pagination.currentPage || 1} of{" "}
            {pagination.totalPages || 1}
          </span>

          <button
            disabled={!pagination.hasNextPage || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded-2xl disabled:opacity-50"
          >
            Next
          </button>

        </div>

      </div>
    </div>
  );
};

export default Specialization;