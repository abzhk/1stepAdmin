import React, { useEffect, useState } from "react";
import dateFormatUtils from "../../utils/dateFormatUtils";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";

const ListViewArticle = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchArticles = async () => {
  try {
    setLoading(true);
    setError("");

    const data = await api(`/api/article/all?page=${page}&limit=10`);

    setArticles(data.articles || []);
    setTotalPages(data.totalPages || 1);
  } catch (err) {
    console.error(err);
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchArticles();
}, [page]);

  const handleToggleFeatured = async (id) => {
    try {
      const data = await api(`/api/article/featured/${id}`, {
        method: "PUT",
      });

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
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Articles List</h1>
        </div>

        {loading && (
          <div className="p-6 text-center text-gray-500">
            Loading articles...
          </div>
        )}

        {error && <div className="p-6 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Provider</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Read</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Featured</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {articles.map((article) => (
                  <tr key={article._id} className="hover:bg-gray-50">
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

                    <td className="px-6 py-3 font-medium text-gray-800 max-w-xs truncate">
                      {article.title}
                    </td>

                    <td className="px-6 py-3">
                      {article.providerId?.fullName || "—"}
                    </td>

                    <td className="px-6 py-3">
                      {article.categoryId?.name || "—"}
                    </td>

                    <td className="px-6 py-3">{article.readTime || 0} min</td>

                    <td className="px-6 py-3 text-gray-500">
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
                      <button
  onClick={() => navigate(`/add-article/${article._id}`)}
  className="text-white bg-blue-500 px-2 py-1 rounded mr-2 hover:bg-blue-600"
>
Edit
</button>

<button
  onClick={() => {
    setDeleteId(article._id);
    setShowDeleteModal(true);
  }}
  className="text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600"
>
Delete
</button>
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
    </div>
  );
};

export default ListViewArticle;
