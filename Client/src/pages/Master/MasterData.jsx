import React, { useEffect, useState, useRef } from "react";
import { api } from "../../utils/api.js";
import dateFormatUtils from "../../utils/dateFormatUtils.js";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import ServiceSpecializationMapping from "./ServiceSpecializationMapping.jsx";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import SortableHeader from "../../Components/SortableHeader.jsx";


const MasterData = () => {
  const [services, setServices] = useState([]);
  const { searchTerm } = useOutletContext();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const limit = 10;
  const formRef = useRef(null);
  const [selectedServiceForMapping, setSelectedServiceForMapping] = useState(null);
  const [showMappingForm, setShowMappingForm] = useState(false);
const mappingRef = useRef(null);
const [sortConfig, setSortConfig] = useState({
  key: "order",
  direction: "asc",
});


  const [formData, setFormData] = useState({
    code: "",
    label: "",
    description: "",
    order: 0,
    durationDefault: "",
    billable: false,
  });
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

useEffect(() => {
  fetchServices(page, searchTerm, sortConfig);
}, [page, searchTerm, sortConfig]);

  const fetchServices = async (
  pageNo = page,
  search = searchTerm,
  sort = sortConfig
) => {
  try {
    const res = await api(
      `/api/services/admin/serviceType?page=${pageNo}&limit=${limit}&search=${encodeURIComponent(
        search
      )}&sortBy=${sort.key}&sortOrder=${sort.direction}`
    );

    setServices(res.data || []);
    setPagination(res.pagination);
    setPage(pageNo);
  } catch (error) {
    console.error(error);
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
      const payload = {
        code: formData.code,
        label: formData.label,
        description: formData.description,
        order: Number(formData.order),
        metadata: {
          durationDefault: Number(formData.durationDefault),
          billable: formData.billable,
        },
      };

      if (editId) {
        await api(`/api/services/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Service updated successfully");
      } else {
        await api("/api/services", {
          method: "POST",
          body: JSON.stringify({
            type: "serviceType",
            ...payload,
          }),
        });
        toast.success("Service created successfully");
      }

      setFormData({
        code: "",
        label: "",
        description: "",
        order: 0,
        durationDefault: "",
        billable: false,
      });

      setEditId(null);
      fetchServices();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleEdit = (service) => {
    setEditId(service._id);
    setFormData({
      code: service.code || "",
      label: service.label || "",
      description: service.description || "",
      order: service.order ?? 0,
      durationDefault: service.metadata?.durationDefault || "",
      billable: service.metadata?.billable || false,
    });
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDelete = async () => {
    try {
      await api(`/api/services/${deleteId}`, {
        method: "DELETE",
      });

      fetchServices();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const filteredServices = services.filter((service) => {
    const search = searchTerm?.toLowerCase() || "";
    return (
      service.label?.toLowerCase().includes(search) ||
      service.code?.toLowerCase().includes(search) ||
      (service.metadata?.billable ? "yes" : "no").includes(search) ||
      (service.isActive ? "active" : "inactive").includes(search)
    );
  });


  useEffect(() => {
  if (showMappingForm && mappingRef.current) {
    mappingRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}, [showMappingForm, selectedServiceForMapping]);

  // Handle click on service row to show mapping
  const handleServiceClick = (serviceId) => {
  setSelectedServiceForMapping(serviceId);
  setShowMappingForm(true);
};

  const resetForm = () => {
  setFormData({
    code: "",
    label: "",
    description: "",
    order: 0,
    durationDefault: "",
    billable: false,
  });

  setEditId(null);
};


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

  fetchServices(1, searchTerm, newSort);
};

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="mx-auto">
        <PermissionGuard module={MODULES.MASTER_DATA} action={ACTIONS.CREATE}>
          <div
            ref={formRef}
            style={{ scrollMarginTop: "160px" }}
            className="bg-white p-6 rounded-2xl shadow-md mb-8"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Service Name</label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  maxLength={50}
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
                  onChange={handleChange}
                  maxLength={50}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  name="durationDefault"
                  value={formData.durationDefault}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  name="order"
                  min={0}
                  value={formData.order}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                />
              </div>

              <div className="flex items-center mt-6 rounded-lg px-3 py-2 focus:outline-none bg-offwhite">
                <input
                  type="checkbox"
                  name="billable"
                  checked={formData.billable}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Billable</label>
              </div>

             <div className="col-span-2 flex justify-end gap-3">
  {editId && (
    <button
      type="button"
      onClick={resetForm}
      className="px-6 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
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

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-tabheading mb-4">Existing Services</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
             <thead>
  <tr className="bg-offwhite text-left text-sm">
    <th className="p-3">Sl.No</th>
   <SortableHeader
  title="Services"
  field="label"
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
  title="Billable"
  field="billable"
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
                 {services.map((service, index) => (
                  <tr
                    key={service._id}
                    className="hover:bg-offwhite text-table-text cursor-pointer"
                    onClick={() => handleServiceClick(service._id)}
                  >
                    <td className="p-3">{(page - 1) * limit + index + 1}</td>
                    <td className="p-3 font-medium text-blue-600 hover:underline">
                      {service.label}
                    </td>
                    <td className="p-3">{service.code}</td>
                    <td className="p-3">{service.order}</td>
                    <td className="p-3">
                      {service.metadata?.billable ? "Yes" : "No"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(service);
                            }}
                            className="px-4 py-2 bg-darkgreen text-white rounded-lg hover:bg-opacity-90 transition"
                          >
                            Edit
                          </button>
                        </PermissionGuard>

                        <PermissionGuard
                          module={MODULES.MASTER_DATA}
                          action={ACTIONS.DELETE}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(service._id);
                              setShowDeleteModal(true);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}

                {services.length === 0 && (
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

      {/* Delete Modal */}
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
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>

        <button
          disabled={!pagination.hasNextPage}
          onClick={() => fetchServices(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Next
        </button>
      </div>

      {/* Service Specialization Mapping */}
     {showMappingForm && (
  <div
    ref={mappingRef}
    style={{ scrollMarginTop: "120px" }}
  >
    <ServiceSpecializationMapping
      selectedServiceId={selectedServiceForMapping}
      onServiceSelect={(serviceId) => {
        setSelectedServiceForMapping(serviceId);
      }}
    />
  </div>
)}
    </div>
  );
};

export default MasterData;