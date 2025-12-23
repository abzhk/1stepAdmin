import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardNavbar from "./DashboardNavbar";
import DashSidebar from "./DashSidebar";

const Layout = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden w-screen p-1">
        <DashSidebar />

        <div className="flex-1 overflow-auto bg-background p-6">
          <DashboardNavbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <Outlet context={{ searchTerm }} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
