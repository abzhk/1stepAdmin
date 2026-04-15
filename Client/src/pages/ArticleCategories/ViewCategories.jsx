import React, { useState, useMemo } from "react";
import AddCategory from "./AddCategories";
import { useEffect } from "react";
import EditCategory from "./EditCategories";
import {api} from "../../utils/api.js";


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


const fetchCategories = async () => {
  try {
    setLoading(true);
    setError("");

    const data = await api(`/api/category/getallcategories`);

    setCategories(data.categories || []);
    setTotalCount(data.total || 0);
  } catch (err) {
    console.error(err);
    setError("Failed to load categories");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchCategories();
}, []);


  const visibleCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, currentPage]);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

const handleSaveCategory = () => {
  fetchCategories(); 
};

  const goToPage = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
  };
  
  const handleToggleStatus = async (id) => {
  try {
   const data = await api(
      `/api/article/admin/categories/${id}/status`,
      {
        method: "PUT",
      }
    );

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
    <div className="p-6 bg-offwhite min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-outerheader tracking-tight">
          No of Categories: {totalCount}
        </h2>
        <button
          onClick={handleOpen}
          className="bg-darkgreen hover:bg-lighthov text-white px-6 py-2 rounded-xl shadow-md"
        >
          + Add Category
        </button>
      </div>

      <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm  overflow-x-auto">
        <table className="w-full table-auto shadow-sm rounded-2xl">
          <thead>
            <tr className="bg-offwhite  text-left">
              <th className="px-4 sm:px-6 py-4 text-left text-cardfooter uppercase tracking-wider">S.No</th>
              <th className="px-4 sm:px-6 py-4 text-left text-cardfooter uppercase tracking-wider">Category Name</th>
               <th className="px-4 sm:px-6 py-4 text-left text-cardfooter uppercase tracking-wider">Icon</th>
              <th className="px-4 sm:px-6 py-4 text-left text-cardfooter uppercase tracking-wider">Color</th>
              <th className="px-4 sm:px-6 py-4 text-left text-cardfooter uppercase tracking-wider">Order</th>
              {/* <th className="p-3">Article Count</th> */}
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-[#8fa797] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {visibleCategories.map((item, index) => (
              <tr key={item._id} className="hover:bg-[#F6F4F0]/50 transition-colors group">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-table-text">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-table-text">{item.name}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-table-text">{item.icon}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-table-text">{item.color}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-table-text">{item.order}</td>
                {/* <td className="p-3">{item.articleCount}</td> */}

                <td className="p-3 flex gap-2">
                  <button
  onClick={() => handleEdit(item._id)}
  className="bg-darkgreen text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
>
  Edit
</button>

                  <button
    onClick={() => handleToggleStatus(item._id)}
    className={`px-4 py-1 rounded-lg text-white text-sm shadow
      ${item.isActive ? "bg-darkgreen hover:bg-darkgreen/80" : "bg-red-500 hover:bg-red-600"}
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
