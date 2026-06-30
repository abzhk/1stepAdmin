import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";
import dateFormatUtils from "../../utils/dateFormatUtils.js";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";

const MasterData = () => {
  const [services, setServices] = useState([]);
  const { searchTerm } = useOutletContext();

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
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await api("/api/services/serviceType?format=raw");
      setServices(data.data || []);
    } catch (error) {
      console.error("Fetch failed:", error);
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
      // UPDATE
      await api(`/api/services/${editId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      toast.success("Service updated successfully");
    } else {
      // CREATE
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

  return (
    <div className="min-h-screen bg-offwhite">
      <div className=" mx-auto">
        <PermissionGuard module={MODULES.MASTER_DATA} action={ACTIONS.CREATE}>
          <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Service Name</label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  className=" rounded-lg px-3 py-2  bg-offwhite "
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
                  className=" rounded-lg px-3 py-2 bg-offwhite "
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
    className="rounded-lg px-3 py-2 bg-offwhite"
  />
</div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="durationDefault"
                  value={formData.durationDefault}
                  onChange={handleChange}
                  className=" rounded-lg px-3 py-2 bg-offwhite "
                />
              </div>
              <div className="flex flex-col">
  <label className="text-sm font-medium mb-1">Order</label>
  <input
    type="number"
    name="order"
    value={formData.order}
    onChange={handleChange}
    className="rounded-lg px-3 py-2 bg-offwhite"
  />
</div>

              <div className="flex items-center mt-6  rounded-lg px-3 py-2 focus:outline-none bg-offwhite ">
                <input
                  type="checkbox"
                  name="billable"
                  checked={formData.billable}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium ">Billable</label>
              </div>

              <div className="col-span-2 flex justify-end">
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
                  <th className="p-3">Order</th>
                  <th className="p-3">Billable</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map((service, index) => (
                  <tr
                    key={service._id}
                    className=" hover:bg-offwhite text-table-text"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{service.label}</td>
                    <td className="p-3">{service.code}</td>
                    <td className="p-3">{service.order}</td>

                    <td className="p-3">
                      {service.metadata?.billable ? "Yes" : "No"}
                    </td>
                    <td className="p-3">
                      {service.isActive ? "Active" : "Inactive"}
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
                            onClick={() => handleEdit(service)}
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
                              setDeleteId(service._id);
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

                {services.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No services found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default MasterData;
