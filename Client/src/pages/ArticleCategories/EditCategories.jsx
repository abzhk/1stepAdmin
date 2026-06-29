import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {api} from "../../utils/api.js";
import toast from "react-hot-toast";

const EditCategory = ({ isOpen, onClose, categoryId, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm();


  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        const data = await api(`/api/category/category/${categoryId}`);

        reset({
          name: data.category.name,
          description: data.category.description,
          icon: data.category.icon,
          color: data.category.color,
          order: data.category.order,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategory();
    }
  }, [isOpen, categoryId, reset]);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);

      const data = await api(`/api/category/category/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!data.success) {
      throw new Error(data.message || "Failed to update category");
    }


      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl p-6 max-w-3xl w-full z-10">
        <h2 className="text-xl font-semibold mb-4">Edit Category</h2>

        {error && (
          <p className="text-red-500 mb-4 bg-red-100 p-2 rounded">{error}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            
            <div>
              <label>Name</label>
              <input {...register("name")} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label>Icon</label>
              <input {...register("icon")} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label>Color</label>
              <input type="color" {...register("color")} className="w-full h-10 border rounded" />
            </div>

            <div>
              <label>Order</label>
              <input type="number" min="0" {...register("order")} className="w-full border p-2 rounded" />
            </div>

            <div className="col-span-2">
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
  className="w-full border p-2 rounded"
/>

{errors.description && (
  <p className="text-red-500 text-sm mt-1">
    {errors.description.message}
  </p>
)}
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-darkgreen text-white px-4 py-2 rounded-lg">
              {loading ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
