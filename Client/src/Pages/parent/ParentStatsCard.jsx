import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiBookOpen,
  FiAward,
  FiHeart,
  FiCheckCircle,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";
import { useParams } from "react-router-dom";

const ParentStatsCards = () => {
  const { userId } = useParams();

  const [parent, setParent] = useState(null);
  const [parentLoading, setParentLoading] = useState(false);
  const [parentError, setParentError] = useState("");

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchParent = async () => {
      try {
        setParentLoading(true);
        setParentError("");

        const res = await fetch(
          `http://localhost:3001/api/parent/getparent/${userId}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch parent");

        setParent(data.parent || data);
      } catch (err) {
        setParentError(err.message || "Something went wrong");
      } finally {
        setParentLoading(false);
      }
    };

    fetchParent();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const res = await fetch(
          `http://localhost:3001/api/parent/parent/${userId}/stats`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch stats");

        setStats(data.data || null);
      } catch (err) {
        setStatsError(err.message || "Something went wrong while loading stats");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return (
    <div className="min-h-screen bg-secondary p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {parentLoading && (
          <p className="text-gray-500 text-sm">Loading parent data...</p>
        )}

        {parentError && (
          <div className="bg-red-50 text-red-700 border border-red-300 px-3 py-2 rounded-lg text-sm">
            {parentError}
          </div>
        )}

        {!parent && !parentLoading && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 px-3 py-2 rounded-lg text-sm">
            No parent data found.
          </div>
        )}

        {parent && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full blur-3xl opacity-50"></div>

            <div className="flex items-center gap-5 z-10">
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-icon flex items-center justify-center text-white shadow-lg">
                  <FiUser className="w-8 h-8 md:w-9 md:h-9" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full">
                  {parent.questionnaireSubmitted ? (
                    <div className="w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <FiCheckCircle className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div
                      className="w-5 h-5 bg-amber-400 rounded-full border-2 border-white"
                      title="Questionnaire Pending"
                    ></div>
                  )}
                </div>
              </div>

              <div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                  Parent Account
                </span>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {parent.parentDetails?.fullName}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Managing Account for{" "}
                  <span className="font-semibold text-gray-800">
                    {parent.parentDetails?.childName}
                  </span>{" "}
                  • Member since{" "}
                  {parent.createdAt
                    ? new Date(parent.createdAt).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        )}


        {statsLoading && (
          <p className="text-gray-500 text-xs">Loading stats...</p>
        )}

        {statsError && (
          <div className="text-red-700 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            Stats failed: {statsError}
          </div>
        )}

        {parent && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md duration-200">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiBookOpen className="w-6 h-6" />
              </div>

              <h3 className="text-xs text-gray-500 font-bold uppercase mt-4 tracking-wide">
                Course Progress
              </h3>

              <p className="text-3xl font-bold text-gray-900">
                {stats?.avgCourseProgress ?? 0}%
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {stats?.completedCourses ?? 0} of {stats?.totalCourses ?? 0}{" "}
                completed
              </p>

              <div className="mt-3">
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>Completion</span>
                  <span>{stats?.avgCourseProgress ?? 0}%</span>
                </div>

                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        stats?.avgCourseProgress ?? 0
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md duration-200">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <FiAward className="w-6 h-6" />
              </div>

              <h3 className="text-xs text-gray-500 font-bold uppercase mt-4 tracking-wide">
                Assessments Taken
              </h3>

              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalAssessmentsAttempted ?? 0}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md duration-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiCalendar className="w-6 h-6" />
              </div>

              <h3 className="text-xs text-gray-500 font-bold uppercase mt-4 tracking-wide">
                Total Bookings
              </h3>

              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalBookings ?? 0}
              </p>

              <p className="text-sm text-gray-500 mt-1">Sessions &amp; Meetings</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md duration-200">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <FiHeart className="w-6 h-6" />
              </div>

              <h3 className="text-xs text-gray-500 font-bold uppercase mt-4 tracking-wide">
                Resources Liked
              </h3>

              <p className="text-3xl font-bold text-gray-900">
                {stats?.likedResources ?? 0}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md duration-200">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiActivity className="w-6 h-6" />
              </div>

              <h3 className="text-xs text-gray-500 font-bold uppercase mt-4 tracking-wide">
                Last Activity
              </h3>

              <p className="text-3xl font-bold text-gray-900">Recent</p>

              <p className="text-sm text-gray-500 mt-1">
                {parent.updatedAt
                  ? new Date(parent.updatedAt).toLocaleString()
                  : "No recent activity"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentStatsCards;
