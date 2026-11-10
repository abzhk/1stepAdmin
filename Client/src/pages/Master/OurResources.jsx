/**
 * @file OurResources.jsx
 * @author Imran
 * @created 10/11/2026
 * @lastModified 10/11/2026 by Imran
 *
 * [ChangeLog]:
 * - 10/11/2026: Initial creation by Imran for managing ourResources navbar masterData and navigation routes.
 */
import React, { useEffect, useState, useRef } from "react";
import { api } from "../../utils/api.js";
import dateFormatUtils from "../../utils/dateFormatUtils.js";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import SortableHeader from "../../Components/SortableHeader";
import { z } from "zod";
import { BookOpen, ExternalLink, ShieldCheck } from "lucide-react";

const AVAILABLE_ROLES = [
  { id: "guest", label: "Guest" },
  { id: "parent", label: "Parent" },
  { id: "provider", label: "Provider" },
  { id: "centre", label: "Centre" },
];

const resourceSchema = z.object({
  label: z.string().trim().min(1, "Resource label is required").max(60),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(60)
    .regex(/^[a-z0-9_]+$/, "Code must be lowercase letters, numbers, or underscores"),
  category: z.string().trim().min(1, "Category is required").max(60),
  categoryOrder: z.number().min(0, "Category order must be 0 or greater"),
  path: z.string().trim().min(1, "Navigation path is required"),
  order: z.number().min(1, "Order must be 1 or greater"),
  description: z.string().max(160).optional(),
  isExternal: z.boolean().default(false),
  isActive: z.boolean().default(true),
  allowedRoles: z.array(z.string()).min(1, "Select at least one allowed role"),
});

const OurResources = () => {
  const [resources, setResources] = useState([]);
  const { searchTerm } = useOutletContext();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const limit = 10;
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    code: "",
    label: "",
    category: "",
    categoryOrder: 1,
    path: "",
    order: 1,
    description: "",
    isExternal: false,
    isActive: true,
    allowedRoles: ["guest", "parent", "provider", "centre"],
  });

  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "order",
    direction: "asc",
  });

  useEffect(() => {
    fetchResources(page, searchTerm, sortConfig);
  }, [page, searchTerm, sortConfig]);

  const fetchResources = async (pageNo = page, search = searchTerm, sort = sortConfig) => {
    try {
      const res = await api(
        `/api/services/admin/ourResources?page=${pageNo}&limit=${limit}&search=${encodeURIComponent(
          search || ""
        )}&sortBy=${sort.key}&sortOrder=${sort.direction}`
      );

      setResources(res.data || []);
      setPagination(res.pagination || {});
      setPage(pageNo);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch resources");
    }
  };

  const handleRoleToggle = (roleId) => {
    setFormData((prev) => {
      const current = prev.allowedRoles || [];
      const updated = current.includes(roleId)
        ? current.filter((r) => r !== roleId)
        : [...current, roleId];
      return { ...prev, allowedRoles: updated };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = resourceSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setFormErrors(fieldErrors);
      toast.error("Please resolve the form errors");
      return;
    }

    try {
      const payload = {
        type: "ourResources",
        code: formData.code.trim().toLowerCase(),
        label: formData.label.trim(),
        category: formData.category.trim(),
        description: formData.description?.trim() || "",
        order: Number(formData.order),
        isActive: formData.isActive,
        metadata: {
          path: formData.path.trim(),
          categoryOrder: Number(formData.categoryOrder) || 1,
          isExternal: Boolean(formData.isExternal),
          allowedRoles: formData.allowedRoles,
        },
      };

      if (editId) {
        await api(`/api/services/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Resource updated successfully");
      } else {
        await api("/api/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Resource created successfully");
      }

      setFormData({
        code: "",
        label: "",
        category: "",
        categoryOrder: 1,
        path: "",
        order: 1,
        description: "",
        isExternal: false,
        isActive: true,
        allowedRoles: ["guest", "parent", "provider", "centre"],
      });
      setFormErrors({});
      setEditId(null);
      fetchResources();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleEdit = (resource) => {
    setEditId(resource._id);
    setFormData({
      code: resource.code || "",
      label: resource.label || "",
      category: resource.category || "",
      categoryOrder: resource.metadata?.categoryOrder ?? 1,
      path: resource.metadata?.path || "",
      order: resource.order ?? 1,
      description: resource.description || "",
      isExternal: Boolean(resource.metadata?.isExternal),
      isActive: resource.isActive !== false,
      allowedRoles:
        Array.isArray(resource.metadata?.allowedRoles) && resource.metadata.allowedRoles.length > 0
          ? resource.metadata.allowedRoles
          : ["guest", "parent", "provider", "centre"],
    });

    setFormErrors({});
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({
      code: "",
      label: "",
      category: "",
      categoryOrder: 1,
      path: "",
      order: 1,
      description: "",
      isExternal: false,
      isActive: true,
      allowedRoles: ["guest", "parent", "provider", "centre"],
    });
    setFormErrors({});
  };

  const handleDelete = async () => {
    try {
      await api(`/api/services/${deleteId}`, {
        method: "DELETE",
      });

      toast.success("Resource deleted successfully");
      fetchResources();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete resource");
    }
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";

    setPage(1);
    setSortConfig({ key, direction });
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="mx-auto">
        <PermissionGuard module={MODULES.MASTER_DATA} action={ACTIONS.CREATE}>
          <div
            ref={formRef}
            style={{ scrollMarginTop: "160px" }}
            className="bg-white p-6 rounded-2xl shadow-md mb-8 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-darkgreen" size={22} />
              <h2 className="text-lg font-bold text-darkgreen">
                {editId ? "Edit Resource Link" : "Create New Resource Link"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resource Label */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Resource Title *</label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  placeholder="e.g. Articles & Guides"
                  maxLength={60}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite border border-gray-200 focus:outline-none focus:ring-1 focus:ring-darkgreen text-sm"
                  required
                />
                {formErrors.label && (
                  <span className="text-xs text-red-500 mt-1">{formErrors.label}</span>
                )}
              </div>

              {/* Code */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Code (slug) *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  placeholder="e.g. resource_articles"
                  maxLength={60}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite border border-gray-200 focus:outline-none focus:ring-1 focus:ring-darkgreen text-sm"
                  required
                />
                {formErrors.code && (
                  <span className="text-xs text-red-500 mt-1">{formErrors.code}</span>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Category (Dropdown Column) *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  placeholder="e.g. Learn & Explore"
                  maxLength={60}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite border border-gray-200 focus:outline-none focus:ring-1 focus:ring-darkgreen text-sm"
                  required
                />
                {formErrors.category && (
                  <span className="text-xs text-red-500 mt-1">{formErrors.category}</span>
                )}
              </div>

              {/* Category Column Order */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Category Column Order</label>
                <input
                  type="number"
                  name="categoryOrder"
                  min={0}
                  value={formData.categoryOrder}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite border border-gray-200 focus:outline-none focus:ring-1 focus:ring-darkgreen text-sm"
                />
              </div>

              {/* Path */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Navigation Path / Route *</label>
                <input
                  type="text"
                  name="path"
                  value={formData.path}
                  placeholder="e.g. /resources/articles or /about-us#faq"
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite border border-gray-200 focus:outline-none focus:ring-1 focus:ring-darkgreen text-sm"
                  required
                />
                {formErrors.path && (
                  <span className="text-xs text-red-500 mt-1">{formErrors.path}</span>
                )}
              </div>

              {/* Item Order */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Item Order (in Category) *</label>
                <input
                  type="number"
                  name="order"
                  min={1}
                  value={formData.order}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite border border-gray-200 focus:outline-none focus:ring-1 focus:ring-darkgreen text-sm"
                  required
                />
                {formErrors.order && (
                  <span className="text-xs text-red-500 mt-1">{formErrors.order}</span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium mb-1">Short Description (optional subtitle)</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  placeholder="e.g. Expert-written therapy and developmental guides"
                  maxLength={160}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 bg-offwhite border border-gray-200 focus:outline-none focus:ring-1 focus:ring-darkgreen text-sm"
                />
              </div>

              {/* Allowed Roles */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium mb-2">Role Visibility *</label>
                <div className="flex flex-wrap gap-4">
                  {AVAILABLE_ROLES.map((role) => (
                    <label
                      key={role.id}
                      className="inline-flex items-center gap-2 cursor-pointer text-sm font-normal text-gray-700 bg-offwhite px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.allowedRoles.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        className="rounded text-darkgreen focus:ring-darkgreen"
                      />
                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
                {formErrors.allowedRoles && (
                  <span className="text-xs text-red-500 mt-1">{formErrors.allowedRoles}</span>
                )}
              </div>

              {/* Checkboxes: isExternal, isActive */}
              <div className="flex items-center gap-6 md:col-span-2 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    name="isExternal"
                    checked={formData.isExternal}
                    onChange={handleChange}
                    className="rounded text-darkgreen focus:ring-darkgreen"
                  />
                  <span>Open in external tab</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="rounded text-darkgreen focus:ring-darkgreen"
                  />
                  <span>Active (visible in navbar)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="md:col-span-2 flex justify-end gap-3 mt-3">
                {editId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-peach text-white px-6 py-2 rounded-lg hover:bg-darkgreen transition text-sm font-medium"
                >
                  {editId ? "Update Resource" : "Create Resource"}
                </button>
              </div>
            </form>
          </div>
        </PermissionGuard>

        {/* Existing Resources Table */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-tabheading">Existing Resource Links</h3>
            <span className="text-xs text-gray-500">
              Total: {pagination.totalItems ?? resources.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-offwhite text-left text-sm">
                  <th className="p-3">Sl.No</th>
                  <SortableHeader
                    title="Resource Title"
                    field="label"
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                  />
                  <SortableHeader
                    title="Path"
                    field="metadata.path"
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                  />
                  <SortableHeader
                    title="Category"
                    field="category"
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                  />
                  <th className="p-3">Roles</th>
                  <SortableHeader
                    title="Order"
                    field="order"
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                  />
                  <SortableHeader
                    title="Status"
                    field="isActive"
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                  />
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {resources.map((resItem, index) => (
                  <tr
                    key={resItem._id}
                    className="hover:bg-offwhite text-table-text text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <td className="p-3">{(page - 1) * limit + index + 1}</td>
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>{resItem.label}</span>
                        {resItem.metadata?.isExternal && (
                          <ExternalLink size={13} className="text-gray-400" />
                        )}
                      </div>
                      {resItem.description && (
                        <span className="text-xs text-gray-400 block line-clamp-1">
                          {resItem.description}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-gray-600 font-mono">
                      {resItem.metadata?.path || "—"}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-offwhite rounded-full text-xs font-medium text-darkgreen border border-gray-200">
                        {resItem.category || "—"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(resItem.metadata?.allowedRoles || ["all"]).map((r) => (
                          <span
                            key={r}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-2xs uppercase tracking-wider"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{resItem.order}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          resItem.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {resItem.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <PermissionGuard
                          module={MODULES.MASTER_DATA}
                          action={ACTIONS.UPDATE}
                        >
                          <button
                            onClick={() => handleEdit(resItem)}
                            className="px-3 py-1.5 bg-darkgreen text-white rounded-lg text-xs hover:bg-opacity-90 transition"
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
                              setDeleteId(resItem._id);
                              setShowDeleteModal(true);
                            }}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}

                {resources.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-gray-500">
                      No resource links found. Use the form above to create your first link.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center mt-5 gap-4">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => fetchResources(page - 1)}
              className="px-4 py-2 bg-gray-200 rounded-2xl disabled:opacity-50 hover:bg-gray-300 transition text-xs"
            >
              Previous
            </button>
            <span className="text-xs">
              Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => fetchResources(page + 1)}
              className="px-4 py-2 bg-gray-200 rounded-2xl disabled:opacity-50 hover:bg-gray-300 transition text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg border border-gray-100">
            <h2 className="text-base font-bold mb-2 text-gray-900">Delete Resource Link</h2>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this resource link from the website navbar?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-sm font-medium"
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

export default OurResources;
