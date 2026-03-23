import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import dateFormatUtils from "../../utils/dateFormatUtils";

const TagArticle = () => {
  const [tags, setTags] = useState([]);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    label: "",
    isActive: true,
  });

  useEffect(() => {
    fetchTags();
  }, []);

  // 🔄 Fetch Tags
  const fetchTags = async () => {
    try {
      const res = await api("/api/services/articleTag?format=raw");
      setTags(res.data || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  // ✏️ Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✏️ Handle Edit
  const handleEdit = (tag) => {
    setFormData({
      code: tag.code,
      ddescription: tag.description ,
      label: tag.label,
      isActive: tag.isActive,
    });
    setEditId(tag._id);
  };

  // ❌ Cancel
  const handleCancel = () => {
    setEditId(null);
    setFormData({
      code: "",
      description: "",
      label: "",
      isActive: true,
    });
  };

  // ➕ CREATE + ✏️ UPDATE
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
        // UPDATE
        await api(`/api/services/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE
        await api("/api/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      // Reset
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

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="max-w-6xl mx-auto">

        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">


            {/* Label */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Tag Name 
              </label>
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
  <label className="text-sm font-medium mb-1">
    Description
  </label>
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

        {/* TABLE */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Existing Tags
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left text-sm">
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
                    className="border-b hover:bg-gray-50 text-sm"
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

                    <td className="p-3">
                      {dateFormatUtils(tag.createdAt)}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
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

      </div>
    </div>
  );
};

export default TagArticle;