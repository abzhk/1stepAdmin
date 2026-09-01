import React, { useState ,useEffect} from "react";
import ViewAssessmentCategories from "./ViewAssessment";
import {api} from "../../utils/api.js"
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";
import { useNavigate,useParams } from "react-router-dom";
import toast from "react-hot-toast";


const AddAssessmentCategory = () => {
  const [formData, setFormData] = useState({
    name: "",
    icon: "📝",
    order: 0,
    description: "",
  });
  const navigate= useNavigate();

  const [tests, setTests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastOrder, setLastOrder] = useState(0);
  const { id } = useParams();
const isEdit = Boolean(id);
const [specializations, setSpecializations] = useState([]);

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

     const url = isEdit
  ? `/api/assessment/category/${id}`
  : "/api/assessment/category";

const method = isEdit ? "PUT" : "POST";

const data = await api(url, {
  method,
  body: JSON.stringify({
    ...formData,
    tests,
  }),
});
      if (!data.success) {
      throw new Error(data.message || "Failed to update category");
    }


      setSuccess(
  isEdit
    ? "Category updated successfully"
    : "Category created successfully"
);

      setFormData({
        name: "",
        icon: "📝",
        order: 1,
        description: "",
      });
      
      setTests([]);
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const fetchSpecializations = async () => {
    try {
      const res = await api("/api/specialization");

      setSpecializations(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchSpecializations();
}, []);


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

const handleTestChange = (index, field, value) => {
  const updated = [...tests];
  updated[index][field] = value;
  setTests(updated);
};

const addTestRow = () => {
  setTests([
    ...tests,
    {
      code: "",
      name: "",
      description: "",
      isActive: true,
    },
  ]);
};

const removeTestRow = (index) => {
  setTests(tests.filter((_, i) => i !== index));
};

const resetForm = () => {
  setFormData({
    name: "",
    icon: "📝",
    order: 1,
    description: "",
  });
   setTests([]);
};


useEffect(() => {
  if (!id) return;

  const fetchCategory = async () => {
    try {
      const res = await api(`/api/assessment/category/edit/${id}`);

      setFormData({
        name: res.data.name,
        icon: res.data.icon,
        order: res.data.order,
        description: res.data.description,
        status: res.data.status,
         specialization: res.data.specialization?._id || "",
      });

      setTests(res.data.tests || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  fetchCategory();
}, [id]);

  return (
   
    <div className="min-h-screen bg-[#f5f5f0] w-full px-6 py-8">
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
          <h2 className="text-subheading">
  {isEdit ? "Edit Category" : "Add Category"}
</h2>
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
                focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow bg-offwhite"
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
      focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow bg-offwhite"
              />
            </div>

            <div>
              <label className="text-label"> Order {lastOrder > 0 && `(Last used: ${lastOrder})`}</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                min={0}
                onChange={handleChange}
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow bg-offwhite"
                placeholder="Eg: 1"
              />
            </div>
            <div>
  <label className="text-label">
    Specialization
  </label>

  <select
    name="specialization"
    value={formData.specialization}
    onChange={handleChange}
    required
    className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm
    focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow bg-offwhite"
  >
    <option value="">Select Specialization</option>

    {specializations.map((specialization) => (
      <option
        key={specialization._id}
        value={specialization._id}
      >
        {specialization.name}
      </option>
    ))}
  </select>
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
                resize-none focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow bg-offwhite"
              />
            </div>
          </div>


         <div className="mt-8 border-t pt-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-semibold">Assessment Tests</h3>

    <button
      type="button"
      onClick={addTestRow}
      className="px-4 py-2 bg-darkgreen text-white rounded-lg"
    >
      + Add Test
    </button>
  </div>

  <div className="bg-offwhite rounded-xl border border-gray-100 overflow-hidden">

    <div className="grid grid-cols-12 gap-3 bg-offwhite px-4 py-3 text-cardfooter text-sm">
      <div className="col-span-2">Code</div>
      <div className="col-span-3">Name</div>
      <div className="col-span-5">Description</div>
      <div className="col-span-2 text-center">Action</div>
    </div>

    {tests.map((test, index) => (
      <div
        key={index}
        className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-t border-gray-500  hover:bg-offwhite transition"
      >
        <div className="col-span-2">
          <input
            value={test.code}
            onChange={(e) =>
              handleTestChange(index, "code", e.target.value)
            }
            className="w-full   bg-white rounded-lg px-3 py-2"
          />
        </div>

        <div className="col-span-3">
          <input
            value={test.name}
            onChange={(e) =>
              handleTestChange(index, "name", e.target.value)
            }
            className="w-full  bg-white rounded-lg px-3 py-2"
          />
        </div>

        <div className="col-span-5">
          <input
            value={test.description}
            onChange={(e) =>
              handleTestChange(index, "description", e.target.value)
            }
            className="w-full   bg-white rounded-lg px-3 py-2"
          />
        </div>

        <div className="col-span-2 flex justify-center">
          <button
            type="button"
            onClick={() => removeTestRow(index)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Remove
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-darkgreen text-white hover:bg-darkgreen/60 shadow-sm transition 
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
  ? "Saving..."
  : isEdit
  ? "Update Category"
  : "Save Category"}
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