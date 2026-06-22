import React, { useEffect, useState } from "react";
import dateFormatUtils from "../../utils/dateFormatUtils.js";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js"
import { useOutletContext } from "react-router-dom";


const ListViewArticle = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [status, setStatus] = useState("all");
const {searchTerm}  = useOutletContext();

  const fetchArticles = async () => {
  try {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      page,
      limit: 10,
      status,
    });

    if (searchTerm?.trim()) {
      params.append("search", searchTerm.trim());
    }

    const data = await api(`/api/article/all?${params}`);

    setArticles(data.articles || []);
    setTotalPages(data.totalPages || 1);
  } catch (err) {
    console.error(err);
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  const handleToggleFeatured = async (id) => {
    try {
      const data = await api(`/api/article/featured/${id}`, {
        method: "PUT",
      });
  await fetchArticles();
      setArticles((prev) =>
        prev.map((a) => (a._id === id ? { ...a, featured: data.featured } : a)),
      );
    } catch (err) {
      console.error(err);
    }
  };

 const handleDelete = async () => {
  try {
    await api(`/api/article/admin/delete/${deleteId}`, {
      method: "DELETE",
    });

    toast.success("Article deleted");
    setShowDeleteModal(false);
    fetchArticles();
  } catch (err) {
    console.log(err);
    toast.error("Delete failed");
  }
};

useEffect(() => {
  fetchArticles();
}, [page, status,searchTerm]);

  return (
    <div className="min-h-screen bg-secondary p-6">
      <button
        type="button"
        onClick={() => navigate("/viewarticle")}
        className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow">
        <div className="flex justify-between items-center">
        <div className="p-4 ">
          <h1 className="text-tabheading">Articles List</h1>
        </div>
      <div className="flex items-center gap-2 p-4">
  

  <select
    value={status}
    onChange={(e) => {
      setStatus(e.target.value);
      setPage(1);
    }}
    className="px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-darkgreen"
  >
    <option value="all">All</option>
    <option value="approved">Approved</option>
    <option value="pending">Pending</option>
    <option value="rejected">Rejected</option>
  </select>
</div>
</div>
       

        {loading && (
          <div className="p-6 text-center text-gray-500">
            Loading articles...
          </div>
        )}

        {error && <div className="p-6 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto p-4 ">
            <table className="min-w-full text-sm text-left ">
              <thead className="bg-offwhite text-cardfooter uppercase ">
                <tr>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Provider</th>
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Read</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Featured</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {articles.map((article) => (
                  <tr key={article._id} className="hover:bg-offwhite border-0 ">
                    <td className="px-6 py-3">
                      {article.featuredImage ? (
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-14 h-14 rounded object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-3 font-medium text-gray-800">
  {article.title.length > 20
    ? article.title.substring(0, 20) + "..."
    : article.title}
</td>

                    <td className="px-6 py-3 text-table-text">
                      {article.providerId?.fullName || "—"}
                    </td>
                     <td className="px-6 py-3 text-table-text">
                      {article.position|| "—"}
                    </td>


                    <td className="px-6 py-3 text-table-text">
                      {article.categoryId?.name || "—"}
                    </td>

                    <td className="px-6 py-3 text-table-text">
                      {article.readTime || 0} min
                    </td>

                    <td className="px-6 py-3 text-table-text">
                      {dateFormatUtils(article.createdAt)}
                    </td>

                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={article.featured || false}
                        onChange={() => handleToggleFeatured(article._id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td>
                      <PermissionGuard module={MODULES.ARTICLES} action={ACTIONS.UPDATE}>
                      <button
  onClick={() => navigate(`/add-article/${article._id}`)}
  className="text-white bg-darkgreen px-3 py-1 rounded-lg mr-2 hover:bg-yellow transition"
>
Edit
</button>
</PermissionGuard>
<PermissionGuard module={MODULES.ARTICLES} action={ACTIONS.DELETE}>
<button
  onClick={() => {
    setDeleteId(article._id);
    setShowDeleteModal(true);
  }}
  className="text-white bg-red-500 px-3 py-1 rounded-lg hover:bg-red-600"
>
Delete
</button>
</PermissionGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {articles.length === 0 && (
              <p className="p-6 text-center text-gray-500">
                No articles found.
              </p>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 p-6 border-t">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className={`px-4 py-2 rounded-lg text-sm ${
                page === 1
                  ? "bg-gray-200 text-gray-400"
                  : "bg-white border hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            <span className="text-sm">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`px-4 py-2 rounded-lg text-sm ${
                page === totalPages
                  ? "bg-gray-200 text-gray-400"
                  : "bg-white border hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Delete Article
      </h2>

      <p className="text-gray-600 mb-6">
        Are you sure you want to delete this article?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
  
)}
<div className="flex justify-end items-center gap-3 p-4">
  <button
    disabled={page === 1}
    onClick={() => setPage((p) => p - 1)}
    className={`h-10 w-20 rounded-xl text-white ${
      page === 1
        ? "bg-gray-300 cursor-not-allowed"
        : "bg-darkgreen hover:bg-green-700"
    }`}
  >
    Prev
  </button>

  <span className="text-sm font-medium">
    {page} of {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage((p) => p + 1)}
    className={`h-10 w-20 rounded-xl text-white ${
      page === totalPages
        ? "bg-gray-300 cursor-not-allowed"
        : "bg-darkgreen hover:bg-green-700"
    }`}
  >
    Next
  </button>
</div>
    </div>
  );
};

export default ListViewArticle;
