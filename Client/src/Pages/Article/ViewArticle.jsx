import React, { useEffect, useState } from "react";
import RejectArticle from "./RejectArticle";
import dateFormatUtils from "../../utils/dateFormatUtils";

const ViewArticle = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);

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
        const token = localStorage.getItem("adminToken");
       

        const res = await fetch(
  `http://localhost:3001/api/article/pendingarticle?${params.toString()}`,
  {
    method: "GET",
    credentials:"include",
    headers: {
      "Content-Type": "application/json",
    },
  }
);
        if (!res.ok) {
          throw new Error("Failed to load articles");
        }

        const data = await res.json();
        console.log("pending articles response:", data);

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
  }, [page, search]);

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading articles...</p>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  const handleApprove = async (articleId) => {
  try {

    const res = await fetch(
      `http://localhost:3001/api/article/admin/${articleId}/approve`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error("Approve error:", data);
      alert(data.message || "Failed to approve article");
      return;
    }


    setArticles((prev) => prev.filter((a) => a._id !== articleId));

    console.log("Article approved:", data.article);
  } catch (err) {
    console.error("Error approving article:", err);
    alert("Something went wrong while approving.");
  }
};

const handleReject = async (reason) => {
  try {

    const res = await fetch(
      `http://localhost:3001/api/article/admin/${selectedArticleId}/reject`,
      {
        method: "PUT",
         credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({ reason }),
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || "Failed to reject article");
      return;
    }


    setArticles((prev) => prev.filter((a) => a._id !== selectedArticleId));

    console.log("Article rejected:", data.article);

    setShowRejectModal(false);
    setSelectedArticleId(null);

  } catch (err) {
    console.error("Error rejecting article:", err);
    alert("Something went wrong.");
  }
};



  return (
    <div className="min-h-screen bg-secondary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Latest Articles
            </h1>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by title or provider..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => {
            const categoryName = article.categoryId?.name;
            const providerName =
              article.providerName 

            return (
              <div
                key={article._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >

                <div className="h-48 bg-gray-200 overflow-hidden">
                  {article.featuredImage ? (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                </div>


                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {categoryName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {article.readTime} min read
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {article.title}
                  </h3>

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {providerName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {dateFormatUtils(article.createdAt)}
                        </div>
                        {/* <div className="text-xs text-gray-500">
                          {article.views || 0} views
                        </div> */}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-button text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                        onClick={() => handleApprove(article._id)}>
                        Approve
                      </button>
                      <button className="flex-1 bg-primary text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                        onClick={() => {
                  setSelectedArticleId(article._id);
              setShowRejectModal(true);
               }}
               >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {articles.length === 0 && !loading && !error && (
            <p className="text-gray-500">No pending articles found.</p>
          )}
        </div>


        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                page === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page{" "}
              <span className="font-semibold">
                {page} / {totalPages}
              </span>
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                page === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
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

    </div>
  );
};

export default ViewArticle;
