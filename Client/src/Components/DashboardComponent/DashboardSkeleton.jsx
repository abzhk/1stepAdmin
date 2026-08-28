import React from "react";

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen p-4 bg-offwhite animate-pulse">
      
      {/* Count Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white p-7 rounded-[2rem] border border-gray-200 h-44"
          >
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
              </div>

              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            </div>

            <div className="mt-8 space-y-2">
              <div className="h-8 w-20 bg-gray-200 rounded" />
              <div className="h-3 w-28 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Help Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Statistics */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-4xl p-6 h-[380px]">
            <div className="h-5 w-40 bg-gray-200 rounded mb-8" />

            <div className="h-[280px] bg-gray-100 rounded-2xl" />
          </div>
        </div>

        {/* Help Desk */}
        <div>
          <div className="bg-white rounded-3xl p-6 h-[380px]">
            <div className="flex justify-between mb-6">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-6 w-8 bg-gray-200 rounded-full" />
            </div>

            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-full" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions + System Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {/* Quick Actions */}
        <div className="bg-white rounded-4xl border border-gray-200 p-5 h-[370px]">
          <div className="h-5 w-32 bg-gray-200 rounded mb-6" />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-28 bg-gray-100 rounded-2xl"
              />
            ))}
          </div>
        </div>

        {/* System Alert */}
        <div className="bg-white rounded-4xl border border-gray-200 p-6 h-[370px]">
          <div className="h-5 w-32 bg-gray-200 rounded mb-8" />

          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 bg-gray-100 rounded-xl"
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardSkeleton;