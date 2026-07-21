import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import toast from "react-hot-toast";
import PermissionGuard from "../../Components/PermissionGuard";
import { MODULES, ACTIONS } from "../../constants/permission";
import { Plus, X, Save } from "lucide-react";

const ServiceSpecializationMapping = ({ selectedServiceId, onServiceSelect }) => {
  const [services, setServices] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedService, setSelectedService] = useState(selectedServiceId || "");
  const [mappedSpecializations, setMappedSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);

  // New state for multiple specialization entries
  const [specializationEntries, setSpecializationEntries] = useState([
    {
      specializationId: "",
      isPrimary: false,
      displayOrder: 0,
      isActive: true,
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // FETCH SERVICES
  const fetchServices = async () => {
    try {
      const res = await api("/api/services/admin/serviceType?page=1&limit=1000");
      setServices(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load services");
    }
  };

  // FETCH SPECIALIZATIONS
  const fetchSpecializations = async () => {
    try {
      const res = await api("/api/specialization");
      setSpecializations(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load specializations");
    }
  };

  // FETCH MAPPINGS
  const fetchMappings = async (serviceId) => {
    if (!serviceId) {
      setMappedSpecializations([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api(`/api/servicespecialization/service/${serviceId}`);
      setMappedSpecializations(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load mappings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchSpecializations();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      setSelectedService(selectedServiceId);
      fetchMappings(selectedServiceId);
    }
  }, [selectedServiceId]);

  // SERVICE CHANGE
  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    fetchMappings(serviceId);
    if (onServiceSelect) {
      onServiceSelect(serviceId);
    }
    // Reset form
    setSpecializationEntries([
      {
        specializationId: "",
        isPrimary: false,
        displayOrder: 0,
        isActive: true,
      }
    ]);
    setShowAddForm(false);
  };

  // Add new specialization entry row
  const addSpecializationEntry = () => {
    setSpecializationEntries([
      ...specializationEntries,
      {
        specializationId: "",
        isPrimary: false,
        displayOrder: specializationEntries.length,
        isActive: true,
      }
    ]);
  };

  // Remove specialization entry row
  const removeSpecializationEntry = (index) => {
    if (specializationEntries.length <= 1) {
      toast.error("At least one specialization is required");
      return;
    }
    const updatedEntries = specializationEntries.filter((_, i) => i !== index);
    // Reorder displayOrder
    updatedEntries.forEach((entry, idx) => {
      entry.displayOrder = idx;
    });
    setSpecializationEntries(updatedEntries);
  };

  // Update specialization entry
  const updateSpecializationEntry = (index, field, value) => {
    const updatedEntries = [...specializationEntries];
    updatedEntries[index][field] = value;
    setSpecializationEntries(updatedEntries);
  };

  // SAVE ALL MAPPINGS
  const handleSaveAll = async () => {
    // Validate
    if (!selectedService) {
      return toast.error("Please select a service");
    }

    // Check if all rows have specialization selected
    const invalidRows = specializationEntries.some(
      entry => !entry.specializationId
    );

    if (invalidRows) {
      return toast.error("Please select specialization for all rows");
    }

    try {
      setIsSaving(true);

      // Create all mappings
      const promises = specializationEntries.map(entry =>
        api("/api/servicespecialization", {
          method: "POST",
          body: JSON.stringify({
            serviceId: selectedService,
            specializationId: entry.specializationId,
            isPrimary: entry.isPrimary,
            displayOrder: entry.displayOrder,
            isActive: entry.isActive,
          }),
        })
      );

      await Promise.all(promises);

      toast.success("All specializations added successfully");

      // Reset form
      setSpecializationEntries([
        {
          specializationId: "",
          isPrimary: false,
          displayOrder: 0,
          isActive: true,
        }
      ]);
      setShowAddForm(false);

      // Refresh mappings
      fetchMappings(selectedService);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Unable to add specializations");
    } finally {
      setIsSaving(false);
    }
  };

  // DELETE
  const handleDelete = async () => {
    try {
      await api(`/api/servicespecialization/${deleteId}`, {
        method: "DELETE",
      });

      toast.success("Removed successfully");
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchMappings(selectedService);
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);

    setShowAddForm(true);

    setSpecializationEntries([
        {
            specializationId: item.specializationId._id,
            isPrimary: item.isPrimary,
            displayOrder: item.displayOrder,
            isActive: item.isActive,
        },
    ]);
};

const handleUpdate = async () => {
    try {
        const entry = specializationEntries[0];

        await api(`/api/servicespecialization/${editId}`, {
            method: "PUT",
            body: JSON.stringify({
                serviceId: selectedService,
                specializationId: entry.specializationId,
                isPrimary: entry.isPrimary,
                displayOrder: entry.displayOrder,
                isActive: entry.isActive,
            }),
        });

        toast.success("Mapping updated successfully");

        setEditId(null);

        setSpecializationEntries([
            {
                specializationId: "",
                isPrimary: false,
                displayOrder: 0,
                isActive: true,
            },
        ]);

        setShowAddForm(false);

        fetchMappings(selectedService);
    } catch (err) {
        toast.error(err.message || "Update failed");
    }
};

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span>Service Specialization Mapping</span>
        {selectedService && (
          <span className="text-sm font-normal text-gray-500">
            - {services.find(s => s._id === selectedService)?.label || ''}
          </span>
        )}
      </h2>

      {/* SERVICE SELECT */}
      <div className="flex flex-col mb-6">
        <label className="text-sm font-medium mb-2">Select Service</label>
        <select
          value={selectedService}
          onChange={(e) => handleServiceChange(e.target.value)}
          className="rounded-lg bg-offwhite px-3 py-2 max-w-md"
        >
          <option value="">Select Service</option>
          {services.map((service) => (
            <option key={service._id} value={service._id}>
              {service.label}
            </option>
          ))}
        </select>
      </div>

      {/* ADD NEW SPECIALIZATION FORM */}
      {selectedService && (
        <div className="mt-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-darkgreen text-white rounded-lg hover:bg-opacity-90 transition"
          >
            <Plus size={18} />
            {showAddForm ? "Hide Form" : "Add New Specializations"}
          </button>

          {showAddForm && (
            <div className="mt-4 rounded-lg p-4 bg-offwhite">
              <h3 className="font-medium mb-4 text-gray-700">
    {editId ? "Edit Specialization" : "Add Specializations"}
</h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white">
                      <th className="p-2 text-left text-sm">Sl.no</th>
                      <th className="p-2 text-left text-sm">Specialization</th>
                      <th className="p-2 text-left text-sm">Primary</th>
                      <th className="p-2 text-left text-sm">Display Order</th>
                      <th className="p-2 text-left text-sm">Active</th>
                      <th className="p-2 text-center text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specializationEntries.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="p-2 text-sm">{index + 1}</td>
                        <td className="p-2">
                          <select
                            value={entry.specializationId}
                            onChange={(e) =>
                              updateSpecializationEntry(
                                index,
                                "specializationId",
                                e.target.value
                              )
                            }
                            className="rounded-lg bg-white px-3 py-1.5 w-full min-w-[180px] border border-gray-300"
                          >
                            <option value="">Select</option>
                            {specializations.map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={entry.isPrimary}
                            onChange={(e) =>
                              updateSpecializationEntry(
                                index,
                                "isPrimary",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={entry.displayOrder}
                            onChange={(e) =>
                              updateSpecializationEntry(
                                index,
                                "displayOrder",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="rounded-lg bg-white px-2 py-1.5 w-20 border border-gray-300"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={entry.isActive}
                            onChange={(e) =>
                              updateSpecializationEntry(
                                index,
                                "isActive",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => removeSpecializationEntry(index)}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Remove row"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
               {!editId && (
<button
    onClick={addSpecializationEntry}
    className="flex items-center gap-1 px-4 py-2 bg-softpeach text-white rounded-lg"
>
    <Plus size={16} /> Add Row
</button>
)}

                <button
  onClick={editId ? handleUpdate : handleSaveAll}
  disabled={isSaving}
  className="flex items-center gap-1 px-6 py-2 bg-darkgreen text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
>
    <Save size={16} />
    {isSaving
      ? editId
        ? "Updating..."
        : "Saving..."
      : editId
      ? "Update"
      : "Save All"}
</button>

                <button
                 onClick={() => {
    setShowAddForm(false);
    setEditId(null);

    setSpecializationEntries([
        {
            specializationId: "",
            isPrimary: false,
            displayOrder: 0,
            isActive: true,
        }
    ]);
}}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MAPPED SPECIALIZATIONS TABLE */}
      <div className="mt-8 overflow-x-auto">
        <h3 className="font-medium mb-3 text-gray-700">
          Mapped Specializations
          {selectedService && (
            <span className="ml-2 text-sm text-gray-500">
              ({mappedSpecializations.length})
            </span>
          )}
        </h3>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-offwhite">
              <th className="p-3 text-left">Sl.No</th>
              <th className="p-3 text-left">Specialization</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Primary</th>
              <th className="p-3 text-left">Display Order</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-5 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : !selectedService ? (
              <tr>
                <td colSpan={7} className="text-center p-5 text-gray-500">
                  Please select a service to view mappings
                </td>
              </tr>
            ) : mappedSpecializations.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-5 text-gray-500">
                  No Specializations Mapped
                </td>
              </tr>
            ) : (
              mappedSpecializations.map((item, index) => (
                <tr key={item._id} className="hover:bg-offwhite text-table-text">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{item.specializationId?.name}</td>
                  <td className="p-3">{item.specializationId?.code}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isPrimary
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.isPrimary ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-3">{item.displayOrder || 0}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <PermissionGuard
                      module={MODULES.MASTER_DATA}
                      action={ACTIONS.DELETE}
                    >
                     <div className="flex gap-2">
    <button
        onClick={() => handleEdit(item)}
        className="px-3 py-1 bg-darkgreen text-white rounded-lg"
    >
        Edit
    </button>

    <button
        onClick={() => {
            setDeleteId(item._id);
            setShowDeleteModal(true);
        }}
        className="px-3 py-1 bg-red-500 text-white rounded-lg"
    >
        Delete
    </button>
</div>
                    </PermissionGuard>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-2">Delete Mapping</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this specialization from the selected service?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
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
    </div>
  );
};

export default ServiceSpecializationMapping;