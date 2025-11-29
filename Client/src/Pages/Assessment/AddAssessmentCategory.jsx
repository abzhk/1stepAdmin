import React, { useState } from "react";
import ViewAssessmentCategories from "./ViewAssessment";

const AddAssessmentCategory = () => {
  const [formData, setFormData] = useState({
    name: "",
    icon: "📝",
    order: 0,
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/assessment/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create category");
      }

      setSuccess("Category created successfully ✅");

      setFormData({
        name: "",
        icon: "📝",
        order: 1,
        description: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 w-full px-6 py-8">
      <div className="w-full bg-white shadow-lg rounded-2xl border border-emerald-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Category</h2>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
            Assessment Category
          </span>
        </div>
        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
            {success}
          </p>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Category Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                placeholder="Eg: Emotional Wellness"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Icon (Emoji)
              </label>
              <input
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="Eg: 😔 or 😴 or ⭐"
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm 
      focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                placeholder="Eg: 1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe..."
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2.5 h-28 text-sm 
                resize-none focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-[#fbbf24] text-white hover:bg-gray-50 transition"
              onClick={() =>
                setFormData({
                  name: "",
                  icon: "📝",
                  order: 1,
                  description: "",
                })
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition 
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
      <ViewAssessmentCategories />
    </div>
  );
};

export default AddAssessmentCategory;
