import React, { useEffect, useState } from "react";

const ViewAssessment = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "http://localhost:3001/api/assessment/category/getall"
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch");

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
  }, []);

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
      const res = await fetch(
        `http://localhost:3001/api/assessment/category/toggle/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update");
      }
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full bg-secondary mt-8">
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
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
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 ">
                      Sl.NO
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 ">
                      Icon
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 ">
                      Order
                    </th>
                    {/* <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 ">
                      Status
                    </th> */}
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 ">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCategories.map((assessment, index) => (
                    <tr key={assessment._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-4 py-3 text-xl">{assessment.icon}</td>

                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {assessment.name}
                      </td>

                      <td className="px-4 py-3 text-gray-600 max-w-[300px] truncate">
                        {assessment.description}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {assessment.order}
                      </td>
                      {/* 
                      <td className="px-4 py-3">
                        <button
                          className={`px-3 py-1 text-xs rounded text-white ${
                            assessment.status
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-700"
                          }`}
                        >
                          {assessment.status ? "Deactivate" : "Activate"}
                        </button>
                      </td> */}

                      <td className="px-4 py-3 flex items-center gap-3 justify-center">
                        <button className="px-5 py-2 text-xs rounded-md bg-primary text-white hover:bg-primary">
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggle(assessment._id)}
                          className={`px-5 py-2 text-xs rounded-md text-white 
                    ${ assessment.status
                            ? "bg-primary hover:bg-primary"
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
    </div>
  );
};

export default ViewAssessment;
