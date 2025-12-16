import React, { useEffect, useMemo, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { AiFillEye } from "react-icons/ai";
import "react-circular-progressbar/dist/styles.css";
import { useParams } from "react-router-dom";

const MONTHS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

function ProviderStats() {
  const { id } = useParams();

  const [stats, setStats] = useState();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [useMonthlyStats, setUseMonthlyStats] = useState(false);

  // bookings pagination constants
  const limit = 8;
  const startIndex = 0;

  // Articles pagination state
  const [articlePage, setArticlePage] = useState(1);
  const articleLimit = 10;
  const articleStartIndex = (articlePage - 1) * articleLimit;

  const [articles, setArticles] = useState([]);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState("");

  // Assessments pagination state
  const [assessmentPage, setAssessmentPage] = useState(1);
  const assessmentLimit = 10;
  const assessmentStartIndex = (assessmentPage - 1) * assessmentLimit;

  const [assessments, setAssessments] = useState([]);
  const [assessmentsTotal, setAssessmentsTotal] = useState(0);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [assessmentsError, setAssessmentsError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          month: String(month),
          year: String(year),
          limit: String(limit),
          startIndex: String(startIndex),
        });

        const res = await fetch(
          `http://localhost:3001/api/provider/getallbooking/${id}?${params.toString()}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load stats");
        }

        setStats(data.stats || null);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [id, month, year]);

  useEffect(() => {
    if (!id) return;

    const fetchBookings = async () => {
      try {
        setTableLoading(true);
        setTableError("");

        const params = new URLSearchParams({
          limit: String(limit),
          startIndex: String(startIndex),
        });
        const res = await fetch(
          `http://localhost:3001/api/booking/getbookingbyprovider/${id}?${params.toString()}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load bookings");
        }

        setBookings(data.bookingDetails || []);
      } catch (err) {
        setTableError(err.message || "Something went wrong");
      } finally {
        setTableLoading(false);
      }
    };
    fetchBookings();
  }, [id, limit, startIndex]);

  useEffect(() => {
    if (!id) return;

    const fetchArticles = async () => {
      try {
        setArticlesLoading(true);
        setArticlesError("");

        const params = new URLSearchParams({
          limit: articleLimit,
          startIndex: articleStartIndex,
        });

        const res = await fetch(
          `http://localhost:3001/api/article/providerarticle/${id}?${params.toString()}`
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load articles");

        const list = data.articles || data.data || [];
        setArticles(list);
        setArticlesTotal(data.total || data.count || list.length || 0);
      } catch (err) {
        setArticlesError(err.message || "Something went wrong");
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchArticles();
  }, [id, articlePage]);

  useEffect(() => {
    if (!id) return;

    const fetchAssessments = async () => {
      try {
        setAssessmentsLoading(true);
        setAssessmentsError("");

        const params = new URLSearchParams({
          limit: String(assessmentLimit),
          startIndex: String(assessmentStartIndex),
        });

        const res = await fetch(
          `http://localhost:3001/api/assessment/getassessment/${id}?${params.toString()}`
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load assessments");

        const list = Array.isArray(data.data) ? data.data : data.assessments || [];
        setAssessments(list);
        setAssessmentsTotal(data.count || list.length || 0);
      } catch (err) {
        setAssessmentsError(err.message || "Something went wrong");
      } finally {
        setAssessmentsLoading(false);
      }
    };

    fetchAssessments();
  }, [id, assessmentPage]); 

  const allTime = stats?.allTime || {
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    expired: 0,
  };

  const monthly = stats?.monthly || {
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    expired: 0,
  };

  const displayStats = useMonthlyStats ? monthly : allTime;

  const percentage = useMemo(() => {
    if (!allTime.total) return 0;
    return Math.round((allTime.approved / allTime.total) * 100);
  }, [allTime]);

  const currentMonthLabel =
    MONTHS.find((m) => m.value === month)?.label || "Month";

  const articleTotalPages = Math.ceil(articlesTotal / articleLimit) || 1;
  const assessmentTotalPages = Math.ceil(assessmentsTotal / assessmentLimit) || 1;

  return (
    <div className="p-6 bg-secondary min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1 text-primary">WELCOME BACK</h1>
          <p className="text-sm text-gray-700">
            Showing stats for{" "}
            <span className="font-semibold">
              {currentMonthLabel} {year}
            </span>{" "}
            ({useMonthlyStats ? "Monthly view" : "All time view "})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={month}
            onChange={(e) => {
              setMonth(Number(e.target.value));
              setUseMonthlyStats(true);
            }}
            className="border border-gray-300 rounded-lg px-3 py-1 bg-white text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!Number.isNaN(val)) {
                setYear(val);
                setUseMonthlyStats(true);
              }
            }}
            className="w-20 border border-gray-300 rounded-lg px-2 py-1 bg-white text-sm"
          />

          {useMonthlyStats && (
            <button
              onClick={() => setUseMonthlyStats(false)}
              className="px-3 py-1 bg-[#2d4a36] text-white rounded-lg text-sm hover:bg-green-900 transition"
            >
              View All-Time Stats
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 border border-red-300 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {loading && !stats && (
        <p className="mb-4 text-gray-600 font-medium">Loading stats...</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white h-64 p-8 rounded-2xl text-white flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <p className="text-maintext font-bold">Appointments</p>
            <span className="text-sm text-white font-semibold">
              All time: {allTime.total}
            </span>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-40">
              <CircularProgressbar
                value={percentage}
                text={`${percentage}%`}
                strokeWidth={10}
                styles={buildStyles({
                  textColor: "#1F2F30",
                  pathColor: "#2F5D60",
                  trailColor: "#E6EFE9",
                })}
              />
            </div>
          </div>

          <p className="text-xs text-maintext text-center mt-4">
            {allTime.approved} approved out of {allTime.total} bookings
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl text-white">
            <p className="text-maintext font-bold">Booking</p>
            <h2 className="text-2xl font-bold text-secondarytext">
              {displayStats.total}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-2xl text-white">
            <p className="text-maintext font-bold">Queue</p>
            <h2 className="text-2xl font-bold text-secondarytext">
              {displayStats.pending}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-2xl text-white">
            <p className="text-maintext font-bold">Rejected</p>
            <h2 className="text-2xl font-bold text-secondarytext">
              {displayStats.rejected}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-2xl text-white">
            <p className="text-maintext font-bold">Approved</p>
            <h2 className="text-2xl font-bold text-secondarytext">
              {displayStats.approved}
            </h2>
          </div>
        </div>
      </div>

      <div className="mb-8 mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          Recent Appointments
        </h2>

        {tableError && (
          <div className="mb-4 text-red-700 bg-red-100 border border-red-300 px-4 py-3 rounded-lg text-sm">
            {tableError}
          </div>
        )}

        {tableLoading && (
          <p className="text-sm text-gray-600 mb-4">Loading appointments...</p>
        )}

        <div className="overflow-x-auto rounded-xl shadow-inner bg-gray-50 border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#ddedec] border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Date / Slot
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {bookings.length === 0 && !tableLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-md text-gray-500 font-medium"
                  >
                    No recent bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((bookingdata) => (
                  <tr
                    key={bookingdata._id}
                    className="hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-3">
                      <img
                        src={
                          bookingdata.patientDetails?.profilePicture ||
                          "/default-avatar.png"
                        }
                        alt={
                          bookingdata.patientDetails?.username ||
                          bookingdata.patientName
                        }
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <span>
                        {bookingdata.patientDetails?.username ||
                          bookingdata.patientName ||
                          "Anonymous"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Array.isArray(bookingdata.service)
                        ? bookingdata.service.join(", ")
                        : bookingdata.service || "-"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {bookingdata.scheduledTime?.slot && ` ${bookingdata.scheduledTime.slot}`}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs font-semibold leading-5 rounded-full ${
                          bookingdata.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : bookingdata.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : bookingdata.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {bookingdata.status.charAt(0).toUpperCase() +
                          bookingdata.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-10 mb-3 font-bold text-black">Article</p>

      <div className="flex gap-4 items-start">
        <div
          className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar"
          style={{ style: "none" }}
        >
          <style>
            {`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
            `}
          </style>
          {articlesLoading ? (
            <div className="min-w-[300px]  h-80 bg-white rounded-xl shadow-md p-4 flex items-center justify-center">
              <span className="text-sm text-gray-600">Loading articles...</span>
            </div>
          ) : articlesError ? (
            <div className="min-w-[300px] h-80 bg-white rounded-xl shadow-md p-4 flex items-center justify-center">
              <span className="text-sm text-red-600">{articlesError}</span>
            </div>
          ) : articles.length === 0 ? (
            <div className="min-w-[300px] h-80 bg-white rounded-xl shadow-md p-4 flex items-center justify-center">
              <span className="text-sm text-gray-600">No articles found.</span>
            </div>
          ) : (
            articles.map((a) => {
              const aid = a._id || a.id;
              return (
                <div key={aid} className="min-w-[400px] h-80 bg-white rounded-xl shadow-md p-4 flex flex-col justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{a.title}</h2>

                  <p className="text-sm text-gray-600 mt-1">
                    {a.category || (a.category?.name ? a.category.name : "")}
                  </p>

                  <p className="text-gray-700 mt-3">{a.slug}</p>

                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {a.featuredImage ? (
                      <img
                        src={a.featuredImage}
                        alt={a.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 justify-end">
        <button
          onClick={() => setArticlePage((p) => Math.max(1, p - 1))}
          disabled={articlePage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>Page {articlePage} of {articleTotalPages}</span>

        <button
          onClick={() => setArticlePage((p) => Math.min(articleTotalPages, p + 1))}
          disabled={articlePage === articleTotalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* --- Assessment Section --- */}



      <p className="mt-10 mb-3 text-black font-bold">Assessment</p>

      <div className="flex gap-4 items-start">
        <div
          className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar"
          style={{ style: "none" }}
        >
          <style>
            {`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
            `}
          </style>

          {assessmentsLoading ? (
            <div className="min-w-[200px] h-80 bg-white rounded-xl shadow-md p-4 flex items-center justify-center">
              <span className="text-sm text-gray-600">Loading assessments...</span>
            </div>
          ) : assessmentsError ? (
            <div className="min-w-[200px] h-80 bg-white rounded-xl shadow-md p-4 flex items-center justify-center">
              <span className="text-sm text-red-600">{assessmentsError}</span>
            </div>
          ) : assessments.length === 0 ? (
            <div className="min-w-[200px] h-80 bg-white rounded-xl shadow-md p-4 flex items-center justify-center">
              <span className="text-sm text-gray-600">No assessments found.</span>
            </div>
          ) : (
            assessments.map((ass) => {
              const aid = ass._id || ass.id;
              const avgScore = ass.stats?.avgScore ?? "—";
              return (
                <div key={aid} className="min-w-[300px] h-80 bg-white rounded-xl shadow-md p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">{ass.title}</h2>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {ass.category?.name || "Uncategorized"} • {ass.provider?.fullName || "Provider"}
                    </p>

                      <p className="text-xs mt-1 text-gray-500">
                      Category:{" "}
                      <span className="font-medium">
                        {ass.category?.name || "N/A"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Provider:{" "}
                      <span className="font-medium">
                        {ass.provider?.fullName || "N/A"}
                      </span>
                    </p>
<div className=" w-[380px]">
                    <p className="text-gray-700 mt-3 line-clamp-3">
                      {ass.description  || "No description available."}
                    </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-600">
                        Questions: <span className="font-semibold">{(ass.questions || []).length}</span>
                      </div>

                      <div className="text-sm text-gray-600">
                        Responses: <span className="font-semibold">{ass.stats?.totalResponses ?? 0}</span>
                      </div>

                      <div className="text-sm text-gray-600">
                        Avg Score: <span className="font-semibold">{String(avgScore)}</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 justify-end">
        <button
          onClick={() => setAssessmentPage((p) => Math.max(1, p - 1))}
          disabled={assessmentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>Page {assessmentPage} of {assessmentTotalPages}</span>

        <button
          onClick={() => setAssessmentPage((p) => Math.min(assessmentTotalPages, p + 1))}
          disabled={assessmentPage === assessmentTotalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ProviderStats;
