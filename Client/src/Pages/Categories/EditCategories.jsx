import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const EditCategory = ({ isOpen, onClose, categoryId, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, reset } = useForm();


  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/category/category/${categoryId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        reset({
          name: data.category.name,
          description: data.category.description,
          icon: data.category.icon,
          color: data.category.color,
          order: data.category.order,
        });
      } catch (err) {
        setErrorMsg(err.message);
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

      const res = await fetch(`http://localhost:3001/api/category/category/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
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

        {errorMsg && (
          <p className="text-red-500 mb-4 bg-red-100 p-2 rounded">{errorMsg}</p>
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
              <input type="number" {...register("order")} className="w-full border p-2 rounded" />
            </div>

            <div className="col-span-2">
              <label>Description</label>
              <textarea {...register("description")} className="w-full border p-2 rounded" />
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded">
              {loading ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
