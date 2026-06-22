import React, { useState ,useEffect} from "react";
import ViewAssessmentCategories from "./ViewAssessment";
import {api} from "../../utils/api.js"
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";
import { useNavigate } from "react-router-dom";

const AddAssessmentCategory = () => {
  const [formData, setFormData] = useState({
    name: "",
    icon: "📝",
    order: 0,
    description: "",
  });
  const navigate= useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastOrder, setLastOrder] = useState(0);

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

      const data = await api ('/api/assessment/category',{
        method: "POST",
         body: JSON.stringify(formData),
      })
      if (!data.success) {
      throw new Error(data.message || "Failed to update category");
    }


      setSuccess("Category created successfully");

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


useEffect(() => {
  const fetchLastOrder = async () => {
    try {
      const res = await api("/api/assessment/last-order");
      setLastOrder(res.lastOrder || 0);
    } catch (err) {
      console.error(err);
    }
  };

  fetchLastOrder();
}, []);

  return (
   
    <div className="min-h-screen bg-secondary w-full px-6 py-8">
     <div className="flex justify-end mb-4">
  <button
    onClick={() => navigate("/assessment-list")}
    className="px-4 py-2 bg-darkgreen text-white rounded-lg"
  >
    Assessment List
  </button>
</div>
      <div className="w-full bg-white shadow-lg rounded-2xl border border-emerald-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-subheading">Add Category</h2>
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
         <PermissionGuard module={MODULES.ASSESSMENT} action={ACTIONS.CREATE}>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-label">
                Category Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow"
                placeholder="Eg: Emotional Wellness"
              />
            </div>

            <div>
              <label className="text-label">
                Icon (Emoji)
              </label>
              <input
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="Eg: 😔 or 😴 or ⭐"
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm 
      focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow"
              />
            </div>

            <div>
              <label className="text-label"> Order {lastOrder > 0 && `(Last used: ${lastOrder})`}</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow"
                placeholder="Eg: 1"
              />
            </div>

            <div>
              <label className="text-label">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe..."
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2.5 h-28 text-sm 
                resize-none focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-softpeach text-white hover:bg-primary transition"
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
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-darkgreen text-white hover:bg-darkgreen/60 shadow-sm transition 
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
        </PermissionGuard>
      </div>
     <PermissionGuard module={MODULES.ASSESSMENT} action={ACTIONS.READ}>
  <ViewAssessmentCategories />
</PermissionGuard>
    </div>

  );
};

export default AddAssessmentCategory;
