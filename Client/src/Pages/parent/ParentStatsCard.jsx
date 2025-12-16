import React, { useEffect, useState } from "react";
import {FiBookOpen,FiAward,FiHeart,FiActivity,FiCalendar,} from "react-icons/fi";
import { useParams } from "react-router-dom";
import dateFormatUtils from "../../utils/dateFormatUtils";

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
          `http://localhost:3001/api/parent/getparent/${userId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
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
          `http://localhost:3001/api/parent/parent/${userId}/stats`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch stats");

        setStats(data.data || null);
      } catch (err) {
        setStatsError(
          err.message || "Something went wrong while loading stats"
        );
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (parentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-10">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
          <p className="text-gray-400 text-sm">Loading parent profile...</p>
        </div>
      </div>
    );
  }

  if (parentError) {
    return (
      <div className="p-10">
        <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg max-w-2xl mx-auto">
          {parentError}
        </div>
      </div>
    );
  }

  if (!parent && !parentLoading) {
    return (
      <div className="p-10">
        <div className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-3 rounded-lg max-w-2xl mx-auto">
          No parent data found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary  md:p-8 font-sans text-gray-800">
      <div className="mx-auto">
        

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          
          <div className="col-span-1 md:col-span-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden group">

              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 -mt-16 -mr-16 transition-transform group-hover:scale-110 duration-700"></div>

              <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">


                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                      {parent.parentDetails?.fullName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                      Parent
                    </span>
                  </div>
                  
                  <div className="text-gray-500 text-sm md:text-base space-y-1">
                    <p>
                      Managing account for <span className="font-semibold text-gray-800">{parent.parentDetails?.childName}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                       <FiCalendar className="w-3.5 h-3.5" />
                       <span>Member since {parent.createdAt ? new Date(parent.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {statsError && (
             <div className="col-span-1 md:col-span-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
               Warning: {statsError}
             </div>
          )}

          <div className="col-span-1 md:col-span-3">
            <div className="h-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FiBookOpen className="w-6 h-6" />
                    </div>
                    {statsLoading && <div className="h-2 w-2 bg-blue-400 rounded-full animate-ping"></div>}
                </div>
                <h3 className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Course Progress</h3>
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold text-gray-900">{stats?.avgCourseProgress ?? 0}%</span>
                    <span className="text-sm text-gray-400 font-medium">average</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                  <span>{stats?.completedCourses ?? 0} Completed</span>
                  <span>{stats?.totalCourses ?? 0} Total</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, stats?.avgCourseProgress ?? 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-3">
            <div className="h-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
               <div>
                <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <FiCalendar className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Total Bookings</h3>
                    <div className="mt-2">
                        <span className="text-4xl font-bold text-gray-900">{stats?.totalBookings ?? 0}</span>
                    </div>
               </div>
               <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-sm text-gray-500">Includes all confirmed sessions and meetings scheduled via the platform.</p>
               </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="h-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                    <FiAward className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalAssessmentsAttempted ?? 0}</p>
                <h3 className="text-xs text-gray-500 font-bold uppercase mt-1">Assessments Taken</h3>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="h-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                    <FiHeart className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.likedResources ?? 0}</p>
                <h3 className="text-xs text-gray-500 font-bold uppercase mt-1">Resources Liked</h3>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="h-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <FiActivity className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 truncate">
                        {parent?.updatedAt ? dateFormatUtils(parent.updatedAt) : "N/A"}
                    </p>
                </div>
                <h3 className="text-xs text-gray-400 font-bold uppercase mt-3 pt-3 border-t border-gray-50">Last Update</h3>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParentStatsCards;