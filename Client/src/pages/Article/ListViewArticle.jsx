import React, { useEffect, useState } from "react";
import dateFormatUtils from "../../utils/dateFormatUtils";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";


const ListViewArticle = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API}/api/article/all?page=${page}&limit=10`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await res.json();

        setArticles(data.articles || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page]);

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
          <h1 className="text-2xl font-bold text-gray-800">
            Articles List
          </h1>
        </div>

        {loading && (
          <div className="p-6 text-center text-gray-500">
            Loading articles...
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-red-500">{error}</div>
        )}

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

                    <td className="px-6 py-3">
                      {article.readTime || 0} min
                    </td>

                    <td className="px-6 py-3 text-gray-500">
                      {dateFormatUtils(article.createdAt)}
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
    </div>
  );
};

export default ListViewArticle;
