import React, { useState, useMemo } from "react";
import AddCategory from "./AddCategories";
import { useEffect } from "react";
import EditCategory from "./EditCategories";


const ViewCategories = () => {
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);



  const PAGE_SIZE = 5; 
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));


useEffect(() => {
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:3001/api/category/getallcategories", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await res.json();

      setCategories(data.categories || []);
      setTotalCount(data.total || 0);

    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  fetchCategories();
}, []);


  const visibleCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, currentPage]);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const handleSaveCategory = () => {
  };

  const goToPage = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
  };
  
  const handleToggleStatus = async (id) => {
  try {
    const res = await fetch(
      `http://localhost:3001/api/article/admin/categories/${id}/status`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to toggle status");
    }

    const data = await res.json();

    setCategories((prev) =>
      prev.map((cat) =>
        cat._id === id ? { ...cat, isActive: data.isActive } : cat
      )
    );
  } catch (error) {
    console.error(error);
    alert("Failed to update category status");
  }
};
const handleEdit = (id) => {
  setEditCategoryId(id);
  setIsEditModalOpen(true);
};



  return (
    <div className="p-6 bg-secondary min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          No of Categories: {totalCount}
        </h2>
        <button
          onClick={handleOpen}
          className="bg-greenbtn hover:bg-lighthov text-white px-6 py-2 rounded-xl shadow-md"
        >
          + Add Category
        </button>
      </div>

      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-secondary overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">S.No</th>
              <th className="p-3">Category Name</th>
               <th className="p-3">Icon</th>
              <th className="p-3">Color</th>
              <th className="p-3">Order</th>
              {/* <th className="p-3">Article Count</th> */}
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {visibleCategories.map((item, index) => (
              <tr key={item._id} className="hover:bg-gray-50 transition">
                <td className="p-3 font-bold">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.icon}</td>
                <td className="p-3">{item.color}</td>
                <td className="p-3">{item.order}</td>
                {/* <td className="p-3">{item.articleCount}</td> */}

                <td className="p-3 flex gap-2">
                  <button
  onClick={() => handleEdit(item._id)}
  className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
>
  Edit
</button>

                  <button
    onClick={() => handleToggleStatus(item._id)}
    className={`px-4 py-1 rounded-lg text-white text-sm shadow
      ${item.isActive ? "bg-primary hover:bg-primary" : "bg-red-500 hover:bg-red-600"}
    `}
  >
    {item.isActive ? "Active" : "Inactive"}
  </button>
                </td>
              </tr>
            ))}

            {visibleCategories.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No categories to show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * PAGE_SIZE + 1} -
          {Math.min(currentPage * PAGE_SIZE, categories.length)} of {categories.length}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-1 rounded-md border ${isActive ? "bg-primary text-white" : "hover:bg-gray-100"}`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md border ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
          >
            Next
          </button>
        </div>
      </div>

      <AddCategory
        isOpen={isModalOpen}
        onClose={handleClose}
        onSave={handleSaveCategory}
      />
      <EditCategory
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  categoryId={editCategoryId}
  onUpdated={() => window.location.reload()} 
/>
    </div>
  );
};

export default ViewCategories;
