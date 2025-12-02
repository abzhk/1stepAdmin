import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const AddCategory = ({ isOpen, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      icon: "📝",
      color: "#65467C",
      order: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      setErrorMsg("");
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, reset]);


  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const onSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setErrorMsg("");


      const res = await fetch("http://localhost:3001/api/category/addcategory", {
        method: "POST",
       credentials: "include",
         headers: {
    "Content-Type": "application/json",   
  },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          icon: formData.icon,
          color: formData.color,
          order: parseInt(formData.order) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to create category");
      }

      console.log("Category created successfully:", data);


      if (onSave) onSave();


      onClose();
    } catch (err) {
      console.error("Failed to create category:", err);
      setErrorMsg(err.message || "Error creating category");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Add Category</h3>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category Name *</label>
              <input
                {...register("name", {
                  required: "Category name is required",
                })}
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-100"
                placeholder="Enter category name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Icon</label>
              <select
                {...register("icon")}
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-100"
              >
                <option value="📝">📝 Default</option>
                <option value="💭">💭 Technique</option>
                <option value="🌟">🌟 Wellness</option>
                <option value="💆">💆 Self-care</option>
                <option value="❤️">❤️ Relationship</option>
                <option value="🧘">🧘 Finance</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Color</label>
              <input
                type="color"
                {...register("color")}
                className="block w-full h-10 mt-2 rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Order</label>
              <input
                type="number"
                {...register("order")}
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-100"
                placeholder="Display order"
              />
              {errors.order && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.order.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Description *</label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                  maxLength: {
                    value: 200,
                    message: "Description must be less than 200 characters",
                  },
                })}
                placeholder="Enter category description"
                className="block w-full mt-2 rounded-lg border border-gray-200 px-4 py-2 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-green-100"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-[#3a8585] px-4 py-2 rounded-lg border hover:bg-green-800 text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-[#fbbf24] text-black font-medium shadow hover:opacity-95 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
