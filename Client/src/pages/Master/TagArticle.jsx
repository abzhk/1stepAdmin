import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";
import dateFormatUtils from "../../utils/dateFormatUtils.js";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";

const TagArticle = () => {
  const [tags, setTags] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    label: "",
    isActive: true,
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await api("/api/services/admin/articleTag");
      setTags(res.data || []);
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

  const handleEdit = (tag) => {
    setFormData({
      code: tag.code,
      description: tag.description,
      label: tag.label,
      isActive: tag.isActive,
    });
    setEditId(tag._id);
  };

  const handleCancel = () => {
    setEditId(null);
    setFormData({
      code: "",
      description: "",
      label: "",
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        type: "articleTag",
        code: formData.code,
        description: formData.description,
        label: formData.label,
        isActive: formData.isActive,
      };

      if (editId) {
        await api(`/api/services/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormData({
        code: "",
        description: "",
        label: "",
        isActive: true,
      });
      setEditId(null);

      fetchTags();
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await api(`/api/services/${deleteId}`, {
        method: "DELETE",
      });

      fetchTags();

      setShowDeleteModal(false);
      setDeleteId(null);

      if (editId === deleteId) {
        handleCancel();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <div className=" mx-auto">
        <PermissionGuard module={MODULES.MASTER_DATA} action={ACTIONS.CREATE}>
          {/* FORM */}
          <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {/* Label */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Tag Name</label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                  required
                />
              </div>

              {/* Code */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                />
              </div>

              {/* Active */}
              <div className="flex items-center mt-6 bg-offwhite px-3 py-2 rounded-lg">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Active</label>
              </div>

              {/* Buttons */}
              <div className="col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-peach text-white px-6 py-2 rounded-lg hover:bg-darkgreen transition"
                >
                  {editId ? "Update" : "Submit"}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="ml-2 px-4 py-2 rounded-lg bg-darkgreen text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </PermissionGuard>

        {/* TABLE */}

        <PermissionGuard module={MODULES.MASTER_DATA} action={ACTIONS.READ}>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-tabheading  mb-4">Existing Tags</h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-offwhite text-left text-sm">
                    <th className="p-3">Sl.no</th>
                    <th className="p-3">Tag Name</th>
                    <th className="p-3">Code</th>
                    <th>Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created At</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {tags.map((tag, index) => (
                    <tr
                      key={tag._id}
                      className=" hover:bg-offwhite text-table-text"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{tag.label}</td>
                      <td className="p-3">{tag.code}</td>
                      <td>{tag.description}</td>

                      <td className="p-3">
                        <span
                          className={
                            tag.isActive
                              ? "text-green-600 font-medium"
                              : "text-red-500 font-medium"
                          }
                        >
                          {tag.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-3">{dateFormatUtils(tag.createdAt)}</td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <PermissionGuard
                            module={MODULES.MASTER_DATA}
                            action={ACTIONS.UPDATE}
                          >
                            <button
                              onClick={() => handleEdit(tag)}
                              className="bg-darkgreen px-4 py-2 text-white rounded-lg"
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
                                setDeleteId(tag._id);
                                setShowDeleteModal(true);
                              }}
                              className="bg-red-500 px-4 py-2 text-white rounded-lg"
                            >
                              Delete
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {tags.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500">
                        No tags found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </PermissionGuard>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Delete Tag</h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this tag?
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

export default TagArticle;
