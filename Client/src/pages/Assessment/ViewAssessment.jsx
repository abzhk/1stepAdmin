import React, { useEffect, useState } from "react";
import {api} from "../../utils/api.js";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ViewAssessment = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { searchTerm } = useOutletContext();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
const [showDeletePopup, setShowDeletePopup] = useState(false);

  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();

       if (searchTerm?.trim()) {
      params.append("search", searchTerm.trim());
    }

 const data = await api(`/api/assessment/category/getall?${params}`);
    console.log("Fetched categories:", data.data);
      setCategories(data.data || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const visibleCategories = categories.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const goToPage = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
  };

  const handleEdit = (assessment) => {
    console.log("Edit ");
  };

 const handleToggle = async (id) => {
  try {
    const data = await api(`/api/assessment/category/toggle/${id}`, {
      method: "PUT",
    });

     toast.success(data.message || "Category status updated successfully");


    // Refresh the list
    fetchCategories();
  } catch (err) {
    console.error(err);
     toast.error(err.message || "Failed to update category");
    setError(err.message || "Failed to update category");
  }
};


const handleDelete = async () => {
  if (!deleteId) return;

  try {
    const data = await api(`/api/assessment/category/${deleteId}`, {
      method: "DELETE",
    });

    toast.success(data.message || "Category deleted successfully");

    setShowDeletePopup(false);
    setDeleteId(null);

    fetchCategories();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to delete category");
  }
};

  return (
    <div className="w-full bg-secondary mt-8">
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
        <h2 className="text-subheading mb-6">
          Assessment Categories
        </h2>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-gray-600 text-center py-10">
            Loading categories...
          </p>
        ) : categories.length === 0 ? (
          <p className="text-gray-600 text-center py-10">
            No categories found.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full rounded-lg">
                <thead className="bg-offwhite rounded-2xl">
                  <tr>
                    <th className="px-4 py-3 text-left uppercase text-cardfooter ">
                      Sl.NO
                    </th>
                    <th className="px-4 py-3 text-left uppercase text-cardfooter ">
                      Icon
                    </th>
                    <th className="px-4 py-3 text-left uppercase text-cardfooter ">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left uppercase text-cardfooter ">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left uppercase text-cardfooter ">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left uppercase text-cardfooter ">
                      Assessment Code
                    </th>
                    <th className="px-4 py-3 text-left uppercase text-cardfooter ">
                      Specialization
                    </th>
                    <th className="px-4 py-3 text-center uppercase text-cardfooter ">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCategories.map((assessment, index) => (
                    <tr key={assessment._id} className="hover:bg-offwhite">
                      <td className="px-4 py-3 text-table-text font-medium">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-4 py-3 text-xl">{assessment.icon}</td>

                      <td className="px-4 py-3 text-table-text font-medium">
                        {assessment.name}
                      </td>

                      <td className="px-4 py-3 text-table-text max-w-[300px] truncate">
                        {assessment.description}
                      </td>

                      <td className="px-4 py-3 text-table-text">
                        {assessment.order}
                      </td>

                     <td className="px-4 py-3 text-table-text">
  {assessment.tests?.length ? (
    assessment.tests.map((test, i) => (
      <span key={test._id}>
        {test.code}
        {i < assessment.tests.length - 1 ? ", " : ""}
      </span>
    ))
  ) : (
    "-"
  )}
</td>

<td className="px-4 py-3 text-table-text">
  {assessment.tests?.length ? (
    assessment.tests.map((test) => (
      <div key={test._id}>
        {test.specialization?.name || "-"}
      </div>
    ))
  ) : (
    "-"
  )}
</td>

                      <td className="px-4 py-3 flex items-center gap-3 justify-center">
                        <button
  onClick={() => navigate(`/addassessment/${assessment._id}`)}
  className="px-5 py-2 text-sm font-semibold rounded-md bg-darkgreen text-white"
>
  Edit
</button>
 <button
  onClick={() => {
    setDeleteId(assessment._id);
    setShowDeletePopup(true);
  }}
  className="px-5 py-2 text-sm font-semibold rounded-md bg-red-500 text-white hover:bg-red-600"
>
  Delete
</button>

                        <button
                          onClick={() => handleToggle(assessment._id)}
                          className={`px-5 py-2 text-sm font-semibold rounded-md text-white 
                    ${ assessment.status
                            ? "bg-peach hover:bg-primary"
                      : "bg-red-500 hover:bg-red-600"}`}
                        >
                          {assessment.status ? "Active" : "Inactive"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} -{" "}
                {Math.min(startIndex + PAGE_SIZE, categories.length)} of{" "}
                {categories.length}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage === 1
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Prev
                </button>

                {(() => {
                  let start = Math.max(1, currentPage - 1);
                  let end = Math.min(totalPages, start + 2);

                  if (end - start < 2) {
                    start = Math.max(1, end - 2);
                  }

                  const pages = [];
                  for (let p = start; p <= end; p++) {
                    pages.push(
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`px-3 py-1 rounded-md border ${
                          currentPage === p
                            ? "bg-yellow-500 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  return pages;
                })()}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage === totalPages
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {showDeletePopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
      
      <h3 className="text-lg font-semibold text-gray-800">
        Delete Assessment Category?
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        Are you sure you want to delete this category?
        All tests belonging to this category will also be deleted.
      </p>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => {
            setShowDeletePopup(false);
            setDeleteId(null);
          }}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg
          border border-gray-200 bg-gray-100 text-gray-700
          hover:bg-gray-200"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg
          bg-red-500 text-white hover:bg-red-600"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default ViewAssessment;
