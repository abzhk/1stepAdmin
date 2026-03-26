import React, { useEffect, useState } from "react";
import RejectArticle from "./RejectArticle";
import dateFormatUtils from "../../utils/dateFormatUtils";
import { useNavigate } from "react-router-dom";
import { GrView } from "react-icons/gr";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";

const ViewArticle = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page,
          limit: 20,
        });
        if (search) params.append("search", search);

        const data = await api(
          `/api/article/pendingarticle?${params.toString()}`
        );

        setArticles(data.articles || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page, search]);

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <p className="text-gray-600 text-lg">Loading articles...</p>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  const handleApprove = async (articleId) => {
    try {
      const data = await api(`/api/article/admin/${articleId}/approve`, {
        method: "PUT",
      });

      if (!data.success) return;

      toast.success("Article approved successfully");
      setArticles((prev) => prev.filter((a) => a._id !== articleId));
    } catch (err) {
      toast.error(err.message || "Something went wrong while approving.");
    }
  };

  const handleReject = async (reason) => {
    try {
      const data = await api(
        `/api/article/admin/${selectedArticleId}/reject`,
        {
          method: "PUT",
          body: JSON.stringify({ reason }),
        }
      );

      if (!data.success) return;

      toast.success("Article rejected successfully");
      setArticles((prev) =>
        prev.filter((a) => a._id !== selectedArticleId)
      );

      setShowRejectModal(false);
      setSelectedArticleId(null);
    } catch (err) {
      toast.error(err.message || "Something went wrong while rejecting.");
    }
  };

  return (
    <div className="min-h-screen bg-secondary py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={() => navigate("/add-article")}
          className="px-4 py-2 bg-darkgreen text-white rounded-lg"
        >
          Add Article
        </button>

        <button
          onClick={() => navigate("/list-view-article")}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-peach text-darkgreen"
        >
          <GrView className="text-darkgreen" /> List View
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Latest Articles
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => {
            const categoryName = article.categoryId?.name;
            const providerName = article.providerName;

            return (
              <div
                key={article._id}
                className="bg-white rounded-lg shadow-md overflow-hidden relative"
              >
                <button
                  onClick={() => {
                    setSelectedArticle(article);
                    setShowViewModal(true);
                  }}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
                >
                  <GrView className="text-gray-700 text-lg" />
                </button>


                <div className="h-48 bg-gray-200 overflow-hidden">
                  {article.featuredImage ? (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {categoryName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {article.readTime} min
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-3 line-clamp-2">
                    {article.title}
                  </h3>

                  <div className="mt-auto pt-4 border-t">
                    <div className="flex justify-between mb-3 text-sm">
                      <span>{providerName}</span>
                      <span>
                        {dateFormatUtils(article.createdAt)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(article._id)}
                        className="flex-1 bg-button text-white py-2 rounded"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => {
                          setSelectedArticleId(article._id);
                          setShowRejectModal(true);
                        }}
                        className="flex-1 bg-primary text-white py-2 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded"
            >
              Previous
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>


      <RejectArticle
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={(reason) => handleReject(reason)}
      />

      {showViewModal && selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
          <div className="bg-white max-w-2xl w-full p-6 rounded-xl max-h-[80vh] overflow-y-auto">

            <h2 className="text-2xl font-bold mb-4">
              {selectedArticle.title}
            </h2>

            {selectedArticle.featuredImage && (
              <img
                src={selectedArticle.featuredImage}
                alt=""
                className="w-full h-60 object-cover rounded mb-4"
              />
            )}

            <p className="text-gray-700 whitespace-pre-line">
              {selectedArticle.content}
            </p>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ViewArticle;