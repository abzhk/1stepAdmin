import React, { useEffect, useState , useRef } from "react";
import { api } from "../../utils/api.js";
import dateFormatUtils from "../../utils/dateFormatUtils.js";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";
import { useOutletContext } from "react-router-dom"; 
import toast from "react-hot-toast";

const TagArticle = () => {
  const [tags, setTags] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
    const { searchTerm } = useOutletContext();
    const [page, setPage] = useState(1);
const [pagination, setPagination] = useState({});
const limit = 10;
const formRef = useRef(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    label: "",
    isActive: true,
  });

  useEffect(() => {
  fetchTags(page);
}, [page]);

  const fetchTags = async (pageNo = page) => {
  try {
    const res = await api(
      `/api/services/admin/articleTag?page=${pageNo}&limit=${limit}`
    );

    setTags(res.data || []);
    setPagination(res.pagination);
    setPage(pageNo);
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
     setTimeout(() => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
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
    if (editId) {
      // Update
      const payload = {
        code: formData.code,
        description: formData.description,
        label: formData.label,
        isActive: formData.isActive,
      };

      await api(`/api/services/${editId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      // Create
      const payload = {
        type: "articleTag",
        code: formData.code,
        description: formData.description,
        label: formData.label,
        isActive: formData.isActive,
      };

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
    toast.error(error.message || "Something went wrong");
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
  
const filteredTags = tags.filter((tag) => {
  const search = searchTerm?.toLowerCase() || "";

  return (
    tag.label?.toLowerCase().includes(search) ||
    tag.code?.toLowerCase().includes(search) ||
    tag.description?.toLowerCase().includes(search) ||
    (tag.isActive ? "active" : "inactive").includes(search)
  );
});

  return (
    <div className="min-h-screen bg-offwhite">
      <div className=" mx-auto">
        <PermissionGuard module={MODULES.MASTER_DATA} action={ACTIONS.CREATE}>
          {/* FORM */}
          <div ref={formRef} style={{ scrollMarginTop: "160px" }} className="bg-white p-6 rounded-2xl shadow-md mb-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {/* Label */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Tag Name</label>
                <input
                  type="text"
                  name="label"
                  maxLength={50}
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
                  maxLength={50}
                  value={formData.code}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Description</label>
                <textarea
                  type="text"
                  name="description"
                  rows={3}
    maxLength={500}
                  value={formData.description}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite"
                />
              </div>

              {/* Active */}
               <div className="flex items-center rounded-lg bg-offwhite px-3 py-2 h-[42px] mt-6">
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
                  {filteredTags.map((tag, index) => (
                    <tr
                      key={tag._id}
                      className=" hover:bg-offwhite text-table-text"
                    >
                      <td className="p-3"> {(page - 1) * limit + index + 1}</td>
                      <td className="p-3">{tag.label}</td>
                      <td className="p-3">{tag.code}</td>
                      <td>{tag.description}</td>

                      <td className="p-3">
                        <span
                          className={
                            tag.isActive
                           
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
      <div className="flex justify-end items-center gap-4 mt-5">
  <button
    disabled={!pagination.hasPrevPage}
    onClick={() => fetchTags(page - 1)}
    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
  >
    Previous
  </button>

  <span>
    Page {pagination.currentPage} of {pagination.totalPages}
  </span>

  <button
    disabled={!pagination.hasNextPage}
    onClick={() => fetchTags(page + 1)}
    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
  >
    Next
  </button>
</div>
    </div>
  );
};

export default TagArticle;
