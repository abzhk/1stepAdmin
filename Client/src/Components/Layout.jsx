import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardNavbar from "../pages/dashboard/DashboardNavbar";
import DashSidebar from "../pages/dashboard/DashSidebar";

const Layout = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (

        <div className="flex flex-col h-screen">
  <div className="flex flex-1 overflow-hidden w-screen">

    <DashSidebar />

    {/* SCROLL AREA */}
    <div className="flex-1 overflow-y-auto bg-offwhite scrollbar-hide">

      {/* STICKY NAVBAR */}
      <div className="sticky top-0 z-50 bg-offwhite px-6 pt-6 pb-3 ">
        <DashboardNavbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* CONTENT */}
      <div className="px-6 pb-6">
        <Outlet context={{ searchTerm }} />
      </div>

    </div>
  </div>
</div>
  );
};

export default Layout;
