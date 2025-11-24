import React, { useState, useMemo } from "react";
import AddCategory from "./AddCategories";

const ViewCategories = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: "Audible", slug: "RED", type: "RISK", description: "Conscious" },
    { id: 2, name: "Physico", slug: "YELLOW", type: "SAFETY", description: "High " },
    { id: 3, name: "Chemical", slug: "BLUE", type: "HAZARD", description: "Handle " },
    { id: 4, name: "Mechanical", slug: "GREEN", type: "EQUIPMENT", description: "Machine zone" },
    { id: 5, name: "Fire", slug: "RED", type: "EMERGENCY", description: "Fire" },
    { id: 6, name: "Noise", slug: "ORANGE", type: "ALERT", description: "High noise level" },
    { id: 7, name: "First Aid", slug: "GREEN", type: "SUPPORT", description: "Medical assistance available" },
    { id: 8, name: "Security", slug: "BLUE", type: "PROTECTION", description: "Restricted access" },
    { id: 9, name: "Cleaning", slug: "PURPLE", type: "MAINTENANCE", description: "Wet floor risk" },
    { id: 10, name: "General", slug: "GRAY", type: "INFO", description: "General category" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);


  const PAGE_SIZE = 5; 
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));


  const visibleCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, currentPage]);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const handleSaveCategory = (newCategory) => {
    // const maxId = categories.reduce((max, c) => (c.id > max ? c.id : max), 0);
    // const catWithId = { ...newCategory, id: maxId + 1 };
    // setCategories((prev) => [catWithId, ...prev]);


    // setCurrentPage(1);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this category?")) return;
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      if (currentPage > nextTotalPages) {
        setCurrentPage(nextTotalPages);
      }
      return next;
    });
  };

  const goToPage = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          No of Categories: {categories.length}
        </h2>
        <button
          onClick={handleOpen}
          className="bg-[#fbbf24] hover:bg-yellow-600 text-white px-6 py-2 rounded-xl shadow-md"
        >
          + Add Category
        </button>
      </div>

      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">S.No</th>
              <th className="p-3">Category Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Type</th>
              <th className="p-3">Description</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {visibleCategories.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="p-3 font-bold">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.slug}</td>
                <td className="p-3">{item.type}</td>
                <td className="p-3">{item.description}</td>

                <td className="p-3 flex gap-2">
                  <button className="bg-gradient-to-r from-[#fbbf24] to-yellow-300 text-black px-4 py-2 rounded-lg shadow hover:opacity-90 transition">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-gradient-to-r from-green-500 to-green-300 px-4 py-2 rounded-lg shadow hover:opacity-90 transition "
                  >
                    Delete
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
                className={`px-3 py-1 rounded-md border ${isActive ? "bg-yellow-500 text-white" : "hover:bg-gray-100"}`}
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
    </div>
  );
};

export default ViewCategories;
