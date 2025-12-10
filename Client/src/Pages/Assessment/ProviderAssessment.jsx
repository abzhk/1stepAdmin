import React, { useEffect, useState } from "react";

function ProviderAssessment() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError("");


      const res = await fetch(
        "http://localhost:3001/api/assessment/admin/allassessments",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch assessments");
      }

      setAssessments(data.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Provider Assessments
          </h1>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && assessments.length === 0 && (
        <div className="mt-10 text-center text-gray-500 text-sm">
          No assessments found.
        </div>
      )}

      {!loading && !error && assessments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((item) => {
            const statusColor =
              item.status === "published"
                ? "bg-green-100 text-green-800"
                : item.status === "archived"
                ? "bg-gray-100 text-gray-700"
                : "bg-yellow-100 text-yellow-800";

            return (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col"
              >
                <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {item.category?.icon && (
                        <span className="text-xl mr-1">
                          {item.category.icon}
                        </span>
                      )}
                      <h2 className="text-lg font-semibold text-gray-800">
                        {item.title}
                      </h2>
                    </div>
                    <p className="text-xs mt-1 text-gray-500">
                      Category:{" "}
                      <span className="font-medium">
                        {item.category?.name || "N/A"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Provider:{" "}
                      <span className="font-medium">
                        {item.provider?.fullName || "N/A"}
                      </span>
                    </p>
                  </div>
                  {/* <span
                    className={
                      "px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap " +
                      statusColor
                    }
                  >
                    {item.status || "draft"}
                  </span> */}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {item.description}
                  </p>

                  <div className="mt-auto space-y-1 text-xs text-gray-500">
                    <p>
                      Questions:{" "}
                      <span className="font-semibold">
                        {item.questions?.length || 0}
                      </span>
                    </p>
                    <p>
                      Duration:{" "}
                      <span className="font-semibold">
                        {item.duration || 0} mins
                      </span>
                    </p>
                    <p>
                      Max Score:{" "}
                      <span className="font-semibold">
                        {item.maxScore || 0}
                      </span>
                    </p>
                    <p>
                      Created:{" "}
                      <span className="font-semibold">{item.createdAt}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* <button className="text-xs text-white px-3 py-1.5 rounded-lg bg-[#fbbf24]  hover:bg-yellow-100 font-medium">
                    Edit
                  </button> */}

                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-100 font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProviderAssessment;
