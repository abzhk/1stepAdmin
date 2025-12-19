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

  if (parentError || !parent) {
    return (
      <div className="p-10 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block">
          {parentError || "No parent data found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 -mt-16 -mr-16"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{parent.parentDetails?.fullName}</h2>
                
              </div>
              <p className="text-gray-500 text-sm">
                Managing account for <span className="font-semibold text-gray-800">{parent.parentDetails?.childName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-primary bg-lighthov px-4 py-2 rounded-2xl">
              <FiCalendar /> Member since {parent.createdAt ? dateFormatUtils(parent.createdAt) : "-"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left side*/}
          <div className="lg:col-span-5">
            <div className="h-full bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <FiBookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm">Course Progress</h3>
              <div className="flex items-baseline gap-2 mt-2 mb-8">
                <span className="text-6xl font-black text-gray-900">{stats?.avgCourseProgress ?? 0}%</span>
                <span className="text-lg text-gray-400">average</span>
              </div>
              
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, stats?.avgCourseProgress ?? 0)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-600 px-1">
                  <span>{stats?.completedCourses ?? 0} Completed</span>
                  <span>{stats?.totalCourses ?? 0} Total Courses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:translate-y-[-4px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <FiCalendar className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalBookings ?? 0}</p>
              <h3 className="text-xs text-gray-500 font-bold uppercase">Total Bookings</h3>
            </div>


            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:translate-y-[-4px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <FiAward className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalAssessmentsAttempted ?? 0}</p>
              <h3 className="text-xs text-gray-500 font-bold uppercase">Assessments Taken</h3>
            </div>


            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:translate-y-[-4px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <FiHeart className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.likedResources ?? 0}</p>
              <h3 className="text-xs text-gray-500 font-bold uppercase">Resources Liked</h3>
            </div>


            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:translate-y-[-4px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <FiActivity className="w-5 h-5" />
              </div>
              <p className="text-lg font-bold text-gray-900 truncate">
                {parent?.updatedAt ? dateFormatUtils(parent.updatedAt) : "N/A"}
              </p>
              <h3 className="text-xs text-gray-500 font-bold uppercase">Last Activity</h3>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentStatsCards;