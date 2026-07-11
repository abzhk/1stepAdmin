// OurServices.jsx
import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";
import dateFormatUtils from "../../utils/dateFormatUtils.js";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";

const OurServices = () => {
  const [services, setServices] = useState([]);
  const { searchTerm } = useOutletContext();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const limit = 10;

  const [formData, setFormData] = useState({
  code: "",
  label: "",
  category: "",
  order: 1,
});
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchServices(page);
  }, [page]);

  const fetchServices = async (pageNo = page) => {
    try {
      const res = await api(
        `/api/services/admin/ourServices?page=${pageNo}&limit=${limit}`
      );

      setServices(res.data || []);
      setPagination(res.pagination);
      setPage(pageNo);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch services");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editId) {
      // UPDATE
      const payload = {
        code: formData.code,
        label: formData.label,
        category: formData.category,
        order: Number(formData.order),
      };

      await api(`/api/services/${editId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      toast.success("Service updated successfully");
    } else {
      // CREATE
      const payload = {
        type: "ourServices",
        code: formData.code,
        label: formData.label,
        category: formData.category,
        order: Number(formData.order),
      };

      await api("/api/services", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Service created successfully");
    }

    setFormData({
      code: "",
      label: "",
      category: "",
      order: 1,
    });

    setEditId(null);
    fetchServices();
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Something went wrong");
  }
};
  const handleEdit = (service) => {
    setEditId(service._id);
    setFormData({
  code: service.code || "",
  label: service.label || "",
  category: service.category || "",
  order: service.order ?? 1,
});
  };

  const handleDelete = async () => {
    try {
      await api(`/api/services/${deleteId}`, {
        method: "DELETE",
      });

      toast.success("Service deleted successfully");
      fetchServices();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete service");
    }
  };

  const filteredServices = services.filter((service) => {
    const search = searchTerm?.toLowerCase() || "";

    return (
      service.label?.toLowerCase().includes(search) ||
      service.code?.toLowerCase().includes(search) ||
      service.category?.toLowerCase().includes(search) ||
      (service.isActive ? "active" : "inactive").includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="mx-auto">
        <PermissionGuard module={MODULES.MASTER_DATA} action={ACTIONS.CREATE}>
          <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
  <label className="text-sm font-medium mb-1">Service Name</label>
  <input
    type="text"
    name="label"
    value={formData.label}
    maxLength={50}
    onChange={handleChange}
    className="rounded-lg px-3 py-2 bg-offwhite"
    required
  />
</div>

<div className="flex flex-col">
  <label className="text-sm font-medium mb-1">Code</label>
  <input
    type="text"
    name="code"
    value={formData.code}
    maxLength={50}
    onChange={handleChange}
    className="rounded-lg px-3 py-2 bg-offwhite"
    required
  />
</div>

<div className="flex flex-col">
  <label className="text-sm font-medium mb-1">Category</label>
  <input
    type="text"
    name="category"
    value={formData.category}
    maxLength={50}
    onChange={handleChange}
    className="rounded-lg px-3 py-2 bg-offwhite"
    required
  />
</div>

<div className="flex flex-col">
  <label className="text-sm font-medium mb-1">Order</label>
  <input
    type="number"
    name="order"
    min={1}
    value={formData.order}
    onChange={handleChange}
    className="rounded-lg px-3 py-2 bg-offwhite"
    required
  />
</div>

              <div className="col-span-2 flex justify-end mt-2">
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

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-tabheading mb-4">Existing Services</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-offwhite text-left text-sm">
                  <th className="p-3">Sl.no</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Order</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map((service, index) => (
                  <tr
                    key={service._id}
                    className="hover:bg-offwhite text-table-text"
                  >
                    <td className="p-3">{(page - 1) * limit + index + 1}</td>
                    <td className="p-3">{service.label}</td>
                    <td className="p-3">{service.code}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-offwhite rounded-full text-xs">
                        {service.category || "—"}
                      </span>
                    </td>
                    <td className="p-3">{service.order}</td>
                   
                    <td className="p-3">
                      {dateFormatUtils(service.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <PermissionGuard
                          module={MODULES.MASTER_DATA}
                          action={ACTIONS.UPDATE}
                        >
                          <button
                            onClick={() => handleEdit(service)}
                            className="px-4 py-2 bg-darkgreen text-white rounded-lg text-sm"
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
                              setDeleteId(service._id);
                              setShowDeleteModal(true);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
                          >
                            Delete
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      No services found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Delete Service</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this service?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-end items-center mt-5 gap-4">
        <button
          disabled={!pagination.hasPrevPage}
          onClick={() => fetchServices(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
        </span>

        <button
          disabled={!pagination.hasNextPage}
          onClick={() => fetchServices(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OurServices;